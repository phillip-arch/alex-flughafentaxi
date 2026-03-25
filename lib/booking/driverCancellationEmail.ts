import { buildEmailLayout } from '@/lib/email/template';

export type DriverCancellationEmailInput = {
  driverName?: string | null;
  pickup?: string | null;
  destination?: string | null;
  pickupAt?: string | null;
  vehicleType?: string | null;
  price?: number | null;
};

function formatDate(value?: string | null) {
  const parsed = new Date(String(value || ''));
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

function formatTime(value?: string | null) {
  const parsed = new Date(String(value || ''));
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
}

function formatPrice(value?: number | null) {
  return new Intl.NumberFormat('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatAddress(value?: string | null) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(.*?),\s*(\d{4}\s+.+)$/);
  if (!match) return raw;
  return `${match[1]}\n${match[2]}`;
}

export function buildDriverCancellationEmailHtml(input: DriverCancellationEmailInput) {
  const driverName = String(input.driverName || 'Fahrer');
  const pickup = formatAddress(input.pickup);
  const destination = formatAddress(input.destination);
  const vehicle = String(input.vehicleType || '-');
  const formattedDate = formatDate(input.pickupAt);
  const formattedTime = formatTime(input.pickupAt);
  const formattedPrice = formatPrice(input.price);

  return buildEmailLayout({
    eyebrow: 'Stornierung',
    title: 'Fahrt storniert',
    subtitle: `Hallo ${driverName}, diese zugewiesene Fahrt wurde storniert.`,
    infoTitle: 'Fahrtinformationen',
    infoRows: [
      { label: 'Abholung', value: pickup },
      { label: 'Ziel', value: destination },
      { label: 'Datum', value: formattedDate },
      { label: 'Uhrzeit', value: formattedTime },
      { label: 'Fahrzeug', value: vehicle },
      { label: 'Preis', value: `${formattedPrice} EUR` },
    ],
  });
}
