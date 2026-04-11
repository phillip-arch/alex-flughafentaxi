'use client';

import { useEffect, useRef, useState } from 'react';
import DistrictPriceTable from '@/components/DistrictPriceTable';
import { districtPricingRows, getDistrictPrice } from '@/lib/pricing/districtPricing';
import type { ViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';
import { SVG_WIDTH } from '@/lib/maps/viennaDistricts';

const DESKTOP_MAP_WIDTH = 'lg:w-[54.7%]';
const DESKTOP_TABLE_WIDTH = 'lg:w-[45.3%]';
const MAP_SECTION_BASE_CLASS =
  'sticky z-10 overflow-hidden border border-[#e5e7eb] bg-[#f8fafc] shadow-[0_10px_24px_rgba(17,17,17,0.04)]';
const MOBILE_MAP_SECTION_CLASS = 'w-full max-w-full rounded-none';
const NON_MOBILE_MAP_SECTION_CLASS = 'sm:left-auto sm:w-full sm:translate-x-0 sm:rounded-[1.5rem]';
const MAP_SVG_BASE_CLASS =
  'absolute inset-x-0 top-[6px] bottom-[6px] h-[calc(100%-12px)] w-full transition-transform duration-300 ease-out md:top-[20px] md:bottom-[20px] md:h-[calc(100%-40px)]';
const MAP_SVG_SCALE_CLASS = 'scale-[1.07] sm:scale-[1.08]';
const DEFAULT_DESKTOP_TOP_CLASS = 'sm:top-3 lg:top-5';
const DEFAULT_MOBILE_TOP_CLASS = 'top-0';
const DISTRICT_LABEL_OFFSETS: Record<string, { x: number; y: number }> = {
  '17': { x: -8, y: 6 },
};
const DISTRICT_DRIVE_TIMES: Record<string, string> = {
  '1010': '~25 min',
  '1020': '~20 min',
  '1030': '~20 min',
  '1040': '~25 min',
  '1050': '~25 min',
  '1060': '~30 min',
  '1070': '~30 min',
  '1080': '~30 min',
  '1090': '~30 min',
  '1100': '~25 min',
  '1110': '~15 min',
  '1120': '~30 min',
  '1130': '~35 min',
  '1140': '~40 min',
  '1150': '~30 min',
  '1160': '~35 min',
  '1170': '~35 min',
  '1180': '~35 min',
  '1190': '~35 min',
  '1200': '~25 min',
  '1210': '~30 min',
  '1220': '~25 min',
  '1230': '~30 min',
};
const TOOLTIP_WIDTH = 252;
const TOOLTIP_HEIGHT = 142;
const TOOLTIP_OFFSET = 18;
const MOBILE_TOOLTIP_WIDTH = Math.round(TOOLTIP_WIDTH * 1.4) + 85;
const MOBILE_TOOLTIP_HEIGHT = TOOLTIP_HEIGHT * 2;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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
  const [isMobileTooltip, setIsMobileTooltip] = useState(false);
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateIsMobileTooltip = () => setIsMobileTooltip(mediaQuery.matches);

    updateIsMobileTooltip();
    mediaQuery.addEventListener('change', updateIsMobileTooltip);

    return () => {
      mediaQuery.removeEventListener('change', updateIsMobileTooltip);
    };
  }, []);

  const mapSectionClassName = `${MAP_SECTION_BASE_CLASS} ${MOBILE_MAP_SECTION_CLASS} ${NON_MOBILE_MAP_SECTION_CLASS} ${DESKTOP_MAP_WIDTH} ${mobileTopClassName} ${desktopTopClassName}`;
  const mapSvgClassName = `${MAP_SVG_BASE_CLASS} ${MAP_SVG_SCALE_CLASS}`;
  const tooltipWidth = isMobileTooltip ? MOBILE_TOOLTIP_WIDTH : TOOLTIP_WIDTH;
  const tooltipHeight = isMobileTooltip ? MOBILE_TOOLTIP_HEIGHT : TOOLTIP_HEIGHT;
  const activeFeature = activeId
    ? mapGeometry.features.find((feature) => districtByBezNr.get(feature.beznr)?.id === activeId)
    : null;
  const activeDistrict = activeId ? districtPricingRows.find((district) => district.id === activeId) : null;
  const shouldPlaceTooltipLeft =
    activeFeature?.beznr === '2' ||
    activeFeature?.beznr === '11' ||
    activeFeature?.beznr === '21' ||
    activeFeature?.beznr === '22';
  const tooltipX = activeFeature
    ? clamp(
        shouldPlaceTooltipLeft
          ? activeFeature.center.x - tooltipWidth - TOOLTIP_OFFSET
          : activeFeature.center.x + TOOLTIP_OFFSET,
        12,
        SVG_WIDTH - tooltipWidth - 12,
      )
    : 0;
  const tooltipY = activeFeature
    ? clamp(activeFeature.center.y - tooltipHeight - TOOLTIP_OFFSET, 12, mapGeometry.svgHeight - tooltipHeight - 12)
    : 0;

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
                const labelOffset = DISTRICT_LABEL_OFFSETS[feature.beznr] ?? { x: 0, y: 0 };

                return (
                  <g key={feature.beznr}>
                    <path
                      d={feature.path}
                      fill={isActive ? '#1679ff' : '#d8dee8'}
                      fillOpacity={isActive ? 0.9 : 1}
                      stroke={isActive ? '#0f5fca' : '#ffffff'}
                      strokeWidth={isActive ? 3.2 : 2.2}
                      vectorEffect="non-scaling-stroke"
                      className="cursor-pointer transition-all duration-200 focus:outline-none"
                      style={{ outline: 'none' }}
                      tabIndex={0}
                      role="button"
                      aria-label={
                        matchingDistrict
                          ? `${matchingDistrict.id} ${matchingDistrict.name}, ${DISTRICT_DRIVE_TIMES[matchingDistrict.id] ?? 'estimated time unavailable'}, Sedan ${getDistrictPrice(matchingDistrict.group, 'limo')} EUR, Station Wagon ${getDistrictPrice(matchingDistrict.group, 'kombi')} EUR, Minivan ${getDistrictPrice(matchingDistrict.group, 'van')} EUR`
                          : undefined
                      }
                      onMouseEnter={() => matchingDistrict && setActiveId(matchingDistrict.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onFocus={() => matchingDistrict && setActiveId(matchingDistrict.id)}
                      onBlur={() => setActiveId(null)}
                      onClick={() => matchingDistrict && setActiveId(matchingDistrict.id)}
                    />
                    <text
                      x={feature.center.x + labelOffset.x}
                      y={feature.center.y + labelOffset.y}
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
              {activeFeature && activeDistrict ? (
                <foreignObject
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  className="pointer-events-none overflow-visible"
                >
                  <div className="rounded-[1rem] border border-[#dbe7f8] bg-white/95 px-4 py-3 text-left shadow-[0_18px_45px_rgba(17,24,39,0.18)] backdrop-blur-sm">
                    <p className="text-[38px] font-black leading-tight tracking-[-0.03em] text-[#111827] md:text-[20px]">
                      📍 {activeDistrict.id} {activeDistrict.name}
                    </p>
                    <p className="mt-2 text-[38px] font-semibold leading-tight text-[#5f6975] md:mt-1.5 md:text-[20px]">
                      ⏱️ {DISTRICT_DRIVE_TIMES[activeDistrict.id] ?? '~30 min'}
                    </p>
                    <p className="mt-4 whitespace-nowrap text-[38px] font-black leading-tight tracking-[-0.03em] text-[#111827] md:mt-2 md:text-[20px]">
                      {getDistrictPrice(activeDistrict.group, 'limo')}€ <span className="text-[#9ca3af]">|</span>{' '}
                      {getDistrictPrice(activeDistrict.group, 'kombi')}€ <span className="text-[#9ca3af]">|</span>{' '}
                      {getDistrictPrice(activeDistrict.group, 'van')}€
                    </p>
                  </div>
                </foreignObject>
              ) : null}
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

        <div className="pt-6">
          <p className="px-2 text-[10px] leading-relaxed text-[#111111]">
            Please note: The travel times shown on the map are estimates. The actual driving time may vary
            depending on traffic, time of day, and weather conditions. Please plan your departure time accordingly.
          </p>
        </div>
      </section>
    </div>
  );
}
