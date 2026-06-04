'use client';

import { usePathname } from 'next/navigation';
import FloatingContactButton from '@/components/FloatingContactButton';

export default function GlobalChromeClient({ surface }: { surface: 'www' | 'app' | 'dispatch' }) {
  const pathname = usePathname();
  const isLegalPage = pathname === '/agb' || pathname === '/datenschutz' || pathname === '/impressum';

  if (
    surface !== 'www' ||
    isLegalPage ||
    pathname === '/driver/confirm' ||
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password'
  ) {
    return null;
  }

  return <FloatingContactButton />;
}
