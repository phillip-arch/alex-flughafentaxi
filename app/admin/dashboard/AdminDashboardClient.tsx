'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { addDays, format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Car, Users, BarChart3, Calendar,
  ChevronLeft, ChevronRight,
  Menu, LogOut,
  LayoutGrid, Rows3
} from 'lucide-react';
import { 
  fetchBookings, fetchDrivers, addDriver, deleteDriver, 
  updateBookingStatus, updateBookingDetails, assignDriver, unassignDriver, fetchStats, fetchPassengerCountsBatch 
} from './actions';
import { composeBookingNotes, parseBookingNotes } from '@/lib/booking/notes';
import UnderlineTabNav from '@/components/ui/UnderlineTabNav';
import { APP_HEADER_CLASS, APP_PAGE_BG_CLASS } from '@/components/ui/sharedStyles';
import AdminDriversPanel from './AdminDriversPanel';
import AdminRidesPanel from './AdminRidesPanel';
import AdminBookingEditModal from './AdminBookingEditModal';

const AdminStatsPanel = dynamic(() => import('./AdminStatsPanel'), {
  loading: () => (
    <div className="rounded-[24px] border border-[#d2d2d7] bg-white p-8 text-center text-[#86868b] shadow-sm">
      Statistik wird geladen...
    </div>
  ),
});

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

  const getShiftedDate = (baseDate: string, dayOffset: number) => {
    const parsed = new Date(`${baseDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return baseDate;
    return format(addDays(parsed, dayOffset), 'yyyy-MM-dd');
  };

  const shiftRidesDate = (dayOffset: number) => {
    setDate(getShiftedDate(date, dayOffset));
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

  async function prefetchRidesForDate(targetDate: string) {
    if (!targetDate) return;
    if (ridesCache[targetDate]) return;

    const data = await fetchBookings(targetDate);
    const nextBookings = data || [];
    const uniqueEmails = Array.from(new Set(nextBookings.map((b: any) => b.email).filter(Boolean)));
    const counts = await fetchPassengerCountsBatch(uniqueEmails);

    setRidesCache((prev) => {
      if (prev[targetDate]) return prev;
      return {
        ...prev,
        [targetDate]: { bookings: nextBookings, passengerCounts: counts },
      };
    });
  }

  async function loadData() {
    try {
      if (currentTab === 'rides') {
        const cachedRides = ridesCache[date];
        if (cachedRides) {
          setBookings(cachedRides.bookings);
          setPassengerCounts(cachedRides.passengerCounts);
          if (!driversLoaded) {
            const driversData = await fetchDrivers();
            setDrivers(driversData || []);
            setDriversLoaded(true);
          }
        } else {
          setLoading(bookings.length === 0);
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

        void prefetchRidesForDate(getShiftedDate(date, -1));
        void prefetchRidesForDate(getShiftedDate(date, 1));
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

  const handleUnassignDriver = async (bookingId: string) => {
    try {
      const res = await unassignDriver(bookingId);
      if ((res as any)?.error) {
        alert(`Fahrerzuweisung konnte nicht entfernt werden: ${(res as any).error}`);
        return false;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                driver_id: null,
                confirm_token: null,
                status: (res as any)?.status || 'pending',
              }
            : b,
        ),
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
                    driver_id: null,
                    confirm_token: null,
                    status: (res as any)?.status || 'pending',
                  }
                : b,
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
      console.error('handleUnassignDriver failed:', error);
      alert('Fahrerzuweisung konnte nicht entfernt werden: Serverfehler. Bitte erneut versuchen.');
      return false;
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
    const currentAddress = String(editAddress || '').trim();
    if (direction === 'to_airport') {
      const nextPickup = currentAddress || (String(prev.pickup || '').includes(AIRPORT_LABEL) ? '' : prev.pickup);
      setEditForm({ ...prev, pickup: nextPickup, destination: AIRPORT_LABEL });
      setEditAddress(nextPickup);
      return;
    }
    const nextDestination = currentAddress || (String(prev.destination || '').includes(AIRPORT_LABEL) ? '' : prev.destination);
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
                  <div className="absolute right-0 top-[56px] z-20 w-[12.5rem] overflow-hidden rounded-[1.35rem] border border-[#dbe7f8] bg-white shadow-[0_18px_45px_rgba(17,17,17,0.10)]">
                    <div className="flex flex-col gap-1.5 p-2.5">
                    <button
                      type="button"
                      onClick={() => handleTabChange('rides')}
                      className={`inline-flex h-12 w-full items-center gap-3 rounded-[0.95rem] px-3 transition-colors ${
                        currentTab === 'rides'
                          ? 'bg-[#eef5ff] text-[#1679ff]'
                          : 'text-[#1d1d1f] hover:bg-[#f8fbff]'
                      }`}
                      aria-label="Fahrten"
                    >
                      <Car size={16} className="shrink-0" />
                      <span className="text-[0.95rem] font-medium">Fahrten</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('drivers')}
                      className={`inline-flex h-12 w-full items-center gap-3 rounded-[0.95rem] px-3 transition-colors ${
                        currentTab === 'drivers'
                          ? 'bg-[#eef5ff] text-[#1679ff]'
                          : 'text-[#1d1d1f] hover:bg-[#f8fbff]'
                      }`}
                      aria-label="Fahrer"
                    >
                      <Users size={16} className="shrink-0" />
                      <span className="text-[0.95rem] font-medium">Fahrer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('stats')}
                      className={`inline-flex h-12 w-full items-center gap-3 rounded-[0.95rem] px-3 transition-colors ${
                        currentTab === 'stats'
                          ? 'bg-[#eef5ff] text-[#1679ff]'
                          : 'text-[#1d1d1f] hover:bg-[#f8fbff]'
                      }`}
                      aria-label="Statistik"
                    >
                      <BarChart3 size={16} className="shrink-0" />
                      <span className="text-[0.95rem] font-medium">Statistik</span>
                    </button>
                    </div>
                    <div className="border-t border-[#edf2f7] p-2.5">
                    <form action="/auth/logout" method="post">
                      <button
                        type="submit"
                        className="inline-flex h-12 w-full items-center gap-3 rounded-[0.95rem] px-3 text-[#1679ff] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]"
                        aria-label="Abmelden"
                      >
                        <LogOut size={16} className="shrink-0" />
                        <span className="text-[0.95rem] font-medium">Abmelden</span>
                      </button>
                    </form>
                    </div>
                  </div>
                ) : null}
              </div>
              {renderDesktopTabs()}
              <span className="text-[13px] text-[#86868b] hidden sm:block">{userEmail}</span>
              <form action="/auth/logout" method="post" className="hidden md:block">
                <button
                  className="inline-flex items-center text-[0.95rem] font-medium text-[#1679ff] transition-colors hover:text-[#0a63ff]"
                  aria-label="Abmelden"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentTab === 'rides' && (
            <AdminRidesPanel
              loading={loading}
              bookings={bookings}
              viewMode={viewMode}
              notesPopup={notesPopup}
              setNotesPopup={setNotesPopup}
              passengerCounts={passengerCounts}
              drivers={drivers}
              adminPrimaryButtonClass={adminPrimaryButtonClass}
              adminSecondaryButtonClass={adminSecondaryButtonClass}
              adminDangerButtonClass={adminDangerButtonClass}
              isCancelledBooking={isCancelledBooking}
              getFlightNumberFromNotes={getFlightNumberFromNotes}
              getBookingPaymentMeta={getBookingPaymentMeta}
              formatRideLocation={formatRideLocation}
              formatTableRouteAddress={formatTableRouteAddress}
              isAirportLocation={isAirportLocation}
              getGoogleMapsUrl={getGoogleMapsUrl}
              getTelHref={getTelHref}
              getMailtoHref={getMailtoHref}
              getSelectedDriverId={getSelectedDriverId}
              getDriverSelectTone={getDriverSelectTone}
              confirmAndSendToDriver={confirmAndSendToDriver}
              handleUnassignDriver={handleUnassignDriver}
              setDriverSelection={setDriverSelection}
              openEditBooking={openEditBooking}
              handleStatusChange={handleStatusChange}
              formatPriceDisplay={formatPriceDisplay}
              getBookingDisplayNotes={getBookingDisplayNotes}
              getChildSeatCountsFromNotes={getChildSeatCountsFromNotes}
              getHandLuggageCountFromNotes={getHandLuggageCountFromNotes}
            />
          )}
          {currentTab === 'drivers' && (
            <AdminDriversPanel
              drivers={drivers}
              handleDeleteDriver={handleDeleteDriver}
              handleAddDriver={handleAddDriver}
              adminPrimaryButtonClass={adminPrimaryButtonClass}
            />
          )}
          {currentTab === 'stats' && (
            <AdminStatsPanel
              statsData={statsData}
              statsRange={statsRange}
              statsPaymentFilter={statsPaymentFilter}
              statsDriverFilter={statsDriverFilter}
              setStatsRange={setStatsRange}
              setStatsPaymentFilter={setStatsPaymentFilter}
              setStatsDriverFilter={setStatsDriverFilter}
            />
          )}
        </div>
      </main>

      <AdminBookingEditModal
        editingBooking={editingBooking}
        setEditingBooking={setEditingBooking}
        handleSaveBookingEdit={handleSaveBookingEdit}
        adminEditMetaCardClass={adminEditMetaCardClass}
        adminEditSectionLabelClass={adminEditSectionLabelClass}
        adminEditChoiceCardBaseClass={adminEditChoiceCardBaseClass}
        adminEditSelectClass={adminEditSelectClass}
        adminEditMetricCardClass={adminEditMetricCardClass}
        adminEditMetricSelectClass={adminEditMetricSelectClass}
        adminIconCloseButtonClass={adminIconCloseButtonClass}
        editDirection={editDirection}
        handleEditDirectionChange={handleEditDirectionChange}
        editFlightNumber={editFlightNumber}
        setEditFlightNumber={setEditFlightNumber}
        editAddress={editAddress}
        handleEditAddressChange={handleEditAddressChange}
        editForm={editForm}
        setEditForm={setEditForm}
        editExtraStop={editExtraStop}
        setEditExtraStop={setEditExtraStop}
        editExtraStopAddress={editExtraStopAddress}
        handleExtraStopAddressChange={handleExtraStopAddressChange}
        isEditDatePickerOpen={isEditDatePickerOpen}
        setIsEditDatePickerOpen={setIsEditDatePickerOpen}
        isEditTimePickerOpen={isEditTimePickerOpen}
        setIsEditTimePickerOpen={setIsEditTimePickerOpen}
        editDate={editDate}
        setEditDate={setEditDate}
        editTime={editTime}
        setEditTime={setEditTime}
        editChildSeat={editChildSeat}
        setEditChildSeat={setEditChildSeat}
        editBabySeats={editBabySeats}
        setEditBabySeats={setEditBabySeats}
        editChildSeats={editChildSeats}
        setEditChildSeats={setEditChildSeats}
        editBoosterSeats={editBoosterSeats}
        setEditBoosterSeats={setEditBoosterSeats}
        editPaymentMethod={editPaymentMethod}
        setEditPaymentMethod={setEditPaymentMethod}
        editHandLuggage={editHandLuggage}
        setEditHandLuggage={setEditHandLuggage}
        savingEdit={savingEdit}
        adminSecondaryButtonClass={adminSecondaryButtonClass}
        adminPrimaryButtonClass={adminPrimaryButtonClass}
      />
    </div>
  );
}




