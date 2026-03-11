'use client';

import { useState } from 'react';
import {
  BadgeCheck,
  CreditCard,
  PlaneTakeoff,
  ShieldCheck,
  TimerReset,
  Users,
  Wallet,
} from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
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

const supportItems = [
  'Fixed price',
  'Professional drivers',
  'Free waiting time',
  'Flight delay monitoring',
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
      <h2 className="ui-panel-title">Important Info.</h2>
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
        <p className="text-sm font-semibold text-[var(--color-text)]">Booking time requirements</p>
        <div className="ui-copy mt-3 space-y-2 text-sm leading-6">
          <p>• Rides until 22:00 → book at least 3 hours before</p>
          <p>• Rides between 22:00–07:00 → book at least 8 hours before</p>
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
      <Navbar />
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
          <Card as="section" className="rounded-[2rem] p-5 md:p-6" variant="default">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-[var(--color-primary)]" />
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Trusted by passengers</h2>
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">★★★★★ 4.9 / 5 rating</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {reviews.map((review) => (
                <Card key={review.author} className="rounded-[1.5rem] p-4" variant="muted">
                  <p className="text-sm font-medium text-[var(--color-text)]">"{review.quote}"</p>
                  <p className="ui-copy mt-3 text-sm">- {review.author}</p>
                </Card>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 lg:hidden">
          <InfoPanel direction={direction} />
        </section>

        <section className="mt-6">
          <Card as="section" className="rounded-[2rem] p-5 md:p-6" variant="default">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                <ShieldCheck size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">{supportItems[0]}</span>
              </div>
              <div className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                <Users size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">{supportItems[1]}</span>
              </div>
              <div className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                <TimerReset size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">{supportItems[2]}</span>
              </div>
              <div className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                <PlaneTakeoff size={18} className="text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">{supportItems[3]}</span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
