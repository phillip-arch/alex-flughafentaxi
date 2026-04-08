import TestMapClient from './TestMapClient';
import { getViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';

export default async function TestMapPage() {
  const mapGeometry = await getViennaDistrictMapGeometry();

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-10 text-[#111111]">
      <div className="mx-auto max-w-6xl">
        <TestMapClient mapGeometry={mapGeometry} />
      </div>
    </main>
  );
}
