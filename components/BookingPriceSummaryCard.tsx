'use client';

import Image from 'next/image';
import { Briefcase, Pencil, ShoppingBag, Users } from 'lucide-react';
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
      className={`relative grid min-h-[3.3rem] grid-cols-[30%_40%_30%] overflow-hidden rounded-[0.38rem] border bg-[#f8fbff] shadow-[0_4px_9px_rgba(17,17,17,0.04)] md:min-h-[6.75rem] md:grid-cols-[30%_42%_28%] md:rounded-[0.53rem] md:shadow-[0_6px_14px_rgba(17,17,17,0.05)] ${
        invalid ? 'border-[#d70015]' : 'border-[#dbe7f8]'
      }`}
    >
      <div className="relative flex items-center justify-center bg-transparent px-0.5 py-1 md:px-1 md:py-1.5">
        <div className="relative h-[2.1rem] w-[2.94rem] shrink-0 md:h-24 md:w-36">
          <Image
            src={vehicleImage.src}
            alt={vehicleImage.alt}
            fill
            className="object-contain mix-blend-multiply"
            sizes="(min-width: 768px) 144px, 47px"
          />
        </div>
      </div>
      <div className="relative z-10 flex min-w-0 flex-col justify-center gap-0.5 px-1 py-1 text-left md:gap-1 md:px-2.5 md:py-2">
        <p className="truncate text-[0.36rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827] md:text-[0.59rem]">
          {compactRoute}
        </p>
        <p className="text-[0.45rem] font-semibold leading-none tracking-[-0.03em] text-[#1F7CFF] md:text-[0.75rem]">
          {vehicleLabel}
        </p>
      </div>
      <div className={`relative z-10 flex min-w-0 flex-col items-end justify-center gap-0.5 px-1.5 py-1 text-right md:gap-1 md:px-2.5 md:py-2 ${onEdit ? 'pt-5 md:pt-6' : ''}`}>
        <p className="text-[0.63rem] font-semibold leading-none tracking-[-0.05em] text-[#111827] md:text-[1.23rem]">
          {totalPrice} EUR
        </p>
        <div className="flex flex-wrap items-center justify-end gap-x-0.5 gap-y-0.5 text-[0.29rem] font-medium text-[#5f6975] md:gap-x-1.5 md:text-[0.43rem]">
          <span className="inline-flex items-center gap-[1px] md:gap-0.5" title="Passengers">
            <Users className="h-[5px] w-[5px] text-[#1F7CFF] md:h-[7.5px] md:w-[7.5px]" />
            {passengerValue}
          </span>
          <span className="text-[#b7bec8]">|</span>
          <span className="inline-flex items-center gap-[1px] md:gap-0.5" title="Suitcases">
            <Briefcase className="h-[5px] w-[5px] text-[#1F7CFF] md:h-[7.5px] md:w-[7.5px]" />
            {luggageValue}
          </span>
          <span className="text-[#b7bec8]">|</span>
          <span className="inline-flex items-center gap-[1px] md:gap-0.5" title="Hand luggage">
            <ShoppingBag className="h-[5px] w-[5px] text-[#1F7CFF] md:h-[7.5px] md:w-[7.5px]" />
            {handLuggageValue}
          </span>
        </div>
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-1 top-1 z-20 inline-flex min-h-[1.125rem] items-center gap-0.5 rounded-[0.23rem] border border-[#dbe7f8] bg-white px-1 text-[0.34rem] font-semibold text-[#1F7CFF] shadow-[0_3px_7px_rgba(17,17,17,0.05)] transition-colors hover:bg-[#eef5ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2 md:right-1.5 md:top-1.5 md:h-[1.125rem] md:min-h-0 md:gap-0.5 md:rounded-[0.28rem] md:px-1.5 md:text-[0.41rem] md:shadow-[0_4px_9px_rgba(17,17,17,0.05)]"
          aria-label="Edit passengers and luggage"
        >
          <Pencil className="h-1.5 w-1.5 md:h-[7px] md:w-[7px]" />
          Edit
        </button>
      ) : null}
    </div>
  );
}
