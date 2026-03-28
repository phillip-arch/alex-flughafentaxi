'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { History, House, User } from 'lucide-react';

type MobileNavItem = 'start' | 'fahrten' | 'profil';

export default function AccountMobileBottomNav({ active }: { active?: MobileNavItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items: Array<{
    id: MobileNavItem;
    label: string;
    href: string;
    icon: typeof House;
  }> = [
    { id: 'start', label: 'Start', href: '/account?tab=start', icon: House },
    { id: 'fahrten', label: 'Fahrten', href: '/account?tab=buchungsverlauf', icon: History },
    { id: 'profil', label: 'Profil', href: '/account?tab=profil', icon: User },
  ];

  return (
    <nav
      aria-label="App Navigation"
      className="fixed inset-x-0 bottom-4 z-[90] px-3 [padding-bottom:calc(env(safe-area-inset-bottom,0px))] md:hidden"
    >
      <div className="mx-auto max-w-[25rem] rounded-[1.45rem] border border-[#dbe7f8] bg-white/95 p-2 shadow-[0_20px_40px_rgba(17,17,17,0.12)] backdrop-blur">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const itemUrl = new URL(item.href, 'https://app.local');
            const currentTab = searchParams.get('tab') || '';
            const targetTab = itemUrl.searchParams.get('tab') || '';
            const isCurrentHref =
              itemUrl.pathname === '/book'
                ? pathname === '/book'
                : pathname === itemUrl.pathname && currentTab === targetTab;
            const isActive = isCurrentHref || item.id === active;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                prefetch
                className={`flex min-h-[3.65rem] flex-col items-center justify-center gap-1 rounded-[1.1rem] border text-[0.82rem] font-medium tracking-[-0.02em] transition-colors ${
                  isActive
                    ? 'border-[#dbe7f8] bg-[#f8fbff] text-[#1679ff]'
                    : 'border-transparent bg-transparent text-[#6a7d96] hover:bg-[#f8fbff] hover:text-[#1679ff]'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
