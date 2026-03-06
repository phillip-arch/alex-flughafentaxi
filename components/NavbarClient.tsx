'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Car, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
const NavbarClient = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-gray-200' : 'bg-white'
      }`}
    >
      <div className="max-w-[980px] mx-auto px-4 h-[48px] flex items-center justify-between text-[#1d1d1f] text-[12px] font-light tracking-wide">
        {/* Left: Logo (Apple style is usually centered or left, screenshot shows left) */}
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
          <Car size={20} />
        </Link>

        {/* Desktop Nav - Centered */}
        <nav className="hidden md:flex items-center justify-center gap-8 w-full absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[12px] text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right: Actions (Search, Bag, Menu equivalent) */}
        <div className="flex items-center gap-6">
          {/* Search Icon Placeholder */}
          <button className="opacity-80 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          
          {/* Bag/Booking Icon */}
          <Link href="/book" className="opacity-80 hover:opacity-100">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </Link>

          <Link
            href="/account"
            className="hidden md:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity text-[12px]"
            aria-label="Konto Login"
          >
            <User size={16} />
            <span>Konto</span>
          </Link>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden opacity-80 hover:opacity-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[48px] left-0 right-0 bg-white h-screen p-8 animate-in slide-in-from-top-4 duration-300 z-50">
          <nav className="flex flex-col gap-6 text-[#1d1d1f]">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[28px] font-semibold leading-tight"
              >
                {item.name}
              </Link>
            ))}
            <Link 
              href="/book" 
              className="text-[28px] font-semibold leading-tight text-[#0071e3]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Jetzt buchen
            </Link>
            <Link
              href="/account"
              className="text-[28px] font-semibold leading-tight"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Konto Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavbarClient;
