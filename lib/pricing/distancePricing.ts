import { supabaseAdmin } from '@/lib/supabase/admin';
import { type VehicleType } from '@/lib/pricing';

export type DistancePricingSettings = {
  id: string;
  enabled: boolean;
  airport_lat: number;
  airport_lng: number;
  base_fee: number;
  limo_per_km: number;
  kombi_per_km: number;
  bus_per_km: number;
  minimum_limo_price: number;
  minimum_kombi_price: number;
  minimum_bus_price: number;
  round_to: number;
  updated_at?: string | null;
};

export type DistancePriceEstimate = {
  distanceKm: number;
  durationMinutes: number | null;
  basePrice: number;
  prices: {
    limo: number;
    kombi: number;
    bus: number;
  };
};

const DEFAULT_SETTINGS: DistancePricingSettings = {
  id: 'default',
  enabled: true,
  airport_lat: 48.110278,
  airport_lng: 16.569722,
  base_fee: 18,
  limo_per_km: 1.7,
  kombi_per_km: 1.9,
  bus_per_km: 2.4,
  minimum_limo_price: 45,
  minimum_kombi_price: 50,
  minimum_bus_price: 65,
  round_to: 1,
};
const ROAD_DISTANCE_FACTOR = 1.25;
const ESTIMATED_AVERAGE_SPEED_KMH = 45;

function toFiniteNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toCoordinate(value: unknown) {
  if (value === null || value === undefined || value === '') return NaN;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : NaN;
}

function normalizeSettings(row: any): DistancePricingSettings {
  return {
    id: String(row?.id || DEFAULT_SETTINGS.id),
    enabled: row?.enabled !== false,
    airport_lat: toFiniteNumber(row?.airport_lat, DEFAULT_SETTINGS.airport_lat),
    airport_lng: toFiniteNumber(row?.airport_lng, DEFAULT_SETTINGS.airport_lng),
    base_fee: toFiniteNumber(row?.base_fee, DEFAULT_SETTINGS.base_fee),
    limo_per_km: toFiniteNumber(row?.limo_per_km, DEFAULT_SETTINGS.limo_per_km),
    kombi_per_km: toFiniteNumber(row?.kombi_per_km, DEFAULT_SETTINGS.kombi_per_km),
    bus_per_km: toFiniteNumber(row?.bus_per_km, DEFAULT_SETTINGS.bus_per_km),
    minimum_limo_price: toFiniteNumber(row?.minimum_limo_price, DEFAULT_SETTINGS.minimum_limo_price),
    minimum_kombi_price: toFiniteNumber(row?.minimum_kombi_price, DEFAULT_SETTINGS.minimum_kombi_price),
    minimum_bus_price: toFiniteNumber(row?.minimum_bus_price, DEFAULT_SETTINGS.minimum_bus_price),
    round_to: Math.max(0.01, toFiniteNumber(row?.round_to, DEFAULT_SETTINGS.round_to)),
    updated_at: row?.updated_at || null,
  };
}

export async function getDistancePricingSettings() {
  const { data, error } = await supabaseAdmin
    .from('distance_pricing_settings')
    .select('*')
    .eq('id', DEFAULT_SETTINGS.id)
    .maybeSingle();

  if (error) {
    console.error('Distance pricing settings lookup error:', error);
    return DEFAULT_SETTINGS;
  }

  return normalizeSettings(data || DEFAULT_SETTINGS);
}

function getGoogleMapsApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
}

function roundPrice(value: number, roundTo: number) {
  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(roundTo) || roundTo <= 0) return Math.ceil(value);
  return Math.ceil(value / roundTo) * roundTo;
}

function calculateVehicleDistancePrice(
  distanceKm: number,
  ratePerKm: number,
  minimumPrice: number,
  settings: DistancePricingSettings,
) {
  const rawPrice = Math.max(minimumPrice, settings.base_fee + distanceKm * ratePerKm);
  return roundPrice(rawPrice, settings.round_to);
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateEstimatedRoadDistance(input: {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}) {
  const earthRadiusKm = 6371;
  const latDelta = degreesToRadians(input.destinationLat - input.originLat);
  const lngDelta = degreesToRadians(input.destinationLng - input.originLng);
  const originLat = degreesToRadians(input.originLat);
  const destinationLat = degreesToRadians(input.destinationLat);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
  const directDistanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.max(0.1, directDistanceKm * ROAD_DISTANCE_FACTOR);

  return {
    distanceKm,
    durationMinutes: Math.max(1, Math.round((distanceKm / ESTIMATED_AVERAGE_SPEED_KMH) * 60)),
  };
}

async function fetchGoogleRouteDistanceKm(input: {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}) {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is missing.');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', `${input.originLat},${input.originLng}`);
  url.searchParams.set('destinations', `${input.destinationLat},${input.destinationLng}`);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Google distance lookup failed (${response.status}).`);
  }

  const payload = await response.json();
  const element = payload?.rows?.[0]?.elements?.[0];
  if (payload?.status !== 'OK' || element?.status !== 'OK') {
    throw new Error(`Google distance lookup returned ${element?.status || payload?.status || 'UNKNOWN'}.`);
  }

  const distanceMeters = Number(element?.distance?.value);
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) {
    throw new Error('Google distance lookup did not return a valid distance.');
  }

  const durationSeconds = Number(element?.duration?.value);
  return {
    distanceKm: distanceMeters / 1000,
    durationMinutes: Number.isFinite(durationSeconds) ? Math.round(durationSeconds / 60) : null,
  };
}

async function fetchGoogleGeocodedLocation(address: string) {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is missing.');
  }

  const normalizedAddress = address.trim();
  if (!normalizedAddress) {
    throw new Error('Address is required for distance pricing geocoding.');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', normalizedAddress);
  url.searchParams.set('region', 'at');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Google geocoding failed (${response.status}).`);
  }

  const payload = await response.json();
  const location = payload?.results?.[0]?.geometry?.location;
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (payload?.status !== 'OK' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`Google geocoding returned ${payload?.status || 'UNKNOWN'}.`);
  }

  return { lat, lng };
}

export async function calculateDistancePriceEstimate(input: {
  lat: number | null | undefined;
  lng: number | null | undefined;
  address?: string | null | undefined;
}) {
  let lat = toCoordinate(input.lat);
  let lng = toCoordinate(input.lng);

  const settings = await getDistancePricingSettings();
  if (!settings.enabled) {
    return null;
  }

  if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && input.address) {
    const location = await fetchGoogleGeocodedLocation(input.address);
    lat = location.lat;
    lng = location.lng;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  let distance: { distanceKm: number; durationMinutes: number | null };
  try {
    distance = await fetchGoogleRouteDistanceKm({
      originLat: lat,
      originLng: lng,
      destinationLat: settings.airport_lat,
      destinationLng: settings.airport_lng,
    });
  } catch (error) {
    console.error('Google route distance failed, using coordinate distance estimate:', error);
    distance = calculateEstimatedRoadDistance({
      originLat: lat,
      originLng: lng,
      destinationLat: settings.airport_lat,
      destinationLng: settings.airport_lng,
    });
  }

  const distanceKm = Math.round(distance.distanceKm * 10) / 10;
  const prices = {
    limo: calculateVehicleDistancePrice(distanceKm, settings.limo_per_km, settings.minimum_limo_price, settings),
    kombi: calculateVehicleDistancePrice(distanceKm, settings.kombi_per_km, settings.minimum_kombi_price, settings),
    bus: calculateVehicleDistancePrice(distanceKm, settings.bus_per_km, settings.minimum_bus_price, settings),
  };

  return {
    distanceKm,
    durationMinutes: distance.durationMinutes,
    basePrice: prices.limo,
    prices,
  } satisfies DistancePriceEstimate;
}

export function getDistancePriceForVehicle(estimate: DistancePriceEstimate, vehicleType: VehicleType) {
  if (vehicleType === 'Kombi') return estimate.prices.kombi;
  if (vehicleType === 'Bus') return estimate.prices.bus;
  return estimate.prices.limo;
}
