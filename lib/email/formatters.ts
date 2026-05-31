export function formatDate(value?: string | null): string {
  const parsed = new Date(String(value || ''));
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export function formatTime(value?: string | null): string {
  const parsed = new Date(String(value || ''));
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
}

export function formatPrice(value?: number | null): string {
  if (value === null || value === undefined) return 'Price on request';

  return new Intl.NumberFormat('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatAddress(value?: string | null): string {
  const raw = String(value || '').trim();
  const match = raw.match(/^(.*?),\s*(\d{4}\s+.+)$/);
  if (!match) return raw;
  return `${match[1]}\n${match[2]}`;
}

export function formatDateTime(value: string): { date: string; time: string } {
  return { date: formatDate(value), time: formatTime(value) };
}
