'use client';

import {
  BadgeCheck,
  CreditCard,
  PlaneTakeoff,
  ShieldCheck,
  TimerReset,
  Wallet,
} from 'lucide-react';
import SectionIntro from '@/components/ui/SectionIntro';

export type BookingDirection = 'to_airport' | 'from_airport' | null;

const paymentItems = [
  { label: 'Cash', icon: Wallet },
  { label: 'Visa', icon: CreditCard },
  { label: 'Mastercard', icon: CreditCard },
  { label: 'Apple Pay', icon: CreditCard },
];

const trustItems = [
  { label: 'Fixed price', icon: ShieldCheck },
  { label: 'Free waiting time', icon: TimerReset },
  { label: 'Flight tracking', icon: PlaneTakeoff },
  { label: 'Professional drivers', icon: BadgeCheck },
];

function getInfoBlock(direction: BookingDirection, meetAndGreet: boolean) {
  if (direction === 'from_airport') {
    return {
      title: 'Airport pickup',
      body: meetAndGreet ? 'Meet & Greet selected' : 'Where to meet your driver',
      items: meetAndGreet
        ? [
            'Driver waits inside with a name sign',
            'Meeting point is inside the arrivals area',
            'Flight tracking and free waiting time included',
          ]
        : [
            'Pickup at the agreed airport meeting point',
            'Flight tracking included',
            'Free waiting time included',
          ],
    };
  }

  return {
    title: 'Ride to the airport',
    body: 'Recommended arrival time',
    items: [
      '2 hours before European flights',
      '3 hours before international flights',
    ],
  };
}

export function BookingInfoPanel({
  direction,
  meetAndGreet = false,
}: {
  direction: BookingDirection;
  meetAndGreet?: boolean;
}) {
  const infoBlock = getInfoBlock(direction, meetAndGreet);

  return (
    <section className="ui-card-surface-light px-5 py-5 md:px-6 md:py-6">
      <SectionIntro
        eyebrow="Information"
        title="Airport transfer information"
        description="All key details about arrival, lead time, and payment right next to your booking."
        className="max-w-none md:max-w-[34rem]"
      />

      <div className="mt-6 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
          {infoBlock.title}
        </p>
        <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{infoBlock.body}</p>
        <div className="ui-copy mt-3 space-y-2 text-sm leading-6">
          {infoBlock.items.map((item) => (
            <p key={item}>- {item}</p>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Minimum booking lead time</p>
        <div className="ui-copy mt-3 space-y-1 text-sm leading-6">
          <p>22:00-07:00 - book at least 3h in advance</p>
          <p>07:00-22:00 - book at least 8h in advance</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Child seats</p>
        <p className="ui-copy mt-2 text-sm leading-6">Available on request directly during booking.</p>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">Payment methods</p>
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

      <div className="mt-4 hidden flex-wrap gap-2.5 lg:flex">
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
    </section>
  );
}
