export type ChildSeatCounts = {
  baby: number;
  child: number;
  booster: number;
};

export type ParsedBookingNotes = {
  cleanedNotes: string;
  paymentLabel: string;
  childSeatInfo: string;
  intermediateStopInfo: string;
  flightNumberInfo: string;
  handLuggageCount: number;
  childSeatCounts: ChildSeatCounts;
};

const PAYMENT_TAG = /\(zahlung:\s*([^)]+)\)/i;
const CHILD_SEAT_TAG = /\(kindersitze:\s*([^)]+)\)/i;
const STOP_TAG = /\(zwischenstopp:\s*([^)]+)\)/i;
const FLIGHT_TAG = /\(flugnummer:\s*([^)]+)\)/i;
const HAND_LUGGAGE_TAG = /\(handgep(?:a|ä|Ã¤)e?ck:\s*(\d+)\)/i;

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function parseChildSeatCounts(info: string): ChildSeatCounts {
  const src = String(info || '');
  const baby = Number(src.match(/(\d+)\s*x\s*babyschale/i)?.[1] || 0);
  const child = Number(src.match(/(\d+)\s*x\s*kindersitz/i)?.[1] || 0);
  const booster = Number(src.match(/(\d+)\s*x\s*sitzerh(?:o|ö|Ã¶)hung/i)?.[1] || 0);
  return {
    baby: clamp(baby, 0, 9),
    child: clamp(child, 0, 9),
    booster: clamp(booster, 0, 9),
  };
}

export function parseBookingNotes(rawNotes: string | null | undefined): ParsedBookingNotes {
  const raw = String(rawNotes || '');
  const paymentLabel = raw.match(PAYMENT_TAG)?.[1]?.trim() || '';
  const childSeatInfo = raw.match(CHILD_SEAT_TAG)?.[1]?.trim() || '';
  const intermediateStopInfo = raw.match(STOP_TAG)?.[1]?.trim() || '';
  const flightNumberInfo = raw.match(FLIGHT_TAG)?.[1]?.trim() || '';
  const handLuggageCount = Number(raw.match(HAND_LUGGAGE_TAG)?.[1] || 0);

  const cleanedNotes = raw
    .replace(/\(zahlung:\s*[^)]*\)/gi, '')
    .replace(/\(kindersitze:\s*[^)]*\)/gi, '')
    .replace(/\(zwischenstopp:\s*[^)]*\)/gi, '')
    .replace(/\(flugnummer:\s*[^)]*\)/gi, '')
    .replace(/\(handgep(?:a|ä|Ã¤)e?ck:\s*[^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    cleanedNotes,
    paymentLabel,
    childSeatInfo,
    intermediateStopInfo,
    flightNumberInfo,
    handLuggageCount: clamp(handLuggageCount, 0, 99),
    childSeatCounts: parseChildSeatCounts(childSeatInfo),
  };
}

export function composeBookingNotes(input: {
  baseNotes?: string;
  flightNumber?: string;
  intermediateStop?: string;
  childSeatCounts?: Partial<ChildSeatCounts>;
  paymentMethod?: 'cash' | 'card' | 'voucher' | 'free' | null;
  handLuggageCount?: number;
}) {
  const baseParsed = parseBookingNotes(input.baseNotes || '');
  const base = baseParsed.cleanedNotes;
  const counts = {
    baby: clamp(Number(input.childSeatCounts?.baby || 0), 0, 9),
    child: clamp(Number(input.childSeatCounts?.child || 0), 0, 9),
    booster: clamp(Number(input.childSeatCounts?.booster || 0), 0, 9),
  };

  const childSeatLabel = [
    counts.baby > 0 ? `${counts.baby}x Babyschale` : '',
    counts.child > 0 ? `${counts.child}x Kindersitz` : '',
    counts.booster > 0 ? `${counts.booster}x Sitzerhöhung` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return [
    base,
    input.flightNumber?.trim() ? `(Flugnummer: ${input.flightNumber.trim()})` : '',
    input.intermediateStop?.trim() ? `(Zwischenstopp: ${input.intermediateStop.trim()})` : '',
    childSeatLabel ? `(Kindersitze: ${childSeatLabel})` : '',
    input.paymentMethod
      ? `(Zahlung: ${
          input.paymentMethod === 'cash'
            ? 'Barzahlung'
            : input.paymentMethod === 'card'
              ? 'Kreditkarte'
              : input.paymentMethod === 'voucher'
                ? 'Lieferschein'
                : 'Gratis'
        })`
      : '',
    Number(input.handLuggageCount || 0) > 0 ? `(Handgepäck: ${Number(input.handLuggageCount)})` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
