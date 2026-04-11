'use client';

import Image from 'next/image';
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
    { id: 'start', label: 'Home', href: '/account?tab=start' },
    { id: 'fahrten', label: 'Rides', href: '/account?tab=buchungsverlauf' },
    { id: 'profil', label: 'Profile', href: '/account?tab=profil' },
  ];

  return (
    <nav
      aria-label="App Navigation"
      className={
        placement === 'inline'
          ? 'hidden md:block md:w-full'
          : 'fixed inset-x-0 bottom-0 z-[90] md:hidden'
      }
    >
      <div
        className={
          placement === 'inline'
            ? 'w-full bg-transparent p-0 shadow-none'
            : 'w-full border-t border-[#dbe7f8] bg-white/98 px-4 pt-1.5 shadow-[0_-10px_30px_rgba(17,17,17,0.08)] backdrop-blur [padding-bottom:calc(env(safe-area-inset-bottom,0px)+10px)]'
        }
      >
        <div className={placement === 'inline' ? 'flex w-full items-center justify-between gap-8' : 'w-full'}>
          {placement === 'inline' ? (
            <Link href="/account?tab=start" aria-label="Alex Flughafentaxi Home" className="shrink-0">
              <Image
                src="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/applogo.jpg"
                alt="Alex Flughafentaxi"
                width={92}
                height={92}
                className="h-[39px] w-auto object-contain"
                priority
              />
            </Link>
          ) : null}
          <div className={placement === 'inline' ? 'ml-auto grid w-full max-w-[26rem] grid-cols-3 gap-3' : 'grid grid-cols-3 gap-3'}>
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
                className={`flex ${placement === 'bottom' ? 'min-h-[2.9rem] gap-0.5' : 'min-h-[3.65rem] gap-1'} flex-col items-center justify-center rounded-[1.1rem] text-[0.82rem] tracking-[-0.02em] outline-none transition-colors ${
                  placement === 'inline'
                    ? `${
                        isActive
                          ? 'border border-transparent bg-transparent font-medium text-[#1679ff]'
                          : 'border border-transparent bg-transparent font-medium text-[#8090a5] opacity-80 hover:text-[#1679ff] hover:opacity-100'
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbe7f8] focus-visible:ring-offset-0 active:bg-transparent`
                    : `${
                        isActive
                          ? 'border border-transparent bg-transparent font-semibold text-[#111111]'
                          : 'border border-transparent bg-transparent font-medium text-[#7c7c7c] opacity-80'
                      } focus:outline-none focus-visible:ring-0 active:bg-transparent`
                }`}
              >
                <AccountNavIcon
                  item={item.id}
                  active={isActive}
                  className={placement === 'bottom' ? 'h-[21px] w-[21px]' : 'h-[18px] w-[18px]'}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
          </div>
        </div>
      </div>
    </nav>
  );
}
