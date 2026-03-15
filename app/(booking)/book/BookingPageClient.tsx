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
import Card from '@/components/ui/Card';

type Direction = 'to_airport' | 'from_airport' | null;

const reviews = [
  {
    quote: 'Der Fahrer war exakt puenktlich.',
    author: 'Markus, Wien',
  },
  {
    quote: 'Sehr angenehme Fahrt zum Flughafen.',
    author: 'Anna, Schwechat',
  },
  {
    quote: 'Zuverlaessig selbst bei sehr fruehen Fluegen.',
    author: 'Daniel, Baden',
  },
];

const paymentItems = [
  { label: 'Bar', icon: Wallet },
  { label: 'Visa', icon: CreditCard },
  { label: 'Mastercard', icon: CreditCard },
  { label: 'Apple Pay', icon: CreditCard },
];

function InfoPanel({ direction }: { direction: Direction }) {
  const infoBlock = getInfoBlock(direction);

  return (
    <Card as="section" className="rounded-[2rem] p-5 md:p-6" variant="default">
      <h2 className="ui-panel-title">Informationen zum Flughafentransfer</h2>
      <div className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
          {infoBlock.title}
        </p>
        <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{infoBlock.body}</p>
        <div className="ui-copy mt-3 space-y-2 text-sm leading-6">
          {infoBlock.items.map((item) => (
            <p key={item}>• {item}</p>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Mindestvorlauf fuer Buchungen</p>
        <div className="ui-copy mt-3 space-y-1 text-sm leading-6">
          <p>22:00–07:00 → mindestens 3h vorher buchen</p>
          <p>07:00-22:00 → mindestens 8h vorher buchen</p>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Kindersitze</p>
        <p className="ui-copy mt-2 text-sm leading-6">Auf Wunsch direkt waehrend der Buchung waehlbar.</p>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Zahlungsarten</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {paymentItems.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)]"
            >
              <Icon size={16} className="text-[var(--color-primary)]" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
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

  return (
    <>
      <NavbarClient />
      <section className="bg-white">
        <div className="app-container pt-28 pb-10 md:pt-28 md:pb-12">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,620px)_minmax(320px,1fr)] lg:gap-20">
            <section className="order-1">
              <h1 className="ui-heading-lg mb-4 text-center text-[2.1rem] md:mb-5 md:text-[2.5rem]">
                Transfer buchen
              </h1>
              <div className="mt-1 md:mt-3">
                <BookingForm onDirectionChange={setDirection} />
              </div>
            </section>

            <aside className="order-3 hidden self-start lg:order-2 lg:block lg:sticky lg:top-24">
              <InfoPanel direction={direction} />
            </aside>
          </div>
        </div>
      </section>

      <div className="app-container pb-28 md:pb-28">
            <section className="mt-8">
          <Card as="section" className="rounded-[1.75rem] p-4 md:p-5" variant="default">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold tracking-[-0.03em]">Vertrauen von Fahrgaesten</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">★★★★★ 4.9 / 5 Bewertung</p>
            <div className="mt-4 grid gap-2.5 md:grid-cols-3">
              {reviews.map((review) => (
                <Card key={review.author} className="rounded-[1.15rem] p-3.5" variant="muted">
                  <p className="text-[14px] font-medium leading-5 text-[var(--color-text)]">"{review.quote}"</p>
                  <p className="ui-copy mt-2 text-[13px]">- {review.author}</p>
                </Card>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 lg:hidden">
          <InfoPanel direction={direction} />
        </section>

        <section className="mt-6">
          <Card as="section" className="rounded-[1.5rem] p-3.5 md:p-4" variant="default">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-medium text-[var(--color-text)]">
                <ShieldCheck size={14} className="text-[var(--color-primary)]" />
                <span>Fixpreis</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-medium text-[var(--color-text)]">
                <TimerReset size={14} className="text-[var(--color-primary)]" />
                <span>Kostenlose Wartezeit</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-medium text-[var(--color-text)]">
                <PlaneTakeoff size={14} className="text-[var(--color-primary)]" />
                <span>Flugtracking</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-medium text-[var(--color-text)]">
                <BadgeCheck size={14} className="text-[var(--color-primary)]" />
                <span>Professionelle Fahrer</span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}

