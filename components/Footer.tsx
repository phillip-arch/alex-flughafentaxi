'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock3, Instagram, ShieldCheck, ShieldEllipsis } from 'lucide-react';

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
    <footer id="site-footer" className="mt-auto bg-[var(--night)] text-[var(--paper)]">
      <div className="app-container py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">

          {/* Brand / CTA */}
          <div>
            <h2 className="text-[2rem] font-black leading-[1.05] tracking-[-0.055em] !text-[var(--paper)] md:text-[2.5rem]">
              Book your airport<br />taxi now
            </h2>

            <p className="mt-4 text-[0.95rem] leading-[1.7] text-[var(--muted)]">
              Book in less than 1 minute. On-time pickup, transparent fixed prices, and direct support by phone or WhatsApp.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={withLang('/book')}
                className="ui-button-booking-primary !w-auto !flex-none"
              >
                Book now
              </Link>
              <Link
                href={withLang('/preise')}
                className="inline-flex items-center rounded-[0.9rem] border border-[var(--line)] px-6 py-3.5 text-[0.95rem] font-semibold text-[var(--paper)] transition-colors hover:border-[rgba(255,182,41,.35)] hover:text-[var(--paper)]"
              >
                View prices
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.88rem] text-[var(--muted)]">
              <span className="inline-flex items-center gap-2">
                <Clock3 size={15} className="text-[var(--amber)]" />
                On-time pickup
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldEllipsis size={15} className="text-[var(--amber)]" />
                No hidden costs
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={15} className="text-[var(--amber)]" />
                Reliable airport transfer
              </span>
            </div>

            <div className="mt-8 flex gap-3">
              <a
                href="#"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[rgba(255,182,41,.35)] hover:text-[var(--paper)]"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[rgba(255,182,41,.35)] hover:text-[var(--paper)]"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Services</p>
            <ul className="mt-5 space-y-4">
              <li>
                <Link href={withLang('/book')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Airport Transfer
                </Link>
              </li>
              <li>
                <Link href={withLang('/#flotte')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Group Transfers
                </Link>
              </li>
              <li>
                <Link href={withLang('/#flotte')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Child Seats
                </Link>
              </li>
              <li>
                <Link href={withLang('/preise')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Fixed Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Quick Links</p>
            <ul className="mt-5 space-y-4">
              <li>
                <Link href={withLang('/preise')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Prices
                </Link>
              </li>
              <li>
                <Link href={withLang('/#gebiete')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Areas
                </Link>
              </li>
              <li>
                <Link href={withLang('/#flotte')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Fleet
                </Link>
              </li>
              <li>
                <Link href={withLang('/faq')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Legal</p>
            <ul className="mt-5 space-y-4">
              <li>
                <Link href={`/impressum?lang=${activeLang}`} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Imprint
                </Link>
              </li>
              <li>
                <Link href={withLang('/datenschutz')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={withLang('/agb')} className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-14 border-t border-[var(--line)] pt-6 text-[0.82rem] text-[var(--muted)]">
          © 2025 Alex Airport Taxi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
