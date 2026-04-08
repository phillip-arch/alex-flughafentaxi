import { Briefcase, ShoppingBag, Users } from 'lucide-react';

const districts = [
  { id: '1010', name: 'Innere Stadt', group: 1 },
  { id: '1020', name: 'Leopoldstadt', group: 1 },
  { id: '1030', name: 'Landstrasse', group: 1 },
  { id: '1040', name: 'Wieden', group: 1 },
  { id: '1050', name: 'Margareten', group: 1 },
  { id: '1060', name: 'Mariahilf', group: 1 },
  { id: '1070', name: 'Neubau', group: 1 },
  { id: '1080', name: 'Josefstadt', group: 1 },
  { id: '1090', name: 'Alsergrund', group: 1 },
  { id: '1100', name: 'Favoriten', group: 1 },
  { id: '1110', name: 'Simmering', group: 11 },
  { id: '1120', name: 'Meidling', group: 12 },
  { id: '1130', name: 'Hietzing', group: 12 },
  { id: '1140', name: 'Penzing', group: 12 },
  { id: '1150', name: 'Rudolfsheim', group: 12 },
  { id: '1160', name: 'Ottakring', group: 12 },
  { id: '1170', name: 'Hernals', group: 12 },
  { id: '1180', name: 'Waehring', group: 12 },
  { id: '1190', name: 'Doebling', group: 12 },
  { id: '1200', name: 'Brigittenau', group: 12 },
  { id: '1210', name: 'Floridsdorf', group: 12 },
  { id: '1220', name: 'Donaustadt', group: 12 },
  { id: '1230', name: 'Liesing', group: 12 },
] as const;

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

const getPrice = (group: number, type: 'limo' | 'kombi' | 'van') => {
  if (group === 11) return type === 'limo' ? '30' : type === 'kombi' ? '35' : '50';
  if (group === 1) return type === 'limo' ? '33' : type === 'kombi' ? '38' : '53';
  return type === 'limo' ? '35' : type === 'kombi' ? '40' : '55';
};

export default function PriceTable() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className="app-container">
        <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
          <div className="mx-auto max-w-[48rem] text-center">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
              Bezirke
            </p>
            <h2 className="mt-3 text-[2rem] font-black tracking-[-0.05em] text-[#111111] md:text-[2.45rem]">
              Fixpreis-Uebersicht fuer alle Wiener Bezirke
            </h2>
            <p className="mt-4 text-[1rem] leading-[1.75] text-[#5f6975]">
              Alle Preise inkl. MwSt. zum oder vom Flughafen Wien.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:hidden">
            {vehicleColumns.map((column) => (
              <div
                key={`legend-${column.key}`}
              className="flex items-center justify-between rounded-[1rem] border border-[#e7edf5] bg-[#f8fbff] px-4 py-3"
              >
                <span className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-[#1679FF]">
                  {column.shortLabel}
                </span>
                <div className="flex items-center gap-3">
                  {column.specs.map(({ icon: Icon, value }, index) => (
                    <span
                      key={`legend-${column.key}-${index}`}
                      className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[#111827]"
                    >
                      <Icon size={13} className="text-[#1679FF]" />
                      <span>{value}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-[0.9rem] border border-[#e7edf5] bg-white shadow-[0_10px_24px_rgba(17,17,17,0.035)]">
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
                {districts.map((district) => (
                  <tr
                    key={district.id}
                    className="border-t border-[#eef2f7] transition-colors hover:bg-[#f8fbff]"
                  >
                    <td className="px-2 py-2 pl-3 md:px-6 md:py-3.5">
                      <div className="font-bold leading-tight tracking-[-0.03em] text-[#111827] text-[0.9rem] md:text-[0.98rem]">
                        {district.id}
                      </div>
                      <div className="truncate text-[0.62rem] uppercase leading-tight text-[#6b7280] md:mt-0.5 md:text-[0.78rem] md:normal-case md:tracking-[-0.01em]">
                        {district.name}
                      </div>
                    </td>
                    <td className="border-l border-[#eef2f7] px-1 py-2 text-center text-[0.82rem] font-semibold text-[#111827] md:px-5 md:py-3.5 md:text-[0.98rem]">
                      {getPrice(district.group, 'limo')}€
                    </td>
                    <td className="border-l border-[#eef2f7] px-1 py-2 text-center text-[0.82rem] font-semibold text-[#111827] md:px-5 md:py-3.5 md:text-[0.98rem]">
                      {getPrice(district.group, 'kombi')}€
                    </td>
                    <td className="border-l border-[#eef2f7] px-1 py-2 text-center text-[0.82rem] font-semibold text-[#111827] md:px-5 md:py-3.5 md:text-[0.98rem]">
                      {getPrice(district.group, 'van')}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
