import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireSameOrigin } from '@/lib/security/origin';

export async function POST(req: NextRequest) {
  await requireSameOrigin();
  const { authorized, error, user } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const { bookingId, driverId } = await req.json();

    if (!bookingId || !driverId) {
      return NextResponse.json({ error: 'Missing bookingId or driverId' }, { status: 400 });
    }

    // 1. Generate Secure Token (Must be UUID)
    const confirmToken = crypto.randomUUID();

    // 2. Update Booking
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        driver_id: driverId,
        confirm_token: confirmToken,
      })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    // 3. Send Email (Mock for now - replace with Resend)

    // 4. Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      actor_user_id: user?.id,
      action: 'ASSIGN_DRIVER',
      entity: 'bookings',
      entity_id: bookingId,
      meta: { driverId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
