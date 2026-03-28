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

function getInfoBlock(direction: BookingDirection) {
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

export function BookingInfoPanel({ direction }: { direction: BookingDirection }) {
  const infoBlock = getInfoBlock(direction);

  return (
    <section className="ui-card-surface-light px-5 py-5 md:px-6 md:py-6">
      <SectionIntro
        eyebrow="Informationen"
        title="Informationen zum Flughafentransfer"
        description="Alle wichtigen Hinweise fuer Ankunft, Vorlaufzeit und Zahlung direkt neben der Buchung."
        className="max-w-none md:max-w-[34rem]"
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
