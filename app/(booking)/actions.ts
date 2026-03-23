'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { isIP } from 'net';
import { Resend } from 'resend';

import { z } from 'zod';
import { calculateVehiclePrice, type VehicleType } from '@/lib/pricing';

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
  
  const { _zip, _extraStop, ...bookingData } = validated.data;

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
  const finalPrice = vehiclePrice + extraStopPrice;

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
    const safeName = escapeHtml(String(data.full_name || ''));
    const pickupRawValue = String(bookingData.pickup || '');
    const destinationRawValue = String(bookingData.destination || '');
    const safePickup = escapeHtml(pickupRawValue);
    const safeDestination = escapeHtml(destinationRawValue);
    const pickupMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupRawValue)}`;
    const destinationMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationRawValue)}`;
    const pickupIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(pickupRawValue);
    const destinationIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(destinationRawValue);
    const safeReference = escapeHtml(normalizeBookingReference(data.booking_reference));
    const { date: pickupDate, time: pickupTime } = formatDateTimeForEmail(String(bookingData.pickup_at));
    const safeDate = escapeHtml(pickupDate);
    const safeTime = escapeHtml(pickupTime);
    const safeEmail = escapeHtml(String(bookingData.email || ''));
    const safePhone = escapeHtml(String(bookingData.phone || ''));
    const phoneHref = String(bookingData.phone || '').replace(/[^\d+]/g, '');
    const safeVehicle = escapeHtml(String(bookingData.vehicle_type || ''));
    const safePassengers = escapeHtml(String(bookingData.passengers ?? ''));
    const safeLuggage = escapeHtml(String(bookingData.luggage ?? ''));
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
    const safeNotes = escapeHtml(cleanedNotes || '');
    const safeChildSeatInfo = escapeHtml(childSeatInfo || '-');
    const safeIntermediateStopInfo = escapeHtml(intermediateStopInfo || '-');
    const safeFlightNumberInfo = escapeHtml(flightNumberInfo || '');
    const safeHandLuggageInfo = escapeHtml(handLuggageInfo || '0');
    const hasAdditionalInfo = Boolean(childSeatInfo || intermediateStopInfo);
    const hasNotes = Boolean(cleanedNotes);
    const directPayment = String((bookingData as any).payment_method || '').toLowerCase();
    const paymentSource = `${directPayment} ${paymentInNotes}`.trim();
    const isCardPayment =
      paymentSource.includes('kredit') || paymentSource.includes('card') || paymentSource.includes('karte');
    const isCashPayment = paymentSource.includes('bar') || paymentSource.includes('cash');
    const paymentLabel = isCardPayment ? 'Kreditkarte' : isCashPayment ? 'Barzahlung' : '-';
    const paymentStyle = isCardPayment
      ? 'background:#e8f2ff;color:#0071e3;'
      : isCashPayment
        ? 'background:linear-gradient(135deg,rgba(10,99,255,0.12) 0%,rgba(36,144,255,0.18) 100%);color:#0a63ff;'
        : 'background:#f5f5f7;color:#86868b;';
    const safePayment = escapeHtml(paymentLabel);
    const safePrice = escapeHtml(
      new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(finalPrice),
    );
    const safeDirectionLabel = escapeHtml(directionLabel);

    let emailError: any = null;
    for (const from of fromCandidates) {
      const { error } = await resend.emails.send({
        from,
        to: data.email,
        subject: `Ihre Buchungsbestaetigung (${directionLabel}) ${normalizeBookingReference(data.booking_reference)}`.trim(),
        html: `
          <div style="margin:0;padding:24px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';color:#1d1d1f;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d2d2d7;border-radius:24px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 8px 28px;text-align:center;">
                  <div style="font-size:12px;letter-spacing:.08em;color:#86868b;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Alex Flughafentaxi</div>
                  <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;color:#1d1d1f;">Buchungsbestaetigung</h1>
                  <p style="margin:12px 0 0 0;font-size:16px;line-height:1.5;color:#86868b;">Hallo ${safeName}, vielen Dank fuer Ihre Buchung. Hier sind Ihre Angaben im Ueberblick.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 28px 8px 28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:12px;background:#ffffff;border:1px solid #e5e5ea;border-radius:16px;">
                    <tr>
                      <td style="padding:18px 14px 16px 18px;text-align:center;width:62%;border-right:1px solid #e5e5ea;">
                        <div style="font-size:12px;letter-spacing:.08em;color:#86868b;font-weight:700;text-transform:uppercase;margin-bottom:6px;">Gesamtpreis</div>
                        <div style="font-size:42px;line-height:1.05;color:#1d1d1f;font-weight:700;letter-spacing:-0.02em;">${safePrice} &euro;</div>
                        <span style="display:inline-block;margin-top:10px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;${paymentStyle}">${safePayment}</span>
                      </td>
                      <td style="padding:18px 14px 16px 14px;text-align:center;width:38%;">
                        <div style="font-size:30px;line-height:1;margin-bottom:8px;">${directionIcon}</div>
                        <div style="font-size:20px;line-height:1;color:#8b8b90;margin-bottom:8px;">____</div>
                        <div style="font-size:14px;color:#1d1d1f;font-weight:700;line-height:1.3;">${safeDirectionLabel}</div>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                    <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Passagierinformationen</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Name:</strong> ${safeName}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>E-Mail:</strong> ${safeEmail}</td></tr>
                    <tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Telefon:</strong> <a href="tel:${phoneHref}" style="color:#0071e3;text-decoration:none;font-weight:600;">${safePhone}</a></td></tr>
                  </table>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                    <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Fahrtinformationen</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Referenz:</strong> ${safeReference}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Abholung:</strong> ${pickupIsAirport ? safePickup : `<a href="${pickupMapsLink}" style="color:#0071e3;text-decoration:none;font-weight:600;" target="_blank" rel="noopener noreferrer">${safePickup}</a>`}</td></tr>
                    ${safeFlightNumberInfo ? `<tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Flugnummer:</strong> ${safeFlightNumberInfo}</td></tr>` : ''}
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Ziel:</strong> ${destinationIsAirport ? safeDestination : `<a href="${destinationMapsLink}" style="color:#0071e3;text-decoration:none;font-weight:600;" target="_blank" rel="noopener noreferrer">${safeDestination}</a>`}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Datum:</strong> ${safeDate}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Uhrzeit:</strong> ${safeTime}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Fahrzeug:</strong> ${safeVehicle}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Personen:</strong> ${safePassengers}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Koffer:</strong> ${safeLuggage}</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Handgepäck:</strong> ${safeHandLuggageInfo}</td></tr>
                    ${hasNotes ? `<tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Notizen:</strong> ${safeNotes}</td></tr>` : ''}
                  </table>
                  ${hasAdditionalInfo ? `
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                    <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Zusatzinformationen</td></tr>
                    <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Kindersitze:</strong> ${safeChildSeatInfo}</td></tr>
                    <tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Zwischenstopp:</strong> ${safeIntermediateStopInfo}</td></tr>
                  </table>
                  ` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 10px 28px;text-align:center;">
                  <p style="margin:0;font-size:14px;line-height:1.5;color:#86868b;">Diese E-Mail dient als Bestaetigung Ihrer Buchungsanfrage.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 28px 28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                    <tr><td style="padding:16px 18px 10px 18px;font-size:15px;line-height:1.4;color:#1d1d1f;font-weight:700;">Aenderungen &amp; Stornierungen</td></tr>
                    <tr><td style="padding:0 18px 10px 18px;font-size:14px;line-height:1.55;color:#1d1d1f;">• Fuer Fahrten bis 22:00 Uhr:<br/>Aenderungen oder Stornierungen sind bis spaetestens 3 Stunden vor Abholzeit moeglich.</td></tr>
                    <tr><td style="padding:0 18px 10px 18px;font-size:14px;line-height:1.55;color:#1d1d1f;">• Fuer Fahrten zwischen 22:00 und 07:00 Uhr:<br/>Aenderungen oder Stornierungen sind mindestens 8 Stunden vor Abholzeit erforderlich.</td></tr>
                    <tr><td style="padding:0 18px 10px 18px;font-size:14px;line-height:1.55;color:#1d1d1f;">Weitere Details finden Sie hier:<br/><a href="${appUrl}/faq" style="color:#0071e3;text-decoration:none;font-weight:600;">FAQ</a></td></tr>
                    <tr><td style="padding:0 18px 10px 18px;font-size:14px;line-height:1.55;color:#1d1d1f;">Fragen? Starten Sie einen WhatsApp-Chat mit uns.</td></tr>
                    <tr><td style="padding:0 18px 16px 18px;"><a href="https://wa.me/?text=Hallo%20FlughafenTaxi%20Wien%2C%20ich%20habe%20eine%20Frage%20zu%20meiner%20Buchung." style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:10px 16px;border-radius:999px;">WhatsApp Chat starten</a></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `,
      });
      if (!error) {
        emailError = null;
        break;
      }
      emailError = error;
      console.error(`Resend send failed for from=${from}:`, error);
    }

    if (emailError) {
      // Avoid creating bookings that the user cannot confirm by email.
      const { error: cleanupError } = await supabaseAdmin
        .from('bookings')
        .delete()
        .eq('id', data.id);
      if (cleanupError) {
        console.error('Booking cleanup after email failure failed:', cleanupError);
      }
      const details =
        typeof emailError === 'object' && emailError && 'message' in emailError
          ? String((emailError as any).message)
          : String(emailError || '');
      if (process.env.NODE_ENV !== 'production' && details) {
        return { error: `Buchung konnte nicht bestaetigt werden: ${details}` };
      }
      return { error: 'Buchung konnte nicht bestaetigt werden: E-Mail Versand fehlgeschlagen. Bitte erneut versuchen.' };
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



