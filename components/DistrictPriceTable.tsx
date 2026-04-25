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
    <div className="mt-4 flex flex-col overflow-hidden rounded-[0.9rem] border border-[#e7edf5] bg-white shadow-[0_10px_24px_rgba(17,17,17,0.035)] md:mt-0 lg:flex-1">
      {/* Header — fixed, always visible */}
      <table className="w-full shrink-0 table-fixed border-collapse text-left">
        <colgroup>
          <col style={{ width: '34%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '22%' }} />
        </colgroup>
        <thead className="bg-[#111111] text-white md:bg-[#f8fbff] md:text-inherit">
          <tr className="border-b border-[#e7edf5]">
            <th className="px-2 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white md:px-6 md:py-4 md:text-[0.9rem] md:normal-case md:tracking-[-0.02em] md:text-[#5f6975] lg:py-2.5">
              District / ZIP
            </th>
            {vehicleColumns.map((column) => (
              <th
                key={column.key}
                className="border-l border-white/10 px-1 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white md:border-l-0 md:px-5 md:py-4 md:text-[0.9rem] md:normal-case md:tracking-[-0.02em] md:text-[#5f6975] lg:py-2.5"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="md:hidden">{column.shortLabel}</span>
                  <span className="hidden whitespace-nowrap md:inline md:text-[13.4px]">{column.label}</span>
                  <div className="hidden items-center justify-center gap-2 md:flex">
                    {column.specs.map(({ icon: Icon, value }, index) => (
                      <span
                        key={`${column.key}-${index}`}
                        className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-[#111827]"
                      >
                        <Icon size={14} className="text-[#1679FF]" />
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
              <tbody>
                {group.rows.map((district) => {
                  const isActive = district.id === activeId;
                  return (
                    <tr
                      key={district.id}
                      onMouseEnter={() => onActiveIdChange?.(district.id)}
                      onMouseLeave={() => onActiveIdChange?.(null)}
                      onClick={() => onActiveIdChange?.(district.id)}
                      className={`border-t border-[#eef2f7] transition-colors ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-[#f8fbff]'}`}
                    >
                      <td className="px-2 py-2 pl-3 md:px-6 md:py-3.5 lg:py-1.5">
                        <div
                          className={`text-[0.9rem] font-bold leading-tight tracking-[-0.03em] md:text-[0.98rem] ${isActive ? 'text-[#1679FF]' : 'text-[#111827]'}`}
                        >
                          {district.id}
                        </div>
                        <div className="truncate text-[0.62rem] uppercase leading-tight text-[#6b7280] md:mt-0.5 md:text-[0.78rem] md:normal-case md:tracking-[-0.01em]">
                          {district.name}
                        </div>
                      </td>
                      {vehicleColumns.map((column) => (
                        <td
                          key={`${district.id}-${column.key}`}
                          className={`border-l border-[#eef2f7] px-1 py-2 text-center text-[0.82rem] font-semibold md:px-5 md:py-3.5 md:text-[0.98rem] lg:py-1.5 ${isActive ? 'text-[#1679FF]' : 'text-[#111827]'}`}
                        >
                          {getDistrictPrice(district.group, column.key)}€
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#eef2f7] px-3 py-2.5 md:px-5 md:py-3 lg:py-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#1679FF] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:text-[#c3cad5]"
          aria-label="Previous group"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(DISTRICT_GROUPS.length - 1, p + 1))}
          disabled={page === DISTRICT_GROUPS.length - 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe7f8] bg-white text-[#1679FF] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:text-[#c3cad5]"
          aria-label="Next group"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
