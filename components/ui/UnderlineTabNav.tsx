'use client';

import type { ReactNode } from 'react';
import {
  TAB_UNDERLINE_ACTIVE_CLASS,
  TAB_UNDERLINE_BASE_CLASS,
  TAB_UNDERLINE_INACTIVE_CLASS,
} from './sharedStyles';

export type UnderlineTabItem<T extends string> = {
  id: T;
  label: string;
  icon?: ReactNode;
};

type UnderlineTabNavProps<T extends string> = {
  items: UnderlineTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
};

export default function UnderlineTabNav<T extends string>({
  items,
  activeTab,
  onChange,
  className = '',
}: UnderlineTabNavProps<T>) {
  return (
    <div className={className}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`${TAB_UNDERLINE_BASE_CLASS} ${
            activeTab === item.id ? TAB_UNDERLINE_ACTIVE_CLASS : TAB_UNDERLINE_INACTIVE_CLASS
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
