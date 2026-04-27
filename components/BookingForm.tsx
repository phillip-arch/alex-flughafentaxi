'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import StreetAutocomplete from '@/components/address/StreetAutocomplete';
import {
  buildStreetOptionValue,
  formatAddressLine,
  sortFavoriteAddresses,
  type StreetOption,
} from '@/lib/addresses';
import {
  MapPin, 
  House,
  Check,
  ChevronDown,
  ChevronRight, 
  ChevronLeft, 
  Building2,
  Info,
  CalendarDays,
  Clock3,
  PlaneLanding,
  PlaneTakeoff,
  X,
} from 'lucide-react';
import { determineVehicle, calculateVehiclePrice, type VehicleType } from '@/lib/pricing';
import {
  DAYTIME_LEAD_TIME_ERROR,
  formatLeadTimeTimeValue,
  getLeadTimeErrorMessage,
  getNextAllowedDateTime,
  hasSufficientLeadTime,
  NIGHT_LEAD_TIME_ERROR,
} from '@/lib/booking/leadTime';
import {
  BOOKING_FIELD_STACK_CLASS,
  BOOKING_FORM_CARD_CLASS,
  BOOKING_FORM_INPUT_CLASS,
  BOOKING_FORM_INPUT_INVALID_CLASS,
} from '@/lib/ui/bookingFormStyles';
import { BookingInfoPanel } from '@/components/booking/BookingInfoPanel';

import { createBooking } from '@/app/(booking)/actions';

const DatePicker = dynamic(() => import('./DatePicker'));
const TimePicker = dynamic(() => import('./TimePicker'));
const BookingStepTwo = dynamic(() => import('./BookingStepTwo'));
const BookingStepThree = dynamic(() => import('./BookingStepThree'));

// Types
type Direction = 'to_airport' | 'from_airport' | null;
type PaymentMethod = 'cash' | 'card' | null;

const PENDING_BOOKING_STORAGE_KEY = 'pending-booking-form';
const VEHICLE_ORDER: VehicleType[] = ['Limo', 'Kombi', 'Bus'];
const DESKTOP_BOOKING_VIEWPORT_HEIGHT_PX = 440;

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

  travelDetailsSelected: boolean;
  vehicleOverride: VehicleType | null;
  childSeat: boolean;
  babySeats: number;
  childSeats: number;
  boosterSeats: number;
  meetAndGreet: boolean;
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
  headerTitle?: string;
  showStepOneRouteIntro?: boolean;
  fluidDesktopWidth?: boolean;
  lockDesktopHeight?: boolean;
  isAppSurface?: boolean;
  initialFavorites?: FavoriteAddress[];
  initialIsLoggedIn?: boolean;
  meetAndGreetSelected?: boolean;
  onMeetAndGreetChange?: (checked: boolean) => void;
  onStepChange?: (step: number) => void;
  initialAccountDefaults?: {
    fullName: string;
    phone: string;
    email: string;
  };
};

type StepperFieldName =
  | 'passengers'
  | 'luggage'

  | 'babySeats'
  | 'childSeats'
  | 'boosterSeats';

const EMPTY_FAVORITES: FavoriteAddress[] = [];
const EMPTY_ACCOUNT_DEFAULTS = {
  fullName: '',
  phone: '',
  email: '',
};
const FAVORITE_ADDRESS_ICONS = [House, Building2, MapPin] as const;
const DEFAULT_BASE_PRICE = 38;
const ADDRESS_FIELD_CLASS = `${BOOKING_FORM_INPUT_CLASS} !min-h-[2.8rem] !px-[0.6rem] !py-[0.6rem] !text-[18px] !font-semibold !tracking-[-0.03em] placeholder:!font-normal focus:!border-[#7fb3ff] focus:!bg-white focus:!shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)] md:!min-h-[3rem] md:!px-[0.6rem] md:!py-[0.6rem]`;
const ADDRESS_FIELD_INVALID_CLASS = `${BOOKING_FORM_INPUT_INVALID_CLASS} !min-h-[2.8rem] !px-[0.6rem] !py-[0.6rem] !text-[18px] !font-semibold !tracking-[-0.03em] placeholder:!font-normal md:!min-h-[3rem] md:!px-[0.6rem] md:!py-[0.6rem]`;
const FLIGHT_NUMBER_PATTERN = /^[A-Z0-9]{2,3}\d{1,4}[A-Z0-9]?$/;
const TIME_VALUE_PATTERN = /^\d{2}:\d{2}$/;
const TIME_EXPIRED_ERROR =
  'Your selected pickup time expired while you were filling out the form. Please adjust the time to meet our notice requirement.';

const BookingForm = ({
  onDirectionChange,
  showStepIndicator = true,
  showInfoTrigger = false,
  headerTitle,
  showStepOneRouteIntro,
  fluidDesktopWidth = false,
  lockDesktopHeight = false,
  isAppSurface: isAppSurfaceProp,
  initialFavorites = EMPTY_FAVORITES,
  initialIsLoggedIn = false,
  meetAndGreetSelected,
  onMeetAndGreetChange,
  onStepChange,
  initialAccountDefaults = EMPTY_ACCOUNT_DEFAULTS,
}: BookingFormProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHomepageForm = pathname === '/';
  const isAppSurface = isAppSurfaceProp ?? false;
  const shouldShowStepOneRouteIntro = showStepOneRouteIntro ?? !isHomepageForm;
  const allowExtendedDropdownSpace = true;
  const copy = {
    stepLabel: (step: number) => `STEP ${step} OF 3`,
    routeTitle: 'Route',
    routeDescription: 'Enter pickup and destination',
    pickupLabel: 'Pickup',
    destinationLabel: 'Destination',
    airportLabel: 'Vienna Airport (VIE)',
    streetPlaceholder: 'Select street',
    nextLabel: 'Continue',
  };
  const supabase = supabaseBrowser();
  const [currentStep, setCurrentStep] = useState(1);
  const [mobileStepDirection, setMobileStepDirection] = useState<'next' | 'prev'>('next');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadTimeAdjustmentNotice, setLeadTimeAdjustmentNotice] = useState<string | null>(null);
  const [flightLookupError, setFlightLookupError] = useState<string | null>(null);
  const [isLookingUpFlight, setIsLookingUpFlight] = useState(false);
  
  // Picker States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const datePickerAnchorRef = useRef<HTMLDivElement | null>(null);
  const timePickerAnchorRef = useRef<HTMLDivElement | null>(null);
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
  const [streetPasteWarning, setStreetPasteWarning] = useState<'street' | 'extraStopStreet' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [accountDefaults, setAccountDefaults] = useState(initialAccountDefaults);
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
    passengers: 1,
    luggage: 0,
    travelDetailsSelected: false,
    vehicleOverride: null,
    childSeat: false,
    babySeats: 0,
    childSeats: 0,
    boosterSeats: 0,
    meetAndGreet: false,
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    paymentMethod: null,
    bookingForMyself: true,
    saveProfile: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const REQUIRED_FIELDS_ERROR = 'Please fill in all required fields.';
  const [isErrorToastVisible, setIsErrorToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const errorToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeToastMessage =
    error ||
    flightLookupError ||
    (streetPasteWarning === 'street' ? 'Address could not be recognized clearly. Please choose from the list.' : null) ||
    (streetNumberWarning === 'street' ? 'Please add the street number.' : null) ||
    leadTimeAdjustmentNotice ||
    null;
  const activeToastIsError = Boolean(error || flightLookupError || streetPasteWarning || streetNumberWarning);
  const activeToastAutoHide = activeToastMessage === REQUIRED_FIELDS_ERROR || (!activeToastIsError && Boolean(leadTimeAdjustmentNotice));

  useEffect(() => {
    onDirectionChange?.(formData.direction);
  }, [formData.direction, onDirectionChange]);

  useEffect(() => {
    if (typeof meetAndGreetSelected !== 'boolean') return;
    setFormData((prev) =>
      prev.meetAndGreet === meetAndGreetSelected ? prev : { ...prev, meetAndGreet: meetAndGreetSelected },
    );
  }, [meetAndGreetSelected]);

  useEffect(() => {
    if (formData.direction === 'from_airport' || !formData.meetAndGreet) return;
    setFormData((prev) => ({ ...prev, meetAndGreet: false }));
    onMeetAndGreetChange?.(false);
  }, [formData.direction, formData.meetAndGreet, onMeetAndGreetChange]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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
        selectedStreetOption?: StreetOption | null;
      };

      if (parsed.formData) {
        const restoredFormData = {
          ...parsed.formData,
          extraStop: false,
          extraStopStreet: '',
          extraStopZip: '',
          extraStopCity: 'Wien',
        };

        setFormData((prev) => ({
          ...prev,
          ...restoredFormData,
        }));

        const restoredStreet = String(parsed.formData.street || '').trim();
        const restoredZip = String(parsed.formData.zip || '').trim();
        const restoredCity = String(parsed.formData.city || '').trim();
        if (restoredStreet && restoredZip) {
          setStreetInputValue(restoredStreet);
          setResolvedStreetOption({
            street: parsed.selectedStreetOption?.street || splitStreetAndHouseSuffix(restoredStreet).streetQuery,
            zip: restoredZip,
            city: restoredCity || 'Wien',
          });
        }
      }

      if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 3) {
        const restoredLeadTimeError = getLeadTimeError(
          String(parsed.formData?.date || ''),
          String(parsed.formData?.time || ''),
        );

        if (parsed.currentStep > 1 && restoredLeadTimeError && restoredLeadTimeError !== REQUIRED_FIELDS_ERROR) {
          setTouched((prev) => ({ ...prev, date: true, time: true }));
          setError(restoredLeadTimeError);
          setCurrentStep(1);
        } else {
          setCurrentStep(parsed.currentStep);
        }
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
    setStreetPasteWarning(null);
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
  const meetAndGreetPrice = formData.direction === 'from_airport' && formData.meetAndGreet ? 6 : 0;
  
  // Determine vehicle type
  const passengers = typeof formData.passengers === 'number' ? formData.passengers : 0;
  const suitcases = typeof formData.luggage === 'number' ? formData.luggage : 0;

  const requiredVehicleType = determineVehicle(passengers, suitcases);
  const requiredVehicleIndex = VEHICLE_ORDER.indexOf(requiredVehicleType);
  const overrideVehicleIndex = formData.vehicleOverride ? VEHICLE_ORDER.indexOf(formData.vehicleOverride) : -1;
  const vehicleType =
    overrideVehicleIndex > requiredVehicleIndex && formData.vehicleOverride
      ? formData.vehicleOverride
      : requiredVehicleType;
  
  // Calculate price with ZIP-based surcharge when available
  const vehiclePrice = calculateVehiclePrice(basePrice, vehicleType, dbPrices);
  const totalPrice = vehiclePrice + meetAndGreetPrice;
  const vehiclePriceOptions = (['Limo', 'Kombi', 'Bus'] as VehicleType[]).map((optionVehicleType) => ({
    vehicleType: optionVehicleType,
    totalPrice: calculateVehiclePrice(basePrice, optionVehicleType, dbPrices) + meetAndGreetPrice,
  }));
  const selectedStreetOption = resolvedStreetOption;
  const currentPickupDisplayValue =
    formData.direction === 'from_airport'
      ? copy.airportLabel
      : buildStreetOptionValue(
          selectedStreetOption?.street || streetInputValue || formData.street,
          selectedStreetOption?.zip || formData.zip,
          selectedStreetOption?.city || formData.city,
        );
  const isFlightDetailsVisible = /airport/i.test(currentPickupDisplayValue);
  const addressPlaceholder =
    formData.direction === 'from_airport' ? 'Where should we take you?' : 'Where should we pick you up?';
  const addressInputPlaceholder =
    formData.direction === 'from_airport' ? 'Enter destination address' : 'Enter pickup address';
  const timeFieldLabel = formData.direction === 'from_airport' ? 'Landing time' : 'Time';
  useEffect(() => {
    if (!isFlightDetailsVisible) {
      setFlightLookupError(null);
    }
  }, [isFlightDetailsVisible]);

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (errorToastTimerRef.current) {
      clearTimeout(errorToastTimerRef.current);
      errorToastTimerRef.current = null;
    }
    if (!activeToastMessage) {
      setIsErrorToastVisible(false);
      return;
    }
    setIsErrorToastVisible(true);
    if (activeToastAutoHide) {
      errorToastTimerRef.current = setTimeout(() => setIsErrorToastVisible(false), 3500);
    }
    return () => {
      if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);
    };
  }, [activeToastMessage, toastKey]);

  const shouldLockDesktopFormHeight = true;
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
  const hasTypedStreetNumber = (rawValue: string, baseStreet: string) => {
    const normalizedRaw = rawValue.trim().replace(/\s+/g, ' ');
    const normalizedBase = baseStreet.trim().replace(/\s+/g, ' ');
    if (!normalizedRaw || !normalizedBase) return false;
    if (normalizedRaw.length <= normalizedBase.length) return false;
    if (!normalizedRaw.toLowerCase().startsWith(normalizedBase.toLowerCase())) return false;

    const suffix = normalizedRaw.slice(normalizedBase.length).trim();
    return /^\d[\dA-Za-z\s,/-]*$/u.test(suffix);
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

  const isResolvedStreetComplete = (target: 'street' | 'extraStopStreet') => {
    const selectedOption = target === 'street' ? resolvedStreetOption : resolvedExtraStopStreetOption;
    const rawValue = target === 'street' ? formData.street : formData.extraStopStreet;
    return Boolean(selectedOption && hasTypedStreetNumber(rawValue, selectedOption.street));
  };

  const splitStreetAndHouseSuffix = (value: string) => {
    const normalized = value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return { streetQuery: '', houseSuffix: '' };
    }

    const firstNumberIndex = normalized.search(/\s\d/u);
    if (firstNumberIndex === -1) {
      return { streetQuery: normalized, houseSuffix: '' };
    }

    return {
      streetQuery: normalized.slice(0, firstNumberIndex).trim(),
      houseSuffix: normalized.slice(firstNumberIndex).trim().replace(/^[,\s]+/u, ''),
    };
  };

  const parsePastedAddress = (rawValue: string) => {
    const value = rawValue.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!value) {
      return null;
    }

    const zipFirstMatch = value.match(/^(\d{4})\s+([^,]+),\s*(.+?)(?:\s+(\d[\dA-Za-z/-]*))?$/u);
    if (zipFirstMatch) {
      const streetParts = splitStreetAndHouseSuffix(
        `${zipFirstMatch[3].trim()} ${String(zipFirstMatch[4] || '').trim()}`.trim()
      );
      return {
        streetQuery: streetParts.streetQuery,
        zip: zipFirstMatch[1].trim(),
        city: zipFirstMatch[2].trim(),
        houseSuffix: streetParts.houseSuffix,
      };
    }

    const streetFirstMatch = value.match(/^(.+?)(?:\s+(\d[\dA-Za-z/-]*))?\s*,?\s*(\d{4})\s+(.+)$/u);
    if (streetFirstMatch) {
      const streetParts = splitStreetAndHouseSuffix(
        `${streetFirstMatch[1].trim()} ${String(streetFirstMatch[2] || '').trim()}`.trim()
      );
      return {
        streetQuery: streetParts.streetQuery,
        zip: streetFirstMatch[3].trim(),
        city: streetFirstMatch[4].trim(),
        houseSuffix: streetParts.houseSuffix,
      };
    }

    const streetParts = splitStreetAndHouseSuffix(value);
    if (streetParts.houseSuffix) {
      return {
        streetQuery: streetParts.streetQuery,
        zip: '',
        city: '',
        houseSuffix: streetParts.houseSuffix,
      };
    }

    return {
      streetQuery: value,
      zip: '',
      city: '',
      houseSuffix: '',
    };
  };

  const normalizeAddressLookupValue = (value: string) =>
    value
      .trim()
      .replace(/[.,;:]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toLocaleLowerCase('de-AT');

  const handleStreetPaste = async (
    target: 'street' | 'extraStopStreet',
    pastedText: string,
  ) => {
    const parsed = parsePastedAddress(pastedText);
    if (!parsed) {
      return;
    }

    const params = new URLSearchParams({
      q: parsed.streetQuery,
      limit: '10',
    });
    if (parsed.zip) {
      params.set('zip', parsed.zip);
    }

    try {
      const response = await fetch(`/api/streets/search?${params.toString()}`);
      const payload = (await response.json()) as { results?: StreetOption[] };
      const normalizedStreetQuery = normalizeAddressLookupValue(parsed.streetQuery);
      const normalizedCityQuery = normalizeAddressLookupValue(parsed.city);
      const option = payload.results?.find((item) => {
        const sameStreet = normalizeAddressLookupValue(item.street) === normalizedStreetQuery;
        const sameZip = parsed.zip ? String(item.zip || '').trim() === parsed.zip : true;
        const sameCity = parsed.city ? normalizeAddressLookupValue(item.city || '') === normalizedCityQuery : true;
        return sameStreet && sameZip && sameCity;
      });

      if (!response.ok || !option) {
        clearStreetSelection(target, pastedText.trim());
        setStreetPasteWarning(target);
        return;
      }

      const nextValue = `${option.street}${parsed.houseSuffix ? ` ${parsed.houseSuffix}` : ' '}`;

      if (target === 'street') {
        setStreetInputValue(nextValue);
        setResolvedStreetOption(option);
        setStreetNumberWarning(parsed.houseSuffix ? null : 'street');
        setStreetPasteWarning(null);
        setFormData((prev) => ({
          ...prev,
          street: nextValue,
          zip: option.zip,
          city: option.city,
        }));
        return;
      }

      setExtraStopStreetInputValue(nextValue);
      setResolvedExtraStopStreetOption(option);
      setStreetNumberWarning(parsed.houseSuffix ? null : 'extraStopStreet');
      setStreetPasteWarning(null);
      setFormData((prev) => ({
        ...prev,
        extraStopStreet: nextValue,
        extraStopZip: option.zip,
        extraStopCity: option.city,
      }));
    } catch {
      clearStreetSelection(target, pastedText.trim());
      setStreetPasteWarning(target);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const normalizedValue =
      name === 'zip' || name === 'extraStopZip'
        ? value.replace(/\D/g, '').slice(0, 4)
        : value;
    if (name === 'flightNumber') {
      setFlightLookupError(null);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'passengers' || name === 'luggage' || name === 'babySeats' || name === 'childSeats' || name === 'boosterSeats' ? (normalizedValue === '' ? '' : parseInt(normalizedValue)) : normalizedValue,
    }));
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
    setStreetPasteWarning((prev) => (prev === target ? null : prev));

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
      setStreetPasteWarning(null);
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
    setStreetPasteWarning(null);
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
      if (name === 'street' || name === 'extraStopStreet') {
        return ADDRESS_FIELD_INVALID_CLASS;
      }
      return BOOKING_FORM_INPUT_INVALID_CLASS;
    }
    if (name === 'street' || name === 'extraStopStreet') {
      return ADDRESS_FIELD_CLASS;
    }
    return BOOKING_FORM_INPUT_CLASS;
  };

  const handleDateSelect = (date: string) => {
    setFlightLookupError(null);
    setLeadTimeAdjustmentNotice(null);
    setFormData(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (time: string) => {
    setLeadTimeAdjustmentNotice(null);
    setFormData(prev => ({ ...prev, time }));
  };

  const formatAdjustmentDateValue = (value: Date) => {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}.${value.getFullYear()}`;
  };

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({ ...prev, notes }));
  };

  const formatSelectedDateForFlightLookup = (date: string) => {
    const [day, month, year] = date.split('.');
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const extractLookupFlightNumber = (value: string) => {
    const normalizedValue = value.trim().toUpperCase();
    if (!normalizedValue) return '';

    const leadingMatch = normalizedValue.match(/^([A-Z0-9]{2,3}\d{1,4}[A-Z0-9]?)(?:\s|$)/);
    if (leadingMatch?.[1]) {
      return leadingMatch[1];
    }

    const compactValue = normalizedValue.replace(/\s+/g, '');
    const fallbackMatch = compactValue.match(/[A-Z0-9]{2,3}\d{1,4}[A-Z0-9]?/);
    return fallbackMatch?.[0] ?? compactValue;
  };

  const handleFlightNumberBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const lookupFlightNumber = extractLookupFlightNumber(e.target.value);
    if (!lookupFlightNumber) return;

    if (!FLIGHT_NUMBER_PATTERN.test(lookupFlightNumber)) {
      setFlightLookupError('Please enter a valid flight number, e.g. OS123.');
      return;
    }

    if (formData.direction !== 'from_airport') return;

    const formattedDate = formatSelectedDateForFlightLookup(formData.date);
    if (!formattedDate) {
      setFlightLookupError('Please select the date first so the flight number can be checked.');
      return;
    }

    setIsLookingUpFlight(true);
    setFlightLookupError(null);

    try {
      const response = await fetch(
        `/api/flight-check?flightNumber=${encodeURIComponent(lookupFlightNumber)}&date=${encodeURIComponent(formattedDate)}`,
      );
      const payload = (await response.json()) as {
        error?: string;
        flightNumber?: string;
        origin?: string;
        displayFlightNumber?: string;
        scheduledArrivalTime?: string;
      };

      if (!response.ok || !payload.displayFlightNumber || !payload.scheduledArrivalTime) {
        setFlightLookupError(payload.error || 'Flight could not be found.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        flightNumber: payload.displayFlightNumber ?? prev.flightNumber,
        time: payload.scheduledArrivalTime ?? prev.time,
      }));
      setFlightLookupError(null);
    } catch {
      setFlightLookupError('Flight data could not be loaded right now. Please try again.');
    } finally {
      setIsLookingUpFlight(false);
    }
  };

  const handleDirectionChange = (dir: Direction) => {
    setFormData(prev => ({ ...prev, direction: dir }));
    setFlightLookupError(null);
    if (touched['direction']) {
        setTouched(prev => ({ ...prev, direction: false }));
    }
  };

  const scrollToPageTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateStepperValue = (name: StepperFieldName, delta: -1 | 1, min: number, max: number) => {
    setFormData((prev) => {
      const currentValue = prev[name];
      const numericValue = typeof currentValue === 'number' ? currentValue : null;
      const isChildSeatField =
        name === 'babySeats' || name === 'childSeats' || name === 'boosterSeats';

      if (delta < 0) {
        if (numericValue === null) return prev;
        const nextValue = Math.max(min, numericValue - 1);
        const nextBabySeats = name === 'babySeats' ? nextValue : prev.babySeats;
        const nextChildSeats = name === 'childSeats' ? nextValue : prev.childSeats;
        const nextBoosterSeats = name === 'boosterSeats' ? nextValue : prev.boosterSeats;

        return {
          ...prev,
          [name]: nextValue,
          ...(isChildSeatField
            ? { childSeat: nextBabySeats + nextChildSeats + nextBoosterSeats > 0 }
            : {}),
        };
      }

      const nextValue =
        numericValue === null
          ? (min === 0 ? 1 : min)
          : Math.min(max, numericValue + 1);
      const nextBabySeats = name === 'babySeats' ? nextValue : prev.babySeats;
      const nextChildSeats = name === 'childSeats' ? nextValue : prev.childSeats;
      const nextBoosterSeats = name === 'boosterSeats' ? nextValue : prev.boosterSeats;

      return {
        ...prev,
        [name]: nextValue,
        ...(isChildSeatField
          ? { childSeat: nextBabySeats + nextChildSeats + nextBoosterSeats > 0 }
          : {}),
      };
    });
  };

  const isMissingField = (field: keyof ExtendedBookingInput) => {
    const value = formData[field];

    if (typeof value === 'string') {
      return !value.trim();
    }

    return value === null;
  };

  const parseSelectedDateTime = (date = formData.date, time = formData.time) => {
    if (!date || !time || !TIME_VALUE_PATTERN.test(time)) return null;

    const [day, month, year] = date.split('.');
    const [hours, minutes] = time.split(':');
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

  const handleVehicleUpgrade = (nextVehicleType: VehicleType) => {
    setFormData((prev) => ({
      ...prev,
      travelDetailsSelected: true,
      vehicleOverride: nextVehicleType,
    }));
  };

  const handleTravelDetailsConfirm = (selectedVehicleType: VehicleType) => {
    setFormData((prev) => ({
      ...prev,
      travelDetailsSelected: true,
      vehicleOverride: selectedVehicleType,
    }));
  };

  const getLeadTimeError = (date = formData.date, time = formData.time) => {
    const selectedDate = parseSelectedDateTime(date, time);
    if (!selectedDate) return REQUIRED_FIELDS_ERROR;

    if (hasSufficientLeadTime(selectedDate)) {
      return null;
    }

    return getLeadTimeErrorMessage(selectedDate);
  };

  const isLeadTimeErrorMessage = (message: string | null) =>
    message === NIGHT_LEAD_TIME_ERROR || message === DAYTIME_LEAD_TIME_ERROR;

  useEffect(() => {
    if (!formData.date || !TIME_VALUE_PATTERN.test(formData.time)) return;

    const selectedDate = parseSelectedDateTime(formData.date, formData.time);
    if (!selectedDate) return;

    if (hasSufficientLeadTime(selectedDate)) {
      setError((prev) => (isLeadTimeErrorMessage(prev) || prev === TIME_EXPIRED_ERROR ? null : prev));
      return;
    }

    const nextAllowedDateTime = getNextAllowedDateTime(selectedDate);
    if (!nextAllowedDateTime) {
      setTouched((prev) => ({ ...prev, date: true, time: true }));
      setError(getLeadTimeError(selectedDate ? formData.date : '', formData.time));
      return;
    }

    const adjustedDate = formatAdjustmentDateValue(nextAllowedDateTime);
    const adjustedTime = formatLeadTimeTimeValue(nextAllowedDateTime);
    if (adjustedDate === formData.date && adjustedTime === formData.time) {
      setTouched((prev) => ({ ...prev, date: true, time: true }));
      setError(getLeadTimeError(formData.date, formData.time));
      return;
    }

    setFormData((prev) => ({ ...prev, date: adjustedDate, time: adjustedTime }));
    setError((prev) => (isLeadTimeErrorMessage(prev) || prev === TIME_EXPIRED_ERROR ? null : prev));
    setLeadTimeAdjustmentNotice(
      adjustedDate === formData.date
        ? 'Time adjusted to the earliest available slot for the selected date.'
        : `Selected time is not available on ${formData.date}. Moved to the next available slot on ${adjustedDate} at ${adjustedTime}.`,
    );
  }, [formData.date, formData.time]);

  const getStepValidation = (step: number) => {
    const requiredFields: (keyof ExtendedBookingInput)[] = [];

    if (step === 1) {
      requiredFields.push('date', 'time', 'street', 'zip');
      if (isFlightDetailsVisible) {
        requiredFields.push('flightNumber');
      }
    } else if (step === 2) {
      requiredFields.push('passengers', 'luggage');
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

    if (step === 1) {
      const primaryAddressValid = isResolvedStreetComplete('street');
      const hasPasteWarning = streetPasteWarning === 'street';

      if (!primaryAddressValid || hasPasteWarning) {
        return {
          isValid: false,
          missingFields: ['street'] as (keyof ExtendedBookingInput)[],
          errorMessage: 'Please choose a valid address from the list and add the street number.',
        };
      }
    }

    if (step === 1) {
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
  }, [formData, currentStep, error, touched, streetPasteWarning, resolvedStreetOption]);

  const handlePaymentChange = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    if (touched['paymentMethod']) {
        setTouched(prev => ({ ...prev, paymentMethod: false }));
    }
  };

  const handleMeetAndGreetChange = (checked: boolean) => {
    if (!isFlightDetailsVisible) return;
    setFormData((prev) => ({ ...prev, meetAndGreet: checked }));
    onMeetAndGreetChange?.(checked);
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

        if (validation.errorMessage && validation.errorMessage !== REQUIRED_FIELDS_ERROR && step === 1) {
          newTouched['date'] = true;
          newTouched['time'] = true;
        }

        setTouched(newTouched);
      }

      setError(validation.errorMessage || REQUIRED_FIELDS_ERROR);
      setToastKey((k) => k + 1);
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
              extraStop: false,
              extraStopCity: 'Wien',
              extraStopZip: '',
              extraStopStreet: '',
              date: formData.date,
              time: formData.time,
              meetAndGreet: formData.meetAndGreet,
            },
            selectedStreetOption: resolvedStreetOption,
          }),
        );

        if (!isAppSurface) {
          window.location.assign('/book');
          return;
        }
      }

      router.push('/book');
      return;
    }

    if (currentStep < 3) {
      setMobileStepDirection('next');
      setCurrentStep((prev) => prev + 1);
      requestAnimationFrame(scrollToPageTop);
    }
  };

  const prevStep = () => {
    setError(null);
    setMobileStepDirection('prev');
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

    const selectedDateTime = parseSelectedDateTime(formData.date, formData.time);
    if (!selectedDateTime || !hasSufficientLeadTime(selectedDateTime)) {
      setTouched((prev) => ({ ...prev, date: true, time: true }));
      setMobileStepDirection('prev');
      setCurrentStep(1);
      setError(TIME_EXPIRED_ERROR);
      requestAnimationFrame(scrollToPageTop);
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
      const pickup = formData.direction === 'to_airport' ? addressString : 'Vienna Airport (VIE)';
      const destination = formData.direction === 'to_airport' ? 'Vienna Airport (VIE)' : addressString;
      
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
               (formData.childSeat ? ` (Child seats: ${formData.babySeats > 0 ? `${formData.babySeats}x baby seat ` : ''}${formData.childSeats > 0 ? `${formData.childSeats}x child seat ` : ''}${formData.boosterSeats > 0 ? `${formData.boosterSeats}x booster seat` : ''})` : '') + 
               (formData.direction === 'from_airport' && formData.meetAndGreet
                 ? ' (Meet & Greet: Driver waits inside with a name sign)'
                 : '') +
               (isFlightDetailsVisible && formData.flightNumber ? ` (Flight number: ${formData.flightNumber})` : '') +
               (formData.paymentMethod
                 ? ` (Payment: ${
                     formData.paymentMethod === 'cash'
                       ? 'Cash'
                       : formData.paymentMethod === 'card'
                         ? 'Credit card'
                         : formData.paymentMethod === 'voucher'
                           ? 'Voucher'
                           : 'Free'
                   })`
                 : ''),
        _zip: formData.zip,
        _extraStop: false,
        _meetAndGreet: formData.direction === 'from_airport' && formData.meetAndGreet,
      };

      // 1. Validate (Basic check)
      if (!formData.fullName || !formData.email || !formData.phone) {
        throw new Error('Please fill in all contact fields.');
      }

      // 2. Submit via Server Action (handles token generation and emails)
      const result = await createBooking(bookingPayload);

      if (result.error) {
        throw new Error(result.error);
      }

      router.push('/book/success');
      
    } catch (err: any) {
      const message = err.message || 'An error occurred.';
      if (isLeadTimeErrorMessage(message)) {
        setTouched((prev) => ({ ...prev, date: true, time: true }));
        setMobileStepDirection('prev');
        setCurrentStep(1);
        setError(TIME_EXPIRED_ERROR);
        requestAnimationFrame(scrollToPageTop);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const actionRowWithTrustClass =
    'mt-2 flex flex-col items-center gap-2 md:mt-0 md:flex-row md:items-center md:gap-6 md:pt-3';
  const actionRowStackedTrustClass =
    'mt-2 flex flex-col items-center gap-2 md:mt-0 md:pt-3';
  const actionButtonGroupClass = 'flex w-full items-center justify-center gap-3';
  const primaryActionButtonClass = 'ui-button-booking-primary';
  const secondaryBackButtonClass =
    'flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-[#dbe7f8] bg-white text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-all hover:border-[#c9dcfb] hover:bg-[#f8fbff] hover:text-[#0f6ae8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1679ff] focus-visible:ring-offset-2 md:h-[2.7rem] md:w-[2.7rem]';

  const BookingActionTrustLine = ({ alignWithPrimaryButton = false }: { alignWithPrimaryButton?: boolean }) => {
    const trustItems = (
      <>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Check size={15} className="text-[#10b981]" strokeWidth={2.6} />
          Fixed price
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Check size={15} className="text-[#10b981]" strokeWidth={2.6} />
          On-time pickup
        </span>
      </>
    );

    if (alignWithPrimaryButton) {
      return (
        <div className="grid w-full min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-3 md:grid-cols-[2.8rem_minmax(0,1fr)]">
          <div className="col-start-2 flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[12px] font-semibold tracking-[-0.03em] text-[#4b5563] md:text-[13px]">
            {trustItems}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[12px] font-semibold tracking-[-0.03em] text-[#64748b] md:text-[14px]">
        {trustItems}
      </div>
    );
  };

  const StepIndicator = () => {
    const progressWidth = currentStep === 1 ? '33.333%' : currentStep === 2 ? '66.666%' : '100%';

    return (
      <div
        className="w-full"
        aria-label={copy.stepLabel(currentStep)}
        aria-current="step"
      >
        <p className="text-[13px] font-semibold tracking-[-0.02em] text-[#6b7280] md:text-[14px]">
          Step {currentStep} of 3
        </p>
        <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#E8EDF5]">
          <div
            className="h-full rounded-full bg-[#1679FF] transition-[width] duration-300 ease-out"
            style={{ width: progressWidth }}
          />
        </div>
      </div>
    );
  };

  const DirectionSelector = () => (
    <div className="relative mx-auto grid h-[3.45rem] w-full min-w-0 grid-cols-2 overflow-hidden rounded-[1.1rem] border border-[#e7ebf1] bg-white p-0.5 md:h-[3.45rem] md:rounded-[1.1rem]">
      {[
        { value: 'to_airport' as Direction, label: 'To Airport' },
        { value: 'from_airport' as Direction, label: 'From Airport' },
      ].map((option) => {
        const isActive = formData.direction === option.value;
        const Icon = option.value === 'from_airport' ? PlaneLanding : PlaneTakeoff;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleDirectionChange(option.value)}
            className={`relative z-[1] flex min-w-0 items-center justify-center gap-2 rounded-[0.95rem] px-3 text-[15px] font-semibold tracking-[-0.02em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2 md:px-4 md:text-[16px] ${
              isActive
                ? 'bg-[#1166d4] text-white'
                : 'bg-white text-[#374151]'
            }`}
            aria-pressed={isActive}
          >
            <Icon className="h-[16px] w-[16px] shrink-0" strokeWidth={2.2} />
            <span className="min-w-0 truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );

  const DateTimeFields = () => (
    <div className="grid grid-cols-2 gap-3 md:gap-4 md:[grid-template-columns:calc(50%_-_8px)_calc(50%_-_8px)]">
      <div className={BOOKING_FIELD_STACK_CLASS}>
        <div ref={datePickerAnchorRef} className="relative w-full">
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            className={`ui-field-surface flex h-[3.8rem] w-full items-center justify-between rounded-[1.05rem] border bg-white pl-3 pr-4 text-left outline-none transition-all md:h-[3.6rem] md:rounded-[1rem] ${
              isFieldInvalid('date')
                ? 'border-[#d70015]'
                : 'border-[#e4e6ea] shadow-[0_1px_0_rgba(255,255,255,0.55)]'
            }`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <CalendarDays className="h-[18px] w-[18px] shrink-0 text-[#1679FF]" strokeWidth={2.2} />
              <span className="min-w-0">
                <span className={`block truncate text-[17px] font-semibold leading-none ${formData.date ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
                  {formData.date || 'Date'}
                </span>
              </span>
            </span>
            <ChevronDown className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" strokeWidth={2.2} />
          </button>
          <DatePicker
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            onSelect={handleDateSelect}
            selectedDate={formData.date}
            anchorRef={datePickerAnchorRef}
          />
        </div>
      </div>
      <div className={BOOKING_FIELD_STACK_CLASS}>
        <div ref={timePickerAnchorRef} className="relative w-full">
          <button
            type="button"
            onClick={() => setIsTimePickerOpen(true)}
            className={`ui-field-surface flex h-[3.8rem] w-full items-center justify-between rounded-[1.05rem] border bg-white pl-3 pr-4 text-left outline-none transition-all md:h-[3.6rem] md:rounded-[1rem] ${
              isFieldInvalid('time')
                ? 'border-[#d70015]'
                : 'border-[#e4e6ea] shadow-[0_1px_0_rgba(255,255,255,0.55)]'
            }`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Clock3 className="h-[18px] w-[18px] shrink-0 text-[#1679FF]" strokeWidth={2.2} />
              <span className="min-w-0">
                <span className={`block truncate text-[17px] font-semibold leading-none ${formData.time ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
                  {formData.time || 'Time'}
                </span>
              </span>
            </span>
            <ChevronDown className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" strokeWidth={2.2} />
          </button>
          <TimePicker
            isOpen={isTimePickerOpen}
            onClose={() => setIsTimePickerOpen(false)}
            onSelect={handleTimeSelect}
            selectedTime={formData.time}
            selectedDate={formData.date}
            anchorRef={timePickerAnchorRef}
          />
        </div>
      </div>
    </div>
  );

  const FlightDetailsFields = () => (
    <div
      className={`grid overflow-hidden transition-[grid-template-rows,margin-top,margin-bottom] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isFlightDetailsVisible ? 'mt-4 mb-0 grid-rows-[1fr] md:mt-3' : 'mt-0 mb-0 grid-rows-[0fr]'
      }`}
      aria-hidden={!isFlightDetailsVisible}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`transition-[opacity,transform] duration-[220ms] ease-out ${
            isFlightDetailsVisible ? 'translate-y-0 opacity-100 delay-75' : '-translate-y-2 opacity-0'
          }`}
        >
        <div className={BOOKING_FIELD_STACK_CLASS}>
          <p className="block pl-0 text-[13px] font-bold uppercase tracking-[0.06em] text-[#687384] md:text-[13px]">Flight number</p>
          <div className="w-full">
            <input
              type="text"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleChange}
              onBlur={handleFlightNumberBlur}
              placeholder="e.g. OS 123"
              tabIndex={isFlightDetailsVisible ? undefined : -1}
              className={`${getInputClassName('flightNumber')} !h-[3.35rem] !rounded-[1.05rem] ${isFieldInvalid('flightNumber') ? '' : '!border-[#e4e6ea] !bg-[#f9fafb]'} !px-5 !text-[18px] !font-semibold !tracking-[0.02em] !text-[#717982] placeholder:!text-[#717982] md:!h-[3.25rem] md:!rounded-[1rem] md:!px-5 md:!text-[18px]`}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );

  const shouldShowInfoTrigger = isAppSurface && hasMounted;
  const formContentSpacingClassName = showStepIndicator
    ? 'p-5 md:px-5 md:py-3.5'
    : 'p-5 md:px-5 md:py-3.5';
  const stepContentClassName = `w-full min-w-0 max-w-full ${allowExtendedDropdownSpace ? 'overflow-visible' : 'overflow-x-clip'}`;
  const stepHeaderClassName = 'mb-4 flex justify-center md:mb-3';
  const titleHeaderClassName =
    'mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left lg:px-[8px]';
  const stepOneContent = (
    <div className={`${stepContentClassName} md:flex md:h-full md:flex-col`}>
      <div className="space-y-4 md:min-h-0 md:flex-1 md:space-y-3">
        {shouldShowStepOneRouteIntro && (
          <div className="text-center mb-6">
            <h2 className="text-[15px] font-semibold text-[#111111] leading-tight mb-2 tracking-[-0.04em]">{copy.routeTitle}</h2>
            <p className="text-[12px] text-[#6d7075]">{copy.routeDescription}</p>
          </div>
        )}
        <div className="rounded-[2.2rem] bg-transparent pt-0 shadow-none">
          <div className="min-w-0">
            {DirectionSelector()}
            <div className="mt-4 space-y-4 md:mt-4 md:space-y-4">
              <div>
                <p style={{ marginBottom: '14px' }} className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#111827] md:text-[1.75rem]">
                  {addressPlaceholder}
                </p>
                <div className={`rounded-[1.35rem] border bg-white pl-3 pr-5 py-3 transition-shadow md:pl-3 md:pr-5 md:py-3 ${isFieldInvalid('street') || isFieldInvalid('zip') ? 'border-[#d70015]' : 'border-[#c8d3e0] shadow-[0_2px_8px_rgba(17,17,17,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] hover:shadow-[0_2px_12px_rgba(17,17,17,0.1),inset_0_1px_0_rgba(255,255,255,0.65)]'}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <MapPin className="h-[18px] w-[18px] shrink-0 text-[#1679FF]" strokeWidth={2.2} />
                    <div className="relative min-w-0 flex-1">
                      <StreetAutocomplete
                        value={streetInputValue}
                        selectedOption={selectedStreetOption}
                        mobileDropdownFullWidth
                        mobileSelectedStreetOnly
                        menuItems={favoriteMenuItems}
                        onChange={(value) => clearStreetSelection('street', value)}
                        onSelect={(option) => applyStreetSelection('street', option)}
                        onPasteText={(text) => handleStreetPaste('street', text)}
                        onBlur={() => validateStreetNumber('street')}
                        placeholder={addressInputPlaceholder}
                        className="w-full border-0 bg-transparent p-0 text-[17px] font-medium tracking-[-0.02em] text-[#111111] outline-none placeholder:text-[#96a3b8] focus:outline-none md:text-[18px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p style={{ marginBottom: '10px' }} className="text-[1.1rem] font-bold leading-[1.1] tracking-[-0.04em] text-[#111827] md:text-[1.1rem]">
                  When do you need a ride?
                </p>
                {DateTimeFields()}
              </div>
              {FlightDetailsFields()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center gap-2 md:mt-0 md:pt-3">
        <div className="flex w-full items-center justify-center">
          <button
            type="button"
            onClick={nextStep}
            className={`${primaryActionButtonClass} !min-w-0 !flex-none`}
          >
            {copy.nextLabel}
          </button>
        </div>
        <BookingActionTrustLine />
      </div>
    </div>
  );
  const stepTwoContent = (
    <BookingStepTwo
      formData={formData}
      vehicleType={vehicleType}
      vehiclePriceOptions={vehiclePriceOptions}
      onVehicleUpgrade={handleVehicleUpgrade}
      onTravelDetailsConfirm={handleTravelDetailsConfirm}
      handleMeetAndGreetChange={handleMeetAndGreetChange}
      handleNotesChange={handleNotesChange}
      error={error}
      isFieldInvalid={isFieldInvalid}
      updateStepperValue={updateStepperValue}
      prevStep={prevStep}
      nextStep={nextStep}
      actionRowClass={actionRowStackedTrustClass}
      actionButtonGroupClass={actionButtonGroupClass}
      actionTrustLine={<BookingActionTrustLine alignWithPrimaryButton />}
      primaryActionButtonClass={primaryActionButtonClass}
      secondaryBackButtonClass={secondaryBackButtonClass}
    />
  );
  const stepThreeContent = (
    <BookingStepThree
      formData={formData}
      totalPrice={totalPrice}
      vehicleType={vehicleType}
      isLoggedIn={isLoggedIn}
      error={error}
      loading={loading}
      handleBookingForMyselfToggle={handleBookingForMyselfToggle}
      handleChange={handleChange}
      getInputClassName={getInputClassName}
      handlePaymentChange={handlePaymentChange}
      touched={touched}
      prevStep={prevStep}
      actionRowClass={actionRowStackedTrustClass}
      actionButtonGroupClass={actionButtonGroupClass}
      actionTrustLine={<BookingActionTrustLine alignWithPrimaryButton />}
      secondaryBackButtonClass={secondaryBackButtonClass}
      primaryActionButtonClass={primaryActionButtonClass}
    />
  );
  const activeStepContent =
    currentStep === 1 ? stepOneContent : currentStep === 2 ? stepTwoContent : stepThreeContent;

  return (
    <div
      className={`${BOOKING_FORM_CARD_CLASS} relative isolate w-full max-w-[32rem] shrink-0 ${
        fluidDesktopWidth ? 'lg:max-w-none lg:w-full' : 'md:w-[33.6rem] md:max-w-[33.6rem]'
      } ${showStepIndicator ? 'min-h-[520px]' : ''} ${shouldLockDesktopFormHeight ? 'md:flex md:h-[535px] md:flex-col' : ''} ${
        allowExtendedDropdownSpace ? 'overflow-visible' : 'overflow-x-clip overflow-y-hidden'
      }`}
    >
      {shouldShowInfoTrigger ? (
        <button
          type="button"
          aria-label="Information"
          onClick={() => setIsInfoPanelOpen(true)}
          className={`absolute z-10 inline-flex items-center justify-center text-[#1679ff] transition-colors hover:text-[#0f6ae8] ${
            isAppSurface
              ? 'right-4 top-4 md:hidden'
              : 'right-3 top-3 md:hidden'
          }`}
        >
          <Info size={22} strokeWidth={2.2} />
        </button>
      ) : null}
      <div
        className={`${allowExtendedDropdownSpace ? 'overflow-visible' : 'overflow-x-clip'} ${formContentSpacingClassName} ${
          shouldLockDesktopFormHeight ? 'md:flex md:h-full md:flex-col' : ''
        } ${allowExtendedDropdownSpace ? '' : 'pb-2 md:pb-3'}`}
      >
        <form onSubmit={handleSubmit} className={shouldLockDesktopFormHeight ? 'md:flex md:h-full md:flex-col' : undefined}>
          {headerTitle ? (
            <div className={titleHeaderClassName}>
              <p className="text-center text-[13px] font-black leading-[1.1] tracking-[-0.03em] text-[#111111] md:text-[18.2px] sm:text-left lg:pl-[6px]">
                {headerTitle}
              </p>
              {showStepIndicator ? <StepIndicator /> : null}
            </div>
          ) : showStepIndicator ? (
            <div className={stepHeaderClassName}>
              <StepIndicator />
            </div>
          ) : null}
          <div
            key={currentStep}
            className={`ui-form-mobile-transition ${
              mobileStepDirection === 'prev'
                ? 'ui-form-mobile-transition-prev'
                : 'ui-form-mobile-transition-next'
            } md:h-full`}
          >
            {activeStepContent}
          </div>
        </form>
      </div>
      {hasMounted && isErrorToastVisible && activeToastMessage ? (
        <div
          role="alert"
          aria-live="assertive"
          className="pointer-events-none absolute inset-x-0 bottom-4 z-50 flex justify-center px-4"
        >
          <div
            className={`pointer-events-auto flex max-w-[24rem] items-center gap-2.5 rounded-[0.9rem] border bg-white px-4 py-3 text-[13.5px] font-medium shadow-[0_8px_28px_rgba(17,17,17,0.13)] animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              activeToastIsError
                ? `border-[#ffd4d8] text-[#d70015] ${isLeadTimeErrorMessage(activeToastMessage) ? 'ui-error-notice-shake' : ''}`
                : 'border-[#bdd4ff] text-[#1166d4]'
            }`}
          >
            <span className={`block h-1.5 w-1.5 shrink-0 rounded-full ${activeToastIsError ? 'bg-[#d70015]' : 'bg-[#1166d4]'}`} />
            <span>{activeToastMessage}</span>
          </div>
        </div>
      ) : null}
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
                    aria-label="Back"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInfoPanelOpen(false)}
                    className="hidden md:inline-flex md:h-11 md:w-11 md:items-center md:justify-center md:rounded-full md:border md:border-[#e5e7eb] md:bg-white md:text-[#111827]"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <BookingInfoPanel
                direction={formData.direction}
                meetAndGreet={formData.meetAndGreet}
                currentStep={currentStep}
              />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BookingForm;
