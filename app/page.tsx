import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Phone,
  ShoppingBag,
  Users,
} from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
import Card from '@/components/ui/Card';
import { ViberIcon, WhatsAppIcon } from '@/components/ui/ContactIcons';

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

const homepageSectionWidthClass = 'mx-auto max-w-[57.5rem]';

const vehicleCategories = [
  {
    title: 'Limousine',
    description: 'Preiswerte Option fuer Alleinreisende oder Paare',
    imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
    specs: ['2 Personen', '2 Koffer', '2 Handgepaeck'],
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
    specs: ['4 Personen', '4 Koffer', '4 Handgepaeck'],
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
    specs: ['8 Personen', '8 Koffer', '8 Handgepaeck'],
    prices: [
      { district: '1. - 10. Bezirk', price: '72 EUR' },
      { district: '11. Bezirk', price: '69 EUR' },
      { district: '12. - 23. Bezirk', price: '75 EUR' },
    ],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />

      <section className="relative overflow-hidden bg-white text-[var(--color-text)]">
        <div className="app-container relative grid gap-8 pb-10 pt-22 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-20 lg:pb-14 lg:pt-28">
          <div className="max-w-[38rem]">
            <div className="ui-text-block-lg mt-5 md:mt-6">
              <h1 className="ui-heading-xl max-w-[19ch] !text-[2rem] !leading-[1.02] md:!text-[3.01rem]">
                <span>Flughafentaxi Wien</span>
                <br />
                <span>Ihr professioneller Flughafen Taxi Service</span>
              </h1>
              <p className="ui-copy-compact max-w-[34rem]">
                Willkommen bei Flughafentaxi Wien Alex - Ihrem 24/7 Transfer-Service vom
                Flughafen Wien Schwechat. Wir bringen Sie puenktlich und komfortabel zu allen
                Bahnhoefen, Hotels und Sehenswuerdigkeiten und bieten feste Preise ohne
                Ueberraschungen.
              </p>
            </div>
            <div id="hero-booking" className="relative mt-2 w-full max-w-[740px] lg:-ml-2">
              <div className="absolute -left-8 top-12 hidden h-24 w-24 rounded-full bg-[#0a63ff]/20 blur-3xl lg:block" />
              <div className="rounded-[2rem] bg-transparent px-0 py-2 shadow-none md:px-0 md:py-2">
                <BookingForm showStepIndicator={false} />
              </div>
            </div>
          </div>

          <Card
            className="relative w-full min-h-[360px] overflow-hidden rounded-none bg-[var(--color-bg)] lg:mt-6 lg:min-h-[590px] lg:max-w-[56rem] lg:justify-self-end"
            variant="default"
          >
            <Image
              src="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/heroimage.jpg"
              alt="Flughafentaxi Wien"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(17,17,17,0.18)_100%)]" />
          </Card>
        </div>
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="flex justify-center">
              <h2 className="ui-heading-lg text-center text-[#111827]">
                Warum unser Flughafentaxi?
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
              {[
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
              ].map(({ title, description }) => (
                <div
                  key={title}
                  className="ui-card-surface-light mx-auto flex w-full max-w-[26.5rem] items-start gap-4 px-5 py-5 md:px-6 md:py-6"
                >
                  <span className="ui-icon-badge-accent">
                    <Check size={22} strokeWidth={2.4} />
                  </span>
                  <div className="ui-text-block-sm gap-1.5 pt-0.5">
                    <h3 className="text-[1.28rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[1.38rem]">
                      {title}
                    </h3>
                    <p className="ui-copy-sm text-[#6a7d96]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center md:mt-10">
              <Link href="/book" className="ui-button-booking-primary">
                Fahrt buchen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className="w-full">
            <div className="ui-text-block-sm mx-auto max-w-[46rem] text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
                Fahrzeugkategorien
              </p>
              <h2 className="ui-heading-lg text-[#111827]">Fahrzeugkategorien</h2>
              <p className="ui-copy-compact text-[#6a7d96]">
                Unsere Fahrzeuge passen zu jedem Bedarf. Vergleichen Sie Platzangebot und
                Fixpreise fuer Wien auf einen Blick.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              {vehicleCategories.map(({ title, description, imageSrc, specs, prices }) => (
                <div
                  key={title}
                  className="ui-card-surface-light group overflow-hidden px-5 py-5 text-[#111827] md:px-6 md:py-6"
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
                        <h3 className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[1.9rem]">
                          {title}
                        </h3>
                        <p className="ui-copy-sm max-w-[34rem] text-[#6b7280]">{description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {specs.map((spec, index) => (
                          <div
                            key={spec}
                            className="flex items-center justify-center gap-1.5 rounded-[0.9rem] border border-[#edf2f7] bg-white px-2 py-2 text-[#111827] sm:gap-2.5 sm:rounded-[1rem] sm:px-3 sm:py-3"
                          >
                            {index === 0 ? (
                              <Users size={17} className="ui-icon-accent" />
                            ) : index === 1 ? (
                              <Briefcase size={17} className="ui-icon-accent" />
                            ) : (
                              <ShoppingBag size={17} className="ui-icon-accent" />
                            )}
                            <span className="ui-copy-sm font-semibold text-[#1f2937]">
                              {spec.split(' ')[0]}
                            </span>
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

            <div className="mt-8 flex justify-center md:mt-10">
              <Link href="/book" className="ui-button-booking-primary">
                Fahrt buchen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light overflow-hidden lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
              <div className="px-6 py-7 md:px-8 md:py-8">
                <div className="ui-text-block-sm max-w-[34rem]">
                  <h2 className="ui-heading-lg text-[#111827]">Ueberblick ueber den Flughafen Wien (VIE)</h2>
                  <p className="ui-copy-compact text-[#6a7d96]">
                    Der Flughafen Wien verfuegt ueber drei Eingaenge: Terminal 1 (T1), Terminal 1A
                    (T1A) und Terminal 3 (T3). Von dort fuehren Wege zu zwei grossen
                    Gate-Bereichen. Passagiere, die ueber Terminal 1 abfliegen, gelangen
                    normalerweise in die Schengen-Bereiche B, C und D; Reisende ueber Terminal 3
                    bewegen sich zu den Non-Schengen-Bereichen F und G. Bewegliche Gehwege,
                    Rolltreppen und klare Beschilderung erleichtern die Orientierung.
                  </p>

                  <div className="pt-2">
                    <h3 className="ui-heading-sm text-[#111827]">Terminal-Tipps</h3>
                    <p className="ui-copy-compact mt-3 text-[#6a7d96]">
                      Ihr Boardingpass zeigt Ihnen den richtigen Terminal: Gates B/C/D bedeuten
                      Check-in in Terminal 1; Gates F/G bedeuten Check-in in Terminal 3.
                      Star-Alliance-Fluggesellschaften wie Austrian Airlines nutzen vorrangig T3,
                      waehrend Billig- und Charterairlines oftmals T1A waehlen.
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="ui-heading-sm text-[#111827]">Wann sollte ich am Flughafen sein?</h3>
                    <p className="ui-copy-compact mt-3 text-[#6a7d96]">
                      Fuer Fluege innerhalb Europas wird empfohlen, etwa 2 Stunden vor Abflug am
                      Flughafen zu sein. Fuer Non-Schengen- und Langstreckenfluege sind 3 Stunden
                      ratsam, fuer USA-Fluege sogar 3 1/2-4 Stunden. Reisen Sie mit Sondergepaeck
                      oder in Gruppen, planen Sie zusaetzliche Zeit ein.
                    </p>
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

      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-7 md:px-8 md:py-8">
              <div className="ui-text-block-sm max-w-[52rem]">
                <h2 className="ui-heading-lg text-[#111827]">
                  Flughafentaxi Wien - Zuverlaessiger Transfer zum Flughafen
                </h2>
                <p className="ui-copy-compact text-[#6a7d96]">
                  Seit vielen Jahren bringen wir Fahrgaeste zuverlaessig zum Flughafen Wien.
                  Unsere ortskundigen Fahrer, transparente Fixpreise und zahlreiche zufriedene
                  Kunden stehen fuer einen Service, auf den Sie sich verlassen koennen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-[var(--color-border)] bg-white py-20">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="ui-text-block-lg max-w-xl">
              <p className="ui-eyebrow border-none bg-transparent p-0">FAQ</p>
              <h2 className="ui-heading-lg">Haeufige Fragen vor der Buchung.</h2>
              <p className="ui-copy-compact">
                Die wichtigsten Antworten zu Vorlaufzeit, Flugtracking, Kindersitzen und Zahlung
                bleiben direkt auf der Startseite erreichbar.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4"
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

            <div className="mt-10 flex justify-center lg:mt-12">
              <Link href="/book" className="ui-button-booking-primary">
                Fahrt buchen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className="ui-text-block-sm max-w-[40rem]">
            <h2 className="ui-heading-lg text-[#111827]">Beliebte Strecken</h2>
            <p className="ui-copy-compact text-[#7a8596]">
              Entdecken Sie unsere detaillierten Routenbeschreibungen. Jede Seite enthaelt eine
              Vergleichstabelle, Tipps und FAQs.
            </p>
          </div>

          <div className="mt-8 grid gap-x-10 gap-y-0 lg:grid-cols-2">
            {[
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
            ].map((trip) => (
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
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-center lg:gap-10">
              <div className="max-w-[44rem]">
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-booking-accent)] md:text-[13px]">
                  <Phone size={16} strokeWidth={2.2} />
                  Sofort erreichbar
                </span>
                <div className="ui-text-block-lg mt-5">
                  <h2 className="ui-heading-lg text-[#111827]">Fragen zur Buchung?</h2>
                  <p className="ui-copy-compact max-w-[34rem] text-[#6a7d96]">
                    Sie koennen Ihren Flughafentransfer bequem online buchen. Falls Sie lieber direkt
                    sprechen oder schnell Hilfe brauchen, sind wir sofort erreichbar.
                  </p>
                </div>
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
            <div className="rounded-[2rem] border border-[#d9e6fb] bg-[#f8fbff] px-6 py-6 md:px-8 md:py-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
                How it works
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  '1. Route waehlen',
                  '2. Details eingeben',
                  '3. Bestaetigen',
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-[1.1rem] border border-[#e1ebf8] bg-white px-4 py-4 text-[1rem] font-semibold text-[#111827]"
                  >
                    {step}
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
            <div className="rounded-[2rem] border border-[#e7edf5] bg-white px-6 py-8 shadow-[0_18px_42px_rgba(17,17,17,0.04)] md:px-8 md:py-10">
            <div className="ui-text-block-sm max-w-[42rem]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
                Social proof
              </p>
              <h2 className="ui-heading-lg text-[#111827]">Bewertungen von Fahrgaesten.</h2>
              <p className="ui-copy-compact text-[#58708d]">
                Google-style Rezensionen fuer Vertrauen vor der Buchung.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
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
              ].map(({ name, review }) => (
                <div
                  key={name}
                  className="rounded-[1.5rem] border border-[#e7edf5] bg-[#f8fbff] px-5 py-5"
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
                  <p className="mt-4 text-[1rem] tracking-[0.08em] text-[#f4b400]">★★★★★</p>
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
            <div className="rounded-[2rem] border border-[#e7edf5] bg-[#f8fbff] px-6 py-8 shadow-[0_18px_42px_rgba(17,17,17,0.04)] md:px-8 md:py-10">
              <div className="ui-text-block-sm max-w-[42rem]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
                  Terminal 3
                </p>
                <h2 className="ui-heading-lg text-[#111827]">Terminal 3 map</h2>
                <p className="ui-copy-compact text-[#58708d]">
                  Orientierung fuer die Abholung am Flughafen Wien.
                </p>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#dfe8f5] bg-white">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d685.6621794243264!2d16.563012245455774!3d48.119932229370555!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476c5454a6562693%3A0x3c4c24ee70e77606!2sWien-Flughafen%2C%201300%20Schwechat!5e1!3m2!1sde!2sat!4v1773706852609!5m2!1sde!2sat"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[360px] w-full md:h-[450px]"
                />
              </div>

              <div className="ui-text-block-sm mt-6 max-w-[54rem]">
                <h3 className="ui-heading-md text-[#111827]">Where will I be dropped off?</h3>
                <p className="ui-copy-compact text-[#58708d]">
                  You&apos;ll be dropped off curbside at the terminal that you specify when
                  requesting your ride. If you don&apos;t know your terminal, you can input your
                  airline in note field when booking your ride or share directly with driver.
                </p>
                <div className="ui-text-block-sm">
                  <h3 className="ui-heading-md text-[#111827]">Where will I be picked up?</h3>
                  <p className="ui-copy-compact text-[#58708d]">
                    Driver will wait outside, near T3.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-10">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="rounded-[2rem] border border-[#e7edf5] bg-white px-6 py-8 shadow-[0_18px_42px_rgba(17,17,17,0.04)] md:px-8 md:py-10">
              <div className="ui-text-block-lg max-w-[58rem]">
                <h2 className="ui-heading-lg text-[#111827]">Will all my luggage fit?</h2>
                <p className="ui-copy-compact max-w-[48rem] text-[#58708d]">
                  To prevent delays in getting to the airport, be sure to choose the best ride
                  option for your cargo needs.
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
                <div className="rounded-[1.75rem] border border-[#e6edf7] bg-[#f8fbff] px-6 py-7 md:px-8 md:py-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8e4f6] bg-white text-[#1679FF] shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
                    <Briefcase size={24} strokeWidth={2.2} />
                  </span>
                  <div className="ui-text-block-sm mt-5">
                    <h3 className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[#111827]">
                      Suitcase
                    </h3>
                    <p className="ui-copy-compact text-[#58708d]">
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
                    <p className="ui-copy-compact text-[#58708d]">
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

      <section className="bg-white py-8 md:py-10">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="rounded-[2rem] border border-[#e7edf5] bg-white px-6 py-8 shadow-[0_18px_42px_rgba(17,17,17,0.04)] md:px-8 md:py-10">
              <div className="ui-text-block-lg max-w-[62rem]">
              <h2 className="ui-heading-lg text-[#111827]">
                Flughafentaxi Wien - Stressfrei zum Flughafen Wien (VIE)
              </h2>
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


    </main>
  );
}
