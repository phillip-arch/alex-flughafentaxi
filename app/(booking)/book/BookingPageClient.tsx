'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import AccountMobileBottomNav from '@/components/account/AccountMobileBottomNav';
import { BookingDirection, BookingInfoPanel } from '@/components/booking/BookingInfoPanel';
import NavbarClient from '@/components/NavbarClient';
import { getAppSurface } from '@/lib/routing/surfaces';

export default function BookingPageClient({ initialName = '' }: { initialName?: string }) {
  const [direction, setDirection] = useState<BookingDirection>('to_airport');
  const isAppSurface = getAppSurface() === 'app';

  return (
    <>
      {!isAppSurface ? <NavbarClient /> : null}
      <section className="bg-white">
        <div className={`app-container pb-10 md:pb-12 ${isAppSurface ? 'pt-10 md:pt-12' : 'pt-28 md:pt-28'}`}>
          {isAppSurface ? (
            <section className="mb-8 px-1 py-2 md:px-2">
              <Link
                href="/account?tab=buchungsverlauf"
                className="inline-flex w-fit items-center gap-2 text-[0.95rem] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                <ChevronLeft size={18} />
                Zurueck zum Konto
              </Link>
            </section>
          ) : null}

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,620px)_minmax(320px,1fr)] lg:gap-10">
            <section className="order-1 self-start lg:sticky lg:top-24">
              <div className="ui-card-surface-light px-4 py-4 md:px-5 md:py-5">
                <BookingForm onDirectionChange={setDirection} />
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

