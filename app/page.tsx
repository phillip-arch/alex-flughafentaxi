import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Phone,
  ShoppingBag,
} from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
import Card from '@/components/ui/Card';
import { ViberIcon, WhatsAppIcon } from '@/components/ui/ContactIcons';

const faqItems = [
  {
    question: 'Wie frueh sollte ich meinen Flughafentransfer buchen?',
    answer:
      'Fahrten bis 22:00 sollten mindestens 3 Stunden vorher gebucht werden. Fuer Nachtfahrten zwischen 22:00 und 07:00 planen wir mindestens 8 Stunden Vorlauf ein.',
  },
  {
    question: 'Was passiert bei einer verspaeteten Landung?',
    answer:
      'Flugankuenfte werden mitverfolgt. Bei Verspaetungen passen wir die Abholzeit automatisch an, damit die Fahrt trotzdem sauber koordiniert bleibt.',
  },
  {
    question: 'Kann ich Kindersitze und Zusatzgepaeck angeben?',
    answer:
      'Ja. Babyschale, Kindersitz, Sitzerhoehung sowie Koffer und Handgepaeck koennen direkt im Buchungsformular ausgewaehlt werden.',
  },
  {
    question: 'Welche Zahlungsarten sind moeglich?',
    answer:
      'Sie koennen Barzahlung, Visa, Mastercard und Apple Pay nutzen. Die Auswahl erfolgt direkt im letzten Buchungsschritt.',
  },
];

const homepageSectionWidthClass = 'mx-auto max-w-[57.5rem]';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />

      <section className="relative overflow-hidden bg-white text-[var(--color-text)]">
        <div className="app-container relative grid gap-8 pb-10 pt-22 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-20 lg:pb-14 lg:pt-28">
          <div className="max-w-[38rem]">
            <div className="ui-text-block-lg mt-5 md:mt-6">
              <h1 className="ui-heading-xl max-w-[16ch] !text-[2rem] !leading-[1.02] md:!text-[3.01rem]">
                Flughafentaxi Wien: Sicher und puenktlich <span className="text-[#1679FF]">mit Alex</span>
              </h1>
              <p className="ui-copy-compact max-w-[34rem]">
                Buchen Sie Ihr Flughafentaxi in Wien schnell und unkompliziert. Mit Fixpreis,
                zuverlaessigem Service und puenktlicher Abholung bringen wir Sie komfortabel zum
                Flughafen Wien (VIE) oder holen Sie nach Ihrer Landung direkt ab.
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
              src="https://images.pexels.com/photos/9519974/pexels-photo-9519974.jpeg"
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

      <section className="bg-[#f7f9fc] py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="flex justify-center">
              <h2 className="ui-heading-lg inline-flex flex-col items-center text-center text-[#111827]">
                <span>Flughafentaxi Wien -</span>
                <span>Fixpreis, puenktlich &amp; zuverlaessig</span>
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
              {[
                {
                  title: 'Fixpreis garantiert',
                  description: 'Keine versteckten Kosten.',
                },
                {
                  title: 'Puenktliche Abholung',
                  description: 'Verlaesslich und sicher.',
                },
                {
                  title: 'Online buchen',
                  description: 'In wenigen Schritten erledigt.',
                },
                {
                  title: 'Direkt erreichbar',
                  description: 'Telefon, WhatsApp & Viber.',
                },
              ].map(({ title, description }) => (
                <div
                  key={title}
                  className="mx-auto flex w-full max-w-[26.5rem] items-start gap-4 rounded-[1.55rem] border border-[#edf2f8] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(17,17,17,0.045)] md:px-6 md:py-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1679FF] md:h-13 md:w-13">
                    <Check size={22} strokeWidth={2.4} />
                  </span>
                  <div className="ui-text-block-sm gap-1.5 pt-0.5">
                    <h3 className="text-[1.28rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[1.38rem]">
                      {title}
                    </h3>
                    <p className="text-[0.95rem] leading-[1.55] text-[#6a7d96] md:text-[1rem]">
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

      <section className="bg-white py-14 md:py-18">
        <div className="app-container">
          <div className={homepageSectionWidthClass}>
            <div className="rounded-[2.25rem] border border-[#d9e6fb] bg-[#f3f8ff] px-6 py-8 md:px-10 md:py-10 lg:grid lg:grid-cols-[1.1fr_0.78fr] lg:items-center lg:gap-12">
              <div className="max-w-[44rem]">
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
                  <Phone size={16} strokeWidth={2.2} />
                  Sofort erreichbar
                </span>
                <div className="ui-text-block-lg mt-5">
                  <h2 className="ui-heading-lg text-[#111827]">Fragen zur Buchung?</h2>
                  <p className="ui-copy-compact max-w-[34rem] text-[#47617f]">
                    Sie koennen Ihren Flughafentransfer bequem online buchen. Falls Sie lieber direkt
                    sprechen oder schnell Hilfe brauchen, sind wir sofort erreichbar.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-start gap-3 lg:mt-0 lg:flex-col lg:items-end">
                <a
                  href="tel:+436764826069"
                  aria-label="Call"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1679FF] text-white shadow-[0_14px_32px_rgba(22,121,255,0.22)] transition-colors hover:bg-[#0f6ae8] md:h-12 md:w-12"
                >
                  <Phone size={26} className="text-white md:h-[18px] md:w-[18px]" />
                </a>

                <a
                  href="https://wa.me/436764826069"
                  aria-label="WhatsApp"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_32px_rgba(37,211,102,0.2)] transition-colors hover:bg-[#1fb959] md:h-12 md:w-12"
                >
                  <WhatsAppIcon className="h-[26px] w-[26px] text-white md:h-[18px] md:w-[18px]" />
                </a>

                <a
                  href="viber://chat?number=%2B436764826069"
                  aria-label="Viber"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7360f2] text-white shadow-[0_14px_32px_rgba(115,96,242,0.2)] transition-colors hover:bg-[#5f4ae6] md:h-12 md:w-12"
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
            <h2 className="ui-heading-lg text-[#111827]">Popular trips in Vienna</h2>
            <p className="ui-copy-compact text-[#7a8596]">Explore popular trips in Vienna</p>
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-0 lg:grid-cols-2">
            {[
              'From Wien Praterstern To Bahnhof Wien Floridsdorf',
              'From Vienna Central Train Station To Ernst-Happel-Stadion',
              'From Vienna Central Train Station To Bahnhof Wien Floridsdorf',
              'From Terminal 1 Vienna Airport To Schonbrunn Palace',
              'From Terminal 3 Vienna Airport To Belvedere Palace',
              'From Terminal 3 Vienna Airport To Bahnhof Wien Meidling',
              'From Vienna Central Train Station To Terminal 3 Vienna Airport',
              'From Vienna Central Train Station To Wien Westbahnhof',
              'From Terminal 1 Vienna Airport To Landstrasse-Wien Mitte',
              'From Terminal 1 Vienna Airport To Belvedere Palace',
            ].map((trip) => (
              <a
                key={trip}
                href="/book"
                className="flex items-center justify-between gap-6 border-b border-[#e8edf3] py-6 text-[#2d3345] transition-colors hover:text-[#111827]"
              >
                <span className="text-[1.05rem] leading-[1.45] md:text-[1.1rem]">{trip}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2e3445] text-white">
                  <ChevronRight size={20} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
