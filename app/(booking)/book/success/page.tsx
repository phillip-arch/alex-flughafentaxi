import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
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

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-14 md:py-20">
      <div className="max-w-[820px] mx-auto">
        <div className="bg-white rounded-[32px] border border-[#d2d2d7] shadow-sm p-8 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-[#eafaf0] border border-[#b9ebc9] flex items-center justify-center mx-auto mb-7 text-[#1f7a3f]">
            <CheckCircle2 size={40} />
          </div>

          <p className="text-[12px] font-medium uppercase tracking-wide text-[#86868b] mb-3">
            Buchung Erfolgreich
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold leading-tight tracking-tight text-[#1d1d1f] mb-4">
            Booking Confirmed
          </h1>
          <p className="text-[17px] text-[#86868b] max-w-[560px] mx-auto mb-10">
            Thank you for your booking. We have sent a confirmation email to your inbox.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[520px] mx-auto">
            <Link
              href="/"
              className="block w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[17px] py-3 rounded-full transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/book"
              className="block w-full bg-white text-[#1d1d1f] font-medium text-[17px] py-3 rounded-full border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors"
            >
              Book Another Ride
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
