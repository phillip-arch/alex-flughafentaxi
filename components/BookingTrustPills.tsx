import { Check } from 'lucide-react';

type BookingTrustPillsProps = {
  className?: string;
  items?: readonly string[];
};

const BOOKING_TRUST_ITEMS = [
  'Fixed price',
  'On-time pickup',
  'Reliable service',
] as const;

const DEFAULT_BOOKING_TRUST_PILLS_CLASS =
  'mx-auto mt-4 flex min-h-[5.75rem] max-w-[340px] flex-wrap items-center justify-center gap-[10px] md:min-h-0 md:gap-[14px] lg:relative lg:top-5 lg:mt-0 lg:max-w-none lg:flex-nowrap lg:justify-center';
const BOOKING_TRUST_PILL_TEXT_CLASS = 'text-[11px] font-semibold tracking-[-0.03em] md:text-[12px]';

export default function BookingTrustPills({
  className = DEFAULT_BOOKING_TRUST_PILLS_CLASS,
  items = BOOKING_TRUST_ITEMS,
}: BookingTrustPillsProps) {
  return (
    <div className={className}>
      {items.map((item) => (
        <div
          key={item}
          className="inline-flex items-center gap-1 rounded-full border border-[#e6edf7] bg-[#f4f8ff] px-2.5 py-1.5 text-[11px] text-[#111827] shadow-[0_10px_24px_rgba(17,17,17,0.045)] md:gap-1.5 md:px-3 md:py-2 md:text-[12px]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Check size={12} strokeWidth={2.8} />
          </span>
          <span className={BOOKING_TRUST_PILL_TEXT_CLASS}>{item}</span>
        </div>
      ))}
    </div>
  );
}
