'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { AccountNavIcon } from '@/components/account/AccountNavIcons';

type MobileNavItem = 'start' | 'fahrten' | 'profil';

export default function AccountMobileBottomNav({
  active,
  placement = 'bottom',
}: {
  active?: MobileNavItem;
  placement?: 'bottom' | 'inline';
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items: Array<{
    id: MobileNavItem;
    label: string;
    href: string;
  }> = [
    { id: 'start', label: 'Start', href: '/account?tab=start' },
    { id: 'fahrten', label: 'Fahrten', href: '/account?tab=buchungsverlauf' },
    { id: 'profil', label: 'Profil', href: '/account?tab=profil' },
  ];

  return (
    <nav
      aria-label="App Navigation"
      className={
        placement === 'inline'
          ? 'hidden md:block'
          : 'fixed inset-x-0 bottom-0 z-[90] md:hidden'
      }
    >
      <div
        className={
          placement === 'inline'
            ? 'rounded-[1.45rem] border border-[#dbe7f8] bg-white p-2 shadow-[0_10px_24px_rgba(17,17,17,0.06)]'
            : 'w-full border-t border-[#dbe7f8] bg-white/98 px-4 pt-1.5 shadow-[0_-10px_30px_rgba(17,17,17,0.08)] backdrop-blur [padding-bottom:calc(env(safe-area-inset-bottom,0px)+10px)]'
        }
      >
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => {
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
                className={`flex min-h-[2.9rem] flex-col items-center justify-center gap-0.5 rounded-[1.1rem] border text-[0.82rem] tracking-[-0.02em] outline-none transition-[color,background-color,border-color,opacity] ${
                  isActive
                    ? 'border-[#dbe7f8] bg-[#f8fbff] font-medium text-[#1679ff]'
                    : 'border-transparent bg-transparent font-medium text-[#6a7d96] opacity-60 hover:bg-[#f8fbff] hover:text-[#1679ff] hover:opacity-100'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbe7f8] focus-visible:ring-offset-0 active:bg-transparent`}
              >
                <AccountNavIcon
                  item={item.id}
                  active={isActive}
                  className="h-[21px] w-[21px]"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
