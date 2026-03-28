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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path d="M3.75 10.5 12 3.75l8.25 6.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.75 9.75v8.25a1.5 1.5 0 0 0 1.5 1.5h2.25v-5.25c0-.414.336-.75.75-.75h1.5c.414 0 .75.336.75.75v5.25h2.25a1.5 1.5 0 0 0 1.5-1.5V9.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StartIconSolid({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.49 3.63a.75.75 0 0 1 .95 0l8.25 6.75a.75.75 0 0 1-.48 1.32h-.96v6.3a1.5 1.5 0 0 1-1.5 1.5h-2.64a.75.75 0 0 1-.75-.75v-4.86a.39.39 0 0 0-.39-.39h-1.92a.39.39 0 0 0-.39.39v4.86a.75.75 0 0 1-.75.75H6.24a1.5 1.5 0 0 1-1.5-1.5v-6.3h-.96a.75.75 0 0 1-.48-1.32l8.19-6.75Z" />
    </svg>
  );
}

function TripsIconOutline({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <rect x="4.5" y="5.25" width="15" height="14.25" rx="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.25 3.75v3M15.75 3.75v3M4.5 9.75h8.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15.75" cy="14.25" r="3.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m15.75 12.75.001 1.75 1.249.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TripsIconSolid({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8.25 3a.75.75 0 0 1 .75.75V5.25h6V3.75a.75.75 0 0 1 1.5 0V5.3A3 3 0 0 1 19.5 8.25v1.27a5.2 5.2 0 0 0-3.75-1.52 5.25 5.25 0 1 0 0 10.5c1.46 0 2.78-.6 3.73-1.56A3 3 0 0 1 16.5 19.5h-9A3 3 0 0 1 4.5 16.5v-8.25A3 3 0 0 1 7.5 5.3V3.75A.75.75 0 0 1 8.25 3Z" />
      <path d="M15.75 10.5a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 1.5a.75.75 0 0 0-.75.75v1.89c0 .26.135.5.357.637l1.5.93a.75.75 0 1 0 .786-1.278l-1.143-.708V12.75a.75.75 0 0 0-.75-.75Z" />
    </svg>
  );
}

function ProfileIconOutline({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <circle cx="12" cy="8.25" r="3.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 19.5a6.75 6.75 0 0 1 13.5 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIconSolid({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 4.5a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Z" />
      <path d="M12 13.5c-3.63 0-6.75 2.427-6.75 5.25 0 .414.336.75.75.75h12a.75.75 0 0 0 .75-.75c0-2.823-3.12-5.25-6.75-5.25Z" />
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
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
