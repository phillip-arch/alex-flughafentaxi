import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import NavbarClient from '@/components/NavbarClient';

export default function NotFound() {
  return (
    <>
      <NavbarClient />
      <main className="bg-white">
        <section className="app-container pb-24 pt-28 md:pb-28 md:pt-32">
          <div className="mx-auto max-w-[57.5rem]">
            <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
              <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]">
                  <Compass size={36} />
                </div>

                <div className="mt-14 flex flex-col items-center gap-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
                    404
                  </p>
                  <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
                    Diese Seite wurde nicht gefunden
                  </h1>
                  <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
                    Der Link ist ungueltig, wurde verschoben oder die Seite ist nicht mehr verfuegbar.
                    Ueber die Startseite oder die Buchung kommen Sie schnell wieder an die richtige Stelle.
                  </p>
                </div>

                <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
                      Startseite
                    </p>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                      Zurueck zur Hauptseite mit allen Informationen zu Fahrzeugen, Preisen und dem
                      Flughafentransfer.
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
                      Direkt buchen
                    </p>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                      Wenn Sie bereits buchen moechten, gelangen Sie direkt zur Buchungsseite ohne
                      Umweg.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#232325] hover:text-white visited:text-white"
                  >
                    <span className="text-white">Zur Startseite</span>
                    <ArrowRight size={17} className="text-white" />
                  </Link>
                  <Link
                    href="/book"
                    className="inline-flex items-center justify-center rounded-[var(--radius-field)] border border-[#dbe7f8] bg-white px-7 py-4 text-[1.0625rem] font-medium leading-none text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]"
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
