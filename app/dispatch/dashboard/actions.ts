'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSameOrigin } from '@/lib/security/origin';
import { Resend } from 'resend';
import { parseBookingNotes } from '@/lib/booking/notes';
import {
  buildPassengerCancellationEmailHtml,
  buildPassengerConfirmationEmailHtml,
} from '@/lib/booking/passengerEmail';
import { buildDriverCancellationEmailHtml } from '@/lib/booking/driverCancellationEmail';
import { buildDriverAssignmentEmailHtml } from '@/lib/booking/driverAssignmentEmail';
import { logAuditEvent } from '@/lib/audit/logAuditEvent';

function normalizeBookingReference(reference?: string | null) {
  if (!reference) return '-';
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

function safeActionError(publicMessage: string, context: string, error?: unknown) {
  console.error(context, error);
  return { error: publicMessage };
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

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // If it's a real auth error (not just missing session), log it
    if (authError) console.error('Auth check error:', authError);
    return { error: 'Unauthorized', user: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile check error:', profileError);
    return { error: 'Database Error', user: null };
  }

  if (profileError || profile?.role !== 'admin') {
    return { error: 'Zugriff verweigert', user: null };
  }

  return { user, supabase };
}

export async function fetchBookings(date: string) {
  const admin = await checkAdmin();
  if (admin.error) return [];

  // Date is expected to be YYYY-MM-DD
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const { data, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      driver:driver_id(name)
    `)
    .gte('pickup_at', startOfDay.toISOString())
    .lte('pickup_at', endOfDay.toISOString())
    .order('pickup_at', { ascending: true });

  if (fetchError) {
    console.error('Error fetching bookings:', fetchError);
    return [];
  }
  return data;
}

export async function searchBookings(query: string) {
  const admin = await checkAdmin();
  if (admin.error) return [];

  const normalized = String(query || '').trim();
  if (!normalized) return [];

  const escaped = normalized.replace(/[%_,]/g, (match) => `\\${match}`);
  const filter = `%${escaped}%`;

  const { data, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      driver:driver_id(name)
    `)
    .or(`full_name.ilike.${filter},email.ilike.${filter},booking_reference.ilike.${filter}`)
    .order('pickup_at', { ascending: false })
    .limit(150);

  if (fetchError) {
    console.error('Error searching bookings:', fetchError);
    return [];
  }

  return data || [];
}

export async function fetchDrivers() {
  const admin = await checkAdmin();
  if (admin.error) return [];

  const { data, error: fetchError } = await supabaseAdmin
    .from('drivers')
    .select('*')
    .order('name', { ascending: true });

  if (fetchError) {
    console.error('Error fetching drivers:', fetchError);
    return [];
  }
  return data;
}

export async function fetchAuditLogs(
  options: number | { limit?: number; startDate?: string; endDate?: string } = 100,
) {
  const admin = await checkAdmin();
  if (admin.error) return [];

  const normalizedOptions =
    typeof options === 'number'
      ? { limit: options }
      : options || {};
  const safeLimit = Number.isFinite(normalizedOptions.limit)
    ? Math.min(Math.max(Math.trunc(normalizedOptions.limit as number), 1), 200)
    : 100;

  let query = supabaseAdmin
    .from('audit_logs')
    .select('id, actor_user_id, action, entity, entity_id, meta, created_at')
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (normalizedOptions.startDate) {
    query = query.gte('created_at', normalizedOptions.startDate);
  }

  if (normalizedOptions.endDate) {
    query = query.lte('created_at', normalizedOptions.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data || [];
}

export async function addDriver(formData: FormData) {
  await requireSameOrigin();
  const admin = await checkAdmin();
  if (admin.error) return { error: admin.error || 'Unauthorized' };

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  const { data: createdDriver, error: insertError } = await supabaseAdmin
    .from('drivers')
    .insert([{ name, email, phone }])
    .select('id, name, email, phone')
    .maybeSingle();

  if (insertError) {
    // Unique constraint on drivers.email
    if ((insertError as any)?.code === '23505') {
      return { error: 'Ein Fahrer mit dieser E-Mail-Adresse existiert bereits.' };
    }
    return safeActionError('Fahrer konnte nicht hinzugefügt werden. Bitte erneut versuchen.', 'addDriver insert failed', insertError);
  }
  await logAuditEvent({
    actor: admin.user,
    action: 'CREATE_DRIVER',
    entity: 'drivers',
    entityId: createdDriver?.id,
    meta: {
      after: createdDriver || { name, email, phone },
    },
  });

  revalidatePath('/dispatch/dashboard');
  return { success: true };
}

export async function deleteDriver(id: string) {
  await requireSameOrigin();
  const admin = await checkAdmin();
  if (admin.error) return { error: admin.error || 'Unauthorized' };

  const { data: existingDriver } = await supabaseAdmin
    .from('drivers')
    .select('id, name, email, phone')
    .eq('id', id)
    .maybeSingle();

  const { error: deleteError } = await supabaseAdmin
    .from('drivers')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return safeActionError('Fahrer konnte nicht gelöscht werden. Bitte erneut versuchen.', 'deleteDriver failed', deleteError);
  }

  await logAuditEvent({
    actor: admin.user,
    action: 'DELETE_DRIVER',
    entity: 'drivers',
    entityId: id,
    meta: {
      before: existingDriver || null,
    },
  });

  revalidatePath('/dispatch/dashboard');
  return { success: true };
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    await requireSameOrigin();
    const admin = await checkAdmin();
    if (admin.error) return { error: admin.error || 'Unauthorized' };
    if (!id) return { error: 'Buchungs-ID fehlt' };

    const { data: beforeBooking } = await supabaseAdmin
      .from('bookings')
      .select('id, status, driver_id, full_name, email, pickup, destination, pickup_at, price, vehicle_type, notes, booking_reference')
      .eq('id', id)
      .maybeSingle();

    const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled', 'canceled', 'completed']);
    if (!allowedStatuses.has(status)) return { error: 'Ungültiger Statuswert' };

    const cancellationCandidates = status === 'cancelled' || status === 'canceled' ? ['canceled', 'cancelled'] : [status];
    let data: any = null;
    let updateError: any = null;
    let finalStatus = status;

    // Try both cancellation spellings to tolerate production DB check-constraint differences.
    for (const candidate of cancellationCandidates) {
      const result = await supabaseAdmin
        .from('bookings')
        .update({ status: candidate })
        .eq('id', id)
        .select('id, status, driver_id, full_name, email, pickup, destination, pickup_at, price, vehicle_type, notes, booking_reference')
        .maybeSingle();

      if (!result.error && result.data) {
        data = result.data;
        updateError = null;
        finalStatus = candidate;
        break;
      }

      updateError = result.error;
    }

    if (updateError) {
      return safeActionError('Fahrtstatus konnte nicht aktualisiert werden. Bitte erneut versuchen.', 'updateBookingStatus update failed', updateError);
    }
    if (!data) {
      return { error: 'Buchung nicht gefunden oder Aktualisierung nicht erlaubt' };
    }

    let notificationData = data;
    if (finalStatus === 'cancelled' || finalStatus === 'canceled') {
      const { data: freshBookingData, error: freshBookingError } = await supabaseAdmin
        .from('bookings')
        .select('id, status, driver_id, full_name, email, pickup, destination, pickup_at, price, vehicle_type, notes, booking_reference')
        .eq('id', id)
        .maybeSingle();

      if (freshBookingError) {
        console.error('updateBookingStatus notification reload failed:', freshBookingError);
      } else if (freshBookingData) {
        notificationData = freshBookingData;
      }
    }

    if (finalStatus === 'cancelled' || finalStatus === 'canceled') {
      if (process.env.RESEND_API_KEY) {
        const pickupRaw = String(notificationData.pickup || '').toLowerCase();
        const destinationRaw = String(notificationData.destination || '').toLowerCase();
        const isFromAirport = pickupRaw.includes('flughafen');
        const isToAirport = destinationRaw.includes('flughafen');
        const directionLabel = isFromAirport ? 'Vom Flughafen' : isToAirport ? 'Zum Flughafen' : 'Transfer';
        const directionIcon = isFromAirport ? '🛬' : isToAirport ? '🛫' : '✈️';

        const parsedNotes = parseBookingNotes(notificationData.notes);
        const paymentInNotes = String(parsedNotes.paymentLabel || '').toLowerCase();
        const flightNumberInfo = parsedNotes.flightNumberInfo;
        const isCardPayment =
          paymentInNotes.includes('kredit') || paymentInNotes.includes('card') || paymentInNotes.includes('karte');
        const isCashPayment = paymentInNotes.includes('bar') || paymentInNotes.includes('cash');
        const paymentLabel = isCardPayment ? 'Kreditkarte' : isCashPayment ? 'Barzahlung' : '-';
        const paymentStyle = isCardPayment
          ? 'background:#e8f2ff;color:#0071e3;'
          : isCashPayment
            ? 'background:linear-gradient(135deg,rgba(10,99,255,0.12) 0%,rgba(36,144,255,0.18) 100%);color:#0a63ff;'
            : 'background:#f5f5f7;color:#86868b;';

        const safePassengerName = escapeHtml(String(notificationData.full_name || ''));
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromCandidates = Array.from(
          new Set([process.env.RESEND_FROM_EMAIL, 'onboarding@resend.dev'].filter(Boolean) as string[]),
        );

        if (notificationData.email) {
          for (const from of fromCandidates) {
            const { error } = await resend.emails.send({
              from,
              to: notificationData.email,
              subject: 'Ihre Fahrt wurde storniert',
              html: buildPassengerCancellationEmailHtml({
                fullName: notificationData.full_name,
                bookingReference: notificationData.booking_reference,
                pickup: notificationData.pickup,
                destination: notificationData.destination,
                pickupAt: notificationData.pickup_at,
                vehicleType: notificationData.vehicle_type,
                price: notificationData.price,
              }),
            });
            if (!error) break;
            console.error('updateBookingStatus passenger cancellation email failed:', error);
          }
        }

        if (notificationData.driver_id) {
          const { data: driver, error: driverError } = await supabaseAdmin
            .from('drivers')
            .select('id, name, email')
            .eq('id', notificationData.driver_id)
            .maybeSingle();

          if (!driverError && driver?.email) {
            for (const from of fromCandidates) {
              const { error } = await resend.emails.send({
                from,
                to: driver.email,
                subject: `Fahrtstornierung (${directionLabel})`.trim(),
                html: buildDriverCancellationEmailHtml({
                  driverName: driver.name,
                  pickup: notificationData.pickup,
                  destination: notificationData.destination,
                  pickupAt: notificationData.pickup_at,
                  vehicleType: notificationData.vehicle_type,
                  price: notificationData.price,
                }),
              });
              if (!error) break;
            }
          }
        }
      } else {
        console.error('RESEND_API_KEY missing: cancellation email not sent');
      }
    }

    await logAuditEvent({
      actor: admin.user,
      action: 'UPDATE_STATUS',
      entity: 'bookings',
      entityId: id,
      meta: {
        before: beforeBooking || null,
        after: notificationData || data || null,
        status: finalStatus,
      },
    });

    revalidatePath('/dispatch/dashboard');
    return { success: true, status: data.status || finalStatus };
  } catch (error) {
    console.error('updateBookingStatus failed:', error);
    return { error: 'Aktualisierung des Fahrtstatus fehlgeschlagen. Bitte erneut versuchen.' };
  }
}

export async function updateBookingDetails(payload: {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  pickup: string;
  destination: string;
  pickup_at: string;
  passengers: number;
  luggage: number;
  price: number;
  vehicle_type?: string;
  notes?: string;
  status: string;
  sendPassengerEmail?: boolean;
}) {
  await requireSameOrigin();
  const admin = await checkAdmin();
  if (admin.error || !admin.supabase) return { error: admin.error || 'Unauthorized' };

  const allowedStatuses = new Set([
    'pending',
    'confirmed',
    'cancelled',
    'canceled',
    'completed',
  ]);

  if (!payload?.id) return { error: 'Buchungs-ID fehlt' };
  if (!allowedStatuses.has(payload.status)) return { error: 'Ungültiger Statuswert' };

  const { data: beforeBooking } = await supabaseAdmin
    .from('bookings')
    .select('id, full_name, email, phone, pickup, destination, pickup_at, passengers, luggage, price, vehicle_type, notes, status, booking_reference')
    .eq('id', payload.id)
    .maybeSingle();

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      pickup: payload.pickup,
      destination: payload.destination,
      pickup_at: payload.pickup_at,
      passengers: payload.passengers,
      luggage: payload.luggage,
      price: payload.price,
      vehicle_type: payload.vehicle_type || null,
      notes: payload.notes || null,
      status: payload.status,
    })
    .eq('id', payload.id)
    .select('id, booking_reference, confirm_token')
    .maybeSingle();

  if (updateError) {
    return safeActionError('Buchungsänderungen konnten nicht gespeichert werden. Bitte erneut versuchen.', 'updateBookingDetails update failed', updateError);
  }
  if (!updated) {
    return { error: 'Buchung nicht gefunden' };
  }

  if (payload.sendPassengerEmail) {
    if (!process.env.RESEND_API_KEY) {
      return { error: 'Server-Fehlkonfiguration: RESEND_API_KEY fehlt' };
    }

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmLink = `${appUrl}/book/confirm?token=${updated.confirm_token}`;
    const pickupRaw = String(payload.pickup || '').toLowerCase();
    const destinationRaw = String(payload.destination || '').toLowerCase();
    const isFromAirport = pickupRaw.includes('flughafen');
    const isToAirport = destinationRaw.includes('flughafen');
    const directionLabel = isFromAirport ? 'Vom Flughafen' : isToAirport ? 'Zum Flughafen' : 'Transfer';
    const directionIcon = isFromAirport ? '🛬' : isToAirport ? '🛫' : '✈️';
    const parsedNotes = parseBookingNotes(payload.notes);
    const paymentInNotes = String(parsedNotes.paymentLabel || '').toLowerCase();
    const childSeatInfo = parsedNotes.childSeatInfo;
    const intermediateStopInfo = parsedNotes.intermediateStopInfo;
    const flightNumberInfo = parsedNotes.flightNumberInfo;
    const handLuggageInfo = String(parsedNotes.handLuggageCount || 0);
    const cleanedNotes = parsedNotes.cleanedNotes;
    const hasAdditionalInfo = Boolean(childSeatInfo || intermediateStopInfo);
    const hasNotes = Boolean(cleanedNotes);
    const isCardPayment =
      paymentInNotes.includes('kredit') || paymentInNotes.includes('card') || paymentInNotes.includes('karte');
    const isCashPayment = paymentInNotes.includes('bar') || paymentInNotes.includes('cash');
    const paymentLabel = isCardPayment ? 'Kreditkarte' : isCashPayment ? 'Barzahlung' : '-';
    const paymentStyle = isCardPayment
      ? 'background:#e8f2ff;color:#0071e3;'
      : isCashPayment
        ? 'background:linear-gradient(135deg,rgba(10,99,255,0.12) 0%,rgba(36,144,255,0.18) 100%);color:#0a63ff;'
        : 'background:#f5f5f7;color:#86868b;';

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromCandidates = Array.from(
      new Set([process.env.RESEND_FROM_EMAIL, 'onboarding@resend.dev'].filter(Boolean) as string[]),
    );

    let emailError: any = null;
    for (const from of fromCandidates) {
      const { error } = await resend.emails.send({
        from,
        to: payload.email,
        subject: `Ihre Buchungsbestaetigung (${directionLabel}) ${normalizeBookingReference(updated.booking_reference)}`.trim(),
        html: buildPassengerConfirmationEmailHtml({
          fullName: payload.full_name,
          email: payload.email,
          phone: payload.phone,
          bookingReference: normalizeBookingReference(updated.booking_reference),
          pickup: payload.pickup,
          destination: payload.destination,
          pickupAt: payload.pickup_at,
          vehicleType: payload.vehicle_type,
          passengers: payload.passengers,
          luggage: payload.luggage,
          handLuggage: handLuggageInfo || '0',
          paymentLabel,
          flightNumber: flightNumberInfo || '',
          childSeatInfo: childSeatInfo || '',
          intermediateStopInfo: intermediateStopInfo || '',
          notes: cleanedNotes || '',
          price: Number(payload.price ?? 0),
        }),
      });
      if (!error) {
        emailError = null;
        break;
      }
      emailError = error;
    }

    if (emailError) {
      return safeActionError('E-Mail Versand fehlgeschlagen. Bitte erneut versuchen.', 'updateBookingDetails email failed', emailError);
    }
  }

  await logAuditEvent({
    actor: admin.user,
    action: 'UPDATE_BOOKING',
    entity: 'bookings',
    entityId: payload.id,
    meta: {
      before: beforeBooking || null,
      after: {
        id: payload.id,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        pickup: payload.pickup,
        destination: payload.destination,
        pickup_at: payload.pickup_at,
        passengers: payload.passengers,
        luggage: payload.luggage,
        price: payload.price,
        vehicle_type: payload.vehicle_type || null,
        notes: payload.notes || null,
        status: payload.status,
        booking_reference: updated.booking_reference || null,
      },
      sendPassengerEmail: Boolean(payload.sendPassengerEmail),
    },
  });

  revalidatePath('/dispatch/dashboard');
  return { success: true };
}

export async function assignDriver(bookingId: string, driverId: string, sendEmail = false) {
  try {
    await requireSameOrigin();
    const admin = await checkAdmin();
    if (admin.error) return { error: admin.error || 'Nicht autorisiert' };

    if (!bookingId || !driverId) {
      return { error: 'bookingId oder driverId fehlt' };
    }

    const { data: beforeAssignment } = await supabaseAdmin
      .from('bookings')
      .select('id, driver_id, status, confirm_token, booking_reference')
      .eq('id', bookingId)
      .maybeSingle();
    let assignedBookingReference = beforeAssignment?.booking_reference || null;

    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        driver_id: driverId,
        ...(sendEmail ? { status: 'pending' } : {}),
      })
      .eq('id', bookingId);

    if (updateError) {
      return safeActionError('Fahrer konnte nicht zugewiesen werden. Bitte erneut versuchen.', 'assignDriver update failed', updateError);
    }

    if (sendEmail) {
      if (!process.env.RESEND_API_KEY) {
        return { error: 'Server-Fehlkonfiguration: RESEND_API_KEY fehlt' };
      }

    const [{ data: booking, error: bookingError }, { data: driver, error: driverError }] = await Promise.all([
      supabaseAdmin
        .from('bookings')
        .select('id, full_name, phone, email, pickup, destination, pickup_at, price, vehicle_type, passengers, luggage, notes, booking_reference')
        .eq('id', bookingId)
        .single(),
      supabaseAdmin
        .from('drivers')
        .select('id, name, email')
        .eq('id', driverId)
        .single(),
    ]);

    if (bookingError || !booking) {
      return safeActionError('Buchung konnte für die Zuweisung nicht geladen werden.', 'assignDriver booking lookup failed', bookingError);
    }
    assignedBookingReference = booking.booking_reference || assignedBookingReference;

    if (driverError || !driver) {
      return safeActionError('Fahrer konnte für die Zuweisung nicht geladen werden.', 'assignDriver driver lookup failed', driverError);
    }

    if (!driver.email) {
      return { error: 'Der ausgewählte Fahrer hat keine E-Mail-Adresse' };
    }

    const confirmToken = crypto.randomUUID();
    const { error: tokenUpdateError } = await supabaseAdmin
      .from('bookings')
      .update({
        confirm_token: confirmToken,
      })
      .eq('id', bookingId);

    if (tokenUpdateError) {
      return safeActionError('Bestätigungstoken konnte nicht erstellt werden.', 'assignDriver token update failed', tokenUpdateError);
    }

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmLink = `${appUrl}/driver/confirm?token=${confirmToken}&driver=${encodeURIComponent(driverId)}`;
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const resend = new Resend(process.env.RESEND_API_KEY);
    const pickupRaw = String(booking.pickup || '').toLowerCase();
    const destinationRaw = String(booking.destination || '').toLowerCase();
    const isFromAirport = pickupRaw.includes('flughafen');
    const isToAirport = destinationRaw.includes('flughafen');
    const directionLabel = isFromAirport ? 'Vom Flughafen' : isToAirport ? 'Zum Flughafen' : 'Transfer';
    const directionIcon = isFromAirport ? '🛬' : isToAirport ? '🛫' : '✈️';
    const safePassengerName = escapeHtml(String(booking.full_name || ''));
    const pickupRawValue = String(booking.pickup || '');
    const destinationRawValue = String(booking.destination || '');
    const safePickup = escapeHtml(pickupRawValue);
    const safeDestination = escapeHtml(destinationRawValue);
    const pickupMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupRawValue)}`;
    const destinationMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationRawValue)}`;
    const pickupIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(pickupRawValue);
    const destinationIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(destinationRawValue);
    const safePhone = escapeHtml(String(booking.phone || ''));
    const phoneHref = String(booking.phone || '').replace(/[^\d+]/g, '');
    const safeVehicle = escapeHtml(String(booking.vehicle_type || '-'));
    const safePassengers = escapeHtml(String(booking.passengers ?? '-'));
    const safeLuggage = escapeHtml(String(booking.luggage ?? '-'));
    const parsedNotes = parseBookingNotes(booking.notes);
    const paymentInNotes = String(parsedNotes.paymentLabel || '').toLowerCase();
    const childSeatInfo = parsedNotes.childSeatInfo;
    const intermediateStopInfo = parsedNotes.intermediateStopInfo;
    const flightNumberInfo = parsedNotes.flightNumberInfo;
    const handLuggageInfo = String(parsedNotes.handLuggageCount || 0);
    const cleanedNotes = parsedNotes.cleanedNotes;
    const safeNotes = escapeHtml(cleanedNotes || '');
    const safeChildSeatInfo = escapeHtml(childSeatInfo || '-');
    const safeIntermediateStopInfo = escapeHtml(intermediateStopInfo || '-');
    const safeFlightNumberInfo = escapeHtml(flightNumberInfo || '');
    const safeHandLuggageInfo = escapeHtml(handLuggageInfo || '0');
    const hasAdditionalInfo = Boolean(childSeatInfo || intermediateStopInfo);
    const hasNotes = Boolean(cleanedNotes);
    const paymentSource = `${paymentInNotes}`.trim();
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
      new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Number(booking.price ?? 0),
      ),
    );
    const { date: pickupDate, time: pickupTime } = formatDateTimeForEmail(String(booking.pickup_at));
    const safeDate = escapeHtml(pickupDate);
    const safeTime = escapeHtml(pickupTime);
    const safeDirectionLabel = escapeHtml(directionLabel);
    const extractZip = (value: string) => value.match(/\b\d{4}\b/)?.[0] || '';
    const primaryZip = extractZip(isFromAirport ? destinationRawValue : pickupRawValue);
    const fallbackZip = extractZip(isFromAirport ? pickupRawValue : destinationRawValue);
    const zipForSubject = primaryZip || fallbackZip || '----';
    const subjectTime = String(pickupTime || '').trim();
    const driverSubject = `Neue Fahrtzuweisung - ${pickupDate}, ${subjectTime}, ${directionLabel}, ${zipForSubject}`;

    const { error: emailError } = await resend.emails.send({
      from,
      to: driver.email,
      subject: driverSubject,
      html: buildDriverAssignmentEmailHtml({
        confirmLink,
        passengerNameHtml: safePassengerName,
        phoneHref,
        phoneHtml: safePhone,
        pickupHtml: safePickup,
        destinationHtml: safeDestination,
        pickupMapsLink,
        destinationMapsLink,
        pickupIsAirport,
        destinationIsAirport,
        dateHtml: safeDate,
        timeHtml: safeTime,
        vehicleHtml: safeVehicle,
        passengersHtml: safePassengers,
        luggageHtml: safeLuggage,
        handLuggageHtml: safeHandLuggageInfo,
        flightNumberHtml: safeFlightNumberInfo,
        notesHtml: safeNotes,
        hasNotes,
        childSeatInfoHtml: childSeatInfo ? safeChildSeatInfo : '',
        intermediateStopInfoHtml: intermediateStopInfo ? safeIntermediateStopInfo : '',
        hasAdditionalInfo,
        directionIcon,
        directionLabelHtml: safeDirectionLabel,
        priceHtml: safePrice,
        paymentHtml: safePayment,
        paymentStyle,
      }),
    });

    if (emailError) {
      return safeActionError('E-Mail Versand fehlgeschlagen. Bitte erneut versuchen.', 'assignDriver email failed', emailError);
    }

    }

    await logAuditEvent({
      actor: admin.user,
      action: 'ASSIGN_DRIVER',
      entity: 'bookings',
      entityId: bookingId,
      meta: {
        before: beforeAssignment || null,
        after: {
          id: bookingId,
          driver_id: driverId,
          status: sendEmail ? 'pending' : beforeAssignment?.status || null,
          booking_reference: assignedBookingReference,
        },
        sendEmail,
      },
    });

    revalidatePath('/dispatch/dashboard');
    return { success: true, emailSent: sendEmail };
  } catch (error) {
    console.error('assignDriver failed:', error);
    return { error: 'Fahrerzuweisung fehlgeschlagen. Bitte erneut versuchen.' };
  }
}

export async function unassignDriver(bookingId: string) {
  try {
    await requireSameOrigin();
    const admin = await checkAdmin();
    if (admin.error) return { error: admin.error || 'Nicht autorisiert' };
    if (!bookingId) return { error: 'bookingId fehlt' };

    const { data: beforeUnassign } = await supabaseAdmin
      .from('bookings')
      .select('id, driver_id, status, confirm_token, booking_reference')
      .eq('id', bookingId)
      .maybeSingle();

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        driver_id: null,
        status: 'pending',
      })
      .eq('id', bookingId)
      .select('id, status, driver_id')
      .maybeSingle();

    if (error) {
      return safeActionError(
        'Fahrerzuweisung konnte nicht entfernt werden. Bitte erneut versuchen.',
        'unassignDriver update failed',
        error,
      );
    }

    if (!data) {
      return { error: 'Buchung nicht gefunden.' };
    }

    if (data.driver_id) {
      return { error: 'Fahrerzuweisung konnte nicht entfernt werden.' };
    }

    // Best-effort token invalidation. The critical admin action is removing the
    // driver assignment; token columns may differ across older DB variants.
    const invalidatedToken = crypto.randomUUID();
    const cleanupPayloads = [
      {
        confirm_token: invalidatedToken,
        confirm_token_used_at: null,
        confirm_token_expires_at: null,
      },
      {
        confirm_token: invalidatedToken,
        confirm_token_used_at: null,
      },
      {
        confirm_token: invalidatedToken,
      },
    ];

    for (const payload of cleanupPayloads) {
      const { error: cleanupError } = await supabaseAdmin
        .from('bookings')
        .update(payload)
        .eq('id', bookingId);

      if (!cleanupError) break;
      console.warn('unassignDriver cleanup skipped:', cleanupError);
    }

    await logAuditEvent({
      actor: admin.user,
      action: 'UNASSIGN_DRIVER',
      entity: 'bookings',
      entityId: bookingId,
      meta: {
        before: beforeUnassign || null,
        after: {
          id: bookingId,
          driver_id: null,
          status: data.status,
          booking_reference: beforeUnassign?.booking_reference || null,
        },
      },
    });

    revalidatePath('/dispatch/dashboard');
    return { success: true, status: data.status };
  } catch (error) {
    console.error('unassignDriver failed:', error);
    return { error: 'Fahrerzuweisung konnte nicht entfernt werden.' };
  }
}

export async function fetchStats(startDate: string, endDate: string) {
  const admin = await checkAdmin();
  if (admin.error) return [];
  
  const { data, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('*, driver:driver_id(name)')
    .gte('pickup_at', startDate)
    .lte('pickup_at', endDate)
    .not('status', 'in', '("cancelled","canceled")');

  if (fetchError) {
    console.error('Error fetching stats:', fetchError);
    return [];
  }
  return data;
}

export async function fetchPassengerCounts(email: string) {
  const admin = await checkAdmin();
  if (admin.error) return 0;

  const { count, error: countError } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .not('status', 'in', '("cancelled","canceled")');

  if (countError) {
    return 0;
  }
  return count || 0;
}

export async function fetchPassengerCountsBatch(emails: string[]) {
  const admin = await checkAdmin();
  if (admin.error) return {};

  const uniqueEmails = Array.from(new Set((emails || []).filter(Boolean)));
  if (uniqueEmails.length === 0) return {};

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('email')
    .in('email', uniqueEmails)
    .not('status', 'in', '("cancelled","canceled")');

  if (error) {
    console.error('Error fetching passenger counts batch:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const email = (row as any).email as string;
    if (!email) continue;
    counts[email] = (counts[email] || 0) + 1;
  }

  return counts;
}

