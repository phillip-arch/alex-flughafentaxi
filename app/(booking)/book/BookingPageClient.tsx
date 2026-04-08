'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import BookingTrustPills from '@/components/BookingTrustPills';
import AccountMobileBottomNav from '@/components/account/AccountMobileBottomNav';
import { BookingDirection, BookingInfoPanel } from '@/components/booking/BookingInfoPanel';
import NavbarClient from '@/components/NavbarClient';
import { getAppSurface } from '@/lib/routing/surfaces';

type FavoriteAddress = {
  id: string;
  city: string;
  zip: string;
  street: string;
  label: 'home' | 'office' | 'extra' | null;
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
  const searchParams = useSearchParams();
  const activeLang = searchParams.get('lang')?.toLowerCase() === 'en' ? 'en' : 'de';
  const termsLabel = activeLang === 'en' ? 'Terms and Conditions' : 'AGB';
  const privacyLabel = activeLang === 'en' ? 'Privacy Policy' : 'Datenschutzerklaerung';
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
          <div className="grid items-start gap-8 lg:grid-cols-[0.94fr_0.78fr] lg:gap-10">
            <section className="order-1 self-start lg:sticky lg:top-24">
              <div className="w-full max-w-[42rem] ui-card-surface-light px-4 py-4 md:px-5 md:py-5">
                <BookingForm
                  onDirectionChange={setDirection}
                  headerTitle={!isAppSurface ? 'In wenigen Schritten buchen' : undefined}
                  showStepOneRouteIntro={isAppSurface}
                  initialFavorites={initialFavorites}
                  initialIsLoggedIn={initialIsLoggedIn}
                  initialAccountDefaults={initialAccountDefaults}
                />
                {!isAppSurface ? <BookingTrustPills /> : null}
              </div>
            </section>

            <aside className="order-3 hidden self-start lg:order-2 lg:sticky lg:top-24 lg:block">
              <BookingInfoPanel direction={direction} />
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className={`app-container ${isAppSurface ? 'pb-32 md:pb-28' : 'pb-0'}`}>
          <section className="mx-auto mt-6 max-w-[57.5rem] lg:hidden">
            <BookingInfoPanel direction={direction} />
          </section>

          {!isAppSurface ? (
            <section className="relative left-1/2 mt-10 w-screen -translate-x-1/2 border-t border-white/8 bg-[#111111] px-5 py-5 text-white md:mt-12 md:px-8 md:py-6">
              <div className="mx-auto flex w-full max-w-[1372px] flex-col gap-3 text-left">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.92rem] text-white/62">
                  <Link
                    href={`/agb?lang=${activeLang}`}
                    className="font-medium text-[#78a9ff] transition-colors hover:text-white"
                  >
                    {termsLabel}
                  </Link>
                  <Link
                    href={`/datenschutz?lang=${activeLang}`}
                    className="font-medium text-[#78a9ff] transition-colors hover:text-white"
                  >
                    {privacyLabel}
                  </Link>
                  <span className="font-medium text-white/72">Flughafentaxi Alex OG</span>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
      {isAppSurface ? <AccountMobileBottomNav active="start" /> : null}
    </>
  );
}

