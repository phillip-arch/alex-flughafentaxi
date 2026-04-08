import TestMapClient from './TestMapClient';
import { getViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';

export default async function TestMapPage() {
  const mapGeometry = await getViennaDistrictMapGeometry();

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-10 text-[#111111]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-[-0.05em]">Flughafentaxi Wien</h1>
          <p className="mt-2 text-[#6b7280]">Waehlen Sie Ihren Bezirk fuer den Fixpreis-Check</p>
        </header>

        <TestMapClient mapGeometry={mapGeometry} />
      </div>
    </main>
  );
}
