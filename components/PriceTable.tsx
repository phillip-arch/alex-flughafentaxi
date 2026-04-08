import DistrictMapPriceExplorer from '@/components/DistrictMapPriceExplorer';
import { getViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';

export default async function PriceTable() {
  const mapGeometry = await getViennaDistrictMapGeometry();

  return (
    <section className="bg-white py-8 md:py-10">
      <div className="app-container">
        <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
          <DistrictMapPriceExplorer mapGeometry={mapGeometry} />
        </div>
      </div>
    </section>
  );
}
