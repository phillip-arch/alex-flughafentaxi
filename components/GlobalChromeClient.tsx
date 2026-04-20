'use client';

import { usePathname } from 'next/navigation';
import FloatingContactButton from '@/components/FloatingContactButton';

export default function GlobalChromeClient({ surface }: { surface: 'www' | 'app' | 'dispatch' }) {
  const pathname = usePathname();

  if (
    surface !== 'www' ||
    pathname === '/driver/confirm' ||
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password'
  ) {
    return null;
  }

  return <FloatingContactButton />;
}
