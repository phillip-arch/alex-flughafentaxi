import { NextResponse } from 'next/server';
import { calculateDistancePriceEstimate } from '@/lib/pricing/distancePricing';

function parseCoordinate(value: unknown) {
  if (value === null || value === undefined || value === '') return NaN;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : NaN;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lat = parseCoordinate(body?.lat);
    const lng = parseCoordinate(body?.lng);
    const address = typeof body?.address === 'string' ? body.address.trim() : '';

    if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && !address) {
      return NextResponse.json({ error: 'Valid coordinates or address are required.' }, { status: 400 });
    }

    const estimate = await calculateDistancePriceEstimate({ lat, lng, address });
    if (!estimate) {
      return NextResponse.json({ error: 'Distance pricing is not available.' }, { status: 404 });
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Pricing estimate error:', error);
    return NextResponse.json({ error: 'Could not calculate distance pricing.' }, { status: 500 });
  }
}
