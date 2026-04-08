import { NextResponse } from 'next/server';
import { getViennaDistrictFeatureCollection } from '@/lib/maps/viennaDistricts';

export async function GET() {
  try {
    const payload = await getViennaDistrictFeatureCollection();

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch Vienna district geometry.' },
      { status: 502 },
    );
  }
}
