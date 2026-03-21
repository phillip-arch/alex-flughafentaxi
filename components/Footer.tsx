import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

function TikTokIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.68h-3.2v12.45a2.89 2.89 0 1 1-2-2.75V8.48a6.08 6.08 0 1 0 5.19 6v-6.3a8.05 8.05 0 0 0 4.8 1.6V6.69Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-[#000000] py-14 text-white md:py-16">
      <div className="app-container">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:gap-6">
          <div className="max-w-[31rem]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
              Flughafentaxi Wien
            </p>
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="relative mt-4 block h-12 w-[250px] overflow-hidden">
                <Image
                  src="https://web-site.website/images/aflogo.jpg"
                  alt="Flughafentaxi Alex Logo"
                  fill
                  sizes="250px"
                  className="object-contain object-left"
                />
              </span>
            </Link>
            <p className="ui-copy-compact mt-6 max-w-[26rem] text-white/62">
              Sicher, puenktlich und zuverlaessig zum Flughafen Wien (VIE). Ihr komfortabler
              Transfer mit Fixpreis-Garantie.
            </p>

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
            <h4 className="text-[1.55rem] font-semibold tracking-[-0.04em] !text-white">
              Quick Links
            </h4>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/preise" className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/#gebiete" className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  Gebiete
                </Link>
              </li>
              <li>
                <Link href="/#flotte" className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  Flotte
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[1rem] !text-white/62 transition-colors hover:!text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.03] px-6 py-6 text-white">
            <h4 className="text-[1.55rem] font-semibold tracking-[-0.04em] !text-white">
              Rechtliches
            </h4>
            <ul className="mt-6 space-y-4">
              <li className="text-[1rem] !text-white/62">Impressum</li>
              <li className="text-[1rem] !text-white/62">Datenschutz</li>
              <li className="text-[1rem] !text-white/62">AGB</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
