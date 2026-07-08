'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Globe, Menu, Phone, User, X } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

type LanguageOption = {
  code: string;
  label: string;
};

const navItems = [
  { name: 'Preise', href: '/preise' },
  { name: 'Ihr Team', href: '/#team' },
  { name: 'Fahrzeuge', href: '/#flotte' },
  { name: 'Weitere Ziele', href: '/preise' },
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

export default function NavbarClient({
  accountHref = '/account?tab=buchungsverlauf',
  showAccountEntry = true,
}: {
  accountHref?: string;
  showAccountEntry?: boolean;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopLangMenuOpen, setIsDesktopLangMenuOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeLang = searchParams.get('lang')?.toLowerCase() === 'en' ? 'en' : 'de';
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

  const isAdminPage = pathname.startsWith('/dispatch');
  if (isAdminPage) return null;

  const headerClass = 'bg-[#070d18]/72 text-white backdrop-blur-xl';

  const navItemClass = 'text-[clamp(0.92rem,0.9vw,1.08rem)] font-medium whitespace-nowrap text-[#9AA4B6] transition-colors hover:text-[#F4F1E8] min-[1536px]:text-[clamp(1rem,1.05vw,1.25rem)]';

  const withLang = (href: string) => {
    const [pathWithSearch, hash = ''] = href.split('#');
    const [path, existingSearch = ''] = pathWithSearch.split('?');
    const params = new URLSearchParams(existingSearch);
    params.set('lang', activeLang);
    const nextSearch = params.toString();
    return `${path}${nextSearch ? `?${nextSearch}` : ''}${hash ? `#${hash}` : ''}`;
  };

  const buildLangHref = (lang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lang);
    const nextSearch = params.toString();
    return `${pathname}${nextSearch ? `?${nextSearch}` : ''}`;
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
        <div className="mx-auto flex h-[70px] w-full max-w-[1780px] items-center justify-between px-5 sm:px-8 lg:h-[76px] lg:px-8 min-[1180px]:grid min-[1180px]:grid-cols-[minmax(250px,0.82fr)_minmax(380px,1fr)_minmax(300px,0.78fr)] min-[1180px]:gap-4 min-[1180px]:px-8 min-[1536px]:grid-cols-[minmax(255px,0.92fr)_minmax(430px,1fr)_minmax(330px,0.8fr)] min-[1536px]:gap-6 min-[1536px]:px-12 min-[1900px]:h-[96px] min-[1900px]:grid-cols-[minmax(330px,0.95fr)_minmax(520px,1fr)_minmax(390px,0.8fr)] min-[1900px]:px-[82px]">
        <Link href={withLang('/')} className="flex min-w-0 items-center gap-3 justify-self-start min-[1536px]:gap-[18px]" aria-label="Servus Transfer home">
          <span className="servus-logo-mark h-[48px] w-[48px] shrink-0 rounded-[13px] bg-[#FFB629] font-display text-[31px] font-black text-[#070d18] shadow-[0_18px_45px_rgba(255,182,41,0.22)] min-[1536px]:h-[62px] min-[1536px]:w-[62px] min-[1536px]:rounded-[16px] min-[1536px]:text-[40px]">
            <span>s</span>
          </span>
          <span className="hidden min-w-0 leading-none sm:block">
            <span className="block truncate font-display text-[24px] font-black tracking-[-0.025em] text-[#F4F1E8] min-[1536px]:text-[32px]">
              Servus Transfer
            </span>
            <span className="mt-2 block truncate font-mono text-[10px] uppercase tracking-[0.28em] text-[#9AA4B6] min-[1536px]:mt-[13px] min-[1536px]:text-[14px] min-[1536px]:tracking-[0.34em]">
              Flughafentaxi Wien
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center justify-center gap-[clamp(0.9rem,1.35vw,1.6rem)] min-[1180px]:flex min-[1536px]:gap-[clamp(1.15rem,2vw,2.45rem)]">
          {navItems.map((item) => (
            <Link key={item.name} href={withLang(item.href)} className={navItemClass}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 min-[1180px]:flex min-[1536px]:gap-3 min-[1900px]:gap-[18px]">
          <div className="servus-lang-switch flex h-[44px] w-[106px] shrink-0 overflow-hidden rounded-full border border-[rgba(244,241,232,0.10)] bg-[#1a1e25] min-[1900px]:h-[48px] min-[1900px]:w-[116px]">
            {(['de', 'en'] as const).map((languageCode) => (
              <Link
                key={languageCode}
                href={buildLangHref(languageCode)}
                className={`servus-lang-switch__item grid h-full flex-1 place-items-center text-[13px] font-medium uppercase transition-colors min-[1900px]:text-[15px] ${
                  activeLang === languageCode ? 'is-active' : ''
                }`}
              >
                {languageCode}
              </Link>
            ))}
          </div>

          <a
            href="tel:+436600000000"
            className="inline-flex h-[50px] w-[clamp(202px,15vw,245px)] shrink-0 items-center justify-center gap-2.5 rounded-[999px] bg-[#FFB629] px-4 text-[clamp(0.88rem,0.95vw,1.08rem)] font-black leading-none text-[#050914] shadow-[0_18px_42px_rgba(255,182,41,0.30)] transition-colors duration-200 hover:bg-[#FFC247] min-[1536px]:h-[54px] min-[1536px]:w-[clamp(220px,16vw,270px)] min-[1536px]:gap-3 min-[1536px]:px-5 min-[1536px]:text-[clamp(0.96rem,1.06vw,1.2rem)] min-[1900px]:h-[60px] min-[1900px]:w-[285px] min-[1900px]:gap-[14px] min-[1900px]:px-7 min-[1900px]:text-[21px]"
          >
            <Phone size={23} strokeWidth={3.2} className="shrink-0 text-[#050914]" />
            <span className="whitespace-nowrap">+43 660 000 00 00</span>
          </a>
        </div>

        <div className="flex h-10 items-center gap-4 min-[1180px]:hidden">
          <div className="relative flex h-10 items-center" data-mobile-lang-menu-root="true">
            <button
              type="button"
              onClick={toggleMobileLangMenu}
              className="inline-flex min-w-[4.75rem] items-center gap-1.5 text-[0.95rem] font-medium text-white"
              aria-haspopup="menu"
              aria-expanded={isMobileLangMenuOpen}
              aria-label="Choose language"
            >
              <Globe size={20} strokeWidth={2.1} />
              <span className="inline-flex w-[2.1rem] justify-center text-[0.95rem] font-medium uppercase">
                {activeLang}
              </span>
              <ChevronDown size={14} strokeWidth={2.2} />
            </button>
          </div>

          {showAccountEntry ? (
            <Link href={withLang(accountHref)} className="ui-icon-button-accent !bg-[#FFB629] !text-[#0A111F]" aria-label="Go to account">
              <User size={18} strokeWidth={2.1} className="text-[#111111]" />
            </Link>
          ) : null}

          <button
            className="ml-2 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center text-white"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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
        <div className="fixed inset-0 z-[80] bg-white text-[#111111] min-[1180px]:hidden">
          <div className="app-container flex h-[66px] items-center justify-between bg-[#000000] text-white">
            <Link href={withLang('/')} className="flex items-center gap-2.5" onClick={closeMobileMenu} aria-label="Servus Transfer home">
              <span className="servus-logo-mark h-[34px] w-[34px] rounded-[9px] bg-[#FFB629] font-display text-[20px] font-black text-[#0A111F]">
                <span>S</span>
              </span>
              <span className="leading-none">
                <span className="block font-display text-[16px] font-black text-white">Servus Transfer</span>
                <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">Flughafentaxi Wien</span>
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
                  aria-label="Choose language"
                >
                  <Globe size={20} strokeWidth={2.1} />
                  <span className="inline-flex w-[2.1rem] justify-center text-[0.95rem] font-medium uppercase">
                    {activeLang}
                  </span>
                  <ChevronDown size={14} strokeWidth={2.2} />
                </button>
              </div>

              {showAccountEntry ? (
                <Link
                  href={withLang(accountHref)}
                  onClick={closeMobileMenu}
                  className="ui-icon-button-accent"
                  aria-label="Go to account"
                >
                  <User size={18} strokeWidth={2.1} className="text-[#111111]" />
                </Link>
              ) : null}

              <button
                type="button"
                onClick={closeMobileMenu}
                className="ml-2 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center text-white"
                aria-label="Close menu"
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
                  href={withLang(item.href)}
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
        <div className="fixed inset-x-0 top-[66px] bottom-0 z-[75] bg-white text-[#111111] min-[1180px]:hidden">
          <div className="px-8 pt-8">
            <div className="flex flex-col items-start gap-8">
              {renderLanguageItems(
                'flex w-full items-center justify-between rounded-[16px] px-8 py-2 text-left text-[1.55rem] font-semibold tracking-[-0.05em] text-[#111111]',
                'text-[0.95rem] font-semibold uppercase text-[#6b7280]'
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
