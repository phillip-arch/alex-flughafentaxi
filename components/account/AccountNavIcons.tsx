'use client';

import {
  ClipboardDocumentListIcon as ClipboardDocumentListOutlineIcon,
  HomeIcon as HomeOutlineIcon,
  UserCircleIcon as UserCircleOutlineIcon,
} from '@heroicons/react/24/outline';
import {
  ClipboardDocumentListIcon as ClipboardDocumentListSolidIcon,
  HomeIcon as HomeSolidIcon,
  UserCircleIcon as UserCircleSolidIcon,
} from '@heroicons/react/24/solid';
import type { ComponentType } from 'react';

export type AccountNavIconProps = {
  className?: string;
  active?: boolean;
};

type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const navIcons: Record<'start' | 'fahrten' | 'profil', { outline: IconComponent; solid: IconComponent }> = {
  start: { outline: HomeOutlineIcon, solid: HomeSolidIcon },
  fahrten: { outline: ClipboardDocumentListOutlineIcon, solid: ClipboardDocumentListSolidIcon },
  profil: { outline: UserCircleOutlineIcon, solid: UserCircleSolidIcon },
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
  return <Icon className={className} aria-hidden />;
}
