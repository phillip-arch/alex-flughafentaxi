import { XCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import DriverConfirmClient from './DriverConfirmClient';

function formatDriverConfirmDateTime(value?: string | null) {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return { date: '-', time: '-' };
  }

  return {
    date: new Intl.DateTimeFormat('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(parsed),
    time: new Intl.DateTimeFormat('de-AT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parsed),
  };
}

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

export default async function DriverConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; driver?: string }>;
}) {
  const { token, driver } = await searchParams;

  if (!token) {
    return (
      <main className="min-h-screen bg-white">
        <section className="app-container min-h-screen pb-20 pt-10 md:pt-14">
          <div className="mx-auto max-w-[57.5rem]">
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#f1d1d6] bg-[#fff4f6] text-[#d70015]">
                  <XCircle size={38} />
                </div>
                <div className="mt-14 flex flex-col items-center gap-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#d70015]">
                    Fehler
                  </p>
                  <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
                    Link ungueltig
                  </h1>
                  <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
                    Der Bestaetigungslink ist ungueltig oder fehlt. Bitte oeffnen Sie den Link aus
                    Ihrer E-Mail erneut.
                  </p>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#232325] hover:text-white visited:text-white"
                  >
                    <span className="text-white">Zur Startseite</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  let bookingSummary:
    | {
        pickup: string;
        destination: string;
        date: string;
        time: string;
        vehicle: string;
      }
    | undefined;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(token) && (!driver || uuidRegex.test(driver))) {
    let query = supabaseAdmin
      .from('bookings')
      .select('pickup, destination, pickup_at, vehicle_type')
      .eq('confirm_token', token);

    if (driver) {
      query = query.eq('driver_id', driver);
    }

    const { data: booking } = await query.maybeSingle();
    if (booking) {
      const { date, time } = formatDriverConfirmDateTime(booking.pickup_at);
      bookingSummary = {
        pickup: String(booking.pickup || '-'),
        destination: String(booking.destination || '-'),
        date,
        time,
        vehicle: String(booking.vehicle_type || '-'),
      };
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="app-container min-h-screen pb-20 pt-10 md:pt-14">
        <div className="mx-auto max-w-[57.5rem]">
          <DriverConfirmClient token={token} driverId={driver} bookingSummary={bookingSummary} />
        </div>
      </section>
    </main>
  );
}
