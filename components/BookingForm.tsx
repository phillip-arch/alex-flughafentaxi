'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import StreetAutocomplete from '@/components/address/StreetAutocomplete';
import { getAppSurface } from '@/lib/routing/surfaces';
import {
  buildStreetOptionValue,
  formatAddressLine,
  sortFavoriteAddresses,
  type StreetOption,
} from '@/lib/addresses';
import {
  Plane, 
  PlaneLanding, 
  PlaneTakeoff, 
  MapPin, 
  House,
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Calendar,
  Clock,
  Car,
  CreditCard,
  Building2,
  Users,
  Briefcase,
  ShoppingBag,
  ArrowUpDown,
  Info,
  Plus,
  Minus,
  X,
  LucideIcon,
} from 'lucide-react';
import { determineVehicle, calculateVehiclePrice } from '@/lib/pricing';
import { BOOKING_FORM_CARD_CLASS, BOOKING_FORM_INPUT_CLASS, BOOKING_FORM_INPUT_INVALID_CLASS } from '@/lib/ui/bookingFormStyles';

import { createBooking } from '@/app/(booking)/actions';

const DatePicker = dynamic(() => import('./DatePicker'));
const TimePicker = dynamic(() => import('./TimePicker'));
const BookingStepTwo = dynamic(() => import('./BookingStepTwo'));
const BookingStepThree = dynamic(() => import('./BookingStepThree'));

// Types
type Direction = 'to_airport' | 'from_airport' | null;
type PaymentMethod = 'cash' | 'card' | null;

const PENDING_BOOKING_STORAGE_KEY = 'pending-booking-form';

interface FavoriteAddress {
  id: string;
  city: string;
  zip: string;
  street: string;
  label: 'home' | 'office' | 'extra' | null;
}

interface ExtendedBookingInput {
  direction: Direction;
  city: string;
  zip: string;
  street: string;
  extraStop: boolean;
  extraStopCity: string;
  extraStopZip: string;
  extraStopStreet: string;
  flightNumber: string;
  pickupAt: string; // ISO date string
  date: string;
  time: string;
  passengers: number | '';
  luggage: number | '';
  handLuggage: number | '';
  childSeat: boolean;
  babySeats: number;
  childSeats: number;
  boosterSeats: number;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  paymentMethod: PaymentMethod;
  bookingForMyself: boolean;
  saveProfile: boolean;
}

type BookingFormProps = {
  onDirectionChange?: (direction: Direction) => void;
  showStepIndicator?: boolean;
  showInfoTrigger?: boolean;
  isAppSurface?: boolean;
  initialFavorites?: FavoriteAddress[];
  initialIsLoggedIn?: boolean;
  initialAccountDefaults?: {
    fullName: string;
    phone: string;
    email: string;
  };
};

type StepperFieldName =
  | 'passengers'
  | 'luggage'
  | 'handLuggage'
  | 'babySeats'
  | 'childSeats'
  | 'boosterSeats';

type InlineSelectFieldName = StepperFieldName;

const EMPTY_FAVORITES: FavoriteAddress[] = [];
const EMPTY_ACCOUNT_DEFAULTS = {
  fullName: '',
  phone: '',
  email: '',
};
const FAVORITE_ADDRESS_ICONS = [House, Building2, MapPin] as const;
const DEFAULT_BASE_PRICE = 38;

const BookingForm = ({
  onDirectionChange,
  showStepIndicator = true,
  showInfoTrigger = false,
  isAppSurface: isAppSurfaceProp,
  initialFavorites = EMPTY_FAVORITES,
  initialIsLoggedIn = false,
  initialAccountDefaults = EMPTY_ACCOUNT_DEFAULTS,
}: BookingFormProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHomepageForm = pathname === '/';
  const isAppSurface = isAppSurfaceProp ?? getAppSurface() === 'app';
  const allowExtendedDropdownSpace = !isHomepageForm;
  const supabase = supabaseBrowser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Picker States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [favoriteAddresses, setFavoriteAddresses] = useState<FavoriteAddress[]>(
    sortFavoriteAddresses(initialFavorites),
  );
  const [streetInputValue, setStreetInputValue] = useState('');
  const [extraStopStreetInputValue, setExtraStopStreetInputValue] = useState('');
  const [resolvedStreetOption, setResolvedStreetOption] = useState<StreetOption | null>(null);
  const [resolvedExtraStopStreetOption, setResolvedExtraStopStreetOption] = useState<StreetOption | null>(null);
  const [streetNumberWarning, setStreetNumberWarning] = useState<'street' | 'extraStopStreet' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [accountDefaults, setAccountDefaults] = useState(initialAccountDefaults);
  const [openInlineSelect, setOpenInlineSelect] = useState<InlineSelectFieldName | null>(null);
  const [zipPricing, setZipPricing] = useState<{
    city: string;
    basePrice: number;
    limo: number;
    kombi: number;
    bus: number;
  } | null>(null);

  const [formData, setFormData] = useState<ExtendedBookingInput>({
    direction: 'to_airport',
    city: 'Wien',
    zip: '',
    street: '',
    extraStop: false,
    extraStopCity: 'Wien',
    extraStopZip: '',
    extraStopStreet: '',
    flightNumber: '',
    pickupAt: '',
    date: '',
    time: '',
    passengers: '',
    luggage: '',
    handLuggage: '',
    childSeat: false,
    babySeats: 0,
    childSeats: 0,
    boosterSeats: 0,
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    paymentMethod: null,
    bookingForMyself: true,
    saveProfile: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const REQUIRED_FIELDS_ERROR = 'Bitte fuellen Sie alle erforderlichen Felder aus.';

  useEffect(() => {
    onDirectionChange?.(formData.direction);
  }, [formData.direction, onDirectionChange]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!openInlineSelect) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-inline-select-root="true"]')) {
        setOpenInlineSelect(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenInlineSelect(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openInlineSelect]);

  useEffect(() => {
    if (!isInfoPanelOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInfoPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isInfoPanelOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname !== '/book' && pathname !== '/account') return;

    const raw = window.sessionStorage.getItem(PENDING_BOOKING_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        formData?: Partial<ExtendedBookingInput>;
        currentStep?: number;
      };

      if (parsed.formData) {
        setFormData((prev) => ({
          ...prev,
          ...parsed.formData,
        }));
      }

      if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 3) {
        setCurrentStep(parsed.currentStep);
      }
    } catch {
      // Ignore malformed persisted state.
    } finally {
      window.sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
    }
  }, [pathname]);

  const applyFavoriteAddress = (favorite: FavoriteAddress) => {
    const city = favorite.city.toLowerCase().includes('schwechat') ? 'Schwechat' : 'Wien';
    setStreetInputValue(`${favorite.street} `);
    setResolvedStreetOption({
      street: favorite.street,
      zip: favorite.zip,
      city: favorite.city,
    });
    setStreetNumberWarning('street');
    setFormData((prev) => ({
      ...prev,
      city,
      zip: favorite.zip,
      street: favorite.street,
    }));
    setTouched((prev) => ({
      ...prev,
      street: false,
    }));
  };

  useEffect(() => {
    setFavoriteAddresses(sortFavoriteAddresses(initialFavorites));
  }, [initialFavorites]);

  useEffect(() => {
    setIsLoggedIn(initialIsLoggedIn);
  }, [initialIsLoggedIn]);

  useEffect(() => {
    setAccountDefaults(initialAccountDefaults);
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || initialAccountDefaults.fullName,
      phone: prev.phone || initialAccountDefaults.phone,
      email: prev.email || initialAccountDefaults.email,
    }));
  }, [initialAccountDefaults]);

  useEffect(() => {
    let isMounted = true;
    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const loadAccountData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted || !user) return;

      setIsLoggedIn(true);

      const [profileResult, favoritesResult] = await Promise.all([
        supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle(),
        supabase
          .from('saved_addresses')
          .select('id, city, zip, street, label')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
      ]);

      if (!isMounted) return;

      if (Array.isArray(favoritesResult.data)) {
        setFavoriteAddresses(sortFavoriteAddresses(favoritesResult.data as FavoriteAddress[]));
      }

      const defaultFullName = profileResult.data?.full_name || '';
      const defaultPhone = profileResult.data?.phone || '';
      const defaultEmail = user.email || '';
      setAccountDefaults({
        fullName: defaultFullName,
        phone: defaultPhone,
        email: defaultEmail,
      });

      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || defaultFullName,
        phone: prev.phone || defaultPhone,
        email: prev.email || defaultEmail,
      }));
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleHandle = (window as any).requestIdleCallback(() => {
        void loadAccountData();
      });
    } else {
      timeoutHandle = globalThis.setTimeout(() => {
        void loadAccountData();
      }, 0);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined' && idleHandle !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [supabase]);

  useEffect(() => {
    if (formData.street && formData.zip && !streetInputValue) {
      setStreetInputValue(formData.street);
    }
    if (formData.extraStopStreet && formData.extraStopZip && !extraStopStreetInputValue) {
      setExtraStopStreetInputValue(formData.extraStopStreet);
    }
  }, [
    extraStopStreetInputValue,
    formData.city,
    formData.extraStopCity,
    formData.extraStopStreet,
    formData.extraStopZip,
    formData.street,
    formData.zip,
    streetInputValue,
  ]);

  useEffect(() => {
    const normalizedZip = String(formData.zip || '').trim();

    if (!/^\d{4}$/.test(normalizedZip)) {
      setZipPricing(null);
      return;
    }

    let isActive = true;

    const loadZipPricing = async () => {
      const { data, error } = await supabase
        .from('zip_prices')
        .select('city, base_price, limo_price, kombi_price, bus_price')
        .eq('zip', normalizedZip)
        .maybeSingle();

      if (!isActive) return;

      if (error || !data) {
        setZipPricing(null);
        return;
      }

      setZipPricing({
        city: String(data.city || '').trim() || 'Wien',
        basePrice: Number(data.base_price ?? DEFAULT_BASE_PRICE),
        limo: Number(data.limo_price ?? data.base_price ?? DEFAULT_BASE_PRICE),
        kombi: Number(data.kombi_price ?? 0),
        bus: Number(data.bus_price ?? 0),
      });
    };

    void loadZipPricing();

    return () => {
      isActive = false;
    };
  }, [formData.zip, supabase]);

  const dbPrices = zipPricing
    ? {
        limo: zipPricing.limo,
        kombi: zipPricing.kombi,
        bus: zipPricing.bus,
      }
    : undefined;
  const basePrice = zipPricing?.basePrice ?? DEFAULT_BASE_PRICE;
  const extraStopPrice = formData.extraStop ? 10 : 0;
  
  // Determine vehicle type
  const passengers = typeof formData.passengers === 'number' ? formData.passengers : 0;
  const suitcases = typeof formData.luggage === 'number' ? formData.luggage : 0;
  const handLuggage = typeof formData.handLuggage === 'number' ? formData.handLuggage : 0;
  
  const vehicleType = determineVehicle(passengers, suitcases, handLuggage);
  
  // Calculate price with ZIP-based surcharge when available
  const vehiclePrice = calculateVehiclePrice(basePrice, vehicleType, dbPrices);
  const totalPrice = vehiclePrice + extraStopPrice;
  const selectedStreetOption = resolvedStreetOption;
  const selectedExtraStopStreetOption = resolvedExtraStopStreetOption;
  const favoriteMenuItems =
    isAppSurface && isLoggedIn && favoriteAddresses.length > 0
      ? favoriteAddresses.map((favorite, index) => {
          const Icon = FAVORITE_ADDRESS_ICONS[index] || MapPin;
          return {
            id: favorite.id,
            label: formatAddressLine(favorite.street, favorite.zip, favorite.city),
            icon: <Icon size={16} strokeWidth={2.1} />,
            onSelect: () => applyFavoriteAddress(favorite),
          };
        })
      : [];
  const routeSummary =
    formData.direction === 'to_airport'
      ? `${formData.zip} ${formData.city} -> Flughafen VIE`
      : `Flughafen VIE -> ${formData.zip} ${formData.city}`;
  const streetSummary = formData.street || 'Noch nicht gewaehlt';
  const dateSummary = [formData.date, formData.time].filter(Boolean).join(' | ') || 'Noch nicht gewaehlt';

  const hasTypedStreetNumber = (rawValue: string, baseStreet: string) => {
    const normalizedRaw = rawValue.trim().replace(/\s+/g, ' ');
    const normalizedBase = baseStreet.trim().replace(/\s+/g, ' ');
    if (!normalizedRaw || !normalizedBase) return false;
    if (normalizedRaw.length <= normalizedBase.length) return false;
    if (!normalizedRaw.toLowerCase().startsWith(normalizedBase.toLowerCase())) return false;

    const suffix = normalizedRaw.slice(normalizedBase.length).trim();
    return /^\d[\dA-Za-z/-]*$/u.test(suffix);
  };

  const validateStreetNumber = (target: 'street' | 'extraStopStreet') => {
    const selectedOption = target === 'street' ? resolvedStreetOption : resolvedExtraStopStreetOption;
    const rawValue = target === 'street' ? formData.street : formData.extraStopStreet;

    if (!selectedOption) {
      setStreetNumberWarning((prev) => (prev === target ? null : prev));
      return;
    }

    if (hasTypedStreetNumber(rawValue, selectedOption.street)) {
      setStreetNumberWarning((prev) => (prev === target ? null : prev));
      return;
    }

    setStreetNumberWarning(target);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const normalizedValue =
      name === 'zip' || name === 'extraStopZip'
        ? value.replace(/\D/g, '').slice(0, 4)
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'passengers' || name === 'luggage' || name === 'handLuggage' || name === 'babySeats' || name === 'childSeats' || name === 'boosterSeats' ? (normalizedValue === '' ? '' : parseInt(normalizedValue)) : normalizedValue,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    // No-op: Do not mark as touched on blur
  };

  const clearStreetSelection = (target: 'street' | 'extraStopStreet', rawValue: string) => {
    const selectedOption = target === 'street' ? resolvedStreetOption : resolvedExtraStopStreetOption;
    const normalizedValue = rawValue.replace(/\s+/g, ' ').trimStart();

    if (target === 'street') {
      setStreetInputValue(rawValue);
    } else {
      setExtraStopStreetInputValue(rawValue);
    }

    setStreetNumberWarning((prev) => (prev === target ? null : prev));

    if (selectedOption && normalizedValue.toLowerCase().startsWith(selectedOption.street.toLowerCase())) {
      setFormData((prev) =>
        target === 'street'
          ? {
              ...prev,
              street: rawValue,
              zip: selectedOption.zip,
              city: selectedOption.city,
            }
          : {
              ...prev,
              extraStopStreet: rawValue,
              extraStopZip: selectedOption.zip,
              extraStopCity: selectedOption.city,
            },
      );
      return;
    }

    if (target === 'street') {
      setResolvedStreetOption(null);
    } else {
      setResolvedExtraStopStreetOption(null);
    }

    setFormData((prev) =>
      target === 'street'
        ? {
            ...prev,
            street: rawValue,
            zip: '',
            city: 'Wien',
          }
        : {
            ...prev,
            extraStopStreet: rawValue,
            extraStopZip: '',
            extraStopCity: 'Wien',
          },
    );
  };

  const applyStreetSelection = (
    target: 'street' | 'extraStopStreet',
    option: { street: string; zip: string; city: string },
  ) => {
    const nextValue = `${option.street} `;
    if (target === 'street') {
      setStreetInputValue(nextValue);
      setResolvedStreetOption(option);
      setStreetNumberWarning('street');
      setFormData((prev) => ({
        ...prev,
        street: option.street,
        zip: option.zip,
        city: option.city,
      }));
      return;
    }

    setExtraStopStreetInputValue(nextValue);
    setResolvedExtraStopStreetOption(option);
    setStreetNumberWarning('extraStopStreet');
    setFormData((prev) => ({
      ...prev,
      extraStopStreet: option.street,
      extraStopZip: option.zip,
      extraStopCity: option.city,
    }));
  };

  const isFieldInvalid = (name: keyof ExtendedBookingInput) => {
    const value = formData[name];
    // Check if field is touched and empty (for string fields)
    if (touched[name] && typeof value === 'string' && !value.trim()) {
      return true;
    }
    if ((name === 'street' && streetNumberWarning === 'street') || (name === 'extraStopStreet' && streetNumberWarning === 'extraStopStreet')) {
      return true;
    }
    return false;
  };

  const getInputClassName = (name: keyof ExtendedBookingInput) => {
    if (isFieldInvalid(name)) {
      return BOOKING_FORM_INPUT_INVALID_CLASS;
    }
    return BOOKING_FORM_INPUT_CLASS;
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const handleDirectionChange = (dir: Direction) => {
    setFormData(prev => ({ ...prev, direction: dir }));
    if (touched['direction']) {
        setTouched(prev => ({ ...prev, direction: false }));
    }
  };

  const scrollToPageTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDirection = () => {
    const nextDirection = formData.direction === 'from_airport' ? 'to_airport' : 'from_airport';
    handleDirectionChange(nextDirection);
  };

  const toggleExtraStop = () => {
    setFormData((prev) => ({
      ...prev,
      extraStop: !prev.extraStop,
    }));
  };

  const updateStepperValue = (name: StepperFieldName, delta: -1 | 1, min: number, max: number) => {
    setFormData((prev) => {
      const currentValue = prev[name];
      const numericValue = typeof currentValue === 'number' ? currentValue : null;

      if (delta < 0) {
        if (numericValue === null) return prev;
        return {
          ...prev,
          [name]: Math.max(min, numericValue - 1),
        };
      }

      const nextValue =
        numericValue === null
          ? (min === 0 ? 1 : min)
          : Math.min(max, numericValue + 1);

      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const renderStepper = (
    name: StepperFieldName,
    label: string,
    min: number,
    max: number,
    value: number | '',
    compact = false
  ) => {
  const displayValue = value === '' ? '--' : value;

    return (
      <div className={`flex flex-col items-center justify-center rounded-[14px] bg-[#f5f5f7] ${compact ? 'gap-1.5 p-2.5 md:gap-[0.3rem] md:p-2' : 'gap-2 p-3.5 md:gap-[0.4rem] md:p-[0.7rem]'} md:rounded-2xl`}>
        <span className={`font-medium uppercase text-[#86868b] ${compact ? 'text-[11px]' : 'text-[13px]'}`}>{label}</span>
        <div className="ui-field-surface flex h-12 w-full items-center justify-between gap-2 rounded-[14px] border border-[#d2d2d7] px-2 md:h-[2.4rem] md:gap-[0.4rem] md:px-[0.4rem] md:rounded-full">
          <button
            type="button"
            onClick={() => updateStepperValue(name, -1, min, max)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f3f3ee] md:h-[1.8rem] md:w-[1.8rem]"
            aria-label={`${label} verringern`}
          >
            <Minus size={16} />
          </button>
          <span className={`min-w-[2.2rem] text-center font-semibold text-[#1d1d1f] ${compact ? 'text-[20px]' : 'text-[24px]'}`}>
              {displayValue}
            </span>
          <button
            type="button"
            onClick={() => updateStepperValue(name, 1, min, max)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f3f3ee] md:h-[1.8rem] md:w-[1.8rem]"
            aria-label={`${label} erhoehen`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    );
  };

  const handleInlineSelect = (name: InlineSelectFieldName, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setOpenInlineSelect(null);
  };

  const renderInlineSelect = (
    name: InlineSelectFieldName,
    label: string,
    options: number[],
    value: number | '',
    Icon?: LucideIcon
  ) => {
    const isOpen = openInlineSelect === name;
    const isInvalid = touched[name] && value === '';
    const displayValue = value === '' ? '--' : String(value);

    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className={`text-[11px] font-medium uppercase tracking-[0.05em] sm:text-[13px] ${isInvalid ? 'text-[#d70015]' : 'text-[#86868b]'}`}>{label}</span>
        <div className="relative min-w-0" data-inline-select-root="true">
          {Icon ? (
            <div className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[#86868b]">
              <Icon size={16} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setOpenInlineSelect(isOpen ? null : name)}
            className={`ui-field-surface flex h-12 w-full items-center justify-between rounded-[var(--radius-field)] border py-0 text-left text-[14px] text-[#1d1d1f] outline-none transition-all sm:text-[15px] md:h-[2.4rem] md:text-[12px] ${
              Icon ? 'pl-10 md:pl-8' : 'pl-3 md:pl-[0.8rem]'
            } pr-3 md:pr-[0.8rem] ${
              isInvalid
                ? 'border-[#d70015] text-[#d70015]'
                : value === ''
                  ? 'border-[#d2d2d7] text-[#86868b]'
                  : 'border-[#d2d2d7]'
            }`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className="min-w-0 truncate">{displayValue}</span>
            <ChevronRight size={14} className={`text-[#86868b] transition-transform ${isOpen ? 'rotate-[270deg]' : 'rotate-90'}`} />
          </button>

          {isOpen ? (
            <div className="absolute bottom-[calc(100%+0.45rem)] left-0 right-0 z-30 max-h-52 overflow-hidden rounded-[16px] border border-[#d8d4ca] bg-white p-2 shadow-[0_16px_40px_rgba(17,17,17,0.12)] sm:max-h-60 md:bottom-auto md:top-[calc(100%+0.45rem)]">
              <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto pr-1 sm:max-h-56">
                {options.map((option) => {
                  const selected = option === value;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleInlineSelect(name, option)}
                      className={`rounded-[12px] px-3 py-2 text-left text-[15px] transition-colors md:px-[0.8rem] md:py-[0.4rem] md:text-[12px] ${
                        selected
                          ? 'bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] font-medium text-[#0a63ff]'
                          : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                      }`}
                      role="option"
                      aria-selected={selected}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderExtraStopPanel = () => {
    if (!formData.extraStop) return null;

    return (
      <div className="animate-in fade-in slide-in-from-top-2 rounded-[1.35rem] border border-[#dbe7f8] bg-white p-3.5 shadow-[0_10px_28px_rgba(17,17,17,0.04)] duration-300">
        <div className="mb-3 flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1679ff]">
            Zusatzstopp
          </p>
          <p className="text-[12px] text-[#6a7d96]">
            +10 EUR Aufpreis fuer eine weitere Adresse.
          </p>
        </div>

        <div>
          <StreetAutocomplete
            value={extraStopStreetInputValue}
            selectedOption={selectedExtraStopStreetOption}
            zipHint={formData.zip}
            mobileSelectedStreetOnly
            onChange={(value) => clearStreetSelection('extraStopStreet', value)}
            onSelect={(option) => applyStreetSelection('extraStopStreet', option)}
            onBlur={() => {
              validateStreetNumber('extraStopStreet');
              handleBlur({} as React.FocusEvent<HTMLInputElement>);
            }}
            placeholder="Strasse auswaehlen"
            className={getInputClassName('extraStopStreet')}
          />
          {streetNumberWarning === 'extraStopStreet' ? (
            <div className="mt-2 rounded-[var(--radius-field)] border border-[rgba(215,0,21,0.18)] bg-[rgba(215,0,21,0.05)] px-4 py-3 text-[0.95rem] font-medium text-[#d70015]">
              Bitte ergaenze die Hausnummer.
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const isMissingField = (field: keyof ExtendedBookingInput) => {
    const value = formData[field];

    if (typeof value === 'string') {
      return !value.trim();
    }

    return value === null;
  };

  const parseSelectedDateTime = () => {
    if (!formData.date || !formData.time) return null;

    const [day, month, year] = formData.date.split('.');
    const [hours, minutes] = formData.time.split(':');
    const selectedDate = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10),
      Number.parseInt(hours, 10),
      Number.parseInt(minutes, 10)
    );

    if (Number.isNaN(selectedDate.getTime())) {
      return null;
    }

    return selectedDate;
  };

  const getLeadTimeError = () => {
    const selectedDate = parseSelectedDateTime();
    if (!selectedDate) return REQUIRED_FIELDS_ERROR;

    const now = new Date();
    const selectedHour = selectedDate.getHours();
    const isNightTime = selectedHour >= 22 || selectedHour < 7;
    const minLeadTimeHours = isNightTime ? 8 : 3;
    const minBookingTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);

    if (selectedDate >= minBookingTime) {
      return null;
    }

    return isNightTime
      ? 'Fuer Fahrten zwischen 22:00 und 07:00 Uhr ist eine Vorlaufzeit von 8 Stunden erforderlich.'
      : 'Kurzfristige Buchungen sind nur bis 3 Stunden vor Abholung moeglich.';
  };

  const getStepValidation = (step: number) => {
    const requiredFields: (keyof ExtendedBookingInput)[] = [];

    if (step === 1) {
      requiredFields.push('street', 'zip');
      if (formData.extraStop) {
        requiredFields.push('extraStopStreet', 'extraStopZip');
      }
    } else if (step === 2) {
      requiredFields.push('date', 'time', 'passengers', 'luggage', 'handLuggage');
      if (formData.direction === 'from_airport') {
        requiredFields.push('flightNumber');
      }
    } else if (step === 3) {
      requiredFields.push('fullName', 'email', 'phone', 'paymentMethod');
    }

    const missingFields = requiredFields.filter(isMissingField);
    if (missingFields.length > 0) {
      return {
        isValid: false,
        missingFields,
        errorMessage: REQUIRED_FIELDS_ERROR,
      };
    }

    if (step === 2) {
      const leadTimeError = getLeadTimeError();
      if (leadTimeError) {
        return {
          isValid: false,
          missingFields: [] as (keyof ExtendedBookingInput)[],
          errorMessage: leadTimeError,
        };
      }
    }

    return {
      isValid: true,
      missingFields: [] as (keyof ExtendedBookingInput)[],
      errorMessage: null,
    };
  };

  useEffect(() => {
    if (!error) return;

    if (getStepValidation(currentStep).isValid) {
      setError(null);
    }
  }, [formData, currentStep, error]);

  const handlePaymentChange = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    if (touched['paymentMethod']) {
        setTouched(prev => ({ ...prev, paymentMethod: false }));
    }
  };

  const handleBookingForMyselfToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      bookingForMyself: checked,
      ...(checked
        ? {
            fullName: accountDefaults.fullName,
            phone: accountDefaults.phone,
            email: accountDefaults.email,
          }
        : {
            fullName: '',
            phone: '',
            email: '',
          }),
    }));
  };

  const validateStep = (step: number, markTouched = true) => {
    const validation = getStepValidation(step);

    if (!validation.isValid) {
      if (markTouched) {
        const newTouched = { ...touched };
        validation.missingFields.forEach((field) => {
          newTouched[field] = true;
        });

        if (validation.errorMessage && validation.errorMessage !== REQUIRED_FIELDS_ERROR && step === 2) {
          newTouched['date'] = true;
          newTouched['time'] = true;
        }

        setTouched(newTouched);
      }

      setError(validation.errorMessage || REQUIRED_FIELDS_ERROR);
      return false;
    }

    setError(null);
    return true;
  };

  const nextStep = () => {
    const isValid = validateStep(currentStep);
    if (!isValid) {
      return;
    }

    if (currentStep === 1 && pathname === '/') {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          PENDING_BOOKING_STORAGE_KEY,
          JSON.stringify({
            currentStep: 2,
            formData: {
              direction: formData.direction,
              city: formData.city,
              zip: formData.zip,
              street: formData.street,
              extraStop: formData.extraStop,
              extraStopCity: formData.extraStopCity,
              extraStopZip: formData.extraStopZip,
              extraStopStreet: formData.extraStopStreet,
            },
          }),
        );

        if (getAppSurface() === 'www') {
          window.location.assign('/book');
          return;
        }
      }

      router.push('/book');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      requestAnimationFrame(scrollToPageTop);
    }
  };

  const handleStepIndicatorClick = (targetStep: number) => {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep) {
      setError(null);
      setCurrentStep(targetStep);
      requestAnimationFrame(scrollToPageTop);
      return;
    }

    for (let step = currentStep; step < targetStep; step += 1) {
      const isValid = validateStep(step);
      if (!isValid) {
        setCurrentStep(step);
        return;
      }
    }

    setCurrentStep(targetStep);
    requestAnimationFrame(scrollToPageTop);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
    requestAnimationFrame(scrollToPageTop);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not on the last step, treat submit as "Next"
    if (currentStep < 3) {
      nextStep();
      return;
    }
    
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construct the pickup/destination strings based on direction
      const addressString = formatAddressLine(
        formData.street,
        formData.zip,
        formData.city,
      );
      const extraStopAddressString = formData.extraStop
        ? formatAddressLine(
            formData.extraStopStreet,
            formData.extraStopZip,
            formData.extraStopCity,
          )
        : '';
      const pickup = formData.direction === 'to_airport' ? addressString : 'Flughafen Wien (VIE)';
      const destination = formData.direction === 'to_airport' ? 'Flughafen Wien (VIE)' : addressString;
      
      // Combine date and time
      // Parse DD.MM.YYYY
      const [day, month, year] = formData.date.split('.');
      // Construct ISO string YYYY-MM-DDTHH:mm:00
      const pickupDateTime = new Date(`${year}-${month}-${day}T${formData.time}:00`);

      // Prepare data for Supabase
      const bookingPayload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        pickup,
        destination,
        pickup_at: pickupDateTime.toISOString(),
        passengers: formData.passengers,
        luggage: formData.luggage,
        vehicle_type: vehicleType,
        notes: formData.notes + 
               (formData.childSeat ? ` (Kindersitze: ${formData.babySeats > 0 ? `${formData.babySeats}x Babyschale ` : ''}${formData.childSeats > 0 ? `${formData.childSeats}x Kindersitz ` : ''}${formData.boosterSeats > 0 ? `${formData.boosterSeats}x Sitzerhoehung` : ''})` : '') + 
               (formData.extraStop ? ` (Zwischenstopp: ${extraStopAddressString})` : '') +
               (formData.flightNumber ? ` (Flugnummer: ${formData.flightNumber})` : '') +
               (formData.handLuggage !== '' && formData.handLuggage > 0 ? ` (Handgepaeck: ${formData.handLuggage})` : '') +
               (formData.paymentMethod
                 ? ` (Zahlung: ${
                     formData.paymentMethod === 'cash'
                       ? 'Barzahlung'
                       : formData.paymentMethod === 'card'
                         ? 'Kreditkarte'
                         : formData.paymentMethod === 'voucher'
                           ? 'Lieferschein'
                           : 'Gratis'
                   })`
                 : ''),
        _zip: formData.zip,
        _extraStop: formData.extraStop,
      };

      // 1. Validate (Basic check)
      if (!formData.fullName || !formData.email || !formData.phone) {
        throw new Error('Bitte fuellen Sie alle Kontaktfelder aus.');
      }

      // 2. Submit via Server Action (handles token generation and emails)
      const result = await createBooking(bookingPayload);

      if (result.error) {
        throw new Error(result.error);
      }

      router.push('/book/success');
      
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const stepItems = [
    { key: 1, label: 'Route', icon: MapPin },
    { key: 2, label: 'Details', icon: Calendar },
    { key: 3, label: 'Bestaetigen', icon: Check },
  ] as const;
  const actionRowClass = 'mt-4 flex items-center gap-3';
  const primaryActionButtonClass = 'ui-button-booking-primary';
  const secondaryBackButtonClass =
    'flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-[#dbe7f8] bg-white text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-all hover:border-[#c9dcfb] hover:bg-[#f8fbff] hover:text-[#0a63ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1679ff] focus-visible:ring-offset-2 md:h-[2.8rem] md:w-[2.8rem]';

  const StepIndicator = () => (
    <div className="mt-2 mb-8 flex flex-nowrap items-center justify-center gap-0.5 overflow-x-auto pb-1 md:mt-0 md:mb-10 md:gap-1 md:overflow-visible md:pb-0">
      {stepItems.map((step, index) => {
        const Icon = step.icon;
        const isCurrent = currentStep === step.key;
        const isComplete = currentStep > step.key;

        return (
          <React.Fragment key={step.key}>
            <button
              type="button"
              onClick={() => handleStepIndicatorClick(step.key)}
                className={`inline-flex shrink-0 items-center gap-[0.35rem] rounded-full border px-[0.57rem] py-[0.33rem] text-[10.25px] transition-all md:gap-1 md:px-3 md:py-1.5 md:text-[13px] ${
                isCurrent
                  ? 'border-[#1679FF] bg-[#1679FF] text-white'
                  : isComplete
                    ? 'border-[#1679FF] bg-[#1679FF] text-white'
                    : 'border-[#ddd8cd] bg-white text-[#111111] hover:border-[#cbc4b6]'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
                <Icon size={12} strokeWidth={2.2} className="md:h-4 md:w-4" />
                <span className="text-[10.25px] font-semibold tracking-[-0.02em] md:text-[11px]">{step.key}. {step.label}</span>
              </button>
              {index < stepItems.length - 1 ? (
                <ChevronRight size={10} className="shrink-0 text-[#9f9a91] md:h-[14px] md:w-[14px]" />
              ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );

  const shouldShowInfoTrigger = showStepIndicator || showInfoTrigger || (isAppSurface && hasMounted);

  return (
    <div className={`${BOOKING_FORM_CARD_CLASS} max-w-[720px] md:max-w-none relative ${allowExtendedDropdownSpace ? 'overflow-visible' : 'overflow-hidden'}`}>
      {shouldShowInfoTrigger ? (
        <button
          type="button"
          aria-label="Informationen"
          onClick={() => setIsInfoPanelOpen(true)}
          className={`absolute z-10 inline-flex items-center justify-center text-[#1679ff] transition-colors hover:text-[#0a63ff] ${
            isAppSurface
              ? 'right-4 top-4 md:hidden'
              : 'right-3 top-3 md:hidden'
          }`}
        >
          <Info size={22} strokeWidth={2.2} />
        </button>
      ) : null}
      <div
        className={`px-1 pt-2 md:px-2 md:pt-3 ${
          allowExtendedDropdownSpace ? 'pb-0 md:pb-1' : 'pb-2 md:pb-3'
        }`}
      >
        <form onSubmit={handleSubmit}>
          {showStepIndicator ? <StepIndicator /> : null}
          {/* STEP 1: LOCATION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                {!isHomepageForm && (
                  <div className="text-center mb-6">
                    <h2 className="text-[15px] font-semibold text-[#111111] leading-tight mb-2 tracking-[-0.04em]">Route</h2>
                    <p className="text-[12px] text-[#6d7075]">Abholung und Ziel festlegen.</p>
                  </div>
                )}
              <div className="rounded-[2.2rem] bg-transparent py-3 shadow-none md:-ml-2 md:pl-3 md:-mr-3 md:pr-0">
                <div className="flex gap-0 md:gap-4">
                  <div className="hidden w-6 shrink-0 flex-col items-center pt-[calc(1.45rem+8px)] md:flex md:w-7 md:pt-[calc(1.45rem+8px)]">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full md:h-7 md:w-7 ${formData.direction === 'from_airport' ? 'bg-[#111111] text-white' : 'bg-[#111111] text-white'}`}>
                      {formData.direction === 'from_airport' ? <PlaneLanding size={9} className="md:h-[11px] md:w-[11px]" /> : <MapPin size={9} className="md:h-[11px] md:w-[11px]" />}
                    </div>
                    <div className="h-[calc(3.55rem+5px)] w-px bg-[#111111] md:h-[calc(3.55rem+5px)]" />
                    <div className="-mt-0.9 flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] text-white md:-mt-[5px] md:h-7 md:w-7">
                      <Check size={9} className="md:h-[11px] md:w-[11px]" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="min-h-[4.75rem]">
                      <p className="text-[11px] font-medium text-[#5f6975]">Abholung</p>
                      {formData.direction === 'from_airport' ? (
                        <div className="mt-1 flex min-h-[3.5rem] items-start pt-[0.45rem]">
                          <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#111111]">
                            Flughafen Wien (VIE)
                          </p>
                        </div>
                      ) : null}
                      {formData.direction !== 'from_airport' ? (
                        <div className="mt-1 min-h-[3.5rem]">
                          <div className="relative">
                            <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                              <StreetAutocomplete
                                value={streetInputValue}
                                selectedOption={selectedStreetOption}
                                mobileDropdownFullWidth
                                mobileSelectedStreetOnly
                                menuItems={favoriteMenuItems}
                                onChange={(value) => clearStreetSelection('street', value)}
                                onSelect={(option) => applyStreetSelection('street', option)}
                                onBlur={() => {
                                  validateStreetNumber('street');
                                  handleBlur({} as React.FocusEvent<HTMLInputElement>);
                                }}
                                placeholder="Strasse auswaehlen"
                                className={getInputClassName('street')}
                              />
                            </div>
                            {streetNumberWarning === 'street' ? (
                              <div className="mt-2 rounded-[var(--radius-field)] border border-[rgba(215,0,21,0.18)] bg-[rgba(215,0,21,0.05)] px-4 py-3 text-[0.95rem] font-medium text-[#d70015]">
                                Bitte ergaenze die Hausnummer.
                              </div>
                            ) : null}
                          </div>
                          {renderExtraStopPanel()}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 min-h-[4.75rem]">
                      <p className="text-[11px] font-medium text-[#5f6975]">Ziel</p>
                      {formData.direction === 'from_airport' ? (
                        <div className="mt-1 min-h-[3.5rem]">
                          <div className="relative">
                            <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                              <StreetAutocomplete
                                value={streetInputValue}
                                selectedOption={selectedStreetOption}
                                mobileDropdownFullWidth
                                mobileSelectedStreetOnly
                                menuItems={favoriteMenuItems}
                                onChange={(value) => clearStreetSelection('street', value)}
                                onSelect={(option) => applyStreetSelection('street', option)}
                                onBlur={() => {
                                  validateStreetNumber('street');
                                  handleBlur({} as React.FocusEvent<HTMLInputElement>);
                                }}
                                placeholder="Strasse auswaehlen"
                                className={getInputClassName('street')}
                              />
                            </div>
                            {streetNumberWarning === 'street' ? (
                              <div className="mt-2 rounded-[var(--radius-field)] border border-[rgba(215,0,21,0.18)] bg-[rgba(215,0,21,0.05)] px-4 py-3 text-[0.95rem] font-medium text-[#d70015]">
                                Bitte ergaenze die Hausnummer.
                              </div>
                            ) : null}
                          </div>
                          {renderExtraStopPanel()}
                        </div>
                      ) : (
                        <div className="mt-1 flex min-h-[3.5rem] items-start pt-[0.45rem]">
                          <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#111111]">
                            Flughafen Wien (VIE)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden shrink-0 flex-col justify-start pt-[1.35rem] md:flex">
                    <button
                      type="button"
                      onClick={toggleExtraStop}
                      className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-opacity hover:opacity-60 md:h-8 md:w-8"
                      aria-label="Zusatzstopp hinzufuegen"
                    >
                      <Plus size={16} className="-translate-x-[2px]" />
                    </button>
                    <button
                      type="button"
                      onClick={toggleDirection}
                      className="mt-[3.1rem] inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-opacity hover:opacity-60 md:h-8 md:w-8"
                      aria-label="Abholung und Ziel tauschen"
                    >
                      <ArrowUpDown size={16} className="-translate-x-[2px]" />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8]">
                  <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
                  {error}
                </div>
              )}

              <div className={actionRowClass}>
                  <button
                    type="button"
                    onClick={nextStep}
                    className={primaryActionButtonClass}
                  >
                  Weiter
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <BookingStepTwo
              formData={formData}
              error={error}
              isDatePickerOpen={isDatePickerOpen}
              isTimePickerOpen={isTimePickerOpen}
              setIsDatePickerOpen={setIsDatePickerOpen}
              setIsTimePickerOpen={setIsTimePickerOpen}
              handleDateSelect={handleDateSelect}
              handleTimeSelect={handleTimeSelect}
              handleChange={handleChange}
              handleBlur={handleBlur}
              getInputClassName={getInputClassName}
              isFieldInvalid={isFieldInvalid}
              renderInlineSelect={renderInlineSelect}
              prevStep={prevStep}
              nextStep={nextStep}
              actionRowClass={actionRowClass}
              primaryActionButtonClass={primaryActionButtonClass}
              secondaryBackButtonClass={secondaryBackButtonClass}
              DatePickerComponent={DatePicker}
              TimePickerComponent={TimePicker}
            />
          )}

          {currentStep === 3 && (
            <BookingStepThree
              formData={formData}
              totalPrice={totalPrice}
              routeSummary={routeSummary}
              streetSummary={streetSummary}
              dateSummary={dateSummary}
              vehicleType={vehicleType}
              isLoggedIn={isLoggedIn}
              error={error}
              loading={loading}
              handleBookingForMyselfToggle={handleBookingForMyselfToggle}
              handleChange={handleChange}
              handleBlur={handleBlur}
              getInputClassName={getInputClassName}
              handlePaymentChange={handlePaymentChange}
              touched={touched}
              prevStep={prevStep}
              actionRowClass={actionRowClass}
              secondaryBackButtonClass={secondaryBackButtonClass}
              primaryActionButtonClass={primaryActionButtonClass}
            />
          )}
        </form>
      </div>
      {isInfoPanelOpen ? (
        <div className="fixed inset-0 z-[140] bg-white/96 text-[#111827] backdrop-blur-sm md:bg-transparent md:backdrop-blur-0">
          <div className="flex h-[100dvh] md:min-h-full md:justify-end md:p-0">
            <div className="h-[100dvh] w-full overflow-y-auto overscroll-contain animate-in slide-in-from-right-full duration-300 md:h-screen md:w-[46vw] md:min-w-[34rem] md:max-w-[48rem] md:slide-in-from-right-full md:border-l md:border-[#e8edf3] md:bg-white md:shadow-[-24px_0_60px_rgba(17,17,17,0.12)]">
              <div className="min-h-full px-6 pt-[24px] pb-8 md:px-8 md:py-8">
              <div className="sticky top-0 z-10 -mx-6 bg-white/96 px-6 pb-4 pt-1 backdrop-blur-sm md:static md:mx-0 md:bg-transparent md:px-0 md:pb-6 md:pt-0 md:backdrop-blur-0">
                <div className="flex items-start justify-between gap-3 md:items-center">
                  <button
                    type="button"
                    onClick={() => setIsInfoPanelOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111827] md:hidden"
                    aria-label="Zurueck"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInfoPanelOpen(false)}
                    className="hidden md:inline-flex md:h-11 md:w-11 md:items-center md:justify-center md:rounded-full md:border md:border-[#e5e7eb] md:bg-white md:text-[#111827]"
                    aria-label="Schliessen"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="pb-6 pt-2 md:pt-0">
                <div className="min-w-0">
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.22em] text-[#1679ff]">
                    Informationen
                  </p>
                  <h2 className="mt-3 text-[2.2rem] font-semibold leading-[0.98] tracking-[-0.06em] text-[#111827] md:max-w-[11ch] md:text-[4rem]">
                    Informationen zum Flughafentransfer
                  </h2>
                  <p className="mt-4 max-w-[44rem] text-[1.02rem] leading-8 text-[#6a7d96] md:text-[1.12rem]">
                    Alle wichtigen Hinweise fuer Ankunft, Vorlaufzeit und Zahlung direkt neben der Buchung.
                  </p>
                </div>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="rounded-[1.6rem] border border-[#e8edf3] bg-white px-5 py-5 md:px-6 md:py-6">
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.22em] text-[#1679ff]">
                    Abholung am Flughafen
                  </p>
                  <h3 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-[#111827]">
                    Wo Sie Ihren Fahrer treffen
                  </h3>
                  <ul className="mt-4 space-y-2 text-[1rem] leading-8 text-[#6a6a6a]">
                    <li>• Der Fahrer wartet in der Ankunftshalle</li>
                    <li>• Namensschild mit Ihrem Buchungsnamen</li>
                    <li>• Kostenlose Wartezeit inklusive</li>
                  </ul>
                </div>

                <div className="rounded-[1.6rem] border border-[#e8edf3] bg-white px-5 py-5 md:px-6 md:py-6">
                  <h3 className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[#111827]">
                    Mindestvorlauf fuer Buchungen
                  </h3>
                  <div className="mt-4 space-y-2 text-[1rem] leading-8 text-[#6a6a6a]">
                    <p>07:00-22:00 - mindestens 3h vorher buchen</p>
                    <p>22:00-07:00 - mindestens 8h vorher buchen</p>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-[#e8edf3] bg-white px-5 py-5 md:px-6 md:py-6">
                  <h3 className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[#111827]">
                    Kindersitze
                  </h3>
                  <p className="mt-3 text-[1rem] leading-8 text-[#6a6a6a]">
                    Auf Wunsch direkt waehrend der Buchung waehlbar.
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-[#e8edf3] bg-white px-5 py-5 md:px-6 md:py-6">
                  <h3 className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[#111827]">
                    Zahlungsarten
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {['Bar', 'Visa', 'Mastercard', 'Apple Pay'].map((method) => (
                      <div
                        key={method}
                        className="flex items-center gap-3 rounded-[1.2rem] border border-[#e8edf3] bg-[#f8fbff] px-4 py-4 text-[1rem] font-medium text-[#111827]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1679ff] shadow-[0_8px_18px_rgba(17,17,17,0.04)]">
                          <CreditCard size={18} strokeWidth={2} />
                        </span>
                        <span>{method}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pb-8 md:pb-2">
                  {[
                    { label: 'Fixpreis', icon: Check },
                    { label: 'Kostenlose Wartezeit', icon: Clock },
                    { label: 'Flugtracking', icon: PlaneLanding },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-[#e8edf3] bg-white px-4 py-3 text-[0.98rem] font-medium text-[#111827]"
                    >
                      <Icon size={18} className="text-[#1679ff]" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BookingForm;


