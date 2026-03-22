'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const FloatingContactButton = dynamic(() => import('@/components/FloatingContactButton'), {
  ssr: false,
});

export default function GlobalChromeClient() {
  const pathname = usePathname();

  if (pathname === '/driver/confirm') {
    return null;
  }

  return <FloatingContactButton />;
}
