'use client';

import { useEffect, useRef, useState } from 'react';
import DistrictPriceTable from '@/components/DistrictPriceTable';
import { districtPricingRows } from '@/lib/pricing/districtPricing';
import type { ViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';
import { SVG_WIDTH } from '@/lib/maps/viennaDistricts';

const MOBILE_BREAKPOINT = 640;
const MOBILE_STICKY_TOP_OFFSET = 12;
const DESKTOP_MAP_WIDTH = 'lg:w-[54.7%]';
const DESKTOP_TABLE_WIDTH = 'lg:w-[45.3%]';
const MAP_SECTION_BASE_CLASS =
  'sticky z-10 overflow-hidden border border-[#e5e7eb] bg-[#f8fafc] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-[width,margin,border-radius,top] duration-200';
const MAP_SECTION_EXPANDED_CLASS =
  'top-0 ml-[calc(50%-50vw)] w-screen max-w-none rounded-none border-x-0';
const MAP_SECTION_COLLAPSED_CLASS = 'top-3 w-full rounded-[1.5rem]';
const MAP_SVG_BASE_CLASS =
  'absolute inset-x-0 top-[10px] bottom-[10px] h-[calc(100%-20px)] w-full md:top-[20px] md:bottom-[20px] md:h-[calc(100%-40px)]';
const MAP_SVG_COLLAPSED_CLASS = 'scale-[1.08]';
const MAP_SVG_EXPANDED_CLASS = 'scale-100';
const DEFAULT_COLLAPSED_TOP_CLASS = 'top-3 lg:top-5';
const DEFAULT_EXPANDED_TOP_CLASS = 'top-0 lg:top-5';

const districtByBezNr = new Map(
  districtPricingRows.map((district) => [String((Number(district.id) - 1000) / 10), district]),
);

type DistrictMapPriceExplorerProps = {
  mapGeometry: ViennaDistrictMapGeometry;
  mobileStickyTopOffset?: number;
  collapsedTopClassName?: string;
  expandedTopClassName?: string;
};

function useMobileStickyExpansion(
  layoutRef: React.RefObject<HTMLDivElement | null>,
  mapSectionRef: React.RefObject<HTMLElement | null>,
  stickyTopOffset: number,
) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateExpandedState = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setIsExpanded(false);
        return;
      }

      const layoutElement = layoutRef.current;
      const mapElement = mapSectionRef.current;

      if (!layoutElement || !mapElement) {
        setIsExpanded(false);
        return;
      }

      const layoutRect = layoutElement.getBoundingClientRect();
      const mapHeight = mapElement.getBoundingClientRect().height;
      const shouldExpand =
        layoutRect.top <= stickyTopOffset &&
        layoutRect.bottom > mapHeight + stickyTopOffset;

      setIsExpanded(shouldExpand);
    };

    updateExpandedState();
    window.addEventListener('scroll', updateExpandedState, { passive: true });
    window.addEventListener('resize', updateExpandedState);

    return () => {
      window.removeEventListener('scroll', updateExpandedState);
      window.removeEventListener('resize', updateExpandedState);
    };
  }, [layoutRef, mapSectionRef, stickyTopOffset]);

  return isExpanded;
}

export default function DistrictMapPriceExplorer({
  mapGeometry,
  mobileStickyTopOffset = MOBILE_STICKY_TOP_OFFSET,
  collapsedTopClassName = DEFAULT_COLLAPSED_TOP_CLASS,
  expandedTopClassName = DEFAULT_EXPANDED_TOP_CLASS,
}: DistrictMapPriceExplorerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const isMobileMapExpanded = useMobileStickyExpansion(
    layoutRef,
    mapSectionRef,
    mobileStickyTopOffset,
  );
  const mapAspectRatio = `${SVG_WIDTH} / ${mapGeometry.svgHeight}`;
  const mapSectionClassName = `${MAP_SECTION_BASE_CLASS} ${DESKTOP_MAP_WIDTH} ${
    isMobileMapExpanded ? MAP_SECTION_EXPANDED_CLASS : MAP_SECTION_COLLAPSED_CLASS
  } ${
    isMobileMapExpanded ? expandedTopClassName : collapsedTopClassName
  }`;
  const mapSvgClassName = `${MAP_SVG_BASE_CLASS} ${
    isMobileMapExpanded ? MAP_SVG_EXPANDED_CLASS : MAP_SVG_COLLAPSED_CLASS
  }`;

  return (
    <div ref={layoutRef} className="flex flex-col items-start gap-8 lg:flex-row">
      <section ref={mapSectionRef} className={mapSectionClassName}>
        <div
          className="relative w-full overflow-hidden bg-[#f8fafc] md:min-h-[26rem]"
          style={{ aspectRatio: mapAspectRatio }}
        >
          {mapGeometry.features.length > 0 ? (
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
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-4 py-10 text-center text-sm text-[#6b7280]">
              Die Bezirkskarte konnte nicht geladen werden.
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
