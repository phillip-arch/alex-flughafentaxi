export type AppSurface = 'www' | 'app' | 'dispatch';

const DEFAULT_LOCAL_URL = 'http://localhost:3000';

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  const raw = (value || fallback).trim();
  return raw.replace(/\/+$/, '');
}

export function getAppSurface(): AppSurface {
  const rawSurface = String(process.env.APP_SURFACE || 'www').toLowerCase();
  if (rawSurface === 'app' || rawSurface === 'dispatch') {
    return rawSurface;
  }
  return 'www';
}

export function getPublicWebUrl() {
  return normalizeBaseUrl(process.env.PUBLIC_WEB_URL, DEFAULT_LOCAL_URL);
}

export function getPublicAppUrl() {
  return normalizeBaseUrl(
    process.env.PUBLIC_APP_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL,
    DEFAULT_LOCAL_URL,
  );
}

export function getPublicDispatchUrl() {
  return normalizeBaseUrl(process.env.PUBLIC_DISPATCH_URL, DEFAULT_LOCAL_URL);
}

export function getSurfaceBaseUrl(surface: AppSurface) {
  if (surface === 'app') return getPublicAppUrl();
  if (surface === 'dispatch') return getPublicDispatchUrl();
  return getPublicWebUrl();
}

export function buildSurfaceUrl(surface: AppSurface, pathnameWithSearch = '/') {
  return new URL(pathnameWithSearch, `${getSurfaceBaseUrl(surface)}/`);
}

export function isCustomerAppPath(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password' ||
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    pathname === '/auth/callback' ||
    pathname.startsWith('/auth/callback/')
  );
}

export function isDispatchPath(pathname: string) {
  return pathname === '/dispatch' || pathname.startsWith('/dispatch/');
}
