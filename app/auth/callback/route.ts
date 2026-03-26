import { NextResponse } from 'next/server';
import { buildSurfaceUrl } from '@/lib/routing/surfaces';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const requestedNext = requestUrl.searchParams.get('next');
  const fallbackNext = type === 'recovery' ? '/update-password' : '/account?tab=buchungsverlauf';
  const next = requestedNext && requestedNext.startsWith('/') ? requestedNext : fallbackNext;
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(buildSurfaceUrl('app', next));
    }
  }

  // Supabase recovery links may use token_hash + type=recovery.
  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(buildSurfaceUrl('app', '/update-password'));
    }
  }

  // If there's an error or no code, redirect to login with an error
  return NextResponse.redirect(
    buildSurfaceUrl('app', '/login?error=Ungueltiger+oder+abgelaufener+Link'),
  );
}
