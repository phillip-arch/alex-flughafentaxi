import { getViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';
import PriceTableExplorerClient from '@/components/PriceTableExplorerClient';

export default async function PriceTable() {
  const mapGeometry = await getViennaDistrictMapGeometry();

  return (
    <section className="bg-white py-8 md:py-10">
      <div className="app-container">
        <div className="px-0 py-0 md:rounded-[1.55rem] md:border md:border-[#e9edf3] md:bg-[#fbfbfc] md:px-8 md:py-10 md:shadow-[0_8px_22px_rgba(17,17,17,0.045)]">
          <div className="mb-6 px-6 pt-6 text-center md:mb-8 md:px-0 md:pt-0">
            <h2 className="text-[1.65rem] font-black tracking-[-0.05em] text-[#111111] md:text-[2.2rem]">
              Fixed-price overview for all Vienna districts
            </h2>
            <p className="mt-3 text-[0.98rem] text-[#5f6975] md:text-[1.05rem]">
              All prices include VAT to or from Vienna Airport.
            </p>
          </div>
          <PriceTableExplorerClient mapGeometry={mapGeometry} />
        </div>
      </div>
    </section>
  );
}
