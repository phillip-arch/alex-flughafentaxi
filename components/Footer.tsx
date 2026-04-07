'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Clock3, Instagram, ShieldCheck, ShieldEllipsis } from 'lucide-react';

function TikTokIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.68h-3.2v12.45a2.89 2.89 0 1 1-2-2.75V8.48a6.08 6.08 0 1 0 5.19 6v-6.3a8.05 8.05 0 0 0 4.8 1.6V6.69Z" />
    </svg>
  );
}

export default function Footer() {
  const searchParams = useSearchParams();
  const activeLang = searchParams.get('lang')?.toLowerCase() === 'en' ? 'en' : 'de';
  const withLang = (href: string) => {
    const [pathWithSearch, hash = ''] = href.split('#');
    const [path, existingSearch = ''] = pathWithSearch.split('?');
    const params = new URLSearchParams(existingSearch);
    params.set('lang', activeLang);
    const nextSearch = params.toString();
    return `${path}${nextSearch ? `?${nextSearch}` : ''}${hash ? `#${hash}` : ''}`;
  };

  return (
    <footer className="mt-auto border-t border-white/8 bg-[#000000] py-14 text-white md:py-16">
      <div className="app-container">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-[#151515] px-6 py-6 shadow-[0_18px_42px_rgba(0,0,0,0.24)] md:px-7 md:py-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1d4f96] bg-[#101d31] px-4 py-2 text-[0.95rem] font-semibold tracking-[-0.02em] text-[#78a9ff]">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Fixpreis • 24/7 verfuegbar</span>
            </div>

            <h2 className="mt-6 max-w-[12ch] text-[2.3rem] font-black tracking-[-0.055em] !text-white md:max-w-none md:text-[3.3rem]">
              Jetzt Flughafentaxi buchen
            </h2>

            <p className="mt-5 max-w-[32rem] text-[1.08rem] leading-[1.7] text-white/64">
              In weniger als 1 Minute buchen. Puenktliche Abholung, transparente
              Fixpreise und direkte Erreichbarkeit per Telefon oder WhatsApp.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={withLang('/book')}
                className="inline-flex items-center justify-center gap-3 rounded-[1.35rem] bg-white px-6 py-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-[#111111] transition-transform hover:-translate-y-[1px]"
              >
                <span>Jetzt Fahrt sichern</span>
                <ChevronRight size={19} />
              </Link>
              <Link
                href={withLang('/preise')}
                className="inline-flex items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-6 py-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-white/92 transition-colors hover:bg-white/[0.08]"
              >
                Preise ansehen
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-3 text-[1rem] text-white/68 md:flex-row md:flex-wrap md:gap-x-8 md:gap-y-3">
              <div className="inline-flex items-center gap-2.5">
                <Clock3 size={18} className="text-[#1679ff]" />
                <span>Puenktliche Abholung</span>
              </div>
              <div className="inline-flex items-center gap-2.5">
                <ShieldEllipsis size={18} className="text-[#1679ff]" />
                <span>Keine versteckten Kosten</span>
              </div>
              <div className="inline-flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-[#1679ff]" />
                <span>Zuverlaessiger Flughafentransfer</span>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <a
                href="#"
                aria-label="TikTok"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10"
              >
                <TikTokIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.03] px-6 py-6 text-white">
            <h3 className="text-[1.55rem] font-semibold tracking-[-0.04em] !text-white">
              Quick Links
            </h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href={withLang('/preise')} className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  Preise
                </Link>
              </li>
              <li>
                <Link href={withLang('/#gebiete')} className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  Gebiete
                </Link>
              </li>
              <li>
                <Link href={withLang('/#flotte')} className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  Flotte
                </Link>
              </li>
              <li>
                <Link href={withLang('/faq')} className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.03] px-6 py-6 text-white">
            <h3 className="text-[1.55rem] font-semibold tracking-[-0.04em] !text-white">
              Rechtliches
            </h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  href={`/impressum?lang=${activeLang}`}
                  className="text-[1rem] !text-white/62 transition-colors hover:!text-white"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href={withLang('/datenschutz')}
                  className="text-[1rem] !text-white/62 transition-colors hover:!text-white"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link
                  href={withLang('/agb')}
                  className="text-[1rem] !text-white/62 transition-colors hover:!text-white"
                >
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
