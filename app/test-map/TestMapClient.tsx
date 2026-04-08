'use client';

import DistrictMapPriceExplorer from '@/components/DistrictMapPriceExplorer';
import type { ViennaDistrictMapGeometry } from '@/lib/maps/viennaDistricts';

type TestMapClientProps = {
  mapGeometry: ViennaDistrictMapGeometry;
};

export default function TestMapClient({ mapGeometry }: TestMapClientProps) {
  return <DistrictMapPriceExplorer mapGeometry={mapGeometry} />;
}
