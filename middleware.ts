import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const applyRouteHeaders = (nextResponse: NextResponse) => {
    if (path.startsWith('/dispatch')) {
      nextResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    }
    return nextResponse;
  };

  // Fallback for Supabase recovery links that incorrectly land on "/?code=..." or "/?token_hash=...".
  // Route them through our callback handler to complete recovery safely.
  if (path === '/') {
    const code = request.nextUrl.searchParams.get('code');
    const tokenHash = request.nextUrl.searchParams.get('token_hash');
    const type = request.nextUrl.searchParams.get('type');

    if (code || (tokenHash && type === 'recovery')) {
      const callbackUrl = new URL('/auth/callback', request.url);
      request.nextUrl.searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
      });
      if (!callbackUrl.searchParams.get('next') && callbackUrl.searchParams.get('type') === 'recovery') {
        callbackUrl.searchParams.set('next', '/update-password');
      }
      return NextResponse.redirect(callbackUrl);
    }
  }

  let response = applyRouteHeaders(NextResponse.next({
    request: {
      headers: request.headers,
    },
  }));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = applyRouteHeaders(NextResponse.next({
            request: {
              headers: request.headers,
            },
          }));
          
          // Environment-based cookie security
          const vercelEnv = process.env.VERCEL_ENV; // 'production' | 'preview' | 'development' | undefined
          
          // Auto-detect AI Studio preview environment if APP_ENV not explicitly set
          const appEnv = process.env.APP_ENV || (process.env.NEXT_PUBLIC_APP_URL?.includes('.run.app') ? 'preview' : undefined);

          const isVercelProd = vercelEnv === 'production';
          const isIframePreview = vercelEnv === 'preview' || appEnv === 'preview';

          // SameSite logic
          // Vercel Prod -> Lax
          // Preview (Vercel or AI Studio) -> None (for iframe support)
          // Default -> Lax
          const sameSiteAttribute: 'lax' | 'none' = isVercelProd ? 'lax' : (isIframePreview ? 'none' : 'lax');

          // Secure logic:
          // - Local development must stay non-secure so auth cookies work on http://localhost.
          // - Production/preview should be secure.
          const secureAttribute = process.env.NODE_ENV === 'production';

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              sameSite: sameSiteAttribute,
              secure: secureAttribute,
            });
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  // Protected Routes Logic
  // 1. Protect Admin Routes
  if (path.startsWith('/dispatch')) {
    // Allow access to login page
    if (path === '/dispatch/login') {
      if (user) {
        return NextResponse.redirect(new URL('/dispatch/dashboard', request.url));
      }
      return response;
    }

    // For all other /dispatch routes
    if (!user) {
      // Skip redirect for Server Actions (they handle their own auth)
      if (request.headers.get('next-action')) {
        return response;
      }
      return NextResponse.redirect(new URL('/dispatch/login', request.url));
    }
  }

  // 2. Protect User Account Routes
  if (path.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Keep logged-in users out of auth login page
  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Include "/" to catch password-reset links that fallback to homepage.
    '/',
    // Run auth/session middleware on routes that need auth protection.
    '/dispatch/:path*',
    '/account/:path*',
    '/login',
  ],
};
