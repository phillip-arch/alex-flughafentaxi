import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSameOrigin } from '@/lib/security/origin';

export async function POST(request: NextRequest) {
  try {
    await requireSameOrigin();
  } catch {
    return NextResponse.json({ error: 'CSRF blocked' }, { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/dispatch/login', request.url), { status: 303 });
}

// UX fallback: opening /auth/logout directly should not show 405.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/dispatch/login', request.url), { status: 303 });
}
