import { NextResponse } from 'next/server';

const DISTRICTS_URL =
  'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD&srsName=EPSG:4326&outputFormat=json';

type PolygonCoordinates = number[][][];
type MultiPolygonCoordinates = number[][][][];

type RawFeature = {
  properties?: Record<string, unknown>;
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
};

function getBezNr(properties: Record<string, unknown> | undefined) {
  const rawValue = properties?.BEZNR ?? properties?.beznr ?? properties?.BEZ;
  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) return null;
  return String(numericValue);
}

function pushPolygonBounds(polygon: PolygonCoordinates, bounds: [number, number, number, number]) {
  polygon.forEach((ring) => {
    ring.forEach(([lon, lat]) => {
      bounds[0] = Math.min(bounds[0], lon);
      bounds[1] = Math.min(bounds[1], lat);
      bounds[2] = Math.max(bounds[2], lon);
      bounds[3] = Math.max(bounds[3], lat);
    });
  });
}

function rewindPolygon(polygon: PolygonCoordinates): PolygonCoordinates {
  return polygon.map((ring) => [...ring].reverse());
}

function rewindMultiPolygon(multiPolygon: MultiPolygonCoordinates): MultiPolygonCoordinates {
  return multiPolygon.map((polygon) => rewindPolygon(polygon));
}

export async function GET() {
  const response = await fetch(DISTRICTS_URL, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch Vienna district geometry.' },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as { features?: RawFeature[] };
  const bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];

  const features = (payload.features ?? [])
    .map((feature) => {
    const beznr = getBezNr(feature.properties);
    const geometryType = feature.geometry?.type;
    const coordinates = feature.geometry?.coordinates;

    if (!beznr || !geometryType || !coordinates) return null;

    if (geometryType === 'Polygon') {
      const polygon = rewindPolygon(coordinates as PolygonCoordinates);
      pushPolygonBounds(polygon, bounds);

      return {
        type: 'Feature' as const,
        properties: { BEZNR: beznr },
        geometry: {
          type: 'Polygon' as const,
          coordinates: polygon,
        },
      };
    }

    if (geometryType === 'MultiPolygon') {
      const multiPolygon = rewindMultiPolygon(coordinates as MultiPolygonCoordinates);
      multiPolygon.forEach((polygon) => {
        pushPolygonBounds(polygon, bounds);
      });

      return {
        type: 'Feature' as const,
        properties: { BEZNR: beznr },
        geometry: {
          type: 'MultiPolygon' as const,
          coordinates: multiPolygon,
        },
      };
    }

    return null;
  })
    .filter((feature): feature is NonNullable<typeof feature> => feature !== null)
    .sort((a, b) => Number(a.properties.BEZNR) - Number(b.properties.BEZNR));

  return NextResponse.json({
    type: 'FeatureCollection',
    bbox: bounds,
    features,
  });
}
