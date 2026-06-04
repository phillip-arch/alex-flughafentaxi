'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
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
  routePreset = null,
}: {
  initialName?: string;
  initialPhone?: string;
  initialEmail?: string;
  initialFavorites?: FavoriteAddress[];
  initialIsLoggedIn?: boolean;
  routePreset?: {
    direction: 'to_airport' | 'from_airport';
    routeLabel: string;
    pickupLabel: string;
    dropoffLabel: string;
    address?: {
      street: string;
      zip: string;
      city: string;
      formattedAddress: string;
      houseNumber: string;
      country: string;
      lat: number;
      lng: number;
      placeId: string;
    };
    notes: string;
  } | null;
}) {
  const [direction, setDirection] = useState<BookingDirection>('to_airport');
  const [meetAndGreet, setMeetAndGreet] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const isAppSurface = getAppSurface() === 'app';
  const searchParams = useSearchParams();
  const activeLang = searchParams.get('lang')?.toLowerCase() === 'de' ? 'de' : 'en';
  const termsLabel = 'Terms and Conditions';
  const privacyLabel = 'Privacy Policy';
  const initialAccountDefaults = useMemo(
    () => ({
      fullName: initialName,
      phone: initialPhone,
      email: initialEmail,
    }),
    [initialName, initialPhone, initialEmail],
  );
  const bookingRoutePreset = useMemo(() => routePreset ?? undefined, [routePreset]);

  return (
    <>
      {!isAppSurface ? <NavbarClient /> : null}
      <section className="bg-[var(--color-page-bg)]">
        <div className={`app-container pb-10 md:pb-12 ${isAppSurface ? 'pt-5' : 'pt-[100px] md:pt-[8rem] [@media(min-width:768px)_and_(max-height:850px)]:pt-[108px]'}`}>
          <div className="mx-auto grid items-start gap-10 lg:max-w-[1400px] lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] lg:gap-8 xl:gap-10">
            <section className="order-1 self-start">
              <div className="mx-auto w-full max-w-[57.5rem] lg:mx-0 lg:max-w-none">
                <BookingForm
                  onDirectionChange={setDirection}
                  onStepChange={setBookingStep}
                  meetAndGreetSelected={meetAndGreet}
                  onMeetAndGreetChange={setMeetAndGreet}
                  showStepOneRouteIntro={isAppSurface}
                  fluidDesktopWidth
                  preserveScrollOnStepChange
                  initialFavorites={initialFavorites}
                  initialIsLoggedIn={initialIsLoggedIn}
                  initialAccountDefaults={initialAccountDefaults}
                  routePreset={bookingRoutePreset}
                />
              </div>
            </section>

            <aside className="order-3 hidden self-start lg:order-2 lg:block">
              <div className="w-full max-w-none">
                <BookingInfoPanel
                  direction={direction}
                  meetAndGreet={meetAndGreet}
                  currentStep={bookingStep}
                  variant="book"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-page-bg)]">
        <div className={`app-container ${isAppSurface ? 'pb-32 md:pb-28' : 'pb-0'}`}>
          <section className="mx-auto mt-6 max-w-[57.5rem] lg:hidden">
            <BookingInfoPanel
              direction={direction}
              meetAndGreet={meetAndGreet}
              currentStep={bookingStep}
              variant="book"
            />
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

