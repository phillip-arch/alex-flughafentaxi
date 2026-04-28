import type { Metadata } from 'next';

export type SiteLocale = 'de' | 'en';
export type MetadataKey = 'home' | 'agb' | 'datenschutz';

type LocalizedMetadataEntry = {
  title: string;
  description?: string;
};

const localizedMetadata: Record<MetadataKey, Record<SiteLocale, LocalizedMetadataEntry>> = {
  home: {
    de: {
      title: 'Flughafentaxi Wien | Fixpreis Transfer zum Flughafen Wien (VIE)',
      description:
        'Flughafentaxi Wien zum garantierten Fixpreis — zuverlässiger Transfer zum und vom Flughafen Wien (VIE), 24/7. Keine versteckten Gebühren, Flugüberwachung inklusive. Jetzt online buchen!',
    },
    en: {
      title: 'Vienna Airport Taxi | Fixed Price Taxi to & from Vienna Airport (VIE)',
      description:
        'Book a Vienna airport taxi at a guaranteed fixed price. Reliable taxi to Vienna Airport and from Vienna Airport (VIE), available 24/7. Flight tracking included, no hidden fees — sedan, station wagon and minivan available.',
    },
  },
  agb: {
    de: {
      title: 'AGB',
    },
    en: {
      title: 'Terms and Conditions',
    },
  },
  datenschutz: {
    de: {
      title: 'Datenschutzerklärung',
    },
    en: {
      title: 'Privacy Policy',
    },
  },
};

export function normalizeSiteLocale(lang?: string | null): SiteLocale {
  return String(lang || '').toLowerCase() === 'en' ? 'en' : 'de';
}

export function getLocalizedMetadata(
  key: MetadataKey,
  lang?: string | null,
): LocalizedMetadataEntry {
  const locale = normalizeSiteLocale(lang);
  return localizedMetadata[key][locale];
}

export function buildAbsoluteMetadata(
  key: MetadataKey,
  lang?: string | null,
): Metadata {
  const entry = getLocalizedMetadata(key, lang);

  return {
    title: {
      absolute: entry.title,
    },
    ...(entry.description ? { description: entry.description } : {}),
  };
}
