'use client';

import Image from 'next/image';
import { Briefcase, CreditCard, Pencil, Users, Wallet } from 'lucide-react';
import { formatVehicleTypeLabel } from '@/lib/pricing';
import AnimatedPrice from './AnimatedPrice';

type BookingPriceSummaryCardProps = {
  formData: any;
  totalPrice: number | null;
  vehicleType: string;
  invalid?: boolean;
  onEdit?: () => void;
};

export default function BookingPriceSummaryCard({
  formData,
  totalPrice,
  vehicleType,
  invalid = false,
  onEdit,
}: BookingPriceSummaryCardProps) {
  const passengerValue = formData.passengers === '' ? '--' : formData.passengers;
  const luggageValue = formData.luggage === '' ? '--' : formData.luggage;
  const cityLabel = formData.city?.trim() || formData.zip?.trim() || 'Pickup';
  const routeFrom = formData.direction === 'to_airport' ? cityLabel : 'VIE';
  const routeTo = formData.direction === 'to_airport' ? 'VIE' : cityLabel;
  const vehicleLabel = formatVehicleTypeLabel(vehicleType);
  const paymentLabel =
    formData.paymentMethod === 'cash'
      ? 'Cash'
      : formData.paymentMethod === 'card'
        ? 'Credit card'
        : null;
  const stablePaymentLabel = paymentLabel ?? 'Cash';
  const PaymentIcon = formData.paymentMethod === 'card' ? CreditCard : Wallet;
  const vehicleImage =
    vehicleType === 'Bus'
      ? {
          src: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/bus.jpg',
          alt: 'Airport taxi minivan',
        }
      : vehicleType === 'Kombi'
        ? {
            src: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/kombi.jpg',
            alt: 'Airport taxi station wagon',
          }
        : {
            src: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
            alt: 'Airport taxi sedan',
          };

  return (
    <div
      className="relative mt-0 grid h-[3.75rem] grid-cols-[31%_39%_30%] overflow-visible md:h-[4.95rem] md:grid-cols-[30%_42%_28%]"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-[0.27rem] top-[0.27rem] rounded-[0.54rem] border bg-[var(--panel)] md:bottom-[0.38rem] md:top-[0.38rem] md:rounded-[0.65rem] ${
          invalid ? 'border-[var(--red)]' : 'border-[var(--line)]'
        }`}
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center justify-center bg-transparent px-1 py-1 md:px-2 md:py-1">
        <div className="relative h-[2.8rem] w-[4.7rem] shrink-0 md:h-[4.14rem] md:w-[6.2rem]">
          <Image
            src={vehicleImage.src}
            alt={vehicleImage.alt}
            fill
            className="object-contain object-center mix-blend-multiply"
            sizes="(min-width: 768px) 145px, 122px"
          />
        </div>
      </div>
      <div className="relative z-10 flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1 text-center md:items-start md:gap-1 md:px-2.5 md:py-1 md:text-left">
        <div className="flex min-w-0 max-w-full items-center justify-center gap-0.5 text-[0.65rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--paper)] md:justify-start md:text-[0.72rem]">
          <span className="truncate">{routeFrom}</span>
          <span className="shrink-0">→</span>
          <span className="truncate">{routeTo}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[0.56rem] font-medium text-[var(--muted)] md:justify-start md:gap-x-2 md:text-[0.55rem]">
          <span className="inline-flex items-center gap-0.5" title="Passengers">
            <Users className="h-[9px] w-[9px] text-[var(--amber)] md:h-[10px] md:w-[10px]" />
            {passengerValue}
          </span>
          <span className="text-[var(--line)]">|</span>
          <span className="inline-flex items-center gap-0.5" title="Check-in luggage">
            <Briefcase className="h-[9px] w-[9px] text-[var(--amber)] md:h-[10px] md:w-[10px]" />
            {luggageValue}
          </span>
        </div>
      </div>
      <div className={`relative z-10 flex min-w-0 flex-col items-end justify-center gap-0.5 px-2 py-1 text-right md:px-2.5 md:py-1 ${onEdit ? 'pt-7 md:pt-7' : ''}`}>
        <p className="truncate text-[0.65rem] font-semibold leading-none tracking-[-0.02em] text-[var(--amber)] md:text-[0.61rem]">
          {vehicleLabel}
        </p>
        <p className="text-[0.83rem] font-semibold leading-none tracking-[-0.05em] text-[var(--paper)] md:text-[1.37rem]">
          {totalPrice === null ? (
            <span className="text-[0.65rem] tracking-[-0.02em] md:text-[0.9rem]">On request</span>
          ) : (
            <AnimatedPrice value={totalPrice} currencyDisplay="symbol" />
          )}
        </p>
        <div className="flex min-h-[0.63rem] items-center justify-end md:min-h-[0.76rem]">
          <div
            className={`inline-flex items-center gap-1 text-[0.56rem] font-semibold text-[var(--amber)] md:text-[0.55rem] ${
              paymentLabel ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={!paymentLabel}
          >
            <PaymentIcon className="h-[9px] w-[9px] md:h-[10px] md:w-[10px]" />
            <span>{stablePaymentLabel}</span>
          </div>
        </div>
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-2 top-2 z-20 inline-flex min-h-8 items-center gap-1 rounded-[0.45rem] border border-[var(--line)] bg-[var(--panel)] px-2 text-[0.68rem] font-semibold text-[var(--amber)] shadow-[0_6px_14px_rgba(17,17,17,0.05)] transition-colors hover:bg-[rgba(255,182,41,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 md:right-3 md:top-3 md:h-8 md:min-h-0 md:gap-1.5 md:rounded-[0.5rem] md:px-3 md:text-[0.78rem] md:shadow-[0_8px_18px_rgba(17,17,17,0.05)]"
          aria-label="Edit passengers and check-in luggage"
        >
          <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5" />
          Edit
        </button>
      ) : null}
    </div>
  );
}
