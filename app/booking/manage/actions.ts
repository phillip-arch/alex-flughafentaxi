'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildPassengerCancellationEmailHtml } from '@/lib/booking/passengerEmail';
import { buildDriverCancellationEmailHtml } from '@/lib/booking/driverCancellationEmail';
import { getCancellationAlertEmail } from '@/lib/settings/appSettings';
import { normalizeBookingReference } from '@/lib/booking/reference';
import {
  isNightLeadTimeWindow,
  DAYTIME_LEAD_TIME_MINUTES,
  NIGHTTIME_LEAD_TIME_MINUTES,
} from '@/lib/booking/leadTime';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'assigned', 'Wartet auf Bestätigung'];

export type ManagedBooking = {
  reference: string;
  status: string;
  pickup: string;
  destination: string;
  pickupAt: string;
  vehicleType: string;
  passengers: number;
  price: number;
  fullName: string;
  cancellable: boolean;
  cancellationDeadlineMinutes: number;
};

function getCancellationPolicy(pickupAt: Date) {
  // Mirrors the booking lead-time policy communicated in the confirmation email:
  // day rides (07:00-22:00) cancellable until 3h before, night rides until 8h before.
  const requiredMinutes = isNightLeadTimeWindow(pickupAt)
    ? NIGHTTIME_LEAD_TIME_MINUTES
    : DAYTIME_LEAD_TIME_MINUTES;
  const minutesUntilPickup = Math.floor((pickupAt.getTime() - Date.now()) / 60000);
  return {
    requiredMinutes,
    cancellable: minutesUntilPickup >= requiredMinutes,
  };
}

export async function getBookingByToken(token: string): Promise<
  { booking: ManagedBooking } | { error: string }
> {
  if (!token || !UUID_REGEX.test(token)) {
    return { error: 'Ungültiger Link.' };
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(
      'booking_reference, status, pickup, destination, pickup_at, vehicle_type, passengers, price, full_name'
    )
    .eq('manage_token', token)
    .single();

  if (error || !data) {
    return { error: 'Buchung nicht gefunden. Bitte prüfen Sie den Link aus Ihrer E-Mail.' };
  }

  const pickupAt = new Date(data.pickup_at);
  const policy = getCancellationPolicy(pickupAt);

  return {
    booking: {
      reference: normalizeBookingReference(data.booking_reference),
      status: data.status,
      pickup: data.pickup,
      destination: data.destination,
      pickupAt: data.pickup_at,
      vehicleType: data.vehicle_type,
      passengers: data.passengers,
      price: Number(data.price),
      fullName: data.full_name,
      cancellable: CANCELLABLE_STATUSES.includes(data.status) && policy.cancellable,
      cancellationDeadlineMinutes: policy.requiredMinutes,
    },
  };
}

export async function cancelBookingByToken(token: string): Promise<
  { success: true; reference: string } | { error: string }
> {
  if (!token || !UUID_REGEX.test(token)) {
    return { error: 'Ungültiger Link.' };
  }

  const { data: existing, error: readError } = await supabaseAdmin
    .from('bookings')
    .select('id, booking_reference, status, pickup, destination, pickup_at, vehicle_type, price, full_name, email, phone, driver_id')
    .eq('manage_token', token)
    .single();

  if (readError || !existing) {
    return { error: 'Buchung nicht gefunden.' };
  }

  if (existing.status === 'cancelled') {
    return { error: 'Diese Buchung wurde bereits storniert.' };
  }

  if (!CANCELLABLE_STATUSES.includes(existing.status)) {
    return { error: `Diese Buchung kann nicht mehr storniert werden (Status: ${existing.status}).` };
  }

  const pickupAt = new Date(existing.pickup_at);
  const policy = getCancellationPolicy(pickupAt);
  if (!policy.cancellable) {
    const hours = Math.round(policy.requiredMinutes / 60);
    return {
      error: `Online-Stornierung ist bis ${hours} Stunden vor Abholung möglich. Bitte rufen Sie uns für kurzfristige Änderungen direkt an: +43 676 482 60 69.`,
    };
  }

  // Atomic: only cancel if the status has not changed in the meantime.
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date(), updated_at: new Date() })
    .eq('manage_token', token)
    .in('status', CANCELLABLE_STATUSES)
    .select('id, booking_reference')
    .single();

  if (updateError || !updated) {
    return { error: 'Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut oder rufen Sie uns an.' };
  }

  const reference = normalizeBookingReference(updated.booking_reference);

  // Notify passenger + operator. Email failures never fail the cancellation.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const configuredFrom = process.env.RESEND_FROM_EMAIL;
    const fromCandidates = Array.from(
      new Set([configuredFrom, 'onboarding@resend.dev'].filter(Boolean) as string[])
    );

    const passengerHtml = buildPassengerCancellationEmailHtml({
      fullName: existing.full_name,
      bookingReference: reference,
      pickup: existing.pickup,
      destination: existing.destination,
      pickupAt: existing.pickup_at,
      vehicleType: existing.vehicle_type,
      price: Number(existing.price),
    });

    for (const from of fromCandidates) {
      const { error } = await resend.emails.send({
        from,
        to: existing.email,
        subject: `Stornierungsbestaetigung ${reference}`,
        html: passengerHtml,
      });
      if (!error) break;
      console.error(`[cancel] passenger email failed for from=${from}:`, error);
    }

    const adminEmail = await getCancellationAlertEmail();
    if (adminEmail) {
      for (const from of fromCandidates) {
        const { error } = await resend.emails.send({
          from,
          to: adminEmail,
          subject: `Buchung storniert: ${reference}`,
          html: `<p>Der Fahrgast hat online storniert.</p>
<p><strong>${reference}</strong><br/>
${existing.pickup} &rarr; ${existing.destination}<br/>
Abholung: ${existing.pickup_at}<br/>
Name: ${existing.full_name}<br/>
Telefon: ${existing.phone}</p>`,
        });
        if (!error) break;
        console.error(`[cancel] admin email failed for from=${from}:`, error);
      }
    }

    // Driver notification: only if a driver was assigned AND their toggle is on.
    if (existing.driver_id) {
      const { data: driver } = await supabaseAdmin
        .from('drivers')
        .select('name, email, notify_on_cancellation')
        .eq('id', existing.driver_id)
        .maybeSingle();

      if (driver?.email && (driver.notify_on_cancellation ?? true)) {
        const driverHtml = buildDriverCancellationEmailHtml({
          driverName: driver.name,
          pickup: existing.pickup,
          destination: existing.destination,
          pickupAt: existing.pickup_at,
          vehicleType: existing.vehicle_type,
          price: Number(existing.price),
        });
        for (const from of fromCandidates) {
          const { error } = await resend.emails.send({
            from,
            to: driver.email,
            subject: `Fahrt storniert: ${reference}`,
            html: driverHtml,
          });
          if (!error) break;
          console.error(`[cancel] driver email failed for from=${from}:`, error);
        }
      }
    }
  }

  return { success: true, reference };
}
