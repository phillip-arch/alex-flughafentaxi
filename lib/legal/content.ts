export type LegalLocale = 'de' | 'en';
export type LegalSlug = 'agb' | 'datenschutz';

export type LegalSection = {
  title: string;
  body: string[];
};

export type LegalPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

const deContent: Record<LegalSlug, LegalPageContent> = {
  agb: {
    eyebrow: 'Rechtliches',
    title: 'AGB',
    intro:
      'Die vollständigen Allgemeinen Geschäftsbedingungen werden hier bereitgestellt. Senden Sie den finalen deutschen Text, dann ersetze ich diese Platzhalter direkt.',
    sections: [
      {
        title: 'Geltungsbereich',
        body: [
          'Dieser Platzhalter dient nur der technischen Vorbereitung der mehrsprachigen Rechtsseiten.',
        ],
      },
      {
        title: 'Leistungsbeschreibung',
        body: [
          'Nach Erhalt des finalen deutschen Inhalts wird diese Seite vollständig mit Ihren AGB befüllt.',
        ],
      },
    ],
  },
  datenschutz: {
    eyebrow: 'Rechtliches',
    title: 'Datenschutzerklärung',
    intro:
      'Die vollständige Datenschutzerklärung wird hier bereitgestellt. Senden Sie den finalen deutschen Text, dann ersetze ich diese Platzhalter direkt.',
    sections: [
      {
        title: 'Verarbeitung personenbezogener Daten',
        body: [
          'Dieser Platzhalter dient nur der technischen Vorbereitung der mehrsprachigen Rechtsseiten.',
        ],
      },
      {
        title: 'Zweck der Verarbeitung',
        body: [
          'Nach Erhalt des finalen deutschen Inhalts wird diese Seite vollständig mit Ihrer Datenschutzerklärung befüllt.',
        ],
      },
    ],
  },
};

const enContent: Record<LegalSlug, LegalPageContent> = {
  agb: {
    eyebrow: 'Legal',
    title: 'Terms and Conditions',
    intro:
      'The full terms and conditions will be provided here. Send the final English text later and I will replace these placeholders directly.',
    sections: [
      {
        title: 'Scope',
        body: ['This placeholder exists only to prepare the multilingual legal-page setup.'],
      },
      {
        title: 'Service description',
        body: ['Once the final English content is available, this page can be filled in directly.'],
      },
    ],
  },
  datenschutz: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro:
      'The full privacy policy will be provided here. Send the final English text later and I will replace these placeholders directly.',
    sections: [
      {
        title: 'Personal data processing',
        body: ['This placeholder exists only to prepare the multilingual legal-page setup.'],
      },
      {
        title: 'Purpose of processing',
        body: ['Once the final English content is available, this page can be filled in directly.'],
      },
    ],
  },
};

const legalContentByLocale: Record<LegalLocale, Record<LegalSlug, LegalPageContent>> = {
  de: deContent,
  en: enContent,
};

export function normalizeLegalLocale(lang?: string | null): LegalLocale {
  return String(lang || '').toLowerCase() === 'en' ? 'en' : 'de';
}

export function getLegalContent(slug: LegalSlug, lang?: string | null): LegalPageContent {
  const locale = normalizeLegalLocale(lang);
  return legalContentByLocale[locale][slug];
}
