'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Wallet } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

export type BookingDirection = 'to_airport' | 'from_airport' | null;
type InfoTransitionPhase =
  | 'idle'
  | 'exit-next'
  | 'exit-prev'
  | 'prepare-enter-next'
  | 'prepare-enter-prev';

type InfoSection = {
  title: string;
  body?: string;
  items: string[];
};

type PaymentMethodBadge = {
  label: string;
  kind: 'cash' | 'visa' | 'mastercard' | 'googlepay' | 'applepay';
};

const paymentMethodBadges: PaymentMethodBadge[] = [
  { label: 'Cash', kind: 'cash' },
  { label: 'Visa', kind: 'visa' },
  { label: 'Mastercard', kind: 'mastercard' },
  { label: 'Google Pay', kind: 'googlepay' },
  { label: 'Apple Pay', kind: 'applepay' },
];

function PaymentBadgeIcon({ kind }: { kind: PaymentMethodBadge['kind'] }) {
  if (kind === 'cash') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[#eef5ff] text-[#1679FF]">
        <Wallet size={18} strokeWidth={2.2} />
      </div>
    );
  }

  if (kind === 'visa') {
    return (
      <div className="flex h-10 min-w-[4.25rem] items-center justify-center rounded-[0.9rem] bg-[#eef5ff] px-3">
        <span className="text-[0.95rem] font-black uppercase tracking-[0.1em] text-[#1434CB]">VISA</span>
      </div>
    );
  }

  if (kind === 'mastercard') {
    return (
      <div className="flex h-10 min-w-[4.6rem] items-center justify-center rounded-[0.9rem] bg-[#fff4ef] px-3">
        <div className="relative h-5 w-8">
          <span className="absolute left-0 top-0 h-5 w-5 rounded-full bg-[#EA001B]" />
          <span className="absolute right-0 top-0 h-5 w-5 rounded-full bg-[#F79E1B]" />
          <span className="absolute left-[0.75rem] top-0 h-5 w-2.5 bg-[rgba(255,94,0,0.72)]" />
        </div>
      </div>
    );
  }

  if (kind === 'googlepay') {
    return (
      <div className="flex h-10 min-w-[5.25rem] items-center justify-center rounded-[0.9rem] bg-[#f5f7fb] px-3">
        <span className="text-[1rem] font-black tracking-[-0.06em]">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">le</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-10 min-w-[5.4rem] items-center justify-center rounded-[0.9rem] bg-[#f5f5f7] px-3">
      <span className="text-[0.98rem] font-semibold tracking-[-0.04em] text-[#111827]">Apple Pay</span>
    </div>
  );
}

function PaymentMethodsGrid({ isBookVariant }: { isBookVariant: boolean }) {
  return (
    <div className={`${isBookVariant ? 'mt-5 gap-3' : 'mt-3 gap-2.5'} grid grid-cols-2 sm:grid-cols-3`}>
      {paymentMethodBadges.map((method) => (
        <div
          key={method.label}
          className={`flex items-center justify-center gap-2 rounded-[1rem] border border-[#edf2f7] bg-[#fbfdff] ${isBookVariant ? 'px-3 py-3' : 'px-3 py-2.5'}`}
        >
          <PaymentBadgeIcon kind={method.kind} />
          {method.kind === 'cash' ? (
            <span className={`${isBookVariant ? 'text-[0.95rem]' : 'text-[0.88rem]'} font-semibold leading-tight text-[#111827]`}>
              {method.label}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function InfoSectionCards({
  sections,
  isBookVariant,
}: {
  sections: InfoSection[];
  isBookVariant: boolean;
}) {
  return (
    <>
      {sections.map((section, index) => (
        <div
          key={section.title}
          className={`${index === 0 ? 'mt-0' : isBookVariant ? 'mt-7' : 'mt-4'} ${isBookVariant ? 'rounded-[1.45rem] px-5 py-6 md:px-6 md:py-7' : 'rounded-[1.4rem] px-4 py-4 md:px-5'} border border-[#e8edf3] bg-white`}
        >
          <p
            className={`${isBookVariant ? 'text-[1rem] tracking-[0.04em]' : 'text-[12px] tracking-[0.18em] md:text-[13px]'} font-semibold uppercase text-[#1679FF]`}
          >
            {section.title}
          </p>
          {section.body ? (
            <p className={`${isBookVariant ? 'mt-3 text-[1rem] md:text-[1.08rem]' : 'mt-2 text-sm'} font-medium text-[var(--color-text)]`}>
              {section.body}
            </p>
          ) : null}
          <div
            className={`${isBookVariant ? 'mt-5 space-y-2 text-[1.02rem] leading-7 md:text-[1.15rem]' : 'ui-copy mt-3 space-y-2 text-sm leading-6'} text-[#64748b]`}
          >
            {section.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          {section.title === 'Payment options' ? (
            <PaymentMethodsGrid isBookVariant={isBookVariant} />
          ) : null}
        </div>
      ))}
    </>
  );
}

function getStepSections(
  currentStep: number,
  direction: BookingDirection,
  meetAndGreet: boolean,
): InfoSection[] {
  if (currentStep === 2) {
    const sections: InfoSection[] = [
      {
        title: 'Child seats',
        body: 'Travel details that matter for planning',
        items: [
          'Child seats are available on request and should be selected here so the driver arrives prepared.',
        ],
      },
      {
        title: 'Check-in luggage',
        body: 'Why this information matters',
        items: [
          'Check-in luggage means the bags you hand over at the airline counter.',
          'Please enter the luggage count correctly. It affects vehicle planning and, for airport pickups, how much time passengers need from aircraft to driver.',
        ],
      },
    ];

    if (direction === 'from_airport') {
      sections.push({
        title: 'Airport pickup',
        body: meetAndGreet ? 'Meet & Greet selected' : 'Standard pickup',
        items: meetAndGreet
          ? [
              'Pickup is inside arrivals.',
              'Your driver waits there with a name board.',
            ]
          : [
              'Pickup is outside the airport at the agreed pickup point.',
            ],
      });
    }

    return sections;
  }

  if (currentStep === 3) {
    return [
      {
        title: 'Payment options',
        body: 'When payment is made',
        items: [
          'Cash or credit card payment is handled in the car only.',
          'Payment is due upon arrival.',
        ],
      },
    ];
  }

  return [
    {
      title: 'Minimum booking lead time',
      body: 'Required notice before pickup',
      items: [
        '07:00 - 22:00: book at least 3 hours in advance.',
        '22:00 - 07:00: book at least 8 hours in advance.',
      ],
    },
    {
      title: 'Timing guidance',
      body: 'Suggested planning for your ride',
      items: [
        'For local pickups inside Vienna, leave extra buffer for traffic, especially during rush hour.',
        'Suggested airport arrival: usually 2 hours before European flights and 3 hours before international flights.',
      ],
    },
  ];
}

export function BookingInfoPanel({
  direction,
  meetAndGreet = false,
  currentStep = 1,
  variant = 'card',
}: {
  direction: BookingDirection;
  meetAndGreet?: boolean;
  currentStep?: number;
  variant?: 'card' | 'book';
}) {
  const sections = useMemo(
    () => getStepSections(currentStep, direction, meetAndGreet),
    [currentStep, direction, meetAndGreet],
  );
  const isBookVariant = variant === 'book';
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionsSignature = useMemo(() => JSON.stringify(sections), [sections]);
  const [visibleSections, setVisibleSections] = useState<InfoSection[]>(sections);
  const [visibleSignature, setVisibleSignature] = useState(sectionsSignature);
  const [phase, setPhase] = useState<InfoTransitionPhase>('idle');
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previousStepRef = useRef(currentStep);
  const exitTimeoutRef = useRef<number | null>(null);
  const unlockTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
      }
      if (unlockTimeoutRef.current !== null) {
        window.clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (sectionsSignature === visibleSignature) {
      previousStepRef.current = currentStep;
      return;
    }

    const navigationDirection = currentStep < previousStepRef.current ? 'prev' : 'next';
    previousStepRef.current = currentStep;

    if (prefersReducedMotion) {
      setVisibleSections(sections);
      setVisibleSignature(sectionsSignature);
      setPhase('idle');
      setLockedHeight(null);
      return;
    }

    if (cardRef.current) {
      setLockedHeight(cardRef.current.offsetHeight);
    }

    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current);
    }
    if (unlockTimeoutRef.current !== null) {
      window.clearTimeout(unlockTimeoutRef.current);
    }

    setPhase(navigationDirection === 'prev' ? 'exit-prev' : 'exit-next');

    exitTimeoutRef.current = window.setTimeout(() => {
      setVisibleSections(sections);
      setVisibleSignature(sectionsSignature);
      setPhase(navigationDirection === 'prev' ? 'prepare-enter-prev' : 'prepare-enter-next');

      window.requestAnimationFrame(() => {
        if (cardRef.current) {
          void cardRef.current.offsetWidth;
        }

        window.requestAnimationFrame(() => {
          setPhase('idle');
        });
      });

      unlockTimeoutRef.current = window.setTimeout(() => {
        setLockedHeight(null);
      }, 400);
    }, 300);
  }, [currentStep, prefersReducedMotion, sections, sectionsSignature, visibleSignature]);

  const phaseClassName =
    phase === 'exit-next'
      ? 'ui-info-card-exit-next'
      : phase === 'exit-prev'
        ? 'ui-info-card-exit-prev'
        : phase === 'prepare-enter-next'
          ? 'ui-info-card-prepare-next'
          : phase === 'prepare-enter-prev'
            ? 'ui-info-card-prepare-prev'
            : '';

  return (
    <section
      className={isBookVariant ? 'px-0 py-0' : 'ui-card-surface-light px-5 py-5 md:px-6 md:py-6'}
      style={lockedHeight ? { minHeight: `${lockedHeight}px` } : undefined}
    >
      <div
        className="ui-info-sync-shell"
      >
        <div
          ref={cardRef}
          className={`ui-info-card-transition ${phaseClassName}`}
        >
          <InfoSectionCards
            sections={visibleSections}
            isBookVariant={isBookVariant}
          />
        </div>
      </div>
    </section>
  );
}
