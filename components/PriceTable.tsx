import { getViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';
import PriceTableExplorerClient from '@/components/PriceTableExplorerClient';

export default async function PriceTable() {
  const mapGeometry = await getViennaDistrictMapGeometry();

  return (
    <section className="bg-[var(--panel)] py-10 md:py-12">
      <div className="app-container">
        <div className="px-0 py-0 md:rounded-[1.55rem] md:border md:border-[var(--line)] md:bg-[rgba(255,255,255,.045)] md:px-8 md:py-10 md:shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
          <div className="mb-6 px-6 pt-6 text-center md:mb-8 md:px-0 md:pt-0">
            <h2 className="text-[1.65rem] font-black tracking-[-0.05em] text-[var(--paper)] md:text-[2.2rem]">
              Fixed-price overview for all Vienna districts
            </h2>
            <p className="mt-3 text-[0.98rem] text-[var(--muted)] md:text-[1.05rem]">
              All prices include VAT to or from Vienna Airport.
            </p>
          </div>
          <PriceTableExplorerClient mapGeometry={mapGeometry} />
        </div>
      </div>
    </section>
  );
}
