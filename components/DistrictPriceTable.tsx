'use client';

import { Briefcase, ShoppingBag, Users } from 'lucide-react';
import { districtPricingRows, getDistrictPrice } from '@/lib/pricing/districtPricing';

const vehicleColumns = [
  {
    key: 'limo',
    label: 'Limousine',
    shortLabel: 'Limo',
    specs: [
      { icon: Users, value: '2' },
      { icon: Briefcase, value: '2' },
      { icon: ShoppingBag, value: '2' },
    ],
  },
  {
    key: 'kombi',
    label: 'Kombi',
    shortLabel: 'Kombi',
    specs: [
      { icon: Users, value: '4' },
      { icon: Briefcase, value: '4' },
      { icon: ShoppingBag, value: '4' },
    ],
  },
  {
    key: 'van',
    label: 'Minivan',
    shortLabel: 'Van',
    specs: [
      { icon: Users, value: '8' },
      { icon: Briefcase, value: '8' },
      { icon: ShoppingBag, value: '8' },
    ],
  },
] as const;

type DistrictPriceTableProps = {
  activeId?: string | null;
  onActiveIdChange?: (id: string | null) => void;
};

export default function DistrictPriceTable({
  activeId = null,
  onActiveIdChange,
}: DistrictPriceTableProps) {
  return (
    <>
      <div className="mt-4 overflow-hidden rounded-[0.9rem] border border-[#e7edf5] bg-white shadow-[0_10px_24px_rgba(17,17,17,0.035)] md:mt-0">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-[#111111] text-white md:bg-[#f8fbff] md:text-inherit">
            <tr className="border-b border-[#e7edf5]">
              <th className="w-[34%] px-2 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white md:w-auto md:px-6 md:py-4 md:text-[0.9rem] md:normal-case md:tracking-[-0.02em] md:text-[#5f6975]">
                Bezirk / PLZ
              </th>
              {vehicleColumns.map((column) => (
                <th
                  key={column.key}
                  className="w-[22%] border-l border-white/10 px-1 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white md:w-auto md:border-l-0 md:px-5 md:py-4 md:text-[0.9rem] md:normal-case md:tracking-[-0.02em] md:text-[#5f6975]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="md:hidden">{column.shortLabel}</span>
                    <span className="hidden md:inline">{column.label}</span>
                    <div className="hidden items-center justify-center gap-2 text-[#5f6975] md:flex">
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
          <tbody>
            {districtPricingRows.map((district) => {
              const isActive = district.id === activeId;

              return (
                <tr
                  key={district.id}
                  onMouseEnter={() => onActiveIdChange?.(district.id)}
                  onMouseLeave={() => onActiveIdChange?.(null)}
                  onClick={() => onActiveIdChange?.(district.id)}
                  className={`border-t border-[#eef2f7] transition-colors ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-[#f8fbff]'}`}
                >
                  <td className="px-2 py-2 pl-3 md:px-6 md:py-3.5">
                    <div className={`text-[0.9rem] font-bold leading-tight tracking-[-0.03em] md:text-[0.98rem] ${isActive ? 'text-[#1679FF]' : 'text-[#111827]'}`}>
                      {district.id}
                    </div>
                    <div className="truncate text-[0.62rem] uppercase leading-tight text-[#6b7280] md:mt-0.5 md:text-[0.78rem] md:normal-case md:tracking-[-0.01em]">
                      {district.name}
                    </div>
                  </td>
                  {vehicleColumns.map((column) => (
                    <td
                      key={`${district.id}-${column.key}`}
                      className={`border-l border-[#eef2f7] px-1 py-2 text-center text-[0.82rem] font-semibold md:px-5 md:py-3.5 md:text-[0.98rem] ${isActive ? 'text-[#1679FF]' : 'text-[#111827]'}`}
                    >
                      {getDistrictPrice(district.group, column.key)}€
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
