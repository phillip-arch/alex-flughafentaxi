'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function FooterGate({ surface }: { surface: 'www' | 'app' | 'dispatch' }) {
  const pathname = usePathname();
  if (
    surface !== 'www' ||
    pathname?.startsWith('/dispatch') ||
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password' ||
    pathname === '/driver/confirm'
  ) {
    return null;
  }
  return <Footer />;
}
