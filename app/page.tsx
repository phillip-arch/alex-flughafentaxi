import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  MapPinned,
  ShieldCheck,
} from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const serviceHighlights = [
  {
    title: 'Fixpreis statt Taxameter',
    description: 'Sie sehen den Preis vor der Fahrt und buchen ohne Ueberraschungen.',
    icon: ShieldCheck,
  },
  {
    title: 'Abholung rund um die Uhr',
    description: 'Fruehe Fluege, spaete Landungen und Business-Fahrten werden sauber eingeplant.',
    icon: Clock3,
  },
  {
    title: 'Live geplant fuer Flughafenfahrten',
    description: 'Klare Ablaufe fuer Gepaeck, Flugnummern und verlassliche Treffpunkte.',
    icon: MapPinned,
  },
];

const coverageAreas = ['Innere Stadt', 'Leopoldstadt', 'Landstrasse', 'Favoriten', 'Donaustadt', 'Schwechat'];

const fleetOptions = [
  {
    name: 'Business Sedan',
    details: 'Ideal fuer 1 bis 3 Fahrgaeste mit gepflegtem, ruhigem Auftritt.',
    meta: 'Mercedes E-Klasse Niveau',
  },
  {
    name: 'Van Transfer',
    details: 'Mehr Platz fuer Familien, Gruppen und mehrere Koffer.',
    meta: 'Bis zu 8 Personen',
  },
  {
    name: 'Airport Priority',
    details: 'Fokus auf puenktliche Abholung, Flugtracking und schnelle Koordination.',
    meta: 'Fuer Ankunft und Abflug',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />

      <section className="relative overflow-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(17,17,17,0.05),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(10,99,255,0.12),_transparent_24%)]" />
        <div className="app-container relative grid gap-8 pb-10 pt-24 lg:grid-cols-2 lg:items-center lg:gap-10 lg:pb-14 lg:pt-24">
          <div className="max-w-2xl">
            <div className="mt-4 flex flex-col gap-8 md:mt-0 md:gap-10">
            <h1 className="ui-heading-xl max-w-[16ch] !leading-[1.02] md:text-[3.76rem]">
              Flughafentaxi Wien: Sicher & pünktlich mit Alex
            </h1>
            <p className="ui-copy-compact max-w-xl text-lg md:text-xl">
              Premium Flughafentransfers mit starkem Kontrast, klaren Preisen und einer Buchung, die sofort zur Fahrt fuehrt.
            </p>
            </div>
            <div id="hero-booking" className="relative mt-5 w-full max-w-[620px]">
              <div className="absolute -left-8 top-12 hidden h-24 w-24 rounded-full bg-[#0a63ff]/20 blur-3xl lg:block" />
              <div className="rounded-[2rem] bg-transparent px-0 py-2 shadow-none md:px-0 md:py-2">
                <BookingForm />
              </div>
            </div>
          </div>

          <Card className="relative min-h-[360px] overflow-hidden rounded-[2.5rem] bg-[var(--color-bg)] lg:min-h-[620px]" variant="default">
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

      <section className="border-b border-[var(--color-border)] bg-[#eceae2]">
        <div className="app-container grid gap-4 py-6 lg:grid-cols-3">
          {serviceHighlights.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="rounded-[1.75rem] px-5 py-6" variant="section">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111111] text-white">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em]">{title}</h3>
              <p className="ui-copy mt-2 text-sm leading-7">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="gebiete" className="app-container py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="ui-eyebrow border-none bg-transparent p-0">Service areas</p>
            <h2 className="ui-heading-lg mt-4 max-w-md md:text-5xl">
              Gebaut fuer Wege zwischen Stadt, Hotel und Terminal.
            </h2>
            <p className="ui-copy mt-5 max-w-md text-base leading-8">
              Die Startseite setzt auf grosse Kontraste, klare Entscheidungen und genau die Informationen, die vor einer Buchung relevant sind.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {coverageAreas.map((area, index) => (
              <Card
                key={area}
                className={`rounded-[1.75rem] p-6 ${
                  index === 0 ? 'border border-white/10 bg-[var(--color-surface-dark)] text-white' : 'text-[var(--color-text)]'
                }`}
                variant={index === 0 ? 'dark' : 'section'}
              >
                <p className={`text-sm ${index === 0 ? 'text-white/64' : 'text-[var(--color-text-muted)]'}`}>Zone {index + 1}</p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{area}</h3>
                <p className={`mt-2 text-sm leading-7 ${index === 0 ? 'text-white/72' : 'text-[var(--color-text-muted)]'}`}>
                  Direkte Abholung mit Fokus auf Flughafenlogik statt klassischem Taxi-Look.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="app-container">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[2rem] p-8" variant="muted">
            <p className="ui-eyebrow border-none bg-transparent p-0">Booking flow</p>
            <h2 className="ui-heading-lg mt-4 max-w-lg md:text-5xl">
              Vor der Fahrt ist alles klar.
            </h2>
            <p className="ui-copy mt-5 max-w-xl text-base leading-8">
              Adresse, Zeitfenster und Fahrzeugwahl bleiben direkt lesbar. Keine ueberladene Taxi-Seite, sondern eine klare Strecke bis zur Buchung.
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[2rem] p-6" variant="section">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">01</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">Adresse</h3>
              <p className="ui-copy mt-3 text-sm leading-7">
                Eine klare Startadresse oder Ankunft am Flughafen ohne Umwege im Formular.
              </p>
            </Card>
            <Card className="rounded-[2rem] p-6" variant="section">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">02</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">Zeit</h3>
              <p className="ui-copy mt-3 text-sm leading-7">
                Datum, Uhrzeit und Flugdetails sitzen im zweiten Schritt genau dort, wo sie erwartet werden.
              </p>
            </Card>
            <Card className="rounded-[2rem] p-6" variant="section">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">03</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">Bestaetigen</h3>
              <p className="ui-copy mt-3 text-sm leading-7">
                Fahrzeug, Preis und Kontaktdaten bleiben reduziert, damit der Abschluss schnell bleibt.
              </p>
            </Card>
          </div>
          </div>

          <Card className="mt-8 rounded-[2rem] p-6 md:p-8" variant="muted">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                href="#hero-booking"
                className="rounded-2xl"
              >
                Jetzt Fahrt planen
                <ArrowRight size={16} />
              </Button>
              <Button
                href="/preise"
                className="rounded-2xl"
              >
                Preise ansehen
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Card className="rounded-3xl p-5" variant="section">
                <p className="text-3xl font-semibold tracking-[-0.04em]">24/7</p>
                <p className="ui-copy mt-1 text-sm">verfuegbar fuer Ankunft und Abflug</p>
              </Card>
              <Card className="rounded-3xl p-5" variant="section">
                <p className="text-3xl font-semibold tracking-[-0.04em]">38 EUR</p>
                <p className="ui-copy mt-1 text-sm">ab Wien zum Flughafen</p>
              </Card>
              <Card className="rounded-3xl p-5" variant="section">
                <p className="text-3xl font-semibold tracking-[-0.04em]">5.0</p>
                <p className="ui-copy mt-1 text-sm">fokussiert auf Zuverlaessigkeit</p>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      <section id="flotte" className="bg-[#111111] py-20 text-white">
        <div className="mx-auto max-w-[1520px] px-4 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/56">Fleet</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                Weniger dekorativ, mehr transportbereit.
              </h2>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/16 px-5 py-3 text-sm font-semibold text-white/88 transition-colors hover:bg-white/8"
            >
              Direkt buchen
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {fleetOptions.map((option, index) => (
              <article
                key={option.name}
                className={`rounded-[2rem] p-6 ${
                  index === 1 ? 'bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] text-white' : 'border border-white/10 bg-white/6 text-white'
                }`}
              >
                <p className={`text-sm ${index === 1 ? 'text-[#0f0f10]/62' : 'text-white/52'}`}>{option.meta}</p>
                <h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">{option.name}</h3>
                <p className={`mt-4 text-sm leading-7 ${index === 1 ? 'text-[#0f0f10]/74' : 'text-white/72'}`}>
                  {option.details}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
