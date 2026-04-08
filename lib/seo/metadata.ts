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
      title: 'Alex Flughafentaxi Wien | Ihr Transfer zum Flughafen Wien',
      description:
        'Buchen Sie Ihr Alex Flughafentaxi Wien zum garantierten Fixpreis. Sicherer Transfer, moderne Fahrzeuge und kostenlose Kindersitze. Jetzt einfach online oder telefonisch bestellen!',
    },
    en: {
      title: 'Alex Airport Taxi Vienna | Your transfer to Vienna Airport',
      description:
        'Book your Alex Airport Taxi Vienna at a guaranteed fixed price. Safe transfer, modern vehicles, and free child seats. Order online or by phone in just a few steps.',
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
