import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Baby,
  Check,
  ChevronDown,
  ChevronRight,
  Briefcase,
  CreditCard,
  Hourglass,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Star,
  Wifi,
} from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
import PriceTable from '@/components/PriceTable';
import VehicleCategoryCard from '@/components/VehicleCategoryCard';
import { buildAbsoluteMetadata } from '@/lib/seo/metadata';
import { WhatsAppIcon } from '@/components/ui/ContactIcons';
import SectionIntro from '@/components/ui/SectionIntro';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return buildAbsoluteMetadata('home', params?.lang);
}

type VehicleCategory = {
  key: 'limousine' | 'kombi' | 'bus';
  title: string;
  description: string;
  imageSrc: string;
  specs: { icon: 'users' | 'briefcase' | 'shoppingBag'; value: string }[];
  prices: { district: string; price: string }[];
};

type HomeLang = 'de' | 'en';
type ChildSeatKey = 'babySeat' | 'childSeat' | 'boosterSeat';
type ChildSeatOption = {
  key: ChildSeatKey;
  title: string;
  weightRange: string;
  ageLabel: string;
  description: string;
  imageAlt: string;
};
type ChildSeatSectionContent = {
  eyebrow: string;
  title: string;
  description: string;
  lead: string;
  detailTitle: string;
  options: ChildSeatOption[];
  disclaimerTitle: string;
  disclaimer: string;
};

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
    answer:
      'Pets can travel in suitable transport boxes. Please let us know in advance.',
  },
  {
    question: 'Are there extra costs for delays?',
    answer:
      'We monitor your flight and adjust the pickup time. There are no extra costs for delays outside your control.',
  },
  {
    question: 'Can I also book from my hotel to the airport?',
    answer:
      'Yes, our service works in both directions. Enter your pickup address when booking.',
  },
  {
    question: 'Which payment methods are available?',
    answer:
      'You can pay by cash, card, or mobile payment and receive a digital invoice.',
  },
];

const whyUsItems = [
  {
    title: 'Fixpreis garantiert',
    description:
      'Der Preis wird vorab vereinbart, sodass Sie keine versteckten Gebuehren erwarten.',
  },
  {
    title: 'Puenktlich und planbar',
    description:
      'Wir verfolgen Ihren Flug und holen Sie puenktlich am Terminal ab. Persoenliche Abholung mit Namensschild ist gegen Aufpreis moeglich.',
  },
  {
    title: 'Komfort und Sicherheit',
    description:
      'Moderne, klimatisierte Fahrzeuge mit regelmaessiger Wartung, Kindersitzen auf Anfrage und erfahrenen Fahrer*innen.',
  },
  {
    title: '24/7-Verfuegbarkeit',
    description:
      'Unser Service steht rund um die Uhr an sieben Tagen der Woche bereit, erreichbar per Telefon und WhatsApp.',
  },
];

const transferFeatureRows = [
  'Fixed price guaranteed',
  'Direct pickup',
  'On-time transfer',
  'Comfortable vehicles',
] as const;

const transferFeatureCards = [
  {
    title: 'Vienna -> Schwechat Airport',
    description: 'Fast and direct to your departure, without unnecessary detours.',
  },
  {
    title: 'Pickup after landing',
    description: 'Direct onward travel from Vienna Airport back into the city.',
  },
  {
    title: 'Fixed price known in advance',
    description: 'Calculated and clearly communicated before your ride, with no hidden costs.',
  },
  {
    title: 'Reliably planned',
    description: 'Dependably organized for a relaxed and punctual journey.',
  },
] as const;

const whyUsEditorialItems = [
  {
    title: 'Direkter Kontakt statt Callcenter',
    description:
      'Sie erreichen uns schnell per Telefon oder WhatsApp und erhalten klare Rueckmeldung zu Ihrer Fahrt.',
  },
  {
    title: 'Abholung mit Blick auf Ihren Flug',
    description:
      'Wir verfolgen Ankunftszeiten und passen die Abholung bei veraenderten Landungen entsprechend an.',
  },
  {
    title: 'Sauberer Auftritt bis zur Ankunft',
    description:
      'Gepflegte Fahrzeuge, ruhige Fahrweise und ein planbarer Ablauf sorgen fuer einen entspannten Transfer.',
  },
];

const whyUsStats = [
  { value: '24/7', label: 'Erreichbar fuer Buchung und Rueckfragen' },
  { value: 'Fixpreis', label: 'Vor Fahrtbeginn transparent abgestimmt' },
  { value: 'Direkt', label: 'Ohne Umwege zu Hotel, Bahnhof oder Flughafen' },
  { value: 'Flexibel', label: 'Kindersitze und Sonderwuensche auf Anfrage' },
];

const whyUsTimelineItems = [
  {
    step: '01',
    title: 'Einfach anfragen',
    description:
      'Route, Uhrzeit und Sonderwuensche werden in wenigen Schritten uebermittelt, ohne komplizierten Buchungsprozess.',
  },
  {
    step: '02',
    title: 'Verbindlich bestaetigt',
    description:
      'Sie erhalten eine klare Rueckmeldung zum Preis und zur Abholung, damit vor Fahrtbeginn alles abgestimmt ist.',
  },
  {
    step: '03',
    title: 'Stressfrei ankommen',
    description:
      'Am Fahrtag laeuft der Transfer ruhig und planbar ab, vom Treffpunkt bis zur Ankunft am Ziel.',
  },
];

const vehicleCategoryHighlights = [
  {
    title: 'Sedan',
    audience: 'Fuer Einzelpersonen und Paare',
    summary: 'Kompakt, schnell verfuegbar und ideal fuer klassische Transfers mit wenig Gepaeck.',
    price: 'ab 39 EUR',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
  },
  {
    title: 'Station wagon',
    audience: 'Fuer Familien und Gruppen',
    summary: 'Mehr Platz fuer Koffer, Kinderwagen oder mehrere Mitreisende ohne Komfortverlust.',
    price: 'ab 45 EUR',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/kombi.jpg',
  },
  {
    title: 'Minivan',
    audience: 'Fuer groessere Gruppen',
    summary: 'Die passende Wahl, wenn mehrere Fahrgaeste gemeinsam und planbar ankommen sollen.',
    price: 'ab 69 EUR',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/bus.jpg',
  },
];

const heroSectionPaddingClass =
  'app-container relative pb-10 pt-[calc(66px+48px)] md:pb-12 md:pt-[calc(72px+48px)] lg:pb-14 lg:pt-[calc(72px+48px)]';
const heroHeadlineClass =
  'mx-auto mt-[16px] max-w-[24ch] text-center text-[30px] font-black leading-[1.02] tracking-normal text-[#111111] [-webkit-text-stroke:1px_currentColor] [text-shadow:0.015em_0_currentColor] md:mt-4 md:max-w-none md:text-[40px] md:leading-[0.98] md:[-webkit-text-stroke:1px_currentColor] md:[text-shadow:0.012em_0_currentColor] lg:mx-0 lg:text-left';
const heroGridClass =
  'grid items-start gap-10 lg:grid-cols-[0.98fr_0.72fr] lg:items-stretch lg:gap-20 xl:gap-24';
const heroBookingColumnClass = 'mt-10 self-start text-left lg:mt-12';
const heroBookingCardClass =
  'relative mt-8 w-full max-w-[46rem] text-left md:mt-10';
const homepageSectionWidthClass = 'mx-auto max-w-[57.5rem]';

const heroBenefitCards = [
  {
    title: 'Child Seats',
    description: 'Free on request',
    icon: Baby,
    iconClassName: 'text-[#f59e0b]',
  },
  {
    title: 'Free WiFi',
    description: 'In all vehicles',
    icon: Wifi,
    iconClassName: 'text-[#1F7CFF]',
  },
  {
    title: 'All Payments',
    description: 'Cash, card, Apple Pay',
    icon: CreditCard,
    iconClassName: 'text-[#1679FF]',
  },
  {
    title: 'Flight Tracking',
    description: 'We adjust for delays',
    icon: ShieldCheck,
    iconClassName: 'text-[#1F7CFF]',
  },
] as const;

const vehicleCategories: VehicleCategory[] = [
  {
    key: 'limousine',
    title: 'Sedan',
    description: 'Affordable option for solo travelers or couples',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
    specs: [
      { icon: 'users', value: '2' },
      { icon: 'briefcase', value: '2' },
      { icon: 'shoppingBag', value: '2' },
    ],
    prices: [
      { district: '1st - 10th district', price: '42 EUR' },
      { district: '11th district', price: '39 EUR' },
      { district: '12th - 23rd district', price: '45 EUR' },
    ],
  },
  {
    key: 'kombi',
    title: 'Station Wagon',
    description: 'Ideal for groups and families - more room for luggage.',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/kombi.jpg',
    specs: [
      { icon: 'users', value: '4' },
      { icon: 'briefcase', value: '4' },
      { icon: 'shoppingBag', value: '4' },
    ],
    prices: [
      { district: '1st - 10th district', price: '48 EUR' },
      { district: '11th district', price: '45 EUR' },
      { district: '12th - 23rd district', price: '51 EUR' },
    ],
  },
  {
    key: 'bus',
    title: 'Minivan',
    description: 'Ideal for larger groups - plenty of space for passengers and luggage.',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/bus.jpg',
    specs: [
      { icon: 'users', value: '8' },
      { icon: 'briefcase', value: '8' },
      { icon: 'shoppingBag', value: '8' },
    ],
    prices: [
      { district: '1st - 10th district', price: '72 EUR' },
      { district: '11th district', price: '69 EUR' },
      { district: '12th - 23rd district', price: '75 EUR' },
    ],
  },
];

const childSeatImageSources = {
  babySeat: '/alex-flughafentaxi-wien-babyschale-gratis.jpg',
  childSeat: '/alex-flughafentaxi-wien-kindersitz-sicherheit.jpg',
  boosterSeat: '/alex-flughafentaxi-wien-sitzerhoehung-gratis.jpg',
} as const;

const childSeatMobileHeaderGapClass = 'gap-4';
const childSeatDesktopSubtitleGapClass = 'md:mt-4';
const childSeatDesktopDescriptionGapClass = 'md:mt-5';

const localizedHomeMediaContent: Record<
  HomeLang,
  {
    vehicleImageAlts: {
      limousine: string;
      kombi: string;
      bus: string;
    };
    childSeatSection: ChildSeatSectionContent;
  }
> = {
  de: {
    vehicleImageAlts: {
      limousine: 'Alex Flughafentaxi Wien Limousine Fixpreis',
      kombi: 'Alex Flughafentaxi Wien Kombi fuer viel Gepaeck',
      bus: 'Alex Flughafentaxi Wien Bus fuer Gruppen und viel Gepaeck',
    },
    childSeatSection: {
      eyebrow: 'Child Seats',
      title: 'Travel safely with Alex Airport Taxi Vienna',
      description:
        'If you are looking for an airport taxi in Vienna for your family, safety comes first. Alex Airport Taxi provides only certified, regularly checked child restraint systems so you can travel comfortably at a fixed price.',
      lead:
        'Trust Alex Airport Taxi to bring your whole family safely, on time, and comfortably to your destination.',
      detailTitle: 'Detailed seat specifications:',
      options: [
        {
          key: 'babySeat',
          title: 'Baby Seat',
          weightRange: '0-13 kg',
          ageLabel: 'For newborns & infants.',
          description:
            'Group 0+: These seats are designed for newborns from day one. They are installed rear-facing to protect the sensitive neck area during braking. Essential for a safe first transfer in our airport taxi.',
          imageAlt:
            'Free baby seat in Alex Airport Taxi Vienna for a safe baby transfer.',
        },
        {
          key: 'childSeat',
          title: 'Child Seat',
          weightRange: '9-18 kg',
          ageLabel: 'Secure support for toddlers.',
          description:
            'Group 1/2: Once your child can sit steadily, we use our toddler seat. With a robust 5-point harness and reinforced side-impact protection, it provides maximum stability during the ride.',
          imageAlt:
            'Certified child seat for toddlers in Alex Airport Taxi Vienna - safety comes first.',
        },
        {
          key: 'boosterSeat',
          title: 'Booster Seat',
          weightRange: '15-36 kg',
          ageLabel: 'Optimal belt positioning for school-age children.',
          description:
            'Group 2/3: For older children up to approx. 12 years old (or 150 cm), we provide ergonomic booster seats. They help position the vehicle seat belt correctly over the shoulder and pelvis, which is essential for protection.',
          imageAlt:
            'Free booster seat for older children during a ride with Alex Airport Taxi Vienna.',
        },
      ],
      disclaimerTitle: '',
      disclaimer:
        'Please enter the exact number and type of child seats required in the booking form (baby seat, child seat, or booster seat). Only with advance information can we guarantee availability and a legally compliant, safe ride. Please also note the maximum luggage capacity of your selected vehicle.',
    },
  },
  en: {
    vehicleImageAlts: {
      limousine: 'Alex airport taxi Vienna limousine fixed price',
      kombi: 'Alex airport taxi Vienna estate car for extra luggage',
      bus: 'Alex airport taxi Vienna minibus for groups and extra luggage',
    },
    childSeatSection: {
      eyebrow: 'Child Seats',
      title: 'Travel safely with Alex airport taxi Vienna',
      description:
        'If you are looking for an airport taxi in Vienna for your family, safety comes first. Alex Flughafentaxi therefore provides only certified, regularly checked child restraint systems to ensure a relaxed ride at a fixed price.',
      lead:
        'Trust Alex Flughafentaxi to bring your whole family safely, on time and in comfort to the destination.',
      detailTitle: 'Detailed seat specifications:',
      options: [
        {
          key: 'babySeat',
          title: 'Baby Seat',
          weightRange: '0-13 kg',
          ageLabel: 'For newborns & infants.',
          description:
            'Group 0+: These seats are designed for newborns from day one. Installation is always rear-facing to protect the sensitive neck area during braking. A must for the first safe transfer in our airport taxi.',
          imageAlt:
            'Free baby seat in Alex airport taxi Vienna for a safe baby transfer.',
        },
        {
          key: 'childSeat',
          title: 'Child Seat',
          weightRange: '9-18 kg',
          ageLabel: 'Secure hold for toddlers.',
          description:
            'Group 1/2: Once your child can sit steadily, our toddler seat is used. With a robust 5-point harness and reinforced side-impact protection, it provides maximum stability during the ride.',
          imageAlt:
            'Certified child seat for toddlers in Alex airport taxi Vienna - safety comes first.',
        },
        {
          key: 'boosterSeat',
          title: 'Booster Seat',
          weightRange: '15-36 kg',
          ageLabel: 'Optimal belt positioning for school kids.',
          description:
            'Group 2/3: For older children up to approx. 12 years (or 150 cm), we provide ergonomic boosters. They ensure that the vehicle seat belt runs correctly over the shoulder and hips, which is crucial for protection.',
          imageAlt:
            'Free booster seat for older children during a ride with Alex airport taxi Vienna.',
        },
      ],
      disclaimerTitle: 'Important for your Vienna airport taxi:',
      disclaimer:
        'Please enter the exact number and type of child seats required in the booking form (baby seat, child seat or booster seat). Only with advance notice can we guarantee availability and a legally compliant, safe ride. Please also note the maximum luggage capacity of your chosen vehicle.',
    },
  },
};

const popularTrips = [
  'Von Terminal 1 Vienna Airport nach Wien Hauptbahnhof',
  'Von Stephansplatz nach Terminal 3 Vienna Airport',
  'Von Terminal 1 Vienna Airport nach Schoenbrunn Palace',
  'Von Wien Westbahnhof nach Terminal 3 Vienna Airport',
  'Von Praterstern nach Terminal 3 Vienna Airport',
  'Von Terminal 1 Vienna Airport nach Stephansplatz',
  'Von Schwedenplatz nach Terminal 3 Vienna Airport',
  'Von Terminal 1 Vienna Airport nach Wien Westbahnhof',
  'Von Ernst-Happel-Stadion nach Terminal 3 Vienna Airport',
  'Von Vienna Central Train Station nach Terminal 3 Vienna Airport',
];

const bookingSteps = ['1. Route waehlen', '2. Details eingeben', '3. Bestaetigen'];

const reviewItems = [
  {
    name: 'Anna M.',
    review: 'Top service, always on time and super easy to book.',
  },
  {
    name: 'David K.',
    review: 'Clean car, fair fixed price and smooth pickup at the airport.',
  },
  {
    name: 'Sophie R.',
    review: 'Very reliable. WhatsApp support was fast and helpful.',
  },
];

function ChildSeatWeightChip({ weightRange }: { weightRange: string }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full border border-[#dbe7f8] bg-white px-3 py-1 text-[0.82rem] font-semibold tracking-[-0.01em] text-[#111827] shadow-[0_8px_18px_rgba(17,17,17,0.06)]">
      {weightRange}
    </span>
  );
}

function ChildSeatPreviewImage({
  seat,
  frameClassName,
  imageClassName = 'object-contain p-[12%]',
  pillClassName = 'absolute right-2 top-2 z-10',
}: {
  seat: ChildSeatOption;
  frameClassName: string;
  imageClassName?: string;
  pillClassName?: string;
}) {
  return (
    <div className={frameClassName}>
      <div className={pillClassName}>
        <ChildSeatWeightChip weightRange={seat.weightRange} />
      </div>
      <div className="relative h-full w-full">
        <Image
          src={childSeatImageSources[seat.key]}
          alt={seat.imageAlt}
          fill
          className={`${imageClassName} transition-transform duration-500 ease-out group-hover:scale-[1.06]`}
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 36vw, 100vw"
        />
      </div>
    </div>
  );
}

const terminalPickupInfo = [
  {
    title: 'Where will I be dropped off?',
    description:
      "You'll be dropped off curbside at the terminal that you specify when requesting your ride. If you don't know your terminal, you can input your airline in note field when booking your ride or share directly with driver.",
  },
  {
    title: 'Where will I be picked up?',
    description:
      'After exiting the baggage claim area into the arrivals hall, turn right and you will see Burger King. Exit the terminal at this point, cross the street to the opposite side, and proceed toward the parking area.',
    linkLabel: 'Click here to view the exact pickup location',
    linkHref: 'https://maps.app.goo.gl/Yzv6rhxJBWNjLLMP7',
  },
];

const airportTips = [
  {
    title: 'Terminal-Tipps',
    description:
      'Ihr Boardingpass zeigt Ihnen den richtigen Terminal: Gates B/C/D bedeuten Check-in in Terminal 1; Gates F/G bedeuten Check-in in Terminal 3. Star-Alliance-Fluggesellschaften wie Austrian Airlines nutzen vorrangig T3, waehrend Billig- und Charterairlines oftmals T1A waehlen.',
  },
  {
    title: 'Wann sollte ich am Flughafen sein?',
    description:
      'Fuer Fluege innerhalb Europas wird empfohlen, etwa 2 Stunden vor Abflug am Flughafen zu sein. Fuer Non-Schengen- und Langstreckenfluege sind 3 Stunden ratsam, fuer USA-Fluege sogar 3 1/2-4 Stunden. Reisen Sie mit Sondergepaeck oder in Gruppen, planen Sie zusaetzliche Zeit ein.',
  },
];

function PrimaryBookingCta({ className = 'mt-8 flex justify-center md:mt-10' }: { className?: string }) {
  return (
    <div className={className}>
      <Link href="/book" className="ui-button-booking-primary">
        Book Now
      </Link>
    </div>
  );
}

function HeroBookingCard() {
  return (
    <div id="hero-booking" className="relative w-full max-w-[46rem]">
      <div className={heroBookingCardClass}>
        <div className="min-h-0 lg:flex-1 lg:min-h-0">
          <BookingForm heroEnglishCopy />
        </div>
      </div>
    </div>
  );
}

function HeroImageCard() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-[35rem] flex-col lg:mt-12">
      <div className="relative h-[17rem] overflow-hidden rounded-[1.9rem] shadow-[0_30px_80px_rgba(15,23,42,0.13)] md:h-[22rem] md:rounded-[2.25rem]">
        <Image
          src="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/heroimage.jpg"
          alt="Alex Flughafentaxi Wien"
          fill
          priority
          fetchPriority="high"
          quality={72}
          className="object-cover"
          sizes="(min-width: 1024px) 35rem, (min-width: 768px) 46vw, 92vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(15,23,42,0.12)_100%)]" />
      </div>

      <div className="absolute left-4 top-5 z-10 inline-flex items-center gap-3 rounded-[1.15rem] bg-white px-4 py-3 text-[#0f172a] shadow-[0_18px_40px_rgba(15,23,42,0.14)] md:-left-6 md:top-7 md:px-5">
        <Star size={18} className="fill-[#eab308] text-[#eab308]" strokeWidth={2.2} />
        <span className="text-[1rem] font-black tracking-[-0.03em] md:text-[1.05rem]">
          4.9/5 Rating
        </span>
      </div>

      <div className="absolute right-4 top-[13.5rem] z-10 inline-flex items-center gap-3 rounded-[1.15rem] bg-white px-4 py-3 text-[#0f172a] shadow-[0_18px_40px_rgba(15,23,42,0.14)] md:-right-5 md:top-[16.5rem] md:px-5">
        <Hourglass size={18} className="text-[#38bdf8]" strokeWidth={2.2} />
        <span className="text-[1rem] font-black tracking-[-0.03em] md:text-[1.05rem]">
          60m Free Waiting
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10">
        {heroBenefitCards.map(({ title, description, icon: Icon, iconClassName }) => (
          <div
            key={title}
            className="rounded-[1.35rem] border border-[#dfe7f2] bg-[#f8fbff]/70 px-5 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)]"
          >
            <div className="flex items-center gap-2.5">
              <Icon size={18} className={iconClassName} strokeWidth={2.25} />
              <p className="text-[1rem] font-black leading-tight tracking-[-0.035em] text-[#0f172a]">
                {title}
              </p>
            </div>
            <p className="mt-3 text-[0.92rem] leading-6 text-[#64748b]">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const activeLang: HomeLang = params?.lang?.toLowerCase() === 'en' ? 'en' : 'de';
  const localizedMediaContent = localizedHomeMediaContent[activeLang];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <main>

      <section id="hero" className="relative overflow-hidden bg-[var(--color-page-bg)] text-[var(--color-text)]">
        <div className={heroSectionPaddingClass}>
          <div className="mx-auto max-w-[104rem]">
            <div className={heroGridClass}>
              <div className={heroBookingColumnClass}>
                <h1 className={heroHeadlineClass}>
                  <span className="block">Vienna Airport Taxi:</span>
                  <span className="block">Fixed-Price Transfers</span>
                </h1>
                <HeroBookingCard />
              </div>

              <HeroImageCard />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-page-bg)] pt-20 pb-14 md:pt-24 md:pb-18">
        <div className="app-container">
          <div className="mx-auto max-w-[104rem]">
            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-12">
              <div>
                <h2 className="max-w-[630px] text-[24px] font-black leading-[1.04] tracking-[-0.06em] text-[#111111] md:text-[32px]">
                  Reliable transfer to Vienna Airport (Schwechat)
                </h2>
                <div className="mt-6 max-w-[42rem] space-y-6 text-[1rem] leading-[1.8] text-[#5e6f86] md:text-[1.05rem]">
                  <p>
                    With Alex and his team, you can plan your <span className="font-semibold text-[#111111]">Vienna airport taxi</span> transfer easily and stress-free in advance.
                    <br />
                    <br />
                    You benefit from a clearly calculated fixed price, on-time pickup, and a direct ride without detours.
                  </p>
                  <p>
                    Whether you are travelling from Vienna to the airport or being picked up after landing, our Vienna airport taxi gets you reliably to your destination. No waiting, no transfers and no hidden costs.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-[14px] gap-y-4">
                  {transferFeatureRows.map((title, index) => (
                    <div
                      key={title}
                      className={`flex w-full max-w-full items-center gap-3 rounded-[999px] border px-4 py-3.5 shadow-[0_2px_8px_rgba(17,17,17,0.045)] transition-all hover:-translate-y-px hover:shadow-[0_8px_18px_rgba(17,17,17,0.07)] sm:w-fit ${
                        index === 0
                          ? 'border-[#7fb3ff] bg-[#f0f6ff] shadow-[0_2px_10px_rgba(17,17,17,0.04),0_0_0_1px_rgba(127,179,255,0.18),0_10px_26px_rgba(22,121,255,0.12)]'
                          : 'border-[#e8edf3] bg-white'
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <Check size={15} strokeWidth={2.55} />
                      </span>
                      <strong className="min-w-0 leading-none text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
                        {title}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="overflow-hidden rounded-[1.7rem] border border-[#262a33] bg-[linear-gradient(180deg,#111111_0%,#232a34_100%)] px-6 py-6 text-white shadow-[0_24px_60px_rgba(17,17,17,0.18)] md:px-7 md:py-7">
                  <p className="text-[0.82rem] font-semibold tracking-[-0.01em] text-white/58">
                    Your Vienna airport taxi service
                  </p>
                  <strong className="mt-3 block text-[1.75rem] font-black leading-[1.15] tracking-[-0.05em] !text-white md:text-[2.15rem]">
                    Directly to Vienna Airport without stress or detours
                  </strong>
                  <p className="mt-5 max-w-[28rem] text-[1rem] leading-[1.7] text-white/74">
                    Clear prices, simple booking and a reliable transfer to Vienna Airport Schwechat.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {transferFeatureCards.map(({ title, description }) => (
                    <div
                      key={title}
                      className="rounded-[1.45rem] border border-[#e7edf5] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(17,17,17,0.04)]"
                    >
                      <strong className="block max-w-[16ch] text-[1.15rem] font-semibold leading-[1.35] tracking-[-0.04em] text-[#111111]">
                        {title}
                      </strong>
                      <p className="mt-3 text-[0.95rem] leading-[1.65] text-[#6b7c92]">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-[var(--color-page-bg)]">
        <div className="app-container">
          <div className="mx-auto max-w-[104rem]">
            <SectionIntro
              eyebrow="Vehicle categories"
              title="Vienna Airport Taxi Prices & Vehicles"
              description="Our vehicles fit every need. Compare space, luggage capacity, and fixed prices for Vienna at a glance."
              align="center"
              className="max-w-[46rem]"
            />

            <div className="mt-10 space-y-5">
              {vehicleCategories.map(({ key, title, description, imageSrc, specs, prices }) => (
                <VehicleCategoryCard
                  key={key}
                  title={title}
                  description={description}
                  imageSrc={imageSrc}
                  imageAlt={localizedMediaContent.vehicleImageAlts[key]}
                  specs={specs}
                  prices={prices}
                />
              ))}
            </div>

            <PrimaryBookingCta />
          </div>
        </div>
      </section>

      <PriceTable />

      <section className="bg-[var(--color-page-bg)] py-8 md:py-10">
        <div className="app-container">
          <div className="mx-auto max-w-[104rem]">
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <SectionIntro
                eyebrow="Luggage"
                title="Will all my luggage fit?"
                description="To avoid delays on the way to the airport, please choose the right vehicle option for your luggage needs."
                className="max-w-[58rem]"
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
                <div className="rounded-[1.75rem] border border-[#e6edf7] bg-[#F0F6FF] px-6 py-7 md:px-8 md:py-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8e4f6] bg-white text-[#1679FF] shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
                    <Briefcase size={24} strokeWidth={2.2} />
                  </span>
                  <div className="ui-text-block-sm mt-5">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#111827]">
                      Standard Suitcase
                    </h3>
                    <p className="ui-copy-compact mt-3 text-[#58708d]">
                      A standard suitcase is checked luggage with a total size of up to 158 cm
                      (length + width + height).
                      <br />
                      This matches the usual requirements of most airlines.
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[#e6edf7] bg-[#F0F6FF] px-6 py-7 md:px-8 md:py-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8e4f6] bg-white text-[#1679FF] shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
                    <ShoppingBag size={24} strokeWidth={2.2} />
                  </span>
                  <div className="ui-text-block-sm mt-5">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#111827]">
                      Hand Luggage
                    </h3>
                    <p className="ui-copy-compact mt-3 text-[#58708d]">
                      Hand luggage usually has the following maximum size: 55 x 40 x 23 cm,
                      depending on the airline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-[#e6edf7] pt-10">
                <SectionIntro
                  eyebrow={localizedMediaContent.childSeatSection.eyebrow}
                  title={localizedMediaContent.childSeatSection.title}
                  description={localizedMediaContent.childSeatSection.description}
                  className="max-w-[62rem]"
                />

                <p className="mt-5 max-w-[62rem] text-[1rem] leading-[1.75] text-[#58708d] md:text-[1.05rem]">
                  {localizedMediaContent.childSeatSection.lead}
                </p>

                <p className="mt-8 text-[0.92rem] font-semibold uppercase tracking-[0.14em] text-[#1679FF]">
                  {localizedMediaContent.childSeatSection.detailTitle}
                </p>

                <div className="mt-8 space-y-4">
                  {localizedMediaContent.childSeatSection.options.map((seat) => (
                    <article
                      key={`seat-${seat.key}`}
                      className="group w-full max-w-full overflow-hidden rounded-[1.75rem] border border-[#e6edf7] bg-[#F0F6FF] p-4 md:p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
                        <div className="grid w-full max-w-full grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-start gap-2 md:flex md:flex-col md:items-center">
                          <ChildSeatPreviewImage
                            seat={seat}
                            frameClassName="relative h-[10.25rem] w-full max-w-[8rem] overflow-hidden rounded-[1.15rem] border border-[#dbe7f8] bg-white sm:h-[10.75rem] sm:max-w-[8.5rem] md:h-[8rem] md:w-[6.75rem] md:max-w-none"
                            imageClassName="object-contain px-0 py-[9%]"
                            pillClassName="hidden"
                          />
                          <div className="min-w-0 pt-1 text-left md:pt-0 md:text-center">
                            <ChildSeatWeightChip weightRange={seat.weightRange} />
                            <div className={`mt-4 flex max-w-full flex-col ${childSeatMobileHeaderGapClass} md:hidden`}>
                              <h4 className="pr-2 text-[1rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#111827]">
                                {seat.title}
                              </h4>
                              <p className="text-[0.8rem] font-medium leading-[1.4] tracking-[-0.02em] text-[#111827]">
                                {seat.ageLabel}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 mx-auto w-full max-w-full rounded-[1.35rem] border border-[#edf2f8] bg-white px-4 py-4 sm:px-5 sm:py-5 md:mx-0 md:max-w-none md:px-6 md:py-6">
                          <h4 className="hidden pr-2 text-[1.25rem] font-semibold tracking-[-0.04em] text-[#111827] md:block md:text-[1.32rem]">
                            {seat.title}
                          </h4>
                          <p
                            className={`mt-4 hidden text-[0.98rem] font-medium text-[#111827] ${childSeatDesktopSubtitleGapClass} md:block`}
                          >
                            {seat.ageLabel}
                          </p>
                          <p
                            className={`ui-copy-compact mt-4 leading-[1.78] text-[#58708d] ${childSeatDesktopDescriptionGapClass}`}
                          >
                            {seat.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-[#dbe7f8] bg-[#f4f8ff] px-5 py-5 md:px-6 md:py-6">
                  <div className="md:flex md:items-start md:gap-4">
                    <span className="float-left mb-2 mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8e4f6] bg-white text-[#1679FF] shadow-[0_10px_24px_rgba(17,17,17,0.04)] md:float-none md:mb-0 md:mr-0">
                      <Info size={20} strokeWidth={2.2} />
                    </span>
                    <p className="text-[0.98rem] leading-[1.7] text-[#58708d] md:mt-3 md:min-w-0">
                      {localizedMediaContent.childSeatSection.disclaimer}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-page-bg)] py-14 md:py-18">
        <div className="app-container">
          <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-center lg:gap-10">
            <div className="max-w-[44rem]">
                <SectionIntro
                  eyebrow="Contact"
                  title="Questions about booking?"
                  description="You can book your airport transfer conveniently online. If you prefer to speak directly or need quick help, we are available immediately by phone and WhatsApp."
                  className="max-w-[34rem]"
                />
              </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 lg:mt-0 lg:justify-center lg:self-stretch lg:border-l lg:border-[#edf2f7] lg:pl-8">
              <a
                href="tel:+436764826069"
                aria-label="Call"
                className="ui-contact-fab ui-contact-fab-phone"
              >
                <Phone size={26} className="text-white md:h-[18px] md:w-[18px]" />
              </a>

              <a
                href="https://wa.me/436764826069"
                aria-label="WhatsApp"
                className="ui-contact-fab ui-contact-fab-whatsapp"
              >
                <WhatsAppIcon className="h-[26px] w-[26px] text-white md:h-[18px] md:w-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-[var(--color-page-bg)]">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <SectionIntro
                eyebrow="Terminal 3"
                title="Terminal 3 map"
                description="Guidance for pickup at Vienna Airport."
                className="max-w-[42rem]"
              />

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#e9edf3] bg-white">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1331.7548403878466!2d16.56207266809108!3d48.11969249664487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476c54530fff4bc5%3A0xf4c32d1659fb4805!2sVIE%20Terminal%203%2C%201300%20Schwechat!5e0!3m2!1sen!2sat!4v1774133487794!5m2!1sen!2sat"
                  title="Google Maps Karte fuer den Abholpunkt am Flughafen Wien"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[360px] w-full md:h-[450px]"
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {terminalPickupInfo.map(({ title, description, linkLabel, linkHref }) => (
                  <div
                    key={title}
                    className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5"
                  >
                    <div className="ui-text-block-sm gap-3">
                      <h3 className="ui-heading-md text-[#111827]">{title}</h3>
                      <p className="ui-copy-compact text-[#6a7d96]">{description}</p>
                      {linkLabel && linkHref ? (
                        <a
                          href={linkHref}
                          target="_blank"
                          rel="noreferrer"
                          className="ui-copy-compact inline-flex items-center gap-2 font-semibold text-[#1679FF] transition-colors hover:text-[#0f5fcc]"
                        >
                          <MapPin size={16} className="ui-icon-accent" />
                          {linkLabel}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-page-bg)] py-8 md:py-10">
        <div className="app-container">
          <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
            <SectionIntro
              eyebrow="Reviews"
              title="Passenger reviews."
              description="Real feedback from our passengers before you book."
              className="max-w-[42rem]"
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {reviewItems.map(({ name, review }) => (
                <div
                  key={name}
                  className="rounded-[1.5rem] border border-[#e7edf5] bg-white px-5 py-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[1rem] font-semibold text-[#111827]">{name}</p>
                      <p className="mt-1 text-[0.9rem] text-[#5d6b7c]">Google Review</p>
                    </div>
                    <span className="rounded-full border border-[#dbe7f8] bg-white px-3 py-1 text-[0.82rem] font-semibold text-[#1679FF]">
                      Google
                    </span>
                  </div>
                  <p className="mt-4 text-[1rem] tracking-[0.08em] text-[#f4b400]">
                    {'\u2605\u2605\u2605\u2605\u2605'}
                  </p>
                  <p className="mt-3 text-[1rem] leading-[1.65] text-[#42566f]">&quot;{review}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-page-bg)] py-8 md:py-10">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="ui-text-block-lg max-w-[62rem]">
                <SectionIntro
                  eyebrow="Vienna Airport"
                  title="Vienna airport taxi - stress-free to Vienna Airport (VIE)"
                />
                <div className="ui-text-block-sm">
                  <p className="text-[1rem] font-semibold text-[#111827]">
                    Vienna International Airport (VIE)
                  </p>
                  <p className="ui-copy-compact text-[#58708d]">1300 Schwechat, Austria</p>
                </div>
                <div className="ui-copy-group max-w-[56rem] text-[#58708d]">
                  <p className="ui-copy-compact">
                    With a Vienna airport taxi, you can reach the airport quickly and comfortably.
                    Book your ride in just a few steps - immediately or in advance.
                  </p>
                  <p className="ui-copy-compact">
                    On-time pickup, a fixed price, and reliable transfer service for the perfect
                    start to your journey.
                  </p>
                </div>
                <div className="mt-8">
                  <Link href="/book" className="ui-button-booking-primary">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-[var(--color-page-bg)]">
        <div className="app-container">
          <div className="ui-card-surface-light overflow-hidden lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
            <div className="px-6 py-7 md:px-8 md:py-8">
              <div className="ui-text-block-lg max-w-[36rem]">
                <SectionIntro
                  eyebrow="Orientation"
                  title="Overview of Vienna Airport (VIE)"
                  description="The key information about terminals, gates, and your arrival time at a glance."
                />
                <p className="ui-copy-compact text-[#6a7d96]">
                  Der Flughafen Wien verfuegt ueber drei Eingaenge: Terminal 1 (T1), Terminal 1A
                  (T1A) und Terminal 3 (T3). Von dort fuehren Wege zu zwei grossen
                  Gate-Bereichen. Passagiere, die ueber Terminal 1 abfliegen, gelangen
                  normalerweise in die Schengen-Bereiche B, C und D; Reisende ueber Terminal 3
                  bewegen sich zu den Non-Schengen-Bereichen F und G. Bewegliche Gehwege,
                  Rolltreppen und klare Beschilderung erleichtern die Orientierung.
                </p>

                <div className="grid gap-4 pt-1">
                  {airportTips.map(({ title, description }) => (
                    <div
                      key={title}
                      className="rounded-[1.35rem] border border-[#e8edf3] bg-white/80 px-5 py-5"
                    >
                      <div className="flex flex-col gap-3">
                        <h3 className="ui-heading-sm text-[#111827]">{title}</h3>
                        <p className="ui-copy-compact text-[#6a7d96]">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[260px] border-t border-[#e9edf3] lg:min-h-full lg:border-l lg:border-t-0">
              <Image
                src="https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1400"
                alt="Flughafen Wien Terminal"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(17,17,17,0.08)_100%)]" />
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[var(--color-page-bg)] py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-10">
                <SectionIntro
                  eyebrow="FAQ"
                  title="Frequently asked questions before booking."
                  description="The most important answers about booking lead time, flight tracking, child seats, and payment are available directly on the homepage."
                  className="max-w-xl"
                />

                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-[1.5rem] border border-[#e8edf3] bg-white px-5 py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                        <span className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text)]">
                          {item.question}
                        </span>
                        <ChevronDown
                          size={18}
                          className="shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>
                      <p className="ui-copy-compact mt-4 pr-8 text-[var(--color-text-muted)]">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>

              <PrimaryBookingCta className="mt-10 flex justify-center lg:mt-12" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-page-bg)] py-14 md:py-18">
        <div className="app-container">
          <div className="ui-card-surface-light px-6 py-7 md:px-8 md:py-8">
            <SectionIntro
              eyebrow="Routes"
              title="Popular routes"
              description="Explore our detailed route guides. Each page includes a comparison table, tips, and FAQs."
              className="max-w-[40rem]"
            />

            <div className="mt-8 grid gap-x-10 gap-y-0 lg:grid-cols-2">
              {popularTrips.map((trip) => (
                <a
                  key={trip}
                  href="/book"
                  className="flex items-center justify-between gap-4 border-b border-[#e8edf3] py-3 text-[#2d3345] transition-colors hover:text-[#111827]"
                >
                  <span className="text-[0.78rem] leading-[1.25] md:text-[0.82rem]">{trip}</span>
                  <span className="flex h-[1.35rem] w-[1.35rem] shrink-0 items-center justify-center rounded-full bg-[#2e3445] text-white">
                    <ChevronRight size={11} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}

