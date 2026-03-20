'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Menu, User, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const NavbarClient = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<'de' | 'en'>('de');
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

  const navItems = [
    { name: 'Preise', href: '/preise' },
    { name: 'Gebiete', href: '/#gebiete' },
    { name: 'Flotte', href: '/#flotte' },
    { name: 'FAQ', href: '/faq' },
  ];

  const isAdminPage = pathname.startsWith('/admin');
  if (isAdminPage) return null;

  const headerClass = isHomePage && !isScrolled
    ? 'border-b border-white/10 bg-[#000000] text-white'
    : 'border-b border-white/10 bg-[rgba(0,0,0,0.94)] text-white backdrop-blur-xl';

  const navItemClass = 'text-white/72 hover:text-white';
  const nextLang = activeLang === 'en' ? 'de' : 'en';
  const buildLangHref = (lang: 'de' | 'en') => `${pathname}?lang=${lang}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setActiveLang(params.get('lang')?.toLowerCase() === 'en' ? 'en' : 'de');
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="app-container flex h-[66px] items-center justify-between lg:h-[72px]">
        <Link href="/" className="flex items-center">
          <span className="relative block h-11 w-[220px] overflow-hidden lg:h-12">
            <Image
              src="https://web-site.website/images/aflogo.jpg"
              alt="Flughafentaxi Alex Logo"
              fill
              sizes="220px"
              className="object-contain object-left"
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${navItemClass}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={buildLangHref(nextLang)}
            className="inline-flex items-center gap-1 text-[15px] font-medium text-white transition-colors hover:text-white/78"
            aria-label={`Switch language to ${nextLang.toUpperCase()}`}
          >
            <Globe size={20} strokeWidth={2.1} />
            <span className="text-[15px] font-medium uppercase">{nextLang}</span>
          </Link>
          <Link
            href="/account"
            className="ui-icon-button-accent"
            aria-label="Zum Konto"
          >
            <User size={18} strokeWidth={2.1} className="text-[#111111]" />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/account"
            className="ui-icon-button-accent"
            aria-label="Zum Konto"
          >
            <User size={18} strokeWidth={2.1} className="text-[#111111]" />
          </Link>
          <button
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center text-white"
            aria-label={isMobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white text-[#111111] lg:hidden">
          <div className="app-container flex h-[66px] items-center justify-between bg-[#000000] text-white">
            <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="relative block h-11 w-[220px] overflow-hidden">
                <Image
                  src="https://web-site.website/images/aflogo.jpg"
                  alt="Flughafentaxi Alex Logo"
                  fill
                  sizes="220px"
                  className="object-contain object-left"
                />
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="ui-icon-button-accent"
                aria-label="Zum Konto"
              >
                <User size={18} strokeWidth={2.1} className="text-[#111111]" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center text-white"
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left text-[1.55rem] font-semibold tracking-[-0.05em] text-[#111111]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="pt-10">
              <Link
                href={buildLangHref(nextLang)}
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center gap-1 text-[0.95rem] font-medium text-[#111111]"
                aria-label={`Switch language to ${nextLang.toUpperCase()}`}
              >
                <Globe size={20} strokeWidth={2.1} />
                <span className="text-[0.95rem] font-medium uppercase">{nextLang}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavbarClient;
