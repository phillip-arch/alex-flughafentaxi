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
    <footer className="mt-auto bg-[#171717] py-14 text-white md:py-16">
      <div className="app-container">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr_0.75fr] lg:gap-16">
          <div className="max-w-[31rem]">
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="relative block h-12 w-[250px] overflow-hidden">
                <Image
                  src="https://web-site.website/images/aflogo.jpg"
                  alt="Flughafentaxi Alex Logo"
                  fill
                  sizes="250px"
                  className="object-contain object-left"
                />
              </span>
            </Link>
            <p className="ui-copy-compact mt-8 max-w-[26rem] text-white/62">
              Sicher, puenktlich und zuverlaessig zum Flughafen Wien (VIE). Ihr komfortabler
              Transfer mit Fixpreis-Garantie.
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="#"
                aria-label="TikTok"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/14"
              >
                <TikTokIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/14"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[1.95rem] font-semibold tracking-[-0.04em] text-white">
              Quick Links
            </h4>
            <ul className="mt-8 space-y-6">
              <li>
                <Link href="/preise" className="text-[1.05rem] text-white/62 transition-colors hover:text-white">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/#gebiete" className="text-[1.05rem] text-white/62 transition-colors hover:text-white">
                  Gebiete
                </Link>
              </li>
              <li>
                <Link href="/#flotte" className="text-[1.05rem] text-white/62 transition-colors hover:text-white">
                  Flotte
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[1.05rem] text-white/62 transition-colors hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[1.95rem] font-semibold tracking-[-0.04em] text-white">
              Rechtliches
            </h4>
            <ul className="mt-8 space-y-6">
              <li className="text-[1.05rem] text-white/62">Impressum</li>
              <li className="text-[1.05rem] text-white/62">Datenschutz</li>
              <li className="text-[1.05rem] text-white/62">AGB</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
