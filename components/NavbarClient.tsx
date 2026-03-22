'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Globe, Menu, User, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

type LanguageOption = {
  code: string;
  label: string;
};

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Preise', href: '/preise' },
  { name: 'Gebiete', href: '/#gebiete' },
  { name: 'Flotte', href: '/#flotte' },
  { name: 'FAQ', href: '/faq' },
];

const languages: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Fran\u00e7ais' },
  { code: 'es', label: 'Espa\u00f1ol' },
  { code: 'it', label: 'Italiano' },
  { code: 'hu', label: 'Magyar' },
  { code: 'tr', label: 'T\u00fcrk\u00e7e' },
];

export default function NavbarClient() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopLangMenuOpen, setIsDesktopLangMenuOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('de');
  const [urlSearch, setUrlSearch] = useState('');
  const [urlHash, setUrlHash] = useState('');
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setActiveLang(params.get('lang')?.toLowerCase() || 'de');
    setUrlSearch(window.location.search);
    setUrlHash(window.location.hash);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isDesktopLangMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-lang-menu-root="true"]')) return;
      setIsDesktopLangMenuOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isDesktopLangMenuOpen]);

  useEffect(() => {
    if (!isMobileLangMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-mobile-lang-menu-root="true"]')) return;
      setIsMobileLangMenuOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isMobileLangMenuOpen]);

  const isAdminPage = pathname.startsWith('/admin');
  if (isAdminPage) return null;

  const headerClass = isHomePage && !isScrolled
    ? 'border-b border-white/10 bg-[#000000] text-white'
    : 'border-b border-white/10 bg-[rgba(0,0,0,0.94)] text-white backdrop-blur-xl';

  const navItemClass = 'text-sm font-medium text-white/72 transition-colors hover:text-white';

  const buildLangHref = (lang: string) => {
    const params = new URLSearchParams(urlSearch);
    params.set('lang', lang);
    const nextSearch = params.toString();
    return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${urlHash}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileLangMenuOpen(false);
    setIsMobileMenuOpen((current) => !current);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDesktopLangMenu = () => {
    setIsDesktopLangMenuOpen((current) => !current);
  };

  const toggleMobileLangMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileLangMenuOpen((current) => !current);
  };

  const handleLanguageSelect = (languageCode: string) => {
    setActiveLang(languageCode);
    setIsDesktopLangMenuOpen(false);
    setIsMobileLangMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const renderLanguageItems = (itemClassName: string, codeClassName: string) =>
    languages.map((language) => (
      <Link
        key={language.code}
        href={buildLangHref(language.code)}
        onClick={() => handleLanguageSelect(language.code)}
        className={`${itemClassName}${activeLang === language.code ? ' bg-[#f5f5f7]' : ''}`}
      >
        <span>{language.label}</span>
        <span className={codeClassName}>{language.code}</span>
      </Link>
    ));

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${headerClass}`}>
        <div className="app-container flex h-[66px] items-center justify-between lg:h-[72px]">
        <Link href="/" className="flex items-center">
          <span className="relative block h-11 w-[120px] overflow-hidden lg:h-12 lg:w-[220px]">
            <Image
              src="https://web-site.website/images/aflogo.jpg"
              alt="Flughafentaxi Alex Logo"
              fill
              sizes="(max-width: 1023px) 120px, 220px"
              className="object-contain object-left"
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={navItemClass}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden h-10 items-center gap-5 lg:flex">
          <div className="relative flex h-10 items-center" data-lang-menu-root="true">
            <button
              type="button"
              onClick={toggleDesktopLangMenu}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-white transition-colors hover:text-white/78"
              aria-haspopup="menu"
              aria-expanded={isDesktopLangMenuOpen}
              aria-label="Sprache waehlen"
            >
              <Globe size={20} strokeWidth={2.1} />
              <span className="inline-flex w-[2.1rem] justify-center text-[15px] font-medium uppercase">
                {activeLang}
              </span>
              <ChevronDown size={14} strokeWidth={2.2} />
            </button>

            {isDesktopLangMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[280px] rounded-[24px] border border-[#e8e8ed] bg-white p-3 text-[#111111] shadow-[0_22px_60px_rgba(17,17,17,0.16)]">
                <div className="grid grid-cols-2 gap-1">
                  {renderLanguageItems(
                    'flex items-center justify-between rounded-[16px] px-3 py-3 text-[15px] font-medium transition-colors hover:bg-[#f5f5f7]',
                    'text-[13px] font-semibold uppercase text-[#6b7280]'
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <Link href="/account?tab=buchungsverlauf" className="ui-icon-button-accent -translate-y-px" aria-label="Zum Konto">
            <User size={18} strokeWidth={2.1} className="text-[#111111]" />
          </Link>
        </div>

        <div className="flex h-10 items-center gap-4 lg:hidden">
          <div className="relative flex h-10 items-center" data-mobile-lang-menu-root="true">
            <button
              type="button"
              onClick={toggleMobileLangMenu}
              className="inline-flex min-w-[4.75rem] items-center gap-1.5 text-[0.95rem] font-medium text-white"
              aria-haspopup="menu"
              aria-expanded={isMobileLangMenuOpen}
              aria-label="Sprache waehlen"
            >
              <Globe size={20} strokeWidth={2.1} />
              <span className="inline-flex w-[2.1rem] justify-center text-[0.95rem] font-medium uppercase">
                {activeLang}
              </span>
              <ChevronDown size={14} strokeWidth={2.2} />
            </button>
          </div>

          <Link href="/account?tab=buchungsverlauf" className="ui-icon-button-accent" aria-label="Zum Konto">
            <User size={18} strokeWidth={2.1} className="text-[#111111]" />
          </Link>

          <button
            className="ml-2 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center text-white"
            aria-label={isMobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
            onClick={toggleMobileMenu}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>
        </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-[80] bg-white text-[#111111] lg:hidden">
          <div className="app-container flex h-[66px] items-center justify-between bg-[#000000] text-white">
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
              <span className="relative block h-11 w-[120px] overflow-hidden">
                <Image
                  src="https://web-site.website/images/aflogo.jpg"
                  alt="Flughafentaxi Alex Logo"
                  fill
                  sizes="120px"
                  className="object-contain object-left"
                />
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="relative flex h-10 items-center" data-mobile-lang-menu-root="true">
                <button
                  type="button"
                  onClick={toggleMobileLangMenu}
                  className="inline-flex min-w-[4.75rem] items-center gap-1.5 text-[0.95rem] font-medium text-white"
                  aria-haspopup="menu"
                  aria-expanded={isMobileLangMenuOpen}
                  aria-label="Sprache waehlen"
                >
                  <Globe size={20} strokeWidth={2.1} />
                  <span className="inline-flex w-[2.1rem] justify-center text-[0.95rem] font-medium uppercase">
                    {activeLang}
                  </span>
                  <ChevronDown size={14} strokeWidth={2.2} />
                </button>
              </div>

              <Link
                href="/account?tab=buchungsverlauf"
                onClick={closeMobileMenu}
                className="ui-icon-button-accent"
                aria-label="Zum Konto"
              >
                <User size={18} strokeWidth={2.1} className="text-[#111111]" />
              </Link>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="ml-2 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center text-white"
                aria-label="Menue schliessen"
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  <X size={20} />
                </span>
              </button>
            </div>
          </div>

          <div className="flex min-h-[calc(100vh-66px)] flex-col px-8 pb-10 pt-8">
            <nav className="flex flex-col items-start gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="text-left text-[1.55rem] font-semibold tracking-[-0.05em] text-[#111111]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      {isMobileLangMenuOpen ? (
        <div className="fixed inset-x-0 top-[66px] bottom-0 z-[75] bg-white text-[#111111] lg:hidden">
          <div className="px-8 pt-8">
            <div className="flex flex-col items-start gap-8">
              {renderLanguageItems(
                'flex w-full items-center justify-between text-left text-[1.55rem] font-semibold tracking-[-0.05em] text-[#111111]',
                'text-[0.95rem] font-semibold uppercase text-[#6b7280]'
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
