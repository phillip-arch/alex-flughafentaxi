'use client';

import Link from 'next/link';
import { ChevronDown, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type LanguageOption = {
  code: string;
  label: string;
};

const languages: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Francais' },
  { code: 'es', label: 'Espanol' },
  { code: 'it', label: 'Italiano' },
  { code: 'hu', label: 'Magyar' },
  { code: 'tr', label: 'Tuerkce' },
];

export default function AccountHeaderLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('de');
  const [urlSearch, setUrlSearch] = useState('');
  const [urlHash, setUrlHash] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setActiveLang(params.get('lang')?.toLowerCase() || 'de');
    setUrlSearch(window.location.search);
    setUrlHash(window.location.hash);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-account-lang-menu="true"]')) return;
      setIsOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-account-mobile-lang-menu="true"]')) return;
      setIsMobileOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isMobileOpen]);

  const buildLangHref = (lang: string) => {
    const params = new URLSearchParams(urlSearch);
    params.set('lang', lang);
    const nextSearch = params.toString();
    return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${urlHash}`;
  };

  const renderLanguageItems = (itemClassName: string, codeClassName: string) =>
    languages.map((language) => (
      <Link
        key={language.code}
        href={buildLangHref(language.code)}
        onClick={() => {
          setActiveLang(language.code);
          setIsOpen(false);
          setIsMobileOpen(false);
        }}
        className={`${itemClassName}${activeLang === language.code ? ' bg-[#f5f5f7]' : ''}`}
      >
        <span>{language.label}</span>
        <span className={codeClassName}>{language.code}</span>
      </Link>
    ));

  return (
    <>
      <div className="relative hidden h-10 items-center lg:flex" data-account-lang-menu="true">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-1 text-[15px] font-medium text-white transition-colors hover:text-white/78"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Sprache waehlen"
        >
          <Globe size={20} strokeWidth={2.1} />
          <span className="inline-flex w-[2.1rem] justify-center text-[15px] font-medium uppercase">
            {activeLang}
          </span>
          <ChevronDown size={14} strokeWidth={2.2} />
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-[280px] rounded-[24px] border border-[#e8e8ed] bg-white p-3 text-[#111111] shadow-[0_22px_60px_rgba(17,17,17,0.16)]">
            <div className="grid grid-cols-2 gap-1">
              {renderLanguageItems(
                'flex items-center justify-between rounded-[16px] px-4 py-3.5 text-[15px] font-medium transition-colors hover:bg-[#f5f5f7]',
                'text-[13px] font-semibold uppercase text-[#6b7280]',
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative flex h-10 items-center lg:hidden" data-account-mobile-lang-menu="true">
        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          className="inline-flex min-w-[4.75rem] items-center gap-1.5 text-[0.95rem] font-medium text-white"
          aria-haspopup="menu"
          aria-expanded={isMobileOpen}
          aria-label="Sprache waehlen"
        >
          <Globe size={20} strokeWidth={2.1} />
          <span className="inline-flex w-[2.1rem] justify-center text-[0.95rem] font-medium uppercase">
            {activeLang}
          </span>
          <ChevronDown size={14} strokeWidth={2.2} />
        </button>
      </div>

      {isMobileOpen ? (
        <div className="fixed inset-x-0 top-[66px] bottom-0 z-[75] bg-white text-[#111111] lg:hidden">
          <div className="px-8 pt-8">
            <div className="flex flex-col items-start gap-8">
              {renderLanguageItems(
                'flex w-full items-center justify-between rounded-[16px] px-8 py-2 text-left text-[1.55rem] font-semibold tracking-[-0.05em] text-[#111111]',
                'text-[0.95rem] font-semibold uppercase text-[#6b7280]',
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
