import { headers } from 'next/headers';

function getHost(u: string | undefined) {
  if (!u) return null;
  try {
    // Handle URLs with or without protocol
    if (!u.startsWith('http')) {
      u = `https://${u}`;
    }
    return new URL(u).host;
  } catch {
    return null;
  }
}

export async function requireSameOrigin() {
  const h = await headers();

  const origin = h.get('origin'); // present for most browser POSTs
  const host = h.get('host');     // always present

  // Determine expected host from environment variables
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  const expectedHost = getHost(appUrl);

  // If we don't know expected host (misconfigured env), fail closed in production
  if (!expectedHost && process.env.VERCEL_ENV === 'production') {
    throw new Error('Server misconfiguration: APP_URL is not set');
  }

  // In dev/preview without explicit APP_URL, we might be more lenient or rely on Host header matching
  // But for security, we should try to validate.
  
  // Allow Vercel Preview URLs dynamically if in preview environment
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.APP_ENV === 'preview';
  
  // Helper to check if a host is allowed
  const isAllowedHost = (checkHost: string) => {
    if (!checkHost) return false;
    
    // 1. Exact match with expected host
    if (expectedHost && checkHost === expectedHost) return true;
    
    // 2. Allow localhost in development
    if (process.env.NODE_ENV !== 'production' && (checkHost.startsWith('localhost') || checkHost.startsWith('127.0.0.1'))) {
      return true;
    }

    // 3. Allow Vercel preview domains in preview environment
    if (isPreview && checkHost.endsWith('.vercel.app')) {
      return true;
    }
    
    // 4. Allow AI Studio preview domains (run.app) - ONLY in preview/dev
    if (isPreview && checkHost.endsWith('.run.app')) {
      return true;
    }

    return false;
  };

  const originHost = origin ? getHost(origin) : null;

  // Prefer Origin check when available (standard for POST/mutations)
  if (originHost) {
    if (!isAllowedHost(originHost)) {
      console.error(`CSRF blocked: invalid origin. Got: ${originHost}, Expected: ${expectedHost} or allowed patterns.`);
      throw new Error('CSRF blocked: invalid origin');
    }
    return;
  }

  // Fallback: if Origin missing (rare for POST but possible), check Host header
  // The Host header is set by the client but verified by the server/proxy.
  if (host) {
    if (!isAllowedHost(host)) {
      console.error(`CSRF blocked: invalid host. Got: ${host}, Expected: ${expectedHost} or allowed patterns.`);
      throw new Error('CSRF blocked: invalid host');
    }
    return;
  }
  
  // If neither Origin nor Host is present, block (safe default)
  throw new Error('CSRF blocked: missing origin and host headers');
}
