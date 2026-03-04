import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { DriverSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  // 1. Verify Admin (Server-Side Check)
  const { authorized, error } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    // 2. Validate Input
    const body = await req.json();
    const result = DriverSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, active } = result.data;

    // 3. Perform Action (Service Role)
    const { data, error: dbError } = await supabaseAdmin
      .from('drivers')
      .insert({ name, email, phone, active })
      .select()
      .single();

    if (dbError) throw dbError;

    // 4. Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      actor_user_id: (await verifyAdmin()).user?.id,
      action: 'CREATE_DRIVER',
      entity: 'drivers',
      entity_id: data.id,
      meta: { name, email },
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { authorized, error } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
