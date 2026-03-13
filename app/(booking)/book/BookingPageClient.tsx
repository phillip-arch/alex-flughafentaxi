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
    quote: 'Driver arrived exactly on time.',
    author: 'Markus, Vienna',
  },
  {
    quote: 'Very comfortable ride to airport.',
    author: 'Anna, Schwechat',
  },
  {
    quote: 'Reliable even for early morning flights.',
    author: 'Daniel, Baden',
  },
];

const paymentItems = [
  { label: 'Cash', icon: Wallet },
  { label: 'Visa', icon: CreditCard },
  { label: 'Mastercard', icon: CreditCard },
  { label: 'Apple Pay', icon: CreditCard },
];

function InfoPanel({ direction }: { direction: Direction }) {
  const infoBlock = getInfoBlock(direction);

  return (
    <Card as="section" className="rounded-[2rem] p-5 md:p-6" variant="default">
      <h2 className="ui-panel-title">Airport transfer information</h2>
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
        <p className="text-sm font-semibold text-[var(--color-text)]">Minimum Advance Booking Time</p>
        <div className="ui-copy mt-3 space-y-1 text-sm leading-6">
          <p>22:00–07:00 → book ≥ 3h before</p>
          <p>07:00-22:00 → book ≥ 8h before</p>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Child seats</p>
        <p className="ui-copy mt-2 text-sm leading-6">Available on request during booking.</p>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Payment options</p>
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
      title: 'Airport pickup',
      body: 'Where to meet your driver',
      items: [
        'Driver waits in arrivals hall',
        'Name sign with your booking name',
        'Free waiting time included',
      ],
    };
  }

  return {
    title: 'Airport departure',
    body: 'Recommended arrival',
    items: [
      '2 hours for Europe flights',
      '3 hours for international flights',
    ],
  };
}

export default function BookingPageClient() {
  const [direction, setDirection] = useState<Direction>('to_airport');

  return (
    <>
      <NavbarClient />
      <div className="app-container py-28 md:py-28">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,620px)_minmax(320px,1fr)]">
          <section className="order-1">
            <h1 className="ui-heading-lg mb-14 text-center text-[2.1rem] md:mb-12 md:text-[2.5rem]">
              Transfer buchen
            </h1>
            <div className="mt-10 md:mt-12">
              <BookingForm onDirectionChange={setDirection} />
            </div>
          </section>

          <aside className="order-3 hidden self-start lg:order-2 lg:block lg:sticky lg:top-24">
            <InfoPanel direction={direction} />
          </aside>
        </div>

        <section className="mt-8">
          <Card as="section" className="rounded-[1.75rem] p-4 md:p-5" variant="default">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold tracking-[-0.03em]">Trusted by passengers</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">★★★★★ 4.9 / 5 rating</p>
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
                <span>Fixed price</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-medium text-[var(--color-text)]">
                <TimerReset size={14} className="text-[var(--color-primary)]" />
                <span>Free waiting</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-medium text-[var(--color-text)]">
                <PlaneTakeoff size={14} className="text-[var(--color-primary)]" />
                <span>Flight tracking</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] font-medium text-[var(--color-text)]">
                <BadgeCheck size={14} className="text-[var(--color-primary)]" />
                <span>Professional drivers</span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}

