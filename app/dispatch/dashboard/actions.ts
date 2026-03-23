'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSameOrigin } from '@/lib/security/origin';
import { Resend } from 'resend';
import { parseBookingNotes } from '@/lib/booking/notes';

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

export async function addDriver(formData: FormData) {
  await requireSameOrigin();
  const admin = await checkAdmin();
  if (admin.error) return { error: admin.error || 'Unauthorized' };

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  const { error: insertError } = await supabaseAdmin
    .from('drivers')
    .insert([{ name, email, phone }]);

  if (insertError) {
    // Unique constraint on drivers.email
    if ((insertError as any)?.code === '23505') {
      return { error: 'Ein Fahrer mit dieser E-Mail-Adresse existiert bereits.' };
    }
    return safeActionError('Fahrer konnte nicht hinzugefügt werden. Bitte erneut versuchen.', 'addDriver insert failed', insertError);
  }
  revalidatePath('/dispatch/dashboard');
  return { success: true };
}

export async function deleteDriver(id: string) {
  await requireSameOrigin();
  const admin = await checkAdmin();
  if (admin.error) return { error: admin.error || 'Unauthorized' };

  const { error: deleteError } = await supabaseAdmin
    .from('drivers')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return safeActionError('Fahrer konnte nicht gelöscht werden. Bitte erneut versuchen.', 'deleteDriver failed', deleteError);
  }
  revalidatePath('/dispatch/dashboard');
  return { success: true };
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    await requireSameOrigin();
    const admin = await checkAdmin();
    if (admin.error) return { error: admin.error || 'Unauthorized' };
    if (!id) return { error: 'Buchungs-ID fehlt' };

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
        .select('id, status, driver_id, full_name, email, pickup, destination, pickup_at, price, vehicle_type, notes')
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

    if (finalStatus === 'cancelled' || finalStatus === 'canceled') {
      if (process.env.RESEND_API_KEY) {
        const pickupRaw = String(data.pickup || '').toLowerCase();
        const destinationRaw = String(data.destination || '').toLowerCase();
        const isFromAirport = pickupRaw.includes('flughafen');
        const isToAirport = destinationRaw.includes('flughafen');
        const directionLabel = isFromAirport ? 'Vom Flughafen' : isToAirport ? 'Zum Flughafen' : 'Transfer';
        const directionIcon = isFromAirport ? '🛬' : isToAirport ? '🛫' : '✈️';

        const parsedNotes = parseBookingNotes(data.notes);
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

        const safePassengerName = escapeHtml(String(data.full_name || ''));
        const pickupRawValue = String(data.pickup || '');
        const destinationRawValue = String(data.destination || '');
        const safePickup = escapeHtml(pickupRawValue);
        const safeDestination = escapeHtml(destinationRawValue);
        const pickupMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupRawValue)}`;
        const destinationMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationRawValue)}`;
        const pickupIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(pickupRawValue);
        const destinationIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(destinationRawValue);
        const safeVehicle = escapeHtml(String(data.vehicle_type || '-'));
        const safePayment = escapeHtml(paymentLabel);
        const safeFlightNumberInfo = escapeHtml(flightNumberInfo || '');
        const { date: pickupDate, time: pickupTime } = formatDateTimeForEmail(String(data.pickup_at));
        const safeDate = escapeHtml(pickupDate);
        const safeTime = escapeHtml(pickupTime);
        const safeDirectionLabel = escapeHtml(directionLabel);
        const safePrice = escapeHtml(
          new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            Number(data.price ?? 0),
          ),
        );

        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromCandidates = Array.from(
          new Set([process.env.RESEND_FROM_EMAIL, 'onboarding@resend.dev'].filter(Boolean) as string[]),
        );

        const sharedBody = `
          <tr>
            <td style="padding:20px 28px 8px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Passagierinformationen</td></tr>
                <tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Name:</strong> ${safePassengerName}</td></tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Fahrtinformationen</td></tr>
                ${data.booking_reference ? `<tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Buchungsnummer:</strong> ${escapeHtml(String(data.booking_reference || ''))}</td></tr>` : ''}
                <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Abholung:</strong> ${pickupIsAirport ? safePickup : `<a href="${pickupMapsLink}" style="color:#0071e3;text-decoration:none;font-weight:600;" target="_blank" rel="noopener noreferrer">${safePickup}</a>`}</td></tr>
                ${safeFlightNumberInfo ? `<tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Flugnummer:</strong> ${safeFlightNumberInfo}</td></tr>` : ''}
                <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Ziel:</strong> ${destinationIsAirport ? safeDestination : `<a href="${destinationMapsLink}" style="color:#0071e3;text-decoration:none;font-weight:600;" target="_blank" rel="noopener noreferrer">${safeDestination}</a>`}</td></tr>
                <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Datum:</strong> ${safeDate}</td></tr>
                <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Uhrzeit:</strong> ${safeTime}</td></tr>
                <tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Fahrzeug:</strong> ${safeVehicle}</td></tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#ffffff;border:1px solid #e5e5ea;border-radius:16px;">
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
            </td>
          </tr>
        `;

        if (data.email) {
          const safePassengerEmail = escapeHtml(String(data.email || ''));
          for (const from of fromCandidates) {
            const { error } = await resend.emails.send({
              from,
              to: data.email,
              subject: `Ihre Fahrt wurde storniert (${directionLabel})`.trim(),
              html: `
                <div style="margin:0;padding:24px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';color:#1d1d1f;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;">
                    <tr>
                      <td style="padding:28px 28px 8px 28px;text-align:center;">
                        <div style="font-size:12px;letter-spacing:.08em;color:#86868b;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Alex Flughafentaxi</div>
                        <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;color:#1d1d1f;">Fahrt storniert</h1>
                        <p style="margin:12px 0 0 0;font-size:16px;line-height:1.5;color:#86868b;">Hallo ${safePassengerName}, Ihre Fahrt wurde storniert. Bei Fragen erreichen Sie uns per Telefon, WhatsApp oder Viber.</p>
                      </td>
                    </tr>
                    ${sharedBody}
                    <tr>
                      <td style="padding:0 28px 28px 28px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                          <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Kontakt</td></tr>
                          <tr><td style="padding:0 18px 8px 18px;font-size:14px;color:#1d1d1f;"><strong>E-Mail:</strong> ${safePassengerEmail}</td></tr>
                          <tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;">Falls Sie eine Ersatzfahrt benötigen, buchen Sie bitte erneut oder kontaktieren Sie unser Team direkt.</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              `,
            });
            if (!error) break;
          }
        }

        if (data.driver_id) {
          const { data: driver, error: driverError } = await supabaseAdmin
            .from('drivers')
            .select('id, name, email')
            .eq('id', data.driver_id)
            .maybeSingle();

          if (!driverError && driver?.email) {
            const safeDriverName = escapeHtml(String(driver.name || 'Fahrer'));

            for (const from of fromCandidates) {
              const { error } = await resend.emails.send({
                from,
                to: driver.email,
                subject: `Fahrtstornierung (${directionLabel})`.trim(),
                html: `
                <div style="margin:0;padding:24px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';color:#1d1d1f;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;">
                    <tr>
                      <td style="padding:28px 28px 8px 28px;text-align:center;">
                        <div style="font-size:12px;letter-spacing:.08em;color:#86868b;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Alex Flughafentaxi</div>
                        <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;color:#1d1d1f;">Fahrt storniert</h1>
                        <p style="margin:12px 0 0 0;font-size:16px;line-height:1.5;color:#86868b;">Hallo ${safeDriverName}, diese zugewiesene Fahrt wurde storniert.</p>
                      </td>
                    </tr>
                    ${sharedBody}
                  </table>
                </div>
              `,
              });
              if (!error) break;
            }
          }
        }
      } else {
        console.error('RESEND_API_KEY missing: cancellation email not sent');
      }
    }

    await supabaseAdmin.from('audit_logs').insert({
      actor_user_id: admin.user?.id,
      action: 'UPDATE_STATUS',
      entity: 'bookings',
      entity_id: id,
      meta: { status: finalStatus },
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
    .select('id, booking_reference')
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

    const safeName = escapeHtml(String(payload.full_name || ''));
    const safePickup = escapeHtml(String(payload.pickup || ''));
    const safeDestination = escapeHtml(String(payload.destination || ''));
    const safeEmail = escapeHtml(String(payload.email || ''));
    const safePhone = escapeHtml(String(payload.phone || ''));
    const phoneHref = String(payload.phone || '').replace(/[^\d+]/g, '');
    const safeVehicle = escapeHtml(String(payload.vehicle_type || '-'));
    const safePassengers = escapeHtml(String(payload.passengers ?? '-'));
    const safeLuggage = escapeHtml(String(payload.luggage ?? '-'));
    const safeDateTime = formatDateTimeForEmail(String(payload.pickup_at));
    const safeDate = escapeHtml(safeDateTime.date);
    const safeTime = escapeHtml(safeDateTime.time);
    const safeDirectionLabel = escapeHtml(directionLabel);
    const safePayment = escapeHtml(paymentLabel);
    const safeNotes = escapeHtml(cleanedNotes || '');
    const safeFlightNumberInfo = escapeHtml(flightNumberInfo || '');
    const safeHandLuggageInfo = escapeHtml(handLuggageInfo || '0');
    const safeChildSeatInfo = escapeHtml(childSeatInfo || '-');
    const safeIntermediateStopInfo = escapeHtml(intermediateStopInfo || '-');
    const safePrice = escapeHtml(
      new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Number(payload.price ?? 0),
      ),
    );
    const pickupMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(payload.pickup || ''))}`;
    const destinationMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(payload.destination || ''))}`;
    const pickupIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(String(payload.pickup || ''));
    const destinationIsAirport = /flughafen\s+wien\s*\(vie\)/i.test(String(payload.destination || ''));
    const safeReference = escapeHtml(normalizeBookingReference(updated.booking_reference));

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromCandidates = Array.from(
      new Set([process.env.RESEND_FROM_EMAIL, 'onboarding@resend.dev'].filter(Boolean) as string[]),
    );

    let emailError: any = null;
    for (const from of fromCandidates) {
      const { error } = await resend.emails.send({
        from,
        to: payload.email,
        subject: `Ihre Buchungsbestaetigung (${directionLabel}) ${safeReference}`.trim(),
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
    }

    if (emailError) {
      return safeActionError('E-Mail Versand fehlgeschlagen. Bitte erneut versuchen.', 'updateBookingDetails email failed', emailError);
    }
  }

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
      html: `
        <div style="margin:0;padding:8px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';color:#1d1d1f;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:none;margin:0;background:#ffffff;border:none;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:18px 10px 0 10px;text-align:center;">
                <a href="${confirmLink}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:12px 24px;border-radius:9999px;">Bestaetigen Sie die Fahrt hier</a>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 10px 8px 10px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                  <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Passagierinformationen</td></tr>
                  <tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Name:</strong> ${safePassengerName}</td></tr>
                  <tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Telefon:</strong> <a href="tel:${phoneHref}" style="color:#0071e3;text-decoration:none;font-weight:600;">${safePhone}</a></td></tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                  <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Fahrtinformationen</td></tr>
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
                  ${childSeatInfo ? `<tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Kindersitze:</strong> ${safeChildSeatInfo}</td></tr>` : ''}
                  ${intermediateStopInfo ? `<tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Zwischenstopp:</strong> ${safeIntermediateStopInfo}</td></tr>` : ''}
                </table>
                ` : ''}
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#ffffff;border:1px solid #e5e5ea;border-radius:16px;">
                  <tr>
                    <td style="padding:12px 8px 12px 10px;text-align:center;width:44%;border-right:1px solid #e5e5ea;">
                      <div style="font-size:22px;line-height:1;margin-bottom:6px;">${directionIcon}</div>
                      <div style="font-size:14px;line-height:1;color:#8b8b90;margin-bottom:6px;">____</div>
                      <div style="font-size:13px;color:#1d1d1f;font-weight:700;line-height:1.2;">${safeDirectionLabel}</div>
                    </td>
                    <td style="padding:12px 10px 12px 8px;text-align:center;width:56%;">
                      <div style="font-size:11px;letter-spacing:.08em;color:#86868b;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Gesamtpreis</div>
                      <div style="font-size:30px;line-height:1.05;color:#1d1d1f;font-weight:700;letter-spacing:-0.01em;">${safePrice} &euro;</div>
                      <span style="display:inline-block;margin-top:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;${paymentStyle}">${safePayment}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    if (emailError) {
      return safeActionError('E-Mail Versand fehlgeschlagen. Bitte erneut versuchen.', 'assignDriver email failed', emailError);
    }

      await supabaseAdmin.from('audit_logs').insert({
        actor_user_id: admin.user?.id,
        action: 'ASSIGN_DRIVER',
        entity: 'bookings',
        entity_id: bookingId,
        meta: { driverId, emailSentTo: driver.email },
      });
    }
    
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

