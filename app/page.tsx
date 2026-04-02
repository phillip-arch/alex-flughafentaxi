import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Briefcase,
  MapPin,
  Phone,
  ShoppingBag,
  Users,
} from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
import { ViberIcon, WhatsAppIcon } from '@/components/ui/ContactIcons';
import SectionIntro from '@/components/ui/SectionIntro';

type VehicleSpecIconName = 'users' | 'briefcase' | 'shoppingBag';

type VehicleCategory = {
  title: string;
  description: string;
  imageSrc: string;
  specs: { icon: VehicleSpecIconName; value: string }[];
  prices: { district: string; price: string }[];
};

const faqItems = [
  {
    question: 'Wie erkenne ich meinen Fahrer?',
    answer:
      'Der Fahrer holt Sie puenktlich am Terminal ab. Eine persoenliche Abholung mit Namensschild ist gegen Aufpreis moeglich.',
  },
  {
    question: 'Sind Kindersitze verfuegbar?',
    answer:
      'Ja, bitte geben Sie den Bedarf bei der Buchung an. Wir stellen Babyschalen und Sitzkissen kostenlos zur Verfuegung.',
  },
  {
    question: 'Koennen Haustiere mitfahren?',
    answer:
      'Haustiere reisen in geeigneten Transportboxen mit; geben Sie uns vorab Bescheid.',
  },
  {
    question: 'Gibt es Zusatzkosten bei Verspaetungen?',
    answer:
      'Wir ueberwachen Ihren Flug und passen die Abholzeit an. Bei unverschuldeten Verspaetungen entstehen keine Zusatzkosten.',
  },
  {
    question: 'Kann ich auch vom Hotel zum Flughafen buchen?',
    answer:
      'Ja, unser Service gilt in beide Richtungen. Geben Sie bei der Buchung Ihre Abholadresse an.',
  },
  {
    question: 'Welche Zahlungsmethoden gibt es?',
    answer:
      'Sie koennen bar, per Karte oder per Mobile Pay zahlen und erhalten eine digitale Rechnung.',
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
      'Unser Service steht rund um die Uhr an sieben Tagen der Woche bereit, erreichbar per Telefon, WhatsApp & Viber.',
  },
];

const whyUsEditorialItems = [
  {
    title: 'Direkter Kontakt statt Callcenter',
    description:
      'Sie erreichen uns schnell per Telefon, WhatsApp oder Viber und erhalten klare Rueckmeldung zu Ihrer Fahrt.',
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
    title: 'Limousine',
    audience: 'Fuer Einzelpersonen und Paare',
    summary: 'Kompakt, schnell verfuegbar und ideal fuer klassische Transfers mit wenig Gepaeck.',
    price: 'ab 39 EUR',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
  },
  {
    title: 'Kombi',
    audience: 'Fuer Familien und Gruppen',
    summary: 'Mehr Platz fuer Koffer, Kinderwagen oder mehrere Mitreisende ohne Komfortverlust.',
    price: 'ab 45 EUR',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/kombi.jpg',
  },
  {
    title: 'Bus',
    audience: 'Fuer groessere Gruppen',
    summary: 'Die passende Wahl, wenn mehrere Fahrgaeste gemeinsam und planbar ankommen sollen.',
    price: 'ab 69 EUR',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/bus.jpg',
  },
];

const heroTrustItems = ['Fixpreis garantiert', 'Puenktliche Abholung', 'Zuverlaessiger Service'];

const homepageSectionWidthClass = 'mx-auto max-w-[57.5rem]';

const vehicleCategories: VehicleCategory[] = [
  {
    title: 'Limousine',
    description: 'Preiswerte Option fuer Alleinreisende oder Paare',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
    specs: [
      { icon: 'users', value: '2' },
      { icon: 'briefcase', value: '2' },
      { icon: 'shoppingBag', value: '2' },
    ],
    prices: [
      { district: '1. - 10. Bezirk', price: '42 EUR' },
      { district: '11. Bezirk', price: '39 EUR' },
      { district: '12. - 23. Bezirk', price: '45 EUR' },
    ],
  },
  {
    title: 'Kombi',
    description: 'Ideal fuer Gruppen & Familien - mehr Platz fuer Gepaeck.',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/kombi.jpg',
    specs: [
      { icon: 'users', value: '4' },
      { icon: 'briefcase', value: '4' },
      { icon: 'shoppingBag', value: '4' },
    ],
    prices: [
      { district: '1. - 10. Bezirk', price: '48 EUR' },
      { district: '11. Bezirk', price: '45 EUR' },
      { district: '12. - 23. Bezirk', price: '51 EUR' },
    ],
  },
  {
    title: 'Bus',
    description: 'Ideal fuer groessere Gruppen - viel Platz fuer Fahrgaeste und Gepaeck.',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/bus.jpg',
    specs: [
      { icon: 'users', value: '8' },
      { icon: 'briefcase', value: '8' },
      { icon: 'shoppingBag', value: '8' },
    ],
    prices: [
      { district: '1. - 10. Bezirk', price: '72 EUR' },
      { district: '11. Bezirk', price: '69 EUR' },
      { district: '12. - 23. Bezirk', price: '75 EUR' },
    ],
  },
];

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

function VehicleSpecIcon({ icon }: { icon: VehicleSpecIconName }) {
  if (icon === 'users') return <Users size={17} className="ui-icon-accent" />;
  if (icon === 'briefcase') return <Briefcase size={17} className="ui-icon-accent" />;
  return <ShoppingBag size={17} className="ui-icon-accent" />;
}

function PrimaryBookingCta({ className = 'mt-8 flex justify-center md:mt-10' }: { className?: string }) {
  return (
    <div className={className}>
      <Link href="/book" className="ui-button-booking-primary">
        Fahrt buchen
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />

      <section className="relative overflow-hidden bg-white text-[var(--color-text)]">
        <div className="app-container relative pb-10 pt-[5.2rem] md:pb-12 md:pt-[7.625rem] lg:pb-14 lg:pt-[7.625rem]">
          <div className="mx-auto max-w-[104rem]">
            <div className="text-center">
              <h1 className="mx-auto max-w-[20rem] text-[12px] font-medium tracking-[-0.03em] text-[#7c8593] md:max-w-none md:text-[1.08rem] md:leading-[1.2]">
                Flughafentaxi Wien, Ihr professioneller Flughafen Taxi Service
              </h1>

              <div className="mx-auto mt-2 max-w-[16ch] text-[30px] font-black tracking-[-0.04em] text-[#111111] leading-[1.02] md:mt-4 md:max-w-none md:text-[55px] md:leading-[1.02]">
                <span className="block">Fixpreis zum Flughafen.</span>
                <span className="block">Keine Ueberraschungen.</span>
              </div>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[0.94fr_0.78fr] lg:items-start lg:gap-10">
            <div className="text-center lg:text-left">
              <div id="hero-booking" className="relative mt-6 w-full max-w-[42rem]">
                <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-[#0a63ff]/14 blur-3xl lg:block" />
                <div className="relative overflow-hidden rounded-[1.6rem] border border-[#eef2f8] bg-white p-[18px_16px_16px] text-left shadow-[0_28px_80px_rgba(17,17,17,0.08)] md:rounded-[2rem] md:p-5">
                  <div className="mb-[10px] flex flex-col items-start gap-2 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <p className="text-[13px] font-black tracking-[-0.03em] text-[#111111] leading-[1.1] md:text-[18.2px]">
                      Fahrt in wenigen Sekunden starten
                    </p>
                    <span className="shrink-0 rounded-full border border-[#d6e4ff] bg-[#edf4ff] px-[10px] py-[6px] text-[12px] font-semibold text-[#1679FF] md:px-3.5 md:py-2 md:text-[0.84rem]">
                      Schritt 1 von 3
                    </span>
                  </div>

                  <BookingForm showStepIndicator={false} />

                </div>
              </div>

              <div className="mx-auto mt-4 flex max-w-[340px] flex-wrap items-center justify-center gap-2 lg:mx-0 lg:mt-5 lg:max-w-none lg:flex-nowrap lg:justify-start">
                {heroTrustItems.map((item, index) => (
                  <div
                    key={item}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] shadow-[0_10px_24px_rgba(17,17,17,0.045)] ${
                      index === 2
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#e6edf7] bg-[#f4f8ff] text-[#111827]'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        index === 2 ? 'bg-white text-[#111111]' : 'bg-[#1679FF] text-white'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-[12px] font-semibold tracking-[-0.03em] md:text-[14.76px]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[35rem] lg:mt-[1.5rem]">
              <div className="overflow-hidden rounded-[1.6rem] border border-[#eef2f8] bg-white shadow-[0_28px_80px_rgba(17,17,17,0.08)] md:rounded-[2rem]">
                <div className="relative h-[13.5rem] md:h-[20.5rem]">
                  <Image
                    src="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/heroimage.jpg"
                    alt="Alex Flughafentaxi Wien"
                    fill
                    priority
                    fetchPriority="high"
                    className="object-cover"
                    sizes="(min-width: 1024px) 42vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(17,17,17,0.08)_100%)]" />
                </div>

                <div className="grid grid-cols-1 border-t border-[#e8eef7] md:grid-cols-2">
                  <div className="px-4 py-4 md:px-5">
                    <p className="text-[1rem] font-black tracking-[-0.04em] text-[#111111]">Wien</p>
                    <p className="mt-2 text-[0.9rem] leading-[1.5] text-[#62738a]">
                      Schnell buchen, klarer Preis.
                    </p>
                  </div>
                  <div className="border-t border-[#e8eef7] px-4 py-4 md:border-l md:border-t-0 md:px-5">
                    <p className="text-[1rem] font-black tracking-[-0.04em] text-[#111111]">
                      Flughafen
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-[1.5] text-[#62738a]">
                      Fokus auf Transfer statt allgemeiner Taxi-Seite.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <SectionIntro
              eyebrow="Vorteile"
              title="Warum unser Flughafentaxi?"
              description="Klare Preise, zuverlaessige Abholung und direkter Kontakt fuer einen entspannten Transfer zum Flughafen Wien."
              align="center"
              className="max-w-[44rem]"
            />

            <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
              {whyUsItems.map(({ title, description }) => (
                <div
                  key={title}
                  className="mx-auto flex w-full max-w-[26.5rem] items-start gap-4 rounded-[2rem] border border-[#1679FF] bg-[#1679FF] px-5 py-5 shadow-[0_18px_42px_rgba(22,121,255,0.16)] md:px-6 md:py-6"
                >
                  <span className="ui-icon-badge-accent">
                    <Check size={22} strokeWidth={2.4} />
                  </span>
                  <div className="ui-text-block-sm gap-1.5 pt-0.5">
                    <h3 className="text-[1.28rem] font-semibold tracking-[-0.05em] !text-white md:text-[1.38rem]">
                      {title}
                    </h3>
                    <p className="ui-copy-sm text-white/88">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <PrimaryBookingCta />
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="overflow-hidden rounded-[2.4rem] border border-[#dce8ff] bg-[linear-gradient(135deg,#f4f8ff_0%,#ffffff_46%,#eef5ff_100%)] shadow-[0_24px_70px_rgba(22,121,255,0.12)]">
              <div className="grid gap-8 px-6 py-7 md:px-8 md:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-10 lg:py-10">
                <div className="flex flex-col gap-6">
                  <SectionIntro
                    eyebrow="Vorteile"
                    title="Warum unser Flughafentaxi?"
                    description="Eine zweite Perspektive auf denselben Service: weniger Reibung bei der Buchung, verlaessliche Kommunikation und ein klar gefuehrter Transfer vom ersten Kontakt bis zur Ankunft."
                    className="max-w-[30rem]"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    {whyUsStats.map(({ value, label }) => (
                      <div
                        key={value}
                        className="rounded-[1.5rem] border border-white/70 bg-white/88 px-4 py-4 shadow-[0_12px_30px_rgba(17,17,17,0.05)] backdrop-blur"
                      >
                        <p className="text-[1.15rem] font-semibold tracking-[-0.05em] text-[#1679FF]">
                          {value}
                        </p>
                        <p className="mt-2 text-[0.88rem] leading-[1.45] text-[#5b6f88]">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.75rem] bg-[#1679FF] px-5 py-5 text-white shadow-[0_18px_42px_rgba(22,121,255,0.22)]">
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white/72">
                      Serviceversprechen
                    </p>
                    <p className="mt-3 max-w-[24rem] text-[1.05rem] leading-[1.5] text-white/92">
                      Klar kommuniziert, sauber organisiert und auf Ankunftszeiten abgestimmt.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {whyUsEditorialItems.map(({ title, description }, index) => (
                    <div
                      key={title}
                      className="relative overflow-hidden rounded-[1.9rem] border border-white/75 bg-white/92 px-5 py-5 shadow-[0_14px_34px_rgba(17,17,17,0.05)] backdrop-blur md:px-6 md:py-6"
                    >
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#1679FF_0%,#6ab0ff_100%)]" />
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[#edf4ff] text-[#1679FF]">
                          <Check size={22} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <div className="flex items-center gap-3">
                            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#8aa4c7]">
                              0{index + 1}
                            </span>
                            <h3 className="text-[1.2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[1.35rem]">
                              {title}
                            </h3>
                          </div>
                          <p className="mt-3 max-w-[34rem] text-[0.95rem] leading-[1.55] text-[#5b6f88]">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="overflow-hidden rounded-[2.4rem] border border-[#e8edf7] bg-[#0f1724] text-white shadow-[0_28px_80px_rgba(15,23,36,0.16)]">
              <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative px-6 py-8 md:px-8 md:py-9 lg:px-10 lg:py-10">
                  <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(22,121,255,0.3),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(106,176,255,0.18),transparent_36%)]" />
                  <div className="relative">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8dbdff] md:text-[13px]">
                      Vorteile
                    </p>
                    <h2 className="mt-3 text-[2rem] font-black tracking-[-0.06em] !text-white md:text-[2.5rem]">
                      Warum unser Flughafentaxi?
                    </h2>
                    <p className="mt-4 max-w-[30rem] text-[0.98rem] leading-[1.65] text-white/74">
                      Diese Version betont den Ablauf: von der Anfrage ueber die Bestaetigung bis zur
                      Ankunft. Dadurch wirkt der Nutzen konkreter und naeher an der echten Buchung.
                    </p>

                    <div className="mt-8 space-y-4">
                      {whyUsTimelineItems.map(({ step, title, description }) => (
                        <div key={step} className="flex gap-4 rounded-[1.7rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm md:px-5 md:py-5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1679FF] text-[0.82rem] font-semibold tracking-[0.08em] text-white">
                            {step}
                          </div>
                          <div>
                            <h3 className="text-[1.15rem] font-semibold tracking-[-0.04em] !text-white md:text-[1.28rem]">
                              {title}
                            </h3>
                            <p className="mt-2 text-[0.93rem] leading-[1.6] text-white/72">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-white px-6 py-8 text-[#111827] md:px-8 md:py-9 lg:border-l lg:border-t-0 lg:px-10 lg:py-10">
                  <div className="max-w-[28rem]">
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
                      Klarer Unterschied
                    </p>
                    <h3 className="mt-3 text-[1.7rem] font-black tracking-[-0.06em] text-[#111827] md:text-[2rem]">
                      Ein Service, der nicht improvisiert wirkt.
                    </h3>
                    <p className="mt-4 text-[0.96rem] leading-[1.65] text-[#5b6f88]">
                      Die Gestaltung arbeitet bewusst mit Kontrast: dunkle linke Seite fuer Fokus,
                      helle rechte Seite fuer Lesbarkeit. So entsteht ein Abschnitt, der wie eine
                      echte Premium-Komponente wirkt und nicht wie ein weiterer Standardblock.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3">
                    <div className="rounded-[1.6rem] border border-[#dce8ff] bg-[#f5f9ff] px-5 py-5">
                      <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-[#7a95b8]">
                        Kommunikation
                      </p>
                      <p className="mt-2 text-[1rem] font-semibold tracking-[-0.04em] text-[#111827]">
                        Kurze Wege, klare Antworten, feste Absprachen.
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-[#dce8ff] bg-[#f5f9ff] px-5 py-5">
                      <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-[#7a95b8]">
                        Timing
                      </p>
                      <p className="mt-2 text-[1rem] font-semibold tracking-[-0.04em] text-[#111827]">
                        Abholung und Ankunft bleiben planbar, auch wenn sich Flugzeiten verschieben.
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-[#dce8ff] bg-[#1679FF] px-5 py-5 text-white shadow-[0_18px_42px_rgba(22,121,255,0.2)]">
                      <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white/72">
                        Ergebnis
                      </p>
                      <p className="mt-2 text-[1rem] font-semibold tracking-[-0.04em] !text-white">
                        Weniger Unsicherheit vor der Fahrt und ein ruhigerer Start in die Reise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className="w-full">
            <SectionIntro
              eyebrow="Fahrzeugkategorien"
              title="Fahrzeugkategorien und Preis"
              description="Unsere Fahrzeuge passen zu jedem Bedarf. Vergleichen Sie Platzangebot und Fixpreise fuer Wien auf einen Blick."
              align="center"
              className="max-w-[46rem]"
            />

            <div className="mt-10 space-y-5">
              {vehicleCategories.map(({ title, description, imageSrc, specs, prices }) => (
                <div
                  key={title}
                  className="overflow-hidden rounded-[2rem] border border-[#1679FF] bg-[#1679FF] px-5 py-5 text-white shadow-[0_18px_42px_rgba(22,121,255,0.16)] md:px-6 md:py-6"
                >
                  <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[16rem_minmax(0,0.95fr)_minmax(18rem,0.92fr)] lg:items-center lg:gap-8">
                    <div className="relative h-[12rem] overflow-hidden rounded-[1.5rem] border border-[#e9edf3] bg-white md:h-[13rem] lg:h-[14rem]">
                      <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-contain"
                        sizes="(min-width: 1024px) 16rem, 100vw"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center gap-5">
                      <div className="ui-text-block-sm gap-1.5">
                        <h3 className="text-[1.7rem] font-semibold tracking-[-0.05em] !text-white md:text-[1.9rem]">
                          {title}
                        </h3>
                        <p className="ui-copy-sm max-w-[34rem] text-white/88">{description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {specs.map(({ icon, value }) => (
                          <div
                            key={`${title}-${icon}`}
                            className="flex items-center justify-center gap-1.5 rounded-[0.9rem] border border-[#edf2f7] bg-white px-2 py-2 text-[#111827] sm:gap-2.5 sm:rounded-[1rem] sm:px-3 sm:py-3"
                          >
                            <VehicleSpecIcon icon={icon} />
                            <span className="ui-copy-sm font-semibold text-[#1f2937]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-[#e8edf3] bg-[#f8fbff] px-4 py-4 md:px-5">
                      <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-[#1679FF]">
                        Preisliste fuer Wien
                      </p>
                      <div className="mt-3 space-y-2.5">
                        {prices.map(({ district, price }) => (
                          <div
                            key={district}
                            className="flex items-center justify-between gap-4 border-b border-[#e6edf7] pb-2 last:border-b-0 last:pb-0"
                          >
                            <span className="text-[0.95rem] text-[#4b5563]">{district}</span>
                            <span className="text-[1rem] font-semibold text-[#111827]">{price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PrimaryBookingCta />
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-10">
        <div className="app-container">
          <div className="w-full">
            <div className="overflow-hidden rounded-[2.4rem] border border-[#d7e6ff] bg-[linear-gradient(135deg,#eff5ff_0%,#ffffff_34%,#f7fbff_100%)] shadow-[0_24px_70px_rgba(22,121,255,0.12)]">
              <div className="px-6 py-8 md:px-8 md:py-9 lg:px-10 lg:py-10">
                <SectionIntro
                  eyebrow="Fahrzeugkategorien"
                  title="Fahrzeugkategorien und Preis"
                  description="Eine zweite Darstellung fuer denselben Inhalt: schneller Vergleich nach Einsatz, Preisniveau und Platzbedarf."
                  align="center"
                  className="max-w-[48rem]"
                />

                <div className="mt-8 grid gap-4 lg:grid-cols-[0.86fr_1.14fr] lg:gap-5">
                  <div className="rounded-[2rem] bg-[#1679FF] px-5 py-6 text-white shadow-[0_20px_48px_rgba(22,121,255,0.24)] md:px-6 md:py-7">
                    <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white/72">
                      Schnellwahl
                    </p>
                    <h3 className="mt-3 text-[1.7rem] font-black tracking-[-0.06em] !text-white md:text-[2rem]">
                      Das passende Fahrzeug auf einen Blick.
                    </h3>
                    <p className="mt-4 max-w-[26rem] text-[0.96rem] leading-[1.65] text-white/84">
                      Waehlbar nach Gruppengroesse, Gepaeckmenge und Preisniveau. So wird aus der
                      Fahrtauswahl kein Ratespiel, sondern eine schnelle Entscheidung.
                    </p>

                    <div className="mt-6 space-y-3">
                      {vehicleCategoryHighlights.map(({ title, audience, price }) => (
                        <div
                          key={title}
                          className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/16 bg-white/10 px-4 py-3 backdrop-blur-sm"
                        >
                          <div>
                            <p className="text-[1rem] font-semibold tracking-[-0.04em] text-white">
                              {title}
                            </p>
                            <p className="mt-1 text-[0.83rem] text-white/70">{audience}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-[0.82rem] font-semibold text-[#1679FF]">
                            {price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {vehicleCategoryHighlights.map(({ title, audience, summary, price, imageSrc }) => (
                      <div
                        key={`${title}-detail`}
                        className="flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-[#dce8ff] bg-white shadow-[0_14px_34px_rgba(17,17,17,0.05)]"
                      >
                        <div className="relative h-[11.5rem] border-b border-[#e6eefb] bg-[linear-gradient(180deg,#f6faff_0%,#eef5ff_100%)]">
                          <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            className="object-contain p-4"
                            sizes="(min-width: 768px) 33vw, 100vw"
                          />
                        </div>
                        <div className="flex h-full flex-col px-5 py-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8ba4c5]">
                                {audience}
                              </p>
                              <h3 className="mt-3 text-[1.45rem] font-black tracking-[-0.05em] text-[#111827]">
                                {title}
                              </h3>
                            </div>
                            <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[#edf4ff] px-3 text-[0.78rem] font-semibold text-[#1679FF]">
                              {price}
                            </span>
                          </div>
                          <p className="mt-4 text-[0.92rem] leading-[1.6] text-[#5b6f88]">{summary}</p>
                          <div className="mt-auto pt-5">
                            <div className="rounded-[1.2rem] border border-[#e5eefc] bg-[#f7fbff] px-4 py-3">
                            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#7e97b8]">
                              Empfehlung
                            </p>
                            <p className="mt-2 text-[0.9rem] leading-[1.5] text-[#31445b]">
                              Geeignet fuer planbare Transfers mit klarer Preisstruktur.
                            </p>
                          </div>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-10">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <SectionIntro
                eyebrow="Gepaeck"
                title="Will all my luggage fit?"
                description="To prevent delays in getting to the airport, be sure to choose the best ride option for your cargo needs."
                className="max-w-[58rem]"
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
                <div className="rounded-[1.75rem] border border-[#e6edf7] bg-[#f8fbff] px-6 py-7 md:px-8 md:py-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8e4f6] bg-white text-[#1679FF] shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
                    <Briefcase size={24} strokeWidth={2.2} />
                  </span>
                  <div className="ui-text-block-sm mt-5">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#111827]">
                      Suitcase
                    </h3>
                    <p className="ui-copy-compact mt-3 text-[#58708d]">
                      The guidelines here refer to the maximum size for checked luggage, which is 62
                      linear inches or 158 linear centimeters (length + width + depth).
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[#e6edf7] bg-[#f8fbff] px-6 py-7 md:px-8 md:py-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8e4f6] bg-white text-[#1679FF] shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
                    <ShoppingBag size={24} strokeWidth={2.2} />
                  </span>
                  <div className="ui-text-block-sm mt-5">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#111827]">
                      Hand luggage
                    </h3>
                    <p className="ui-copy-compact mt-3 text-[#58708d]">
                      Common hand luggage size is around 55 x 40 x 23 cm, or about 21.5 x 15.5 x 9
                      inches, depending on the airline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-center lg:gap-10">
              <div className="max-w-[44rem]">
                <SectionIntro
                  eyebrow="Kontakt"
                  title="Fragen zur Buchung?"
                  description="Sie koennen Ihren Flughafentransfer bequem online buchen. Falls Sie lieber direkt sprechen oder schnell Hilfe brauchen, sind wir per Telefon, WhatsApp und Viber sofort erreichbar."
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

                <a
                  href="viber://chat?number=%2B436764826069"
                  aria-label="Viber"
                  className="ui-contact-fab ui-contact-fab-viber"
                >
                  <ViberIcon className="h-[26px] w-[26px] text-white md:h-[18px] md:w-[18px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-10">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <SectionIntro
                eyebrow="Bewertungen"
                title="Bewertungen von Fahrgaesten."
                description="Echte Rueckmeldungen unserer Fahrgaeste vor Ihrer Buchung."
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
        </div>
      </section>

      <section className="bg-white py-8 md:py-10">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="ui-text-block-lg max-w-[62rem]">
                <SectionIntro
                  eyebrow="Flughafen Wien"
                  title="Flughafentaxi Wien - Stressfrei zum Flughafen Wien (VIE)"
                />
                <div className="ui-text-block-sm">
                  <p className="text-[1rem] font-semibold text-[#111827]">
                    Vienna International Airport (VIE)
                  </p>
                  <p className="ui-copy-compact text-[#58708d]">1300 Schwechat, Oesterreich</p>
                </div>
                <div className="ui-copy-group max-w-[56rem] text-[#58708d]">
                  <p className="ui-copy-compact">
                    Mit einem Flughafentaxi Wien gelangen Sie schnell und bequem zum Flughafen.
                    Buchen Sie Ihre Fahrt in wenigen Schritten - sofort oder im Voraus.
                  </p>
                  <p className="ui-copy-compact">
                    Puenktliche Abholung, Fixpreis und zuverlaessiger Transfer fuer Ihren perfekten
                    Start in die Reise.
                  </p>
                </div>
                <div className="mt-8">
                  <Link href="/book" className="ui-button-booking-primary">
                    Fahrt buchen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <SectionIntro
                eyebrow="Terminal 3"
                title="Terminal 3 map"
                description="Orientierung fuer die Abholung am Flughafen Wien."
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

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light overflow-hidden lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
              <div className="px-6 py-7 md:px-8 md:py-8">
                <div className="ui-text-block-lg max-w-[36rem]">
                  <SectionIntro
                    eyebrow="Orientierung"
                    title="Ueberblick ueber den Flughafen Wien (VIE)"
                    description="Die wichtigsten Hinweise zu Terminals, Gates und Ihrer Ankunftszeit auf einen Blick."
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
        </div>
      </section>

      <section id="faq" className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-10">
                <SectionIntro
                  eyebrow="FAQ"
                  title="Haeufige Fragen vor der Buchung."
                  description="Die wichtigsten Antworten zu Vorlaufzeit, Flugtracking, Kindersitzen und Zahlung bleiben direkt auf der Startseite erreichbar."
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

      <section className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-7 md:px-8 md:py-8">
              <SectionIntro
                eyebrow="Strecken"
                title="Beliebte Strecken"
                description="Entdecken Sie unsere detaillierten Routenbeschreibungen. Jede Seite enthaelt eine Vergleichstabelle, Tipps und FAQs."
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
        </div>
      </section>




    </main>
  );
}

