type IcsBookingInput = {
  bookingReference: string;
  pickup: string;
  destination: string;
  pickupAt: string; // ISO string / timestamptz
  price?: number | null;
  durationMinutes?: number | null;
};

function toIcsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** RFC 5545 lines must be <= 75 octets; fold with CRLF + space. */
function foldLine(line: string) {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ' ' + rest.slice(74);
  }
  parts.push(rest);
  return parts.join('\r\n');
}

/**
 * Builds an .ics calendar invite for a booking. Attach to the confirmation
 * email so passengers get the pickup in their calendar with one tap.
 */
export function buildBookingIcs(input: IcsBookingInput): string {
  const start = new Date(input.pickupAt);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Invalid pickupAt for ICS generation');
  }
  const durationMinutes =
    Number.isFinite(input.durationMinutes) && (input.durationMinutes as number) > 0
      ? (input.durationMinutes as number)
      : 60;
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const summary = `Flughafentaxi: ${input.pickup} -> ${input.destination}`;
  const descriptionParts = [
    `Buchungsnummer: ${input.bookingReference}`,
    input.price != null ? `Fixpreis: EUR ${input.price}` : '',
    'Alex Flughafentaxi Wien',
    'Tel/WhatsApp: +43 676 482 60 69',
  ].filter(Boolean);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alex Flughafentaxi Wien//Booking//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(input.bookingReference)}@flughafentaxi-wien.at`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(descriptionParts.join('\n'))}`,
    `LOCATION:${escapeIcsText(input.pickup)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Flughafentaxi Abholung in 2 Stunden',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join('\r\n');
}
