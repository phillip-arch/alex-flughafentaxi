import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  buildSurfaceUrl,
  getAppSurface,
  isCustomerAppPath,
  isDispatchPath,
} from '@/lib/routing/surfaces';

function buildContentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = ["'self'", "'unsafe-inline'"];

  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://web-site.website https://images.pexels.com https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://prod.api.market https://www.google-analytics.com https://region1.google-analytics.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "manifest-src 'self'",
    "media-src 'self' data: blob:",
    isDev ? '' : 'upgrade-insecure-requests',
  ]
    .filter(Boolean)
    .join('; ');
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const surface = getAppSurface();
  const pathnameWithSearch = `${path}${request.nextUrl.search}`;
  const contentSecurityPolicy = buildContentSecurityPolicy();

  const applyRouteHeaders = (nextResponse: NextResponse) => {
    nextResponse.headers.set('Content-Security-Policy', contentSecurityPolicy);
    nextResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    nextResponse.headers.set('X-Content-Type-Options', 'nosniff');
    nextResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
    nextResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (path.startsWith('/dispatch') || surface === 'dispatch') {
      nextResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    }
    return nextResponse;
  };

  if (path === '/') {
    const code = request.nextUrl.searchParams.get('code');
    const tokenHash = request.nextUrl.searchParams.get('token_hash');
    const type = request.nextUrl.searchParams.get('type');

    if (code || (tokenHash && type === 'recovery')) {
      const callbackUrl = buildSurfaceUrl('app', '/auth/callback');
      request.nextUrl.searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
      });
      if (!callbackUrl.searchParams.get('next') && callbackUrl.searchParams.get('type') === 'recovery') {
        callbackUrl.searchParams.set('next', '/update-password');
      }
      return NextResponse.redirect(callbackUrl);
    }
  }

  if (surface === 'www') {
    if (isDispatchPath(path)) {
      return NextResponse.redirect(buildSurfaceUrl('dispatch', pathnameWithSearch));
    }

    const shouldStayOnWeb = path === '/book' || path.startsWith('/book/');

    if (isCustomerAppPath(path) && !shouldStayOnWeb) {
      return NextResponse.redirect(buildSurfaceUrl('app', pathnameWithSearch));
    }
  }

  if (surface === 'app') {
    if (path === '/') {
      return NextResponse.redirect(buildSurfaceUrl('app', '/account?tab=buchungsverlauf'));
    }

    if (isDispatchPath(path)) {
      return NextResponse.redirect(buildSurfaceUrl('dispatch', pathnameWithSearch));
    }

    if (!isCustomerAppPath(path)) {
      return NextResponse.redirect(buildSurfaceUrl('www', pathnameWithSearch));
    }
  }

  if (surface === 'dispatch') {
    if (path === '/') {
      return NextResponse.redirect(buildSurfaceUrl('dispatch', '/dispatch/login'));
    }

    if (!isDispatchPath(path) && path !== '/auth/logout') {
      if (isCustomerAppPath(path)) {
        return NextResponse.redirect(buildSurfaceUrl('app', pathnameWithSearch));
      }

      return NextResponse.redirect(buildSurfaceUrl('www', pathnameWithSearch));
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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = applyRouteHeaders(NextResponse.next({
            request: {
              headers: request.headers,
            },
          }));

          const vercelEnv = process.env.VERCEL_ENV;
          const appEnv =
            process.env.APP_ENV ||
            (process.env.NEXT_PUBLIC_APP_URL?.includes('.run.app') ? 'preview' : undefined);

          const isVercelProd = vercelEnv === 'production';
          const isIframePreview = vercelEnv === 'preview' || appEnv === 'preview';
          const sameSiteAttribute: 'lax' | 'none' = isVercelProd ? 'lax' : (isIframePreview ? 'none' : 'lax');
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
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (path.startsWith('/dispatch')) {
    if (path === '/dispatch/login') {
      if (user) {
        return NextResponse.redirect(new URL('/dispatch/dashboard', request.url));
      }
      return response;
    }

    if (!user) {
      if (request.headers.get('next-action')) {
        return response;
      }
      return NextResponse.redirect(new URL('/dispatch/login', request.url));
    }
  }

  if (path.startsWith('/account') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
