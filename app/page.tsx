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
  Users,
  type LucideIcon,
} from 'lucide-react';
import HeroCalculator from '@/components/HeroCalculator';
import Navbar from '@/components/Navbar';
import PriceTable from '@/components/PriceTable';
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
      name: 'Alex Airport Taxi Vienna',
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
      name: 'Vienna Airport Taxi — Fixed Price Transfers | Alex Flughafentaxi',
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
      name: 'Alex Flughafentaxi Wien',
      alternateName: 'Alex Airport Taxi Vienna',
      url: 'https://flughafentaxi-wien.at',
      telephone: '+436764826069',
      image: 'https://flughafentaxi-wien.at/alexlogo.png',
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
      founder: { '@id': 'https://flughafentaxi-wien.at/#alex' },
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
      '@id': 'https://flughafentaxi-wien.at/#alex',
      name: 'Alex',
      jobTitle: 'Founder & Head Driver',
      description:
        'Founder of Alex Airport Taxi Vienna with over 10 years of professional driving experience on the Vienna–VIE airport route. Personally selects and trains every driver in the fleet.',
      image: 'https://images.unsplash.com/photo-1740485863389-a8445da2735e?q=80&w=702&auto=format&fit=crop',
      worksFor: { '@id': 'https://flughafentaxi-wien.at/#business' },
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Professional Airport Transfer Driver',
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

function SectionEyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  const color = onDark ? 'text-[var(--amber)] [&>span]:bg-[var(--amber)]' : 'text-[var(--amber)] [&>span]:bg-[var(--amber)]';
  return (
    <span className={`inline-flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.2em] ${color}`}>
      <span className="h-1 w-4 rounded-full" />
      {children}
    </span>
  );
}

function SectionHeading({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2
      className={`mt-3 text-[2.1rem] font-black leading-[1.0] tracking-[-0.05em] [text-shadow:0.012em_0_currentColor] md:text-[2.6rem] ${
        light ? '!text-[var(--paper)]' : 'text-[var(--paper)]'
      }`}
    >
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

function TrustTicker() {
  const items = [
    { lead: 'W-TX', copy: 'lizenziertes Wiener Taxi', tone: 'white' },
    { lead: '24/7', copy: 'auch Feiertage & Nachtfluege', tone: 'gold' },
    { lead: '* 4,9', copy: '1.240+ Bewertungen', tone: 'gold', strongCopy: true },
    { lead: '12.400+', copy: 'Flughafenfahrten', tone: 'white' },
    { lead: '98,6%', copy: 'puenktlich abgeholt', tone: 'gold' },
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
    <div className="min-h-screen bg-[var(--night)] text-[var(--paper)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section id="hero" className="relative overflow-hidden bg-[#070d18] text-[#F4F1E8]">
          <div className="mx-auto grid w-full max-w-[1780px] gap-10 px-5 pb-14 pt-[94px] sm:px-8 lg:pt-[108px] min-[1536px]:grid-cols-[minmax(0,0.9fr)_minmax(410px,540px)] min-[1536px]:items-start min-[1536px]:justify-between min-[1536px]:gap-10 min-[1536px]:px-12 min-[1536px]:pb-16 min-[1536px]:pt-[132px] min-[1900px]:min-h-[1040px] min-[1900px]:grid-cols-[minmax(0,760px)_640px] min-[1900px]:gap-14 min-[1900px]:px-[82px] min-[1900px]:pt-[166px]">
            <div className="flex flex-col">
              <div className="mb-8 inline-flex min-h-[42px] w-fit max-w-full items-center rounded-full border border-[rgba(62,207,142,0.35)] bg-[rgba(62,207,142,0.08)] px-5 py-2 font-mono text-[clamp(0.82rem,0.9vw,1rem)] text-[#3ECF8E] sm:mb-10 min-[1900px]:mb-12 min-[1900px]:h-[50px] min-[1900px]:px-6 min-[1900px]:text-[17px]">
                <span className="mr-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#3ECF8E] min-[1900px]:mr-4 min-[1900px]:h-3 min-[1900px]:w-3" />
                Heute verfuegbar, auch nachts &amp; am Wochenende
              </div>

              <h1 className="max-w-[11ch] font-display text-[clamp(3rem,5.8vw,4.5rem)] font-black leading-[1.06] tracking-[-0.015em] text-[#F4F1E8] min-[1536px]:text-[clamp(3.75rem,4.35vw,4.9rem)] min-[1900px]:max-w-none min-[1900px]:text-[clamp(4.4rem,4.6vw,5.75rem)]">
                Flughafentaxi<br />
                Wien.<br />
                <span className="text-[#FFB629]">Fixpreis.</span><br />
                <span className="text-[#FFB629]">Punkt.</span>
              </h1>

              <p className="mt-7 max-w-[700px] text-[clamp(1.05rem,1.35vw,1.42rem)] leading-[1.45] text-[#93A0B5] sm:mt-9 min-[1900px]:mt-10 min-[1900px]:text-[25px] min-[1900px]:leading-[1.5]">
                Wien ? Flughafen Schwechat zum{' '}
                <span className="font-black text-[#F4F1E8]">Fixpreis ab EUR 33 pro Fahrzeug</span>,
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

            <div className="w-full min-[1536px]:pt-5">
              <HeroCalculator />
            </div>
          </div>
        </section>

        <TrustTicker />

        {/* ── PHOTO STRIP ──────────────────────────────────────────────── */}
        <section className="bg-[var(--night)] pb-16 md:pb-20">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                {[
                  {
                    src: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470&auto=format&fit=crop',
                    alt: 'Premium interior of an Alex Airport Taxi Vienna — clean, modern vehicle for every transfer',
                    badge: 'Fixed Price',
                    bg: 'bg-[var(--paper)]',
                  },
                  {
                    src: 'https://images.unsplash.com/photo-1590253198910-1683b35ba5bf?q=40&w=800&auto=format&fit=crop&fm=webp',
                    alt: 'Vienna city centre — served by Alex Airport Taxi with fixed-price transfers to Vienna Airport (VIE)',
                    badge: 'Always on time',
                    bg: 'bg-[var(--panel)]',
                  },
                  {
                    src: 'https://images.pexels.com/photos/10302773/pexels-photo-10302773.jpeg',
                    alt: 'Vienna International Airport (VIE) — taxi pickup and drop-off point for Alex Flughafentaxi',
                    badge: 'Flight Monitoring',
                    bg: 'bg-[var(--panel-2)]',
                  },
                ].map(({ src, alt, badge, bg }) => (
                  <div key={alt} className={`relative overflow-hidden rounded-[1.5rem] md:rounded-[1.75rem] ${bg}`}>
                    <div className="relative h-[13rem] w-full md:h-[16rem]">
                      <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover opacity-90"
                        sizes="(min-width: 768px) 33vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-[var(--amber)] px-3 py-1 text-[0.75rem] font-semibold text-[var(--night)] shadow-[0_4px_12px_rgba(255,182,41,0.28)]">
                        {badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section className="bg-[var(--panel)] py-20 md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="mb-12 lg:mb-14">
                <SectionEyebrow>The Alex Standard</SectionEyebrow>
                <SectionHeading>Your premier Vienna<br className="hidden md:block" /> airport taxi service.</SectionHeading>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
                {features.map(({ title, description, icon: Icon }) => (
                  <article
                    key={title}
                    className="group flex flex-col gap-6 rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-7 py-7 transition-all duration-200 hover:border-[rgba(255,182,41,.35)] hover:bg-[var(--panel)] hover:shadow-[0_20px_50px_rgba(255,182,41,0.08)] md:px-8 md:py-8"
                  >
                    <div className="flex items-start justify-between">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-[var(--line)] bg-[var(--panel)] text-[var(--amber)] shadow-[0_8px_20px_rgba(255,182,41,0.1)]">
                        <Icon size={21} strokeWidth={2.1} />
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[1.2rem] font-bold tracking-[-0.04em] text-[var(--paper)]">{title}</h3>
                      <p className="mt-2.5 text-[0.9rem] leading-[1.65] text-[var(--muted)]">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VEHICLES ─────────────────────────────────────────────────── */}
        <section className="bg-[var(--night)] py-20 md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="mb-12 lg:mb-14">
                <SectionEyebrow>Vehicle categories</SectionEyebrow>
                <SectionHeading>Choose your vehicle for the airport transfer.</SectionHeading>
              </div>

              <div className="space-y-4">
                {vehicles.map((v) => (
                  <div
                    key={v.type}
                    className="grid gap-0 rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)] shadow-[0_6px_20px_rgba(0,0,0,0.22)] transition-shadow hover:shadow-[0_10px_30px_rgba(255,182,41,0.08)] lg:grid-cols-[20rem_minmax(0,1fr)_minmax(16rem,0.8fr)] lg:items-center lg:gap-8 lg:px-8 lg:py-7"
                  >
                    {/* Vehicle image */}
                    <div className="relative h-[13rem] w-full overflow-hidden rounded-t-[1.75rem] lg:h-[13rem] lg:rounded-none">
                      <Image
                        src={v.imageSrc}
                        alt={v.altText}
                        fill
                        className="scale-[1.15] object-contain object-center "
                        sizes="(min-width: 1024px) 320px, 100vw"
                      />
                    </div>

                    {/* Description + specs */}
                    <div className="px-6 pb-5 pt-4 lg:px-0 lg:py-0">
                      <h3 className="text-[1.45rem] font-bold tracking-[-0.04em] text-[var(--paper)] lg:text-[1.55rem] lg:tracking-[-0.05em]">{v.title}</h3>
                      <p className="mt-2 text-[0.9rem] leading-[1.6] text-[var(--muted)]">{v.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2 lg:mt-5">
                        {[
                          { icon: Users, value: `${v.passengers} passengers` },
                          { icon: Briefcase, value: `${v.suitcases} suitcases` },
                        ].map(({ icon: Icon, value }) => (
                          <span
                            key={value}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--paper)]"
                          >
                            <Icon size={12} className="text-[var(--amber)]" strokeWidth={2.3} />
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price list */}
                    <div className="mx-4 mb-5 rounded-[1.2rem] border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-5 py-4 lg:mx-0 lg:my-0">
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--amber)]">
                        Fixed prices · Vienna
                      </p>
                      <div className="mt-3 space-y-2.5">
                        {v.prices.map(({ district, price }) => (
                          <div
                            key={district}
                            className="flex items-center justify-between border-b border-[var(--line)] pb-2 last:border-0 last:pb-0"
                          >
                            <span className="text-[0.85rem] text-[var(--muted)]">{district}</span>
                            <span className="text-[0.98rem] font-bold text-[var(--paper)]">{price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
        <section className="bg-[var(--panel)] py-20 md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="mb-12 lg:mb-14">
                <SectionEyebrow>How it works</SectionEyebrow>
                <SectionHeading>Book in three steps.</SectionHeading>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {bookingSteps.map(({ num, title, description }) => (
                  <div
                    key={num}
                    className="flex flex-col gap-5 rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-7 py-7 md:px-8 md:py-8"
                  >
                    <span aria-hidden="true" className="text-[3.8rem] font-black leading-none tracking-[-0.07em] text-[var(--muted)]">
                      {num}
                    </span>
                    <div>
                      <h3 className="text-[1.12rem] font-bold tracking-[-0.03em] text-[var(--paper)]">{title}</h3>
                      <p className="mt-2 text-[0.9rem] leading-[1.65] text-[var(--muted)]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT ALEX ───────────────────────────────────────────────── */}
        <section className="bg-[var(--night)] py-24 md:py-32">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] lg:gap-20">

                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem]">
                  <Image
                    src="https://images.unsplash.com/photo-1740485863389-a8445da2735e?q=80&w=702&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Alex, founder of Alex Airport Taxi"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </div>

                {/* Text */}
                <div className="py-4 lg:py-8">
                  <SectionEyebrow>About Alex</SectionEyebrow>
                  <SectionHeading>Meet Alex: The Driver<br className="hidden md:block" /> Behind the Standard.</SectionHeading>
                  <p style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }} className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--amber)]">Over 10 years of experience on Vienna&apos;s roads.</p>
                  <p className="mt-4 text-[0.95rem] leading-[1.75] text-[var(--muted)]">
                    For over a decade, Alex drove the route to Vienna Airport Schwechat. He saw firsthand exactly what frustrated travelers the most: hidden fees, unmaintained cars, and stressed drivers who treated passengers like numbers. He knew that airport transfers needed to bring hospitality back to the industry.
                  </p>
                  <p style={{ marginTop: '1.5rem' }} className="text-[0.95rem] leading-[1.75] text-[var(--muted)]">
                    That is why Alex transitioned from a solo driver to a boutique fleet owner.
                  </p>
                  <p style={{ marginTop: '1.5rem' }} className="text-[1.05rem] font-bold tracking-[-0.03em] text-[var(--paper)]">What is the &ldquo;Alex Standard&rdquo;?</p>
                  <p style={{ marginTop: '1.5rem' }} className="text-[0.95rem] leading-[1.75] text-[var(--muted)]">
                    Today, Alex Airport Taxi is not a faceless agency. Alex has personally hand-picked and trained a small, dedicated team of professional drivers. Every driver in our fleet is required to deliver the exact same level of care that Alex built his reputation on:
                  </p>
                  <ul className="mt-5 space-y-3">
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)]">
                        <Check size={12} strokeWidth={3} className="text-[var(--night)]" />
                      </span>
                      <span className="text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                        <span className="font-semibold text-[var(--paper)]">Immaculate Vehicles:</span> Spotless, meticulously maintained cars that guarantee a comfortable ride.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)]">
                        <Check size={12} strokeWidth={3} className="text-[var(--night)]" />
                      </span>
                      <span className="text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                        <span className="font-semibold text-[var(--paper)]">Absolute Reliability:</span> We track your flight and adjust to your schedule automatically.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)]">
                        <Check size={12} strokeWidth={3} className="text-[var(--night)]" />
                      </span>
                      <span className="text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                        <span className="font-semibold text-[var(--paper)]">Honest Hospitality:</span> A friendly face, luggage assistance, and the guarantee that your fixed price is truly fixed.
                      </span>
                    </li>
                  </ul>
                  <p className="mt-7 text-[0.95rem] leading-[1.75] text-[var(--muted)]">
                    When you book with our team, you get the reliability of a 10-year industry veteran built into every single trip.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ──────────────────────────────────────────────────── */}
        <section className="bg-[var(--panel)] py-20 md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="mb-12">
                <SectionEyebrow>Reviews</SectionEyebrow>
                <SectionHeading>What passengers say.</SectionHeading>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {reviewItems.map(({ name, review }) => (
                  <div
                    key={name}
                    className="flex flex-col gap-5 rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)] px-6 py-6 md:px-7 md:py-7"
                  >
                    <p className="text-[1.35rem] tracking-wide text-[var(--amber)]">★★★★★</p>
                    <p className="flex-1 text-[0.97rem] leading-[1.7] text-[var(--paper)]">&quot;{review}&quot;</p>
                    <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
                      <span className="text-[0.88rem] font-semibold text-[var(--paper)]">{name}</span>
                      <span className="rounded-full border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-3 py-1 text-[0.72rem] font-semibold text-[var(--amber)]">
                        Google
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="bg-[var(--panel)] py-20 md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                <div className="flex flex-col gap-6">
                  <div>
                    <SectionEyebrow>FAQ</SectionEyebrow>
                    <SectionHeading>Frequently asked questions.</SectionHeading>
                  </div>
                  <p className="text-[0.93rem] leading-[1.7] text-[var(--muted)]">
                    Answers about booking lead time, flight tracking, child seats, and payment methods.
                  </p>
                  <div className="mt-2">
                    <BookingCta />
                  </div>
                </div>

                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-[1.35rem] border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-5 py-4 open:border-[rgba(255,182,41,.35)] open:bg-[var(--panel)]"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                        <span className="text-[0.96rem] font-semibold tracking-[-0.02em] text-[var(--paper)]">
                          {item.question}
                        </span>
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-[var(--muted)] transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>
                      <p className="mt-3 pr-6 text-[0.88rem] leading-[1.7] text-[var(--muted)]">
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
        <section className="bg-[var(--night)] py-20 md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="mb-12">
                <SectionEyebrow>Child seats</SectionEyebrow>
                <SectionHeading>Travel safely with your family.</SectionHeading>
                <p className="mt-4 max-w-[50rem] text-[0.95rem] leading-[1.7] text-[var(--muted)]">
                  All restraint systems are certified, regularly inspected, and provided at no extra charge on request.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {childSeats.map((seat) => (
                  <div
                    key={seat.title}
                    className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)]"
                  >
                    <div className="absolute right-4 top-4 h-[5.5rem] w-[5.5rem]">
                      <Image
                        src={seat.imageSrc}
                        alt={seat.altText}
                        fill
                        className="object-contain "
                        sizes="88px"
                      />
                    </div>
                    <div className="flex flex-col gap-3 py-5 pl-6 pr-[6.5rem]">
                      <span className="inline-flex w-fit min-w-[6.25rem] justify-center rounded-full border border-[var(--line)] bg-[rgba(255,182,41,.12)] px-3.5 py-1.5 text-[0.77rem] font-bold text-[var(--amber)]">
                        {seat.weightRange}
                      </span>
                      <div>
                        <h3 className="text-[1.15rem] font-bold tracking-[-0.04em] text-[var(--paper)]">{seat.title}</h3>
                        <p className="mt-0.5 text-[0.8rem] font-medium text-[var(--muted)]">{seat.ageLabel}</p>
                      </div>
                      <p className="text-[0.88rem] leading-[1.7] text-[var(--muted)]">{seat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-4 rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 md:px-6 md:py-6">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,182,41,.12)] text-[var(--amber)]">
                  <Info size={15} strokeWidth={2.3} />
                </span>
                <p className="text-[0.87rem] leading-[1.72] text-[var(--muted)]">
                  Please specify the exact number and type of child seats in the booking form. Only with advance notice can we guarantee availability and a legally compliant, safe ride.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────────────────────────────── */}
        <section className="bg-[var(--night)] py-20 text-[var(--paper)] md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
                <div>
                  <SectionEyebrow onDark>Contact</SectionEyebrow>
                  <SectionHeading light>Questions about your booking?</SectionHeading>
                  <p className="mt-4 max-w-[40rem] text-[0.95rem] leading-[1.72] text-[var(--muted)]">
                    Book online in minutes. Or reach us directly by phone and WhatsApp — available 24 / 7.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href="tel:+436764826069"
                    aria-label="Call"
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--night)] shadow-[0_12px_30px_rgba(255,182,41,0.28)] transition-colors hover:bg-[var(--amber-deep)]"
                  >
                    <Phone size={22} strokeWidth={2.2} />
                  </a>
                  <a
                    href="https://wa.me/436764826069"
                    aria-label="WhatsApp"
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--green)] text-[var(--night)] shadow-[0_12px_30px_rgba(62,207,142,0.24)] transition-colors hover:bg-[var(--green)]"
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TERMINAL INFO ────────────────────────────────────────────── */}
        <section className="bg-[var(--panel)] py-20 md:py-24">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="mb-10">
                <SectionEyebrow>Terminal 3</SectionEyebrow>
                <SectionHeading>Pickup guide for Vienna Airport.</SectionHeading>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)]">
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
                <div className="grid gap-4 bg-[rgba(255,255,255,.045)] p-5 md:grid-cols-2 md:p-6">
                  {terminalPickupInfo.map(({ title, description, linkLabel, linkHref }) => (
                    <div key={title} className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel)] px-5 py-5">
                      <h3 className="text-[0.95rem] font-bold tracking-[-0.02em] text-[var(--paper)]">{title}</h3>
                      <p className="mt-2 text-[0.86rem] leading-[1.65] text-[var(--muted)]">{description}</p>
                      {linkLabel && linkHref ? (
                        <a
                          href={linkHref}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-[var(--amber)] hover:text-[var(--amber-deep)]"
                        >
                          <MapPin size={13} />
                          {linkLabel}
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {airportTips.map(({ title, description }) => (
                  <div key={title} className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-5 py-5">
                    <h3 className="text-[0.92rem] font-bold tracking-[-0.02em] text-[var(--paper)]">{title}</h3>
                    <p className="mt-2 text-[0.86rem] leading-[1.65] text-[var(--muted)]">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SEO TEXT BLOCK ───────────────────────────────────────────── */}
        <section className="bg-[var(--night)] py-16 md:py-20">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)] px-7 py-8 md:px-10 md:py-10">
                <SectionEyebrow>Vienna Airport</SectionEyebrow>
                <h2 className="mt-3 text-[1.85rem] font-black leading-[1.04] tracking-[-0.05em] text-[var(--paper)] md:text-[2.1rem]">
                  Vienna airport taxi, stress-free to Vienna Airport (VIE)
                </h2>
                <div className="mt-5 space-y-3">
                  <p className="text-[0.9rem] font-semibold text-[var(--paper)]">
                    Vienna International Airport (VIE) · 1300 Schwechat, Austria
                  </p>
                  <p className="text-[0.93rem] leading-[1.72] text-[var(--muted)]">
                    With a Vienna airport taxi, you can reach the airport quickly and comfortably. Book your ride in just a few steps immediately or in advance.
                  </p>
                  <p className="text-[0.93rem] leading-[1.72] text-[var(--muted)]">
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
        <section className="bg-[var(--panel)] py-16 md:py-20">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,.045)] px-7 py-8 md:px-10 md:py-10">
                <SectionEyebrow>Routes</SectionEyebrow>
                <h2 className="mt-3 text-[2rem] font-black leading-[1.02] tracking-[-0.05em] text-[var(--paper)] md:text-[2.3rem]">
                  Popular Vienna airport taxi routes.
                </h2>
                <p className="mt-2 text-[0.88rem] text-[var(--muted)]">
                  Most-booked transfers from and to Vienna Airport.
                </p>

                <div className="mt-8 grid gap-x-10 lg:grid-cols-2">
                  {popularTrips.map((trip) => (
                    <a
                      key={trip.label}
                      href={trip.href}
                      className="group flex items-center justify-between gap-4 border-b border-[var(--line)] py-3 text-[var(--paper)] transition-colors hover:text-[var(--amber)]"
                    >
                      <span className="text-[0.8rem] leading-[1.3]">{trip.label}</span>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--line)] text-[var(--paper)] transition-colors group-hover:bg-[var(--amber)] group-hover:text-[var(--night)]">
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
