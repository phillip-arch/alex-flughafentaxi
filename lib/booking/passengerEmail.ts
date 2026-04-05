import { buildEmailLayout } from '@/lib/email/template';

type PassengerBaseEmailInput = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  bookingReference?: string | null;
  pickup?: string | null;
  destination?: string | null;
  pickupAt?: string | null;
  vehicleType?: string | null;
  price?: number | null;
};

export type PassengerCancellationEmailInput = PassengerBaseEmailInput;

export type PassengerConfirmationEmailInput = PassengerBaseEmailInput & {
  passengers?: number | null;
  luggage?: number | null;
  handLuggage?: string | null;
  paymentLabel?: string | null;
  flightNumber?: string | null;
  childSeatInfo?: string | null;
  intermediateStopInfo?: string | null;
  notes?: string | null;
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildContactButtonsHtml() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto 0 auto;text-align:center;">
      <tr>
        <td style="padding:0 10px 10px 10px;text-align:center;">
          <a href="tel:+436764826069" aria-label="Anrufen" style="display:inline-block;text-decoration:none;">
            <img src="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/phone.png" alt="Anrufen" width="72" height="72" style="display:block;width:72px;height:72px;border:0;outline:none;text-decoration:none;" />
          </a>
        </td>
        <td style="padding:0 10px 10px 10px;text-align:center;">
          <a href="https://wa.me/436764826069" aria-label="WhatsApp" style="display:inline-block;text-decoration:none;">
            <img src="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/whatsapp.png" alt="WhatsApp" width="72" height="72" style="display:block;width:72px;height:72px;border:0;outline:none;text-decoration:none;" />
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 10px;text-align:center;font-size:13px;line-height:1.4;">
          <a href="tel:+436764826069" style="color:#1679ff;text-decoration:none;font-weight:600;">Anrufen</a>
        </td>
        <td style="padding:0 10px;text-align:center;font-size:13px;line-height:1.4;">
          <a href="https://wa.me/436764826069" style="color:#25d366;text-decoration:none;font-weight:600;">WhatsApp</a>
        </td>
      </tr>
    </table>
  `;
}

function buildPassengerCancellationInfoRows(input: PassengerCancellationEmailInput) {
  const bookingReference = String(input.bookingReference || '').trim();
  const pickup = formatAddress(input.pickup);
  const destination = formatAddress(input.destination);
  const vehicle = String(input.vehicleType || '-');
  const formattedDate = formatDate(input.pickupAt);
  const formattedTime = formatTime(input.pickupAt);
  const formattedPrice = formatPrice(input.price);

  return [
    ...(bookingReference ? [{ label: 'Buchungsnummer', value: bookingReference }] : []),
    { label: 'Abholung', value: pickup },
    { label: 'Ziel', value: destination },
    { label: 'Datum', value: formattedDate },
    { label: 'Uhrzeit', value: formattedTime },
    { label: 'Fahrzeug', value: vehicle },
    { label: 'Preis', value: `${formattedPrice} EUR` },
  ];
}

function buildTwoColumnRow(left: string, right: string) {
  return `
    <tr>
      <td style="width:50%;padding:0 12px 14px 0;font-size:16px;line-height:1.7;color:#111827;vertical-align:top;">${left || '&nbsp;'}</td>
      <td style="width:50%;padding:0 0 14px 12px;font-size:16px;line-height:1.7;color:#111827;vertical-align:top;">${right || '&nbsp;'}</td>
    </tr>
  `;
}

function buildPassengerConfirmationContent(
  input: Omit<PassengerConfirmationEmailInput, 'passengers' | 'luggage'> & {
    passengers?: number | string | null;
    luggage?: number | string | null;
  },
) {
  const fullName = String(input.fullName || '').trim();
  const email = String(input.email || '').trim();
  const phone = String(input.phone || '').trim();
  const bookingReference = String(input.bookingReference || '').trim();
  const pickup = String(input.pickup || '').trim();
  const destination = String(input.destination || '').trim();
  const formattedDate = formatDate(input.pickupAt);
  const formattedTime = formatTime(input.pickupAt);
  const vehicle = String(input.vehicleType || '-');
  const passengers = String(input.passengers ?? '-');
  const luggage = String(input.luggage ?? '-');
  const handLuggage = String(input.handLuggage || '0');
  const paymentLabel = String(input.paymentLabel || '').trim();
  const flightNumber = String(input.flightNumber || '').trim();
  const childSeatInfo = String(input.childSeatInfo || '').trim();
  const intermediateStopInfo = String(input.intermediateStopInfo || '').trim();
  const notes = String(input.notes || '').trim();
  const formattedPrice = formatPrice(input.price);
  const isFromAirport = /flughafen/i.test(pickup);
  const directionLabel = isFromAirport ? 'Vom Flughafen' : 'Zum Flughafen';

  const passengerRows = [
    buildTwoColumnRow(
      fullName ? `<strong>Name:</strong> ${escapeHtml(fullName)}` : '',
      phone ? `<strong>Telefon:</strong> ${escapeHtml(phone)}` : '',
    ),
    buildTwoColumnRow(
      email ? `<strong>E-Mail:</strong> ${escapeHtml(email)}` : '',
      bookingReference ? `<strong>Buchungsnummer:</strong> ${escapeHtml(bookingReference)}` : '',
    ),
  ].join('');

  const tripRows = [
    buildTwoColumnRow(
      `<strong>Abholung:</strong> ${escapeHtml(pickup)}`,
      `<strong>Ziel:</strong> ${escapeHtml(destination)}`,
    ),
    ...(flightNumber ? [buildTwoColumnRow(`<strong>Flugnummer:</strong> ${escapeHtml(flightNumber)}`, '')] : []),
    buildTwoColumnRow(
      `<strong>Datum:</strong> ${escapeHtml(formattedDate)}`,
      `<strong>Uhrzeit:</strong> ${escapeHtml(formattedTime)}`,
    ),
    buildTwoColumnRow(
      `<strong>Fahrzeug:</strong> ${escapeHtml(vehicle)}`,
      `<strong>Personen:</strong> ${escapeHtml(passengers)}`,
    ),
    buildTwoColumnRow(
      `<strong>Koffer:</strong> ${escapeHtml(luggage)}`,
      `<strong>Handgepaeck:</strong> ${escapeHtml(handLuggage)}`,
    ),
  ].join('');

  return `
    <div style="margin-top:22px;">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#1679ff;font-weight:700;text-align:left;padding-bottom:18px;">
        Passagier
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:760px;margin:0 auto;">
        ${passengerRows}
      </table>

      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#1679ff;font-weight:700;text-align:left;padding:28px 0 18px 0;">
        Fahrt
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:760px;margin:0 auto;">
        ${tripRows}
      </table>

      ${childSeatInfo || intermediateStopInfo || notes ? `
        <div style="max-width:760px;margin:24px auto 0 auto;border:1px solid #e7edf5;border-radius:24px;padding:22px 18px 10px 18px;text-align:left;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8b95a7;font-weight:700;padding-bottom:10px;">
            Zusatzinformationen
          </div>
          ${childSeatInfo ? `<p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;color:#111827;"><strong>Kindersitze:</strong> ${escapeHtml(childSeatInfo)}</p>` : ''}
          ${intermediateStopInfo ? `<p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;color:#111827;"><strong>Zwischenstopp:</strong> ${escapeHtml(intermediateStopInfo)}</p>` : ''}
          ${notes ? `<p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;color:#111827;"><strong>Anmerkung:</strong> ${escapeHtml(notes)}</p>` : ''}
        </div>
      ` : ''}

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:760px;margin:26px auto 0 auto;background:#ffffff;border-radius:24px;">
        <tr>
          <td style="width:50%;padding:18px 10px 18px 10px;text-align:center;vertical-align:top;">
            <div style="font-size:18px;line-height:1;color:#8b8b90;margin-bottom:8px;">____</div>
            <div style="font-size:15px;color:#111827;font-weight:700;line-height:1.3;">${escapeHtml(directionLabel)}</div>
          </td>
          <td style="width:50%;padding:18px 10px 18px 10px;text-align:center;vertical-align:top;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8b95a7;font-weight:700;margin-bottom:8px;">Gesamtpreis</div>
            <div style="font-size:26px;line-height:1;color:#111827;font-weight:700;letter-spacing:-0.03em;">${escapeHtml(formattedPrice)} EUR</div>
            ${paymentLabel ? `<div style="margin-top:10px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1c2d52;">${escapeHtml(paymentLabel)}</div>` : ''}
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function buildPassengerCancellationEmailHtml(input: PassengerCancellationEmailInput) {
  const passengerName = String(input.fullName || 'Gast');

  return buildEmailLayout({
    eyebrow: 'Stornierung',
    title: 'Ihre Fahrt wurde storniert',
    subtitle: `Hallo ${passengerName}, Ihre Buchung wurde erfolgreich storniert. Falls Sie eine neue Fahrt benoetigen, koennen Sie jederzeit erneut buchen oder unser Team direkt kontaktieren.`,
    infoTitle: 'Fahrtinformationen',
    infoRows: buildPassengerCancellationInfoRows(input),
    ctaLabel: 'Neu Fahrt buchen',
    ctaHref: 'https://flughafentaxi-wien.at/book',
  });
}

export function buildPassengerConfirmationEmailHtml(input: PassengerConfirmationEmailInput) {
  const passengerName = String(input.fullName || 'Gast');
  const paymentLabel = String(input.paymentLabel || '').trim();
  const childSeatInfo = String(input.childSeatInfo || '').trim();
  const intermediateStopInfo = String(input.intermediateStopInfo || '').trim();
  const notes = String(input.notes || '').trim();
  const footerHtml = `
    <div style="margin-top:26px;text-align:center;">
      <p style="margin:0 auto 18px auto;max-width:760px;font-size:15px;line-height:1.75;color:#5f6f82;">
        Diese E-Mail dient als Bestaetigung Ihrer Buchungsanfrage.
      </p>
      <div style="display:inline-block;width:100%;max-width:720px;text-align:left;">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#1679ff;font-weight:700;text-align:center;padding-bottom:14px;">
          Aenderungen &amp; Stornierungen
        </div>
        <p style="margin:0 0 12px 0;font-size:14px;line-height:1.75;color:#111827;">
          Fuer Fahrten bis 22:00 Uhr:<br/>
          Aenderungen oder Stornierungen sind bis spaetestens 3 Stunden vor Abholzeit moeglich.
        </p>
        <p style="margin:0 0 12px 0;font-size:14px;line-height:1.75;color:#111827;">
          Fuer Fahrten zwischen 22:00 und 07:00 Uhr:<br/>
          Aenderungen oder Stornierungen sind mindestens 8 Stunden vor Abholzeit erforderlich.
        </p>
        <p style="margin:0 0 12px 0;font-size:14px;line-height:1.75;color:#111827;text-align:center;">
          Weitere Details finden Sie hier:<br/>
          <a href="https://flughafentaxi-wien.at/faq" style="color:#1679ff;text-decoration:none;font-weight:700;">FAQ</a>
        </p>
        <p style="margin:0;font-size:14px;line-height:1.75;color:#111827;text-align:center;">
          Fragen zur Buchung?<br/>
          Sie koennen Ihren Flughafentransfer bequem online buchen. Falls Sie lieber direkt sprechen oder schnell Hilfe brauchen, sind wir per Telefon und WhatsApp sofort erreichbar.
        </p>
        ${buildContactButtonsHtml()}
      </div>
    </div>
  `;

  return buildEmailLayout({
    eyebrow: 'Buchungsbestaetigung',
    title: 'Vielen Dank fuer Ihre Buchung',
    subtitle: `Hallo ${passengerName}, Ihre Buchungsanfrage wurde erfolgreich uebermittelt. Hier finden Sie Ihre Buchungsdaten im Ueberblick.`,
    contentHtml: buildPassengerConfirmationContent({
      ...input,
      passengers: String(input.passengers ?? '-'),
      luggage: String(input.luggage ?? '-'),
      handLuggage: String(input.handLuggage || '0'),
      paymentLabel,
      childSeatInfo,
      intermediateStopInfo,
      notes,
    }),
    footerHtml,
  });
}
