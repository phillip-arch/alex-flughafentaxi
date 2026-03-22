'use client';

import { useState, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Car, Users, BarChart3, Calendar, Search,
  MapPin, Clock, CreditCard, ChevronDown, ChevronLeft, ChevronRight,
  Edit, Trash2, CheckCircle, XCircle, X, Star, Plus, Menu, LogOut,
  PlaneTakeoff, PlaneLanding, Briefcase, Phone, Mail, Send, Plane, FileText,
  LayoutGrid, Rows3
} from 'lucide-react';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import { 
  fetchBookings, fetchDrivers, addDriver, deleteDriver, 
  updateBookingStatus, updateBookingDetails, assignDriver, fetchStats, fetchPassengerCountsBatch 
} from './actions';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { BOOKING_FORM_CARD_CLASS, BOOKING_FORM_INPUT_CLASS } from '@/lib/ui/bookingFormStyles';
import { composeBookingNotes, parseBookingNotes } from '@/lib/booking/notes';
import UnderlineTabNav from '@/components/ui/UnderlineTabNav';
import { APP_HEADER_CLASS, APP_PAGE_BG_CLASS } from '@/components/ui/sharedStyles';

export default function AdminDashboardClient({ userEmail }: { userEmail: string }) {
  const AIRPORT_LABEL = 'Flughafen Wien (VIE)';
  const adminPrimaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-4 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#232325] disabled:cursor-not-allowed disabled:opacity-50';
  const adminSecondaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] border border-[#dbe7f8] bg-white px-8 py-4 text-[1.0625rem] font-medium leading-none tracking-normal text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]';
  const adminDangerButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] border border-[#f1d1d6] bg-white px-4 py-3 text-[0.95rem] font-medium text-[#d70015] transition-colors hover:bg-[#fff4f6]';
  const adminEditMetaCardClass =
    'rounded-[1.35rem] border border-[#e9edf3] bg-[#f8fbff] px-4 py-4';
  const adminEditSectionLabelClass =
    'ml-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]';
  const adminEditChoiceCardBaseClass =
    'flex flex-col items-center justify-center gap-3 rounded-[1.35rem] border bg-white py-6 transition-colors';
  const adminEditSelectClass =
    'ui-input appearance-none bg-white pr-10';
  const adminEditMetricCardClass =
    'rounded-[1.35rem] border border-[#e9edf3] bg-[#f8fbff] px-4 py-4';
  const adminEditMetricSelectClass =
    'w-full appearance-none bg-transparent text-center text-[1.5rem] font-semibold text-[#111827] outline-none';
  const adminIconCloseButtonClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eef2f7] bg-white text-[#8a96a3] transition-colors hover:border-[#f3d8dd] hover:bg-[#fff4f6] hover:text-[#d70015]';
  const [currentTab, setCurrentTab] = useState<'rides' | 'drivers' | 'stats'>('rides');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bookings, setBookings] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [passengerCounts, setPassengerCounts] = useState<Record<string, number>>({});
  const [ridesCache, setRidesCache] = useState<Record<string, { bookings: any[]; passengerCounts: Record<string, number> }>>({});
  const [driverSelection, setDriverSelection] = useState<Record<string, string>>({});
  const [driversLoaded, setDriversLoaded] = useState(false);
  const [statsCache, setStatsCache] = useState<Record<string, any[]>>({});
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [editDirection, setEditDirection] = useState<'to_airport' | 'from_airport' | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editExtraStop, setEditExtraStop] = useState(false);
  const [editExtraStopAddress, setEditExtraStopAddress] = useState('');
  const [editChildSeat, setEditChildSeat] = useState(false);
  const [editBabySeats, setEditBabySeats] = useState(0);
  const [editChildSeats, setEditChildSeats] = useState(0);
  const [editBoosterSeats, setEditBoosterSeats] = useState(0);
  const [editPaymentMethod, setEditPaymentMethod] = useState<'cash' | 'card' | 'voucher' | 'free' | null>(null);
  const [editFlightNumber, setEditFlightNumber] = useState('');
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false);
  const [isEditTimePickerOpen, setIsEditTimePickerOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editHandLuggage, setEditHandLuggage] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);
  const [notesPopup, setNotesPopup] = useState<{ open: boolean; text: string }>({ open: false, text: '' });
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    id: '',
    full_name: '',
    email: '',
    phone: '',
    pickup: '',
    destination: '',
    pickup_at: '',
    passengers: 1,
    luggage: 0,
    price: 0,
    vehicle_type: '',
    notes: '',
    status: 'pending',
  });

  // Stats filters
  const [statsRange, setStatsRange] = useState('30'); // days
  const [statsPaymentFilter, setStatsPaymentFilter] = useState<'all' | 'cash' | 'card'>('all');
  const [statsDriverFilter, setStatsDriverFilter] = useState('all');

  const shiftRidesDate = (dayOffset: number) => {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    parsed.setDate(parsed.getDate() + dayOffset);
    const nextDate = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    setDate(nextDate);
  };

  const isCancelledBooking = (status?: string) => status === 'cancelled' || status === 'canceled';

  const getDriverSelectTone = (booking: any) => {
    if (booking?.status === 'confirmed') {
      return 'border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.08)_0%,rgba(36,144,255,0.14)_100%)] text-[#0a63ff]';
    }
    const waitingDriverConfirmation =
      booking?.status === 'pending' && Boolean(booking?.driver_id) && Boolean(booking?.confirm_token);
    if (waitingDriverConfirmation) {
      return 'border-orange-400 bg-orange-50 text-orange-900';
    }
    return 'border-[#cfd7e3] bg-white text-[#1d1d1f]';
  };

  const getSelectedDriverId = (booking: any) => {
    return driverSelection[booking.id] ?? booking.driver_id ?? '';
  };

  const getBookingPaymentMeta = (booking: any) => {
    const direct = String(booking?.payment_method || '').toLowerCase();
    const notes = String(booking?.notes || '').toLowerCase();
    const notesPayment = notes.match(/\(zahlung:\s*([^)]+)\)/i)?.[1]?.toLowerCase() || '';
    const source = `${direct} ${notesPayment}`.trim();

    const isCard = source.includes('kredit') || source.includes('card') || source.includes('karte');
    const isCash = source.includes('bar') || source.includes('cash');
    const isVoucher = source.includes('lieferschein') || source.includes('voucher');
    const isFree = source.includes('gratis') || source.includes('free');

    if (isCard) {
      return {
        label: 'KARTE',
        className: 'bg-[#e8f2ff] text-[#0071e3]',
      };
    }
    if (isCash) {
      return {
        label: 'BAR',
        className: 'bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]',
      };
    }
    if (isVoucher) {
      return {
        label: 'LIEFERSCHEIN',
        className: 'bg-[#f3f7ff] text-[#2759b8]',
      };
    }
    if (isFree) {
      return {
        label: 'GRATIS',
        className: 'bg-[#edf8f0] text-[#1f7a38]',
      };
    }
    return {
      label: 'BAR',
      className: 'bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]',
    };
  };

  const getFlightNumberFromNotes = (booking: any) => {
    return String(booking?.notes || '').match(/\(Flugnummer:\s*([^)]+)\)/i)?.[1]?.trim() || '';
  };

  const formatRideLocation = (booking: any, value: string, role: 'pickup' | 'destination') => {
    const raw = String(value || '');
    const isAirport = /flughafen\s*wien\s*\(vie\)/i.test(raw) || /^vie$/i.test(raw.trim());
    if (!isAirport) return raw;

    return 'Flughafen Wien';
  };

  const formatTableRouteAddress = (booking: any, value: string, role: 'pickup' | 'destination') => {
    const display = formatRideLocation(booking, value, role);
    // Keep airport labels as-is.
    if (/flughafen/i.test(display) || /^vie(?:\s*,.*)?$/i.test(display.trim())) return display;

    // Convert "Street Nr, 1010 Wien" -> "1010 Wien, Street Nr" (table view only)
    const match = display.match(/^(.*?),\s*(\d{3,6})\s+(.+)$/);
    if (!match) return display;

    const street = match[1].trim();
    const zip = match[2].trim();
    const city = match[3].trim();
    return `${zip} ${city}, ${street}`;
  };

  const isAirportLocation = (value: string) => {
    const raw = String(value || '').trim();
    return /flughafen\s*wien\s*\(vie\)/i.test(raw) || /^vie(?:\s*,.*)?$/i.test(raw);
  };

  const getGoogleMapsUrl = (value: string) => {
    const query = String(value || '').trim();
    if (!query) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getTelHref = (value: string) => {
    const normalized = String(value || '').replace(/[^\d+]/g, '');
    return normalized ? `tel:${normalized}` : '#';
  };

  const getMailtoHref = (value: string) => {
    const email = String(value || '').trim();
    return email ? `mailto:${email}` : '#';
  };

  const formatPriceDisplay = (value: unknown) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0.00 €';
    return `${new Intl.NumberFormat('de-AT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)} €`;
  };

  const getBookingDisplayNotes = (booking: any) => parseBookingNotes(booking?.notes).cleanedNotes;

  const getChildSeatCountsFromNotes = (booking: any) => parseBookingNotes(booking?.notes).childSeatCounts;

  const getHandLuggageCountFromNotes = (booking: any) => parseBookingNotes(booking?.notes).handLuggageCount;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const view = params.get('view');
    setCurrentTab(tab === 'drivers' || tab === 'stats' ? tab : 'rides');
    setViewMode(view === 'table' ? 'table' : 'grid');
  }, []);

  useEffect(() => {
    loadData();
  }, [currentTab, date, statsRange]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('tab', currentTab);
    if (currentTab === 'rides') {
      params.set('view', viewMode);
    } else {
      params.delete('view');
    }
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [currentTab, viewMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      const view = params.get('view');
      setCurrentTab(tab === 'drivers' || tab === 'stats' ? tab : 'rides');
      setViewMode(view === 'table' ? 'table' : 'grid');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  async function loadData() {
    try {
      if (currentTab === 'rides') {
        const cachedRides = ridesCache[date];
        if (cachedRides) {
          setBookings(cachedRides.bookings);
          setPassengerCounts(cachedRides.passengerCounts);
        } else {
          setLoading(true);
          const dataPromise = fetchBookings(date);
          const driversPromise = !driversLoaded ? fetchDrivers() : Promise.resolve(drivers);
          const [data, driversData] = await Promise.all([dataPromise, driversPromise]);

          setBookings(data || []);
          if (!driversLoaded) {
            setDrivers(driversData || []);
            setDriversLoaded(true);
          }

          const uniqueEmails = Array.from(new Set((data || []).map((b: any) => b.email).filter(Boolean)));
          const counts = await fetchPassengerCountsBatch(uniqueEmails);

          setPassengerCounts(counts);
          setRidesCache((prev) => ({
            ...prev,
            [date]: { bookings: data || [], passengerCounts: counts },
          }));
        }
      } else if (currentTab === 'drivers') {
        if (!driversLoaded) {
          setLoading(true);
          const driversData = await fetchDrivers();
          setDrivers(driversData || []);
          setDriversLoaded(true);
        }
      } else if (currentTab === 'stats') {
        const cachedStats = statsCache[statsRange];
        if (cachedStats) {
          setStatsData(cachedStats);
        } else {
          setLoading(true);
          const now = new Date();
          const end = endOfDay(now).toISOString();
          const start =
            statsRange === 'today'
              ? startOfDay(now).toISOString()
              : startOfDay(subDays(now, parseInt(statsRange, 10))).toISOString();
          const data = await fetchStats(start, end);
          const nextStats = data || [];
          setStatsData(nextStats);
          setStatsCache((prev) => ({ ...prev, [statsRange]: nextStats }));
        }
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab === 'drivers' || tab === 'stats' ? tab : 'rides');
    setMobileTabsOpen(false);
  };

  const handleAssignDriver = async (bookingId: string, driverId: string, sendEmail = false) => {
    try {
      if (!driverId) return false;
      const res = await assignDriver(bookingId, driverId, sendEmail);
      if ((res as any)?.error) {
        alert(`Failed to assign driver: ${(res as any).error}`);
        return false;
      }
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                driver_id: driverId,
                ...(sendEmail ? { status: 'pending' } : {}),
                ...(sendEmail ? { confirm_token: b.confirm_token || '__PENDING_DRIVER_CONFIRM__' } : {}),
              }
            : b
        )
      );
      setRidesCache((prev) => {
        const cached = prev[date];
        if (!cached) return prev;
        return {
          ...prev,
          [date]: {
            ...cached,
            bookings: cached.bookings.map((b) =>
              b.id === bookingId
                ? {
                    ...b,
                    driver_id: driverId,
                    ...(sendEmail ? { status: 'pending' } : {}),
                    ...(sendEmail ? { confirm_token: b.confirm_token || '__PENDING_DRIVER_CONFIRM__' } : {}),
                  }
                : b
            ),
          },
        };
      });
      setStatsCache({});
      setDriverSelection((prev) => {
        if (!(bookingId in prev)) return prev;
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
      return true;
    } catch (error) {
      console.error('handleAssignDriver failed:', error);
      alert('Fahrer konnte nicht zugewiesen werden: Serverfehler. Bitte erneut versuchen.');
      return false;
    }
  };

  const confirmAndSendToDriver = async (bookingId: string, driverId: string) => {
    if (!driverId) return;
    if (confirm('Möchten Sie jetzt an diesen Fahrer senden?')) {
      const success = await handleAssignDriver(bookingId, driverId, true);
      if (success) {
        alert('Buchung wurde erfolgreich an den Fahrer gesendet.');
      }
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      const res = await updateBookingStatus(bookingId, status);
      if ((res as any)?.error) {
        alert(`Fahrt konnte nicht aktualisiert werden: ${(res as any).error}`);
        return;
      }
      const nextStatus = (res as any)?.status || status;
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b)));
      setRidesCache((prev) => {
        const cached = prev[date];
        if (!cached) return prev;
        return {
          ...prev,
          [date]: {
            ...cached,
            bookings: cached.bookings.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b)),
          },
        };
      });
      setStatsCache({});
    } catch (error) {
      console.error('handleStatusChange failed:', error);
      alert('Fahrt konnte nicht aktualisiert werden: Serverfehler. Bitte erneut versuchen.');
    }
  };

  const handleAddDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. Capture form element immediately (before await)
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // 2. Perform server action
      const res = await addDriver(formData);

      // 3. Handle server-side errors
      if (res && 'error' in res && res.error) {
        alert(`Fehler beim Hinzufügen des Fahrers: ${res.error}`);
        return;
      }

      // 4. Safely reset form using captured reference
      if (form && typeof form.reset === 'function') {
        form.reset();
      }
      
      // 5. Refresh data
      setDriversLoaded(false);
      setRidesCache({});
      setStatsCache({});
      await loadData();
    } catch (err) {
      console.error('Unexpected error adding driver:', err);
      alert('Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.');
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (confirm('Möchten Sie diesen Fahrer wirklich löschen?')) {
      await deleteDriver(id);
      setDriversLoaded(false);
      setRidesCache({});
      setStatsCache({});
      loadData();
    }
  };

  const toDateTimeLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const toDateLabel = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  };

  const toTimeLabel = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const clampToRange = (value: number, min: number, max: number) => {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
  };

  const openEditBooking = (booking: any) => {
    const normalizedStatus =
      booking.status === 'confirmed' || isCancelledBooking(booking.status)
        ? booking.status
        : 'pending';

    setEditingBooking(booking);
    const pickupText = String(booking.pickup || '');
    const destinationText = String(booking.destination || '');
    const inferredDirection =
      destinationText.includes(AIRPORT_LABEL)
        ? 'to_airport'
        : pickupText.includes(AIRPORT_LABEL)
          ? 'from_airport'
          : null;
    setEditDirection(inferredDirection);
    const editableAddressRaw = inferredDirection === 'from_airport' ? destinationText : pickupText;
    setEditAddress(editableAddressRaw);
    const notesParsed = parseBookingNotes(booking.notes);
    const extractedExtraStop = notesParsed.intermediateStopInfo;
    const extractedHandLuggage = notesParsed.handLuggageCount;
    const paymentLabel = notesParsed.paymentLabel.toLowerCase();
    const extractedFlightNumber = (booking.flight_number || notesParsed.flightNumberInfo || '').toString().trim();
    const babySeats = clampToRange(Number(notesParsed.childSeatCounts.baby || 0), 0, 3);
    const childSeats = clampToRange(Number(notesParsed.childSeatCounts.child || 0), 0, 3);
    const boosterSeats = clampToRange(Number(notesParsed.childSeatCounts.booster || 0), 0, 3);
    setEditExtraStop(Boolean(extractedExtraStop));
    setEditExtraStopAddress(extractedExtraStop || '');
    setEditHandLuggage(clampToRange(extractedHandLuggage, 0, 8));
    setEditChildSeat(Boolean(notesParsed.childSeatInfo) || babySeats > 0 || childSeats > 0 || boosterSeats > 0);
    setEditBabySeats(babySeats);
    setEditChildSeats(childSeats);
    setEditBoosterSeats(boosterSeats);
    setEditFlightNumber(extractedFlightNumber);
    setEditPaymentMethod(
      String(booking.payment_method || '').toLowerCase().includes('card') || paymentLabel.includes('kredit')
        ? 'card'
        : String(booking.payment_method || '').toLowerCase().includes('cash') || paymentLabel.includes('bar')
          ? 'cash'
          : String(booking.payment_method || '').toLowerCase().includes('lieferschein') || paymentLabel.includes('lieferschein')
            ? 'voucher'
            : String(booking.payment_method || '').toLowerCase().includes('gratis') || paymentLabel.includes('gratis')
              ? 'free'
              : null
    );
    const cleanedNotes = notesParsed.cleanedNotes;
    setEditForm({
      id: booking.id,
      full_name: booking.full_name || '',
      email: booking.email || '',
      phone: booking.phone || '',
      pickup: booking.pickup || '',
      destination: booking.destination || '',
      pickup_at: toDateTimeLocal(booking.pickup_at),
      passengers: clampToRange(Number(booking.passengers ?? 1), 1, 8),
      luggage: clampToRange(Number(booking.luggage ?? 0), 0, 8),
      price: Number(booking.price ?? 0),
      vehicle_type: booking.vehicle_type || '',
      notes: cleanedNotes,
      status: normalizedStatus,
    });
    setEditDate(toDateLabel(booking.pickup_at));
    setEditTime(toTimeLabel(booking.pickup_at));
  };

  const handleEditDirectionChange = (direction: 'to_airport' | 'from_airport') => {
    setEditDirection(direction);
    const prev = editForm;
    if (direction === 'to_airport') {
      const nextPickup = String(prev.pickup || '').includes(AIRPORT_LABEL) ? '' : prev.pickup;
      setEditForm({ ...prev, pickup: nextPickup, destination: AIRPORT_LABEL });
      setEditAddress(nextPickup);
      return;
    }
    const nextDestination = String(prev.destination || '').includes(AIRPORT_LABEL) ? '' : prev.destination;
    setEditForm({ ...prev, pickup: AIRPORT_LABEL, destination: nextDestination });
    setEditAddress(nextDestination);
  };

  const handleEditAddressChange = (value: string) => {
    const formatted = value;
    setEditAddress(formatted);
    setEditForm((prev: any) =>
      editDirection === 'from_airport'
        ? { ...prev, destination: formatted }
        : { ...prev, pickup: formatted }
    );
  };

  const handleExtraStopAddressChange = (value: string) => {
    setEditExtraStopAddress(value);
  };

  const handleSaveBookingEdit = async (e?: React.FormEvent, sendPassengerEmail = true) => {
    if (e) e.preventDefault();
    setSavingEdit(true);
    try {
      const extraStopValue = String(editExtraStopAddress || '').trim();
      const notesComposed = composeBookingNotes({
        baseNotes: editForm.notes,
        flightNumber: editDirection === 'from_airport' ? editFlightNumber : '',
        intermediateStop: editExtraStop ? extraStopValue : '',
        childSeatCounts: editChildSeat
          ? { baby: editBabySeats, child: editChildSeats, booster: editBoosterSeats }
          : { baby: 0, child: 0, booster: 0 },
        paymentMethod: editPaymentMethod,
        handLuggageCount: editHandLuggage,
      });

      const payload = {
        ...editForm,
        sendPassengerEmail,
        notes: notesComposed,
        pickup_at: (() => {
          if (editDate && editTime) {
            const [day, month, year] = editDate.split('.');
            return new Date(`${year}-${month}-${day}T${editTime}:00`).toISOString();
          }
          return new Date(editForm.pickup_at).toISOString();
        })(),
        passengers: Number(editForm.passengers || 0),
        luggage: Number(editForm.luggage || 0),
        price: Number(editForm.price || 0),
      };

      const res = await updateBookingDetails(payload);
      if ((res as any)?.error) {
        alert(`Failed to update booking: ${(res as any).error}`);
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === editForm.id
            ? {
                ...b,
                ...payload,
                payment_method:
                  editPaymentMethod === 'cash'
                    ? 'Bar'
                    : editPaymentMethod === 'card'
                      ? 'Kreditkarte'
                      : editPaymentMethod === 'voucher'
                        ? 'Lieferschein'
                        : editPaymentMethod === 'free'
                          ? 'Gratis'
                          : b.payment_method,
              }
            : b
        )
      );
      setEditingBooking(null);
      setRidesCache({});
      setStatsCache({});
    } finally {
      setSavingEdit(false);
    }
  };

  // Render header tabs for desktop and tablet
  const renderDesktopTabs = () => (
    <UnderlineTabNav
      className="hidden md:flex items-center"
      items={[
        { id: 'rides', label: '', icon: <Car size={18} /> },
        { id: 'drivers', label: '', icon: <Users size={18} /> },
        { id: 'stats', label: '', icon: <BarChart3 size={18} /> },
      ]}
      activeTab={currentTab}
      onChange={handleTabChange}
    />
  );

  const renderHeaderDatePicker = () => (
    <div className="flex items-center gap-2 justify-start">
      <button
        type="button"
        onClick={() => shiftRidesDate(-1)}
        className="h-9 w-5 text-[#1d1d1f] hover:text-[#0071e3] transition-colors flex items-center justify-center md:h-9 md:w-9 md:rounded-full md:border md:border-[#d2d2d7] md:bg-white md:hover:bg-[#f5f5f7]"
        aria-label="Vorheriger Tag"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="relative">
        <Calendar className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" size={18} />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-[128px] md:w-auto px-2 md:pl-10 md:pr-4 py-2 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] bg-white"
        />
      </div>
      <button
        type="button"
        onClick={() => shiftRidesDate(1)}
        className="h-9 w-5 text-[#1d1d1f] hover:text-[#0071e3] transition-colors flex items-center justify-center md:h-9 md:w-9 md:rounded-full md:border md:border-[#d2d2d7] md:bg-white md:hover:bg-[#f5f5f7]"
        aria-label="Nächster Tag"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderViewModeToggle = () => (
    <div className="flex items-center gap-2 bg-[#f5f5f7] p-1 rounded-[12px] shrink-0">
      <button
        onClick={() => setViewMode('grid')}
        aria-label="Kacheln Ansicht"
        title="Kacheln"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-[8px] transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => setViewMode('table')}
        aria-label="Tabellen Ansicht"
        title="Tabelle"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-[8px] transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}
      >
        <Rows3 size={16} />
      </button>
    </div>
  );

  const renderRides = () => (
    <div className="space-y-2">
      {loading ? (
        <div className="text-center py-12 text-[#86868b]">Fahrten werden geladen...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[24px] border border-[#d2d2d7] text-[#86868b]">
          Keine Fahrten für dieses Datum gefunden.
        </div>
      ) : (
        <>
        <div className={viewMode === 'grid' ? "space-y-4" : "bg-white border border-[#d2d2d7] overflow-hidden"}>
                    {viewMode === 'grid' ? bookings.map(booking => (
            <div
              key={booking.id}
              className={`relative bg-[#f8f9fb] rounded-[24px] border border-[#d9dde4] shadow-sm p-4 md:p-5 hover:shadow-md transition-all ${
                isCancelledBooking(booking.status) ? 'bg-[#e5e7eb] border-[#cfd4dc]' : ''
              }`}
            >
              <div className={`flex flex-nowrap items-center gap-1 sm:gap-2 mb-4 ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                <span className="inline-flex w-auto whitespace-nowrap justify-center items-center px-2.5 sm:px-4 py-1 rounded-full bg-[#e7ebf3] text-[#000000] text-[12px] sm:text-[18px] font-semibold">
                  {format(new Date(booking.pickup_at), 'HH:mm')}
                </span>
                <span className="inline-flex w-auto whitespace-nowrap justify-center items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 rounded-full text-[12px] sm:text-[18px] font-semibold tracking-wide bg-[#e7ebf3] text-[#000000]">
                  {booking.destination?.includes('Flughafen') ? <PlaneTakeoff size={14} className="sm:w-5 sm:h-5" /> : <PlaneLanding size={14} className="sm:w-5 sm:h-5" />}
                  {booking.destination?.includes('Flughafen') ? 'ZUM' : 'VOM'}
                </span>
                {(() => {
                  const flightNumber = getFlightNumberFromNotes(booking);
                  const isFromAirportRide = /flughafen/i.test(String(booking?.pickup || ''));
                  if (!isFromAirportRide || !flightNumber) return null;
                  return (
                    <span className="inline-flex w-auto whitespace-nowrap justify-center items-center px-2.5 sm:px-4 py-1 rounded-full bg-[#e7ebf3] text-[#000000] text-[12px] sm:text-[18px] font-semibold">
                      {flightNumber}
                    </span>
                  );
                })()}
                <span className="inline-flex w-auto whitespace-nowrap justify-center items-center px-2.5 sm:px-4 py-1 rounded-full bg-[#e7ebf3] text-[#000000] text-[12px] sm:text-[16px] font-semibold uppercase tracking-wide">
                  {booking.vehicle_type || 'LIMOUSINE'}
                </span>
                {(() => {
                  const payment = getBookingPaymentMeta(booking);
                  return (
                    <span className={`inline-flex w-auto whitespace-nowrap justify-center items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 rounded-full text-[12px] sm:text-[16px] font-semibold uppercase ${payment.className}`}>
                      <CreditCard size={14} className="sm:w-[18px] sm:h-[18px]" /> {payment.label}
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.95fr_0.8fr] gap-4 items-start">
                <div className={`space-y-2.5 ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                  <div className="flex items-stretch gap-2.5">
                    <div className="pt-1 flex flex-col items-center text-[#000000] shrink-0" aria-hidden="true">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#000000]" />
                      <span className="my-1 w-px flex-1 bg-[#000000]" />
                      <ChevronDown size={14} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <p className="text-[18px] font-semibold text-[#081a42] leading-snug line-clamp-2 md:text-[19px]">
                          {formatRideLocation(booking, booking.pickup, 'pickup')}
                        </p>
                        {!isAirportLocation(booking.pickup) ? (
                          <a
                            href={getGoogleMapsUrl(formatRideLocation(booking, booking.pickup, 'pickup'))}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open pickup in Google Maps"
                            className="mt-1 text-[#000000] hover:text-[#000000] transition-colors shrink-0"
                          >
                            <MapPin size={21} />
                          </a>
                        ) : null}
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="text-[18px] font-semibold text-[#000000] leading-snug line-clamp-2 md:text-[19px]">
                          {formatRideLocation(booking, booking.destination, 'destination')}
                        </p>
                        {!isAirportLocation(booking.destination) ? (
                          <a
                            href={getGoogleMapsUrl(formatRideLocation(booking, booking.destination, 'destination'))}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open destination in Google Maps"
                            className="mt-1 text-[#000000] hover:text-[#000000] transition-colors shrink-0"
                          >
                            <MapPin size={21} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const displayNotes = getBookingDisplayNotes(booking);
                    return displayNotes ? (
                      <div className="rounded-[11px] border border-[#d2d2d7] bg-white px-3 py-2 mt-2 max-w-[620px]">
                        <p className="text-[10px] uppercase tracking-wide text-[#86868b] font-semibold mb-0.5">Anmerkung</p>
                        <p className="text-[15px] text-[#1d1d1f] leading-snug line-clamp-3">{displayNotes}</p>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div className={`space-y-4 lg:pl-8 lg:-mt-3 ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                  <h3 className="font-semibold text-[#000000] text-[19px] flex items-center gap-2">
                    {booking.full_name}
                    {passengerCounts[booking.email] >= 5 && <Star size={15} className="text-yellow-400 fill-yellow-400" />}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[#000000] text-[14px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <a
                        href={getTelHref(booking.phone)}
                        aria-label="Call passenger"
                        className="text-[#000000] hover:text-[#0071e3] transition-colors shrink-0"
                      >
                        <Phone size={18} />
                      </a>
                      <span className="truncate">{booking.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <a
                        href={getMailtoHref(booking.email)}
                        aria-label="Email passenger"
                        className="text-[#000000] hover:text-[#0071e3] transition-colors shrink-0"
                      >
                        <Mail size={18} />
                      </a>
                      <span className="truncate">{booking.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7ebf3] text-[#000000] text-[11px] font-semibold">
                      <Users size={14} /> {booking.passengers} PERS.
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7ebf3] text-[#000000] text-[11px] font-semibold">
                      <Briefcase size={14} /> {booking.luggage} KOFFER
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7ebf3] text-[#000000] text-[11px] font-semibold">
                      <Briefcase size={14} /> {booking.notes?.includes('Handgep') ? booking.notes.match(/Handgep..ck:\s*(\d+)/)?.[1] || 0 : 0} HANDG.
                    </span>
                    {(() => {
                      const seats = getChildSeatCountsFromNotes(booking);
                      return (
                        <>
                          {seats.baby > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7ebf3] text-[#000000] text-[11px] font-semibold">
                              {seats.baby} BABYSCHALE
                            </span>
                          ) : null}
                          {seats.child > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7ebf3] text-[#000000] text-[11px] font-semibold">
                              {seats.child} KINDERSITZ
                            </span>
                          ) : null}
                          {seats.booster > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7ebf3] text-[#000000] text-[11px] font-semibold">
                              {seats.booster} Sitzerhöhung
                            </span>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex h-full flex-col gap-4">
                  <div className={`flex flex-col items-end gap-2 w-full sm:flex-row sm:items-center sm:justify-end ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                    <button
                      type="button"
                      onClick={() => openEditBooking(booking)}
                      aria-label="Buchung bearbeiten"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#eef5ff] hover:text-[#0a63ff] lg:absolute lg:top-5 lg:right-5 z-10"
                    >
                      <Edit size={16} />
                    </button>
                    <div className="text-right text-[30px] font-semibold text-[#081a42] leading-none sm:ml-auto">
                      {formatPriceDisplay(booking.price)}
                    </div>
                  </div>
                  <select
                    className={`w-full text-[12px] border rounded-[11px] px-3 py-2 outline-none focus:border-[#4f46e5] ${isCancelledBooking(booking.status) ? 'opacity-35' : ''} ${getDriverSelectTone(booking)}`}
                    value={getSelectedDriverId(booking)}
                    disabled={isCancelledBooking(booking.status)}
                    onChange={(e) =>
                      setDriverSelection((prev) => ({ ...prev, [booking.id]: e.target.value }))
                    }
                  >
                    <option value="">Fahrer zuweisen...</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (isCancelledBooking(booking.status)) return;
                        const driverId = getSelectedDriverId(booking);
                        if (!driverId) return;
                        await confirmAndSendToDriver(booking.id, driverId);
                      }}
                      disabled={!getSelectedDriverId(booking) || isCancelledBooking(booking.status)}
                      className={`w-full ${adminPrimaryButtonClass} px-3 py-2 text-[0.85rem] ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}
                    >
                      <Send size={12} />
                      Senden
                    </button>
                    {isCancelledBooking(booking.status) ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Möchten Sie die Bestellung aktivieren?')) {
                          handleStatusChange(booking.id, 'pending');
                        }
                      }}
                      className={`w-full ${adminSecondaryButtonClass} px-3 py-2 text-[0.85rem] shadow-none`}
                    >
                      <CheckCircle size={12} />
                      Aktivieren
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                        if (confirm('Diese Fahrt jetzt stornieren?')) {
                          handleStatusChange(booking.id, 'cancelled');
                        }
                      }}
                        className={`w-full ${adminDangerButtonClass} px-3 py-2 text-[0.85rem]`}
                      >
                        Stornieren
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )) : (
            <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[930px] text-[16px] text-left">
              <thead className="text-[10px] text-[#86868b] uppercase bg-[#f5f5f7] border-b border-[#d2d2d7] tracking-wide">
                <tr>
                  <th className="px-1.5 py-1.5 font-medium text-center">Zeit / Datum</th>
                  <th className="px-0 py-1.5 font-medium text-center">Zum/Vom</th>
                  <th className="px-0 py-1.5 font-medium text-center">Fahrer</th>
                  <th className="px-0 py-1.5 font-medium text-center">Auto</th>
                  <th className="px-0 py-1.5 font-medium text-center">Route</th>
                  <th className="px-2 py-1.5 font-medium text-center">Fahrgast, Gepäck</th>
                  <th className="px-2 py-1.5 font-medium text-center">Kunde</th>
                  <th className="w-[80px] px-0 py-1.5 font-medium text-center">Zahlung</th>
                  <th className="w-[120px] md:w-[56px] px-2 md:px-1.5 py-1.5 font-medium text-center">Notiz</th>
                  <th className="w-[120px] md:w-[56px] px-2 md:px-1.5 py-1.5 font-medium text-center">Bearbeiten</th>
                  <th className="w-[120px] md:w-[56px] px-2 md:px-1.5 py-1.5 font-medium text-center">X</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => {
                  const payment = getBookingPaymentMeta(booking);
                  const displayNotes = getBookingDisplayNotes(booking);
                  const handLuggage = getHandLuggageCountFromNotes(booking);
                  const seats = getChildSeatCountsFromNotes(booking);
                  const hasAnySeat = seats.baby > 0 || seats.child > 0 || seats.booster > 0;
                  const directionLabel = booking.destination?.includes('Flughafen') ? 'ZUM' : 'VOM';
                  const isCancelled = isCancelledBooking(booking.status);
                  return (
                    <tr
                      key={booking.id}
                      className={`border-b border-[#f0f0f2] transition-all ${
                        isCancelledBooking(booking.status) ? 'bg-[#e5e7eb]' : 'hover:bg-[#f5f5f7]/60'
                      }`}
                    >
                      <td className={`px-1.5 py-1 align-top text-center ${isCancelled ? 'opacity-35' : ''}`}>
                        <div className="flex min-h-[42px] flex-col justify-between items-center">
                          <div className="font-semibold text-[#1d1d1f]">{format(new Date(booking.pickup_at), 'HH:mm')}</div>
                          <div className="text-[16px] text-[#86868b]">{format(new Date(booking.pickup_at), 'dd/MM/yyyy')}</div>
                        </div>
                      </td>
                      <td className={`px-1.5 py-1 align-middle text-center ${isCancelled ? 'opacity-35' : ''}`}>
                        <span className="inline-flex items-center text-[#1d1d1f] text-[16px] font-semibold">
                          {directionLabel}
                        </span>
                      </td>
                      <td className={`px-0 py-1 align-middle ${isCancelled ? 'opacity-35' : ''}`}>
                        <select
                          className={`text-[16px] border rounded-[8px] px-1 py-1 w-22 outline-none focus:border-[#0071e3] ${getDriverSelectTone(booking)}`}
                          value={getSelectedDriverId(booking)}
                          disabled={isCancelledBooking(booking.status)}
                          onChange={async (e) => {
                            const nextDriverId = e.target.value;
                            setDriverSelection((prev) => ({ ...prev, [booking.id]: nextDriverId }));

                            if (!nextDriverId || isCancelledBooking(booking.status)) return;
                            await confirmAndSendToDriver(booking.id, nextDriverId);
                          }}
                        >
                          <option value="">Nicht zugewiesen</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={`px-1.5 py-1 align-middle text-center ${isCancelled ? 'opacity-35' : ''}`}>
                        <span className="inline-flex items-center text-[#1d1d1f] text-[16px] font-semibold uppercase">
                          {booking.vehicle_type || 'LIMO'}
                        </span>
                      </td>
                      <td className={`px-0 py-1 align-top min-w-[145px] ${isCancelled ? 'opacity-35' : ''}`}>
                        <div className="flex items-stretch gap-1.5">
                          <div className="pt-1 flex flex-col items-center text-[#000000] shrink-0" aria-hidden="true">
                            <span className="h-2 w-2 rounded-full bg-[#000000]" />
                            <span className="my-0.5 w-px flex-1 bg-[#000000]" />
                            <ChevronDown size={12} />
                          </div>
                          <div className="min-w-0 flex-1 flex min-h-[42px] flex-col justify-between">
                            <div className="truncate text-[#1d1d1f] font-medium" title={formatTableRouteAddress(booking, booking.pickup, 'pickup')}>
                              {formatTableRouteAddress(booking, booking.pickup, 'pickup')}
                            </div>
                            <div className="truncate text-[#1d1d1f] font-medium" title={formatTableRouteAddress(booking, booking.destination, 'destination')}>
                              {formatTableRouteAddress(booking, booking.destination, 'destination')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-2 py-1 align-top min-w-[140px] ${isCancelled ? 'opacity-35' : ''}`}>
                        <div className="flex min-h-[42px] flex-col justify-between text-[16px] text-[#1d1d1f] font-medium leading-tight">
                          <div>{Number(booking.passengers || 0)} Pers. • {Number(booking.luggage || 0)} K • {handLuggage} H</div>
                          {hasAnySeat ? (
                            <div className="text-[16px] text-[#6e6e73]">
                              {seats.baby > 0 ? `${seats.baby} B` : ''}
                              {seats.baby > 0 && (seats.child > 0 || seats.booster > 0) ? ' • ' : ''}
                              {seats.child > 0 ? `${seats.child} K` : ''}
                              {seats.child > 0 && seats.booster > 0 ? ' • ' : ''}
                              {seats.booster > 0 ? `${seats.booster} S` : ''}
                            </div>
                          ) : <div />}
                        </div>
                      </td>
                      <td className={`px-2 py-1 align-top ${isCancelled ? 'opacity-35' : ''}`}>
                        <a href={getTelHref(booking.phone)} className="block h-full hover:text-[#0071e3] transition-colors">
                          <div className="flex min-h-[42px] flex-col justify-between">
                            <div className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                              <span>{booking.full_name}</span>
                              {passengerCounts[booking.email] >= 5 && <Star size={13} className="text-yellow-400 fill-yellow-400" />}
                            </div>
                            <div className="text-[16px] text-[#0071e3]">{booking.phone || '-'}</div>
                          </div>
                        </a>
                      </td>
                      <td className={`w-[80px] px-0 py-1 align-top text-center ${isCancelled ? 'opacity-35' : ''}`}>
                        <div className="flex min-h-[42px] flex-col items-center justify-between">
                          <div className="font-semibold text-[#1d1d1f]">{formatPriceDisplay(booking.price)}</div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[16px] font-semibold uppercase ${payment.className}`}>
                            <CreditCard size={11} /> {payment.label}
                          </span>
                        </div>
                      </td>
                      <td className={`px-2 md:px-0 py-1 align-middle text-center ${isCancelled ? 'opacity-35' : ''}`}>
                        {displayNotes ? (
                          <button
                            type="button"
                            onClick={() => setNotesPopup({ open: true, text: displayNotes })}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e7ebf3] text-[#1d1d1f] hover:bg-[#dbe3f0] transition-colors"
                            aria-label="Notiz öffnen"
                            title="Notiz öffnen"
                          >
                            <FileText size={15} />
                          </button>
                        ) : null}
                      </td>
                      <td className={`px-2 md:px-0 py-1 align-middle text-center ${isCancelled ? 'opacity-35' : ''}`}>
                        <button
                          type="button"
                          onClick={() => openEditBooking(booking)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e7ebf3] transition-colors"
                          aria-label="Buchung bearbeiten"
                          title="Buchung bearbeiten"
                        >
                          <Edit size={15} />
                        </button>
                      </td>
                      <td className="px-2 md:px-1.5 py-1 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCancelledBooking(booking.status)) {
                              if (confirm('Möchten Sie die Bestellung aktivieren?')) {
                                handleStatusChange(booking.id, 'pending');
                              }
                              return;
                            }
                            if (confirm('Diese Fahrt jetzt stornieren?')) {
                              handleStatusChange(booking.id, 'cancelled');
                            }
                          }}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            isCancelledBooking(booking.status)
                              ? 'bg-[#e7f2ff] text-[#0071e3] hover:bg-[#dcecff]'
                              : 'bg-[#f2e9eb] text-[#d70015] hover:bg-[#ecdee1]'
                          }`}
                          aria-label={isCancelledBooking(booking.status) ? 'Fahrt aktivieren' : 'Fahrt stornieren'}
                          title={isCancelledBooking(booking.status) ? 'Fahrt aktivieren' : 'Fahrt stornieren'}
                        >
                          {isCancelledBooking(booking.status) ? (
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0a63ff]" />
                          ) : (
                            <X size={15} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
        {notesPopup.open && (
          <div
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4"
            onClick={() => setNotesPopup({ open: false, text: '' })}
          >
            <div
              className="w-full max-w-md bg-white rounded-[20px] border border-[#d2d2d7] shadow-xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-[#1d1d1f]">Anmerkung</h3>
                <button
                  type="button"
                  onClick={() => setNotesPopup({ open: false, text: '' })}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e7ebf3] transition-colors"
                  aria-label="Notiz schließen"
                >
                  <XCircle size={16} />
                </button>
              </div>
              <p className="text-[14px] leading-relaxed text-[#1d1d1f] whitespace-pre-wrap">{notesPopup.text}</p>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );

  const renderDrivers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white p-5 rounded-[20px] border border-[#d2d2d7] shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] font-semibold text-lg">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1d1d1f] text-[16px]">{driver.name}</h3>
                    <p className="text-[13px] text-[#86868b]">{driver.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="text-[#86868b] hover:text-[#d70015] p-1.5 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Fahrer löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {driver.phone && (
                <a 
                  href={`tel:${driver.phone}`}
                  className="inline-flex items-center gap-2 text-[14px] text-[#0071e3] hover:underline mt-1 bg-[#f5f5f7] px-3 py-1.5 rounded-lg w-full justify-center hover:bg-[#e8f2ff] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0a63ff] animate-pulse"></span>
                  {driver.phone}
                </a>
              )}
            </div>
          ))}
          
          {drivers.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-[24px] border border-[#d2d2d7] text-[#86868b]">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>Keine Fahrer gefunden. Fügen Sie einen Fahrer hinzu, um zu starten.</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <div className="bg-white rounded-[24px] border border-[#d2d2d7] shadow-sm p-8 sticky top-24">
          <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2">
            <Plus size={20} className="text-[#0071e3]" /> Neuen Fahrer hinzufügen
          </h3>
          <form onSubmit={handleAddDriver} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">Vollständiger Name</label>
              <input type="text" name="name" required className="w-full p-3 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] transition-all" placeholder="Max Mustermann" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">E-Mail-Adresse</label>
              <input type="email" name="email" required className="w-full p-3 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">Telefonnummer</label>
              <input type="tel" name="phone" className="w-full p-3 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] transition-all" placeholder="+43 664 1234567" />
            </div>
            <button type="submit" className={`mt-4 w-full ${adminPrimaryButtonClass}`}>
              Fahrer speichern
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    const filteredByDriver = statsData.filter((b) =>
      statsDriverFilter === 'all' ? true : (b.driver?.name || 'Nicht zugewiesen') === statsDriverFilter
    );

    const filteredForRevenue = filteredByDriver.filter((b) => {
      if (statsPaymentFilter === 'all') return true;
      const paymentMeta = getBookingPaymentMeta(b);
      if (statsPaymentFilter === 'cash') return paymentMeta.label === 'BAR';
      return paymentMeta.label === 'KARTE';
    });

    // Calculate metrics
    const totalRevenue = filteredForRevenue.reduce((sum, b) => sum + Number(b.price), 0);
    const totalRevenueForDriver = filteredByDriver.reduce((sum, b) => sum + Number(b.price), 0);
    const totalRides = filteredByDriver.length;
    const avgValue = totalRides > 0 ? totalRevenueForDriver / totalRides : 0;

    // Prepare chart data
    const revenueByDate = filteredForRevenue.reduce((acc, b) => {
      const date = format(new Date(b.pickup_at), 'MMM dd');
      acc[date] = (acc[date] || 0) + Number(b.price);
      return acc;
    }, {});
    const areaChartData = Object.keys(revenueByDate).map(date => ({ date, revenue: revenueByDate[date] }));

    const revenueByDriver = filteredForRevenue.reduce((acc, b) => {
      const driverName = b.driver?.name || 'Nicht zugewiesen';
      if (!acc[driverName]) {
        acc[driverName] = { revenue: 0, rides: 0 };
      }
      acc[driverName].revenue += Number(b.price) || 0;
      acc[driverName].rides += 1;
      return acc;
    }, {} as Record<string, { revenue: number; rides: number }>);
    const barChartData = Object.keys(revenueByDriver).map((name) => ({
      name,
      nameWithRides: `${name} (${revenueByDriver[name].rides})`,
      revenue: revenueByDriver[name].revenue,
      rides: revenueByDriver[name].rides,
    }));

    const ridesByDate = filteredByDriver
      .reduce((acc, b) => {
        const dateKey = format(new Date(b.pickup_at), 'MMM dd');
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    const ridesByDateData = Object.keys(ridesByDate).map((date) => ({ date, rides: ridesByDate[date] }));
    const availableDriverNames = Array.from(
      new Set(statsData.map((b) => b.driver?.name || 'Nicht zugewiesen'))
    ).sort((a, b) => a.localeCompare(b, 'de'));

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-[18px] border border-[#d2d2d7] shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-semibold text-[#1d1d1f] text-[17px]">Leistungsübersicht</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center">
            <select
              value={statsDriverFilter}
              onChange={(e) => setStatsDriverFilter(e.target.value)}
              className="w-full border border-[#d2d2d7] rounded-[12px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0071e3]"
            >
              <option value="all">Alle Fahrer</option>
              {availableDriverNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select 
              value={statsPaymentFilter}
              onChange={(e) => setStatsPaymentFilter(e.target.value as 'all' | 'cash' | 'card')}
              className="w-full border border-[#d2d2d7] rounded-[12px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0071e3]"
            >
              <option value="all">Alle Zahlungen</option>
              <option value="cash">Nur Bar</option>
              <option value="card">Nur Karte</option>
            </select>
            <select 
              value={statsRange}
              onChange={(e) => setStatsRange(e.target.value)}
              className="w-full border border-[#d2d2d7] rounded-[12px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0071e3] sm:col-span-2 lg:col-span-1"
            >
              <option value="today">Heute</option>
              <option value="7">Letzte 7 Tage</option>
              <option value="30">Letzte 30 Tage</option>
              <option value="90">Letzte 90 Tage</option>
            </select>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
            <h3 className="text-[#86868b] text-[11px] font-medium uppercase tracking-wide mb-2">Gesamtumsatz</h3>
            <p className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight">{formatPriceDisplay(totalRevenue)}</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
            <h3 className="text-[#86868b] text-[11px] font-medium uppercase tracking-wide mb-2">Gesamtfahrten</h3>
            <p className="text-[32px] font-semibold text-[#0071e3] tracking-tight">{totalRides}</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
            <h3 className="text-[#86868b] text-[11px] font-medium uppercase tracking-wide mb-2">Durchschnittswert Buchung</h3>
            <p className="text-[32px] font-semibold text-[#0a63ff] tracking-tight">{formatPriceDisplay(avgValue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-6">Umsatzverlauf</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f7" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#86868b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#86868b'}} tickFormatter={(value) => `${value} €`} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#0071e3" fill="#e0f2ff" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-6">Umsatz/Fahrten pro Fahrer</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f7" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#86868b'}} />
                  <YAxis dataKey="nameWithRides" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#86868b'}} width={140} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="revenue" fill="#0071e3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-6">Fahrten pro Tag ({statsDriverFilter === 'all' ? 'Alle Fahrer' : statsDriverFilter})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ridesByDateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f7" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#86868b' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#86868b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="rides" stroke="#0071e3" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={APP_PAGE_BG_CLASS}>
      {/* Header */}
      <header className={APP_HEADER_CLASS}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-3">
            <div className="min-w-0">
              {currentTab === 'rides' ? renderHeaderDatePicker() : null}
            </div>
            {currentTab === 'rides' ? renderViewModeToggle() : null}
            <div className="flex items-center gap-4 relative ml-auto">
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileTabsOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-[14px] border border-[#dbe7f8] bg-white text-[#1d1d1f] shadow-[0_10px_24px_rgba(17,17,17,0.04)] hover:bg-[#f8fbff] transition-colors"
                  aria-label="Navigationsmenü öffnen"
                >
                  <Menu size={17} />
                </button>
                {mobileTabsOpen ? (
                  <div className="absolute right-0 top-[56px] z-20 w-64 overflow-hidden rounded-[1.4rem] border border-[#dbe7f8] bg-white shadow-[0_18px_45px_rgba(17,17,17,0.10)]">
                    <div className="p-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('rides')}
                      className={`w-full flex items-center justify-center rounded-[1rem] px-4 py-3 text-[15px] font-medium transition-colors ${
                        currentTab === 'rides'
                          ? 'bg-[#eef5ff] text-[#1679ff]'
                          : 'text-[#1d1d1f] hover:bg-[#f8fbff]'
                      }`}
                      aria-label="Fahrten"
                    >
                      <Car size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('drivers')}
                      className={`mt-1 w-full flex items-center justify-center rounded-[1rem] px-4 py-3 text-[15px] font-medium transition-colors ${
                        currentTab === 'drivers'
                          ? 'bg-[#eef5ff] text-[#1679ff]'
                          : 'text-[#1d1d1f] hover:bg-[#f8fbff]'
                      }`}
                      aria-label="Fahrer"
                    >
                      <Users size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('stats')}
                      className={`mt-1 w-full flex items-center justify-center rounded-[1rem] px-4 py-3 text-[15px] font-medium transition-colors ${
                        currentTab === 'stats'
                          ? 'bg-[#eef5ff] text-[#1679ff]'
                          : 'text-[#1d1d1f] hover:bg-[#f8fbff]'
                      }`}
                      aria-label="Statistik"
                    >
                      <BarChart3 size={16} />
                    </button>
                    </div>
                    <div className="border-t border-[#edf2f7] p-2">
                    <form action="/auth/logout" method="post">
                      <button
                        type="submit"
                        className="w-full justify-start text-left inline-flex items-center gap-2 px-4 py-3 text-[0.95rem] font-medium text-[#1679ff] transition-colors hover:text-[#0a63ff]"
                      >
                        <LogOut size={16} /> Abmelden
                      </button>
                    </form>
                    </div>
                  </div>
                ) : null}
              </div>
              {renderDesktopTabs()}
              <span className="text-[13px] text-[#86868b] hidden sm:block">{userEmail}</span>
              <form action="/auth/logout" method="post" className="hidden md:block">
                <button className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[#1679ff] transition-colors hover:text-[#0a63ff]">
                  <LogOut size={16} />
                  Abmelden
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentTab === 'rides' && renderRides()}
          {currentTab === 'drivers' && renderDrivers()}
          {currentTab === 'stats' && renderStats()}
        </div>
      </main>

      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => handleSaveBookingEdit(e, true)}
            className={`w-full max-w-[700px] ${BOOKING_FORM_CARD_CLASS} shadow-xl relative overflow-hidden max-h-[90vh] overflow-y-auto`}
          >
            <div className="rounded-[1.9rem] border border-[#e9edf3] bg-white p-4 md:p-8 space-y-8 shadow-[0_18px_54px_rgba(17,17,17,0.12)]">
              <div className="text-center mb-4">
                <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] leading-tight mb-2">Fahrt bearbeiten</h2>
                <p className="text-[1rem] text-[#6a7d96]">Bitte pruefen und aktualisieren Sie die Buchungsdaten.</p>
              </div>

              <div className={`flex items-center justify-between ${adminEditMetaCardClass}`}>
                <div className="text-[#111827]">
                  <p className={adminEditSectionLabelClass}>Buchung</p>
                  <p className="mt-2 text-[0.98rem] font-semibold">{editForm.id?.slice(0, 8)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className={adminIconCloseButtonClass}
                  aria-label="Bearbeitungsfenster schliessen"
                >
                  <X size={14} strokeWidth={2.25} className="translate-y-[1px]" />
                </button>
              </div>

              <div className="space-y-4">
                <p className={adminEditSectionLabelClass}>Fahrt</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleEditDirectionChange('to_airport')}
                      className={`${adminEditChoiceCardBaseClass} ${
                        editDirection === 'to_airport'
                          ? 'border-[#1679ff] bg-[#f8fbff] text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)]'
                          : 'border-[#e9edf3] text-[#111827] hover:border-[#cfd7e3]'
                      }`}
                    >
                      <PlaneTakeoff size={24} className={editDirection === 'to_airport' ? 'text-[#1679ff]' : 'text-[#7b8798]'} />
                      <span className={`text-[0.95rem] font-medium ${editDirection === 'to_airport' ? 'text-[#1679ff]' : 'text-[#111827]'}`}>
                        Zum Flughafen
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditDirectionChange('from_airport')}
                      className={`${adminEditChoiceCardBaseClass} ${
                        editDirection === 'from_airport'
                          ? 'border-[#1679ff] bg-[#f8fbff] text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)]'
                          : 'border-[#e9edf3] text-[#111827] hover:border-[#cfd7e3]'
                      }`}
                    >
                      <PlaneLanding size={24} className={editDirection === 'from_airport' ? 'text-[#1679ff]' : 'text-[#7b8798]'} />
                      <span className={`text-[0.95rem] font-medium ${editDirection === 'from_airport' ? 'text-[#1679ff]' : 'text-[#111827]'}`}>
                        Vom Flughafen
                      </span>
                    </button>
                  </div>
                  {editDirection ? (
                    <div className="space-y-4">
                      {editDirection === 'from_airport' && (
                        <input
                          className={BOOKING_FORM_INPUT_CLASS}
                          placeholder="Flugnummer (z.B. OS123)"
                          value={editFlightNumber}
                          onChange={(e) => setEditFlightNumber(e.target.value)}
                        />
                      )}
                      <p className={adminEditSectionLabelClass}>Adresse</p>
                      <input
                        className={BOOKING_FORM_INPUT_CLASS}
                        placeholder="Adresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                        value={editAddress}
                        onChange={(e) => handleEditAddressChange(e.target.value)}
                      />
                    </div>
                  ) : (
                    <>
                      <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Abholung" value={editForm.pickup} onChange={(e) => setEditForm((p: any) => ({ ...p, pickup: e.target.value }))} />
                      <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Ziel" value={editForm.destination} onChange={(e) => setEditForm((p: any) => ({ ...p, destination: e.target.value }))} />
                    </>
                  )}

                  <div className={`flex items-center justify-between ${adminEditMetaCardClass}`}>
                    <div className="text-[#111827]">
                      <p className="text-[0.98rem] font-medium">Zusaetzlicher Stopp?</p>
                      <p className="text-[0.85rem] text-[#6a7d96]">+10 EUR Aufpreis</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editExtraStop}
                        onChange={(e) => setEditExtraStop(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:shadow-sm after:transition-all peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)]"></div>
                    </label>
                  </div>

                  {editExtraStop && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className={adminEditSectionLabelClass}>Adresse Zwischenstopp</p>
                      <input
                        className={BOOKING_FORM_INPUT_CLASS}
                        placeholder="Zusatzadresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                        value={editExtraStopAddress}
                        onChange={(e) => handleExtraStopAddressChange(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-2 ${adminEditSectionLabelClass}`}>Datum</label>
                      <div className="relative" onClick={() => setIsEditDatePickerOpen(true)}>
                        <input
                          type="text"
                          value={editDate}
                          readOnly
                          placeholder="TT.MM.JJJJ"
                          className={`${BOOKING_FORM_INPUT_CLASS} cursor-pointer`}
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
                      </div>
                    </div>
                    <div>
                      <label className={`block mb-2 ${adminEditSectionLabelClass}`}>Zeit</label>
                      <div className="relative" onClick={() => setIsEditTimePickerOpen(true)}>
                        <input
                          type="text"
                          value={editTime}
                          readOnly
                          placeholder="--:--"
                          className={`${BOOKING_FORM_INPUT_CLASS} cursor-pointer`}
                        />
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
                      </div>
                    </div>
                  </div>

                  <DatePicker
                    isOpen={isEditDatePickerOpen}
                    onClose={() => setIsEditDatePickerOpen(false)}
                    onSelect={(date) => setEditDate(date)}
                    selectedDate={editDate}
                  />

                  <TimePicker
                    isOpen={isEditTimePickerOpen}
                    onClose={() => setIsEditTimePickerOpen(false)}
                    onSelect={(time) => setEditTime(time)}
                    selectedTime={editTime}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      className={adminEditSelectClass}
                      value={editForm.vehicle_type || 'Limo'}
                      onChange={(e) => setEditForm((p: any) => ({ ...p, vehicle_type: e.target.value }))}
                    >
                      <option value="Limo">Limo</option>
                      <option value="Kombi">Kombi</option>
                      <option value="Bus">Bus</option>
                    </select>
                    <input className={BOOKING_FORM_INPUT_CLASS} type="number" min={0} step="0.01" value={editForm.price} onChange={(e) => setEditForm((p: any) => ({ ...p, price: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`${adminEditMetricCardClass} flex flex-col items-center justify-center gap-2`}>
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]">Personen</span>
                  <select
                    className={adminEditMetricSelectClass}
                    value={editForm.passengers}
                    onChange={(e) => setEditForm((p: any) => ({ ...p, passengers: Number(e.target.value) }))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className={`${adminEditMetricCardClass} flex flex-col items-center justify-center gap-2`}>
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]">Koffer</span>
                  <select
                    className={adminEditMetricSelectClass}
                    value={editForm.luggage}
                    onChange={(e) => setEditForm((p: any) => ({ ...p, luggage: Number(e.target.value) }))}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className={`${adminEditMetricCardClass} flex flex-col items-center justify-center gap-2`}>
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]">Handgepaeck</span>
                  <select
                    className={adminEditMetricSelectClass}
                    value={editHandLuggage}
                    onChange={(e) => setEditHandLuggage(Number(e.target.value))}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`flex flex-col gap-4 ${adminEditMetaCardClass}`}>
                <div className="flex items-center justify-between">
                  <div className="text-[#111827]">
                    <p className="text-[0.98rem] font-medium">Kindersitz benoetigt?</p>
                    <p className="text-[0.85rem] text-[#6a7d96]">Kostenlos inklusive</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editChildSeat}
                      onChange={(e) => setEditChildSeat(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:shadow-sm after:transition-all peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)]"></div>
                  </label>
                </div>

                {editChildSeat && (
                  <div className="grid grid-cols-3 gap-3 pt-3 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-[#dbe7f8]">
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1679ff]">Babyschale</label>
                      <div className="relative">
                        <select
                          value={editBabySeats}
                          onChange={(e) => setEditBabySeats(Number(e.target.value))}
                          className="ui-input appearance-none py-2 pr-8"
                        >
                          {[0, 1, 2, 3].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1679ff]">Kindersitz</label>
                      <div className="relative">
                        <select
                          value={editChildSeats}
                          onChange={(e) => setEditChildSeats(Number(e.target.value))}
                          className="ui-input appearance-none py-2 pr-8"
                        >
                          {[0, 1, 2, 3].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1679ff]">Sitzerhoehung</label>
                      <div className="relative">
                        <select
                          value={editBoosterSeats}
                          onChange={(e) => setEditBoosterSeats(Number(e.target.value))}
                          className="ui-input appearance-none py-2 pr-8"
                        >
                          {[0, 1, 2, 3].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className={adminEditSectionLabelClass}>Kunde</p>
                <div className="space-y-4">
                  <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Vollständiger Name" value={editForm.full_name} onChange={(e) => setEditForm((p: any) => ({ ...p, full_name: e.target.value }))} />
                  <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Telefonnummer" value={editForm.phone} onChange={(e) => setEditForm((p: any) => ({ ...p, phone: e.target.value }))} />
                  <input className={BOOKING_FORM_INPUT_CLASS} placeholder="E-Mail" type="email" value={editForm.email} onChange={(e) => setEditForm((p: any) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-3">
                <p className={adminEditSectionLabelClass}>Zahlung</p>
                <div className="relative">
                  <select
                    value={editPaymentMethod || ''}
                    onChange={(e) =>
                      setEditPaymentMethod(
                        e.target.value ? (e.target.value as 'cash' | 'card' | 'voucher' | 'free') : null,
                      )
                    }
                    className={adminEditSelectClass}
                  >
                    <option value="">Zahlungsart waehlen</option>
                    <option value="cash">Barzahlung</option>
                    <option value="card">Kreditkarte</option>
                    <option value="voucher">Lieferschein</option>
                    <option value="free">Gratis</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className={adminEditSectionLabelClass}>Notiz</p>
                <textarea className={`${BOOKING_FORM_INPUT_CLASS} min-h-[90px]`} placeholder="Notizen" value={editForm.notes} onChange={(e) => setEditForm((p: any) => ({ ...p, notes: e.target.value }))} />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className={adminIconCloseButtonClass}
                  aria-label="Bearbeiten schliessen"
                >
                  <X size={14} strokeWidth={2.25} className="translate-y-[1px]" />
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => handleSaveBookingEdit(undefined, false)}
                  className={`flex-1 ${adminSecondaryButtonClass}`}
                >
                  {savingEdit ? 'Speichern...' : 'Nur speichern'}
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className={`flex-1 ${adminPrimaryButtonClass}`}
                >
                  {savingEdit ? 'Speichern...' : 'Speichern & senden'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}




