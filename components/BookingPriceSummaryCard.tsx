'use client';

import Image from 'next/image';
import { Briefcase, CreditCard, Pencil, ShoppingBag, Users, Wallet } from 'lucide-react';
import { formatVehicleTypeLabel } from '@/lib/pricing';

type BookingPriceSummaryCardProps = {
  formData: any;
  totalPrice: number;
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
  const handLuggageValue = formData.handLuggage === '' ? '--' : formData.handLuggage;
  const cityLabel = formData.city?.trim() || formData.zip?.trim() || 'Pickup';
  const compactRoute =
    formData.direction === 'to_airport' ? `${cityLabel} \u2192 VIE` : `VIE \u2192 ${cityLabel}`;
  const vehicleLabel = formatVehicleTypeLabel(vehicleType);
  const paymentLabel =
    formData.paymentMethod === 'cash'
      ? 'Cash payment'
      : formData.paymentMethod === 'card'
        ? 'Credit card'
        : null;
  const stablePaymentLabel = paymentLabel ?? 'Cash payment';
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
      className={`relative mt-1 grid h-[4.6rem] grid-cols-[30%_40%_30%] overflow-hidden rounded-[0.75rem] border bg-[#f8fbff] shadow-[0_8px_18px_rgba(17,17,17,0.04)] md:mt-4 md:h-[6.85rem] md:grid-cols-[30%_42%_28%] md:rounded-[0.9rem] md:shadow-[0_12px_26px_rgba(17,17,17,0.05)] ${
        invalid ? 'border-[#d70015]' : 'border-[#dbe7f8]'
      }`}
    >
      <div className="relative flex items-center justify-center bg-transparent px-1 py-1 md:px-2 md:py-1">
        <div className="relative h-[4rem] w-[5.6rem] shrink-0 md:h-[6.35rem] md:w-[9.55rem]">
          <Image
            src={vehicleImage.src}
            alt={vehicleImage.alt}
            fill
            className="object-contain mix-blend-multiply"
            sizes="(min-width: 768px) 180px, 90px"
          />
        </div>
      </div>
      <div className="relative z-10 flex min-w-0 flex-col justify-center gap-1 px-2 py-1 text-left md:gap-1.5 md:px-4 md:py-1">
        <p className="truncate text-[0.72rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827] md:text-[1rem]">
          {compactRoute}
        </p>
        <p className="text-[0.85rem] font-semibold leading-none tracking-[-0.03em] text-[#1F7CFF] md:text-[1.18rem]">
          {vehicleLabel}
        </p>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.62rem] font-medium text-[#5f6975] md:gap-x-2.5 md:text-[0.76rem]">
          <span className="inline-flex items-center gap-0.5 md:gap-1" title="Passengers">
            <Users className="h-2.5 w-2.5 text-[#1F7CFF] md:h-[14px] md:w-[14px]" />
            {passengerValue}
          </span>
          <span className="text-[#b7bec8]">|</span>
          <span className="inline-flex items-center gap-0.5 md:gap-1" title="Suitcases">
            <Briefcase className="h-2.5 w-2.5 text-[#1F7CFF] md:h-[14px] md:w-[14px]" />
            {luggageValue}
          </span>
          <span className="text-[#b7bec8]">|</span>
          <span className="inline-flex items-center gap-0.5 md:gap-1" title="Hand luggage">
            <ShoppingBag className="h-2.5 w-2.5 text-[#1F7CFF] md:h-[14px] md:w-[14px]" />
            {handLuggageValue}
          </span>
        </div>
      </div>
      <div className={`relative z-10 flex min-w-0 flex-col items-end justify-center gap-1 px-2.5 py-1 text-right md:gap-1.5 md:px-4 md:py-1 ${onEdit ? 'pt-8 md:pt-10' : ''}`}>
        <p className="text-[1.15rem] font-semibold leading-none tracking-[-0.05em] text-[#111827] md:text-[1.9rem]">
          {totalPrice} EUR
        </p>
        <div className="flex min-h-[0.88rem] items-center justify-end md:min-h-[1.05rem]">
          <div
            className={`inline-flex items-center gap-1 text-[0.62rem] font-semibold text-[#1F7CFF] md:text-[0.76rem] ${
              paymentLabel ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={!paymentLabel}
          >
            <PaymentIcon className="h-2.5 w-2.5 md:h-[14px] md:w-[14px]" />
            <span>{stablePaymentLabel}</span>
          </div>
        </div>
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-2 top-2 z-20 inline-flex min-h-8 items-center gap-1 rounded-[0.45rem] border border-[#dbe7f8] bg-white px-2 text-[0.68rem] font-semibold text-[#1F7CFF] shadow-[0_6px_14px_rgba(17,17,17,0.05)] transition-colors hover:bg-[#eef5ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2 md:right-3 md:top-3 md:h-8 md:min-h-0 md:gap-1.5 md:rounded-[0.5rem] md:px-3 md:text-[0.78rem] md:shadow-[0_8px_18px_rgba(17,17,17,0.05)]"
          aria-label="Edit passengers and luggage"
        >
          <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5" />
          Edit
        </button>
      ) : null}
    </div>
  );
}
