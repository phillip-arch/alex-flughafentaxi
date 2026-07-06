import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await supabaseAdmin.from('zip_prices').select('zip').limit(1);
  if (error) {
    return NextResponse.json({ ok: false, db: 'unreachable' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, db: 'ok', ts: new Date().toISOString() });
}
