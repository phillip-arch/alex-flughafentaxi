import { buildEmailLayout } from '@/lib/email/template';
import { formatDate, formatTime, formatPrice, formatAddress } from '@/lib/email/formatters';

export type PassengerReminderEmailInput = {
  fullName?: string | null;
  bookingReference?: string | null;
  pickup?: string | null;
  destination?: string | null;
  pickupAt?: string | null;
  vehicleType?: string | null;
  price?: number | null;
  flightNumber?: string | null;
  manageUrl?: string | null;
};

export function buildPassengerReminderEmailHtml(input: PassengerReminderEmailInput) {
  const passengerName = String(input.fullName || 'Gast');
  const bookingReference = String(input.bookingReference || '').trim();
  const flightNumber = String(input.flightNumber || '').trim();

  const infoRows = [
    ...(bookingReference ? [{ label: 'Buchungsnummer', value: bookingReference }] : []),
    { label: 'Abholung', value: formatAddress(input.pickup) },
    { label: 'Ziel', value: formatAddress(input.destination) },
    { label: 'Datum', value: formatDate(input.pickupAt) },
    { label: 'Uhrzeit', value: formatTime(input.pickupAt) },
    ...(input.vehicleType ? [{ label: 'Fahrzeug', value: String(input.vehicleType) }] : []),
    ...(flightNumber ? [{ label: 'Flugnummer', value: flightNumber }] : []),
    ...(input.price != null ? [{ label: 'Fixpreis', value: formatPrice(input.price) }] : []),
  ];

  return buildEmailLayout({
    eyebrow: 'Erinnerung',
    title: 'Ihre Fahrt steht bevor',
    subtitle: `Hallo ${passengerName}, dies ist eine kurze Erinnerung an Ihre bevorstehende Fahrt mit Alex Flughafentaxi. Ihr Fahrer ist puenktlich fuer Sie unterwegs. Der vereinbarte Fixpreis bleibt unveraendert.`,
    infoTitle: 'Ihre Fahrt',
    infoRows,
    ...(input.manageUrl
      ? { ctaLabel: 'Buchung ansehen oder stornieren', ctaHref: input.manageUrl }
      : {}),
    footerHtml: `
      <div style="margin-top:26px;text-align:center;">
        <p style="margin:0 auto;max-width:760px;font-size:14px;line-height:1.75;color:#5f6f82;">
          Aenderungen kurzfristig noetig? Rufen Sie uns an oder schreiben Sie per WhatsApp:
          <a href="tel:+436764826069" style="color:#1679ff;text-decoration:none;font-weight:700;">+43 676 482 60 69</a>
        </p>
      </div>
    `,
  });
}
