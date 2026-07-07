import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import NavbarClient from '@/components/NavbarClient';

export default function NotFound() {
  return (
    <>
      <NavbarClient />
      <main className="servus-page">
        <section className="app-container pb-24 pt-28 md:pb-28 md:pt-32">
          <div className="mx-auto max-w-[57.5rem]">
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,182,41,.35)] bg-[linear-gradient(135deg,rgba(255,182,41,.12)_0%,rgba(255,182,41,.18)_100%)] text-[var(--amber)]">
                  <Compass size={36} />
                </div>

                <div className="mt-14 flex flex-col items-center gap-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
                    404
                  </p>
                  <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--paper)] md:text-[2.6rem]">
                    Diese Seite wurde nicht gefunden
                  </h1>
                  <p className="max-w-[34rem] text-[1rem] leading-8 text-[var(--muted)] md:text-[1.06rem]">
                    Der Link ist ungueltig, wurde verschoben oder die Seite ist nicht mehr verfuegbar.
                    Ueber die Startseite oder die Buchung kommen Sie schnell wieder an die richtige Stelle.
                  </p>
                </div>

                <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left">
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
                      Startseite
                    </p>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[var(--muted)]">
                      Zurueck zur Hauptseite mit allen Informationen zu Fahrzeugen, Preisen und dem
                      Flughafentransfer.
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left">
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
                      Direkt buchen
                    </p>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[var(--muted)]">
                      Wenn Sie bereits buchen moechten, gelangen Sie direkt zur Buchungsseite ohne
                      Umweg.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[var(--amber)] px-7 py-4 text-[1.0625rem] font-medium leading-none text-[var(--night)] no-underline transition-colors hover:bg-[var(--amber-deep)] hover:text-[var(--night)] visited:text-[var(--night)]"
                  >
                    <span className="text-[var(--night)]">Zur Startseite</span>
                    <ArrowRight size={17} className="text-[var(--night)]" />
                  </Link>
                  <Link
                    href="/book"
                    className="inline-flex items-center justify-center rounded-[var(--radius-field)] border border-[var(--line)] bg-[rgba(255,255,255,.05)] px-7 py-4 text-[1.0625rem] font-medium leading-none text-[var(--paper)] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:border-[rgba(255,182,41,.35)] hover:text-[var(--amber)]"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
