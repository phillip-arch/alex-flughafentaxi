import { NextRequest, NextResponse } from 'next/server';
import { buildSurfaceUrl, getAppSurface } from '@/lib/routing/surfaces';
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

  const loginUrl = getAppSurface() === 'dispatch'
    ? buildSurfaceUrl('dispatch', '/dispatch/login')
    : buildSurfaceUrl('app', '/login');

  return NextResponse.redirect(loginUrl, { status: 303 });
}

// UX fallback: opening /auth/logout directly should not show 405.
export async function GET(request: NextRequest) {
  const loginUrl = getAppSurface() === 'dispatch'
    ? buildSurfaceUrl('dispatch', '/dispatch/login')
    : buildSurfaceUrl('app', '/login');

  return NextResponse.redirect(loginUrl, { status: 303 });
}
