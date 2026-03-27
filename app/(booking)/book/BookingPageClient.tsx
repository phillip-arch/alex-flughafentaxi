'use client';

import { useState } from 'react';
import {
  BadgeCheck,
  CreditCard,
  PlaneTakeoff,
  ShieldCheck,
  TimerReset,
  Wallet,
} from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import NavbarClient from '@/components/NavbarClient';
import SectionIntro from '@/components/ui/SectionIntro';
import { getAppSurface } from '@/lib/routing/surfaces';

type Direction = 'to_airport' | 'from_airport' | null;

const reviews = [
  {
    name: 'Markus, Wien',
    review: 'Der Fahrer war exakt puenktlich.',
  },
  {
    name: 'Anna, Schwechat',
    review: 'Sehr angenehme Fahrt zum Flughafen.',
  },
  {
    name: 'Daniel, Baden',
    review: 'Zuverlaessig selbst bei sehr fruehen Fluegen.',
  },
];

const paymentItems = [
  { label: 'Bar', icon: Wallet },
  { label: 'Visa', icon: CreditCard },
  { label: 'Mastercard', icon: CreditCard },
  { label: 'Apple Pay', icon: CreditCard },
];

const trustItems = [
  { label: 'Fixpreis', icon: ShieldCheck },
  { label: 'Kostenlose Wartezeit', icon: TimerReset },
  { label: 'Flugtracking', icon: PlaneTakeoff },
  { label: 'Professionelle Fahrer', icon: BadgeCheck },
];

function InfoPanel({ direction }: { direction: Direction }) {
  const infoBlock = getInfoBlock(direction);

  return (
    <section className="ui-card-surface-light px-5 py-5 md:px-6 md:py-6">
      <SectionIntro
        eyebrow="Informationen"
        title="Informationen zum Flughafentransfer"
        description="Alle wichtigen Hinweise fuer Ankunft, Vorlaufzeit und Zahlung direkt neben der Buchung."
        className="max-w-[26rem]"
      />

      <div className="mt-6 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
          {infoBlock.title}
        </p>
        <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{infoBlock.body}</p>
        <div className="ui-copy mt-3 space-y-2 text-sm leading-6">
          {infoBlock.items.map((item) => (
            <p key={item}>• {item}</p>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Mindestvorlauf fuer Buchungen</p>
        <div className="ui-copy mt-3 space-y-1 text-sm leading-6">
          <p>22:00–07:00 → mindestens 3h vorher buchen</p>
          <p>07:00-22:00 → mindestens 8h vorher buchen</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Kindersitze</p>
        <p className="ui-copy mt-2 text-sm leading-6">Auf Wunsch direkt waehrend der Buchung waehlbar.</p>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Zahlungsarten</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {paymentItems.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-[1rem] border border-[#edf2f7] bg-[#f8fbff] px-3 py-2 text-sm text-[var(--color-text)]"
            >
              <Icon size={16} className="text-[#1679FF]" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getInfoBlock(direction: Direction) {
  if (direction === 'from_airport') {
    return {
      title: 'Abholung am Flughafen',
      body: 'Wo Sie Ihren Fahrer treffen',
      items: [
        'Der Fahrer wartet in der Ankunftshalle',
        'Namensschild mit Ihrem Buchungsnamen',
        'Kostenlose Wartezeit inklusive',
      ],
    };
  }

  return {
    title: 'Fahrt zum Flughafen',
    body: 'Empfohlene Ankunftszeit',
    items: [
      '2 Stunden fuer Europa-Fluege',
      '3 Stunden fuer internationale Fluege',
    ],
  };
}

export default function BookingPageClient() {
  const [direction, setDirection] = useState<Direction>('to_airport');
  const isAppSurface = getAppSurface() === 'app';

  return (
    <>
      <NavbarClient />
      <section className="bg-white">
        <div className="app-container pb-10 pt-28 md:pb-12 md:pt-28">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,620px)_minmax(320px,1fr)] lg:gap-10">
            <section className="order-1 self-start lg:sticky lg:top-24">
              <div className="ui-card-surface-light px-4 py-4 md:px-5 md:py-5">
                <BookingForm onDirectionChange={setDirection} />
              </div>
            </section>

            <aside className="order-3 hidden self-start lg:order-2 lg:sticky lg:top-24 lg:block">
              <InfoPanel direction={direction} />
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="app-container pb-28 md:pb-28">
          <section className="mx-auto mt-6 max-w-[57.5rem] lg:hidden">
            <InfoPanel direction={direction} />
          </section>

          {!isAppSurface ? (
            <>
              <section className="mx-auto mt-8 max-w-[57.5rem]">
                <div className="rounded-[1.55rem] border border-[#e9edf3] bg-white px-6 py-8 shadow-[0_8px_22px_rgba(17,17,17,0.045)] md:px-8 md:py-10">
                  <SectionIntro
                    eyebrow="Bewertungen"
                    title="Bewertungen von Fahrgaesten."
                    description="Echte Rueckmeldungen unserer Fahrgaeste vor Ihrer Buchung."
                    className="max-w-[42rem]"
                  />
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {reviews.map(({ name, review }) => (
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
              </section>

              <section className="mx-auto mt-6 max-w-[57.5rem]">
                <div className="ui-card-surface-light px-5 py-5 md:px-6 md:py-6">
                  <div className="flex flex-wrap gap-2.5">
                    {trustItems.map(({ label, icon: Icon }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 rounded-full border border-[#e8edf3] bg-white px-3 py-2 text-[13px] font-medium text-[var(--color-text)]"
                      >
                        <Icon size={14} className="text-[#1679FF]" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}

