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

  const buildLangHref = (lang: string) => {
    const params = new URLSearchParams(urlSearch);
    params.set('lang', lang);
    const nextSearch = params.toString();
    return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${urlHash}`;
  };

  return (
    <div className="relative" data-account-lang-menu="true">
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
        <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[220px] rounded-[22px] border border-[#e8e8ed] bg-white p-2 text-[#111111] shadow-[0_22px_60px_rgba(17,17,17,0.2)]">
          <div className="grid gap-1">
            {languages.map((language) => (
              <Link
                key={language.code}
                href={buildLangHref(language.code)}
                onClick={() => {
                  setActiveLang(language.code);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between rounded-[14px] px-3 py-3 text-[0.95rem] font-medium transition-colors hover:bg-[#f5f5f7] ${
                  activeLang === language.code ? 'bg-[#f5f5f7]' : ''
                }`}
              >
                <span>{language.label}</span>
                <span className="text-[0.8rem] font-semibold uppercase text-[#6b7280]">
                  {language.code}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
