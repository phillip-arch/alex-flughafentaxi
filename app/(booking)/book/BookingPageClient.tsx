'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, User } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import { BookingDirection, BookingInfoPanel } from '@/components/booking/BookingInfoPanel';
import NavbarClient from '@/components/NavbarClient';
import { getAppSurface } from '@/lib/routing/surfaces';

export default function BookingPageClient({ initialName = '' }: { initialName?: string }) {
  const [direction, setDirection] = useState<BookingDirection>('to_airport');
  const isAppSurface = getAppSurface() === 'app';
  const currentHour = new Date().getHours();
  const firstName = String(initialName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0];
  const greetingBase = currentHour < 11 ? 'Guten Morgen' : currentHour < 18 ? 'Guten Tag' : 'Guten Abend';
  const greetingLabel = firstName ? `${greetingBase} ${firstName}!` : `${greetingBase}!`;

  return (
    <>
      <NavbarClient />
      <section className="bg-white">
        <div className="app-container pb-10 pt-28 md:pb-12 md:pt-28">
          {isAppSurface ? (
            <section className="mb-8 px-1 py-2 md:px-2">
              <div className="flex flex-col gap-9 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-4">
                  <h2 className="text-[2rem] font-semibold tracking-[-0.06em] text-[#111827] md:text-[2.35rem]">
                    {greetingLabel}
                  </h2>
                  <p className="text-[1rem] text-[#6a7d96] md:text-[1.05rem]">
                    Hier kannst du deine naechste Fahrt buchen.
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-5 xl:flex-row xl:items-center xl:justify-end xl:gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/account?tab=buchungsverlauf"
                      className="inline-flex items-center gap-2 rounded-[1.05rem] border border-[#e2e8f2] bg-[#FDFDFE] px-4 py-3 text-[1.02rem] font-medium text-[#657489] shadow-[0_8px_18px_rgba(17,17,17,0.04)] transition-all hover:text-[#111827]"
                    >
                      <History size={16} />
                      <span>Fahrten</span>
                    </Link>
                    <Link
                      href="/account?tab=profil"
                      className="inline-flex items-center gap-2 rounded-[1.05rem] border border-[#e2e8f2] bg-[#FDFDFE] px-4 py-3 text-[1.02rem] font-medium text-[#657489] shadow-[0_8px_18px_rgba(17,17,17,0.04)] transition-all hover:text-[#111827]"
                    >
                      <User size={16} />
                      <span>Profil</span>
                    </Link>
                  </div>
                  <span className="ui-button-booking-primary w-full justify-center xl:min-w-[18rem] xl:w-auto">
                    Fahrt buchen
                  </span>
                </div>
              </div>
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
        <div className="app-container pb-28 md:pb-28">
          <section className="mx-auto mt-6 max-w-[57.5rem] lg:hidden">
            <BookingInfoPanel direction={direction} />
          </section>

          {!isAppSurface ? (
            null
          ) : null}
        </div>
      </section>
    </>
  );
}

