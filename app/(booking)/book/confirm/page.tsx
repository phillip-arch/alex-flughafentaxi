import { XCircle } from 'lucide-react';
import Link from 'next/link';
import ConfirmClient from './ConfirmClient';
import type { Metadata } from 'next';

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

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
        <div className="w-full max-w-[560px] bg-white rounded-[24px] px-7 py-8 sm:px-10 sm:py-10 text-center shadow-sm border border-[#d2d2d7]">
          <div className="w-16 h-16 bg-[#fff2f4] rounded-full flex items-center justify-center mx-auto mb-5 text-[#d70015]">
            <XCircle size={32} />
          </div>
          <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">Fehler</h1>
          <p className="text-[#86868b] text-[15px] mb-8">
            Ungültiger oder fehlender Bestätigungslink.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full h-14 bg-[#1d1d1f] hover:bg-black text-white font-medium text-[17px] rounded-full transition-all"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <ConfirmClient token={token} driverId={driver} />
    </div>
  );
}
