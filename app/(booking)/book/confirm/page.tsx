import { XCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import NavbarClient from '@/components/NavbarClient';
import AccountMobileBottomNav from '@/components/account/AccountMobileBottomNav';
import { getAppSurface } from '@/lib/routing/surfaces';
import ConfirmClient from './ConfirmClient';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function ConfirmBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; driver?: string }>;
}) {
  const { token, driver } = await searchParams;
  const isAppSurface = getAppSurface() === 'app';

  if (!token) {
    return (
      <>
        {!isAppSurface ? <NavbarClient /> : null}
        <main className="bg-white">
          <section className={`app-container pb-32 md:pb-28 ${isAppSurface ? 'pt-4 md:pt-5' : 'pt-28 md:pt-32'}`}>
            <div className="mx-auto max-w-[57.5rem]">
              <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
                <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#f1d1d6] bg-[#fff4f6] text-[#d70015]">
                    <XCircle size={38} />
                  </div>
                  <div className="mt-14 flex flex-col items-center gap-6">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#d70015]">
                      Error
                    </p>
                    <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
                      Invalid link
                    </h1>
                    <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
                      The confirmation link is invalid or missing. Please open the link from
                      your email again or return to the homepage.
                    </p>
                  </div>

                  <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-[var(--radius-field)] bg-[#1F7CFF] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#176be0] hover:text-white visited:text-white"
                    >
                      <span className="text-white">Back to homepage</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        {isAppSurface ? <AccountMobileBottomNav active="start" /> : null}
      </>
    );
  }

  return (
    <>
      {!isAppSurface ? <NavbarClient /> : null}
      <main className="bg-white">
        <section className={`app-container pb-32 md:pb-28 ${isAppSurface ? 'pt-4 md:pt-5' : 'pt-28 md:pt-32'}`}>
          <div className="mx-auto max-w-[57.5rem]">
            <ConfirmClient token={token} driverId={driver} />
          </div>
        </section>
      </main>
      {isAppSurface ? <AccountMobileBottomNav active="start" /> : null}
    </>
  );
}
