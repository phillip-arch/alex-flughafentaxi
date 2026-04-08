'use client';

import Image from 'next/image';
import { useState } from 'react';

type VehicleType = 'limo' | 'kombi' | 'van';

type District = {
  id: string;
  name: string;
  group: number;
  x: number;
  y: number;
};

const MAP_WIDTH = 1669;
const MAP_HEIGHT = 1312;

const districts: District[] = [
  { id: '1010', name: 'Innere Stadt', group: 1, x: 786.8435, y: 749.1885 },
  { id: '1020', name: 'Leopoldstadt', group: 1, x: 936.8704, y: 731.0713 },
  { id: '1030', name: 'Landstrasse', group: 1, x: 884.2073, y: 842.0479 },
  { id: '1040', name: 'Wieden', group: 1, x: 780.3987, y: 835.9863 },
  { id: '1050', name: 'Margareten', group: 1, x: 732.0002, y: 873.9238 },
  { id: '1060', name: 'Mariahilf', group: 1, x: 685.4026, y: 833.9863 },
  { id: '1070', name: 'Neubau', group: 1, x: 678.6409, y: 788.0039 },
  { id: '1080', name: 'Josefstadt', group: 1, x: 701.4026, y: 727.377 },
  { id: '1090', name: 'Alsergrund', group: 1, x: 725.9792, y: 645.9873 },
  { id: '1100', name: 'Favoriten', group: 1, x: 815.2869, y: 1024.2412 },
  { id: '1110', name: 'Simmering', group: 11, x: 1058.4534, y: 1020.4668 },
  { id: '1120', name: 'Meidling', group: 12, x: 563.9153, y: 985.6885 },
  { id: '1130', name: 'Hietzing', group: 12, x: 298.2556, y: 923.3916 },
  { id: '1140', name: 'Penzing', group: 12, x: 353.6682, y: 745.125 },
  { id: '1150', name: 'Rudolfsheim', group: 12, x: 597.5002, y: 814.3418 },
  { id: '1160', name: 'Ottakring', group: 12, x: 502.0173, y: 705.6572 },
  { id: '1170', name: 'Hernals', group: 12, x: 415.6843, y: 600.0918 },
  { id: '1180', name: 'Waehring', group: 12, x: 522.7009, y: 559.5 },
  { id: '1190', name: 'Doebling', group: 12, x: 611.1252, y: 446.769 },
  { id: '1200', name: 'Brigittenau', group: 12, x: 794.0002, y: 571.5957 },
  { id: '1210', name: 'Floridsdorf', group: 12, x: 954.6155, y: 326.6909 },
  { id: '1220', name: 'Donaustadt', group: 12, x: 1313.675, y: 645.9873 },
  { id: '1230', name: 'Liesing', group: 12, x: 535.7629, y: 1115.2705 },
];

const getPrice = (group: number, type: VehicleType) => {
  if (group === 11) return type === 'limo' ? '30' : type === 'kombi' ? '35' : '50';
  if (group === 1) return type === 'limo' ? '33' : type === 'kombi' ? '38' : '53';
  return type === 'limo' ? '35' : type === 'kombi' ? '40' : '55';
};

export default function TestMapPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-10 text-[#111111]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-[-0.05em]">Flughafentaxi Wien</h1>
          <p className="mt-2 text-[#6b7280]">Waehlen Sie Ihren Bezirk fuer den Fixpreis-Check</p>
        </header>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <section className="w-full rounded-[1.5rem] border border-[#e5e7eb] bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)] lg:sticky lg:top-5 lg:w-1/2">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
              Interaktive Karte
            </h2>

            <div className="relative overflow-hidden rounded-[1.2rem] border border-[#e5e7eb] bg-[#f8fafc]">
              <Image
                src="/maps/vienna-districts.svg"
                alt="Wiener Bezirkskarte"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                className="h-auto w-full"
                priority
              />

              {districts.map((district) => {
                const isActive = activeId === district.id;

                return (
                  <button
                    key={district.id}
                    type="button"
                    aria-label={`Bezirk ${district.id} ${district.name}`}
                    onMouseEnter={() => setActiveId(district.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(district.id)}
                    onBlur={() => setActiveId(null)}
                    onClick={() => setActiveId(district.id)}
                    className="absolute z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 md:h-8 md:w-8"
                    style={{
                      left: `${(district.x / MAP_WIDTH) * 100}%`,
                      top: `${(district.y / MAP_HEIGHT) * 100}%`,
                      backgroundColor: isActive ? 'rgba(22, 121, 255, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                      border: isActive ? '1px solid rgba(22, 121, 255, 0.55)' : '1px solid transparent',
                      boxShadow: isActive ? '0 8px 20px rgba(22, 121, 255, 0.18)' : 'none',
                    }}
                  >
                    <span
                      className="block h-3 w-3 rounded-full md:h-3.5 md:w-3.5"
                      style={{
                        margin: '0 auto',
                        backgroundColor: isActive ? '#1679ff' : 'rgba(17, 17, 17, 0.08)',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs italic text-[#9ca3af]">
              {activeId ? `Bezirk ${activeId} ausgewaehlt` : 'Bezirk in der Liste oder Karte beruehren'}
            </p>
          </section>

          <section className="w-full lg:w-1/2">
            <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_18px_42px_rgba(17,17,17,0.08)]">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-[10px] font-black uppercase text-white">
                    <th className="w-[35%] p-3 text-left">Bezirk</th>
                    <th className="w-[21.6%] border-l border-white/10 p-3 text-center">Limo</th>
                    <th className="w-[21.6%] border-l border-white/10 p-3 text-center">Kombi</th>
                    <th className="w-[21.6%] border-l border-white/10 p-3 text-center">Van</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6] text-sm">
                  {districts.map((district) => {
                    const isActive = activeId === district.id;

                    return (
                      <tr
                        key={district.id}
                        onMouseEnter={() => setActiveId(district.id)}
                        onMouseLeave={() => setActiveId(null)}
                        onClick={() => setActiveId(district.id)}
                        className={`cursor-pointer transition-colors ${
                          isActive ? 'bg-[#eff6ff]' : 'hover:bg-[#f9fafb]'
                        }`}
                      >
                        <td className="p-2 pl-3 leading-tight">
                          <div className={`text-base font-black ${isActive ? 'text-[#1679ff]' : 'text-[#111827]'}`}>
                            {district.id}
                          </div>
                          <div className="truncate text-[10px] font-bold uppercase text-[#9ca3af]">
                            {district.name}
                          </div>
                        </td>
                        <td className={`border-l border-[#f3f4f6] text-center font-bold ${isActive ? 'text-[#1679ff]' : 'text-[#1f2937]'}`}>
                          {getPrice(district.group, 'limo')}€
                        </td>
                        <td className={`border-l border-[#f3f4f6] text-center font-bold ${isActive ? 'text-[#1679ff]' : 'text-[#1f2937]'}`}>
                          {getPrice(district.group, 'kombi')}€
                        </td>
                        <td className={`border-l border-[#f3f4f6] text-center font-bold ${isActive ? 'text-[#1679ff]' : 'text-[#1f2937]'}`}>
                          {getPrice(district.group, 'van')}€
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 px-2 text-[10px] leading-relaxed text-[#9ca3af]">
              * Fixpreisgarantie gilt fuer Fahrten von oder nach Flughafen Wien (VIE). Inklusive
              10 Min. Wartezeit und Kindersitz auf Anfrage.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
