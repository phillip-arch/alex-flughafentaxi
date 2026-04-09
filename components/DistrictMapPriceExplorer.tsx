'use client';

import { useEffect, useRef, useState } from 'react';
import DistrictPriceTable from '@/components/DistrictPriceTable';
import { districtPricingRows } from '@/lib/pricing/districtPricing';
import type { ViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';
import { SVG_WIDTH } from '@/lib/maps/viennaDistricts';

const DESKTOP_MAP_WIDTH = 'lg:w-[54.7%]';
const DESKTOP_TABLE_WIDTH = 'lg:w-[45.3%]';
const MAP_SECTION_BASE_CLASS =
  'sticky z-10 overflow-hidden border border-[#e5e7eb] bg-[#f8fafc] shadow-[0_10px_24px_rgba(17,17,17,0.04)]';
const MOBILE_MAP_SECTION_CLASS =
  'left-1/2 w-screen max-w-none -translate-x-1/2 rounded-none';
const NON_MOBILE_MAP_SECTION_CLASS = 'sm:left-auto sm:w-full sm:translate-x-0 sm:rounded-[1.5rem]';
const MAP_SVG_BASE_CLASS =
  'absolute inset-x-0 top-[6px] bottom-[6px] h-[calc(100%-12px)] w-full transition-transform duration-300 ease-out md:top-[20px] md:bottom-[20px] md:h-[calc(100%-40px)]';
const MAP_SVG_SCALE_CLASS = 'scale-100 sm:scale-[1.08]';
const DEFAULT_DESKTOP_TOP_CLASS = 'sm:top-3 lg:top-5';
const DEFAULT_MOBILE_TOP_CLASS = 'top-0';

const districtByBezNr = new Map(
  districtPricingRows.map((district) => [String((Number(district.id) - 1000) / 10), district]),
);

type DistrictMapPriceExplorerProps = {
  mapGeometry: ViennaDistrictMapGeometry;
  mobileTopClassName?: string;
  desktopTopClassName?: string;
  lazyMountMap?: boolean;
};

export default function DistrictMapPriceExplorer({
  mapGeometry,
  mobileTopClassName = DEFAULT_MOBILE_TOP_CLASS,
  desktopTopClassName = DEFAULT_DESKTOP_TOP_CLASS,
  lazyMountMap = false,
}: DistrictMapPriceExplorerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [shouldRenderMap, setShouldRenderMap] = useState(!lazyMountMap);
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const mapAspectRatio = `${SVG_WIDTH} / ${mapGeometry.svgHeight}`;

  useEffect(() => {
    if (!lazyMountMap || shouldRenderMap) return;

    const mapSectionElement = mapSectionRef.current;
    if (!mapSectionElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        setShouldRenderMap(true);
        observer.disconnect();
      },
      {
        rootMargin: '300px 0px',
      },
    );

    observer.observe(mapSectionElement);

    return () => {
      observer.disconnect();
    };
  }, [lazyMountMap, shouldRenderMap]);

  const mapSectionClassName = `${MAP_SECTION_BASE_CLASS} ${MOBILE_MAP_SECTION_CLASS} ${NON_MOBILE_MAP_SECTION_CLASS} ${DESKTOP_MAP_WIDTH} ${mobileTopClassName} ${desktopTopClassName}`;
  const mapSvgClassName = `${MAP_SVG_BASE_CLASS} ${MAP_SVG_SCALE_CLASS}`;

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      <section ref={mapSectionRef} className={mapSectionClassName}>
        <div
          className="relative min-h-[17.5rem] w-full overflow-hidden bg-[#f8fafc] md:min-h-[26rem]"
          style={{ aspectRatio: mapAspectRatio }}
        >
          {shouldRenderMap && mapGeometry.features.length > 0 ? (
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${mapGeometry.svgHeight}`}
              className={mapSvgClassName}
              style={{ transformOrigin: 'center center' }}
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
          ) : shouldRenderMap ? (
            <div className="absolute inset-0 flex items-center justify-center px-4 py-10 text-center text-sm text-[#6b7280]">
              Die Bezirkskarte konnte nicht geladen werden.
            </div>
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f9_100%)]">
              <div className="absolute inset-x-[8%] top-[12%] h-[76%] rounded-[1.2rem] border border-[#dbe4f0] bg-white/60" />
            </div>
          )}
        </div>
      </section>

      <section className={`w-full ${DESKTOP_TABLE_WIDTH}`}>
        <DistrictPriceTable activeId={activeId} onActiveIdChange={setActiveId} />

        <p className="mt-4 px-2 text-[10px] leading-relaxed text-[#9ca3af]">
          * Fixpreisgarantie gilt fuer Fahrten von oder nach Flughafen Wien (VIE). Inklusive 10
          Min. Wartezeit und Kindersitz auf Anfrage.
        </p>
      </section>
    </div>
  );
}
