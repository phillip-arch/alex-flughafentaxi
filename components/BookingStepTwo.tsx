'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Armchair, Baby, Briefcase, ChevronLeft, Minus, Plus, ShieldCheck, ShoppingBag, Users, X } from 'lucide-react';
import { formatVehicleTypeLabel, type VehicleType } from '@/lib/pricing';
import AnimatedPrice from './AnimatedPrice';
import { BOOKING_OVERLAY_BACKDROP_CLASS } from './bookingOverlayStyles';

type VehiclePriceOption = {
  vehicleType: VehicleType;
  totalPrice: number;
};

// Keep the upgrade card styling in place for a later upsell return.
const ENABLE_TRAVEL_UPSELL = false;

type BookingStepTwoProps = {
  formData: any;
  vehicleType: VehicleType;
  vehiclePriceOptions: VehiclePriceOption[];
  onVehicleUpgrade: (nextVehicleType: VehicleType) => void;
  onTravelDetailsConfirm: (selectedVehicleType: VehicleType) => void;
  handleMeetAndGreetChange: (checked: boolean) => void;
  error: string | null;
  isFieldInvalid: (name: any) => boolean;
  updateStepperValue: (name: any, delta: -1 | 1, min: number, max: number) => void;
  prevStep: () => void;
  nextStep: () => void;
  actionRowClass: string;
  actionButtonGroupClass: string;
  actionTrustLine: React.ReactNode;
  primaryActionButtonClass: string;
  secondaryBackButtonClass: string;
};

export default function BookingStepTwo({
  formData,
  vehicleType,
  vehiclePriceOptions,
  onVehicleUpgrade,
  onTravelDetailsConfirm,
  handleMeetAndGreetChange,
  error,
  isFieldInvalid,
  updateStepperValue,
  prevStep,
  nextStep,
  actionRowClass,
  actionButtonGroupClass,
  actionTrustLine,
  primaryActionButtonClass,
  secondaryBackButtonClass,
}: BookingStepTwoProps) {
  const [isTravelSheetOpen, setIsTravelSheetOpen] = useState(false);
  const [isChildSeatSheetOpen, setIsChildSeatSheetOpen] = useState(false);
  const [activeTravelVehicleType, setActiveTravelVehicleType] = useState<VehicleType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const childSeatTotal = formData.babySeats + formData.childSeats + formData.boosterSeats;
  const hasSelectedTravelDetails = Boolean(formData.travelDetailsSelected);
  const travelSummaryInvalid =
    isFieldInvalid('passengers') || isFieldInvalid('luggage') || isFieldInvalid('handLuggage');
  const vehicleOrder: VehicleType[] = ['Limo', 'Kombi', 'Bus'];
  const vehicleCards: Array<{
    vehicleType: VehicleType;
    maxPassengers: number;
    maxSuitcases: number;
    imageSrc: string;
    imageAlt: string;
  }> = [
    {
      vehicleType: 'Limo',
      maxPassengers: 2,
      maxSuitcases: 2,
      imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
      imageAlt: 'Airport taxi sedan',
    },
    {
      vehicleType: 'Kombi',
      maxPassengers: 4,
      maxSuitcases: 4,
      imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/kombi.jpg',
      imageAlt: 'Airport taxi station wagon',
    },
    {
      vehicleType: 'Bus',
      maxPassengers: 8,
      maxSuitcases: 8,
      imageSrc: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/bus.jpg',
      imageAlt: 'Airport taxi minivan',
    },
  ];

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
  ) => {
    const numericValue = typeof value === 'number' ? value : null;
    const isAtMin = numericValue !== null && numericValue <= min;
    const isAtMax = numericValue !== null && numericValue >= max;

    return (
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
            disabled={isAtMin}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#111827] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-[#f3f4f6] disabled:text-[#b6bcc6] disabled:hover:bg-[#f3f4f6]"
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
            disabled={isAtMax}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F7CFF] text-white transition-colors hover:bg-[#176be0] disabled:cursor-not-allowed disabled:bg-[#d1d5db] disabled:hover:bg-[#d1d5db]"
            aria-label={`Increase ${label}`}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderInlineTravelStepper = (
    name: 'passengers' | 'luggage' | 'handLuggage',
    label: string,
    value: number | '',
    min: number,
    max: number,
    Icon: typeof Users
  ) => {
    const numericValue = typeof value === 'number' ? value : null;
    const isAtMin = numericValue !== null && numericValue <= min;
    const isAtMax = numericValue !== null && numericValue >= max;

    return (
      <div className="flex min-h-[4.65rem] items-center justify-between gap-3 rounded-[1.15rem] border border-[#dbe7f8] bg-white px-4 py-2 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:min-h-[6.7rem] md:flex-col md:items-center md:justify-center md:gap-5 md:px-4 md:py-4 [@media(min-width:768px)_and_(max-height:850px)]:min-h-[5.65rem] [@media(min-width:768px)_and_(max-height:850px)]:gap-3 [@media(min-width:768px)_and_(max-height:850px)]:px-3 [@media(min-width:768px)_and_(max-height:850px)]:py-3">
        <div className="flex min-w-0 items-center gap-3 md:justify-center md:gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f7fb] text-[#1F7CFF] md:h-auto md:w-auto md:bg-transparent">
            <Icon size={18} className="md:h-[17px] md:w-[17px]" />
          </span>
          <p className="truncate text-[1.02rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827] md:text-[1rem]">
            {label}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 md:w-full md:justify-center md:gap-7 [@media(min-width:768px)_and_(max-height:850px)]:gap-5">
          <button
            type="button"
            onClick={() => updateStepperValue(name, -1, min, max)}
            disabled={isAtMin}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#111827] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-white disabled:text-[#c3cad5] disabled:hover:bg-white md:h-11 md:w-11 [@media(min-width:768px)_and_(max-height:850px)]:h-9 [@media(min-width:768px)_and_(max-height:850px)]:w-9"
            aria-label={`Decrease ${label}`}
          >
            <Minus size={17} className="md:h-[18px] md:w-[18px]" />
          </button>
          <span className="min-w-[1.7rem] text-center text-[1.12rem] font-semibold leading-none tracking-[-0.04em] text-[#111827] md:min-w-[1.6rem] md:text-[1.15rem]">
            {value === '' ? '--' : value}
          </span>
          <button
            type="button"
            onClick={() => updateStepperValue(name, 1, min, max)}
            disabled={isAtMax}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F7CFF] text-white transition-colors hover:bg-[#176be0] disabled:cursor-not-allowed disabled:bg-[#d1d5db] disabled:hover:bg-[#d1d5db] md:h-11 md:w-11 [@media(min-width:768px)_and_(max-height:850px)]:h-9 [@media(min-width:768px)_and_(max-height:850px)]:w-9"
            aria-label={`Increase ${label}`}
          >
            <Plus size={17} className="md:h-[18px] md:w-[18px]" />
          </button>
        </div>
      </div>
    );
  };

  const renderSheetHeader = (title: string, description: string, onClose: () => void) => (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[#111827]">{title}</h3>
        <p className="mt-1 text-[0.92rem] text-[#6d7075]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e4e8ef] bg-white text-[#111827]"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );

  const getVehicleOptionPrice = (optionVehicleType: VehicleType) =>
    vehiclePriceOptions.find((option) => option.vehicleType === optionVehicleType)?.totalPrice ?? 0;

  const getNextVehicleType = (optionVehicleType: VehicleType) => {
    const currentIndex = vehicleOrder.indexOf(optionVehicleType);
    return currentIndex >= 0 ? vehicleOrder[currentIndex + 1] : undefined;
  };
  const sheetVehicleType = activeTravelVehicleType ?? vehicleType;
  const currentVehicleCard = vehicleCards.find((card) => card.vehicleType === sheetVehicleType);
  const currentVehiclePrice = getVehicleOptionPrice(sheetVehicleType);
  const inlineVehicleCard = vehicleCards.find((card) => card.vehicleType === vehicleType);
  const inlineVehiclePrice = getVehicleOptionPrice(vehicleType);
  const nextVehicleType = currentVehicleCard ? getNextVehicleType(currentVehicleCard.vehicleType) : undefined;
  const nextVehiclePrice = nextVehicleType ? getVehicleOptionPrice(nextVehicleType) : 0;
  const upgradePrice = Math.max(0, nextVehiclePrice - currentVehiclePrice);
  const passengerValue = formData.passengers === '' ? 0 : formData.passengers;
  const suitcaseValue = formData.luggage === '' ? 0 : formData.luggage;
  const handLuggageValue = formData.handLuggage === '' ? 0 : formData.handLuggage;
  const canUseMeetAndGreet = formData.direction === 'from_airport';
  const shouldShowTravelUpsell =
    ENABLE_TRAVEL_UPSELL &&
    Boolean(currentVehicleCard && nextVehicleType) &&
    (passengerValue >= (currentVehicleCard?.maxPassengers ?? Number.POSITIVE_INFINITY) ||
      suitcaseValue >= (currentVehicleCard?.maxSuitcases ?? Number.POSITIVE_INFINITY) ||
      handLuggageValue >= (currentVehicleCard?.maxSuitcases ?? Number.POSITIVE_INFINITY));

  const confirmTravelSheet = () => {
    onTravelDetailsConfirm(sheetVehicleType);
    setIsTravelSheetOpen(false);
  };

  const openTravelSheet = (selectedVehicleType: VehicleType) => {
    setActiveTravelVehicleType(selectedVehicleType);
    setIsTravelSheetOpen(true);
  };

  const handleTravelUpgrade = (nextSelectedVehicleType: VehicleType) => {
    setActiveTravelVehicleType(nextSelectedVehicleType);
    onVehicleUpgrade(nextSelectedVehicleType);
  };

  const renderInlineTravelDetails = () => (
    <div className="space-y-6 [@media(min-width:768px)_and_(max-height:850px)]:space-y-4">
      {inlineVehicleCard ? (
        <div
          className={`flex min-h-[7.25rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 overflow-hidden rounded-[1.15rem] border bg-white px-6 py-3.5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] md:min-h-[7.5rem] md:flex-nowrap md:gap-4 [@media(min-width:768px)_and_(max-height:850px)]:min-h-[6rem] [@media(min-width:768px)_and_(max-height:850px)]:px-5 [@media(min-width:768px)_and_(max-height:850px)]:py-3 ${
            travelSummaryInvalid ? 'border-[#d70015]' : 'border-[#dbe7f8]'
          }`}
        >
          <div className="relative order-1 h-[5rem] w-[8.25rem] shrink-0 overflow-visible md:order-none md:h-[6.35rem] md:w-[10.5rem] [@media(min-width:768px)_and_(max-height:850px)]:h-[5.2rem] [@media(min-width:768px)_and_(max-height:850px)]:w-[8.65rem]">
            <Image
              src={inlineVehicleCard.imageSrc}
              alt={inlineVehicleCard.imageAlt}
              fill
              className="scale-[1.875] object-contain mix-blend-multiply"
              sizes="(min-width: 768px) 194px, 146px"
            />
          </div>
          <div className="order-3 min-w-0 basis-full px-0 text-left md:order-none md:flex-1 md:basis-auto md:px-2">
            <p className="whitespace-normal text-[0.9rem] font-medium leading-snug text-[#5f6975] md:text-[1rem] [@media(min-width:768px)_and_(max-height:850px)]:text-[0.86rem]">
              Max. {inlineVehicleCard.maxPassengers} passengers and{' '}
              <br />
              {inlineVehicleCard.maxSuitcases} check-in suitcases
            </p>
          </div>
          <div className="order-2 min-w-0 shrink-0 text-right md:order-none">
            <p className="truncate text-[1.2rem] font-semibold leading-tight tracking-[-0.03em] text-[#1F7CFF] md:text-[1.25rem] [@media(min-width:768px)_and_(max-height:850px)]:text-[1.05rem]">
              {formatVehicleTypeLabel(inlineVehicleCard.vehicleType)}
            </p>
            <p className="mt-2 text-right text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#111827] md:text-[2.25rem] [@media(min-width:768px)_and_(max-height:850px)]:text-[1.7rem]">
              <AnimatedPrice value={inlineVehiclePrice} />
            </p>
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {renderInlineTravelStepper('passengers', 'Passengers', formData.passengers, 1, 8, Users)}
        {renderInlineTravelStepper('luggage', 'Suitcases', formData.luggage, 0, 8, Briefcase)}
        {renderInlineTravelStepper('handLuggage', 'Hand luggage', formData.handLuggage, 0, 8, ShoppingBag)}
      </div>
    </div>
  );

  const renderVehiclePriceCards = () => (
    <div className="space-y-3 [@media(min-width:768px)_and_(max-height:850px)]:space-y-2">
      {vehicleCards.map((card) => {
        const isSelected = hasSelectedTravelDetails && card.vehicleType === vehicleType;
        const isUnavailable =
          hasSelectedTravelDetails &&
          !isSelected &&
          (passengerValue > card.maxPassengers ||
            suitcaseValue > card.maxSuitcases ||
            handLuggageValue > card.maxSuitcases);
        const price = getVehicleOptionPrice(card.vehicleType);

        return (
          <div
            key={card.vehicleType}
            className={`relative h-[6.55rem] rounded-[0.95rem] border bg-[#f8fbff] px-4 py-4 shadow-[0_8px_18px_rgba(17,17,17,0.04)] transition-colors md:h-[8.5rem] [@media(min-width:768px)_and_(max-height:850px)]:h-[5.65rem] [@media(min-width:768px)_and_(max-height:850px)]:px-3 [@media(min-width:768px)_and_(max-height:850px)]:py-2.5 ${
              isUnavailable
                ? 'border-[#e5e7eb] bg-[#f3f4f6] opacity-60'
                : travelSummaryInvalid && isSelected
                  ? 'border-[#d70015]'
                  : isSelected
                    ? 'border-[#1F7CFF]'
                    : 'border-[#dbe7f8]'
            }`}
          >
            <button
              type="button"
              onClick={() => openTravelSheet(card.vehicleType)}
              disabled={isUnavailable}
              className="flex h-full w-full items-center gap-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed [@media(min-width:768px)_and_(max-height:850px)]:gap-3"
              aria-label={`Edit passengers and luggage for ${formatVehicleTypeLabel(card.vehicleType)}`}
            >
              <div className="relative h-[4.55rem] w-[6.37rem] shrink-0 overflow-visible md:h-[6.5rem] md:w-[9.1rem] [@media(min-width:768px)_and_(max-height:850px)]:h-[4.4rem] [@media(min-width:768px)_and_(max-height:850px)]:w-[7.2rem]">
                <Image
                  src={card.imageSrc}
                  alt={card.imageAlt}
                  fill
                  className="scale-150 object-contain mix-blend-multiply"
                  sizes="(min-width: 768px) 146px, 102px"
                />
                {isUnavailable ? (
                  <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[0.45rem] bg-white/90 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#6b7280] shadow-[0_4px_10px_rgba(17,17,17,0.08)] md:text-[0.72rem] [@media(min-width:768px)_and_(max-height:850px)]:py-0.5 [@media(min-width:768px)_and_(max-height:850px)]:text-[0.64rem]">
                    Too Small
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[1.1rem] font-semibold leading-tight tracking-[-0.03em] text-[#1F7CFF] [@media(min-width:768px)_and_(max-height:850px)]:text-[1rem]">
                      {formatVehicleTypeLabel(card.vehicleType)}
                    </p>
                    <div className="mt-1 flex min-h-[3rem] flex-col justify-start [@media(min-width:768px)_and_(max-height:850px)]:min-h-[2.35rem]">
                      {isSelected ? (
                        <div className="flex items-center gap-3 text-[0.9rem] font-semibold text-[#1f2937] [@media(min-width:768px)_and_(max-height:850px)]:text-[0.82rem]">
                          <span className="inline-flex items-center gap-1">
                            <Users size={17} className="ui-icon-accent" />
                            {passengerValue}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Briefcase size={17} className="ui-icon-accent" />
                            {suitcaseValue}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-[0.86rem] font-medium leading-snug text-[#5f6975] [@media(min-width:768px)_and_(max-height:850px)]:text-[0.78rem]">
                          Max. {card.maxPassengers} passengers and{' '}
                          <br />
                          {card.maxSuitcases} check-in suitcases
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-right text-[1.35rem] font-semibold leading-none tracking-[-0.05em] text-[#111827] [@media(min-width:768px)_and_(max-height:850px)]:text-[1.12rem]">
                      <AnimatedPrice value={price} />
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );

  const travelSheet =
    isTravelSheetOpen && isMounted
      ? createPortal(
          <div className={`${BOOKING_OVERLAY_BACKDROP_CLASS} z-[9999] flex items-end px-0 md:items-center md:justify-center md:px-4`} role="dialog" aria-modal="true" aria-label="Passengers and luggage">
            <button
              type="button"
              aria-label="Close passengers and luggage"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setIsTravelSheetOpen(false)}
            />
            <div className="relative w-full animate-in slide-in-from-bottom-8 duration-200 rounded-t-[1.5rem] bg-white px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(17,17,17,0.2)] md:max-w-[34rem] md:rounded-[1.5rem] md:px-6 md:py-6 md:shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d9dee7] md:hidden" />
              {renderSheetHeader('Passengers and luggage', 'Adjust each item before continuing.', () => setIsTravelSheetOpen(false))}
              {currentVehicleCard ? (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-[1rem] border border-[#dbe7f8] bg-[#f8fbff] px-4 py-2.5">
                  <div className="relative h-[4.1rem] w-[6rem] shrink-0 overflow-visible md:h-[5rem] md:w-[7.5rem]">
                    <Image
                      src={currentVehicleCard.imageSrc}
                      alt={currentVehicleCard.imageAlt}
                      fill
                      className="scale-125 object-contain mix-blend-multiply"
                      sizes="(min-width: 768px) 120px, 96px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#1F7CFF]">
                      {formatVehicleTypeLabel(currentVehicleCard.vehicleType)}
                    </p>
                    <p className="mt-1 text-[1.25rem] font-semibold leading-none tracking-[-0.05em] text-[#111827]">
                      <AnimatedPrice value={currentVehiclePrice} />
                    </p>
                  </div>
                </div>
              ) : null}
              {shouldShowTravelUpsell && nextVehicleType ? (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-[1rem] border border-[#b8efc9] bg-[#f2fff5] px-4 py-3">
                  <p className="text-[0.95rem] font-semibold leading-tight tracking-[-0.03em] text-[#145b2f]">
                    Need more room?
                    <br />
                    Upgrade to {formatVehicleTypeLabel(nextVehicleType)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTravelUpgrade(nextVehicleType)}
                    className="shrink-0 rounded-[0.75rem] bg-[#119b45] px-4 py-2.5 text-[0.9rem] font-bold text-white transition-colors hover:bg-[#0c873b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7bd895] focus-visible:ring-offset-2"
                  >
                    {upgradePrice > 0 ? `Upgrade +${upgradePrice}€` : 'Upgrade'}
                  </button>
                </div>
              ) : null}
              <div className="space-y-3">
                {renderSheetStepper('passengers', 'Passengers', formData.passengers, 1, currentVehicleCard?.maxPassengers ?? 8, Users)}
                {renderSheetStepper('luggage', 'Suitcases', formData.luggage, 0, currentVehicleCard?.maxSuitcases ?? 8, Briefcase)}
                {renderSheetStepper('handLuggage', 'Hand luggage', formData.handLuggage, 0, currentVehicleCard?.maxSuitcases ?? 8, ShoppingBag)}
              </div>
              {shouldShowTravelUpsell && nextVehicleType ? (
                <div className="hidden">
                  <p className="text-[0.95rem] font-semibold leading-tight tracking-[-0.03em] text-[#145b2f]">
                    Need more room?
                    <br />
                    Upgrade to {formatVehicleTypeLabel(nextVehicleType)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTravelUpgrade(nextVehicleType)}
                    className="shrink-0 rounded-[0.75rem] bg-[#119b45] px-4 py-2.5 text-[0.9rem] font-bold text-white transition-colors hover:bg-[#0c873b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7bd895] focus-visible:ring-offset-2"
                  >
                    {upgradePrice > 0 ? `Upgrade +${upgradePrice}€` : 'Upgrade'}
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={confirmTravelSheet}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-[var(--radius-field)] bg-[#1F7CFF] text-[1rem] font-semibold text-white transition-colors hover:bg-[#176be0]"
              >
                Confirm selection
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  const childSeatSheet =
    isChildSeatSheetOpen && isMounted
      ? createPortal(
          <div className={`${BOOKING_OVERLAY_BACKDROP_CLASS} z-[9999] flex items-end px-0 md:items-center md:justify-center md:px-4`} role="dialog" aria-modal="true" aria-label="Child seats">
            <button
              type="button"
              aria-label="Close child seats"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setIsChildSeatSheetOpen(false)}
            />
            <div className="relative w-full animate-in slide-in-from-bottom-8 duration-200 rounded-t-[1.5rem] bg-white px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(17,17,17,0.2)] md:max-w-[34rem] md:rounded-[1.5rem] md:px-6 md:py-6 md:shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d9dee7] md:hidden" />
              {renderSheetHeader('Child seats', 'Choose the seats you need for the ride.', () => setIsChildSeatSheetOpen(false))}
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
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 [@media(min-width:768px)_and_(max-height:850px)]:space-y-4">
      {renderInlineTravelDetails()}

      <div className="space-y-3">
        <p className="ml-1 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#6d7075]">Optional</p>
        <div className={canUseMeetAndGreet ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
          {canUseMeetAndGreet ? (
            <button
              type="button"
              onClick={() => handleMeetAndGreetChange(!formData.meetAndGreet)}
              className={`flex min-h-[5.5rem] items-center justify-between gap-4 rounded-[1.15rem] border bg-white px-4 py-3 text-left shadow-[0_12px_28px_rgba(15,23,42,0.045)] transition-colors hover:border-[#7fb3ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2 ${
                formData.meetAndGreet ? 'border-[#7fb3ff]' : 'border-[#dbe7f8]'
              }`}
              aria-pressed={Boolean(formData.meetAndGreet)}
            >
              <span className="min-w-0">
                <span className="block text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
                  Meet &amp; Greet <span className="text-[#1F7CFF]">+6€</span>
                </span>
                <span className="mt-1 block text-[0.86rem] leading-snug text-[#5f6975]">
                  Driver waits inside arrivals with a name sign.
                </span>
              </span>
              <span
                className={`relative h-[2rem] w-[3.25rem] shrink-0 rounded-full transition-colors ${
                  formData.meetAndGreet ? 'bg-[#1F7CFF]' : 'bg-[#e9edf3]'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute top-1/2 h-[1.55rem] w-[1.55rem] -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.16)] transition-transform ${
                    formData.meetAndGreet ? 'translate-x-[1.45rem]' : 'translate-x-[0.25rem]'
                  }`}
                />
              </span>
            </button>
          ) : null}

          <div className="flex min-h-[5.5rem] items-center justify-between gap-4 rounded-[1.15rem] border border-[#dbe7f8] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.045)]">
            <div className="min-w-0">
              <p className="text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">Free child seats</p>
              <p className="mt-1 text-[0.86rem] leading-snug text-[#5f6975]">Infant, toddler or booster seats.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsChildSeatSheetOpen(true)}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-field)] bg-[#eef5ff] px-4 text-[0.92rem] font-semibold text-[#1F7CFF] transition-colors hover:bg-[#e1eeff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2"
              aria-haspopup="dialog"
              aria-expanded={isChildSeatSheetOpen}
            >
              + {childSeatTotal > 0 ? 'Edit' : 'Add'}
            </button>
            {childSeatTotal > 0 ? (
              <p className="sr-only">
                {[
                  formData.babySeats > 0 ? `${formData.babySeats} baby` : null,
                  formData.childSeats > 0 ? `${formData.childSeats} child` : null,
                  formData.boosterSeats > 0 ? `${formData.boosterSeats} booster` : null,
                ].filter(Boolean).join(', ')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {childSeatSheet}

      {error ? (
        <div className="mt-4 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8]">
          <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
          {error}
        </div>
      ) : null}

      <div className={actionRowClass}>
        <div className={actionButtonGroupClass}>
          <button type="button" onClick={prevStep} className={secondaryBackButtonClass}>
            <ChevronLeft size={24} />
          </button>
          <button type="button" onClick={nextStep} className={primaryActionButtonClass}>
            Next
          </button>
        </div>
        {actionTrustLine}
      </div>
    </div>
  );
}
