'use client';

import dynamic from 'next/dynamic';
import type { ViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';

const DynamicDistrictMapPriceExplorer = dynamic(
  () => import('@/components/DistrictMapPriceExplorer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <section className="w-full max-w-full overflow-hidden lg:w-[54.7%]">
          <div className="relative min-h-[17.5rem] w-full overflow-hidden bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f9_100%)] md:min-h-[26rem]">
            <div className="absolute inset-x-[8%] top-[12%] h-[76%] rounded-[1.2rem] border border-[#dbe4f0] bg-white/60" />
          </div>
        </section>

        <section className="w-full lg:w-[45.3%]">
          <div className="mt-4 overflow-hidden rounded-[0.9rem] border border-[#e7edf5] bg-white shadow-[0_10px_24px_rgba(17,17,17,0.035)] md:mt-0">
            <div className="animate-pulse px-4 py-6 md:px-6">
              <div className="h-5 w-40 rounded bg-[#eef2f7]" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 rounded-[0.75rem] bg-[#f5f8fc]"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    ),
  },
);

type PriceTableExplorerClientProps = {
  mapGeometry: ViennaDistrictMapGeometry;
};

export default function PriceTableExplorerClient({
  mapGeometry,
}: PriceTableExplorerClientProps) {
  return (
    <DynamicDistrictMapPriceExplorer
      mapGeometry={mapGeometry}
      mobileTopClassName=""
      desktopTopClassName=""
      lazyMountMap
    />
  );
}
