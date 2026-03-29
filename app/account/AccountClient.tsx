'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock3,
  Edit,
  Globe,
  History,
  House,
  LogOut,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import AccountMobileBottomNav from '@/components/account/AccountMobileBottomNav';
import BookingForm from '@/components/BookingForm';
import { BookingDirection, BookingInfoPanel } from '@/components/booking/BookingInfoPanel';
import { logout } from '@/app/(auth)/actions';
import { parseBookingNotes } from '@/lib/booking/notes';
import {
  addFavoriteAddress,
  cancelOwnBooking,
  deleteOwnAccount,
  deleteFavoriteAddress,
  loadAccountBookings,
  loadFavoriteAddresses,
  submitBookingReview,
  updateAccountProfile,
} from './actions';

type AccountTab = 'start' | 'profil' | 'favoriten' | 'buchungsverlauf';

type Favorite = {
  id: string;
  city: string;
  zip: string;
  street: string;
  house_number: string;
};

type Booking = {
  id: string;
  booking_reference?: string | null;
  pickup_at: string;
  pickup: string;
  destination: string;
  status: string;
  price?: number | null;
  driver_id?: string | null;
  confirm_token?: string | null;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  passengers?: number | null;
  luggage?: number | null;
  vehicle_type?: string | null;
  notes?: string | null;
  review_rating?: number | null;
  review_comment?: string | null;
};

type BookingFilter = 'all' | 'upcoming' | 'previous' | 'canceled' | 'to_airport' | 'from_airport';
type AccountPanel = 'language' | 'delete' | 'favorite-add' | 'profile-edit' | null;

const languageOptions = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Francais' },
  { code: 'es', label: 'Espanol' },
  { code: 'it', label: 'Italiano' },
  { code: 'hu', label: 'Magyar' },
  { code: 'tr', label: 'Tuerkce' },
] as const;

export default function AccountClient({
  userEmail,
  initialName,
  initialPhone,
  initialFavorites,
  initialBookings,
  initialRequestedTab,
  initialOpenPanel,
  initialFavoritesLoaded,
  initialBookingsLoaded,
}: {
  userEmail: string;
  initialName: string;
  initialPhone: string;
  initialFavorites: Favorite[];
  initialBookings: Booking[];
  initialRequestedTab: AccountTab;
  initialOpenPanel: AccountPanel;
  initialFavoritesLoaded: boolean;
  initialBookingsLoaded: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [name, setName] = useState(initialName || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites || []);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings || []);
  const [favAddress, setFavAddress] = useState('');
  const [showFavoriteForm, setShowFavoriteForm] = useState(false);
  const [pendingFavoriteSlot, setPendingFavoriteSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [reviewSavingId, setReviewSavingId] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('upcoming');
  const [activeTab, setActiveTab] = useState<AccountTab>(initialRequestedTab);
  const [bookingDirection, setBookingDirection] = useState<BookingDirection>('to_airport');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [openPanel, setOpenPanel] = useState<AccountPanel>(initialOpenPanel);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingAccount, startDeleteTransition] = useTransition();
  const [isPending, startTransition] = useTransition();
  const [favoritesLoaded, setFavoritesLoaded] = useState(initialFavoritesLoaded);
  const [bookingsLoaded, setBookingsLoaded] = useState(initialBookingsLoaded);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const accountShellClass = 'w-full';
  const contentSectionClass = 'pt-2';
  const accountSectionTitleClass = 'ui-heading-lg mb-6 text-[#111827]';
  const accountSectionIntroClass = 'ui-text-block-sm gap-6';
  const accountSectionStackClass = 'flex flex-col gap-6';
  const bookingsMonthGroupClass = 'space-y-3';
  const bookingsMonthTitleClass =
    'text-[1.6rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[1.8rem]';
  const firstName = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0];
  const currentHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      hour12: false,
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'hour')?.value ?? '0',
  );
  const greetingBase = currentHour < 11 ? 'Guten Morgen' : currentHour < 18 ? 'Guten Tag' : 'Guten Abend';
  const greetingLabel = firstName ? `${greetingBase} ${firstName}!` : `${greetingBase}!`;
  const accountSecondaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] border border-[#dbe7f8] bg-white px-8 py-4 text-[1.0625rem] font-medium leading-none tracking-normal text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]';
  const accountDangerButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] border border-[#f1d1d6] bg-white px-8 py-4 text-[1.0625rem] font-medium leading-none tracking-normal text-[#d70015] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#fff4f6]';
  const activeLanguage = searchParams.get('lang')?.toLowerCase() || 'de';
  const activeLanguageLabel =
    languageOptions.find((option) => option.code === activeLanguage)?.label || 'Deutsch';
  useEffect(() => {
    if (!isLogoutConfirmOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLogoutConfirmOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isLogoutConfirmOpen]);
  useEffect(() => {
    if (!isDeleteConfirmOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDeleteConfirmOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isDeleteConfirmOpen]);

  const buildAccountHref = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const nextSearch = params.toString();
    return `${pathname}${nextSearch ? `?${nextSearch}` : ''}`;
  };
  const openProfileEditor = () => {
    setError(null);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      router.push(buildAccountHref({ tab: 'profil', panel: 'profile-edit' }));
      return;
    }
    setIsEditingProfile(true);
  };
  const placeFavoriteIntoSlot = (favorite: Favorite, slotIndex: number | null) => {
    setFavorites((prev) => {
      if (slotIndex === null || slotIndex < 0) {
        return [...prev, favorite];
      }

      const next = [...prev];
      next.splice(slotIndex, 0, favorite);
      return next.slice(0, favoriteSlotItems.length);
    });
  };
  const favoriteSlotItems = [
    {
      title: 'Home',
      emptyLabel: 'Add Home',
      filledIcon: House,
      emptyIcon: House,
    },
    {
      title: 'Work',
      emptyLabel: 'Add Work',
      filledIcon: Building2,
      emptyIcon: Building2,
    },
    {
      title: 'Place',
      emptyLabel: 'Add a new place',
      filledIcon: MapPin,
      emptyIcon: Plus,
    },
  ] as const;

  const fmtPrice = (value: number | null | undefined) =>
    `${new Intl.NumberFormat('de-AT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0))} \u20ac`;

  const fmtMonthYear = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));

  const fmtRideMeta = (value: string) =>
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .format(new Date(value))
      .replace(',', ' ·');

  const isCanceled = (status: string) => {
    const normalized = String(status || '').toLowerCase();
    return normalized === 'canceled' || normalized === 'cancelled';
  };

  const isCompleted = (status: string) => String(status || '').toLowerCase() === 'completed';

  const canCancel = (booking: Booking) => {
    if (booking.driver_id) return false;
    const normalized = String(booking.status || '').toLowerCase();
    return normalized !== 'completed' && normalized !== 'canceled' && normalized !== 'cancelled';
  };

  const isCancelWindowExpired = (booking: Booking) => {
    const pickupDate = new Date(String(booking.pickup_at || ''));
    if (Number.isNaN(pickupDate.getTime())) return true;

    const pickupHourVienna = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Vienna',
        hour: '2-digit',
        hour12: false,
      })
        .formatToParts(pickupDate)
        .find((part) => part.type === 'hour')?.value ?? '0',
    );
    const isNightTime = pickupHourVienna >= 22 || pickupHourVienna < 7;
    const minLeadTimeHours = isNightTime ? 8 : 3;
    const cutoff = Date.now() + minLeadTimeHours * 60 * 60 * 1000;

    return pickupDate.getTime() < cutoff;
  };

  const isToAirport = (booking: Booking) =>
    String(booking.destination || '').toLowerCase().includes('flughafen');
  const isFromAirport = (booking: Booking) =>
    String(booking.pickup || '').toLowerCase().includes('flughafen');
  const isUpcoming = (booking: Booking) => new Date(String(booking.pickup_at || '')).getTime() >= Date.now();
  const isPrevious = (booking: Booking) => new Date(String(booking.pickup_at || '')).getTime() < Date.now();
  const isAirportLocation = (value: string) => /flughafen\s+wien/i.test(String(value || ''));
  const getGoogleMapsUrl = (value: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value || '')}`;

  const parseFavoriteAddressInput = (value: string) => {
    const raw = value.trim().replace(/\s+/g, ' ');
    const zipCityMatch = raw.match(/(\d{4})\s+([A-Za-zÄÖÜäöüß\-\s]+)$/);

    if (!zipCityMatch) {
      return null;
    }

    const zip = zipCityMatch[1];
    const city = zipCityMatch[2].trim();
    const beforeZipCity = raw.slice(0, zipCityMatch.index).replace(/,\s*$/, '').trim();
    const houseNumberMatch = beforeZipCity.match(/(.+?)\s+(\d+[A-Za-z0-9\/-]*)$/);

    if (!houseNumberMatch) {
      return null;
    }

    const street = houseNumberMatch[1].trim();
    const houseNumber = houseNumberMatch[2].trim();

    return {
      city,
      zip,
      street,
      house_number: houseNumber,
    };
  };

  const filteredBookings = bookings
    .filter((booking) => {
      switch (bookingFilter) {
        case 'all':
          return true;
        case 'upcoming':
          return !isCanceled(booking.status) && isUpcoming(booking);
        case 'previous':
          return isPrevious(booking) || isCanceled(booking.status);
        case 'canceled':
          return isCanceled(booking.status);
        case 'to_airport':
          return !isCanceled(booking.status) && isToAirport(booking);
        case 'from_airport':
          return !isCanceled(booking.status) && isFromAirport(booking);
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const aTime = new Date(a.pickup_at).getTime();
      const bTime = new Date(b.pickup_at).getTime();
      return bookingFilter === 'upcoming' ? aTime - bTime : bTime - aTime;
    });

  const groupedBookings = filteredBookings.reduce<
    { month: string; items: Booking[] }[]
  >((groups, booking) => {
    const month = fmtMonthYear(booking.pickup_at);
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup.month !== month) {
      groups.push({ month, items: [booking] });
      return groups;
    }
    lastGroup.items.push(booking);
    return groups;
  }, []);
  useEffect(() => {
    setActiveTab(initialRequestedTab);
  }, [initialRequestedTab]);

  useEffect(() => {
    setOpenPanel(initialOpenPanel);
  }, [initialOpenPanel]);

  useEffect(() => {
    setFavorites(initialFavorites || []);
    setFavoritesLoaded(initialFavoritesLoaded);
  }, [initialFavorites, initialFavoritesLoaded]);

  useEffect(() => {
    setBookings(initialBookings || []);
    setBookingsLoaded(initialBookingsLoaded);
  }, [initialBookings, initialBookingsLoaded]);

  useEffect(() => {
    const shouldLoadFavorites = activeTab === 'favoriten' || activeTab === 'profil';
    if (shouldLoadFavorites && !favoritesLoaded && !favoritesLoading) {
      setFavoritesLoading(true);
      void loadFavoriteAddresses().then((res) => {
        if ((res as { error?: string }).error) {
          setError((res as { error: string }).error);
        } else {
          setFavorites(((res as { favorites?: Favorite[] }).favorites || []) as Favorite[]);
          setFavoritesLoaded(true);
        }
        setFavoritesLoading(false);
      });
    }
  }, [activeTab, favoritesLoaded, favoritesLoading]);

  useEffect(() => {
    if (activeTab === 'buchungsverlauf' && !bookingsLoaded && !bookingsLoading) {
      setBookingsLoading(true);
      void loadAccountBookings().then((res) => {
        if ((res as { error?: string }).error) {
          setBookingError((res as { error: string }).error);
        } else {
          setBookings(((res as { bookings?: Booking[] }).bookings || []) as Booking[]);
          setBookingsLoaded(true);
        }
        setBookingsLoading(false);
      });
    }
  }, [activeTab, bookingsLoaded, bookingsLoading]);

  return (
    <div suppressHydrationWarning className="bg-[#f7f9fc] pb-28 pt-[30px] md:pb-14 md:pt-0">
      <div className="app-container">
        <div className={`${accountShellClass} space-y-6`}>
          {activeTab === 'start' ? (
            <section className="space-y-4 md:pt-[30px]">
              <div className="px-1 md:px-2">
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="hidden md:block">
                    <AccountMobileBottomNav
                      placement="inline"
                      active="start"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h1 className="text-[2rem] font-semibold leading-[1.03] tracking-[-0.06em] text-[#111827] md:text-[2.35rem]">
                      {greetingLabel}
                    </h1>
                    <p className="text-[1rem] leading-[1.6] text-[#6a7d96] md:text-[1.05rem]">
                      Hier kannst du deine naechste Fahrt buchen.
                    </p>
                  </div>
                  <div className="md:hidden">
                    <AccountMobileBottomNav
                      placement="inline"
                      active="start"
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="hidden md:block md:pt-[30px]">
              <div className="px-1 md:px-2">
                <div className="w-full">
                  <div className="w-full">
                    <AccountMobileBottomNav
                      placement="inline"
                      active={activeTab === 'profil' ? 'profil' : 'fahrten'}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'start' ? (
            <section className="space-y-6">
              <div className="grid items-start gap-6 md:grid-cols-2">
                <section className="order-1 min-w-0 self-start md:sticky md:top-6">
                  <div className="ui-card-surface-light px-4 py-4 md:px-5 md:py-5">
                    <BookingForm
                      onDirectionChange={setBookingDirection}
                      showStepIndicator={false}
                      showInfoTrigger
                      initialFavorites={favorites}
                      initialIsLoggedIn
                      initialAccountDefaults={{
                        fullName: name,
                        phone,
                        email: userEmail,
                      }}
                    />
                  </div>
                </section>
                <aside className="hidden min-w-0 self-start md:block">
                  <BookingInfoPanel direction={bookingDirection} />
                </aside>
              </div>

            </section>
          ) : null}

          {activeTab === 'profil' ? (
            <section className={`${contentSectionClass} max-w-[68rem]`}>
              <div className={accountSectionStackClass}>
                {!isEditingProfile ? (
                  <div className="space-y-5">
                    <div className="rounded-[1.35rem] border border-[#e9edf3] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
                      <button
                        type="button"
                        onClick={openProfileEditor}
                        aria-label="Profil bearbeiten"
                        className="flex w-full items-center gap-4 text-left transition-colors hover:text-[#111827]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#676767]">
                          <Edit size={22} strokeWidth={1.8} />
                        </span>
                        <p className="min-w-0 text-[1.15rem] font-semibold tracking-[-0.03em] text-[#111827]">
                          {name || 'Kein Name hinterlegt'}
                        </p>
                      </button>
                    </div>

                    <div className="rounded-[1.55rem] border border-[#ece7df] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            router.push(buildAccountHref({ tab: 'profil', panel: 'language' }));
                            return;
                          }
                          setIsLanguageExpanded((prev) => !prev);
                        }}
                        className="flex w-full items-start gap-4 py-3 text-left"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#676767]">
                          <Globe size={24} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[1rem] font-medium text-[#111827]">Sprache</p>
                          <p className="text-[0.95rem] leading-6 text-[#6a6a6a]">{activeLanguageLabel}</p>
                        </div>
                        <span className="hidden h-10 w-10 shrink-0 items-center justify-center text-[#676767] md:flex">
                          <ChevronDown
                            size={18}
                            strokeWidth={2}
                            className={`transition-transform ${isLanguageExpanded ? 'rotate-180' : ''}`}
                          />
                        </span>
                      </button>

                      {isLanguageExpanded ? (
                        <div className="border-t border-[#efebe4] pb-2 pt-4">
                          <div className="rounded-[1.5rem] border border-[#e8e8ed] bg-white p-3 shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
                            <div className="grid grid-cols-2 gap-1">
                            {languageOptions.map((option) => {
                              const selected = option.code === activeLanguage;
                              return (
                                <button
                                  key={option.code}
                                  type="button"
                                  onClick={() => {
                                    router.push(buildAccountHref({ lang: option.code }));
                                    setIsLanguageExpanded(false);
                                  }}
                                  className={`flex items-center justify-between rounded-[16px] px-3 py-3 text-left text-[15px] font-medium transition-colors ${
                                    selected ? 'bg-[#f5f5f7] text-[#111111]' : 'text-[#111111] hover:bg-[#f5f5f7]'
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  <span className="text-[13px] font-semibold uppercase text-[#6b7280]">
                                    {option.code}
                                  </span>
                                </button>
                              );
                            })}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                  </div>
                ) : (
                  <form
                    action={(formData) => {
                      setError(null);
                      startTransition(async () => {
                        const res = await updateAccountProfile(formData);
                        if ((res as { error?: string })?.error) {
                          setError((res as { error: string }).error);
                          return;
                        }
                        setIsEditingProfile(false);
                      });
                    }}
                    className="grid grid-cols-1 gap-3"
                  >
                    <input
                      name="full_name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="ui-input"
                      placeholder="Name"
                      required
                    />
                    <input
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="ui-input"
                      placeholder="Telefon"
                      required
                    />
                    <input
                      value={userEmail}
                      readOnly
                      aria-label="E-Mail kann nicht geaendert werden"
                      className="ui-input cursor-not-allowed border-[#e5e7eb] bg-[#f3f4f6] text-[#8b95a7]"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="ui-button-booking-primary"
                      >
                        {isPending ? 'Speichern...' : 'Profil speichern'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setIsEditingProfile(false);
                        }}
                        className={accountSecondaryButtonClass}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="space-y-6 pt-2">
                {favoritesLoading ? (
                  <p className="text-sm text-[#6a7d96]">Favoriten werden geladen...</p>
                ) : null}

                <div className="rounded-[1.55rem] border border-[#ece7df] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
                  <div className="space-y-1">
                    <p className="text-[1.9rem] font-semibold tracking-[-0.05em] text-[#111827]">
                      Favoriten
                    </p>
                    <p className="text-[0.95rem] leading-6 text-[#6a7d96]">
                      Gespeicherte Adressen
                    </p>
                  </div>

                  <div className="mt-4">
                    {favoriteSlotItems.map((slot, index) => {
                      const favorite = favorites[index];
                      const FilledIcon = slot.filledIcon;
                      const EmptyIcon = slot.emptyIcon;

                      if (favorite) {
                        return (
                          <div
                            key={favorite.id}
                            className={`flex items-start justify-between gap-3 py-4 ${
                              index > 0 ? 'border-t border-[#efebe4]' : ''
                            }`}
                          >
                            <div className="flex min-w-0 items-start gap-4">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#676767]">
                                <FilledIcon size={24} strokeWidth={1.8} />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[1rem] font-medium text-[#111827]">{slot.title}</p>
                                <p className="truncate text-[0.95rem] leading-6 text-[#6a6a6a]">
                                  {favorite.street} {favorite.house_number}, {favorite.city} {favorite.zip}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                startTransition(async () => {
                                  if (!confirm('Moechten Sie diesen Favoriten loeschen?')) return;
                                  const res = await deleteFavoriteAddress(favorite.id);
                                  if ((res as { error?: string })?.error) {
                                    setError((res as { error: string }).error);
                                    return;
                                  }
                                  setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
                                })
                              }
                              aria-label="Favorit loeschen"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8a8a8a] transition-colors hover:bg-[#fff4f6] hover:text-[#d70015]"
                            >
                              <X size={16} strokeWidth={2.1} />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot.emptyLabel}
                          type="button"
                          onClick={() => {
                            setError(null);
                            setPendingFavoriteSlot(index);
                            if (window.innerWidth < 768) {
                              setOpenPanel('favorite-add');
                              return;
                            }
                            setShowFavoriteForm(true);
                          }}
                          className={`flex w-full items-center gap-4 py-4 text-left transition-colors hover:text-[#111827] ${
                            index > 0 ? 'border-t border-[#efebe4]' : ''
                          }`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#111111]">
                            <EmptyIcon size={24} strokeWidth={1.8} />
                          </span>
                          <span className="text-[1rem] font-medium text-[#2f2f2f]">{slot.emptyLabel}</span>
                        </button>
                      );
                    })}

                  </div>

                  {showFavoriteForm ? (
                    <form
                    action={() => {
                      setError(null);
                      startTransition(async () => {
                        const parsedAddress = parseFavoriteAddressInput(favAddress);
                        if (!parsedAddress) {
                          setError('Bitte Adresse im Format "Strasse Nr., 1234 Stadt" eingeben.');
                          return;
                        }

                        const formData = new FormData();
                        formData.set('city', parsedAddress.city);
                        formData.set('zip', parsedAddress.zip);
                        formData.set('street', parsedAddress.street);
                        formData.set('house_number', parsedAddress.house_number);

                        const res = await addFavoriteAddress(formData);
                        if ((res as { error?: string })?.error) {
                          setError((res as { error: string }).error);
                          return;
                        }
                        const inserted = (res as { favorite?: Favorite }).favorite;
                        if (inserted?.id) {
                          placeFavoriteIntoSlot(inserted, pendingFavoriteSlot);
                        }
                        setFavAddress('');
                        setShowFavoriteForm(false);
                        setPendingFavoriteSlot(null);
                      });
                    }}
                    className="mt-5 grid grid-cols-1 gap-3 border-t border-[#efebe4] pt-5"
                  >
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        value={favAddress}
                        onChange={(e) => setFavAddress(e.target.value)}
                        className="ui-input"
                        placeholder="Adresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                        disabled={isPending}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="ui-button-booking-primary w-full sm:w-auto sm:min-w-[220px] sm:justify-self-start"
                    >
                      {isPending ? 'Speichert...' : 'Speichern'}
                    </button>
                  </form>
                  ) : null}
                </div>

                {error ? <p className="text-sm text-[#d70015]">{error}</p> : null}

                <div className="rounded-[1.55rem] border border-[#ece7df] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
                  <button
                    type="button"
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:text-[#111827]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#676767]">
                      <LogOut size={24} strokeWidth={1.8} />
                    </span>
                    <span className="text-[1rem] font-medium text-[#111827]">Abmelden</span>
                  </button>

                  <div className="border-t border-[#efebe4]" />

                  <button
                    type="button"
                    disabled={isDeletingAccount}
                    onClick={() => {
                      setError(null);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#676767]">
                      <Trash2 size={24} strokeWidth={1.8} />
                    </span>
                    <span className="text-[1rem] font-medium text-[#111827]">Konto loeschen</span>
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === 'buchungsverlauf' ? (
            <section className={contentSectionClass}>
              <div className="flex flex-col gap-6">
                <div className="px-1 py-1 md:px-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex w-full flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('buchungsverlauf');
                          setBookingFilter('upcoming');
                        }}
                          className={`inline-flex min-w-[3.25rem] items-center justify-center gap-2 rounded-[1.05rem] border px-3 py-3 text-[1.02rem] font-medium shadow-[0_8px_18px_rgba(17,17,17,0.04)] transition-all sm:min-w-[9.5rem] sm:px-4 ${
                            activeTab === 'buchungsverlauf' && bookingFilter === 'upcoming'
                              ? 'border-[#dbe7f8] bg-[#FDFDFE] text-[#0a63ff]'
                              : 'border-[#e2e8f2] bg-[#FDFDFE] text-[#657489] hover:text-[#111827]'
                          }`}
                          aria-label="Kommend"
                        >
                          <Calendar size={18} />
                          <span className="hidden sm:inline">Kommend</span>
                        </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('buchungsverlauf');
                          setBookingFilter('previous');
                        }}
                          className={`inline-flex min-w-[3.25rem] items-center justify-center gap-2 rounded-[1.05rem] border px-3 py-3 text-[1.02rem] font-medium shadow-[0_8px_18px_rgba(17,17,17,0.04)] transition-all sm:min-w-[9.5rem] sm:px-4 ${
                            activeTab === 'buchungsverlauf' && bookingFilter === 'previous'
                              ? 'border-[#dbe7f8] bg-[#FDFDFE] text-[#0a63ff]'
                              : 'border-[#e2e8f2] bg-[#FDFDFE] text-[#657489] hover:text-[#111827]'
                          }`}
                          aria-label="Vergangen"
                        >
                          <Clock3 size={18} />
                          <span className="hidden sm:inline">Vergangen</span>
                        </button>
                    </div>
                  </div>
                </div>

                {activeTab === 'buchungsverlauf' ? (
                  <>
                    {bookingsLoading ? (
                      <p className="text-[#6a7d96]">Buchungsverlauf wird geladen...</p>
                    ) : null}

                    <div className="space-y-8">
                      {groupedBookings.map((group) => (
                        <div key={group.month} className={bookingsMonthGroupClass}>
                          <h3 className={bookingsMonthTitleClass}>
                            {group.month}
                          </h3>

                          <div className="mt-6 space-y-2 md:mt-7">
                            {group.items.map((b) => {
                          const primaryLocation = isToAirport(b) ? b.pickup : b.destination;
                          const secondaryLocation = isToAirport(b)
                            ? 'Zum Flughafen Wien'
                            : 'Ab Flughafen Wien';
                          const hasMapLink = !isAirportLocation(primaryLocation);
                          const parsedNotes = parseBookingNotes(b.notes);
                          const seats = parsedNotes.childSeatCounts;
                          const reviewDraft = reviewDrafts[b.id] || {
                            rating: Number(b.review_rating || 0),
                            comment: b.review_comment || '',
                          };
                          const showCancelAction =
                            bookingFilter === 'upcoming' &&
                            !isCanceled(b.status) &&
                            !isCancelWindowExpired(b);
                          const isExpanded = expandedBookingId === b.id;

                          return (
                            <div
                              key={b.id}
                              className={`rounded-[1.55rem] border border-[#dde6f2] bg-white px-4 py-4 shadow-[0_10px_26px_rgba(17,17,17,0.03)] md:px-5 ${
                                isCanceled(b.status) ? 'opacity-70' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3 md:gap-4">
                                <div className="flex h-11 w-11 shrink-0 self-center items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679FF] md:h-12 md:w-12">
                                  <Car size={18} className="md:h-[20px] md:w-[20px]" />
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedBookingId((prev) => (prev === b.id ? null : b.id))
                                  }
                                  className="flex min-w-0 flex-1 items-start gap-4 text-left"
                                  aria-expanded={isExpanded}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-[#7b8798] md:text-[0.88rem]">
                                      <span>{fmtRideMeta(b.pickup_at)}</span>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-[1.06rem] font-semibold leading-[1.26] tracking-[-0.03em] text-[#111827] md:text-[1.24rem]">
                                      {primaryLocation}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                      <p className="text-[0.82rem] text-[#6a7d96] md:text-[0.9rem]">{secondaryLocation}</p>
                                      {isCanceled(b.status) ? (
                                        <span className="rounded-full border border-[#f1d1d6] bg-[#fff4f6] px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#d70015]">
                                          Storniert
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-2 text-[1rem] font-semibold text-[#111827]">
                                      {fmtPrice(b.price)}
                                    </p>
                                  </div>
                                  <ChevronDown
                                    size={16}
                                    className={`mt-1 shrink-0 text-[#7b8798] transition-transform md:h-4 md:w-4 ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>

                                {showCancelAction ? (
                                  <div className="shrink-0">
                                    <button
                                      type="button"
                                      disabled={!canCancel(b) || cancelingBookingId === b.id}
                                      onClick={() =>
                                        startTransition(async () => {
                                          setBookingError(null);
                                          setBookingNotice(null);
                                          if (!confirm('Moechten Sie diese Fahrt stornieren?')) return;
                                          setCancelingBookingId(b.id);
                                          const res = await cancelOwnBooking(b.id);
                                          setCancelingBookingId(null);
                                          if ((res as { error?: string })?.error) {
                                            setBookingError((res as { error: string }).error);
                                            return;
                                          }
                                          if ((res as { info?: string }).info === 'already_canceled') {
                                            setBookingNotice('Diese Buchung wurde bereits storniert.');
                                          } else {
                                            setBookingNotice('Buchung wurde storniert.');
                                          }
                                          setBookings((prev) =>
                                            prev.map((item) =>
                                              item.id === b.id
                                                ? {
                                                    ...item,
                                                    status:
                                                      (res as { status?: string }).status ||
                                                      (isCanceled(item.status) ? item.status : 'canceled'),
                                                  }
                                                : item,
                                            ),
                                          );
                                        })
                                      }
                                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f1d1d6] bg-[#fff4f6] text-[#d70015] transition-colors hover:bg-[#ffecef] disabled:cursor-not-allowed disabled:opacity-40 md:h-11 md:w-11"
                                      aria-label="Fahrt stornieren"
                                    >
                                      <XCircle size={18} className="md:h-[19px] md:w-[19px]" />
                                    </button>
                                  </div>
                                ) : null}
                              </div>

                              {isExpanded ? (
                                <div className="mt-4 grid gap-3 border-t border-[#edf2f7] pt-4 md:grid-cols-2">
                                  <div className="rounded-[1rem] border border-[#edf2f7] bg-[#f8fbff] px-4 py-3">
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679FF]">
                                      Route
                                    </p>
                                    <div className="mt-2 space-y-2 text-[0.95rem] text-[#111827]">
                                      <p><span className="font-semibold">Abholung:</span> {b.pickup}</p>
                                      <p><span className="font-semibold">Ziel:</span> {b.destination}</p>
                                      <p><span className="font-semibold">Referenz:</span> {b.booking_reference || b.id.slice(0, 8)}</p>
                                    </div>
                                  </div>

                                  <div className="rounded-[1rem] border border-[#edf2f7] bg-[#f8fbff] px-4 py-3">
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679FF]">
                                      Buchung
                                    </p>
                                    <div className="mt-2 space-y-2 text-[0.95rem] text-[#111827]">
                                      <p><span className="font-semibold">Name:</span> {b.full_name || '-'}</p>
                                      <p><span className="font-semibold">Telefon:</span> {b.phone || '-'}</p>
                                      <p><span className="font-semibold">E-Mail:</span> {b.email || '-'}</p>
                                      <p><span className="font-semibold">Fahrzeug:</span> {(b.vehicle_type || '-').toUpperCase()}</p>
                                      <p><span className="font-semibold">Personen:</span> {Number(b.passengers || 0)}</p>
                                      <p><span className="font-semibold">Koffer:</span> {Number(b.luggage || 0)}</p>
                                      <p><span className="font-semibold">Handgepaeck:</span> {parsedNotes.handLuggageCount || 0}</p>
                                    </div>
                                  </div>

                                  {(seats.baby > 0 || seats.child > 0 || seats.booster > 0 || parsedNotes.cleanedNotes) ? (
                                    <div className="rounded-[1rem] border border-[#edf2f7] bg-white px-4 py-3 md:col-span-2">
                                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679FF]">
                                        Zusatzinfos
                                      </p>
                                      <div className="mt-2 space-y-2 text-[0.95rem] text-[#111827]">
                                        {seats.baby > 0 ? <p><span className="font-semibold">Babyschale:</span> {seats.baby}</p> : null}
                                        {seats.child > 0 ? <p><span className="font-semibold">Kindersitz:</span> {seats.child}</p> : null}
                                        {seats.booster > 0 ? <p><span className="font-semibold">Sitzerhoehung:</span> {seats.booster}</p> : null}
                                        {parsedNotes.cleanedNotes ? (
                                          <p><span className="font-semibold">Anmerkung:</span> {parsedNotes.cleanedNotes}</p>
                                        ) : null}
                                      </div>
                                    </div>
                                  ) : null}

                                  {isPrevious(b) && !isCanceled(b.status) ? (
                                    <div className="rounded-[1rem] border border-[#edf2f7] bg-white px-4 py-3 md:col-span-2">
                                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679FF]">
                                        Fahrer bewerten
                                      </p>
                                      <p className="mt-2 text-[0.95rem] text-[#6a7d96]">
                                        Wie war Ihre Erfahrung mit dieser Fahrt?
                                      </p>
                                      <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() =>
                                              setReviewDrafts((prev) => ({
                                                ...prev,
                                                [b.id]: {
                                                  rating: star,
                                                  comment: reviewDraft.comment,
                                                },
                                              }))
                                            }
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679FF] transition-colors hover:bg-[#eef5ff]"
                                            aria-label={`${star} Sterne`}
                                          >
                                            <Star
                                              size={18}
                                              className={star <= reviewDraft.rating ? 'fill-current' : ''}
                                            />
                                          </button>
                                        ))}
                                      </div>
                                      <textarea
                                        value={reviewDraft.comment}
                                        onChange={(e) =>
                                          setReviewDrafts((prev) => ({
                                            ...prev,
                                            [b.id]: {
                                              rating: reviewDraft.rating,
                                              comment: e.target.value,
                                            },
                                          }))
                                        }
                                        placeholder="Optionaler Kommentar zu Fahrer und Fahrt"
                                        className="mt-3 min-h-[110px] w-full rounded-[1rem] border border-[#e8edf3] bg-[#f8fbff] px-4 py-3 text-[0.95rem] text-[#111827] outline-none transition-colors focus:border-[#1679FF]"
                                      />
                                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-[0.85rem] text-[#6a7d96]">
                                          {b.review_rating
                                            ? 'Ihre Bewertung kann aktualisiert werden.'
                                            : 'Noch keine Bewertung gespeichert.'}
                                        </p>
                                        <button
                                          type="button"
                                          disabled={reviewDraft.rating < 1 || reviewSavingId === b.id}
                                          onClick={() =>
                                            startTransition(async () => {
                                              setBookingError(null);
                                              setBookingNotice(null);
                                              setReviewSavingId(b.id);
                                              const res = await submitBookingReview({
                                                bookingId: b.id,
                                                rating: reviewDraft.rating,
                                                comment: reviewDraft.comment,
                                              });
                                              setReviewSavingId(null);
                                              if ((res as { error?: string }).error) {
                                                setBookingError((res as { error: string }).error);
                                                return;
                                              }
                                              const savedReview = (res as {
                                                review?: { rating: number; comment: string };
                                              }).review;
                                              setBookings((prev) =>
                                                prev.map((item) =>
                                                  item.id === b.id
                                                    ? {
                                                        ...item,
                                                        review_rating:
                                                          savedReview?.rating ?? reviewDraft.rating,
                                                        review_comment:
                                                          savedReview?.comment ?? reviewDraft.comment,
                                                      }
                                                    : item,
                                                ),
                                              );
                                              setBookingNotice('Bewertung wurde gespeichert.');
                                            })
                                          }
                                          className="ui-button-booking-primary disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {reviewSavingId === b.id
                                            ? 'Speichert...'
                                            : b.review_rating
                                              ? 'Bewertung aktualisieren'
                                              : 'Bewertung senden'}
                                        </button>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {groupedBookings.length === 0 ? (
                  <p className="text-[#6a7d96]">
                    {bookings.length === 0
                      ? 'Noch keine Buchungen vorhanden.'
                      : 'Keine Buchungen fuer diesen Filter.'}
                  </p>
                ) : null}
                {bookingNotice ? <p className="text-sm text-[#0a63ff]">{bookingNotice}</p> : null}
                {bookingError ? <p className="text-sm text-[#d70015]">{bookingError}</p> : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
      <AccountMobileBottomNav
        active={
          activeTab === 'start' ? 'start' : activeTab === 'profil' ? 'profil' : 'fahrten'
        }
      />
      {openPanel === 'language' ? (
        <div className="fixed inset-x-0 bottom-0 top-[66px] z-[120] bg-white text-[#111111] md:hidden">
          <div className="px-8 pt-8">
            <div className="flex flex-col items-start gap-8">
              {languageOptions.map((option) => {
                const selected = option.code === activeLanguage;
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => {
                      setOpenPanel(null);
                      router.push(buildAccountHref({ lang: option.code, panel: null }));
                    }}
                    className={`flex w-full items-center justify-between text-left text-[1.55rem] font-semibold tracking-[-0.05em] text-[#111111] ${
                      selected ? 'bg-[#f5f5f7]' : ''
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-[0.95rem] font-semibold uppercase text-[#6b7280]">
                      {option.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
      {openPanel === 'favorite-add' ? (
        <div className="fixed inset-0 z-[120] bg-white/96 text-[#111827] backdrop-blur-sm md:hidden">
          <div className="app-container min-h-screen animate-in slide-in-from-right-full duration-300 pt-[30px]">
            <div className="flex items-center gap-3 pb-6">
                <button
                  type="button"
                  onClick={() => {
                    setOpenPanel(null);
                    setFavAddress('');
                    setPendingFavoriteSlot(null);
                  }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111827]"
                aria-label="Zurueck"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <p className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[#111827]">Ort hinzufuegen</p>
                <p className="text-[0.95rem] text-[#6a6a6a]">Favorit fuer schnellere Buchungen speichern</p>
              </div>
            </div>

            <div className="rounded-[1.55rem] border border-[#ece7df] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
              <form
                action={() => {
                  setError(null);
                  startTransition(async () => {
                    const parsedAddress = parseFavoriteAddressInput(favAddress);
                    if (!parsedAddress) {
                      setError('Bitte Adresse im Format "Strasse Nr., 1234 Stadt" eingeben.');
                      return;
                    }

                    const formData = new FormData();
                    formData.set('city', parsedAddress.city);
                    formData.set('zip', parsedAddress.zip);
                    formData.set('street', parsedAddress.street);
                    formData.set('house_number', parsedAddress.house_number);

                    const res = await addFavoriteAddress(formData);
                    if ((res as { error?: string })?.error) {
                      setError((res as { error: string }).error);
                      return;
                    }
                    const inserted = (res as { favorite?: Favorite }).favorite;
                    if (inserted?.id) {
                      placeFavoriteIntoSlot(inserted, pendingFavoriteSlot);
                    }
                    setFavAddress('');
                    setShowFavoriteForm(false);
                    setPendingFavoriteSlot(null);
                    setOpenPanel(null);
                  });
                }}
                className="grid grid-cols-1 gap-3"
              >
                <input
                  value={favAddress}
                  onChange={(e) => setFavAddress(e.target.value)}
                  className="ui-input"
                  placeholder="Adresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                  disabled={isPending}
                  required
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="ui-button-booking-primary w-full justify-center"
                >
                  {isPending ? 'Speichert...' : 'Speichern'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
      {openPanel === 'profile-edit' ? (
        <div className="fixed inset-0 z-[120] bg-white/96 text-[#111827] backdrop-blur-sm md:hidden">
          <div className="app-container min-h-screen animate-in slide-in-from-right-full duration-300 pt-[30px]">
            <div className="flex items-center gap-3 pb-6">
              <button
                type="button"
                onClick={() => {
                  setOpenPanel(null);
                  router.push(buildAccountHref({ panel: null }));
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111827]"
                aria-label="Zurueck"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <p className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[#111827]">Profil bearbeiten</p>
                <p className="text-[0.95rem] text-[#6a6a6a]">Name und Telefonnummer aktualisieren</p>
              </div>
            </div>

            <div className="rounded-[1.55rem] border border-[#ece7df] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
              <form
                action={(formData) => {
                  setError(null);
                  startTransition(async () => {
                    const res = await updateAccountProfile(formData);
                    if ((res as { error?: string })?.error) {
                      setError((res as { error: string }).error);
                      return;
                    }
                    setOpenPanel(null);
                    router.push(buildAccountHref({ panel: null }));
                  });
                }}
                className="grid grid-cols-1 gap-3"
              >
                <input
                  name="full_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ui-input"
                  placeholder="Name"
                  required
                />
                <input
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="ui-input"
                  placeholder="Telefon"
                  required
                />
                <input
                  value={userEmail}
                  readOnly
                  aria-label="E-Mail kann nicht geaendert werden"
                  className="ui-input cursor-not-allowed border-[#e5e7eb] bg-[#f3f4f6] text-[#8b95a7]"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="ui-button-booking-primary w-full justify-center"
                >
                  {isPending ? 'Speichern...' : 'Profil speichern'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
      {isLogoutConfirmOpen ? (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-[rgba(17,17,17,0.18)] px-4 pb-6 pt-10 backdrop-blur-[2px] sm:items-center sm:px-6 sm:pb-10"
          onClick={() => setIsLogoutConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[34rem] rounded-[2rem] border border-[#ece7df] bg-white px-5 py-5 shadow-[0_18px_40px_rgba(17,17,17,0.12)] sm:px-6 sm:py-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-center">
              <p className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] sm:text-[2.2rem]">
                Abmelden?
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <form action={logout} className="w-full">
                <button type="submit" className={`${accountDangerButtonClass} w-full justify-center`}>
                  Abmelden
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className={`${accountSecondaryButtonClass} w-full justify-center`}
              >
                Zurueck
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isDeleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-[rgba(17,17,17,0.18)] px-4 pb-6 pt-10 backdrop-blur-[2px] sm:items-center sm:px-6 sm:pb-10"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[34rem] rounded-[2rem] border border-[#ece7df] bg-white px-5 py-5 shadow-[0_18px_40px_rgba(17,17,17,0.12)] sm:px-6 sm:py-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-center">
              <p className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] sm:text-[2.2rem]">
                Account loeschen?
              </p>
              <p className="mt-5 text-[1.08rem] leading-8 text-[#111827] sm:text-[1.2rem] sm:leading-9">
                Ihr Login, Profil und Ihre Favoriten werden entfernt. Buchungen bleiben fuer interne
                Nachvollziehbarkeit erhalten, aber E-Mail und Telefonnummer werden daraus entfernt.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => {
                  setError(null);
                  startDeleteTransition(async () => {
                    const res = await deleteOwnAccount();
                    if ((res as { error?: string })?.error) {
                      setError((res as { error: string }).error);
                      return;
                    }
                    window.location.assign('/login?account_deleted=1');
                  });
                }}
                className={`${accountDangerButtonClass} w-full justify-center disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isDeletingAccount ? 'Account wird geloescht...' : 'Account loeschen'}
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className={`${accountSecondaryButtonClass} w-full justify-center`}
              >
                Nicht loeschen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
