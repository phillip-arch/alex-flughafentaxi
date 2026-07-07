'use client';

import { useEffect, useRef, useState } from 'react';
import DistrictPriceTable from '@/components/DistrictPriceTable';
import { districtPricingRows, getDistrictPrice } from '@/lib/pricing/districtPricing';
import type { ViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';
import { SVG_WIDTH } from '@/lib/maps/viennaDistricts';

type Point = { x: number; y: number };
type MapFeature = ViennaDistrictMapGeometry['features'][number];

const DESKTOP_MAP_WIDTH = 'lg:w-[62%]';
const DESKTOP_TABLE_WIDTH = 'lg:w-[38%]';
const MAP_SECTION_BASE_CLASS = 'overflow-hidden';
const MOBILE_MAP_SECTION_CLASS = 'w-full max-w-full';
const NON_MOBILE_MAP_SECTION_CLASS = 'sm:w-full';
const MAP_SVG_BASE_CLASS =
  'absolute inset-x-0 top-[6px] bottom-[6px] h-[calc(100%-12px)] w-full transition-transform duration-300 ease-out md:top-[20px] md:bottom-[20px] md:h-[calc(100%-40px)]';
const MAP_SVG_SCALE_CLASS = 'scale-[1.177] sm:scale-[1.08]';
const DEFAULT_DESKTOP_TOP_CLASS = '';
const DEFAULT_MOBILE_TOP_CLASS = '';
const DISTRICT_LABEL_OFFSETS: Record<string, Point> = {
  '6': { x: -8, y: 6 },
  '7': { x: 0, y: 2 },
  '14': { x: -10, y: 0 },
  '17': { x: -8, y: 6 },
};
const LEFT_TOOLTIP_DISTRICTS = new Set(['2', '3', '10', '11', '21', '22']);
const BELOW_TOOLTIP_DISTRICTS = new Set(['21']);
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
const MOBILE_TOOLTIP_SCALE = 0.95;
const MOBILE_TOOLTIP_WIDTH_BEFORE_SCALE = Math.round(TOOLTIP_WIDTH * 1.4) + 68;
const MOBILE_TOOLTIP_WIDTH = Math.round(MOBILE_TOOLTIP_WIDTH_BEFORE_SCALE * MOBILE_TOOLTIP_SCALE);
const MOBILE_TOOLTIP_HEIGHT = Math.round(TOOLTIP_HEIGHT * 2 * MOBILE_TOOLTIP_SCALE);
const DISTRICT_STROKE_WIDTH = 2.2;
const ACTIVE_DISTRICT_STROKE_WIDTH = 3.2;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const districtByBezNr = new Map(
  districtPricingRows.map((district) => [String((Number(district.id) - 1000) / 10), district]),
);

const getTooltipX = (feature: MapFeature, tooltipWidth: number) => {
  const preferredX = LEFT_TOOLTIP_DISTRICTS.has(feature.beznr)
    ? feature.center.x - tooltipWidth - TOOLTIP_OFFSET
    : feature.center.x + TOOLTIP_OFFSET;

  return clamp(preferredX, 12, SVG_WIDTH - tooltipWidth - 12);
};

const getTooltipY = (feature: MapFeature, tooltipHeight: number, svgHeight: number) => {
  const preferredY = BELOW_TOOLTIP_DISTRICTS.has(feature.beznr)
    ? feature.center.y + TOOLTIP_OFFSET
    : feature.center.y - tooltipHeight - TOOLTIP_OFFSET;

  return clamp(preferredY, 12, svgHeight - tooltipHeight - 12);
};

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
  const activeDistrict = activeFeature ? districtByBezNr.get(activeFeature.beznr) : null;
  const tooltipX = activeFeature ? getTooltipX(activeFeature, tooltipWidth) : 0;
  const tooltipY = activeFeature ? getTooltipY(activeFeature, tooltipHeight, mapGeometry.svgHeight) : 0;

  return (
    <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-stretch lg:gap-8">
      <section ref={mapSectionRef} className={mapSectionClassName}>
        <div
          className="relative min-h-[14rem] w-full overflow-hidden md:min-h-[26rem] lg:h-full lg:min-h-0"
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
                      fill={isActive ? 'var(--amber)' : 'rgba(244,241,232,.32)'}
                      fillOpacity={isActive ? 0.9 : 1}
                      stroke={isActive ? 'var(--amber-deep)' : 'rgba(244,241,232,.16)'}
                      strokeWidth={isActive ? ACTIVE_DISTRICT_STROKE_WIDTH : DISTRICT_STROKE_WIDTH}
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
                      className="pointer-events-none select-none fill-[var(--paper)] text-[20px] font-bold transition-all duration-200"
                      style={{
                        fill: isActive ? 'var(--night)' : 'var(--paper)',
                        fontSize: isActive ? '26px' : '20px',
                      }}
                    >
                      {feature.beznr}
                    </text>
                  </g>
                );
              })}
              {activeFeature ? (
                <path
                  d={activeFeature.path}
                  fill="none"
                  stroke="var(--amber-deep)"
                  strokeWidth={ACTIVE_DISTRICT_STROKE_WIDTH}
                  vectorEffect="non-scaling-stroke"
                  className="pointer-events-none"
                />
              ) : null}
              {activeFeature && activeDistrict ? (
                <foreignObject
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  className="pointer-events-none overflow-visible"
                >
                  <div className="rounded-[1rem] border border-[var(--line)] bg-[rgba(16,26,44,.96)] px-4 py-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.32)] backdrop-blur-sm">
                    <p className="text-[35.15px] font-black leading-tight tracking-[-0.03em] text-[var(--paper)] md:text-[20px]">
                      📍 {activeDistrict.id} {activeDistrict.name}
                    </p>
                    <p className="mt-2 text-[35.15px] font-semibold leading-tight text-[var(--muted)] md:mt-1.5 md:text-[20px]">
                      ⏱️ {DISTRICT_DRIVE_TIMES[activeDistrict.id] ?? '~30 min'}
                    </p>
                    <p className="mt-4 whitespace-nowrap text-[35.15px] font-black leading-tight tracking-[-0.03em] text-[var(--paper)] md:mt-2 md:text-[20px]">
                      {getDistrictPrice(activeDistrict.group, 'limo')}€ <span className="text-[var(--muted)]">|</span>{' '}
                      {getDistrictPrice(activeDistrict.group, 'kombi')}€ <span className="text-[var(--muted)]">|</span>{' '}
                      {getDistrictPrice(activeDistrict.group, 'van')}€
                    </p>
                  </div>
                </foreignObject>
              ) : null}
            </svg>
          ) : shouldRenderMap ? (
            <div className="absolute inset-0 flex items-center justify-center px-4 py-10 text-center text-sm text-[var(--muted)]">
              Die Bezirkskarte konnte nicht geladen werden.
            </div>
          ) : (
            <div className="absolute inset-0 bg-[var(--panel-2)]">
              <div className="absolute inset-x-[8%] top-[12%] h-[76%] rounded-[1.2rem] border border-[var(--line)] bg-[rgba(255,255,255,.045)]" />
            </div>
          )}
        </div>
      </section>

      <section className={`w-full ${DESKTOP_TABLE_WIDTH} lg:flex lg:flex-col`}>
        <DistrictPriceTable activeId={activeId} onActiveIdChange={setActiveId} />

        <div className="pt-6">
          <p className="px-2 text-[10px] leading-relaxed text-[var(--muted)]">
            Please note: The travel times shown on the map are estimates. The actual driving time may vary
            depending on traffic, time of day, and weather conditions. Please plan your departure time accordingly.
          </p>
        </div>
      </section>
    </div>
  );
}
