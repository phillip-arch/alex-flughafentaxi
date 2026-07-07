'use client';

import { useRef, useState } from 'react';
import { Briefcase, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { districtPricingRows, getDistrictPrice } from '@/lib/pricing/districtPricing';

const vehicleColumns = [
  {
    key: 'limo' as const,
    label: 'Sedan',
    shortLabel: 'Sedan',
    specs: [
      { icon: Users, value: '2' },
      { icon: Briefcase, value: '2' },
    ],
  },
  {
    key: 'kombi' as const,
    label: 'Station Wagon',
    shortLabel: 'Wagon',
    specs: [
      { icon: Users, value: '4' },
      { icon: Briefcase, value: '4' },
    ],
  },
  {
    key: 'van' as const,
    label: 'Minivan',
    shortLabel: 'Minivan',
    specs: [
      { icon: Users, value: '8' },
      { icon: Briefcase, value: '8' },
    ],
  },
];

const DISTRICT_GROUPS = [
  { label: '1010–1070', rows: districtPricingRows.slice(0, 7) },
  { label: '1080–1150', rows: districtPricingRows.slice(7, 15) },
  { label: '1160–1230', rows: districtPricingRows.slice(15) },
];


type DistrictPriceTableProps = {
  activeId?: string | null;
  onActiveIdChange?: (id: string | null) => void;
};

export default function DistrictPriceTable({
  activeId = null,
  onActiveIdChange,
}: DistrictPriceTableProps) {
  const [page, setPage] = useState(0);
  const touchStartX = useRef(0);


  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setPage((p) => Math.min(DISTRICT_GROUPS.length - 1, p + 1));
      else setPage((p) => Math.max(0, p - 1));
    }
  };

  return (
    <div className="mt-4 flex flex-col overflow-hidden rounded-[0.9rem] border border-[var(--line)] bg-[var(--panel)] shadow-[0_10px_24px_rgba(0,0,0,0.18)] md:mt-0 lg:flex-1">
      {/* Header — fixed, always visible */}
      <table aria-hidden="true" className="w-full shrink-0 table-fixed border-collapse text-left">
        <colgroup>
          <col style={{ width: '34%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '22%' }} />
        </colgroup>
        <thead className="bg-[var(--night)] text-[var(--paper)] md:bg-[var(--panel-2)] md:text-inherit">
          <tr className="border-b border-[var(--line)]">
            <th scope="col" className="px-2 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--paper)] md:px-6 md:py-4 md:text-[0.9rem] md:normal-case md:tracking-[-0.02em] md:text-[var(--muted)] lg:py-2.5">
              District / ZIP
            </th>
            {vehicleColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="border-l border-[var(--line)] px-1 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--paper)] md:border-l-0 md:px-5 md:py-4 md:text-[0.9rem] md:normal-case md:tracking-[-0.02em] md:text-[var(--muted)] lg:py-2.5"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="md:hidden">{column.shortLabel}</span>
                  <span className="hidden whitespace-nowrap md:inline md:text-[13.4px]">{column.label}</span>
                  <div className="hidden items-center justify-center gap-2 md:flex">
                    {column.specs.map(({ icon: Icon, value }, index) => (
                      <span
                        key={`${column.key}-${index}`}
                        className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-[var(--paper)]"
                      >
                        <Icon size={14} className="text-[var(--amber)]" />
                        <span>{value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
      </table>

      {/* Sliding rows */}
      <div
        className="overflow-hidden lg:flex-1"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {DISTRICT_GROUPS.map((group, gi) => (
            <table
              key={gi}
              className="h-full w-full min-w-full shrink-0 table-fixed border-collapse text-left"
            >
              <colgroup>
                <col style={{ width: '34%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <thead className="sr-only">
                <tr>
                  <th scope="col">District / ZIP</th>
                  {vehicleColumns.map((column) => (
                    <th key={column.key} scope="col">{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rows.map((district) => {
                  const isActive = district.id === activeId;
                  return (
                    <tr
                      key={district.id}
                      onMouseEnter={() => onActiveIdChange?.(district.id)}
                      onMouseLeave={() => onActiveIdChange?.(null)}
                      onClick={() => onActiveIdChange?.(district.id)}
                      className={`border-t border-[var(--line)] transition-colors ${isActive ? 'bg-[rgba(255,182,41,.12)]' : 'hover:bg-[rgba(255,255,255,.055)]'}`}
                    >
                      <td className="px-2 py-2 pl-3 md:px-6 md:py-3.5 lg:py-1.5">
                        <div
                          className={`text-[0.9rem] font-bold leading-tight tracking-[-0.03em] md:text-[0.98rem] ${isActive ? 'text-[var(--amber)]' : 'text-[var(--paper)]'}`}
                        >
                          {district.id}
                        </div>
                        <div className="truncate text-[0.62rem] uppercase leading-tight text-[var(--muted)] md:mt-0.5 md:text-[0.78rem] md:normal-case md:tracking-[-0.01em]">
                          {district.name}
                        </div>
                      </td>
                      {vehicleColumns.map((column) => (
                        <td
                          key={`${district.id}-${column.key}`}
                          className={`border-l border-[var(--line)] px-1 py-2 text-center text-[0.82rem] font-semibold md:px-5 md:py-3.5 md:text-[0.98rem] lg:py-1.5 ${isActive ? 'text-[var(--amber)]' : 'text-[var(--paper)]'}`}
                        >
                          {getDistrictPrice(district.group, column.key)}€
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {gi === 0 && (
                  <tr className="border-t border-[var(--line)] md:hidden">
                    <td colSpan={4} className="px-2 py-2 pl-3 text-center">
                      <div className="text-[0.9rem] font-bold leading-tight tracking-[-0.03em] text-[var(--muted)]">
                        Swipe left
                      </div>
                      <div className="text-[0.62rem] uppercase leading-tight text-[var(--muted)]">
                        to see more
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--line)] px-3 py-2.5 md:px-5 md:py-3 lg:py-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,.045)] text-[var(--amber)] transition-colors hover:bg-[rgba(255,182,41,.12)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)]"
          aria-label="Previous group"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(DISTRICT_GROUPS.length - 1, p + 1))}
          disabled={page === DISTRICT_GROUPS.length - 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,.045)] text-[var(--amber)] transition-colors hover:bg-[rgba(255,182,41,.12)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)]"
          aria-label="Next group"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
