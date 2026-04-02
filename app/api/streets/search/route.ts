import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildStreetOptionValue } from '@/lib/addresses';

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .replace(/[.,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('de-AT');
}

function extractStreetSearchQuery(value: string) {
  const raw = value.trim();
  if (!raw) return '';

  const commaParts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const looksLikeZipCity = (part: string) =>
    /^\d{4}\b/.test(part) || /\b(wien|schwechat|v[oö]sendorf)\b/i.test(part);

  const stripHouseNumber = (part: string) => {
    const normalizedPart = part.replace(/\s+/g, ' ').trim();
    const firstNumberIndex = normalizedPart.search(/\s\d/u);
    if (firstNumberIndex === -1) {
      return normalizedPart;
    }
    return normalizedPart.slice(0, firstNumberIndex).trim();
  };

  if (commaParts.length > 1) {
    const first = commaParts[0] || '';
    const last = commaParts.at(-1) || '';

    if (looksLikeZipCity(first) && !looksLikeZipCity(last)) {
      return normalizeSearchValue(stripHouseNumber(last));
    }

    if (!looksLikeZipCity(first) && looksLikeZipCity(last)) {
      return normalizeSearchValue(stripHouseNumber(first));
    }
  }

  return normalizeSearchValue(stripHouseNumber(raw));
}

function extractZipFragment(value: string) {
  const raw = value.trim();
  if (!raw) return '';

  const explicitZipMatch =
    raw.match(/(?:^|,\s*|\s)(\d{4})(?=\s+[A-Za-zÄÖÜäöüß]|$)/u) ||
    raw.match(/^(\d{4})(?=\s)/u);

  if (explicitZipMatch) {
    return explicitZipMatch[1].trim();
  }

  const fallbackMatch = raw.replace(/\D/g, '').match(/^\d{2,4}/);
  return fallbackMatch ? fallbackMatch[0] : '';
}

export async function GET(request: NextRequest) {
  try {
    const q = String(request.nextUrl.searchParams.get('q') || '').trim();
    const zip = String(request.nextUrl.searchParams.get('zip') || '')
      .trim()
      .replace(/\D/g, '')
      .slice(0, 4);
    const limitRaw = Number(request.nextUrl.searchParams.get('limit') || 8);
    const offsetRaw = Number(request.nextUrl.searchParams.get('offset') || 0);
    const isZipOnlyQuery = /^\d{2,4}$/.test(q.replace(/\s+/g, ''));
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(limitRaw, isZipOnlyQuery ? 50 : 20))
      : isZipOnlyQuery
        ? 50
        : 8;
    const offset = Number.isFinite(offsetRaw) ? Math.max(0, offsetRaw) : 0;
    const fetchLimit = offset + limit;

    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const normalizedQuery = normalizeSearchValue(q);
    const streetSearchQuery = extractStreetSearchQuery(q);
    const prefixPattern = `${streetSearchQuery}%`;
    const containsPattern = `%${streetSearchQuery}%`;
    const zipFragment = extractZipFragment(q);
    const cityFragment = normalizeSearchValue(q.replace(/\d/g, ' '));

    let prefixQuery = supabaseAdmin
      .from('streets')
      .select('id, street, zip, city')
      .ilike('street', prefixPattern)
      .order('street', { ascending: true })
      .limit(fetchLimit);

    let containsQuery = supabaseAdmin
      .from('streets')
      .select('id, street, zip, city')
      .ilike('street', containsPattern)
      .order('street', { ascending: true })
      .limit(fetchLimit);

    if (zip) {
      prefixQuery = prefixQuery.eq('zip', zip);
      containsQuery = containsQuery.eq('zip', zip);
    }

    const shouldRunZipFallback = isZipOnlyQuery || (!streetSearchQuery && zipFragment.length >= 2);
    const shouldRunCityFallback = !streetSearchQuery && cityFragment.length >= 2;

    const zipQuery = shouldRunZipFallback
      ? supabaseAdmin
          .from('streets')
          .select('id, street, zip, city')
          .like('zip', `${zipFragment}%`)
          .order('street', { ascending: true })
          .limit(fetchLimit)
      : Promise.resolve({ data: [], error: null } as const);

    const cityZipQuery = shouldRunCityFallback
      ? supabaseAdmin
          .from('zip_prices')
          .select('zip, city')
          .ilike('city', `%${cityFragment}%`)
          .limit(Math.max(25, fetchLimit))
      : Promise.resolve({ data: [], error: null } as const);

    const [
      { data: prefixResults, error: prefixError },
      { data: containsResults, error: containsError },
      { data: zipResults, error: zipResultsError },
      { data: cityZipMatches, error: cityZipError },
    ] = await Promise.all([prefixQuery, containsQuery, zipQuery, cityZipQuery]);

    if (prefixError || containsError || zipResultsError || cityZipError) {
      return NextResponse.json(
        {
          error:
            prefixError?.message ||
            containsError?.message ||
            zipResultsError?.message ||
            cityZipError?.message ||
            'Street search failed.',
        },
        { status: 500 },
      );
    }

    const cityZips = [
      ...new Set(
        (cityZipMatches || [])
          .map((item) => String(item.zip || '').trim())
          .filter(Boolean),
      ),
    ];

    const cityStreetResults =
      cityZips.length > 0
        ? await supabaseAdmin
            .from('streets')
            .select('id, street, zip, city')
            .in('zip', cityZips)
            .order('street', { ascending: true })
            .limit(fetchLimit)
        : { data: [], error: null };

    if (cityStreetResults.error) {
      return NextResponse.json(
        { error: cityStreetResults.error.message || 'City street search failed.' },
        { status: 500 },
      );
    }

    const combined = [
      ...(prefixResults || []),
      ...(containsResults || []),
      ...(zipResults || []),
      ...(cityStreetResults.data || []),
    ];
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

    const results = combined
      .filter((item) => {
        const key = `${item.zip}::${item.street}::${item.city}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item) => ({
        ...item,
        city: cityByZip.get(String(item.zip || '').trim()) || item.city || 'Wien',
      }))
      .sort((left, right) => {
        if (isZipOnlyQuery) {
          const zipCompare = String(left.zip || '').localeCompare(String(right.zip || ''), 'de-AT');
          if (zipCompare !== 0) return zipCompare;
          return normalizeSearchValue(String(left.street || '')).localeCompare(
            normalizeSearchValue(String(right.street || '')),
            'de-AT',
          );
        }

        const leftZip = String(left.zip || '').trim();
        const rightZip = String(right.zip || '').trim();
        const leftCity = String(left.city || '').trim();
        const rightCity = String(right.city || '').trim();
        const leftStreet = String(left.street || '');
        const rightStreet = String(right.street || '');
        const leftLabel = buildStreetOptionValue(leftStreet, leftZip, leftCity);
        const rightLabel = buildStreetOptionValue(rightStreet, rightZip, rightCity);
        const leftLabelNormalized = normalizeSearchValue(leftLabel);
        const rightLabelNormalized = normalizeSearchValue(rightLabel);
        const leftNormalized = leftStreet.toLocaleLowerCase('de-AT');
        const rightNormalized = rightStreet.toLocaleLowerCase('de-AT');
        const leftExact = leftLabelNormalized === normalizedQuery ? 0 : 1;
        const rightExact = rightLabelNormalized === normalizedQuery ? 0 : 1;
        if (leftExact !== rightExact) return leftExact - rightExact;

        const leftLabelStarts = leftLabelNormalized.startsWith(normalizedQuery) ? 0 : 1;
        const rightLabelStarts = rightLabelNormalized.startsWith(normalizedQuery) ? 0 : 1;
        if (leftLabelStarts !== rightLabelStarts) return leftLabelStarts - rightLabelStarts;

        const leftLabelIndex = leftLabelNormalized.indexOf(normalizedQuery);
        const rightLabelIndex = rightLabelNormalized.indexOf(normalizedQuery);
        if (leftLabelIndex !== rightLabelIndex) return leftLabelIndex - rightLabelIndex;

        const leftStarts = leftNormalized.startsWith(normalizedQuery) ? 0 : 1;
        const rightStarts = rightNormalized.startsWith(normalizedQuery) ? 0 : 1;
        if (leftStarts !== rightStarts) return leftStarts - rightStarts;

        const leftIndex = leftNormalized.indexOf(normalizedQuery);
        const rightIndex = rightNormalized.indexOf(normalizedQuery);
        if (leftIndex !== rightIndex) return leftIndex - rightIndex;

        if (leftStreet.length !== rightStreet.length) return leftStreet.length - rightStreet.length;

        const streetCompare = leftStreet.localeCompare(rightStreet, 'de-AT');
        if (streetCompare !== 0) return streetCompare;

        return leftZip.localeCompare(rightZip, 'de-AT');
      })
      .slice(offset, offset + limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Street search route failed:', error);
    return NextResponse.json({ error: 'Street search failed.', results: [] }, { status: 500 });
  }
}
