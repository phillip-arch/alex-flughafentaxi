'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function FooterGate() {
  const pathname = usePathname();
  if (
    pathname?.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password' ||
    pathname === '/driver/confirm'
  ) {
    return null;
  }
  return <Footer />;
}
