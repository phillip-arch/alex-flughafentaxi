'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactElement } from 'react';

type MobileNavItem = 'start' | 'fahrten' | 'profil';

type NavIconProps = {
  className?: string;
};

type NavIconComponent = (props: NavIconProps) => ReactElement;

function StartIconOutline({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V19.5A2.25 2.25 0 0 0 6.75 21.75h10.5A2.25 2.25 0 0 0 19.5 19.5V9.75M9 21.75v-6a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StartIconSolid({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.25 8.25a.75.75 0 0 1-.53 1.28h-.75v6.38A2.25 2.25 0 0 1 17.25 22H6.75A2.25 2.25 0 0 1 4.5 19.75v-6.38h-.75a.75.75 0 0 1-.53-1.28l8.25-8.25Z" />
    </svg>
  );
}

function TripsIconOutline({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 4.5h13.5A1.5 1.5 0 0 1 20.25 6v12.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11.25v3.75l2.25 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TripsIconSolid({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3a.75.75 0 0 1 1.5 0v1.59A2.25 2.25 0 0 1 20.25 6.75v12A2.25 2.25 0 0 1 18 21H6A2.25 2.25 0 0 1 3.75 18.75v-12A2.25 2.25 0 0 1 6 4.59V3a.75.75 0 0 1 .75-.75ZM12 10.5a.75.75 0 0 1 .75.75v3.349l1.72 1.147a.75.75 0 1 1-.832 1.248l-2.055-1.37a.75.75 0 0 1-.333-.624V11.25A.75.75 0 0 1 12 10.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ProfileIconOutline({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIconSolid({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm9.75-4.125a3.375 3.375 0 1 0 0 6.75 3.375 3.375 0 0 0 0-6.75Zm-2.847 8.884A5.25 5.25 0 0 1 12 15.75a5.25 5.25 0 0 1 2.847 1.009 7.5 7.5 0 1 1-5.694 0Z" clipRule="evenodd" />
    </svg>
  );
}

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
    outlineIcon: NavIconComponent;
    solidIcon: NavIconComponent;
  }> = [
    { id: 'start', label: 'Start', href: '/account?tab=start', outlineIcon: StartIconOutline, solidIcon: StartIconSolid },
    { id: 'fahrten', label: 'Fahrten', href: '/account?tab=buchungsverlauf', outlineIcon: TripsIconOutline, solidIcon: TripsIconSolid },
    { id: 'profil', label: 'Profil', href: '/account?tab=profil', outlineIcon: ProfileIconOutline, solidIcon: ProfileIconSolid },
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
            : 'w-full border-t border-[#dbe7f8] bg-white/98 px-4 pt-2 shadow-[0_-10px_30px_rgba(17,17,17,0.08)] backdrop-blur [padding-bottom:calc(env(safe-area-inset-bottom,0px)+12px)]'
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
            const Icon = isActive ? item.solidIcon : item.outlineIcon;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                prefetch
                className={`flex min-h-[3.65rem] flex-col items-center justify-center gap-1 rounded-[1.1rem] text-[0.82rem] tracking-[-0.02em] outline-none transition-colors ${
                  placement === 'inline'
                    ? `${
                        isActive
                          ? 'border border-[#dbe7f8] bg-[#f8fbff] font-medium text-[#1679ff]'
                          : 'border border-transparent bg-transparent font-medium text-[#6a7d96] hover:bg-[#f8fbff] hover:text-[#1679ff]'
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbe7f8] focus-visible:ring-offset-0 active:bg-transparent`
                    : `${
                        isActive
                          ? 'border border-transparent bg-transparent font-semibold text-[#111111]'
                          : 'border border-transparent bg-transparent font-medium text-[#6a6a6a]'
                      } focus:outline-none focus-visible:ring-0 active:bg-transparent`
                }`}
              >
                <Icon className={placement === 'bottom' ? 'h-9 w-9' : 'h-[18px] w-[18px]'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
