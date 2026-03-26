'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const FloatingContactButton = dynamic(() => import('@/components/FloatingContactButton'), {
  ssr: false,
});

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
