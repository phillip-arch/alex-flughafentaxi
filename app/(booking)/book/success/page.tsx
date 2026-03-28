import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import NavbarClient from '@/components/NavbarClient';
import AccountMobileBottomNav from '@/components/account/AccountMobileBottomNav';
import { getAppSurface } from '@/lib/routing/surfaces';

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

export default async function BookingSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const isAppSurface = getAppSurface() === 'app';

  const returnHomeHref = isLoggedIn ? '/account' : '/';
  const bookAnotherRideHref = '/book';

  return (
    <>
      {!isAppSurface ? <NavbarClient /> : null}
      <main className="bg-white">
        <section className={`app-container pb-32 md:pb-28 ${isAppSurface ? 'pt-4 md:pt-5' : 'pt-28 md:pt-32'}`}>
          <div className="mx-auto max-w-[57.5rem]">
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]">
                  <CheckCircle2 size={38} />
                </div>

                <div className="mt-14 flex flex-col items-center gap-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
                    Buchung erfolgreich
                  </p>
                  <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
                    Vielen Dank fuer Ihre Buchung
                  </h1>
                  <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
                    Wir haben Ihnen eine Bestaetigungs-E-Mail gesendet. Unser Team prueft Ihre Anfrage
                    und meldet sich bei Bedarf mit allen weiteren Details.
                  </p>
                </div>

                <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
                    <div className="flex items-center gap-2 text-[#1679FF]">
                      <Mail size={18} />
                      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">
                        Bestaetigung
                      </p>
                    </div>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                      Bitte pruefen Sie Ihr E-Mail-Postfach. Dort finden Sie Ihre Buchungsbestaetigung
                      und alle relevanten Transferdaten.
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
                    <div className="flex items-center gap-2 text-[#1679FF]">
                      <ShieldCheck size={18} />
                      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">
                        Naechster Schritt
                      </p>
                    </div>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                      Bei Fragen zu Ihrer Fahrt erreichen Sie uns weiterhin schnell per Telefon,
                      WhatsApp oder Viber.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href={bookAnotherRideHref}
                    className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#232325] hover:text-white visited:text-white"
                  >
                    <span className="text-white">Weitere Fahrt buchen</span>
                    <ArrowRight size={17} className="text-white" />
                  </Link>
                  <Link
                    href={returnHomeHref}
                    className="inline-flex items-center justify-center rounded-[var(--radius-field)] border border-[#dbe7f8] bg-white px-7 py-4 text-[1.0625rem] font-medium leading-none text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]"
                  >
                    {isLoggedIn ? 'Zu Mein Konto' : 'Zur Startseite'}
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
