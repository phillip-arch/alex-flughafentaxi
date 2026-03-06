'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Car, Menu, User, Heart, History, BookOpen, XCircle } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import BookingForm from '@/components/BookingForm';
import UnderlineTabNav from '@/components/ui/UnderlineTabNav';
import { APP_HEADER_CLASS, APP_PAGE_BG_CLASS } from '@/components/ui/sharedStyles';
import { addFavoriteAddress, deleteFavoriteAddress, updateAccountProfile } from './actions';

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
};

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
  const [bookings] = useState<Booking[]>(initialBookings || []);
  const [favName, setFavName] = useState('');
  const [favCity, setFavCity] = useState('Wien');
  const [favZip, setFavZip] = useState('');
  const [favStreet, setFavStreet] = useState('');
  const [favHouseNumber, setFavHouseNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
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

  const fmtPrice = (value: number | null | undefined) =>
    `${new Intl.NumberFormat('de-AT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0))} \u20ac`;

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
                      <XCircle size={16} /> Log out
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
                Log out
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
                          if (!confirm('Do you want to delete this favorite?')) return;
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
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-[#e5e5ea] bg-[#fafafa] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-[#1d1d1f]">{b.booking_reference || b.id.slice(0, 8)}</p>
                      <p className="text-sm text-[#86868b]">{fmtDate(b.pickup_at)}</p>
                    </div>
                    <p className="mt-1 text-sm text-[#1d1d1f]">{b.pickup}</p>
                    <p className="text-sm text-[#1d1d1f]">{b.destination}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-[#e7ebf3] px-2 py-1 text-xs">{b.status}</span>
                      <span className="font-semibold text-[#081a42]">{fmtPrice(b.price)}</span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 ? <p className="text-[#86868b]">Noch keine Buchungen vorhanden.</p> : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
