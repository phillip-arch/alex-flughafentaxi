import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const q = String(request.nextUrl.searchParams.get('q') || '').trim();
  const zip = String(request.nextUrl.searchParams.get('zip') || '').trim().replace(/\D/g, '').slice(0, 4);
  const limitRaw = Number(request.nextUrl.searchParams.get('limit') || 8);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 20)) : 8;

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const prefixPattern = `${q}%`;
  const containsPattern = `%${q}%`;

  let prefixQuery = supabaseAdmin
    .from('streets')
    .select('id, street, zip, city')
    .ilike('street', prefixPattern)
    .order('street', { ascending: true })
    .limit(limit);

  let containsQuery = supabaseAdmin
    .from('streets')
    .select('id, street, zip, city')
    .ilike('street', containsPattern)
    .order('street', { ascending: true })
    .limit(limit);

  if (zip) {
    prefixQuery = prefixQuery.eq('zip', zip);
    containsQuery = containsQuery.eq('zip', zip);
  }

  const [{ data: prefixResults, error: prefixError }, { data: containsResults, error: containsError }] =
    await Promise.all([prefixQuery, containsQuery]);

  if (prefixError || containsError) {
    return NextResponse.json(
      { error: prefixError?.message || containsError?.message || 'Street search failed.' },
      { status: 500 },
    );
  }

  const combined = [...(prefixResults || []), ...(containsResults || [])];
  const zipList = [...new Set(combined.map((item) => String(item.zip || '').trim()).filter(Boolean))];

  let cityByZip = new Map<string, string>();
  if (zipList.length > 0) {
    const { data: zipPriceRows, error: zipPriceError } = await supabaseAdmin
      .from('zip_prices')
      .select('zip, city')
      .in('zip', zipList);

    if (zipPriceError) {
      return NextResponse.json(
        { error: zipPriceError.message || 'ZIP price lookup failed.' },
        { status: 500 },
      );
    }

    cityByZip = new Map(
      (zipPriceRows || []).map((row) => [String(row.zip || '').trim(), String(row.city || '').trim()]),
    );
  }

  const seen = new Set<string>();
  const normalizedQuery = q.toLocaleLowerCase('de-AT');

  const results = combined
    .filter((item) => {
      const key = `${item.zip}::${item.street}::${item.city}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => {
      const leftStreet = String(left.street || '');
      const rightStreet = String(right.street || '');
      const leftNormalized = leftStreet.toLocaleLowerCase('de-AT');
      const rightNormalized = rightStreet.toLocaleLowerCase('de-AT');
      const leftStarts = leftNormalized.startsWith(normalizedQuery) ? 0 : 1;
      const rightStarts = rightNormalized.startsWith(normalizedQuery) ? 0 : 1;
      if (leftStarts !== rightStarts) return leftStarts - rightStarts;

      const leftIndex = leftNormalized.indexOf(normalizedQuery);
      const rightIndex = rightNormalized.indexOf(normalizedQuery);
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;

      if (leftStreet.length !== rightStreet.length) return leftStreet.length - rightStreet.length;

      const streetCompare = leftStreet.localeCompare(rightStreet, 'de-AT');
      if (streetCompare !== 0) return streetCompare;

      return String(left.zip || '').localeCompare(String(right.zip || ''), 'de-AT');
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      city: cityByZip.get(String(item.zip || '').trim()) || item.city || 'Wien',
    }));

  return NextResponse.json({ results });
}
