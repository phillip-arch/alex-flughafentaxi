'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  BookOpen,
  Car,
  ChevronDown,
  Heart,
  History,
  MapPin,
  Menu,
  Star,
  User,
  XCircle,
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import BookingForm from '@/components/BookingForm';
import UnderlineTabNav from '@/components/ui/UnderlineTabNav';
import { parseBookingNotes } from '@/lib/booking/notes';
import {
  addFavoriteAddress,
  cancelOwnBooking,
  deleteFavoriteAddress,
  loadAccountBookings,
  loadFavoriteAddresses,
  submitBookingReview,
  updateAccountProfile,
} from './actions';

type AccountTab = 'buchen' | 'profil' | 'favoriten' | 'buchungsverlauf';

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
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [favoritesLoaded, setFavoritesLoaded] = useState(initialFavoritesLoaded);
  const [bookingsLoaded, setBookingsLoaded] = useState(initialBookingsLoaded);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const accountShellClass = 'mx-auto max-w-[57.5rem]';
  const sectionCardClass = 'ui-card-surface-light px-6 py-7 md:px-8 md:py-8';

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
          <section className={sectionCardClass}>
            <div className="flex flex-col gap-5 md:gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="ui-text-block-sm">
                  <h1 className="ui-heading-lg text-[#111827]">Mein Konto</h1>
                  <p className="ui-copy-compact text-[#6a7d96]">
                    Verwalten Sie Ihr Profil, Favoriten und Buchungsverlauf im gleichen
                    Designsystem wie auf der Startseite.
                  </p>
                </div>

                <div className="relative md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileTabsOpen((prev) => !prev)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#e9edf3] bg-white text-[#111111] transition-colors hover:bg-[#f5f5f7]"
                    aria-label="Kontomenue oeffnen"
                  >
                    <Menu size={17} />
                  </button>
                  {mobileTabsOpen ? (
                    <div className="absolute right-0 top-[52px] z-20 w-64 overflow-hidden rounded-[1.1rem] border border-[#e9edf3] bg-white shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
                      {[
                        { id: 'buchen', label: 'Buchen', icon: BookOpen },
                        { id: 'profil', label: 'Profil', icon: User },
                        { id: 'favoriten', label: 'Favoriten', icon: Heart },
                        { id: 'buchungsverlauf', label: 'Buchungsverlauf', icon: History },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id as AccountTab);
                              setMobileTabsOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] ${
                              activeTab === item.id
                                ? 'bg-[#edf4ff] text-[#1679ff]'
                                : 'text-[#111111] hover:bg-[#f5f5f7]'
                            }`}
                          >
                            <Icon size={16} />
                            {item.label}
                          </button>
                        );
                      })}
                      <form action={logout}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-[#111111] hover:bg-[#f5f5f7]"
                        >
                          <XCircle size={16} />
                          Abmelden
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[#edf2f7] pt-4">
                <UnderlineTabNav
                  className="hidden items-center md:flex"
                  items={[
                    { id: 'buchen', label: 'Buchen' },
                    { id: 'profil', label: 'Profil' },
                    { id: 'favoriten', label: 'Favoriten' },
                    { id: 'buchungsverlauf', label: 'Buchungsverlauf' },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
                <form action={logout} className="hidden md:block">
                  <button type="submit" className="ui-button-secondary px-4 py-2 text-[0.82rem]">
                    Abmelden
                  </button>
                </form>
              </div>
            </div>
          </section>

          {activeTab === 'buchen' ? (
            <section className={sectionCardClass}>
              <h2 className="ui-heading-lg mb-4 text-[#111827]">Buchen</h2>
              <BookingForm />
            </section>
          ) : null}

          {activeTab === 'profil' ? (
            <section className={sectionCardClass}>
              <h2 className="ui-heading-lg mb-5 text-[#111827]">Profil</h2>
              <form
                action={(formData) => {
                  setError(null);
                  startTransition(async () => {
                    const res = await updateAccountProfile(formData);
                    if ((res as { error?: string })?.error) {
                      setError((res as { error: string }).error);
                    }
                  });
                }}
                className="grid grid-cols-1 gap-4 md:grid-cols-3"
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
                <input value={userEmail} readOnly className="ui-input" />
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="ui-button-booking-primary md:w-auto"
                  >
                    {isPending ? 'Speichern...' : 'Profil speichern'}
                  </button>
                </div>
              </form>
              {error ? <p className="mt-3 text-sm text-[#d70015]">{error}</p> : null}
            </section>
          ) : null}

          {activeTab === 'favoriten' ? (
            <section className={sectionCardClass}>
              <h2 className="ui-heading-lg mb-5 text-[#111827]">Favoriten</h2>
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
                    formData.set('name', parsedAddress.name);
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
                    setFavAddress('');
                  });
                }}
                className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <input
                  value={favAddress}
                  onChange={(e) => setFavAddress(e.target.value)}
                  className="ui-input"
                  placeholder="Adresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                  required
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="ui-button-booking-primary md:w-auto"
                >
                  Speichern
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {favoritesLoading ? (
                  <p className="text-sm text-[#6a7d96]">Favoriten werden geladen...</p>
                ) : null}
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e9edf3] bg-[#f5f5f7] px-3 py-2"
                  >
                    <span className="text-sm text-[#6a7d96]">
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
                      className="text-sm text-[#d70015]"
                    >
                      X
                    </button>
                  </div>
                ))}
                {favorites.length === 0 ? (
                  <p className="text-sm text-[#6a7d96]">Keine Favoriten gespeichert.</p>
                ) : null}
              </div>
              {error ? <p className="mt-3 text-sm text-[#d70015]">{error}</p> : null}
            </section>
          ) : null}

          {activeTab === 'buchungsverlauf' ? (
            <section className={sectionCardClass}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="ui-text-block-sm gap-2">
                    <h2 className="ui-heading-lg text-[#111827]">Fahrten</h2>
                    <p className="ui-copy-compact text-[#6a7d96]">
                      Ihre kommenden und vergangenen Fahrten in einer klaren Uebersicht.
                    </p>
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
                    <div key={group.month} className="space-y-4">
                      <h3 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827]">
                        {group.month}
                      </h3>

                      <div className="space-y-2">
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
                              <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679FF]">
                                  <Car size={21} />
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
                                    <p className="text-[0.95rem] text-[#7b8798]">{fmtRideMeta(b.pickup_at)}</p>
                                    <p className="mt-1 line-clamp-2 text-[1.55rem] font-semibold leading-[1.2] tracking-[-0.04em] text-[#111827]">
                                      {primaryLocation}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                      <p className="text-[0.95rem] text-[#6a7d96]">{secondaryLocation}</p>
                                      {isCanceled(b.status) ? (
                                        <span className="rounded-full border border-[#f1d1d6] bg-[#fff4f6] px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#d70015]">
                                          Storniert
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-2 text-[1.05rem] font-semibold text-[#111827]">
                                      {fmtPrice(b.price)}
                                    </p>
                                  </div>
                                  <ChevronDown
                                    size={18}
                                    className={`shrink-0 text-[#7b8798] transition-transform ${
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
                                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f1d1d6] bg-[#fff4f6] text-[#d70015] transition-colors hover:bg-[#ffecef] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Fahrt stornieren"
                                  >
                                    <XCircle size={21} />
                                  </button>
                                ) : hasMapLink ? (
                                  <a
                                    href={getGoogleMapsUrl(primaryLocation)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Ort in Google Maps oeffnen"
                                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679FF] transition-colors hover:bg-[#eef5ff]"
                                  >
                                    <MapPin size={20} />
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

                                  {isCompleted(b.status) ? (
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
