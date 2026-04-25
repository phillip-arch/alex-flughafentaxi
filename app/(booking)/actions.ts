'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { isIP } from 'net';
import { Resend } from 'resend';
import { buildPassengerConfirmationEmailHtml } from '@/lib/booking/passengerEmail';

import { z } from 'zod';
import { calculateVehiclePrice, type VehicleType } from '@/lib/pricing';
import {
  getLeadTimeErrorMessage,
  hasSufficientLeadTime,
} from '@/lib/booking/leadTime';

// Helper to generate a readable, collision-resistant reference
// Excludes 0, O, 1, I to avoid confusion
function generateSafeReference(length = 6) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function normalizeBookingReference(reference?: string | null) {
  if (!reference) return '';
  return reference.replace(/^TEST-/i, '');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateTimeForEmail(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '-', time: '-' };
  }

  return {
    date: new Intl.DateTimeFormat('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(parsed),
    time: new Intl.DateTimeFormat('de-AT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parsed),
  };
}

const BookingSchema = z.object({
  full_name: z.string().min(2, 'Name ist zu kurz'),
  email: z.string().email('Ungültige E-Mail Adresse'),
  phone: z.string().min(6, 'Telefonnummer ist zu kurz'),
  pickup: z.string().min(2, 'Abholort ist erforderlich'),
  destination: z.string().min(2, 'Zielort ist erforderlich'),
  pickup_at: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Abholzeit muss in der Zukunft liegen',
  }),
  passengers: z.number().int().min(1).max(8),
  luggage: z.number().int().min(0).max(8),
  vehicle_type: z.enum(['Limo', 'Kombi', 'Bus']),
  notes: z.string().optional(),
  _zip: z.string().optional(),
  _extraStop: z.boolean().optional(),
  _meetAndGreet: z.boolean().optional(),
});

export async function createBooking(payload: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isProduction = process.env.NODE_ENV === 'production';
  const rateWindowMinutes = Number(process.env.BOOKING_RATE_LIMIT_WINDOW_MINUTES ?? 15);
  const ipRateLimit = Number(process.env.BOOKING_RATE_LIMIT_IP_MAX ?? (isProduction ? 10 : 1000));
  const emailRateLimit = Number(process.env.BOOKING_RATE_LIMIT_EMAIL_MAX ?? (isProduction ? 10 : 1000));

  // 1. Extract and validate payload
  const validated = BookingSchema.safeParse(payload);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Ungültige Eingabe' };
  }
  
  const { _zip, _extraStop, _meetAndGreet, ...bookingData } = validated.data;

  const pickupAtDate = new Date(bookingData.pickup_at);
  if (!hasSufficientLeadTime(pickupAtDate)) {
    return { error: getLeadTimeErrorMessage(pickupAtDate) };
  }

  // 2. Rate Limiting (Spam Protection)
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : headersList.get('x-real-ip');
  let ip = rawIp && isIP(rawIp) ? rawIp : 'unknown';

  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  const rateWindowAgo = new Date(Date.now() - rateWindowMinutes * 60 * 1000).toISOString();

  // IP Rate Limit Check
  if (ip !== 'unknown') {
    const { count: ipCount, error: ipError } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', rateWindowAgo);

    if (ipError) {
      console.error('IP rate limit check error:', ipError);
      return { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' };
    }

    if (ipCount && ipCount >= ipRateLimit) {
      return {
        error: `Zu viele Anfragen von diesem Gerät. Bitte warten Sie ${rateWindowMinutes} Minuten.`,
      };
    }
  }

  // Email Rate Limit Check
  const { count: emailCount, error: emailError } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('email', bookingData.email)
    .gte('created_at', rateWindowAgo);

  if (emailError) {
    console.error('Email rate limit check error:', emailError);
    return { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' };
  }

  if (emailCount && emailCount >= emailRateLimit) {
    return {
      error: `Zu viele Buchungsanfragen für diese E-Mail. Bitte warten Sie ${rateWindowMinutes} Minuten.`,
    };
  }

  // 3. Server-Side Price Calculation & ZIP Validation
  let basePrice = 38; // default base price
  let dbPrices = undefined;

  const normalizedZip = typeof _zip === 'string' ? _zip.trim() : '';

  if (normalizedZip !== '') {
    if (!/^\d{1,4}$/.test(normalizedZip)) {
      return { error: 'Bitte geben Sie eine gueltige Postleitzahl mit maximal 4 Ziffern ein.' };
    }

    const { data: zipData, error: zipLookupError } = await supabaseAdmin
      .from('zip_prices')
      .select('*')
      .eq('zip', normalizedZip)
      .maybeSingle();

    if (zipLookupError) {
      console.error('ZIP lookup error:', zipLookupError);
      return { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es spaeter erneut.' };
    }

    if (zipData) {
      basePrice = zipData.base_price;
      dbPrices = {
        limo: zipData.limo_price,
        kombi: zipData.kombi_price,
        bus: zipData.bus_price
      };
    }
  }

  const vehiclePrice = calculateVehiclePrice(basePrice, bookingData.vehicle_type as VehicleType, dbPrices);
  const extraStopPrice = _extraStop ? 10 : 0;
  const meetAndGreetPrice = _meetAndGreet && /flughafen/i.test(bookingData.pickup) ? 6 : 0;
  const finalPrice = vehiclePrice + extraStopPrice + meetAndGreetPrice;

  // Generate unique tokens and references
  const confirm_token = crypto.randomUUID();
  
  let booking_reference = '';
  let data, error;
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    booking_reference = generateSafeReference(6);

    // Insert booking with service role after server-side validation and rate limiting.
    // This allows guest bookings while still setting user_id for authenticated users.
    const result = await supabaseAdmin
      .from('bookings')
      .insert({
        ...bookingData,
        price: finalPrice, // Server-calculated price
        status: 'pending', // Server-enforced status
        ip_address: ip, // Store IP for rate limiting
        user_id: user?.id || null,
        confirm_token,
        booking_reference
      })
      .select('id, email, full_name, booking_reference')
      .single();

    if (result.error) {
      // Check if it's a unique constraint violation on booking_reference
      // Supabase/PostgREST usually returns code 23505 for unique violations
      if (result.error.code === '23505' && (result.error.message.includes('booking_reference') || result.error.message.includes('bookings_booking_reference_key'))) {
        retries++;
        continue;
      }
      error = result.error;
      break;
    } else {
      data = result.data;
      break;
    }
  }

  if (!data || error) {
    console.error('Booking insertion error:', error);
    return { error: error?.message || 'Fehler beim Erstellen der Buchung.' };
  }

  // Send passenger confirmation email.
  // Prefer server-only APP_URL to avoid preview deployment leaks.
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const confirmLink = `${appUrl}/book/confirm?token=${confirm_token}`;
  const pickupRaw = String(bookingData.pickup || '').toLowerCase();
  const destinationRaw = String(bookingData.destination || '').toLowerCase();
  const isFromAirport = pickupRaw.includes('flughafen');
  const isToAirport = destinationRaw.includes('flughafen');
  const directionLabel = isFromAirport ? 'Vom Flughafen' : isToAirport ? 'Zum Flughafen' : 'Transfer';
  const directionIcon = isFromAirport ? '🛬' : isToAirport ? '🛫' : '✈️';

  if (!process.env.RESEND_API_KEY) {
    // Keep existing local dev behavior if email provider is not configured.
    console.log('==================================================');
    console.log('[MOCK EMAIL] RESEND_API_KEY missing. Confirmation email not sent.');
    console.log(`[TO]: ${data.email}`);
    console.log(
      `[SUBJECT]: Ihre Buchungsbestaetigung (${directionLabel}) ${normalizeBookingReference(data.booking_reference)}`,
    );
    console.log(confirmLink);
    console.log('==================================================');
  } else {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const configuredFrom = process.env.RESEND_FROM_EMAIL;
    const fromCandidates = Array.from(
      new Set([configuredFrom, 'onboarding@resend.dev'].filter(Boolean) as string[])
    );
    const notesRaw = String(bookingData.notes || '');
    const notesLower = notesRaw.toLowerCase();
    const paymentInNotes = notesLower.match(/\(zahlung:\s*([^)]+)\)/i)?.[1]?.toLowerCase() || '';
    const childSeatInfo = notesRaw.match(/\(Kindersitze:\s*([^)]+)\)/i)?.[1]?.trim() || '';
    const intermediateStopInfo = notesRaw.match(/\(Zwischenstopp:\s*([^)]+)\)/i)?.[1]?.trim() || '';
    const flightNumberInfo = notesRaw.match(/\(Flugnummer:\s*([^)]+)\)/i)?.[1]?.trim() || '';
    const handLuggageInfo =
      notesRaw.match(/\(Handgep(?:Ã¤|ä|a)e?ck:\s*(\d+)\)/i)?.[1]?.trim() ||
      notesRaw.match(/\(Handgepaeck:\s*(\d+)\)/i)?.[1]?.trim() ||
      '';
    const cleanedNotes = notesRaw
      .replace(/\(zahlung:\s*[^)]*\)/gi, '')
      .replace(/\(kindersitze:\s*[^)]*\)/gi, '')
      .replace(/\(zwischenstopp:\s*[^)]*\)/gi, '')
      .replace(/\(flugnummer:\s*[^)]*\)/gi, '')
      .replace(/\(handgep(?:Ã¤|ä|a)e?ck:\s*[^)]*\)/gi, '')
      .replace(/\(handgepaeck:\s*[^)]*\)/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    const directPayment = String((bookingData as any).payment_method || '').toLowerCase();
    const paymentSource = `${directPayment} ${paymentInNotes}`.trim();
    const isCardPayment =
      paymentSource.includes('kredit') || paymentSource.includes('card') || paymentSource.includes('karte');
    const isCashPayment = paymentSource.includes('bar') || paymentSource.includes('cash');
    const isVoucherPayment = paymentSource.includes('lieferschein') || paymentSource.includes('voucher');
    const isFreePayment = paymentSource.includes('gratis') || paymentSource.includes('free');
    const paymentLabel = isCardPayment
      ? 'Kreditkarte'
      : isCashPayment
        ? 'Barzahlung'
        : isVoucherPayment
          ? 'Lieferschein'
          : isFreePayment
            ? 'Gratis'
            : '-';

    let emailError: any = null;
    for (const from of fromCandidates) {
      const { error } = await resend.emails.send({
        from,
        to: data.email,
        subject: `Ihre Buchungsbestaetigung (${directionLabel}) ${normalizeBookingReference(data.booking_reference)}`.trim(),
        html: buildPassengerConfirmationEmailHtml({
          fullName: data.full_name,
          email: bookingData.email,
          phone: bookingData.phone,
          bookingReference: normalizeBookingReference(data.booking_reference),
          pickup: bookingData.pickup,
          destination: bookingData.destination,
          pickupAt: bookingData.pickup_at,
          vehicleType: bookingData.vehicle_type,
          passengers: bookingData.passengers,
          luggage: bookingData.luggage,
          handLuggage: handLuggageInfo || '0',
          paymentLabel,
          flightNumber: flightNumberInfo || '',
          childSeatInfo: childSeatInfo || '',
          intermediateStopInfo: intermediateStopInfo || '',
          notes: cleanedNotes || '',
          price: finalPrice,
        }),
      });
      if (!error) {
        emailError = null;
        break;
      }
      emailError = error;
      console.error(`Resend send failed for from=${from}:`, error);
    }

    if (emailError) {
      console.error('Booking confirmation email failed after booking creation:', emailError);
    }
  }
  return { success: true, reference: normalizeBookingReference(data.booking_reference) };
}

export async function confirmBooking(token: string, driverId?: string) {
  // Validate UUID format to prevent DB errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!token || !uuidRegex.test(token)) {
    return { error: 'Ungültiger Bestätigungslink.' };
  }

  if (driverId && !uuidRegex.test(driverId)) {
    return { error: 'Ungültiger Bestätigungslink.' };
  }

  // Atomic update: only updates if token matches and status is still pre-confirmation
  // Bypasses RLS using supabaseAdmin
  let updateQuery = supabaseAdmin
    .from('bookings')
    .update({
      status: 'confirmed',
      confirmed_at: new Date(), // JS Date object
      // Keep token so repeat clicks can resolve to "already confirmed".
    })
    .eq('confirm_token', token)
    .in('status', ['pending', 'assigned', 'Wartet auf Bestätigung']);

  if (driverId) {
    updateQuery = updateQuery.eq('driver_id', driverId);
  }

  const { data, error } = await updateQuery
    .select('id, booking_reference')
    .single();

  if (data) {
    revalidatePath('/dispatch/dashboard');
    return { success: true, reference: normalizeBookingReference(data.booking_reference) };
  }

  // If update failed (0 rows), check why to provide better UX
  let existingQuery = supabaseAdmin
    .from('bookings')
    .select('status, booking_reference')
    .eq('confirm_token', token);

  if (driverId) {
    existingQuery = existingQuery.eq('driver_id', driverId);
  }

  const { data: existing } = await existingQuery.single();

  if (existing) {
    if (existing.status === 'confirmed') {
      return { 
        error: 'Sie haben diese Buchung bereits bestätigt.', 
        code: 'ALREADY_CONFIRMED', 
        reference: normalizeBookingReference(existing.booking_reference) 
      };
    }
    return { error: `Diese Buchung kann nicht mehr bestätigt werden (Status: ${existing.status}).` };
  }

  return { error: 'Ungültiger oder abgelaufener Bestätigungslink.' };
}



