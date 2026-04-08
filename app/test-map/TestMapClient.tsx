'use client';

import { useState } from 'react';
import DistrictPriceTable from '@/components/DistrictPriceTable';
import { districtPricingRows } from '@/lib/pricing/districtPricing';
import type { ViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';
import { SVG_WIDTH } from '@/lib/maps/viennaDistricts';

const districtByBezNr = new Map(
  districtPricingRows.map((district) => [String((Number(district.id) - 1000) / 10), district]),
);

type TestMapClientProps = {
  mapGeometry: ViennaDistrictMapGeometry;
};

export default function TestMapClient({ mapGeometry }: TestMapClientProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const mapAspectRatio = `${SVG_WIDTH} / ${mapGeometry.svgHeight}`;

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      <section className="sticky top-3 z-10 w-full overflow-hidden rounded-[1.5rem] border border-[#e5e7eb] bg-[#f8fafc] shadow-[0_10px_24px_rgba(17,17,17,0.04)] lg:top-5 lg:w-[58%]">
        <div
          className="relative min-h-[22rem] w-full overflow-hidden bg-[#f8fafc] md:min-h-[26rem]"
          style={{ aspectRatio: mapAspectRatio }}
        >
          {mapGeometry.features.length > 0 ? (
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${mapGeometry.svgHeight}`}
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Wiener Bezirkskarte"
            >
              {mapGeometry.features.map((feature) => {
                const matchingDistrict = districtByBezNr.get(feature.beznr);
                const isActive = matchingDistrict?.id === activeId;

                return (
                  <g key={feature.beznr}>
                    <path
                      d={feature.path}
                      fill={isActive ? '#1679ff' : '#d8dee8'}
                      fillOpacity={isActive ? 0.9 : 1}
                      stroke={isActive ? '#0f5fca' : '#ffffff'}
                      strokeWidth={isActive ? 3.2 : 2.2}
                      vectorEffect="non-scaling-stroke"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => matchingDistrict && setActiveId(matchingDistrict.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onClick={() => matchingDistrict && setActiveId(matchingDistrict.id)}
                    />
                    <text
                      x={feature.center.x}
                      y={feature.center.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none select-none fill-[#111111] text-[20px] font-bold transition-all duration-200"
                      style={{
                        fill: isActive ? '#ffffff' : '#111111',
                        fontSize: isActive ? '26px' : '20px',
                      }}
                    >
                      {feature.beznr}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-4 py-10 text-center text-sm text-[#6b7280]">
              Die Bezirkskarte konnte nicht geladen werden.
            </div>
          )}
        </div>
      </section>

      <section className="w-full lg:w-[42%]">
        <DistrictPriceTable activeId={activeId} onActiveIdChange={setActiveId} />

        <p className="mt-4 px-2 text-[10px] leading-relaxed text-[#9ca3af]">
          * Fixpreisgarantie gilt fuer Fahrten von oder nach Flughafen Wien (VIE). Inklusive 10
          Min. Wartezeit und Kindersitz auf Anfrage.
        </p>
      </section>
    </div>
  );
}
