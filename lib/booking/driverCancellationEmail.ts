import { buildEmailLayout } from '@/lib/email/template';
import { formatDate, formatTime, formatPrice, formatAddress } from '@/lib/email/formatters';

export type DriverCancellationEmailInput = {
  driverName?: string | null;
  pickup?: string | null;
  destination?: string | null;
  pickupAt?: string | null;
  vehicleType?: string | null;
  price?: number | null;
};

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
