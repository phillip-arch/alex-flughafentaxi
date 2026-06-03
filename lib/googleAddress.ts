export type ParsedGoogleAddress = {
  formattedAddress: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
};

type GoogleAddressComponent = {
  long_name?: string;
  short_name?: string;
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GoogleLocation = {
  lat?: number | (() => number);
  lng?: number | (() => number);
  latitude?: number;
  longitude?: number;
};

type GooglePlaceLike = {
  address_components?: GoogleAddressComponent[];
  addressComponents?: GoogleAddressComponent[];
  formatted_address?: string;
  formattedAddress?: string;
  geometry?: {
    location?: GoogleLocation;
  };
  location?: GoogleLocation;
  place_id?: string;
  id?: string;
};

function getComponent(place: GooglePlaceLike, type: string) {
  const components = place.address_components || place.addressComponents || [];
  const component = components.find((item) => item.types?.includes(type));
  return component?.long_name || component?.longText || '';
}

function getShortComponent(place: GooglePlaceLike, type: string) {
  const components = place.address_components || place.addressComponents || [];
  const component = components.find((item) => item.types?.includes(type));
  return component?.short_name || component?.shortText || '';
}

function readCoordinate(value?: number | (() => number)) {
  if (typeof value === 'function') return value();
  return typeof value === 'number' ? value : null;
}

function readLocationCoordinate(
  location: GoogleLocation | undefined,
  shortKey: 'lat' | 'lng',
  longKey: 'latitude' | 'longitude',
) {
  return readCoordinate(location?.[shortKey]) ?? readCoordinate(location?.[longKey]);
}

export function normalizeZip(zip: string) {
  return zip.replace(/\s+/g, '').trim();
}

export function normalizeCity(city: string) {
  const value = city.trim().toLowerCase();
  const asciiValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const map: Record<string, string> = {
    vienna: 'wien',
    wien: 'wien',
    'bratislava-staré mesto': 'bratislava',
    'bratislava-stare mesto': 'bratislava',
  };

  return map[value] || map[asciiValue] || value;
}

export function parseGoogleAddress(place: GooglePlaceLike): ParsedGoogleAddress {
  const streetNumber = getComponent(place, 'street_number');
  const route = getComponent(place, 'route');
  const postalCode = getComponent(place, 'postal_code');
  const city =
    getComponent(place, 'locality') ||
    getComponent(place, 'postal_town') ||
    getComponent(place, 'administrative_area_level_2') ||
    getComponent(place, 'administrative_area_level_1');
  const countryCode = getShortComponent(place, 'country');
  const location = place.geometry?.location || place.location;

  return {
    formattedAddress: place.formatted_address || place.formattedAddress || '',
    street: route,
    houseNumber: streetNumber,
    zip: normalizeZip(postalCode),
    city: normalizeCity(city),
    country: countryCode,
    lat: readLocationCoordinate(location, 'lat', 'latitude'),
    lng: readLocationCoordinate(location, 'lng', 'longitude'),
    placeId: place.place_id || place.id || '',
  };
}

export function buildPriceLookupKey(zip: string, city: string, vehicleType: string) {
  return `${normalizeZip(zip)}-${normalizeCity(city)}-${vehicleType}`;
}
