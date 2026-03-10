'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  Car,
  Menu,
  User,
  Heart,
  History,
  BookOpen,
  XCircle,
  PlaneLanding,
  PlaneTakeoff,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Users,
  Briefcase,
  CreditCard,
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import BookingForm from '@/components/BookingForm';
import UnderlineTabNav from '@/components/ui/UnderlineTabNav';
import {
  APP_HEADER_CLASS,
  APP_PAGE_BG_CLASS,
  RIDE_CARD_BASE_CLASS,
  RIDE_CARD_CANCELLED_CLASS,
  RIDE_CONTENT_CANCELLED_CLASS,
  RIDE_PILL_CLASS,
  RIDE_PILL_SMALL_CLASS,
} from '@/components/ui/sharedStyles';
import { parseBookingNotes } from '@/lib/booking/notes';
import { addFavoriteAddress, cancelOwnBooking, deleteFavoriteAddress, updateAccountProfile } from './actions';

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
}: {
  userEmail: string;
  initialName: string;
  initialPhone: string;
  initialFavorites: Favorite[];
  initialBookings: Booking[];
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
  const [activeTab, setActiveTab] = useState<AccountTab>('buchen');
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fmtDate = (value: string) =>
    new Intl.DateTimeFormat('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));

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
    const isCard = paymentRaw.includes('kredit') || paymentRaw.includes('card') || paymentRaw.includes('karte');
    const isCash = paymentRaw.includes('bar') || paymentRaw.includes('cash');
    if (isCard) return { label: 'KARTE', className: 'bg-[#e8f2ff] text-[#0071e3]' };
    if (isCash) return { label: 'BAR', className: 'bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]' };
    return { label: '-', className: 'bg-[#e7ebf3] text-[#1d1d1f]' };
  };

  const isCanceled = (status: string) => {
    const normalized = String(status || '').toLowerCase();
    return normalized === 'canceled' || normalized === 'cancelled';
  };

  const canCancel = (booking: Booking) => {
    if (booking.driver_id) return false;
    const status = booking.status;
    const normalized = String(status || '').toLowerCase();
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

  const isToAirport = (booking: Booking) => String(booking.destination || '').toLowerCase().includes('flughafen');
  const isFromAirport = (booking: Booking) => String(booking.pickup || '').toLowerCase().includes('flughafen');
  const isUpcoming = (booking: Booking) => new Date(String(booking.pickup_at || '')).getTime() >= Date.now();
  const isPrevious = (booking: Booking) => new Date(String(booking.pickup_at || '')).getTime() < Date.now();
  const isAirportLocation = (value: string) => /flughafen\s+wien/i.test(String(value || ''));
  const getGoogleMapsUrl = (value: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value || '')}`;

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

  return (
    <main suppressHydrationWarning className={`${APP_PAGE_BG_CLASS} pb-12`}>
      <header className={APP_HEADER_CLASS}>
        <div className="mx-auto flex h-16 w-full max-w-[980px] items-center justify-between px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[#1d1d1f]">
            <Car size={18} />
            <span className="text-[15px] font-semibold">Alex Flughafentaxi</span>
          </Link>

          <div className="flex items-center gap-3 relative ml-auto">
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileTabsOpen((prev) => !prev)}
                className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                aria-label="Open account menu"
              >
                <Menu size={17} />
              </button>
              {mobileTabsOpen ? (
                <div className="absolute right-0 top-[52px] z-20 w-60 rounded-[14px] border border-[#d2d2d7] bg-white shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('buchen');
                      setMobileTabsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] text-left ${
                      activeTab === 'buchen' ? 'bg-[#e8f2ff] text-[#0071e3]' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <BookOpen size={16} /> Buchen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profil');
                      setMobileTabsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] text-left ${
                      activeTab === 'profil' ? 'bg-[#e8f2ff] text-[#0071e3]' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <User size={16} /> Profil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('favoriten');
                      setMobileTabsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] text-left ${
                      activeTab === 'favoriten' ? 'bg-[#e8f2ff] text-[#0071e3]' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <Heart size={16} /> Favoriten
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('buchungsverlauf');
                      setMobileTabsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] text-left ${
                      activeTab === 'buchungsverlauf' ? 'bg-[#e8f2ff] text-[#0071e3]' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <History size={16} /> Buchungsverlauf
                  </button>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-left text-[#1d1d1f] hover:bg-[#f5f5f7]"
                    >
                      <XCircle size={16} /> Abmelden
                    </button>
                  </form>
                </div>
              ) : null}
            </div>

            <UnderlineTabNav
              className="hidden md:flex items-center"
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
              <button
                type="submit"
                className="rounded-full border border-[#d2d2d7] px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
              >
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="px-4 pt-8">
        <div className="mx-auto max-w-[980px] space-y-6">
          <section className="rounded-[24px] border border-[#d2d2d7] bg-white p-6 md:p-8">
            <h1 className="text-[34px] font-semibold tracking-tight text-[#1d1d1f]">Mein Konto</h1>
            <p className="mt-1 text-[#86868b]">Verwalten Sie Ihr Profil, Favoriten und Buchungsverlauf.</p>
          </section>

          {activeTab === 'buchen' ? (
            <section className="rounded-[24px] border border-[#d2d2d7] bg-white p-4 md:p-6">
              <h2 className="mb-4 text-[24px] font-semibold text-[#1d1d1f]">Buchen</h2>
              <BookingForm />
            </section>
          ) : null}

          {activeTab === 'profil' ? (
            <section className="rounded-[24px] border border-[#d2d2d7] bg-white p-6 md:p-8">
              <h2 className="mb-4 text-[24px] font-semibold text-[#1d1d1f]">Profil</h2>
              <form
                action={(formData) => {
                  setError(null);
                  startTransition(async () => {
                    const res = await updateAccountProfile(formData);
                    if ((res as { error?: string })?.error) {
                      setError((res as { error: string }).error);
                      return;
                    }
                  });
                }}
                className="grid grid-cols-1 gap-4 md:grid-cols-3"
              >
                <input
                  name="full_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#d2d2d7] p-3"
                  placeholder="Name"
                  required
                />
                <input
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#d2d2d7] p-3"
                  placeholder="Telefon"
                  required
                />
                <input value={userEmail} readOnly className="w-full rounded-xl border border-[#e5e5ea] bg-[#f5f5f7] p-3" />
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-[#0071e3] px-6 py-3 font-medium text-white hover:bg-[#0077ed]"
                  >
                    {isPending ? 'Speichern...' : 'Profil speichern'}
                  </button>
                </div>
              </form>
              {error ? <p className="mt-3 text-sm text-[#d70015]">{error}</p> : null}
            </section>
          ) : null}

          {activeTab === 'favoriten' ? (
            <section className="rounded-[24px] border border-[#d2d2d7] bg-white p-6 md:p-8">
              <h2 className="mb-4 text-[24px] font-semibold text-[#1d1d1f]">Favoriten</h2>
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
                className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[170px_150px_120px_1fr_130px_auto]"
              >
                <input
                  name="name"
                  value={favName}
                  onChange={(e) => setFavName(e.target.value)}
                  className="w-full rounded-xl border border-[#d2d2d7] p-3"
                  placeholder="Name (z.B. Home)"
                  required
                />
                <select
                  name="city"
                  value={favCity}
                  onChange={(e) => setFavCity(e.target.value)}
                  className="w-full rounded-xl border border-[#d2d2d7] p-3"
                  required
                >
                  <option value="Wien">Wien</option>
                  <option value="Schwechat">Schwechat</option>
                </select>
                <input
                  name="zip"
                  value={favZip}
                  onChange={(e) => setFavZip(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full rounded-xl border border-[#d2d2d7] p-3"
                  placeholder="PLZ"
                  required
                />
                <input
                  name="street"
                  value={favStreet}
                  onChange={(e) => setFavStreet(e.target.value)}
                  className="w-full rounded-xl border border-[#d2d2d7] p-3"
                  placeholder="Straße"
                  required
                />
                <input
                  name="house_number"
                  value={favHouseNumber}
                  onChange={(e) => setFavHouseNumber(e.target.value)}
                  className="w-full rounded-xl border border-[#d2d2d7] p-3"
                  placeholder="Nr."
                  required
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-[#1d1d1f] px-5 py-3 font-medium text-white hover:bg-black"
                >
                  Speichern
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e5e5ea] bg-[#f5f5f7] px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-[#1d1d1f]">{fav.name}:</span>
                    <span className="text-sm text-[#86868b]">
                      {fav.street} {fav.house_number}, {fav.zip} {fav.city}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          if (!confirm('Möchten Sie diesen Favoriten löschen?')) return;
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
                {favorites.length === 0 ? <p className="text-sm text-[#86868b]">Keine Favoriten gespeichert.</p> : null}
              </div>
              {error ? <p className="mt-3 text-sm text-[#d70015]">{error}</p> : null}
            </section>
          ) : null}

          {activeTab === 'buchungsverlauf' ? (
            <section className="rounded-[24px] border border-[#d2d2d7] bg-white p-6 md:p-8">
              <h2 className="mb-4 text-[24px] font-semibold text-[#1d1d1f]">Buchungsverlauf</h2>
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
                        ? 'border-[#0071e3] bg-[#e8f2ff] text-[#0071e3]'
                        : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className={`${RIDE_CARD_BASE_CLASS} ${isCanceled(b.status) ? RIDE_CARD_CANCELLED_CLASS : ''}`}
                  >
                    <div
                      className={`grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.95fr_0.8fr] ${
                        isCanceled(b.status) ? RIDE_CONTENT_CANCELLED_CLASS : ''
                      }`}
                    >
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={RIDE_PILL_CLASS}>
                            {fmtDateOnly(b.pickup_at)}
                          </span>
                          <span className={RIDE_PILL_CLASS}>
                            {fmtTime(b.pickup_at)}
                          </span>
                          <span className={RIDE_PILL_CLASS}>
                            {isToAirport(b) ? <PlaneTakeoff size={13} /> : <PlaneLanding size={13} />}
                            {isToAirport(b) ? 'ZUM' : 'VOM'}
                          </span>
                          <span className={RIDE_PILL_CLASS}>{(b.vehicle_type || '-').toUpperCase()}</span>
                          {(() => {
                            const payment = getPaymentMeta(b);
                            return (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${payment.className}`}>
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
                          <div className="pt-1 flex flex-col items-center text-[#000000] shrink-0" aria-hidden="true">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#000000]" />
                            <span className="my-1 w-px flex-1 bg-[#000000]" />
                            <ChevronDown size={14} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-2.5">
                            <div className="flex items-start gap-2">
                              <p className="text-[22px] font-semibold text-[#081a42] leading-snug line-clamp-2">{b.pickup}</p>
                              {!isAirportLocation(b.pickup) ? (
                                <a
                                  href={getGoogleMapsUrl(b.pickup)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Open pickup in Google Maps"
                                  className="mt-1 text-[#000000] hover:text-[#000000] transition-colors shrink-0"
                                >
                                  <MapPin size={20} />
                                </a>
                              ) : null}
                            </div>
                            <div className="flex items-start gap-2">
                              <p className="text-[22px] font-semibold text-[#000000] leading-snug line-clamp-2">{b.destination}</p>
                              {!isAirportLocation(b.destination) ? (
                                <a
                                  href={getGoogleMapsUrl(b.destination)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Open destination in Google Maps"
                                  className="mt-1 text-[#000000] hover:text-[#000000] transition-colors shrink-0"
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
                            <div className="rounded-[11px] border border-[#d2d2d7] bg-white px-3 py-2 mt-2 max-w-[620px]">
                              <p className="text-[10px] uppercase tracking-wide text-[#86868b] font-semibold mb-0.5">Anmerkung</p>
                              <p className="text-[15px] text-[#1d1d1f] leading-snug line-clamp-3">{displayNotes}</p>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-3 lg:pl-6">
                        <h3 className="font-semibold text-[#000000] text-[19px]">{b.full_name || '-'}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#000000] text-[14px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone size={18} />
                            <span className="truncate">{b.phone || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
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
                              <Briefcase size={11} /> {parseBookingNotes(b.notes).handLuggageCount || 0} HANDG.
                            </span>
                          </div>
                          {(() => {
                            const seats = parseBookingNotes(b.notes).childSeatCounts;
                            if (seats.baby <= 0 && seats.child <= 0 && seats.booster <= 0) return null;
                            return (
                              <div className="flex flex-wrap gap-2">
                                {seats.baby > 0 ? (
                                  <span className={RIDE_PILL_SMALL_CLASS}>
                                    {seats.baby} BABYSCHALE
                                  </span>
                                ) : null}
                                {seats.child > 0 ? (
                                  <span className={RIDE_PILL_SMALL_CLASS}>
                                    {seats.child} KINDERSITZ
                                  </span>
                                ) : null}
                                {seats.booster > 0 ? (
                                  <span className={RIDE_PILL_SMALL_CLASS}>
                                    {seats.booster} SITZERHOEHUNG
                                  </span>
                                ) : null}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex h-full flex-col items-start justify-between gap-3">
                        <span className="self-end text-right text-[34px] font-semibold leading-none text-[#081a42]">{fmtPrice(b.price)}</span>
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
                                          (res as { status?: string }).status || (isCanceled(item.status) ? item.status : 'canceled'),
                                      }
                                    : item,
                                ),
                              );
                            })
                          }
                          className="rounded-full border border-[#d2d2d7] px-3 py-1.5 text-xs font-medium text-[#d70015] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {cancelingBookingId === b.id ? 'Storniere...' : canCancel(b) ? 'Stornieren' : 'Nicht verfuegbar'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
                {filteredBookings.length === 0 ? (
                  <p className="text-[#86868b]">
                    {bookings.length === 0 ? 'Noch keine Buchungen vorhanden.' : 'Keine Buchungen fuer diesen Filter.'}
                  </p>
                ) : null}
                {bookingNotice ? <p className="text-sm text-[#0a63ff]">{bookingNotice}</p> : null}
                {bookingError ? <p className="text-sm text-[#d70015]">{bookingError}</p> : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
