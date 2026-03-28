'use client';

import type { ReactElement } from 'react';

export type AccountNavIconProps = {
  className?: string;
  active?: boolean;
};

type IconComponent = (props: AccountNavIconProps) => ReactElement;

function StartOutlineIcon({ className }: AccountNavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m3.75 10.5 7.557-6.718a1.05 1.05 0 0 1 1.386 0L20.25 10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.625 8.836V18.75A1.875 1.875 0 0 0 7.5 20.625h9A1.875 1.875 0 0 0 18.375 18.75V8.836"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.125 20.625V15.75A1.125 1.125 0 0 1 11.25 14.625h1.5a1.125 1.125 0 0 1 1.125 1.125v4.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StartSolidIcon({ className }: AccountNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.274 3.39a1.125 1.125 0 0 1 1.452 0l8.25 7.153a.75.75 0 0 1-.492 1.307h-1.359v6.9a1.875 1.875 0 0 1-1.875 1.875H6.75A1.875 1.875 0 0 1 4.875 18.75v-6.9H3.516a.75.75 0 0 1-.492-1.307l8.25-7.153Z" />
      <path fill="#FFFFFF" d="M10.5 15.562A1.312 1.312 0 0 1 11.812 14.25h.376A1.312 1.312 0 0 1 13.5 15.562v5.063h-3v-5.063Z" />
    </svg>
  );
}

function TripsOutlineIcon({ className }: AccountNavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 3.75v1.875M16.5 3.75v1.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.875 7.5h14.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4.125"
        y="4.875"
        width="15.75"
        height="15"
        rx="2.25"
        ry="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5v3.375l2.25 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TripsSolidIcon({ className }: AccountNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7.125 2.625a.75.75 0 0 1 .75.75v1.125h8.25V3.375a.75.75 0 0 1 1.5 0v1.208a2.625 2.625 0 0 1 2.25 2.604v10.688a2.625 2.625 0 0 1-2.625 2.625H6.75a2.625 2.625 0 0 1-2.625-2.625V7.188a2.625 2.625 0 0 1 2.25-2.604V3.375a.75.75 0 0 1 .75-.75Z" />
      <path fill="#FFFFFF" d="M11.25 10.688a.75.75 0 0 1 1.5 0v2.798l1.807 1.205a.75.75 0 1 1-.832 1.248l-2.141-1.428a.75.75 0 0 1-.334-.624v-3.2Z" />
      <path fill="#FFFFFF" d="M4.125 8.25h15.75v1.5H4.125z" opacity=".28" />
    </svg>
  );
}

function ProfileOutlineIcon({ className }: AccountNavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8.25" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6.375 18.375a6.375 6.375 0 0 1 11.25 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileSolidIcon({ className }: AccountNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Z" />
      <path fill="#FFFFFF" d="M12 6.188a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
      <path fill="#FFFFFF" d="M12 14.25c-2.331 0-4.342 1.174-5.573 2.93a8.25 8.25 0 0 0 11.146 0C16.342 15.424 14.331 14.25 12 14.25Z" />
    </svg>
  );
}

const navIcons: Record<'start' | 'fahrten' | 'profil', { outline: IconComponent; solid: IconComponent }> = {
  start: { outline: StartOutlineIcon, solid: StartSolidIcon },
  fahrten: { outline: TripsOutlineIcon, solid: TripsSolidIcon },
  profil: { outline: ProfileOutlineIcon, solid: ProfileSolidIcon },
};

export function AccountNavIcon({
  item,
  active = false,
  className,
}: {
  item: 'start' | 'fahrten' | 'profil';
  active?: boolean;
  className?: string;
}) {
  const Icon = active ? navIcons[item].solid : navIcons[item].outline;
  return <Icon className={className} active={active} />;
}
