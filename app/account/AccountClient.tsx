'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  Car,
  ChevronDown,
  ChevronRight,
  Edit,
  LogOut,
  GraduationCap,
  Heart,
  History,
  House,
  MapPin,
  Star,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import UnderlineTabNav from '@/components/ui/UnderlineTabNav';
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

type AccountTab = 'profil' | 'favoriten' | 'buchungsverlauf';

type Favorite = {
  id: string;
  name: string;
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
type FavoritePreset = 'House' | 'Office' | 'School';

export default function AccountClient({
  userEmail,
  initialName,
  initialPhone,
  initialFavorites,
  initialBookings,
  initialRequestedTab,
  initialFavoritesLoaded,
  initialBookingsLoaded,
}: {
  userEmail: string;
  initialName: string;
  initialPhone: string;
  initialFavorites: Favorite[];
  initialBookings: Booking[];
  initialRequestedTab: AccountTab;
  initialFavoritesLoaded: boolean;
  initialBookingsLoaded: boolean;
}) {
  const [name, setName] = useState(initialName || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites || []);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings || []);
  const [favLabel, setFavLabel] = useState('');
  const [favAddress, setFavAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [reviewSavingId, setReviewSavingId] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('upcoming');
  const [activeTab, setActiveTab] = useState<AccountTab>(initialRequestedTab);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDeletingAccount, startDeleteTransition] = useTransition();
  const [isPending, startTransition] = useTransition();
  const [favoritesLoaded, setFavoritesLoaded] = useState(initialFavoritesLoaded);
  const [bookingsLoaded, setBookingsLoaded] = useState(initialBookingsLoaded);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const accountShellClass = 'mx-auto max-w-[57.5rem]';
  const contentSectionClass = 'pt-2';
  const accountSectionTitleClass = 'ui-heading-lg mb-6 text-[#111827]';
  const accountSectionIntroClass = 'ui-text-block-sm gap-6';
  const accountSectionStackClass = 'flex flex-col gap-6';
  const bookingsMonthGroupClass = 'space-y-3';
  const bookingsMonthTitleClass =
    'text-[1.6rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[1.8rem]';
  const accountSecondaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] border border-[#dbe7f8] bg-white px-8 py-4 text-[1.0625rem] font-medium leading-none tracking-normal text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]';
  const accountDangerButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] border border-[#f1d1d6] bg-white px-8 py-4 text-[1.0625rem] font-medium leading-none tracking-normal text-[#d70015] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#fff4f6]';
  const hasReachedFavoriteLimit = favorites.length >= 3;
  const shouldShowFavoritesEmptyState =
    activeTab === 'favoriten' && favoritesLoaded && !favoritesLoading && favorites.length === 0;
  const favoritePresetItems: { label: FavoritePreset; icon: typeof House }[] = [
    { label: 'House', icon: House },
    { label: 'Office', icon: Building2 },
    { label: 'School', icon: GraduationCap },
  ];

  const getFavoriteIcon = (label: string) => {
    const normalized = String(label || '').toLowerCase();
    if (normalized === 'house' || normalized === 'home') return House;
    if (normalized === 'office' || normalized === 'work') return Building2;
    if (normalized === 'school') return GraduationCap;
    return MapPin;
  };

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
      name: street,
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
    if (activeTab === 'favoriten' && !favoritesLoaded && !favoritesLoading) {
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
    <div suppressHydrationWarning className="bg-white pb-14 pt-24 lg:pt-28">
      <div className="app-container">
        <div className={`${accountShellClass} space-y-6`}>
          <section className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start justify-between gap-4">
                <h1 className="ui-heading-lg text-[#111827]">Mein Konto</h1>
                <form action={logout} className="md:hidden">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 text-[0.95rem] font-medium leading-none text-[#1679ff] transition-colors hover:text-[#0a63ff]"
                  >
                    <LogOut size={15} />
                    Abmelden
                  </button>
                </form>
              </div>
              <form action={logout} className="hidden md:block">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[#1679ff] transition-colors hover:text-[#0a63ff]"
                >
                  <LogOut size={16} />
                  Abmelden
                </button>
              </form>
            </div>

            <UnderlineTabNav
              className="flex flex-wrap items-center gap-6 border-b border-[#e9edf3] pb-2"
              items={[
                { id: 'buchungsverlauf', label: '', icon: <History size={16} /> },
                { id: 'favoriten', label: '', icon: <Heart size={16} /> },
                { id: 'profil', label: '', icon: <User size={16} /> },
              ]}
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab as AccountTab)}
            />
          </section>

          {activeTab === 'profil' ? (
            <section className={`${contentSectionClass} max-w-[44rem]`}>
              <div className={accountSectionStackClass}>
                <h2 className={accountSectionTitleClass}>Profil</h2>
                {!isEditingProfile ? (
                  <div className="rounded-[1.35rem] border border-[#e9edf3] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#111827]">
                          {name || 'Kein Name hinterlegt'}
                        </p>
                        <p className="text-[0.95rem] text-[#6a7d96]">{userEmail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setIsEditingProfile(true);
                        }}
                        aria-label="Profil bearbeiten"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#eef5ff] hover:text-[#0a63ff]"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                    <div className="mt-5 border-t border-[#edf2f7] pt-5">
                      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[#d70015]">
                        Konto loeschen
                      </p>
                      <p className="mt-2 max-w-[32rem] text-[0.95rem] text-[#6a7d96]">
                        Ihr Login, Profil und Ihre Favoriten werden entfernt. Buchungen bleiben fuer
                        interne Nachvollziehbarkeit erhalten, aber E-Mail und Telefonnummer werden
                        daraus entfernt.
                      </p>
                      <button
                        type="button"
                        disabled={isDeletingAccount}
                        onClick={() => {
                          if (
                            !confirm(
                              'Moechten Sie Ihr Konto wirklich loeschen? Ihr Login und Ihre Favoriten werden entfernt.',
                            )
                          ) {
                            return;
                          }
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
                        className={`${accountDangerButtonClass} mt-4 disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {isDeletingAccount ? 'Konto wird geloescht...' : 'Konto loeschen'}
                      </button>
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
              {error ? <p className="mt-3 text-sm text-[#d70015]">{error}</p> : null}
            </section>
          ) : null}

          {activeTab === 'favoriten' ? (
            <section className={`${contentSectionClass} max-w-[44rem]`}>
              <div className={accountSectionStackClass}>
                <h2 className={accountSectionTitleClass}>Favoriten</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {favoritesLoading ? (
                    <p className="text-sm text-[#6a7d96]">Favoriten werden geladen...</p>
                  ) : null}
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="relative rounded-[1rem] border border-[#e9edf3] bg-white px-3 py-3 text-center shadow-[0_8px_20px_rgba(17,17,17,0.04)]"
                    >
                      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#1679ff]">
                        {(() => {
                          const Icon = getFavoriteIcon(fav.name);
                          return <Icon size={15} />;
                        })()}
                      </span>
                      <span className="mt-2 block text-sm leading-5 text-[#6a7d96]">
                        {fav.street} {fav.house_number}, {fav.zip} {fav.city}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            if (!confirm('Moechten Sie diesen Favoriten loeschen?')) return;
                            const res = await deleteFavoriteAddress(fav.id);
                            if ((res as { error?: string })?.error) {
                              setError((res as { error: string }).error);
                              return;
                            }
                            setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
                          })
                        }
                        aria-label="Favorit loeschen"
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#eef2f7] bg-white text-[#8a96a3] transition-colors hover:border-[#f3d8dd] hover:bg-[#fff4f6] hover:text-[#d70015]"
                      >
                        <X size={12} strokeWidth={2.25} />
                      </button>
                    </div>
                  ))}
                  {shouldShowFavoritesEmptyState ? (
                    <p className="text-sm text-[#1679ff]">Keine Favoriten gespeichert.</p>
                  ) : null}
                </div>

                <p className="text-sm text-[#6a7d96]">
                  {hasReachedFavoriteLimit
                    ? 'Maximal 3 Favoriten gespeichert.'
                    : `${favorites.length}/3 Favoriten gespeichert.`}
                </p>

                <form
                  action={() => {
                    setError(null);
                    startTransition(async () => {
                      if (favorites.length >= 3) {
                        setError('Maximal 3 Favoriten sind moeglich.');
                        return;
                      }

                      const parsedAddress = parseFavoriteAddressInput(favAddress);
                      if (!parsedAddress) {
                        setError('Bitte Adresse im Format "Strasse Nr., 1234 Stadt" eingeben.');
                        return;
                      }

                      if (!favLabel.trim()) {
                        setError('Bitte waehlen Sie House, Office oder School.');
                        return;
                      }

                      const formData = new FormData();
                      formData.set('name', favLabel.trim());
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
                        setFavorites((prev) => [...prev, inserted]);
                      }
                      setFavLabel('');
                      setFavAddress('');
                    });
                  }}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[10.75rem_minmax(0,1fr)]">
                    <div className="relative">
                      <select
                        value={favLabel}
                        onChange={(e) => setFavLabel(e.target.value)}
                        className="ui-input appearance-none pr-10"
                        disabled={isPending || hasReachedFavoriteLimit}
                        required
                      >
                        <option value="">Label</option>
                        {favoritePresetItems.map((item) => (
                          <option key={item.label} value={item.label}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                    <input
                      value={favAddress}
                      onChange={(e) => setFavAddress(e.target.value)}
                      className="ui-input"
                      placeholder="Adresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                      disabled={isPending || hasReachedFavoriteLimit}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending || hasReachedFavoriteLimit}
                    className="ui-button-booking-primary w-full sm:w-auto sm:min-w-[220px] sm:justify-self-start"
                  >
                    {isPending ? 'Speichert...' : 'Speichern'}
                  </button>
                </form>
              </div>
              {error ? <p className="mt-3 text-sm text-[#d70015]">{error}</p> : null}
            </section>
          ) : null}

          {activeTab === 'buchungsverlauf' ? (
            <section className={contentSectionClass}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className={accountSectionIntroClass}>
                    <h2 className="ui-heading-lg text-[#111827]">Fahrten</h2>
                    <p className="ui-copy-compact text-[#6a7d96]">
                      Ihre kommenden und vergangenen Fahrten in einer klaren Uebersicht.
                    </p>
                    <Link
                      href="/book"
                      className="ui-button-booking-primary w-full self-start sm:w-auto sm:min-w-[220px]"
                    >
                      Fahrt buchen
                    </Link>
                  </div>
                  <UnderlineTabNav
                    items={[
                      { id: 'previous', label: 'Vergangen' },
                      { id: 'upcoming', label: 'Kommend' },
                    ]}
                    activeTab={bookingFilter === 'upcoming' ? 'upcoming' : 'previous'}
                    onChange={(tab) => setBookingFilter(tab as BookingFilter)}
                    className="flex flex-wrap gap-6"
                  />
                </div>

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
                              className={`rounded-[1.4rem] border border-[#e8edf3] bg-white px-4 py-4 md:px-5 ${
                                isCanceled(b.status) ? 'opacity-70' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 md:gap-3.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679FF] md:h-10 md:w-10">
                                  <Car size={18} className="md:h-[19px] md:w-[19px]" />
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedBookingId((prev) => (prev === b.id ? null : b.id))
                                  }
                                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                  aria-expanded={isExpanded}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[0.82rem] text-[#7b8798] md:text-[0.88rem]">{fmtRideMeta(b.pickup_at)}</p>
                                    <p className="mt-1 line-clamp-2 text-[1.02rem] font-semibold leading-[1.28] tracking-[-0.03em] text-[#111827] md:text-[1.22rem] md:leading-[1.24] md:tracking-[-0.035em]">
                                      {primaryLocation}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                      <p className="text-[0.82rem] text-[#6a7d96] md:text-[0.88rem]">{secondaryLocation}</p>
                                      {isCanceled(b.status) ? (
                                        <span className="rounded-full border border-[#f1d1d6] bg-[#fff4f6] px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#d70015]">
                                          Storniert
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-1.5 text-[0.92rem] font-semibold text-[#111827] md:mt-1.5 md:text-[0.96rem]">
                                      {fmtPrice(b.price)}
                                    </p>
                                  </div>
                                  <ChevronDown
                                    size={16}
                                    className={`shrink-0 text-[#7b8798] transition-transform md:h-4 md:w-4 ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>

                                <div className="shrink-0">
                                {showCancelAction ? (
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
                                ) : hasMapLink ? (
                                  <a
                                    href={getGoogleMapsUrl(primaryLocation)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Ort in Google Maps oeffnen"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679FF] transition-colors hover:bg-[#eef5ff] md:h-11 md:w-11"
                                  >
                                    <MapPin size={17} className="md:h-[18px] md:w-[18px]" />
                                  </a>
                                ) : null}
                                </div>
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
    </div>
  );
}
