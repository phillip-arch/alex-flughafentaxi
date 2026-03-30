export type FavoriteLabel = 'home' | 'office' | 'extra';

export type StreetOption = {
  id?: string;
  street: string;
  zip: string;
  city: string;
};

export type FavoriteAddressRecord = {
  id: string;
  city: string;
  zip: string;
  street: string;
  house_number: string;
  label: FavoriteLabel | null;
};

export const FAVORITE_LABEL_ORDER: FavoriteLabel[] = ['home', 'office', 'extra'];

export function getFavoriteLabelTitle(label: FavoriteLabel) {
  if (label === 'home') return 'Home';
  if (label === 'office') return 'Office';
  return 'Extra';
}

export function buildStreetOptionValue(street: string, zip: string, city: string) {
  return [zip && city ? `${zip} ${city}` : zip || city, street].filter(Boolean).join(', ');
}

export function formatAddressLine(
  street: string,
  houseNumber: string,
  zip: string,
  city: string,
) {
  const streetLine = [street, houseNumber].filter(Boolean).join(' ').trim();
  const cityLine = [zip, city].filter(Boolean).join(' ').trim();
  return [streetLine, cityLine].filter(Boolean).join(', ').trim();
}

export function findStreetOptionByValue(
  value: string,
  streetOptions: StreetOption[],
) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  return (
    streetOptions.find(
      (option) =>
        buildStreetOptionValue(option.street, option.zip, option.city).toLowerCase() === normalized,
    ) || null
  );
}

export function parseStructuredAddress(value: string) {
  const raw = value.trim().replace(/\s+/g, ' ');
  if (!raw) {
    return null;
  }

  const match = raw.match(/^(.*?)\s+([^,\s]+)\s*,\s*(\d{4})\s+(.+)$/);
  if (!match) {
    return null;
  }

  return {
    street: match[1].trim(),
    houseNumber: match[2].trim(),
    zip: match[3].trim(),
    city: match[4].trim(),
  };
}

export function sortFavoriteAddresses<T extends { label?: FavoriteLabel | null }>(favorites: T[]) {
  return [...favorites].sort((a, b) => {
    const aIndex = a.label ? FAVORITE_LABEL_ORDER.indexOf(a.label) : Number.MAX_SAFE_INTEGER;
    const bIndex = b.label ? FAVORITE_LABEL_ORDER.indexOf(b.label) : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}
