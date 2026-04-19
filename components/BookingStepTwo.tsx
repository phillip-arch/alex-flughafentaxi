'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Armchair, Baby, Briefcase, ChevronLeft, Minus, Plus, ShieldCheck, ShoppingBag, Users, X } from 'lucide-react';
import { formatVehicleTypeLabel } from '@/lib/pricing';

type BookingStepTwoProps = {
  formData: any;
  totalPrice: number;
  vehicleType: string;
  error: string | null;
  flightLookupError: string | null;
  isLookingUpFlight: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFlightNumberBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleMeetAndGreetChange: (checked: boolean) => void;
  getInputClassName: (name: any) => string;
  isFieldInvalid: (name: any) => boolean;
  updateStepperValue: (name: any, delta: -1 | 1, min: number, max: number) => void;
  prevStep: () => void;
  nextStep: () => void;
  actionRowClass: string;
  primaryActionButtonClass: string;
  secondaryBackButtonClass: string;
};

export default function BookingStepTwo({
  formData,
  totalPrice,
  vehicleType,
  error,
  flightLookupError,
  isLookingUpFlight,
  handleChange,
  handleBlur,
  handleFlightNumberBlur,
  handleMeetAndGreetChange,
  getInputClassName,
  isFieldInvalid,
  updateStepperValue,
  prevStep,
  nextStep,
  actionRowClass,
  primaryActionButtonClass,
  secondaryBackButtonClass,
}: BookingStepTwoProps) {
  const [isTravelSheetOpen, setIsTravelSheetOpen] = useState(false);
  const [isChildSeatSheetOpen, setIsChildSeatSheetOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const passengerValue = formData.passengers === '' ? '--' : formData.passengers;
  const luggageValue = formData.luggage === '' ? '--' : formData.luggage;
  const handLuggageValue = formData.handLuggage === '' ? '--' : formData.handLuggage;
  const childSeatTotal = formData.babySeats + formData.childSeats + formData.boosterSeats;
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
  const travelSummaryInvalid =
    isFieldInvalid('passengers') || isFieldInvalid('luggage') || isFieldInvalid('handLuggage');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isTravelSheetOpen && !isChildSeatSheetOpen) return;

    const scrollY = window.scrollY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTravelSheetOpen(false);
        setIsChildSeatSheetOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isTravelSheetOpen, isChildSeatSheetOpen]);

  const renderSheetStepper = (
    name: 'passengers' | 'luggage' | 'handLuggage' | 'babySeats' | 'childSeats' | 'boosterSeats',
    label: string,
    value: number | '',
    min: number,
    max: number,
    Icon: typeof Users
  ) => (
    <div className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-[#e4e8ef] bg-[#f8fbff] px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1F7CFF] shadow-[0_8px_18px_rgba(17,17,17,0.06)]">
          <Icon size={19} />
        </span>
        <p className="text-[1rem] font-semibold tracking-[-0.03em] text-[#111827]">{label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => updateStepperValue(name, -1, min, max)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#111827] transition-colors hover:bg-[#eef5ff]"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={20} />
        </button>
        <span className="min-w-[2.4rem] text-center text-[1.45rem] font-semibold tracking-[-0.04em] text-[#111827]">
          {value === '' ? '--' : value}
        </span>
        <button
          type="button"
          onClick={() => updateStepperValue(name, 1, min, max)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F7CFF] text-white transition-colors hover:bg-[#176be0]"
          aria-label={`Increase ${label}`}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );

  const travelSheet =
    isTravelSheetOpen && isMounted
      ? createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end bg-black/45 px-0 md:items-center md:justify-center md:px-4" role="dialog" aria-modal="true" aria-label="Passengers and luggage">
            <button
              type="button"
              aria-label="Close passengers and luggage"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setIsTravelSheetOpen(false)}
            />
            <div className="relative w-full animate-in slide-in-from-bottom-8 duration-200 rounded-t-[1.5rem] bg-white px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(17,17,17,0.2)] md:max-w-[34rem] md:rounded-[1.5rem] md:px-6 md:py-6 md:shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d9dee7] md:hidden" />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[#111827]">Passengers and luggage</h3>
                  <p className="mt-1 text-[0.92rem] text-[#6d7075]">Adjust each item before continuing.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTravelSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e4e8ef] bg-white text-[#111827]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                {renderSheetStepper('passengers', 'Passengers', formData.passengers, 1, 8, Users)}
                {renderSheetStepper('luggage', 'Suitcases', formData.luggage, 0, 8, Briefcase)}
                {renderSheetStepper('handLuggage', 'Hand luggage', formData.handLuggage, 0, 8, ShoppingBag)}
              </div>
              <button
                type="button"
                onClick={() => setIsTravelSheetOpen(false)}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-[var(--radius-field)] bg-[#1F7CFF] text-[1rem] font-semibold text-white transition-colors hover:bg-[#176be0]"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  const childSeatSheet =
    isChildSeatSheetOpen && isMounted
      ? createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end bg-black/45 px-0 md:items-center md:justify-center md:px-4" role="dialog" aria-modal="true" aria-label="Child seats">
            <button
              type="button"
              aria-label="Close child seats"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setIsChildSeatSheetOpen(false)}
            />
            <div className="relative w-full animate-in slide-in-from-bottom-8 duration-200 rounded-t-[1.5rem] bg-white px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(17,17,17,0.2)] md:max-w-[34rem] md:rounded-[1.5rem] md:px-6 md:py-6 md:shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d9dee7] md:hidden" />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[#111827]">Child seats</h3>
                  <p className="mt-1 text-[0.92rem] text-[#6d7075]">Choose the seats you need for the ride.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChildSeatSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e4e8ef] bg-white text-[#111827]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                {renderSheetStepper('babySeats', 'Baby seat', formData.babySeats, 0, 3, Baby)}
                {renderSheetStepper('childSeats', 'Child seat', formData.childSeats, 0, 3, Armchair)}
                {renderSheetStepper('boosterSeats', 'Booster seat', formData.boosterSeats, 0, 3, ShieldCheck)}
              </div>
              <button
                type="button"
                onClick={() => setIsChildSeatSheetOpen(false)}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-[var(--radius-field)] bg-[#1F7CFF] text-[1rem] font-semibold text-white transition-colors hover:bg-[#176be0]"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {formData.direction === 'from_airport' ? (
        <div>
          <p className="mb-3 ml-1 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#6d7075]">Flight details</p>
          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            <div>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                onBlur={handleFlightNumberBlur}
                placeholder="Flight number (e.g. OS123)"
                className={getInputClassName('flightNumber')}
              />
            </div>
            <div className="flex min-h-[var(--field-height)] items-center justify-between rounded-[var(--radius-field)] bg-[#f5f5f7] px-4 py-3 md:relative md:top-[-10px] md:col-span-2 md:min-h-[3rem]">
              <div className="flex min-w-0 items-center">
                <div className="min-w-0 text-[#1d1d1f]">
                  <p className="text-[15px] font-medium leading-tight">Meet &amp; Greet (+6€)</p>
                  <p className="mt-0.5 text-[13px] leading-tight text-[#86868b] md:whitespace-nowrap">
                    Driver waits inside arrivals with a name sign.
                  </p>
                </div>
              </div>
              <label className="relative ml-3 inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={Boolean(formData.meetAndGreet)}
                  onChange={(event) => handleMeetAndGreetChange(event.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-[31px] w-[51px] rounded-full bg-[#e9e9ea] peer peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] peer-focus:outline-none peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-[27px] after:w-[27px] after:rounded-full after:border after:border-gray-300 after:bg-white after:shadow-sm after:transition-all after:content-['']"></div>
              </label>
            </div>
          </div>
          {isLookingUpFlight ? (
            <p className="mt-2 ml-1 text-[12px] text-[#6d7075]">Loading flight data...</p>
          ) : null}
          {flightLookupError ? (
            <div className="mt-2 rounded-[var(--radius-field)] border border-[rgba(215,0,21,0.18)] bg-[rgba(215,0,21,0.05)] px-4 py-3 text-[0.95rem] font-medium text-[#d70015]">
              {flightLookupError}
            </div>
          ) : null}
        </div>
      ) : null}

      <div>
        <label className={`mb-2 ml-1 block text-[12px] font-medium uppercase tracking-wide ${travelSummaryInvalid ? 'text-[#d70015]' : 'text-[#6d7075]'}`}>
          Passengers and luggage
        </label>
        <button
          type="button"
          onClick={() => setIsTravelSheetOpen(true)}
          className={`ui-field-surface flex h-14 w-full items-center justify-between rounded-[var(--radius-field)] border px-4 text-left text-[#1d1d1f] outline-none transition-all md:h-[3rem] ${
            travelSummaryInvalid
              ? 'border-[#d70015] text-[#d70015]'
              : 'border-[#d2d2d7] focus:border-[#7fb3ff] focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)]'
          }`}
          aria-haspopup="dialog"
          aria-expanded={isTravelSheetOpen}
          aria-label={`${passengerValue} passengers, ${luggageValue} suitcases, ${handLuggageValue} hand luggage`}
        >
          <span className="flex min-w-0 items-center gap-4 text-[15px] font-semibold tracking-[-0.03em] sm:hidden">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap" title="Passengers">
              <Users size={18} className={travelSummaryInvalid ? 'text-[#d70015]' : 'text-[#1F7CFF]'} />
              {passengerValue}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap" title="Suitcases">
              <Briefcase size={18} className={travelSummaryInvalid ? 'text-[#d70015]' : 'text-[#1F7CFF]'} />
              {luggageValue}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap" title="Hand luggage">
              <ShoppingBag size={18} className={travelSummaryInvalid ? 'text-[#d70015]' : 'text-[#1F7CFF]'} />
              {handLuggageValue}
            </span>
          </span>
          <span className="hidden min-w-0 items-center gap-3 text-[15px] font-semibold tracking-[-0.03em] sm:flex md:text-[16px]">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Users size={18} className={travelSummaryInvalid ? 'text-[#d70015]' : 'text-[#1F7CFF]'} />
              {passengerValue} Passengers
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Briefcase size={18} className={travelSummaryInvalid ? 'text-[#d70015]' : 'text-[#1F7CFF]'} />
              {luggageValue} Suitcases
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <ShoppingBag size={18} className={travelSummaryInvalid ? 'text-[#d70015]' : 'text-[#1F7CFF]'} />
              {handLuggageValue} Hand luggage
            </span>
          </span>
          <ChevronLeft size={18} className="-rotate-90 text-[#86868b]" />
        </button>
      </div>

      {travelSheet}

      <div>
        <label className="mb-2 ml-1 block text-[12px] font-medium uppercase tracking-wide text-[#6d7075]">
          Child seats
        </label>
        <button
          type="button"
          onClick={() => setIsChildSeatSheetOpen(true)}
          className="ui-field-surface flex h-14 w-full items-center justify-between rounded-[var(--radius-field)] border border-[#d2d2d7] px-4 text-left text-[#1d1d1f] outline-none transition-all focus:border-[#7fb3ff] focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)] md:h-[3rem]"
          aria-haspopup="dialog"
          aria-expanded={isChildSeatSheetOpen}
        >
          <span className="flex min-w-0 items-center gap-3 text-[15px] font-semibold tracking-[-0.03em] md:text-[16px]">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Baby size={18} className="text-[#1F7CFF]" />
              {childSeatTotal > 0 ? `${childSeatTotal} seats` : 'No child seats'}
            </span>
            {formData.babySeats > 0 ? (
              <span className="hidden items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[#6d7075] sm:inline-flex">
                {formData.babySeats} baby
              </span>
            ) : null}
            {formData.childSeats > 0 ? (
              <span className="hidden items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[#6d7075] sm:inline-flex">
                {formData.childSeats} child
              </span>
            ) : null}
            {formData.boosterSeats > 0 ? (
              <span className="hidden items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[#6d7075] sm:inline-flex">
                {formData.boosterSeats} booster
              </span>
            ) : null}
          </span>
          <ChevronLeft size={18} className="-rotate-90 text-[#86868b]" />
        </button>
        <p className="mt-2 ml-1 text-[12px] text-[#86868b]">Included free of charge</p>
      </div>

      {childSeatSheet}

      <div className="flex min-h-[6.25rem] items-center justify-between gap-4 rounded-[1.05rem] border border-[#dbe7f8] bg-[#f8fbff] px-4 py-4 shadow-[0_12px_28px_rgba(17,17,17,0.05)] md:min-h-[7.25rem] md:px-5 md:py-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[0.9rem] border border-[#dbe7f8] bg-white shadow-[0_10px_24px_rgba(17,17,17,0.06)] md:h-24 md:w-36">
            <Image
              src={vehicleImage.src}
              alt={vehicleImage.alt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 144px, 112px"
            />
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="text-[1.05rem] font-semibold tracking-[-0.04em] text-[#1F7CFF] md:text-[1.16rem]">{vehicleLabel}</p>
          </div>
        </div>
        <div className="shrink-0 text-left">
          <p className="mb-1 text-[0.95rem] font-semibold leading-none tracking-[-0.03em] text-[#1F7CFF] md:hidden">
            {vehicleLabel}
          </p>
          <span className="block text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#111827] md:text-[2.45rem]">
            {totalPrice} EUR
          </span>
        </div>
      </div>

      {error ? (
        <div className="mt-4 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8]">
          <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
          {error}
        </div>
      ) : null}

      <div className={actionRowClass}>
        <button type="button" onClick={prevStep} className={secondaryBackButtonClass}>
          <ChevronLeft size={24} />
        </button>
        <button type="button" onClick={nextStep} className={primaryActionButtonClass}>
          Next
        </button>
      </div>
    </div>
  );
}
