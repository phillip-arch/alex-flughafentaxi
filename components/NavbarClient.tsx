'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, User, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const NavbarClient = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    ? 'border-b border-black/8 bg-transparent text-[#111111]'
    : 'border-b border-black/8 bg-[rgba(243,243,238,0.92)] text-[#111111] backdrop-blur-xl';

  const navItemClass = isHomePage && !isScrolled
    ? 'text-[#5f6368] hover:text-[#111111]'
    : 'text-[#3c4043] hover:text-[#111111]';

  const secondaryActionClass = isHomePage && !isScrolled
    ? 'border border-black/10 bg-white text-[#111111] hover:bg-[#f4f4ef]'
    : 'border border-black/10 bg-white text-[#111111] hover:bg-[#f4f4ef]';

  const primaryActionClass = isHomePage && !isScrolled
    ? 'bg-[#111111] text-white hover:bg-[#232325]'
    : 'bg-[#111111] text-white hover:bg-[#232325]';

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="mx-auto flex h-[76px] max-w-[1520px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-current/10 text-sm font-semibold">
            FT
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-[0.18em]">FLUGHAFENTAXI</p>
            <p className={`text-xs ${isHomePage && !isScrolled ? 'text-[#5f6368]' : 'text-[#5f6368]'}`}>Wien Airport Transfer</p>
          </div>
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
            href="/account"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${secondaryActionClass}`}
            aria-label="Konto Login"
          >
            <User size={16} />
            <span>Konto</span>
          </Link>
          <Link
            href="#hero-booking"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${primaryActionClass}`}
          >
            Fahrt buchen
            <ArrowRight size={16} />
          </Link>
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-current/10 lg:hidden"
          aria-label={isMobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-current/10 bg-[#0f0f10] px-4 py-6 text-white lg:hidden">
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
              href="#hero-booking"
              className="rounded-2xl bg-white px-4 py-4 text-lg font-semibold text-[#111111]"
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
