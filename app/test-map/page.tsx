'use client';

import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath, geoCentroid } from 'd3-geo';
import DistrictPriceTable from '@/components/DistrictPriceTable';
import { districtPricingRows } from '@/lib/pricing/districtPricing';

type District = {
  id: string;
  name: string;
  group: number;
};

type MapFeature = {
  type: 'Feature';
  properties: {
    BEZNR: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
};

type FeatureCollection = {
  type: 'FeatureCollection';
  features: MapFeature[];
};

const SVG_WIDTH = 1000;

const districts: District[] = districtPricingRows.map((district) => ({ ...district }));

function getDistrictNumberFromZip(zip: string) {
  return String((Number(zip) - 1000) / 10);
}

export default function TestMapPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapData, setMapData] = useState<FeatureCollection | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const response = await fetch('/api/vienna-districts');
        if (!response.ok) {
          throw new Error('Unable to load Vienna districts.');
        }

        const payload = (await response.json()) as FeatureCollection;
        if (!cancelled) {
          setMapData(payload);
          setMapError(null);
        }
      } catch {
        if (!cancelled) {
          setMapError('Die Bezirkskarte konnte nicht geladen werden.');
        }
      }
    }

    loadMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const mapGeometry = useMemo(() => {
    if (!mapData || mapData.features.length === 0) return null;

    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: mapData.features,
    };

    const bounds = geoPath().bounds(featureCollection as never);
    const heightRatio = (bounds[1][1] - bounds[0][1]) / Math.max(bounds[1][0] - bounds[0][0], 1);
    const svgHeight = Math.max(640, SVG_WIDTH * heightRatio);

    const projection = geoMercator().fitSize([SVG_WIDTH, svgHeight], featureCollection as never);
    const pathGenerator = geoPath(projection);

    const features = mapData.features.map((feature) => {
      const [cx, cy] = projection(geoCentroid(feature as never)) ?? [0, 0];

      return {
        beznr: feature.properties.BEZNR,
        path: pathGenerator(feature as never) ?? '',
        center: { x: cx, y: cy },
      };
    });

    return { svgHeight, features };
  }, [mapData]);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-10 text-[#111111]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-[-0.05em]">Flughafentaxi Wien</h1>
          <p className="mt-2 text-[#6b7280]">Waehlen Sie Ihren Bezirk fuer den Fixpreis-Check</p>
        </header>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <section className="sticky top-3 z-10 w-full rounded-[1.5rem] border border-[#e5e7eb] bg-white p-3 shadow-[0_10px_24px_rgba(17,17,17,0.04)] lg:top-5 lg:w-1/2 lg:p-4">
            <div className="relative overflow-hidden rounded-[1.1rem] bg-[#f8fafc]">
              {mapGeometry ? (
                <svg
                  viewBox={`0 0 ${SVG_WIDTH} ${mapGeometry.svgHeight}`}
                  className="h-auto w-full"
                  role="img"
                  aria-label="Wiener Bezirkskarte"
                >
                  {mapGeometry.features.map((feature) => {
                    const matchingDistrict = districts.find(
                      (district) => getDistrictNumberFromZip(district.id) === feature.beznr,
                    );
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
                <div className="flex min-h-[28rem] items-center justify-center px-4 py-10 text-center text-sm text-[#6b7280]">
                  {mapError ?? 'Bezirkskarte wird geladen ...'}
                </div>
              )}
            </div>
          </section>

          <section className="w-full lg:w-1/2">
            <DistrictPriceTable activeId={activeId} onActiveIdChange={setActiveId} />

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
