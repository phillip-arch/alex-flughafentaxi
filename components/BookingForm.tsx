'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { 
  Plane, 
  PlaneLanding, 
  PlaneTakeoff, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Calendar,
  Clock,
  Car,
  Users,
  Briefcase,
  ArrowUpDown,
} from 'lucide-react';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import { determineVehicle, calculateVehiclePrice } from '@/lib/pricing';
import { BOOKING_FORM_CARD_CLASS, BOOKING_FORM_INPUT_CLASS, BOOKING_FORM_INPUT_INVALID_CLASS } from '@/lib/ui/bookingFormStyles';

import { createBooking } from '@/app/(booking)/actions';

// Types
type Direction = 'to_airport' | 'from_airport' | null;
type PaymentMethod = 'cash' | 'card' | null;

const PENDING_BOOKING_STORAGE_KEY = 'pending-booking-form';

interface FavoriteAddress {
  id: string;
  name: string;
  city: string;
  zip: string;
  street: string;
  house_number: string;
}

interface ExtendedBookingInput {
  direction: Direction;
  city: string;
  zip: string;
  street: string;
  houseNumber: string;
  extraStop: boolean;
  extraStopCity: string;
  extraStopZip: string;
  extraStopStreet: string;
  extraStopHouseNumber: string;
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

const BookingForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = supabaseBrowser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Picker States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [favoriteAddresses, setFavoriteAddresses] = useState<FavoriteAddress[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountDefaults, setAccountDefaults] = useState({ fullName: '', phone: '', email: '' });

  const [formData, setFormData] = useState<ExtendedBookingInput>({
    direction: 'to_airport',
    city: 'Wien',
    zip: '',
    street: '',
    houseNumber: '',
    extraStop: false,
    extraStopCity: 'Wien',
    extraStopZip: '',
    extraStopStreet: '',
    extraStopHouseNumber: '',
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
    const formattedAddress = `${favorite.street} ${favorite.house_number}, ${favorite.zip} ${favorite.city}`;
    setFormData((prev) => ({
      ...prev,
      city,
      zip: favorite.zip,
      street: formattedAddress,
      houseNumber: '',
    }));
    setTouched((prev) => ({
      ...prev,
      street: false,
    }));
  };

  useEffect(() => {
    let isMounted = true;

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
          .select('id, name, city, zip, street, house_number')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
      ]);

      if (!isMounted) return;

      if (Array.isArray(favoritesResult.data)) {
        setFavoriteAddresses(favoritesResult.data as FavoriteAddress[]);
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

    void loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Clear error when all required fields in the current step are filled
  useEffect(() => {
    if (!error) return;

    let allFilled = true;
    if (currentStep === 1) {
      if (!formData.direction || !formData.zip.trim() || !formData.street.trim() || !formData.houseNumber.trim()) allFilled = false;
      if (formData.direction === 'from_airport' && !formData.flightNumber.trim()) allFilled = false;
      if (formData.extraStop && (!formData.extraStopZip.trim() || !formData.extraStopStreet.trim() || !formData.extraStopHouseNumber.trim())) allFilled = false;
    } else if (currentStep === 2) {
      if (!formData.date || !formData.time || formData.passengers === '' || formData.luggage === '' || formData.handLuggage === '') {
        allFilled = false;
      } else if (error !== 'Bitte füllen Sie alle erforderlichen Felder aus.') {
        // Check if the specific time error is resolved
        const [day, month, year] = formData.date.split('.');
        const [hours, minutes] = formData.time.split(':');
        const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        const now = new Date();
        const selectedHour = selectedDate.getHours();
        const isNightTime = selectedHour >= 22 || selectedHour < 7;
        const minLeadTimeHours = isNightTime ? 8 : 3;
        const minBookingTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);
        if (selectedDate < minBookingTime) {
          allFilled = false;
        }
      }
    } else if (currentStep === 3) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.paymentMethod) allFilled = false;
    }

    if (allFilled) {
      setError(null);
    }
  }, [formData, currentStep, error]);

  // Derived state for price (mock calculation)
  const basePrice = 38;
  const extraStopPrice = formData.extraStop ? 10 : 0;
  
  // Determine vehicle type
  const passengers = typeof formData.passengers === 'number' ? formData.passengers : 0;
  const suitcases = typeof formData.luggage === 'number' ? formData.luggage : 0;
  const handLuggage = typeof formData.handLuggage === 'number' ? formData.handLuggage : 0;
  
  const vehicleType = determineVehicle(passengers, suitcases, handLuggage);
  
  // Calculate price with vehicle surcharge
  const vehiclePrice = calculateVehiclePrice(basePrice, vehicleType);
  const totalPrice = vehiclePrice + extraStopPrice;

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

  const isFieldInvalid = (name: keyof ExtendedBookingInput) => {
    const value = formData[name];
    // Check if field is touched and empty (for string fields)
    if (touched[name] && typeof value === 'string' && !value.trim()) {
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

  const toggleDirection = () => {
    const nextDirection = formData.direction === 'from_airport' ? 'to_airport' : 'from_airport';
    handleDirectionChange(nextDirection);
  };

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

  const nextStep = () => {
    // Validation logic for each step
    let isValid = true;
    const fieldsToValidate: (keyof ExtendedBookingInput)[] = [];

    let errorMessage: string | null = null;

    if (currentStep === 1) {
      if (!formData.direction) {
        isValid = false;
      }
      fieldsToValidate.push('street');
      if (formData.extraStop) {
        fieldsToValidate.push('extraStopStreet');
      }
    } else if (currentStep === 2) {
      fieldsToValidate.push('date', 'time', 'passengers', 'luggage', 'handLuggage');
      if (formData.direction === 'from_airport') {
        fieldsToValidate.push('flightNumber');
      }
      
      // Validate minimum booking time
      if (formData.date && formData.time) {
        const [day, month, year] = formData.date.split('.');
        const [hours, minutes] = formData.time.split(':');
        
        // Create date object for selected time
        const selectedDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        );
        
        const now = new Date();
        const selectedHour = selectedDate.getHours();
        
        // Determine minimum lead time based on time of day
        // Night/Early Morning (22:00 - 07:00): 8 hours
        // Day (07:00 - 22:00): 3 hours
        const isNightTime = selectedHour >= 22 || selectedHour < 7;
        const minLeadTimeHours = isNightTime ? 8 : 3;
        
        const minBookingTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);

        if (selectedDate < minBookingTime) {
          isValid = false;
          if (isNightTime) {
            errorMessage = 'Für Fahrten zwischen 22:00 und 07:00 Uhr ist eine Vorlaufzeit von 8 Stunden erforderlich.';
          } else {
            errorMessage = 'Kurzfristige Buchungen sind nur bis 3 Stunden vor Abholung möglich.';
          }
        }
      }
    }

    // Check if any required field is empty
    fieldsToValidate.forEach(field => {
      const value = formData[field];
      if ((typeof value === 'string' && !value.trim()) || value === '') {
        isValid = false;
        if (!errorMessage) {
            errorMessage = 'Bitte füllen Sie alle erforderlichen Felder aus.';
        }
      }
    });

    if (!isValid) {
      // Mark only missing/invalid fields as touched
      const newTouched = { ...touched };
      fieldsToValidate.forEach(field => {
        const value = formData[field];
        if ((typeof value === 'string' && !value.trim()) || value === '') {
          newTouched[field] = true;
        }
      });
      
      // If we have a specific error message (like timing), ensure date/time are touched
      if (errorMessage && errorMessage !== 'Bitte füllen Sie alle erforderlichen Felder aus.' && currentStep === 2) {
        newTouched['date'] = true;
        newTouched['time'] = true;
      }
      
      // If direction is missing in step 1, mark it as touched
      if (currentStep === 1 && !formData.direction) {
        newTouched['direction'] = true;
        errorMessage = errorMessage || 'Bitte füllen Sie alle erforderlichen Felder aus.';
      }

      setTouched(newTouched);
      setError(errorMessage || 'Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    setError(null);
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
              houseNumber: formData.houseNumber,
              extraStop: formData.extraStop,
              extraStopCity: formData.extraStopCity,
              extraStopZip: formData.extraStopZip,
              extraStopStreet: formData.extraStopStreet,
              extraStopHouseNumber: formData.extraStopHouseNumber,
            },
          }),
        );
      }

      router.push(isLoggedIn ? '/account?tab=buchen' : '/book');
      return;
    }

    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not on the last step, treat submit as "Next"
    if (currentStep < 3) {
      nextStep();
      return;
    }
    
    // Validate Step 3 fields
    const step3Fields: (keyof ExtendedBookingInput)[] = ['fullName', 'email', 'phone', 'paymentMethod'];
    let isValid = true;
    
    step3Fields.forEach(field => {
      const value = formData[field];
      if ((typeof value === 'string' && !value.trim()) || value === null) {
        isValid = false;
      }
    });

    if (!isValid) {
      const newTouched = { ...touched };
      step3Fields.forEach(field => {
        const value = formData[field];
        if ((typeof value === 'string' && !value.trim()) || value === null) {
          newTouched[field] = true;
        }
      });
      setTouched(newTouched);
      setError('Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construct the pickup/destination strings based on direction
      const addressString = formData.street.trim();
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
               (formData.childSeat ? ` (Kindersitze: ${formData.babySeats > 0 ? `${formData.babySeats}x Babyschale ` : ''}${formData.childSeats > 0 ? `${formData.childSeats}x Kindersitz ` : ''}${formData.boosterSeats > 0 ? `${formData.boosterSeats}x Sitzerhöhung` : ''})` : '') + 
               (formData.extraStop ? ` (Zwischenstopp: ${formData.extraStopStreet})` : '') +
               (formData.flightNumber ? ` (Flugnummer: ${formData.flightNumber})` : '') +
               (formData.handLuggage !== '' && formData.handLuggage > 0 ? ` (Handgepäck: ${formData.handLuggage})` : '') +
               (formData.paymentMethod ? ` (Zahlung: ${formData.paymentMethod === 'cash' ? 'Barzahlung' : 'Kreditkarte'})` : ''),
        _zip: formData.zip,
        _extraStop: formData.extraStop,
      };

      // 1. Validate (Basic check)
      if (!formData.fullName || !formData.email || !formData.phone) {
        throw new Error('Bitte füllen Sie alle Kontaktfelder aus.');
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

  // Helper for step indicator
  const StepIndicator = () => (
    <div className="flex flex-col items-center mb-10">
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className={`h-1 w-8 rounded-full transition-all duration-300 ${
              currentStep >= step ? 'bg-[#111111]' : 'bg-[#d7d3ca]'
            }`} 
          />
        ))}
      </div>
      <span className="text-[10px] font-medium text-[#6d7075] uppercase tracking-wide">
        Schritt {currentStep} von 3
      </span>
    </div>
  );

  return (
    <div className={`${BOOKING_FORM_CARD_CLASS} max-w-[580px] relative overflow-hidden`}>
      <div className="px-2 pb-2 pt-2 md:px-4 md:pb-3 md:pt-3">
        <form onSubmit={handleSubmit}>
          {/* STEP 1: LOCATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="rounded-[2.2rem] bg-transparent p-3 shadow-none">
                <div className="flex gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-4">
                      <div className={`mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${formData.direction === 'from_airport' ? 'bg-[#111111] text-white' : 'bg-[#111111] text-white'}`}>
                        {formData.direction === 'from_airport' ? <PlaneLanding size={11} /> : <MapPin size={11} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium text-[#5f6975]">Abholung</p>
                        {formData.direction === 'from_airport' ? (
                          <div className="mt-1 flex min-h-[2.75rem] items-center">
                            <p className="text-[16px] font-semibold tracking-[-0.03em] text-[#111111]">
                              Flughafen Wien (VIE)
                            </p>
                          </div>
                        ) : null}
                        {formData.direction !== 'from_airport' ? (
                          <div className="mt-1 min-h-[2.75rem] space-y-2">
                            {isLoggedIn && favoriteAddresses.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                {favoriteAddresses.map((favorite) => (
                                  <button
                                    key={favorite.id}
                                    type="button"
                                    onClick={() => applyFavoriteAddress(favorite)}
                                  className="rounded-full border border-[#d9d4c8] bg-[#f8f6f0] px-3 py-1.5 text-[11px] font-medium text-[#111111] transition-colors hover:bg-white"
                                  >
                                    {favorite.name}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Adresse eingeben"
                          className={getInputClassName('street')}
                        />
                        {formData.extraStop ? (
                          <div className="space-y-3 rounded-[1.5rem] border border-[#ddd8cd] bg-[#f6f3ec] p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6d7075]">Zusatzstopp</p>
                              <p className="mt-1 text-[12px] text-[#6d7075]">+10 EUR Aufpreis fuer eine weitere Adresse.</p>
                            </div>

                            <input
                              type="text"
                              name="extraStopStreet"
                              value={formData.extraStopStreet}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Zusatzadresse eingeben"
                              className={getInputClassName('extraStopStreet')}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                    <div className="ml-0 mt-1 flex h-8 w-12 justify-center">
                      <div className="h-full w-px border-l border-dashed border-[#b9b6ad]" />
                    </div>

                    <div className="mt-1 flex items-start gap-4">
                      <div className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] text-white shadow-[0_10px_24px_rgba(10,99,255,0.3)]">
                        <Check size={11} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium text-[#5f6975]">Ziel</p>
                        {formData.direction === 'from_airport' ? (
                          <div className="mt-1 min-h-[2.75rem] space-y-2">
                            {isLoggedIn && favoriteAddresses.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                {favoriteAddresses.map((favorite) => (
                                  <button
                                    key={favorite.id}
                                    type="button"
                                    onClick={() => applyFavoriteAddress(favorite)}
                                  className="rounded-full border border-[#d9d4c8] bg-[#f8f6f0] px-3 py-1.5 text-[11px] font-medium text-[#111111] transition-colors hover:bg-white"
                                  >
                                    {favorite.name}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                            <input
                              type="text"
                              name="street"
                              value={formData.street}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Adresse eingeben"
                              className={getInputClassName('street')}
                            />
                            {formData.extraStop ? (
                              <div className="space-y-3 rounded-[1.5rem] border border-[#ddd8cd] bg-[#f6f3ec] p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6d7075]">Zusatzstopp</p>
                                  <p className="mt-1 text-[12px] text-[#6d7075]">+10 EUR Aufpreis fuer eine weitere Adresse.</p>
                                </div>

                                <input
                                  type="text"
                                  name="extraStopStreet"
                                  value={formData.extraStopStreet}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="Zusatzadresse eingeben"
                                  className={getInputClassName('extraStopStreet')}
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-1 flex min-h-[2.75rem] items-center">
                            <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#111111]">
                              Flughafen Wien (VIE)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col justify-start gap-3 pt-8">
                    <button
                      type="button"
                      onClick={toggleDirection}
                      className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-opacity hover:opacity-60"
                      aria-label="Abholung und Ziel tauschen"
                    >
                      <ArrowUpDown size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Address Fields */}
              <div className="hidden space-y-4">
                {formData.direction === 'from_airport' && (
                  <div className="mb-1">
                    <input
                      type="text"
                      name="flightNumber"
                      value={formData.flightNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Flugnummer (z.B. OS123)"
                      className={getInputClassName('flightNumber')}
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide ml-1">
                    {formData.direction === 'to_airport' ? 'Abholadresse' : (formData.direction === 'from_airport' ? 'Zieladresse' : 'Adresse')}
                  </p>
                  {isLoggedIn && favoriteAddresses.length > 0
                    ? favoriteAddresses.map((favorite) => (
                        <button
                          key={favorite.id}
                          type="button"
                          onClick={() => applyFavoriteAddress(favorite)}
                          className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:border-[#86868b]"
                        >
                          {favorite.name}
                        </button>
                      ))
                    : null}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 relative">
                     <select 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-3 rounded-xl bg-white border text-[#1d1d1f] text-[17px] outline-none appearance-none transition-all ${
                        isFieldInvalid('city') 
                          ? 'border-[#d70015] focus:border-[#d70015] focus:ring-1 focus:ring-[#d70015]' 
                          : 'border-[#d2d2d7] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]'
                      }`}
                    >
                      <option value="Wien">Wien</option>
                      <option value="Schwechat">Schwechat</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="PLZ"
                      className={getInputClassName('zip')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Straße"
                      className={getInputClassName('street')}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="houseNumber"
                      value={formData.houseNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nr."
                      className={getInputClassName('houseNumber')}
                    />
                  </div>
                </div>
              </div>

              {/* Extra Stop Toggle */}
              <div className="hidden items-center justify-between p-4 bg-[#f5f5f7] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-[#1d1d1f]">
                    <p className="font-medium text-[15px]">Zusätzlicher Stopp?</p>
                    <p className="text-[13px] text-[#86868b]">+10 € Aufpreis</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="extraStop"
                    checked={formData.extraStop}
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:shadow-sm after:transition-all peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)]"></div>
                </label>
              </div>

              {/* Extra Stop Address Fields */}
              {formData.extraStop && (
                <div className="hidden space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide ml-1 mt-2">
                    Adresse Zwischenstopp
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 relative">
                       <select 
                        name="extraStopCity"
                        value={formData.extraStopCity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-3 rounded-xl bg-white border text-[#1d1d1f] text-[17px] outline-none appearance-none transition-all ${
                          isFieldInvalid('extraStopCity') 
                            ? 'border-[#d70015] focus:border-[#d70015] focus:ring-1 focus:ring-[#d70015]' 
                            : 'border-[#d2d2d7] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]'
                        }`}
                      >
                        <option value="Wien">Wien</option>
                        <option value="Schwechat">Schwechat</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="extraStopZip"
                        value={formData.extraStopZip}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="PLZ"
                        className={getInputClassName('extraStopZip')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <input
                        type="text"
                        name="extraStopStreet"
                        value={formData.extraStopStreet}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Straße"
                        className={getInputClassName('extraStopStreet')}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="extraStopHouseNumber"
                        value={formData.extraStopHouseNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nr."
                        className={getInputClassName('extraStopHouseNumber')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8]">
                  <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={nextStep}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] py-5 text-[17px] font-medium text-white transition-all hover:bg-[#232325]"
              >
                Weiter
              </button>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-[32px] font-semibold text-[#111111] leading-tight mb-2 tracking-[-0.04em]">Wann?</h2>
                <p className="text-[17px] text-[#6d7075]">Datum und Uhrzeit wählen.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wide text-[#6d7075] mb-2 ml-1">Datum</label>
                  <div className="relative" onClick={() => setIsDatePickerOpen(true)}>
                    <input
                      type="text"
                      name="date"
                      value={formData.date}
                      readOnly
                      placeholder="TT.MM.JJJJ"
                      className={`w-full p-3 rounded-xl bg-white border text-[#1d1d1f] text-[17px] outline-none transition-all cursor-pointer ${
                        isFieldInvalid('date') 
                          ? 'border-[#d70015] focus:border-[#d70015] focus:ring-1 focus:ring-[#d70015] placeholder:text-[#d70015]/60' 
                          : 'border-[#d8d4ca] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10'
                      }`}
                    />
                    <Calendar className={`absolute right-4 top-1/2 -translate-y-1/2 ${isFieldInvalid('date') ? 'text-[#d70015]' : 'text-[#6d7075]'}`} size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wide text-[#6d7075] mb-2 ml-1">Zeit</label>
                  <div className="relative" onClick={() => setIsTimePickerOpen(true)}>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      readOnly
                      placeholder="--:--"
                      className={`w-full p-3 rounded-xl bg-white border text-[#1d1d1f] text-[17px] outline-none transition-all cursor-pointer ${
                        isFieldInvalid('time') 
                          ? 'border-[#d70015] focus:border-[#d70015] focus:ring-1 focus:ring-[#d70015] placeholder:text-[#d70015]/60' 
                          : 'border-[#d8d4ca] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10'
                      }`}
                    />
                    <Clock className={`absolute right-4 top-1/2 -translate-y-1/2 ${isFieldInvalid('time') ? 'text-[#d70015]' : 'text-[#6d7075]'}`} size={20} />
                  </div>
                </div>
              </div>

              <DatePicker 
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onSelect={handleDateSelect}
                selectedDate={formData.date}
              />

              <TimePicker 
                isOpen={isTimePickerOpen}
                onClose={() => setIsTimePickerOpen(false)}
                onSelect={handleTimeSelect}
                selectedTime={formData.time}
              />

              {formData.direction === 'from_airport' && (
                <div className="rounded-[1.75rem] border border-[#dad5ca] bg-white p-5">
                  <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#6d7075]">Flugdetails</p>
                  <input
                    type="text"
                    name="flightNumber"
                    value={formData.flightNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Flugnummer (z.B. OS123)"
                    className={getInputClassName('flightNumber')}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#f5f5f7] p-5 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <span className="text-[13px] font-medium text-[#86868b] uppercase">Personen</span>
                  <div className="relative w-full">
                    <select
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleChange}
                      className={`bg-transparent font-semibold text-[24px] text-[#1d1d1f] outline-none text-center w-full appearance-none z-10 relative ${formData.passengers === '' ? 'text-[#86868b]' : ''}`}
                    >
                      <option value="" disabled>--</option>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-[#f5f5f7] p-5 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <span className="text-[13px] font-medium text-[#86868b] uppercase">Koffer</span>
                  <div className="relative w-full">
                    <select
                      name="luggage"
                      value={formData.luggage}
                      onChange={handleChange}
                      className={`bg-transparent font-semibold text-[24px] text-[#1d1d1f] outline-none text-center w-full appearance-none z-10 relative ${formData.luggage === '' ? 'text-[#86868b]' : ''}`}
                    >
                      <option value="" disabled>--</option>
                      {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-[#f5f5f7] p-5 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <span className="text-[13px] font-medium text-[#86868b] uppercase">Handgepäck</span>
                  <div className="relative w-full">
                    <select
                      name="handLuggage"
                      value={formData.handLuggage}
                      onChange={handleChange}
                      className={`bg-transparent font-semibold text-[24px] text-[#1d1d1f] outline-none text-center w-full appearance-none z-10 relative ${formData.handLuggage === '' ? 'text-[#86868b]' : ''}`}
                    >
                      <option value="" disabled>--</option>
                      {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Child Seat Toggle */}
              <div className="flex flex-col gap-4 p-5 bg-[#f5f5f7] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-[#1d1d1f]">
                      <p className="font-medium text-[15px]">Kindersitz benötigt?</p>
                      <p className="text-[13px] text-[#86868b]">Kostenlos inklusive</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="childSeat"
                      checked={formData.childSeat}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:shadow-sm after:transition-all peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)]"></div>
                  </label>
                </div>

                {formData.childSeat && (
                  <div className="grid grid-cols-3 gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-[#d2d2d7]/30">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#86868b] uppercase">Babyschale</label>
                      <div className="relative">
                        <select
                          name="babySeats"
                          value={formData.babySeats}
                          onChange={handleChange}
                          className="w-full p-2 rounded-lg bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[15px] outline-none appearance-none"
                        >
                          {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#86868b] uppercase">Kindersitz</label>
                      <div className="relative">
                        <select
                          name="childSeats"
                          value={formData.childSeats}
                          onChange={handleChange}
                          className="w-full p-2 rounded-lg bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[15px] outline-none appearance-none"
                        >
                          {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#86868b] uppercase">Sitzerhöhung</label>
                      <div className="relative">
                        <select
                          name="boosterSeats"
                          value={formData.boosterSeats}
                          onChange={handleChange}
                          className="w-full p-2 rounded-lg bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[15px] outline-none appearance-none"
                        >
                          {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8]">
                  <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ece7dd] text-[#111111] transition-colors hover:bg-[#e2dccf]"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 rounded-full bg-[#111111] py-3 text-[17px] font-medium text-white transition-all hover:bg-[#232325] flex items-center justify-center gap-2"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-4">
                <h2 className="text-[32px] font-semibold text-[#111111] leading-tight mb-2 tracking-[-0.04em]">Übersicht</h2>
                <p className="text-[17px] text-[#6d7075]">Bitte überprüfen Sie Ihre Daten.</p>
              </div>

              {/* Price Card - Apple Style Summary */}
              <div className="bg-[#f5f5f7] rounded-[24px] p-6 md:p-8 text-center">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#86868b] mb-2">Gesamtpreis</p>
                <p className="text-[48px] font-semibold text-[#1d1d1f] leading-none mb-4 tracking-tight">{totalPrice} €</p>
                
                <div className="flex items-center justify-center gap-2 text-[14px] font-medium text-[#1d1d1f] mb-6">
                  {formData.direction === 'to_airport' ? (
                    <>
                      <span>{formData.zip} {formData.city}</span>
                      <ChevronRight size={14} className="text-[#86868b]" />
                      <span>Flughafen VIE</span>
                    </>
                  ) : (
                    <>
                      <span>Flughafen VIE</span>
                      <ChevronRight size={14} className="text-[#86868b]" />
                      <span>{formData.zip} {formData.city}</span>
                    </>
                  )}
                </div>

                {/* Vehicle Info Card */}
                <div className="bg-white rounded-[16px] p-4 border border-[#d2d2d7]/50 shadow-sm max-w-[320px] mx-auto">
                  <div className="flex items-center justify-center gap-2 text-[#1d1d1f] font-semibold mb-3">
                    <Car size={18} className="text-[#0071e3]" />
                    <span>Fahrzeug: {vehicleType}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-[#86868b] font-medium">
                    <div className="flex items-center gap-1.5" title="Personen">
                      <Users size={16} />
                      <span>{formData.passengers || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Koffer">
                      <Briefcase size={16} />
                      <span>{formData.luggage || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Handgepäck">
                      <Briefcase size={14} className="opacity-70" />
                      <span>{formData.handLuggage || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              {isLoggedIn ? (
                <div className="flex flex-col gap-4 p-5 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-[#1d1d1f]">
                        <p className="font-medium text-[15px]">Buchung fuer mich</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.bookingForMyself}
                        onChange={(e) => handleBookingForMyselfToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:shadow-sm after:transition-all peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)]"></div>
                    </label>
                  </div>
                </div>
              ) : null}

              {/* Personal Details */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Name"
                    className={getInputClassName('fullName')}
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Telefonnummer"
                    className={getInputClassName('phone')}
                  />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="E-Mail"
                    className={getInputClassName('email')}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide mb-3 ml-1">Zahlung</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handlePaymentChange('cash')}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 ${
                      formData.paymentMethod === 'cash' 
                        ? 'border-[#0a63ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]' 
                        : touched['paymentMethod'] && !formData.paymentMethod
                          ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                          : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
                    }`}
                  >
                    <span className="text-[14px] font-medium">Barzahlung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentChange('card')}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 ${
                      formData.paymentMethod === 'card' 
                        ? 'border-[#0071e3] bg-[#f2fcfc] text-[#0071e3]' 
                        : touched['paymentMethod'] && !formData.paymentMethod
                          ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                          : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
                    }`}
                  >
                    <span className="text-[14px] font-medium">Kreditkarte</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="relative">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Anmerkungen (optional)"
                  className="w-full p-3 rounded-xl bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[17px] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] outline-none resize-none transition-all"
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8]">
                  <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ece7dd] text-[#111111] transition-colors hover:bg-[#e2dccf]"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-[#111111] py-3 text-[17px] font-medium text-white transition-all hover:bg-[#232325] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Wird gebucht...' : 'Kostenpflichtig buchen'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
