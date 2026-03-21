'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  BookOpen,
  Briefcase,
  Car,
  ChevronDown,
  CreditCard,
  Heart,
  History,
  Mail,
  MapPin,
  Menu,
  Phone,
  PlaneLanding,
  PlaneTakeoff,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import BookingForm from '@/components/BookingForm';
import UnderlineTabNav from '@/components/ui/UnderlineTabNav';
import {
  RIDE_CARD_BASE_CLASS,
  RIDE_CARD_CANCELLED_CLASS,
  RIDE_CONTENT_CANCELLED_CLASS,
  RIDE_PILL_CLASS,
  RIDE_PILL_SMALL_CLASS,
} from '@/components/ui/sharedStyles';
import { parseBookingNotes } from '@/lib/booking/notes';
import {
  addFavoriteAddress,
  cancelOwnBooking,
  deleteFavoriteAddress,
  loadAccountBookings,
  loadFavoriteAddresses,
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
  const [favName, setFavName] = useState('');
  const [favCity, setFavCity] = useState('Wien');
  const [favZip, setFavZip] = useState('');
  const [favStreet, setFavStreet] = useState('');
  const [favHouseNumber, setFavHouseNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
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

  const fmtDateOnly = (value: string) =>
    new Intl.DateTimeFormat('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));

  const fmtTime = (value: string) =>
    new Intl.DateTimeFormat('de-AT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));

  const fmtPrice = (value: number | null | undefined) =>
    `${new Intl.NumberFormat('de-AT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0))} \u20ac`;

  const getPaymentMeta = (booking: Booking) => {
    const paymentRaw = String(parseBookingNotes(booking.notes).paymentLabel || '').toLowerCase();
    const isCard =
      paymentRaw.includes('kredit') || paymentRaw.includes('card') || paymentRaw.includes('karte');
    const isCash = paymentRaw.includes('bar') || paymentRaw.includes('cash');
    if (isCard) return { label: 'KARTE', className: 'bg-[#e8f2ff] text-[#0071e3]' };
    if (isCash)
      return {
        label: 'BAR',
        className:
          'bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]',
      };
    return { label: '-', className: 'bg-[#e7ebf3] text-[#1d1d1f]' };
  };

  const isCanceled = (status: string) => {
    const normalized = String(status || '').toLowerCase();
    return normalized === 'canceled' || normalized === 'cancelled';
  };

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

  const filteredBookings = bookings
    .filter((booking) => {
      switch (bookingFilter) {
        case 'all':
          return true;
        case 'upcoming':
          return !isCanceled(booking.status) && isUpcoming(booking);
        case 'previous':
          return !isCanceled(booking.status) && isPrevious(booking);
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
                action={(formData) => {
                  setError(null);
                  startTransition(async () => {
                    const res = await addFavoriteAddress(formData);
                    if ((res as { error?: string })?.error) {
                      setError((res as { error: string }).error);
                      return;
                    }
                    const inserted = (res as { favorite?: Favorite }).favorite;
                    if (inserted?.id) {
                      setFavorites((prev) => [...prev, inserted]);
                    }
                    setFavName('');
                    setFavCity('Wien');
                    setFavZip('');
                    setFavStreet('');
                    setFavHouseNumber('');
                  });
                }}
                className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[170px_150px_120px_1fr_130px_auto]"
              >
                <input
                  name="name"
                  value={favName}
                  onChange={(e) => setFavName(e.target.value)}
                  className="ui-input"
                  placeholder="Name (z.B. Home)"
                  required
                />
                <select
                  name="city"
                  value={favCity}
                  onChange={(e) => setFavCity(e.target.value)}
                  className="ui-input"
                  required
                >
                  <option value="Wien">Wien</option>
                  <option value="Schwechat">Schwechat</option>
                </select>
                <input
                  name="zip"
                  value={favZip}
                  onChange={(e) => setFavZip(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="ui-input"
                  placeholder="PLZ"
                  required
                />
                <input
                  name="street"
                  value={favStreet}
                  onChange={(e) => setFavStreet(e.target.value)}
                  className="ui-input"
                  placeholder="Strasse"
                  required
                />
                <input
                  name="house_number"
                  value={favHouseNumber}
                  onChange={(e) => setFavHouseNumber(e.target.value)}
                  className="ui-input"
                  placeholder="Nr."
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
                    <span className="text-sm font-semibold text-[#111111]">{fav.name}:</span>
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
              <h2 className="ui-heading-lg mb-5 text-[#111827]">Buchungsverlauf</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Alle' },
                  { id: 'upcoming', label: 'Kommende Fahrten' },
                  { id: 'previous', label: 'Vergangene Fahrten' },
                  { id: 'canceled', label: 'Storniert' },
                  { id: 'to_airport', label: 'Zum Flughafen' },
                  { id: 'from_airport', label: 'Vom Flughafen' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBookingFilter(item.id as BookingFilter)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      bookingFilter === item.id
                        ? 'border-[#1679ff] bg-[#edf4ff] text-[#1679ff]'
                        : 'border-[#e9edf3] bg-white text-[#111111] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {bookingsLoading ? (
                  <p className="text-[#6a7d96]">Buchungsverlauf wird geladen...</p>
                ) : null}
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className={`${RIDE_CARD_BASE_CLASS} ${
                      isCanceled(b.status) ? RIDE_CARD_CANCELLED_CLASS : ''
                    }`}
                  >
                    <div
                      className={`grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.95fr_0.8fr] ${
                        isCanceled(b.status) ? RIDE_CONTENT_CANCELLED_CLASS : ''
                      }`}
                    >
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={RIDE_PILL_CLASS}>{fmtDateOnly(b.pickup_at)}</span>
                          <span className={RIDE_PILL_CLASS}>{fmtTime(b.pickup_at)}</span>
                          <span className={RIDE_PILL_CLASS}>
                            {isToAirport(b) ? <PlaneTakeoff size={13} /> : <PlaneLanding size={13} />}
                            {isToAirport(b) ? 'ZUM' : 'VOM'}
                          </span>
                          <span className={RIDE_PILL_CLASS}>
                            {(b.vehicle_type || '-').toUpperCase()}
                          </span>
                          {(() => {
                            const payment = getPaymentMeta(b);
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${payment.className}`}
                              >
                                <CreditCard size={13} />
                                {payment.label}
                              </span>
                            );
                          })()}
                          <span className={RIDE_PILL_CLASS}>
                            {b.booking_reference || b.id.slice(0, 8)}
                          </span>
                        </div>

                        <div className="flex items-stretch gap-2.5">
                          <div
                            className="flex shrink-0 flex-col items-center pt-1 text-[#000000]"
                            aria-hidden="true"
                          >
                            <span className="h-2.5 w-2.5 rounded-full bg-[#000000]" />
                            <span className="my-1 w-px flex-1 bg-[#000000]" />
                            <ChevronDown size={14} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-2.5">
                            <div className="flex items-start gap-2">
                              <p className="line-clamp-2 text-[22px] font-semibold leading-snug text-[#081a42]">
                                {b.pickup}
                              </p>
                              {!isAirportLocation(b.pickup) ? (
                                <a
                                  href={getGoogleMapsUrl(b.pickup)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Abholort in Google Maps oeffnen"
                                  className="mt-1 shrink-0 text-[#000000] transition-colors hover:text-[#000000]"
                                >
                                  <MapPin size={20} />
                                </a>
                              ) : null}
                            </div>
                            <div className="flex items-start gap-2">
                              <p className="line-clamp-2 text-[22px] font-semibold leading-snug text-[#000000]">
                                {b.destination}
                              </p>
                              {!isAirportLocation(b.destination) ? (
                                <a
                                  href={getGoogleMapsUrl(b.destination)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Ziel in Google Maps oeffnen"
                                  className="mt-1 shrink-0 text-[#000000] transition-colors hover:text-[#000000]"
                                >
                                  <MapPin size={20} />
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const displayNotes = parseBookingNotes(b.notes).cleanedNotes;
                          if (!displayNotes) return null;
                          return (
                            <div className="mt-2 max-w-[620px] rounded-[11px] border border-[#d2d2d7] bg-white px-3 py-2">
                              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
                                Anmerkung
                              </p>
                              <p className="line-clamp-3 text-[15px] leading-snug text-[#1d1d1f]">
                                {displayNotes}
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-3 lg:pl-6">
                        <h3 className="text-[19px] font-semibold text-[#000000]">
                          {b.full_name || '-'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#000000]">
                          <div className="flex min-w-0 items-center gap-2">
                            <Phone size={18} />
                            <span className="truncate">{b.phone || '-'}</span>
                          </div>
                          <div className="flex min-w-0 items-center gap-2">
                            <Mail size={18} />
                            <span className="truncate">{b.email || '-'}</span>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <span className={RIDE_PILL_SMALL_CLASS}>
                              <Users size={11} /> {Number(b.passengers || 0)} PERS.
                            </span>
                            <span className={RIDE_PILL_SMALL_CLASS}>
                              <Briefcase size={11} /> {Number(b.luggage || 0)} KOFFER
                            </span>
                            <span className={RIDE_PILL_SMALL_CLASS}>
                              <Briefcase size={11} />{' '}
                              {parseBookingNotes(b.notes).handLuggageCount || 0} HANDG.
                            </span>
                          </div>
                          {(() => {
                            const seats = parseBookingNotes(b.notes).childSeatCounts;
                            if (seats.baby <= 0 && seats.child <= 0 && seats.booster <= 0) return null;
                            return (
                              <div className="flex flex-wrap gap-2">
                                {seats.baby > 0 ? (
                                  <span className={RIDE_PILL_SMALL_CLASS}>{seats.baby} BABYSCHALE</span>
                                ) : null}
                                {seats.child > 0 ? (
                                  <span className={RIDE_PILL_SMALL_CLASS}>{seats.child} KINDERSITZ</span>
                                ) : null}
                                {seats.booster > 0 ? (
                                  <span className={RIDE_PILL_SMALL_CLASS}>
                                    {seats.booster} Sitzerhoehung
                                  </span>
                                ) : null}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex h-full flex-col items-start justify-between gap-3">
                        <span className="self-end text-right text-[34px] font-semibold leading-none text-[#081a42]">
                          {fmtPrice(b.price)}
                        </span>
                      </div>
                    </div>

                    {!isCanceled(b.status) && !isCancelWindowExpired(b) ? (
                      <div className="mt-3 flex justify-end">
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
                          className="rounded-full border border-[#d2d2d7] px-3 py-1.5 text-xs font-medium text-[#d70015] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {cancelingBookingId === b.id
                            ? 'Storniere...'
                            : canCancel(b)
                              ? 'Stornieren'
                              : 'Nicht verfuegbar'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}

                {filteredBookings.length === 0 ? (
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
