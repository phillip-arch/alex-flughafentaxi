const SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateSafeReference(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += SAFE_CHARS.charAt(Math.floor(Math.random() * SAFE_CHARS.length));
  }
  return result;
}

export function normalizeBookingReference(reference?: string | null): string {
  if (!reference) return '';
  return reference.replace(/^TEST-/i, '');
}
