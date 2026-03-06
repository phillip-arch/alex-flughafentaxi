import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const supabase = await createClient();

  // Reject explicit non-recovery flows on this dedicated endpoint.
  if (type && type !== 'recovery') {
    return NextResponse.redirect(new URL('/login?error=Invalid+or+expired+link', requestUrl.origin));
  }

  // Most Supabase email links arrive with "code".
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return NextResponse.redirect(new URL('/update-password', requestUrl.origin));
      }
    }
  }

  // Fallback for recovery links using token_hash + type=recovery.
  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL('/update-password', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=Invalid+or+expired+link', requestUrl.origin));
}
