export type LegalLocale = 'de' | 'en';
export type LegalSlug = 'agb' | 'datenschutz';

type LegalParagraphBlock = {
  type: 'paragraph';
  text: string;
};

type LegalListBlock = {
  type: 'list';
  items: string[];
};

type LegalSubheadingBlock = {
  type: 'subheading';
  text: string;
};

type LegalContactBlock = {
  type: 'contact';
  name: string;
  location: string;
  email: string;
};

export type LegalBlock =
  | LegalParagraphBlock
  | LegalListBlock
  | LegalSubheadingBlock
  | LegalContactBlock;

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalPageContent = {
  eyebrow: string;
  title: string;
  intro?: string;
  sections: LegalSection[];
};

const deContent: Record<LegalSlug, LegalPageContent> = {
  agb: {
    eyebrow: 'Rechtliches',
    title: 'Allgemeine Geschaeftsbedingungen (AGB)',
    sections: [
      {
        title: 'Alex Flughafentaxi OG',
        blocks: [
          {
            type: 'contact',
            name: 'Alex Flughafentaxi OG',
            location: 'Wien, Oesterreich',
            email: 'info@flughafentaxi-wien-alex.at',
          },
        ],
      },
      {
        title: '1. Geltungsbereich',
        blocks: [
          {
            type: 'paragraph',
            text: 'Diese Allgemeinen Geschaeftsbedingungen gelten fuer alle Buchungen und Leistungen der Alex Flughafentaxi OG (nachfolgend "Unternehmen").',
          },
          {
            type: 'paragraph',
            text: 'Das Unternehmen erbringt ausschliesslich vorab gebuchte Flughafentransfers.',
          },
        ],
      },
      {
        title: '2. Buchung und Vertragsabschluss',
        blocks: [
          {
            type: 'paragraph',
            text: 'Buchungen ueber Website, Telefon oder Messenger-Dienste (z. B. WhatsApp) gelten zunaechst als unverbindliche Anfrage.',
          },
          {
            type: 'paragraph',
            text: 'Ein Vertrag kommt erst zustande, wenn die Buchung durch das Unternehmen ausdruecklich bestaetigt wird (z. B. per E-Mail oder SMS).',
          },
        ],
      },
      {
        title: '3. Mindestvorlaufzeit fuer Buchungen',
        blocks: [
          {
            type: 'list',
            items: [
              'Fahrten zwischen 22:00 und 07:00 Uhr muessen mindestens 8 Stunden im Voraus gebucht werden',
              'Fahrten zwischen 07:00 und 22:00 Uhr (am selben Tag) muessen mindestens 3 Stunden im Voraus gebucht werden',
            ],
          },
          {
            type: 'paragraph',
            text: 'Das Unternehmen behaelt sich vor, Anfragen ausserhalb dieser Fristen abzulehnen.',
          },
        ],
      },
      {
        title: '4. Preise und Leistungen',
        blocks: [
          {
            type: 'paragraph',
            text: 'Alle Preise sind Fixpreise, die im Rahmen der Buchung vereinbart werden.',
          },
          {
            type: 'subheading',
            text: 'Im Preis enthalten',
          },
          {
            type: 'list',
            items: [
              'Mautgebuehren',
              'Parkplatzkosten am Flughafen (bei gebuchtem Meet & Greet)',
              'Kindersitze',
            ],
          },
          {
            type: 'subheading',
            text: 'Zusatzleistungen',
          },
          {
            type: 'list',
            items: [
              'Meet & Greet (optional)',
              'Wartezeit ueber die inkludierte Dauer hinaus',
              'Sonderleistungen oder Abweichungen von der Buchung',
            ],
          },
          {
            type: 'paragraph',
            text: 'Es fallen keine versteckten Kosten an.',
          },
        ],
      },
      {
        title: '5. Gepaeck',
        blocks: [
          {
            type: 'paragraph',
            text: 'Der Fahrgast ist verpflichtet, die Anzahl und Art des Gepaecks korrekt anzugeben.',
          },
          {
            type: 'paragraph',
            text: 'Bei Ueberschreitung der angegebenen oder zulaessigen Kapazitaet:',
          },
          {
            type: 'list',
            items: [
              'kann die Befoerderung verweigert werden',
              'der volle Fahrpreis verrechnet werden',
            ],
          },
        ],
      },
      {
        title: '6. Zahlung',
        blocks: [
          {
            type: 'paragraph',
            text: 'Die Bezahlung erfolgt direkt im Fahrzeug.',
          },
          {
            type: 'paragraph',
            text: 'Akzeptierte Zahlungsmethoden:',
          },
          {
            type: 'list',
            items: ['Barzahlung', 'Debit-/Kreditkarte', 'Apple Pay / Google Pay'],
          },
          {
            type: 'paragraph',
            text: 'Bei Verweigerung der Zahlung wird eine Rechnung ausgestellt und gegebenenfalls rechtlich geltend gemacht.',
          },
        ],
      },
      {
        title: '7. Stornierung',
        blocks: [
          {
            type: 'paragraph',
            text: 'Kostenlose Stornierung ist nur innerhalb folgender Fristen moeglich:',
          },
          {
            type: 'list',
            items: [
              '22:00-07:00 Fahrten -> mindestens 8 Stunden vorher',
              '07:00-22:00 Fahrten -> mindestens 3 Stunden vorher',
            ],
          },
          {
            type: 'paragraph',
            text: 'Bei spaeterer Stornierung oder Nichterscheinen werden 100 % des Fahrpreises verrechnet.',
          },
        ],
      },
      {
        title: '8. Flughafenabholung (vom Flughafen)',
        blocks: [
          {
            type: 'paragraph',
            text: 'Das Unternehmen ueberwacht Flugankuenfte automatisch.',
          },
          {
            type: 'subheading',
            text: 'Verspaetungen',
          },
          {
            type: 'list',
            items: [
              'Uebliche Verspaetungen werden beruecksichtigt',
              'Bei erheblichen Verspaetungen nach Mitternacht ist eine erneute Bestaetigung durch den Fahrgast erforderlich',
            ],
          },
          {
            type: 'subheading',
            text: 'Wartezeit',
          },
          {
            type: 'paragraph',
            text: '45 Minuten Wartezeit ab tatsaechlicher Landung (inkl. Gepaeckabholung) sind inkludiert.',
          },
          {
            type: 'paragraph',
            text: 'Erfolgt innerhalb dieser Zeit keine Kontaktaufnahme, gilt die Fahrt als No-Show und der volle Fahrpreis wird verrechnet.',
          },
        ],
      },
      {
        title: '9. Flughafentransfer (zum Flughafen)',
        blocks: [
          {
            type: 'paragraph',
            text: 'Der Fahrgast ist selbst verantwortlich fuer:',
          },
          {
            type: 'list',
            items: ['rechtzeitiges Erscheinen', 'ausreichende Zeitplanung'],
          },
          {
            type: 'paragraph',
            text: 'Bei verpasstem Flug muss der Fahrgast das Unternehmen unverzueglich informieren, andernfalls wird der volle Fahrpreis verrechnet.',
          },
        ],
      },
      {
        title: '10. Verspaetung durch das Unternehmen',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bei einer erheblichen Verspaetung, die vom Unternehmen verursacht wurde, hat der Fahrgast das Recht, die Fahrt kostenlos zu stornieren.',
          },
        ],
      },
      {
        title: '11. Ablehnung der Befoerderung',
        blocks: [
          {
            type: 'paragraph',
            text: 'Das Unternehmen ist berechtigt, die Befoerderung abzulehnen bei:',
          },
          {
            type: 'list',
            items: [
              'stark alkoholisierten oder aggressiven Personen',
              'gefaehrlichem oder ungeeignetem Gepaeck',
              'falschen oder unvollstaendigen Angaben bei der Buchung',
              'sonstigen Sicherheitsrisiken',
            ],
          },
        ],
      },
      {
        title: '12. Haftung',
        blocks: [
          {
            type: 'paragraph',
            text: 'Das Unternehmen haftet nicht fuer:',
          },
          {
            type: 'list',
            items: [
              'Verkehrsverzoegerungen',
              'Flugverspaetungen oder -ausfaelle',
              'verpasste Fluege aufgrund externer Umstaende',
            ],
          },
          {
            type: 'paragraph',
            text: 'Die Haftung ist auf Faelle von Vorsatz oder grober Fahrlaessigkeit beschraenkt.',
          },
        ],
      },
      {
        title: '13. Anwendbares Recht und Gerichtsstand',
        blocks: [
          {
            type: 'paragraph',
            text: 'Es gilt oesterreichisches Recht.',
          },
          {
            type: 'paragraph',
            text: 'Gerichtsstand ist Wien, Oesterreich.',
          },
        ],
      },
    ],
  },
  datenschutz: {
    eyebrow: 'Rechtliches',
    title: 'Datenschutzerklaerung',
    sections: [
      {
        title: 'Alex Flughafentaxi OG',
        blocks: [
          {
            type: 'contact',
            name: 'Alex Flughafentaxi OG',
            location: 'Wien, Oesterreich',
            email: 'info@flughafentaxi-wien-alex.at',
          },
        ],
      },
      {
        title: '1. Verantwortlicher',
        blocks: [
          {
            type: 'paragraph',
            text: 'Alex Flughafentaxi OG ist verantwortlich fuer die Verarbeitung Ihrer personenbezogenen Daten.',
          },
        ],
      },
      {
        title: '2. Allgemeines',
        blocks: [
          {
            type: 'paragraph',
            text: 'Wir verarbeiten Ihre Daten ausschliesslich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, DSG, TKG).',
          },
        ],
      },
      {
        title: '3. Erhobene Daten',
        blocks: [
          {
            type: 'paragraph',
            text: 'Wir verarbeiten folgende Daten, die Sie uns im Rahmen einer Buchung oder Nutzung unserer Website zur Verfuegung stellen:',
          },
          {
            type: 'list',
            items: [
              'Name',
              'Telefonnummer',
              'E-Mail-Adresse',
              'Abhol- und Zieladresse',
              'Flugdaten (z. B. Flugnummer, Ankunftszeit)',
              'gespeicherte Adressen (bei Nutzung eines Benutzerkontos)',
            ],
          },
        ],
      },
      {
        title: '4. Zweck der Verarbeitung',
        blocks: [
          {
            type: 'paragraph',
            text: 'Ihre Daten werden fuer folgende Zwecke verwendet:',
          },
          {
            type: 'list',
            items: [
              'Durchfuehrung und Verwaltung von Buchungen',
              'Organisation der Fahrt',
              'Kommunikation mit Kunden (E-Mail, SMS, Telefon)',
              'Erfuellung gesetzlicher Verpflichtungen (z. B. Rechnungslegung)',
              'Verbesserung unserer Dienstleistungen',
            ],
          },
          {
            type: 'paragraph',
            text: 'Marketing erfolgt nur mit Ihrer ausdruecklichen Einwilligung.',
          },
        ],
      },
      {
        title: '5. Rechtsgrundlagen',
        blocks: [
          {
            type: 'paragraph',
            text: 'Die Verarbeitung erfolgt auf Basis von:',
          },
          {
            type: 'list',
            items: [
              'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung)',
              'Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Verpflichtung)',
              'Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
            ],
          },
        ],
      },
      {
        title: '6. Speicherdauer',
        blocks: [
          {
            type: 'list',
            items: [
              'Buchungsdaten werden maximal 2 Monate gespeichert',
              'Steuer- und Rechnungsdaten werden 7 Jahre gespeichert (gesetzliche Pflicht)',
            ],
          },
        ],
      },
      {
        title: '7. Weitergabe von Daten',
        blocks: [
          {
            type: 'paragraph',
            text: 'Zur Erbringung unserer Dienstleistungen nutzen wir folgende Anbieter:',
          },
          {
            type: 'list',
            items: [
              'Supabase (Datenbank, EU)',
              'Vercel (Hosting)',
              'Google Analytics (GA4)',
              'Mobilfunkanbieter (z. B. Magenta) fuer SMS',
              'Zahlungsdienstleister (Zahlung im Fahrzeug)',
            ],
          },
          {
            type: 'paragraph',
            text: 'Diese verarbeiten Daten nur im Rahmen unserer Auftraege.',
          },
        ],
      },
      {
        title: '8. Datenuebermittlung ausserhalb der EU',
        blocks: [
          {
            type: 'paragraph',
            text: 'Durch die Nutzung von Vercel und Google Analytics kann es zu einer Verarbeitung von Daten ausserhalb der EU kommen.',
          },
          {
            type: 'paragraph',
            text: 'In diesen Faellen verwenden wir geeignete Schutzmassnahmen (z. B. Standardvertragsklauseln).',
          },
        ],
      },
      {
        title: '9. Cookies',
        blocks: [
          {
            type: 'paragraph',
            text: 'Unsere Website verwendet Cookies.',
          },
          {
            type: 'subheading',
            text: '9.1 Technisch notwendige Cookies',
          },
          {
            type: 'paragraph',
            text: 'Diese sind erforderlich, damit die Website funktioniert (z. B. Buchung, Sicherheit). Diese Cookies koennen nicht deaktiviert werden.',
          },
          {
            type: 'subheading',
            text: '9.2 Analyse-Cookies (Google Analytics)',
          },
          {
            type: 'paragraph',
            text: 'Wir verwenden Google Analytics (GA4), um das Nutzerverhalten zu analysieren.',
          },
          {
            type: 'paragraph',
            text: 'Dabei koennen folgende Daten verarbeitet werden:',
          },
          {
            type: 'list',
            items: ['anonymisierte IP-Adresse', 'Geraeteinformationen', 'Seitenaufrufe'],
          },
          {
            type: 'paragraph',
            text: 'Diese Cookies werden nur mit Ihrer Einwilligung gesetzt.',
          },
          {
            type: 'subheading',
            text: '9.3 Rechtsgrundlage',
          },
          {
            type: 'list',
            items: [
              'Notwendige Cookies: berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)',
              'Analyse-Cookies: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)',
            ],
          },
          {
            type: 'subheading',
            text: '9.4 Cookie-Einstellungen',
          },
          {
            type: 'paragraph',
            text: 'Beim ersten Besuch wird ein Cookie-Banner angezeigt.',
          },
          {
            type: 'paragraph',
            text: 'Sie koennen:',
          },
          {
            type: 'list',
            items: [
              'alle Cookies akzeptieren',
              'nur notwendige Cookies zulassen',
              'Einstellungen aendern',
            ],
          },
          {
            type: 'paragraph',
            text: 'Ihre Einwilligung koennen Sie jederzeit widerrufen.',
          },
        ],
      },
      {
        title: '10. Marketing',
        blocks: [
          {
            type: 'paragraph',
            text: 'Marketing (z. B. Newsletter) erfolgt nur mit Ihrer Einwilligung.',
          },
          {
            type: 'paragraph',
            text: 'Sie koennen diese jederzeit widerrufen.',
          },
        ],
      },
      {
        title: '11. Keine Aufzeichnung',
        blocks: [
          {
            type: 'list',
            items: [
              'Es werden keine Telefonate aufgezeichnet',
              'Es werden keine Kameras oder Dashcams verwendet',
            ],
          },
        ],
      },
      {
        title: '12. Datensicherheit',
        blocks: [
          {
            type: 'paragraph',
            text: 'Wir setzen geeignete technische und organisatorische Massnahmen ein, um Ihre Daten zu schuetzen.',
          },
        ],
      },
      {
        title: '13. Ihre Rechte',
        blocks: [
          {
            type: 'paragraph',
            text: 'Sie haben das Recht auf:',
          },
          {
            type: 'list',
            items: [
              'Auskunft',
              'Berichtigung',
              'Loeschung',
              'Einschraenkung',
              'Datenuebertragbarkeit',
              'Widerspruch',
            ],
          },
        ],
      },
      {
        title: '14. Beschwerderecht',
        blocks: [
          {
            type: 'paragraph',
            text: 'Sie koennen sich bei der oesterreichischen Datenschutzbehoerde beschweren:',
          },
          {
            type: 'paragraph',
            text: 'Oesterreichische Datenschutzbehoerde',
          },
          {
            type: 'paragraph',
            text: 'Barichgasse 40-42',
          },
          {
            type: 'paragraph',
            text: '1030 Wien',
          },
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
        title: '1. Scope',
        blocks: [
          {
            type: 'paragraph',
            text: 'This placeholder exists only to prepare the multilingual legal-page setup.',
          },
        ],
      },
      {
        title: '2. Service description',
        blocks: [
          {
            type: 'paragraph',
            text: 'Once the final English content is available, this page can be filled in directly.',
          },
        ],
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
        title: '1. Personal data processing',
        blocks: [
          {
            type: 'paragraph',
            text: 'This placeholder exists only to prepare the multilingual legal-page setup.',
          },
        ],
      },
      {
        title: '2. Purpose of processing',
        blocks: [
          {
            type: 'paragraph',
            text: 'Once the final English content is available, this page can be filled in directly.',
          },
        ],
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
