'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Globe, Menu, User, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';

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
            className="inline-flex items-center gap-3 text-[15px] font-medium text-white transition-colors hover:text-white/78"
            aria-label={`Switch language to ${nextLang.toUpperCase()}`}
          >
            <Globe size={20} strokeWidth={2.1} />
            <span className="text-[15px] font-medium uppercase">{nextLang}</span>
          </Link>
          <Button
            href="/account"
            className="border-white/12 bg-white/8 px-4 py-2 text-sm font-medium !text-white hover:bg-white/12"
            variant="secondary"
          >
            <User size={16} />
            <span>Konto</span>
          </Button>
          <Button
            href="/book"
            className="px-5 py-3 text-sm font-semibold !text-white"
            variant="primary"
          >
            Fahrt buchen
            <ArrowRight size={16} />
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center text-white lg:hidden"
          aria-label={isMobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-current/10 bg-[#000000] px-4 py-6 text-white lg:hidden">
          <Link
            href={buildLangHref(nextLang)}
            onClick={() => setIsMobileMenuOpen(false)}
            className="mb-4 inline-flex items-center gap-3 text-[15px] font-medium text-white"
            aria-label={`Switch language to ${nextLang.toUpperCase()}`}
          >
            <Globe size={20} strokeWidth={2.1} />
            <span className="text-[15px] font-medium uppercase">{nextLang}</span>
          </Link>
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-lg font-semibold"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/account"
              className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-lg font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Konto
            </Link>
            <Link
              href="/book"
              className="rounded-2xl bg-white px-4 py-4 text-lg font-semibold !text-[#111111]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fahrt buchen
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavbarClient;
