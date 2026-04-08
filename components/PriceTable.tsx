import DistrictMapPriceExplorer from '@/components/DistrictMapPriceExplorer';
import { getViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';

export default async function PriceTable() {
  const mapGeometry = await getViennaDistrictMapGeometry();

  return (
    <section className="bg-white py-8 md:py-10">
      <div className="app-container">
        <div className="px-0 py-0 md:rounded-[1.55rem] md:border md:border-[#e9edf3] md:bg-[#fbfbfc] md:px-8 md:py-10 md:shadow-[0_8px_22px_rgba(17,17,17,0.045)]">
          <DistrictMapPriceExplorer
            mapGeometry={mapGeometry}
            mobileStickyTopOffset={78}
            collapsedTopClassName="top-[78px] lg:top-[88px]"
            expandedTopClassName="top-[66px] lg:top-[72px]"
          />
        </div>
      </div>
    </section>
  );
}
