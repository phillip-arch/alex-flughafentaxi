import { NextRequest, NextResponse } from 'next/server';

const AERODATABOX_BASE_URL = 'https://prod.api.market/api/v1/aedbx/aerodatabox';
const FLIGHT_NUMBER_PATTERN = /^[A-Z0-9]{2,3}\d{1,4}[A-Z0-9]?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type AeroDataBoxAirport = {
  shortName?: string | null;
  municipalityName?: string | null;
  iata?: string | null;
  icao?: string | null;
};

type AeroDataBoxTime = {
  local?: string | null;
  utc?: string | null;
};

type AeroDataBoxFlight = {
  number?: string | null;
  departure?: {
    airport?: AeroDataBoxAirport | null;
  } | null;
  arrival?: {
    airport?: AeroDataBoxAirport | null;
    scheduledTime?: AeroDataBoxTime | null;
  } | null;
};

const normalizeFlightNumber = (flightNumber: string) => flightNumber.trim().toUpperCase().replace(/\s+/g, '');

const toDisplayTime = (value: string | null | undefined) => {
  if (!value) return null;

  const localTimeMatch = value.match(/T(\d{2}):(\d{2})/);
  if (localTimeMatch) {
    return `${localTimeMatch[1]}:${localTimeMatch[2]}`;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.toLocaleTimeString('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Vienna',
  });
};

const pickAirportDisplayName = (airport: AeroDataBoxAirport | null | undefined) => {
  const candidates = [
    airport?.shortName,
    airport?.municipalityName,
    airport?.iata,
    airport?.icao,
  ];

  for (const candidate of candidates) {
    const trimmedCandidate = String(candidate || '').trim();
    if (trimmedCandidate) {
      return trimmedCandidate;
    }
  }

  return null;
};

const findMatchingFlight = (flights: AeroDataBoxFlight[], flightNumber: string) => {
  const normalizedTarget = normalizeFlightNumber(flightNumber);

  return flights.find((flight) => normalizeFlightNumber(String(flight.number || '')) === normalizedTarget) ?? flights[0] ?? null;
};

export async function GET(request: NextRequest) {
  const flightNumber = normalizeFlightNumber(request.nextUrl.searchParams.get('flightNumber') || '');
  const date = request.nextUrl.searchParams.get('date') || '';

  if (!flightNumber || !FLIGHT_NUMBER_PATTERN.test(flightNumber)) {
    return NextResponse.json({ error: 'Invalid flight number.' }, { status: 400 });
  }

  if (!DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: 'Invalid date.' }, { status: 400 });
  }

  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Flight API key is missing.' }, { status: 500 });
  }

  const endpoint = `${AERODATABOX_BASE_URL}/flights/Number/${encodeURIComponent(flightNumber)}/${date}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        accept: 'application/json',
        'x-magicapi-key': apiKey,
      },
      cache: 'no-store',
    });

    if (response.status === 204) {
      return NextResponse.json({ error: 'Kein Flug mit dieser Nummer am gewaehlten Datum gefunden.' }, { status: 404 });
    }

    const payload = (await response.json().catch(() => null)) as AeroDataBoxFlight[] | AeroDataBoxFlight | null;

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Flugdaten konnten vom Anbieter nicht geladen werden.' },
        { status: response.status || 502 },
      );
    }

    const flights = Array.isArray(payload) ? payload : payload ? [payload] : [];
    const matchedFlight = findMatchingFlight(flights, flightNumber);

    if (!matchedFlight) {
      return NextResponse.json({ error: 'Kein Flug mit dieser Nummer am gewaehlten Datum gefunden.' }, { status: 404 });
    }

    const origin = pickAirportDisplayName(matchedFlight.departure?.airport);
    const scheduledArrivalTime = toDisplayTime(matchedFlight.arrival?.scheduledTime?.local ?? null);

    if (!origin || !scheduledArrivalTime) {
      return NextResponse.json(
        { error: 'Der Flug wurde gefunden, aber Herkunft oder planmaessige Landezeit fehlen.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      flightNumber,
      origin,
      displayFlightNumber: `${flightNumber} ${origin}`,
      scheduledArrivalTime,
    });
  } catch {
    return NextResponse.json(
      { error: 'Flugdaten konnten gerade nicht geladen werden.' },
      { status: 502 },
    );
  }
}
