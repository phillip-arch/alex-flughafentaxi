'use client';

import { useMemo, useState } from 'react';
import BookingForm from '@/components/BookingForm';
import AccountMobileBottomNav from '@/components/account/AccountMobileBottomNav';
import { BookingDirection, BookingInfoPanel } from '@/components/booking/BookingInfoPanel';
import NavbarClient from '@/components/NavbarClient';
import { getAppSurface } from '@/lib/routing/surfaces';

type FavoriteAddress = {
  id: string;
  name: string;
  city: string;
  zip: string;
  street: string;
  house_number: string;
};

const EMPTY_FAVORITES: FavoriteAddress[] = [];

export default function BookingPageClient({
  initialName = '',
  initialPhone = '',
  initialEmail = '',
  initialFavorites = EMPTY_FAVORITES,
  initialIsLoggedIn = false,
}: {
  initialName?: string;
  initialPhone?: string;
  initialEmail?: string;
  initialFavorites?: FavoriteAddress[];
  initialIsLoggedIn?: boolean;
}) {
  const [direction, setDirection] = useState<BookingDirection>('to_airport');
  const isAppSurface = getAppSurface() === 'app';
  const initialAccountDefaults = useMemo(
    () => ({
      fullName: initialName,
      phone: initialPhone,
      email: initialEmail,
    }),
    [initialName, initialPhone, initialEmail],
  );

  return (
    <>
      {!isAppSurface ? <NavbarClient /> : null}
      <section className="bg-white">
        <div className={`app-container pb-10 md:pb-12 ${isAppSurface ? 'pt-0' : 'pt-28 md:pt-28'}`}>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,620px)_minmax(320px,1fr)] lg:gap-10">
            <section className="order-1 self-start lg:sticky lg:top-24">
              <div className="ui-card-surface-light px-4 py-4 md:px-5 md:py-5">
                <BookingForm
                  onDirectionChange={setDirection}
                  initialFavorites={initialFavorites}
                  initialIsLoggedIn={initialIsLoggedIn}
                  initialAccountDefaults={initialAccountDefaults}
                />
              </div>
            </section>

            <aside className="order-3 hidden self-start lg:order-2 lg:sticky lg:top-24 lg:block">
              <BookingInfoPanel direction={direction} />
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="app-container pb-32 md:pb-28">
          <section className="mx-auto mt-6 max-w-[57.5rem] lg:hidden">
            <BookingInfoPanel direction={direction} />
          </section>

          {!isAppSurface ? (
            null
          ) : null}
        </div>
      </section>
      {isAppSurface ? <AccountMobileBottomNav active="start" /> : null}
    </>
  );
}

