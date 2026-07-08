import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Baby,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Info,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
  Star,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import HeroCalculator from '@/components/HeroCalculator';
import Navbar from '@/components/Navbar';
import PriceTable from '@/components/PriceTable';
import ScrollReveal from '@/components/ScrollReveal';
import { buildAbsoluteMetadata } from '@/lib/seo/metadata';
import { WhatsAppIcon } from '@/components/ui/ContactIcons';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return buildAbsoluteMetadata('home', params?.lang);
}

const features: { num: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    num: '01',
    title: 'Hand-Vetted Drivers',
    description:
      'Every driver is personally reviewed for punctuality and professional conduct before joining our team.',
    icon: ShieldCheck,
  },
  {
    num: '02',
    title: 'Real-Time Flight Sync',
    description:
      'We monitor your flight continuously. Land early or late — your driver adjusts without extra charges.',
    icon: Plane,
  },
  {
    num: '03',
    title: 'Upfront Fixed Pricing',
    description:
      'What you see is what you pay. No hidden fees, no surge pricing, no surprises at the end of your ride.',
    icon: CreditCard,
  },
  {
    num: '04',
    title: 'Child Seats & Safety',
    description:
      'Properly fitted child and booster seats provided on request at no extra charge, every time.',
    icon: Baby,
  },
];

const vehicles = [
  {
    type: 'SEDAN',
    title: 'Limousine',
    altText: 'Vienna airport taxi — sedan limousine for up to 2 passengers and 2 suitcases',
    imageSrc: '/limo.jpg',
    summary: 'Compact, always available, ideal for solo travelers or couples with standard luggage.',
    passengers: '1 – 2',
    suitcases: '2',
    prices: [
      { district: '1st – 10th district', price: '€42' },
      { district: '11th district', price: '€39' },
      { district: '12th – 23rd district', price: '€45' },
    ],
  },
  {
    type: 'WAGON',
    title: 'Station Wagon',
    altText: 'Vienna airport taxi — station wagon with extra luggage space for up to 4 passengers',
    imageSrc: '/kombi.jpg',
    summary: 'More space for luggage, strollers, or extra passengers — no comfort lost.',
    passengers: '1 – 4',
    suitcases: '4',
    prices: [
      { district: '1st – 10th district', price: '€48' },
      { district: '11th district', price: '€45' },
      { district: '12th – 23rd district', price: '€51' },
    ],
  },
  {
    type: 'MINIVAN',
    title: 'Minivan',
    altText: 'Vienna airport taxi — minivan for groups of up to 8 passengers with 8 suitcases',
    imageSrc: '/bus.jpg',
    summary: 'The right choice for larger groups arriving together, with plenty of room for all bags.',
    passengers: '1 – 8',
    suitcases: '8',
    prices: [
      { district: '1st – 10th district', price: '€72' },
      { district: '11th district', price: '€69' },
      { district: '12th – 23rd district', price: '€75' },
    ],
  },
];

const bookingSteps = [
  {
    num: '01',
    title: 'Choose your route',
    description: 'Select to or from Vienna Airport, enter your address, date, and time of travel.',
  },
  {
    num: '02',
    title: 'Confirm & pay',
    description: 'Review your fixed price, add passengers and luggage, then confirm your booking.',
  },
  {
    num: '03',
    title: 'Arrive stress-free',
    description: 'Your driver tracks your flight and meets you punctually — no waiting, no stress.',
  },
];

const reviewItems = [
  { name: 'Anna M.', review: 'Top service, always on time and super easy to book.' },
  { name: 'David K.', review: 'Clean car, fair fixed price and smooth pickup at the airport.' },
  { name: 'Sophie R.', review: 'Very reliable. WhatsApp support was fast and helpful.' },
];

const faqItems = [
  {
    question: 'How do I recognize my driver?',
    answer:
      'Your driver picks you up on time at the terminal. Personal pickup with a name sign is available for an additional fee.',
  },
  {
    question: 'Are child seats available?',
    answer:
      'Yes. Please tell us what you need when booking. We provide baby seats and booster seats free of charge.',
  },
  {
    question: 'Can pets travel with me?',
    answer: 'Pets can travel in suitable transport boxes. Please let us know in advance.',
  },
  {
    question: 'Are there extra costs for delays?',
    answer:
      'We monitor your flight and adjust the pickup time. There are no extra costs for delays outside your control.',
  },
  {
    question: 'Can I also book from my hotel to the airport?',
    answer: 'Yes, our service works in both directions. Enter your pickup address when booking.',
  },
  {
    question: 'Which payment methods are available?',
    answer: 'You can pay by cash, card, or mobile payment and receive a digital invoice.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://flughafentaxi-wien.at/#website',
      url: 'https://flughafentaxi-wien.at',
      name: 'Servus Transfer Vienna',
      description: 'Fixed-price airport taxi transfers to and from Vienna International Airport (VIE), available 24/7.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://flughafentaxi-wien.at/book',
        },
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://flughafentaxi-wien.at/#webpage',
      url: 'https://flughafentaxi-wien.at',
      name: 'Vienna Airport Taxi — Fixed Price Transfers | Servus Transfer',
      isPartOf: { '@id': 'https://flughafentaxi-wien.at/#website' },
      about: { '@id': 'https://flughafentaxi-wien.at/#business' },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2'],
      },
    },
    {
      '@type': ['TaxiService', 'LocalBusiness'],
      '@id': 'https://flughafentaxi-wien.at/#business',
      name: 'Servus Transfer',
      alternateName: 'Servus Transfer Vienna',
      url: 'https://flughafentaxi-wien.at',
      telephone: '+436764826069',
      image: 'https://flughafentaxi-wien.at/favtaxi.png',
      description:
        'Fixed-price airport taxi transfers to and from Vienna International Airport (VIE). Taxi to Vienna Airport and taxi from Vienna Airport — sedans, station wagons, and minivans available 24/7. No hidden fees, real-time flight tracking.',
      priceRange: '€€',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Vienna',
        addressRegion: 'Vienna',
        addressCountry: 'AT',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 48.1102778,
        longitude: 16.5697222,
      },
      areaServed: [
        {
          '@type': 'City',
          name: 'Vienna',
          sameAs: 'https://www.wikidata.org/wiki/Q1741',
        },
        {
          '@type': 'Airport',
          name: 'Vienna International Airport',
          iataCode: 'VIE',
          sameAs: 'https://www.wikidata.org/wiki/Q153411',
        },
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Vienna Airport Transfer — Fixed Prices',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Limousine transfer — 1st to 10th district',
            description: 'Fixed-price sedan airport transfer between Vienna Airport (VIE) and districts 1–10',
            price: '42.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 2 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Limousine transfer — 11th district',
            description: 'Fixed-price sedan airport transfer between Vienna Airport (VIE) and the 11th district',
            price: '39.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 2 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Limousine transfer — 12th to 23rd district',
            description: 'Fixed-price sedan airport transfer between Vienna Airport (VIE) and districts 12–23',
            price: '45.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 2 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Station Wagon transfer — 1st to 10th district',
            description: 'Fixed-price station wagon airport transfer between Vienna Airport (VIE) and districts 1–10',
            price: '48.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 4 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Station Wagon transfer — 11th district',
            description: 'Fixed-price station wagon airport transfer between Vienna Airport (VIE) and the 11th district',
            price: '45.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 4 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Station Wagon transfer — 12th to 23rd district',
            description: 'Fixed-price station wagon airport transfer between Vienna Airport (VIE) and districts 12–23',
            price: '51.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 4 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Minivan transfer — 1st to 10th district',
            description: 'Fixed-price minivan airport transfer between Vienna Airport (VIE) and districts 1–10',
            price: '72.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 8 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Minivan transfer — 11th district',
            description: 'Fixed-price minivan airport transfer between Vienna Airport (VIE) and the 11th district',
            price: '69.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 8 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Minivan transfer — 12th to 23rd district',
            description: 'Fixed-price minivan airport transfer between Vienna Airport (VIE) and districts 12–23',
            price: '75.00',
            priceCurrency: 'EUR',
            eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 8 },
            seller: { '@id': 'https://flughafentaxi-wien.at/#business' },
          },
        ],
      },
      founder: { '@id': 'https://flughafentaxi-wien.at/#servus-transfer' },
      provider: { '@id': 'https://flughafentaxi-wien.at/#business' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '47',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@type': 'Person',
      '@id': 'https://flughafentaxi-wien.at/#servus-transfer',
      name: 'Servus Transfer',
      jobTitle: 'Vienna Airport Taxi Operator',
      description:
        'Vienna airport taxi operator with fixed-price transfers, flight tracking, child-seat options, and direct passenger support.',
      image: 'https://images.unsplash.com/photo-1740485863389-a8445da2735e?q=80&w=702&auto=format&fit=crop',
      worksFor: { '@id': 'https://flughafentaxi-wien.at/#business' },
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Professional Airport Transfer Service',
        occupationLocation: {
          '@type': 'City',
          name: 'Vienna',
          sameAs: 'https://www.wikidata.org/wiki/Q1741',
        },
        experienceRequirements: 'Over 10 years of professional experience',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://flughafentaxi-wien.at/#faq',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
};

const childSeats = [
  {
    title: 'Baby Seat',
    altText: 'Infant baby seat — provided free of charge in every Vienna airport taxi with advance notice',
    weightRange: '0 – 13 kg',
    ageLabel: 'For newborns & infants',
    description:
      'Rear-facing installation protects the sensitive neck area during braking. Required for all infant airport transfers.',
    imageSrc: '/alex-flughafentaxi-wien-babyschale-gratis.jpg',
  },
  {
    title: 'Child Seat',
    altText: 'Child seat with 5-point harness — free of charge for Vienna airport taxi transfers',
    weightRange: '9 – 18 kg',
    ageLabel: 'For toddlers',
    description:
      '5-point harness with reinforced side-impact protection provides maximum stability throughout the journey.',
    imageSrc: '/alex-flughafentaxi-wien-kindersitz-sicherheit.jpg',
  },
  {
    title: 'Booster Seat',
    altText: 'Booster seat for school-age children — included at no extra cost in Vienna airport taxis',
    weightRange: '15 – 36 kg',
    ageLabel: 'For school-age children (up to ~12 yrs)',
    description:
      'Ergonomic booster positions the seat belt correctly over shoulder and pelvis for proper protection.',
    imageSrc: '/alex-flughafentaxi-wien-sitzerhoehung-gratis.jpg',
  },
];

const terminalPickupInfo = [
  {
    title: 'Where will I be dropped off?',
    description:
      "You'll be dropped off curbside at the terminal you specify when booking. If you don't know your terminal, add your airline in the notes field.",
  },
  {
    title: 'Where will I be picked up?',
    description:
      'After baggage claim, turn right toward Burger King. Exit the terminal, cross the street, and proceed toward the parking area.',
    linkLabel: 'View exact pickup location on Google Maps',
    linkHref: 'https://maps.app.goo.gl/JkuDu7qEX6tgxK4D6',
  },
];

const airportTips = [
  {
    title: 'Terminal guide',
    description:
      'Gates B/C/D → Terminal 1. Gates F/G → Terminal 3. Star Alliance airlines (Austrian) primarily use T3; budget & charter airlines often use T1A.',
  },
  {
    title: 'When to arrive at the airport',
    description:
      'Europe: 2 hours before departure. Non-Schengen & long-haul: 3 hours. USA flights: 3.5–4 hours. Add extra time for special luggage or groups.',
  },
];

const popularTrips = [
  {
    label: 'From Terminal 1 Vienna Airport to Vienna Central Train Station',
    href: '/routes/terminal-1-vienna-airport-to-vienna-hbf',
  },
  { label: 'From Stephansplatz to Terminal 3 Vienna Airport', href: '/book' },
  { label: 'From Terminal 1 Vienna Airport to Schoenbrunn Palace', href: '/book' },
  { label: 'From Vienna Westbahnhof to Terminal 3 Vienna Airport', href: '/book' },
  { label: 'From Praterstern to Terminal 3 Vienna Airport', href: '/book' },
  { label: 'From Terminal 1 Vienna Airport to Stephansplatz', href: '/book' },
  { label: 'From Schwedenplatz to Terminal 3 Vienna Airport', href: '/book' },
  { label: 'From Terminal 1 Vienna Airport to Vienna Westbahnhof', href: '/book' },
  { label: 'From Ernst-Happel-Stadion to Terminal 3 Vienna Airport', href: '/book' },
  { label: 'From Vienna Central Train Station to Terminal 3 Vienna Airport', href: '/book' },
];

const viennaDistricts = [
  { code: '1010', name: 'Innere Stadt', price: '€33' },
  { code: '1020', name: 'Leopoldstadt', price: '€33' },
  { code: '1030', name: 'Landstraße', price: '€33' },
  { code: '1040', name: 'Wieden', price: '€36' },
  { code: '1050', name: 'Margareten', price: '€36' },
  { code: '1060', name: 'Mariahilf', price: '€36' },
  { code: '1070', name: 'Neubau', price: '€36' },
  { code: '1080', name: 'Josefstadt', price: '€36' },
  { code: '1090', name: 'Alsergrund', price: '€36' },
  { code: '1100', name: 'Favoriten', price: '€33' },
  { code: '1110', name: 'Simmering', price: '€33' },
  { code: '1120', name: 'Meidling', price: '€39' },
  { code: '1130', name: 'Hietzing', price: '€39' },
  { code: '1140', name: 'Penzing', price: '€39' },
  { code: '1150', name: 'Rudolfsheim', price: '€36' },
  { code: '1160', name: 'Ottakring', price: '€39' },
  { code: '1170', name: 'Hernals', price: '€39' },
  { code: '1180', name: 'Währing', price: '€39' },
  { code: '1190', name: 'Döbling', price: '€39' },
  { code: '1200', name: 'Brigittenau', price: '€36' },
  { code: '1210', name: 'Floridsdorf', price: '€39' },
  { code: '1220', name: 'Donaustadt', price: '€39' },
  { code: '1230', name: 'Liesing', price: '€39' },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`servus-eyebrow ${light ? 'text-[#FFB629]' : 'text-[#FFB629]'}`}>
      {children}
    </p>
  );
}

function Display({ children, light = false, className = '' }: { children: React.ReactNode; light?: boolean; className?: string }) {
  return (
    <h2 className={`mt-4 font-black leading-[1.04] tracking-[-0.015em] text-[2.4rem] md:text-[3.25rem] lg:text-[4rem] ${light ? 'text-[#F4F1E8]' : 'text-[#F4F1E8]'} ${className}`}>
      {children}
    </h2>
  );
}

function BookingCta({ className = '', label = 'Book Now', icon: Icon }: { className?: string; label?: string; icon?: LucideIcon }) {
  return (
    <Link href="/book" className={`ui-button-booking-primary ${className}`}>
      {Icon && <Icon size={17} strokeWidth={2.2} />}
      {label}
    </Link>
  );
}

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" className="h-[14px] w-[14px] fill-[#f59e0b]" aria-hidden="true">
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
        </svg>
      ))}
    </span>
  );
}

function TrustTicker() {
  const items = [
    { lead: 'W-TX', copy: 'lizenziertes Wiener Taxi', tone: 'white' },
    { lead: '24/7', copy: 'auch Feiertage & Nachtflüge', tone: 'gold' },
    { lead: '★ 4,9', copy: '1.240+ Bewertungen', tone: 'gold', strongCopy: true },
    { lead: '12.400+', copy: 'Flughafenfahrten', tone: 'white' },
    { lead: '98,6%', copy: 'pünktlich abgeholt', tone: 'gold' },
  ];

  const loop = [...items, ...items, ...items];

  return (
    <div className="servus-ticker" aria-label="Service highlights">
      <div className="servus-ticker-track">
        {loop.map((item, index) => (
          <span key={`${item.lead}-${index}`}>
            <em className={item.tone === 'gold' ? 'is-gold' : ''}>{item.lead}</em>
            <b className={item.strongCopy ? 'is-strong' : ''}>{item.copy}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  return (
    <div className="servus-home-reference min-h-screen bg-[#0A111F] text-[#F4F1E8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section id="hero" className="relative overflow-hidden bg-[#070d18] text-[#F4F1E8]">
          <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-5 pb-14 pt-[94px] sm:px-8 lg:pt-[108px] min-[1180px]:grid-cols-[minmax(0,0.92fr)_minmax(390px,500px)] min-[1180px]:items-start min-[1180px]:gap-8 min-[1180px]:px-8 min-[1180px]:pb-16 min-[1180px]:pt-[118px] min-[1536px]:grid-cols-[minmax(0,0.9fr)_minmax(410px,540px)] min-[1536px]:gap-12 min-[1536px]:px-12 min-[1536px]:pt-[132px] min-[1900px]:min-h-[1040px] min-[1900px]:grid-cols-[minmax(0,620px)_minmax(560px,620px)] min-[1900px]:gap-20 min-[1900px]:px-[82px] min-[1900px]:pt-[166px]">
            <div className="flex flex-col">
              <div className="mb-8 inline-flex min-h-[42px] w-fit max-w-full items-center rounded-full border border-[rgba(62,207,142,0.35)] bg-[rgba(62,207,142,0.08)] px-5 py-2 font-mono text-[clamp(0.82rem,0.9vw,1rem)] text-[#3ECF8E] sm:mb-10 min-[1900px]:mb-12 min-[1900px]:h-[50px] min-[1900px]:px-6 min-[1900px]:text-[17px]">
                <span className="mr-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#3ECF8E] min-[1900px]:mr-4 min-[1900px]:h-3 min-[1900px]:w-3" />
                Heute verfügbar, auch nachts &amp; am Wochenende
              </div>

              <h1 className="max-w-[11ch] font-display text-[clamp(3rem,5.8vw,4.5rem)] font-black leading-[1.06] tracking-[-0.015em] text-[#F4F1E8] min-[1536px]:text-[clamp(3.75rem,4.35vw,4.9rem)] min-[1900px]:max-w-none min-[1900px]:text-[clamp(4.4rem,4.6vw,5.75rem)]">
                Flughafentaxi<br />
                Wien.<br />
                <span className="text-[#FFB629]">Fixpreis.</span><br />
                <span className="text-[#FFB629]">Punkt.</span>
              </h1>

              <p className="mt-7 max-w-[700px] text-[clamp(1.05rem,1.35vw,1.42rem)] leading-[1.45] text-[#93A0B5] sm:mt-9 min-[1900px]:mt-10 min-[1900px]:text-[25px] min-[1900px]:leading-[1.5]">
                Wien ↔ Flughafen Schwechat zum{' '}
                <span className="font-black text-[#F4F1E8]">Fixpreis ab €33 pro Fahrzeug</span>,
                mit einem Wiener Team, das Sie beim Namen kennt. Kein Callcenter, keine Plattform,
                kein Taxameter: Der Preis, den Sie sehen, ist der Preis, den Sie zahlen.
              </p>

              <div className="mt-8 grid max-w-[620px] gap-3 sm:grid-cols-2 min-[1900px]:mt-10 min-[1900px]:gap-4">
                {[
                  'Gratis Flugverfolgung',
                  '60 Min Gratis-Wartezeit',
                  'Storno bis 24h gratis',
                  'Zahlung beim Fahrer',
                ].map((item) => (
                  <div
                    key={item}
                    className="inline-flex min-h-[50px] items-center gap-3 rounded-full border border-[rgba(244,241,232,0.10)] bg-[rgba(244,241,232,0.055)] px-5 text-[clamp(0.92rem,1vw,1.1rem)] font-semibold text-[#F4F1E8] min-[1900px]:h-[58px] min-[1900px]:gap-4 min-[1900px]:px-6 min-[1900px]:text-[19px]"
                  >
                    <Check size={21} strokeWidth={3} className="text-[#3ECF8E]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full min-[1180px]:pt-5">
              <HeroCalculator />
            </div>
          </div>
        </section>

        <TrustTicker />

        <section className="bg-[#070d18] py-20 text-[#F4F1E8] md:py-24">
          <div className="mx-auto w-full max-w-[1590px] px-5 sm:px-8 lg:px-[82px]">
            <div className="inline-flex items-center gap-4 font-mono text-[18px] uppercase tracking-[0.34em] text-[#FFB629]">
              <span className="h-[3px] w-10 bg-[#FFB629]" />
              Der Unterschied
            </div>

            <h2 className="mt-10 max-w-[1040px] font-display text-[clamp(3.8rem,5vw,5.35rem)] font-black leading-[1.05] tracking-[-0.025em] text-[#F4F1E8]">
              Der Taxameter tickt.<br />
              Unser Preis nicht.
            </h2>

            <p className="mt-9 max-w-[940px] text-[28px] leading-[1.55] text-[#9AA8C1]">
              Ein spontanes Taxi vom Flughafen kostet je nach Verkehr, Route und
              Tageszeit, Sie erfahren den Preis erst am Ziel. Bei uns kennen Sie ihn,
              bevor Sie einsteigen.
            </p>

            <div className="mt-24 grid gap-8 lg:grid-cols-2">
              <article className="rounded-[24px] border border-[rgba(244,241,232,0.10)] bg-[#11111f] px-8 py-12 sm:px-14">
                <p className="font-mono text-[17px] uppercase tracking-[0.28em] text-[#ff6b75]">
                  Taxameter am Stand
                </p>
                <div className="relative mt-7 inline-block font-display text-[76px] font-black leading-none tracking-[-0.04em] text-[#9AA8C1] sm:text-[86px]">
                  €45–60
                  <span className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 bg-[#ff6b75]" />
                </div>
                <p className="mt-6 text-[22px] text-[#9AA8C1]">
                  + Flughafenzuschlag, + Stauzeit, + Nachttarif
                </p>
                <ul className="mt-10 space-y-6 text-[22px] text-[#9AA8C1]">
                  {[
                    'Endpreis erst am Ziel bekannt',
                    'Warteschlange nach der Landung',
                    'Jeder Stau kostet Sie Geld',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-5">
                      <X size={22} strokeWidth={2.7} className="text-[#ff6b75]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[24px] border border-[#A97517] bg-[rgba(244,241,232,0.08)] px-8 py-12 sm:px-14">
                <p className="font-mono text-[17px] uppercase tracking-[0.28em] text-[#FFB629]">
                  Servus Transfer · Fixpreis
                </p>
                <div className="mt-8 font-display text-[76px] font-black leading-none tracking-[-0.04em] text-[#F4F1E8] sm:text-[86px]">
                  ab €33
                </div>
                <p className="mt-6 text-[22px] text-[#9AA8C1]">
                  pro Fahrzeug, nicht pro Person. Alles inklusive.
                </p>
                <ul className="mt-10 space-y-6 text-[22px] font-semibold leading-[1.55] text-[#F4F1E8]">
                  {[
                    'Preis bei Buchung fixiert und garantiert',
                    'Fahrer wartet mit Namensschild in der Ankunftshalle',
                    'Maut, Parkgebühr & Flughafenzuschlag inklusive',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-5">
                      <Check size={22} strokeWidth={2.7} className="mt-1 text-[#3ECF8E]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section className="hidden bg-[#0A111F] py-20 md:py-28">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">

              {/* Top row: heading left, video right */}
              <div className="grid gap-12 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:gap-16 lg:items-center">
                <div>
                  <Eyebrow>The Servus Standard</Eyebrow>
                  <Display>
                    Your premier<br />Vienna airport<br />taxi service.
                  </Display>
                  <p className="mt-6 max-w-[33rem] text-[1rem] leading-[1.75] text-[#93A0B5]">
                    Fixed prices, real-time flight tracking, and direct driver contact — built into every ride, not charged as extras.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {['Fixed airport fares', 'Direct driver contact', 'Child seats on request'].map((item) => (
                      <div
                        key={item}
                        className="rounded-full border border-[rgba(244,241,232,0.09)] bg-[#101A2C]/[0.045] px-4 py-2 text-[0.77rem] font-semibold text-[#F4F1E8]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[18px] border border-[rgba(244,241,232,0.09)] bg-[#101A2C] shadow-[0_40px_90px_rgba(0,0,0,0.45)]">
                  <video
                    className="aspect-[4/5] h-full w-full object-cover md:aspect-[16/10] lg:aspect-[16/9]"
                    src="/servus-ride.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Servus Flughafentaxi Wien service video"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-2 backdrop-blur-md">
                    <span className="text-[0.73rem] font-bold text-[#F4F1E8]">Servus Flughafentaxi Wien</span>
                    <span className="rounded-full bg-[#FFB629] px-2.5 py-1 text-[0.67rem] font-bold text-[#0A111F]">VIE</span>
                  </div>
                </div>
              </div>

              {/* Feature grid — 4 borderless items with icon + rule */}
              <div className="mt-16 grid gap-px border border-[rgba(244,241,232,0.09)] bg-[rgba(244,241,232,0.09)] md:grid-cols-2 lg:grid-cols-4">
                {features.map(({ title, description, icon: Icon }, i) => (
                  <ScrollReveal key={title} delay={i * 60}>
                    <article className="group flex flex-col gap-4 bg-[#101A2C] px-7 py-8 transition-colors duration-200 hover:bg-[#16233B]">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(244,241,232,0.09)] bg-black/25 text-[#FFB629] transition-shadow duration-200 group-hover:shadow-[0_8px_24px_rgba(255,182,41,0.14)]">
                        <Icon size={18} strokeWidth={2} />
                      </span>
                      <div>
                        <h3 className="text-[1rem] font-bold tracking-[-0.03em] text-[#F4F1E8]">{title}</h3>
                        <p className="mt-2 text-[0.83rem] leading-[1.65] text-[#93A0B5]">{description}</p>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="servus-lane" aria-hidden="true" />

        <section className="bg-[#070d18] px-5 pb-32 pt-36 text-[#F4F1E8] sm:px-8 md:pb-40 md:pt-44">
          <div className="mx-auto w-full max-w-[1420px]">
            <div className="inline-flex items-center gap-4 font-mono text-[16px] uppercase tracking-[0.34em] text-[#FFB629]">
              <span className="h-[3px] w-8 bg-[#FFB629]" />
              So funktioniert&apos;s
            </div>

            <h2 className="mt-8 max-w-[620px] font-display text-[clamp(3.4rem,5.1vw,4.85rem)] font-black leading-[1.05] tracking-[-0.03em] text-[#F4F1E8]">
              Gebucht in 60<br />
              Sekunden.
            </h2>

            <div className="mt-20 grid gap-6 lg:grid-cols-3">
              {[
                {
                  step: '01',
                  label: 'Buchen',
                  title: 'Preis sehen, buchen',
                  copy: 'Bezirk und Fahrzeug wählen, Fixpreis sehen, Buchung abschicken. Bestätigung kommt persönlich, von uns, nicht von einem Bot.',
                },
                {
                  step: '02',
                  label: 'Landen',
                  title: 'Wir verfolgen Ihren Flug',
                  copy: 'Verspätung? Frühere Landung? Ihr Fahrer passt sich automatisch an und wartet mit Namensschild in der Ankunftshalle, bis zu 60 Minuten gratis.',
                },
                {
                  step: '03',
                  label: 'Ankommen',
                  title: 'Zahlen beim Fahrer',
                  copy: 'Bar oder Karte, erst nach der Fahrt. Keine Vorauszahlung, keine versteckten Gebühren, kein Kleingedrucktes.',
                },
              ].map((item) => (
                <article
                  key={item.step}
                  className="min-h-[280px] rounded-[20px] border border-[rgba(244,241,232,0.08)] bg-[#101a2c] px-9 py-11 shadow-[inset_0_1px_0_rgba(244,241,232,0.03)]"
                >
                  <p className="font-mono text-[16px] font-bold uppercase tracking-[0.26em] text-[#FFB629]">
                    {item.step} · {item.label}
                  </p>
                  <h3 className="mt-6 text-[27px] font-black tracking-[-0.03em] text-[#F4F1E8]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[20px] leading-[1.55] text-[#93A0B5]">
                    {item.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="servus-pov" aria-label="Airport transfer ride">
          <video
            className="object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/servus-ride.jpg"
            aria-label="Passenger view from an airport transfer in Vienna"
          >
            <source src="/servus-ride.webm" type="video/webm" />
            <source src="/servus-ride.mp4" type="video/mp4" />
          </video>
        </section>
        {/* ── VEHICLES ─────────────────────────────────────────────────── */}
        <section id="team" className="border-y border-[rgba(244,241,232,0.09)] bg-[#101A2C] py-20 text-[#F4F1E8] md:py-28">
          <div className="app-container">
            <div className="mx-auto grid max-w-[108rem] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <div className="mb-8 inline-flex overflow-hidden rounded-[9px] border-2 border-[#111] bg-white font-mono text-[18px] font-bold tracking-[0.08em] text-[#111]">
                  <span className="grid place-items-center bg-[#003399] px-2.5 py-2 text-[11px] leading-tight text-[#FFCC00]">
                    EU<br />AT
                  </span>
                  <span className="px-4 py-2">W-TX 660</span>
                </div>

                <Eyebrow>Wiener Team</Eyebrow>
                <Display>Kein Callcenter.<br />Kein Vermittler.</Display>
                <p className="mt-5 max-w-[39rem] text-[1rem] leading-[1.75] text-[#93A0B5]">
                  Servus Transfer ist ein lizenziertes Wiener Taxiunternehmen. Sie buchen direkt bei dem Team, das Ihre Fahrt plant, Ihren Flug verfolgt und den Fahrer koordiniert.
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    { initials: 'ST', name: 'Servus Dispatch', role: 'Direkte Buchungsbestätigung und Fahrerkoordination' },
                    { initials: 'VIE', name: 'Flughafen-Team', role: 'Abholung mit Namensschild, Gepäckhilfe und Flugverfolgung' },
                    { initials: '24', name: '24/7 Bereitschaft', role: 'Frühflüge, Nachtlandungen, Feiertage und Wochenenden' },
                  ].map((driver) => (
                    <div
                      key={driver.name}
                      className="flex items-center gap-4 rounded-[14px] border border-[rgba(244,241,232,0.09)] bg-[rgba(255,255,255,0.03)] px-4 py-4 transition-all duration-200 hover:translate-x-1 hover:border-[rgba(255,182,41,0.35)]"
                    >
                      <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-[rgba(244,241,232,0.09)] bg-[#16233B] font-display text-[18px] font-black text-[#FFB629]">
                        {driver.initials}
                      </span>
                      <span>
                        <b className="block text-[15.5px] text-[#F4F1E8]">{driver.name}</b>
                        <span className="text-[13.5px] text-[#93A0B5]">{driver.role}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Eyebrow>Alle Bezirke</Eyebrow>
                <Display>Fixpreis in ganz Wien.</Display>
                <p className="mt-5 max-w-[42rem] text-[1rem] leading-[1.75] text-[#93A0B5]">
                  Wählen Sie Ihren Bezirk, sehen Sie den Fixpreis vor der Buchung und fahren Sie ohne Taxameter, ohne Nachtzuschlag und ohne versteckte Gebühren.
                </p>

                <div className="mt-9 grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5">
                  {viennaDistricts.map((district) => (
                    <Link
                      key={district.code}
                      href={`/book?district=${district.code}`}
                      className="group rounded-[11px] border border-[rgba(244,241,232,0.09)] bg-[rgba(255,255,255,0.03)] px-2.5 py-3 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#FFB629] hover:bg-[rgba(255,182,41,0.09)]"
                    >
                      <span className="block font-mono text-[14px] font-semibold text-[#F4F1E8]">{district.code}</span>
                      <span className="block truncate text-[10.5px] text-[#93A0B5]">{district.name}</span>
                      <span className="mt-1 block font-mono text-[11.5px] text-[#FFB629]">{district.price}</span>
                    </Link>
                  ))}
                </div>

                <p className="mt-4 font-mono text-[13px] text-[#93A0B5]">
                  Preise gelten pro Fahrzeug, nicht pro Person.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0A111F] py-20 md:py-28" id="flotte">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <ScrollReveal className="mb-14">
                <Eyebrow>Fleet</Eyebrow>
                <Display>Choose your vehicle.</Display>
                <p className="mt-4 max-w-[42rem] text-[0.97rem] leading-[1.72] text-[#93A0B5]">
                  Three vehicle classes for any group size — all include fixed pricing, professional drivers, and real-time flight tracking.
                </p>
              </ScrollReveal>

              <div className="space-y-3">
                {vehicles.map((v, i) => (
                  <ScrollReveal key={v.type} delay={i * 80}>
                    <div className="group grid overflow-hidden rounded-[18px] border border-[rgba(244,241,232,0.09)] bg-[#101A2C] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,182,41,0.35)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)] lg:grid-cols-[22rem_minmax(0,1fr)_18rem] lg:items-stretch">

                      {/* Image */}
                      <div className="relative h-[14rem] bg-[#16233B] lg:h-auto">
                        <Image
                          src={v.imageSrc}
                          alt={v.altText}
                          fill
                          className="scale-[1.1] object-contain object-center transition-transform duration-500 group-hover:scale-[1.14]"
                          sizes="(min-width: 1024px) 352px, 100vw"
                        />
                        {/* vehicle type label */}
                        <span className="absolute left-4 top-4 rounded-full bg-[#FFB629] px-3 py-1.5 text-[0.67rem] font-black uppercase tracking-[0.18em] text-[#0A111F] shadow-sm">
                          {v.type}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="flex flex-col justify-center px-7 py-6 lg:py-8">
                        <h3 className="text-[1.7rem] font-black leading-none tracking-[-0.015em] text-[#F4F1E8] lg:text-[2rem]">{v.title}</h3>
                        <p className="mt-3 max-w-[30rem] text-[0.9rem] leading-[1.65] text-[#93A0B5]">{v.summary}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {[
                            { icon: Users, value: `${v.passengers} passengers` },
                            { icon: Briefcase, value: `${v.suitcases} suitcases` },
                          ].map(({ icon: Icon, value }) => (
                            <span
                              key={value}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(244,241,232,0.09)] bg-[#101A2C]/[0.045] px-3.5 py-1.5 text-[0.78rem] font-semibold text-[#F4F1E8]"
                            >
                              <Icon size={12} className="text-[#FFB629]" strokeWidth={2.3} />
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Prices */}
                      <div className="border-t border-[rgba(244,241,232,0.09)] bg-[#060B15] px-6 py-6 lg:border-l lg:border-t-0 lg:py-8">
                        <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#93A0B5]">
                          Fixed prices · Vienna
                        </p>
                        <div className="mt-4 space-y-3">
                          {v.prices.map(({ district, price }) => (
                            <div
                              key={district}
                              className="flex items-center justify-between gap-4 border-b border-[rgba(244,241,232,0.09)] pb-3 last:border-0 last:pb-0"
                            >
                              <span className="text-[0.83rem] leading-snug text-[#93A0B5]">{district}</span>
                              <span className="shrink-0 font-mono text-[1.05rem] font-semibold text-[#FFB629]">{price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <BookingCta className="md:!w-auto md:!flex-none" label="Secure fixed-price transfer" icon={ShieldCheck} />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICE TABLE ──────────────────────────────────────────────── */}
        <PriceTable />

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        {/* ── ABOUT ALEX ───────────────────────────────────────────────── */}
        <section className="bg-[#101A2C] py-20 md:py-28">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,44%)_minmax(0,56%)] lg:gap-20">

                {/* Image */}
                <ScrollReveal>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
                    <Image
                      src="https://images.unsplash.com/photo-1740485863389-a8445da2735e?q=80&w=702&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Servus Transfer airport taxi service"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 44vw, 100vw"
                    />
                    {/* Caption bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-7 pb-7 pt-20">
                      <p className="text-[1.1rem] font-bold text-[#F4F1E8]">Servus Transfer</p>
                      <p className="mt-0.5 text-[0.8rem] text-[#F4F1E8]/70">Vienna airport taxi team</p>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Text */}
                <ScrollReveal delay={100} className="py-4">
                                    <Eyebrow>About Servus Transfer</Eyebrow>
                  <Display>Meet Servus:<br />The team behind<br />the standard.</Display>
                  <p className="mt-3 text-[0.95rem] font-semibold tracking-[-0.01em] text-[#FFB629]">Built around fixed fares and punctual airport pickups.</p>
                  <p className="mt-5 text-[0.95rem] leading-[1.78] text-[#93A0B5]">
                    Servus Transfer focuses on the route travelers care about most: Vienna city addresses, hotels, stations, and Vienna Airport Schwechat. The goal is simple: a confirmed price, the right vehicle, and a pickup that matches the flight.
                  </p>
                  <p className="mt-4 text-[0.95rem] leading-[1.78] text-[#93A0B5]">
                    Every booking is handled with practical details visible before the ride: route, time, luggage, passengers, child seats, payment method, and direct contact if plans change.
                  </p>
<p className="mt-7 text-[1rem] font-bold tracking-[-0.03em] text-[#F4F1E8]">The &ldquo;Servus Standard&rdquo;</p>

                  <ul className="mt-4 space-y-3.5">
                    {[
                      { bold: 'Immaculate Vehicles:', rest: 'Spotless, meticulously maintained cars that guarantee a comfortable ride.' },
                      { bold: 'Absolute Reliability:', rest: 'We track your flight and adjust to your schedule automatically.' },
                      { bold: 'Honest Hospitality:', rest: 'A friendly face, luggage assistance, and a truly fixed price.' },
                    ].map(({ bold, rest }) => (
                      <li key={bold} className="flex gap-3">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFB629]">
                          <Check size={11} strokeWidth={3} className="text-[#F4F1E8]" />
                        </span>
                        <span className="text-[0.93rem] leading-[1.65] text-[#93A0B5]">
                          <span className="font-semibold text-[#F4F1E8]">{bold}</span> {rest}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ──────────────────────────────────────────────────── */}
        <section className="bg-[#101A2C] py-20 md:py-28">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <ScrollReveal className="mb-14">
                <Eyebrow>Reviews</Eyebrow>
                <Display>What passengers say.</Display>
              </ScrollReveal>

              <div className="grid gap-4 md:grid-cols-3">
                {reviewItems.map(({ name, review }, i) => (
                  <ScrollReveal key={name} delay={i * 80}>
                    <div className="flex flex-col gap-5 rounded-2xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C] px-7 py-7 transition-shadow duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
                      {/* Large decorative quote */}
                      <span aria-hidden="true" className="text-[4.5rem] font-black leading-none text-[#FFB629] opacity-20 -mb-4 -mt-2 select-none">&ldquo;</span>
                      <p className="flex-1 text-[0.97rem] leading-[1.75] text-[#C6CEDC]">{review}</p>
                      <div className="flex items-center justify-between border-t border-[rgba(244,241,232,0.09)] pt-4">
                        <div>
                          <StarRating />
                          <p className="mt-1.5 text-[0.86rem] font-semibold text-[#F4F1E8]">{name}</p>
                        </div>
                        {/* Google badge */}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(244,241,232,0.09)] bg-[rgba(255,255,255,0.045)] px-3 py-1.5 text-[0.72rem] font-semibold text-[#555]">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Google
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="bg-[#101A2C] py-20 md:py-28">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <div className="flex flex-col gap-6">
                  <div>
                    <Eyebrow>FAQ</Eyebrow>
                    <Display>Frequently asked questions.</Display>
                  </div>
                  <p className="text-[0.93rem] leading-[1.75] text-[#93A0B5]">
                    Answers about booking lead time, flight tracking, child seats, and payment methods.
                  </p>
                  <div className="mt-2">
                    <BookingCta />
                  </div>
                </div>

                <div className="space-y-2">
                  {faqItems.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C] px-5 py-4 open:border-[rgba(244,241,232,0.16)] open:bg-[#101A2C]"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                        <span className="text-[0.95rem] font-semibold tracking-[-0.02em] text-[#F4F1E8]">
                          {item.question}
                        </span>
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-[#FFB629] transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>
                      <p className="mt-3 pr-6 text-[0.88rem] leading-[1.72] text-[#93A0B5]">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHILD SEATS ──────────────────────────────────────────────── */}
        <section className="bg-[#101A2C] py-20 md:py-28">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="mb-12">
                <Eyebrow>Family travel</Eyebrow>
                <Display>Travel safely with your children.</Display>
                <p className="mt-4 max-w-[50rem] text-[0.95rem] leading-[1.72] text-[#93A0B5]">
                  All restraint systems are certified, regularly inspected, and provided at no extra charge on request.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {childSeats.map((seat) => (
                  <div
                    key={seat.title}
                    className="relative flex flex-col overflow-hidden rounded-2xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C]"
                  >
                    <div className="absolute right-4 top-4 h-[5.5rem] w-[5.5rem]">
                      <Image
                        src={seat.imageSrc}
                        alt={seat.altText}
                        fill
                        className="object-contain mix-blend-multiply"
                        sizes="88px"
                      />
                    </div>
                    <div className="flex flex-col gap-3 py-5 pl-6 pr-[6.5rem]">
                      <span className="inline-flex w-fit min-w-[6.25rem] justify-center rounded-full border border-[rgba(244,241,232,0.16)] bg-[rgba(255,182,41,0.10)] px-3.5 py-1.5 text-[0.77rem] font-bold text-[#FFB629]">
                        {seat.weightRange}
                      </span>
                      <div>
                        <h3 className="text-[1.15rem] font-bold tracking-[-0.04em] text-[#F4F1E8]">{seat.title}</h3>
                        <p className="mt-0.5 text-[0.8rem] font-medium text-[#93A0B5]">{seat.ageLabel}</p>
                      </div>
                      <p className="text-[0.88rem] leading-[1.7] text-[#93A0B5]">{seat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-4 rounded-xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C] px-5 py-5 md:px-6 md:py-6">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(244,241,232,0.16)] bg-[rgba(255,182,41,0.10)] text-[#FFB629]">
                  <Info size={15} strokeWidth={2.3} />
                </span>
                <p className="text-[0.87rem] leading-[1.72] text-[#93A0B5]">
                  Please specify the exact number and type of child seats in the booking form. Only with advance notice can we guarantee availability and a legally compliant, safe ride.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────────────────────────────── */}
        <section className="hidden bg-[#0A111F] py-20 text-[#F4F1E8] md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
                <div>
                  <Eyebrow light>Contact</Eyebrow>
                  <Display light>Questions about<br />your booking?</Display>
                  <p className="mt-5 max-w-[38rem] text-[0.95rem] leading-[1.75] text-[#6b7ea8]">
                    Book online in minutes. Or reach us directly by phone and WhatsApp — available 24/7.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href="tel:+436764826069"
                    aria-label="Call"
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFB629] text-[#F4F1E8] shadow-[0_12px_32px_rgba(29,92,246,0.38)] transition-all duration-200 hover:scale-105 hover:bg-[#D89400]"
                  >
                    <Phone size={22} strokeWidth={2.2} />
                  </a>
                  <a
                    href="https://wa.me/436764826069"
                    aria-label="WhatsApp"
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#22C15E] text-[#F4F1E8] shadow-[0_12px_32px_rgba(37,211,102,0.28)] transition-all duration-200 hover:scale-105 hover:bg-[#20c05c]"
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TERMINAL INFO ────────────────────────────────────────────── */}
        <section className="bg-[#101A2C] py-20 md:py-28">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="mb-10">
                <Eyebrow>Terminal 3</Eyebrow>
                <Display>Pickup guide for Vienna Airport.</Display>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[rgba(244,241,232,0.09)]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1331.7548403878466!2d16.56207266809108!3d48.11969249664487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476c54530fff4bc5%3A0xf4c32d1659fb4805!2sVIE%20Terminal%203%2C%201300%20Schwechat!5e0!3m2!1sen!2sat!4v1774133487794!5m2!1sen!2sat"
                  title="Google Maps - Vienna Airport Terminal 3 pickup location"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[300px] w-full md:h-[400px]"
                />
                <div className="grid gap-4 bg-[#101A2C] p-5 md:grid-cols-2 md:p-6">
                  {terminalPickupInfo.map(({ title, description, linkLabel, linkHref }) => (
                    <div key={title} className="rounded-xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C] px-5 py-5">
                      <h3 className="text-[0.95rem] font-bold tracking-[-0.02em] text-[#F4F1E8]">{title}</h3>
                      <p className="mt-2 text-[0.86rem] leading-[1.65] text-[#93A0B5]">{description}</p>
                      {linkLabel && linkHref ? (
                        <a
                          href={linkHref}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-[#FFB629] hover:text-[#D89400]"
                        >
                          <MapPin size={13} />
                          {linkLabel}
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {airportTips.map(({ title, description }) => (
                  <div key={title} className="rounded-xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C] px-5 py-5">
                    <h3 className="text-[0.92rem] font-bold tracking-[-0.02em] text-[#F4F1E8]">{title}</h3>
                    <p className="mt-2 text-[0.86rem] leading-[1.65] text-[#93A0B5]">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SEO TEXT BLOCK ───────────────────────────────────────────── */}
        <section className="bg-[#101A2C] py-16 md:py-20">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="rounded-2xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C] px-7 py-8 md:px-10 md:py-10">
                <Eyebrow>Vienna Airport</Eyebrow>
                <h2 className="mt-3 text-[1.85rem] font-black leading-[1.04] tracking-[-0.05em] text-[#F4F1E8] md:text-[2.1rem]">
                  Vienna airport taxi, stress-free to Vienna Airport (VIE)
                </h2>
                <div className="mt-5 space-y-3">
                  <p className="text-[0.9rem] font-semibold text-[#F4F1E8]">
                    Vienna International Airport (VIE) · 1300 Schwechat, Austria
                  </p>
                  <p className="text-[0.93rem] leading-[1.72] text-[#93A0B5]">
                    With a Vienna airport taxi, you can reach the airport quickly and comfortably. Book your ride in just a few steps immediately or in advance.
                  </p>
                  <p className="text-[0.93rem] leading-[1.72] text-[#93A0B5]">
                    On-time pickup, a fixed price, and reliable transfer service for the perfect start to your journey.
                  </p>
                </div>
                <div className="mt-8">
                  <BookingCta className="md:!w-auto md:!flex-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── POPULAR ROUTES ───────────────────────────────────────────── */}
        <section className="bg-[#101A2C] py-16 md:py-20">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="rounded-2xl border border-[rgba(244,241,232,0.09)] bg-[#101A2C] px-7 py-8 md:px-10 md:py-10">
                <Eyebrow>Routes</Eyebrow>
                <h2 className="mt-3 text-[2rem] font-black leading-[1.02] tracking-[-0.05em] text-[#F4F1E8] md:text-[2.3rem]">
                  Popular Vienna airport taxi routes.
                </h2>
                <p className="mt-2 text-[0.88rem] text-[#93A0B5]">
                  Most-booked transfers from and to Vienna Airport.
                </p>

                <div className="mt-8 grid gap-x-10 lg:grid-cols-2">
                  {popularTrips.map((trip) => (
                    <a
                      key={trip.label}
                      href={trip.href}
                      className="group flex items-center justify-between gap-4 border-b border-[rgba(244,241,232,0.09)] py-3 text-[#C6CEDC] transition-colors hover:text-[#FFB629]"
                    >
                      <span className="text-[0.8rem] leading-[1.3]">{trip.label}</span>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(244,241,232,0.09)] text-[#555] transition-colors group-hover:bg-[#FFB629] group-hover:text-[#F4F1E8]">
                        <ChevronRight size={11} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}






