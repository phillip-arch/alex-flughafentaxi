import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildPassengerReminderEmailHtml } from '@/lib/booking/reminderEmail';
import { normalizeBookingReference } from '@/lib/booking/reference';
import { getAppSurface, getPublicWebUrl } from '@/lib/routing/surfaces';

export const dynamic = 'force-dynamic';

const REMINDER_STATUSES = ['pending', 'confirmed', 'assigned', 'Wartet auf Bestätigung'];
// Hourly cron + 20-28h window + reminder_sent_at flag = every booking gets exactly one reminder ~24h out.
const WINDOW_START_HOURS = 20;
const WINDOW_END_HOURS = 28;

export async function GET(request: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically when the env var is set.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The repo's vercel.json activates this cron on every surface deployment.
  // Only the www project processes it, so passengers get exactly one reminder.
  if (getAppSurface() !== 'www') {
    return NextResponse.json({ ok: true, skipped: `surface ${getAppSurface()}` });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: 'RESEND_API_KEY not set' });
  }

  const now = Date.now();
  const windowStart = new Date(now + WINDOW_START_HOURS * 3600e3).toISOString();
  const windowEnd = new Date(now + WINDOW_END_HOURS * 3600e3).toISOString();

  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select(
      'id, booking_reference, manage_token, full_name, email, pickup, destination, pickup_at, vehicle_type, price, notes'
    )
    .in('status', REMINDER_STATUSES)
    .is('reminder_sent_at', null)
    .gte('pickup_at', windowStart)
    .lte('pickup_at', windowEnd)
    .limit(50);

  if (error) {
    console.error('[cron/reminders] query failed:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const configuredFrom = process.env.RESEND_FROM_EMAIL;
  const fromCandidates = Array.from(
    new Set([configuredFrom, 'onboarding@resend.dev'].filter(Boolean) as string[])
  );
  const appUrl = getPublicWebUrl();

  let sent = 0;
  const failures: string[] = [];

  for (const booking of bookings) {
    const reference = normalizeBookingReference(booking.booking_reference);
    const flightNumber = String(booking.notes || '').match(/\(Flugnummer:\s*([^)]+)\)/i)?.[1]?.trim() || '';
    const html = buildPassengerReminderEmailHtml({
      fullName: booking.full_name,
      bookingReference: reference,
      pickup: booking.pickup,
      destination: booking.destination,
      pickupAt: booking.pickup_at,
      vehicleType: booking.vehicle_type,
      price: Number(booking.price),
      flightNumber,
      manageUrl: appUrl && booking.manage_token ? `${appUrl}/booking/manage?token=${booking.manage_token}` : null,
    });

    let emailError: unknown = null;
    for (const from of fromCandidates) {
      const { error: sendError } = await resend.emails.send({
        from,
        to: booking.email,
        subject: `Erinnerung: Ihre Fahrt morgen (${reference})`,
        html,
      });
      if (!sendError) {
        emailError = null;
        break;
      }
      emailError = sendError;
    }

    if (emailError) {
      console.error(`[cron/reminders] send failed for ${reference}:`, emailError);
      failures.push(reference);
      continue;
    }

    const { error: flagError } = await supabaseAdmin
      .from('bookings')
      .update({ reminder_sent_at: new Date() })
      .eq('id', booking.id);
    if (flagError) {
      console.error(`[cron/reminders] flag update failed for ${reference}:`, flagError);
    }
    sent++;
  }

  return NextResponse.json({ ok: true, sent, failures });
}
