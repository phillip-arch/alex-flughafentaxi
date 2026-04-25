'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Armchair, Baby, Briefcase, ChevronLeft, Minus, NotebookPen, Plus, ShieldCheck, Users, X } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { formatVehicleTypeLabel, type VehicleType } from '@/lib/pricing';
import { BOOKING_FIELD_LABEL_CLASS } from '@/lib/ui/bookingFormStyles';
import AnimatedPrice from './AnimatedPrice';
import { BOOKING_OVERLAY_BACKDROP_CLASS } from './bookingOverlayStyles';

type VehiclePriceOption = {
  vehicleType: VehicleType;
  totalPrice: number;
};

// Keep the upgrade card styling in place for a later upsell return.
const ENABLE_TRAVEL_UPSELL = false;
const ROLLING_DIGITS = Array.from({ length: 10 }, (_, index) => index);

function RollingCounter({
  value,
  className,
  prefersReducedMotion,
}: {
  value: number | '';
  className: string;
  prefersReducedMotion: boolean;
}) {
  if (value === '' || prefersReducedMotion) {
    return <span className={className}>{value === '' ? '--' : value}</span>;
  }

  return (
    <span className={`ui-odometer-window ${className}`} aria-live="polite" aria-atomic="true">
      <span className="ui-odometer-strip" style={{ transform: `translateY(-${value * 10}%)` }}>
        {ROLLING_DIGITS.map((digit) => (
          <span key={digit} className="ui-odometer-digit">
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

type BookingStepTwoProps = {
  formData: any;
  vehicleType: VehicleType;
  vehiclePriceOptions: VehiclePriceOption[];
  onVehicleUpgrade: (nextVehicleType: VehicleType) => void;
  onTravelDetailsConfirm: (selectedVehicleType: VehicleType) => void;
  handleMeetAndGreetChange: (checked: boolean) => void;
  handleNotesChange: (notes: string) => void;
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
  handleNotesChange,
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
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [activeTravelVehicleType, setActiveTravelVehicleType] = useState<VehicleType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [draftNotes, setDraftNotes] = useState(formData.notes || '');
  const [pressedButtonKey, setPressedButtonKey] = useState<string | null>(null);
  const pulseResetTimeoutRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const childSeatTotal = formData.babySeats + formData.childSeats + formData.boosterSeats;
  const hasDriverNote = Boolean(formData.notes?.trim());
  const hasSelectedTravelDetails = Boolean(formData.travelDetailsSelected);
  const travelSummaryInvalid = isFieldInvalid('passengers') || isFieldInvalid('luggage');
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
    return () => {
      if (pulseResetTimeoutRef.current !== null) {
        window.clearTimeout(pulseResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isNoteSheetOpen) {
      setDraftNotes(formData.notes || '');
    }
  }, [isNoteSheetOpen, formData.notes]);

  useEffect(() => {
    if (!isTravelSheetOpen && !isChildSeatSheetOpen && !isNoteSheetOpen) return;

    const scrollY = window.scrollY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTravelSheetOpen(false);
        setIsChildSeatSheetOpen(false);
        setIsNoteSheetOpen(false);
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
  }, [isTravelSheetOpen, isChildSeatSheetOpen, isNoteSheetOpen]);

  const saveDriverNote = () => {
    handleNotesChange(draftNotes);
    setIsNoteSheetOpen(false);
  };

  const handleStepperAdjust = (
    name: 'passengers' | 'luggage' | 'handLuggage' | 'babySeats' | 'childSeats' | 'boosterSeats',
    delta: -1 | 1,
    min: number,
    max: number,
  ) => {
    const pulseKey = `${name}:${delta}`;

    setPressedButtonKey(null);
    if (typeof window !== 'undefined' && !prefersReducedMotion) {
      window.requestAnimationFrame(() => setPressedButtonKey(pulseKey));
      if (pulseResetTimeoutRef.current !== null) {
        window.clearTimeout(pulseResetTimeoutRef.current);
      }
      pulseResetTimeoutRef.current = window.setTimeout(() => {
        setPressedButtonKey(null);
      }, 220);
    }

    updateStepperValue(name, delta, min, max);
  };

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
            onClick={() => handleStepperAdjust(name, -1, min, max)}
            disabled={isAtMin}
            className={`flex h-12 w-12 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#111827] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-[#f3f4f6] disabled:text-[#b6bcc6] disabled:hover:bg-[#f3f4f6] ${pressedButtonKey === `${name}:-1` ? 'ui-counter-button-pulse' : ''}`}
            aria-label={`Decrease ${label}`}
          >
            <Minus size={20} />
          </button>
          <RollingCounter
            value={value}
            prefersReducedMotion={prefersReducedMotion}
            className="min-w-[2.4rem] text-center text-[1.45rem] font-semibold tracking-[-0.04em] text-[#111827]"
          />
          <button
            type="button"
            onClick={() => handleStepperAdjust(name, 1, min, max)}
            disabled={isAtMax}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#1F7CFF] text-white transition-colors hover:bg-[#176be0] disabled:cursor-not-allowed disabled:bg-[#d1d5db] disabled:hover:bg-[#d1d5db] ${pressedButtonKey === `${name}:1` ? 'ui-counter-button-pulse' : ''}`}
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
      <div className="flex min-h-[4.9rem] items-center justify-between gap-4 px-4 py-3 md:min-h-[4.75rem] md:px-4 md:py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#eef5ff] text-[#1F7CFF]">
            <Icon size={18} />
          </span>
          <p className="truncate text-[1.02rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
            {label}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => handleStepperAdjust(name, -1, min, max)}
            disabled={isAtMin}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#111827] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-white disabled:text-[#c3cad5] disabled:hover:bg-white ${pressedButtonKey === `${name}:-1` ? 'ui-counter-button-pulse' : ''}`}
            aria-label={`Decrease ${label}`}
          >
            <Minus size={18} />
          </button>
          <RollingCounter
            value={value}
            prefersReducedMotion={prefersReducedMotion}
            className="min-w-[1.7rem] text-center text-[1.15rem] font-semibold leading-none tracking-[-0.04em] text-[#111827]"
          />
          <button
            type="button"
            onClick={() => handleStepperAdjust(name, 1, min, max)}
            disabled={isAtMax}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F7CFF] text-white transition-colors hover:bg-[#176be0] disabled:cursor-not-allowed disabled:bg-[#d1d5db] disabled:hover:bg-[#d1d5db] ${pressedButtonKey === `${name}:1` ? 'ui-counter-button-pulse' : ''}`}
            aria-label={`Increase ${label}`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderScratchTravelStepper = (
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
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#eef5ff] text-[#1F7CFF]">
            <Icon size={18} />
          </span>
          <span className="truncate text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">{label}</span>
        </div>
        <div className="grid shrink-0 grid-cols-[2.25rem_2rem_2.25rem] items-center gap-2">
          <button
            type="button"
            onClick={() => handleStepperAdjust(name, -1, min, max)}
            disabled={isAtMin}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#111827] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:text-[#c3cad5] ${pressedButtonKey === `${name}:-1` ? 'ui-counter-button-pulse' : ''}`}
            aria-label={`Decrease ${label}`}
          >
            <Minus size={17} />
          </button>
          <RollingCounter
            value={value}
            prefersReducedMotion={prefersReducedMotion}
            className="text-center text-[1.1rem] font-semibold leading-none tracking-[-0.04em] text-[#111827]"
          />
          <button
            type="button"
            onClick={() => handleStepperAdjust(name, 1, min, max)}
            disabled={isAtMax}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-[#1F7CFF] text-white transition-colors hover:bg-[#176be0] disabled:cursor-not-allowed disabled:bg-[#d1d5db] ${pressedButtonKey === `${name}:1` ? 'ui-counter-button-pulse' : ''}`}
            aria-label={`Increase ${label}`}
          >
            <Plus size={17} />
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
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-5">
      {inlineVehicleCard ? (
        <div
          className={`relative grid min-h-[6.55rem] min-w-0 w-full max-w-full grid-cols-[9.8rem_auto] grid-rows-[auto_auto] items-start justify-between gap-x-3 gap-y-1.5 overflow-hidden rounded-[1.15rem] border bg-white px-4 py-1.5 md:min-h-[6.1rem] md:grid-cols-[11.5rem_minmax(0,1fr)_6.5rem] md:grid-rows-none md:items-center md:justify-normal md:gap-3 md:px-4 md:py-1 ${
            travelSummaryInvalid ? 'border-[#d70015]' : 'border-[#dbe7f8]'
          }`}
        >
          <div className="relative row-span-2 h-[5.9rem] w-[9.8rem] shrink-0 self-center overflow-hidden md:row-span-1 md:h-[7.1rem] md:w-full md:max-w-[11.5rem]">
            <Image
              src={inlineVehicleCard.imageSrc}
              alt={inlineVehicleCard.imageAlt}
              fill
              className="scale-[1.57] object-contain object-center mix-blend-multiply p-0 md:p-[2px]"
              sizes="(min-width: 768px) 208px, 196px"
            />
          </div>
          <div className="col-start-2 row-start-2 hidden min-w-0 px-0 text-right md:col-start-auto md:row-start-auto md:block md:px-2 md:text-center">
            <p className="overflow-hidden text-[14px] font-medium leading-snug tracking-[-0.02em] text-[#5f6975] md:overflow-visible md:text-[0.88rem] md:tracking-normal">
              <span className="flex items-center justify-end gap-2 whitespace-nowrap md:justify-center">
                <span className="shrink-0 text-[0.9em] font-semibold uppercase tracking-[0.04em] text-[#5f6975]">Max.</span>
                <span className="whitespace-nowrap">{inlineVehicleCard.maxPassengers}</span>
                <Users size={15} className="shrink-0 text-[#1F7CFF]" />
                <span className="whitespace-nowrap">{inlineVehicleCard.maxSuitcases}</span>
                <Briefcase size={15} className="shrink-0 text-[#1F7CFF]" />
              </span>
            </p>
          </div>
          <div className="absolute right-4 top-4 flex w-[8.4rem] flex-col items-end text-right md:static md:col-start-auto md:row-span-1 md:row-start-auto md:block md:w-full md:max-w-[6.5rem] md:justify-self-end">
            <p className="truncate whitespace-nowrap text-[1.02rem] font-medium leading-tight tracking-[-0.02em] text-[#1F7CFF] md:text-[0.98rem]">
              {formatVehicleTypeLabel(inlineVehicleCard.vehicleType)}
            </p>
            <p className="mt-1.5 whitespace-nowrap text-right text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#111827] md:text-[2rem]">
              <AnimatedPrice value={inlineVehiclePrice} currencyDisplay="symbol" />
            </p>
          </div>
          <div className="absolute bottom-3 right-4 md:hidden">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[14px] font-medium leading-snug tracking-[-0.02em] text-[#5f6975]">
              <span className="shrink-0 text-[0.9em] font-semibold uppercase tracking-[0.04em] text-[#5f6975]">Max.</span>
              <span className="whitespace-nowrap">{inlineVehicleCard.maxPassengers}</span>
              <Users size={15} className="shrink-0 text-[#1F7CFF]" />
              <span className="whitespace-nowrap">{inlineVehicleCard.maxSuitcases}</span>
              <Briefcase size={15} className="shrink-0 text-[#1F7CFF]" />
            </span>
          </div>
        </div>
      ) : null}
      <div className="overflow-hidden rounded-[1.15rem] border border-[#dbe7f8] bg-white">
        {renderInlineTravelStepper('passengers', 'Passengers', formData.passengers, 1, 8, Users)}
        <div className="border-t border-[#e8eef7]" />
        {renderInlineTravelStepper('luggage', 'Check-in luggage', formData.luggage, 0, 8, Briefcase)}
        <div className="border-t border-[#e8eef7]" />
      </div>
    </div>
  );

  const renderErrorNotice = () =>
    error ? (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#ffd4d8] bg-[#fff2f4] p-3 text-[14px] font-medium text-[#d70015]">
        <span className="block h-1.5 w-1.5 rounded-full bg-[#d70015]" />
        {error}
      </div>
    ) : null;

  const renderScratchStepTwo = () => (
    <div className="w-full min-w-0 max-w-full overflow-hidden space-y-4 md:hidden">
        {inlineVehicleCard ? (
          <div
            className={`grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3 rounded-[1.15rem] border bg-white px-3 py-1.5 ${
              travelSummaryInvalid ? 'border-[#d70015]' : 'border-[#dbe7f8]'
            }`}
          >
            <div className="relative h-[5.3rem] min-w-0 overflow-hidden rounded-[0.85rem] bg-white">
              <Image
                src={inlineVehicleCard.imageSrc}
                alt={inlineVehicleCard.imageAlt}
                fill
                className="scale-[1.57] object-contain object-center mix-blend-multiply p-0"
                sizes="112px"
              />
            </div>
            <div className="flex min-w-0 flex-col items-end justify-center gap-1.5 text-right">
              <p className="max-w-full truncate text-[0.98rem] font-medium leading-tight tracking-[-0.02em] text-[#1F7CFF]">
                {formatVehicleTypeLabel(inlineVehicleCard.vehicleType)}
              </p>
              <p className="text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#111827]">
                <AnimatedPrice value={inlineVehiclePrice} currencyDisplay="symbol" />
              </p>
              <span className="inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium leading-snug tracking-[-0.02em] text-[#5f6975]">
                <span className="shrink-0 text-[0.9em] font-semibold uppercase tracking-[0.04em] text-[#5f6975]">Max.</span>
                <span className="whitespace-nowrap">{inlineVehicleCard.maxPassengers}</span>
                <Users size={14} className="shrink-0 text-[#1F7CFF]" />
                <span className="whitespace-nowrap">{inlineVehicleCard.maxSuitcases}</span>
                <Briefcase size={14} className="shrink-0 text-[#1F7CFF]" />
              </span>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[1.15rem] border border-[#dbe7f8] bg-white">
          {renderScratchTravelStepper('passengers', 'Passengers', formData.passengers, 1, 8, Users)}
          <div className="border-t border-[#e8eef7]" />
          {renderScratchTravelStepper('luggage', 'Check-in luggage', formData.luggage, 0, 8, Briefcase)}
          <div className="border-t border-[#e8eef7]" />
        </div>

        <div className="space-y-3">
          <p className={BOOKING_FIELD_LABEL_CLASS}>Optional</p>
          {canUseMeetAndGreet ? (
            <button
              type="button"
              onClick={() => handleMeetAndGreetChange(!formData.meetAndGreet)}
              className={`grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[1.15rem] border bg-white px-4 py-4 text-left ${
                formData.meetAndGreet ? 'border-[#7fb3ff]' : 'border-[#dbe7f8]'
              }`}
              aria-pressed={Boolean(formData.meetAndGreet)}
            >
              <span className="min-w-0">
                <span className="block text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
                  Meet &amp; Greet <span className="text-[#1F7CFF]">+6€</span>
                </span>
                <span className="mt-1 block text-[13px] font-medium leading-snug tracking-[-0.02em] text-[#5f6975]">
                  Driver will wait in arrivals with a name sign
                </span>
              </span>
              <span
                className={`relative h-[2rem] w-[3.25rem] shrink-0 rounded-full transition-colors ${
                  formData.meetAndGreet ? 'bg-[#1F7CFF]' : 'bg-[#e9edf3]'
                }`}
              >
                <span
                  className={`absolute left-1 top-1/2 h-[1.55rem] w-[1.55rem] -translate-y-1/2 rounded-full bg-white transition-transform ${
                    formData.meetAndGreet ? 'translate-x-[1.2rem]' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsChildSeatSheetOpen(true)}
            className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[1.15rem] border border-[#dbe7f8] bg-white px-4 py-4 text-left"
            aria-haspopup="dialog"
            aria-expanded={isChildSeatSheetOpen}
          >
            <span className="min-w-0">
              <span className="block text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
                Free child seats
              </span>
            </span>
            <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-field)] bg-[#eef5ff] px-4 text-[0.92rem] font-semibold text-[#1F7CFF]">
              + {childSeatTotal > 0 ? 'Edit' : 'Add'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsNoteSheetOpen(true)}
            className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[1.15rem] border border-[#dbe7f8] bg-white px-4 py-4 text-left"
            aria-haspopup="dialog"
            aria-expanded={isNoteSheetOpen}
          >
            <span className="min-w-0">
              <span className="block text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
                Note for driver
              </span>
            </span>
            <span className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-[var(--radius-field)] bg-[#eef5ff] px-4 text-[0.92rem] font-semibold text-[#1F7CFF]">
              <NotebookPen size={15} strokeWidth={2.2} />
              {hasDriverNote ? 'Edit' : 'Add'}
            </span>
          </button>

        </div>

        {renderErrorNotice()}

        <div className="grid w-full min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-3 pt-1">
          <button type="button" onClick={prevStep} className={secondaryBackButtonClass}>
            <ChevronLeft size={24} />
          </button>
          <button type="button" onClick={nextStep} className={primaryActionButtonClass}>
            Next
          </button>
        </div>
        {actionTrustLine}
    </div>
  );

  const renderVehiclePriceCards = () => (
    <div className="space-y-3">
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
            className={`relative h-[6.55rem] rounded-[0.95rem] border bg-[#f8fbff] px-4 py-4 shadow-[0_8px_18px_rgba(17,17,17,0.04)] transition-colors md:h-[8.5rem] ${
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
              className="flex h-full w-full items-center gap-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              aria-label={`Edit passengers and luggage for ${formatVehicleTypeLabel(card.vehicleType)}`}
            >
              <div className="relative h-[4.55rem] w-[6.37rem] shrink-0 overflow-hidden md:h-[6.5rem] md:w-[9.1rem]">
                <Image
                  src={card.imageSrc}
                  alt={card.imageAlt}
                  fill
                  className="object-contain object-center mix-blend-multiply p-[3px] md:p-[5px]"
                  sizes="(min-width: 768px) 146px, 102px"
                />
                {isUnavailable ? (
                  <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[0.45rem] bg-white/90 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#6b7280] shadow-[0_4px_10px_rgba(17,17,17,0.08)] md:text-[0.72rem]">
                    Too Small
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[1.1rem] font-semibold leading-tight tracking-[-0.03em] text-[#1F7CFF]">
                      {formatVehicleTypeLabel(card.vehicleType)}
                    </p>
                    <div className="mt-1 flex min-h-[3rem] flex-col justify-start">
                      {isSelected ? (
                        <div className="flex items-center gap-3 text-[0.9rem] font-semibold text-[#1f2937]">
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
                        <p className="mt-1 text-[0.86rem] font-medium leading-snug text-[#5f6975]">
                          <span className="block whitespace-nowrap">Max. {card.maxPassengers} passengers</span>
                          <span className="block whitespace-nowrap">{card.maxSuitcases} check-in luggage</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-right text-[1.35rem] font-semibold leading-none tracking-[-0.05em] text-[#111827]">
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
                {renderSheetStepper('luggage', 'Check-in luggage', formData.luggage, 0, currentVehicleCard?.maxSuitcases ?? 8, Briefcase)}
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

  const noteSheet =
    isNoteSheetOpen && isMounted
      ? createPortal(
          <div
            className={`${BOOKING_OVERLAY_BACKDROP_CLASS} z-[10000] flex items-end px-0 md:items-center md:justify-center md:px-4`}
            role="dialog"
            aria-modal="true"
            aria-label="Driver note"
          >
            <button
              type="button"
              aria-label="Close driver note"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setIsNoteSheetOpen(false)}
            />
            <div className="relative w-full animate-in slide-in-from-bottom-8 duration-200 rounded-t-[1.5rem] bg-white px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(17,17,17,0.2)] md:max-w-[32rem] md:rounded-[1.5rem] md:px-6 md:py-6 md:shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d9dee7] md:hidden" />
              {renderSheetHeader(
                'Note for the driver',
                'Add pickup details, luggage notes, or anything the driver should know.',
                () => setIsNoteSheetOpen(false),
              )}
              <textarea
                value={draftNotes}
                onChange={(event) => setDraftNotes(event.target.value)}
                rows={5}
                placeholder="Add your note here"
                className="ui-field-surface w-full resize-none rounded-[var(--radius-field)] border border-[#d2d2d7] p-3 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#7fb3ff] focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)]"
              />
              <button
                type="button"
                onClick={saveDriverNote}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-[var(--radius-field)] bg-[#1F7CFF] text-[1rem] font-semibold text-white transition-colors hover:bg-[#176be0]"
              >
                Save
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip md:flex md:h-full md:flex-col">
      <div className="hidden space-y-7 md:flex md:h-full md:flex-col">
      {renderInlineTravelDetails()}

      <div className="space-y-2.5">
        <p className={BOOKING_FIELD_LABEL_CLASS}>Optional</p>
        <div className="space-y-3 overflow-x-clip">
          {canUseMeetAndGreet ? (
            <div
              className={`flex min-h-[5.1rem] items-center justify-between gap-4 rounded-[1.15rem] border bg-white px-4 py-2.5 text-left ${
                formData.meetAndGreet ? 'border-[#7fb3ff]' : 'border-[#dbe7f8]'
              }`}
            >
              <div className="min-w-0">
                <p className="text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
                  Meet &amp; Greet <span className="text-[#1F7CFF]">+6€</span>
                </p>
                <p className="mt-1 text-[0.86rem] leading-snug text-[#5f6975]">
                  Driver will wait in arrivals with a name sign
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleMeetAndGreetChange(!formData.meetAndGreet)}
                className={`relative h-[2rem] w-[3.25rem] shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2 ${
                  formData.meetAndGreet ? 'bg-[#1F7CFF]' : 'bg-[#e9edf3]'
                }`}
                aria-pressed={Boolean(formData.meetAndGreet)}
                aria-label="Toggle Meet and Greet"
              >
                <span
                  className={`absolute left-1 top-1/2 h-[1.55rem] w-[1.55rem] -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.16)] transition-transform ${
                    formData.meetAndGreet ? 'translate-x-[1.2rem]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex min-h-[5.1rem] items-center justify-between gap-4 rounded-[1.15rem] border border-[#dbe7f8] bg-white px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">Free child seats</p>
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

            <div className="flex min-h-[5.1rem] items-center justify-between gap-4 rounded-[1.15rem] border border-[#dbe7f8] bg-white px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-[1rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
                  Note for driver
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteSheetOpen(true)}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-[var(--radius-field)] bg-[#eef5ff] px-4 text-[0.92rem] font-semibold text-[#1F7CFF] transition-colors hover:bg-[#e1eeff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2"
                aria-haspopup="dialog"
                aria-expanded={isNoteSheetOpen}
              >
                <NotebookPen size={15} strokeWidth={2.2} />
                {hasDriverNote ? 'Edit' : 'Add'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {childSeatSheet}
      {noteSheet}

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

      {renderScratchStepTwo()}
    </div>
  );
}
