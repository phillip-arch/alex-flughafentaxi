import { geoCentroid, geoMercator, geoPath } from 'd3-geo';
import viennaDistrictsSource from '@/lib/maps/data/vienna-districts-source.json';
const SVG_WIDTH = 1000;
const MAP_FIT_PADDING = 4;

type PolygonCoordinates = number[][][];
type MultiPolygonCoordinates = number[][][][];

type RawFeature = {
  properties?: Record<string, unknown>;
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
};

export type ViennaDistrictFeature = {
  type: 'Feature';
  properties: {
    BEZNR: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: PolygonCoordinates | MultiPolygonCoordinates;
  };
};

export type ViennaDistrictFeatureCollection = {
  type: 'FeatureCollection';
  bbox: [number, number, number, number];
  features: ViennaDistrictFeature[];
};

export type ViennaDistrictMapGeometry = {
  svgHeight: number;
  features: Array<{
    beznr: string;
    path: string;
    center: {
      x: number;
      y: number;
    };
  }>;
};

let featureCollectionPromise: Promise<ViennaDistrictFeatureCollection> | null = null;
let mapGeometryPromise: Promise<ViennaDistrictMapGeometry> | null = null;

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

function buildViennaDistrictFeatureCollection(): ViennaDistrictFeatureCollection {
  const payload = viennaDistrictsSource as { features?: RawFeature[] };
  const bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  const features: ViennaDistrictFeature[] = [];

  for (const feature of payload.features ?? []) {
    const beznr = getBezNr(feature.properties);
    const geometryType = feature.geometry?.type;
    const coordinates = feature.geometry?.coordinates;

    if (!beznr || !geometryType || !coordinates) continue;

    if (geometryType === 'Polygon') {
      const polygon = rewindPolygon(coordinates as PolygonCoordinates);
      pushPolygonBounds(polygon, bounds);

      features.push({
        type: 'Feature',
        properties: { BEZNR: beznr },
        geometry: {
          type: 'Polygon',
          coordinates: polygon,
        },
      });
      continue;
    }

    if (geometryType === 'MultiPolygon') {
      const multiPolygon = rewindMultiPolygon(coordinates as MultiPolygonCoordinates);
      multiPolygon.forEach((polygon) => {
        pushPolygonBounds(polygon, bounds);
      });

      features.push({
        type: 'Feature',
        properties: { BEZNR: beznr },
        geometry: {
          type: 'MultiPolygon',
          coordinates: multiPolygon,
        },
      });
    }
  }

  features.sort((a, b) => Number(a.properties.BEZNR) - Number(b.properties.BEZNR));

  return {
    type: 'FeatureCollection',
    bbox: bounds,
    features,
  };
}

export function getViennaDistrictFeatureCollection() {
  featureCollectionPromise ??= Promise.resolve(buildViennaDistrictFeatureCollection());
  return featureCollectionPromise;
}

function buildViennaDistrictMapGeometry(
  featureCollection: ViennaDistrictFeatureCollection,
): ViennaDistrictMapGeometry {
  if (featureCollection.features.length === 0) {
    return { svgHeight: 640, features: [] };
  }

  const bounds = geoPath().bounds(featureCollection as never);
  const heightRatio = (bounds[1][1] - bounds[0][1]) / Math.max(bounds[1][0] - bounds[0][0], 1);
  const svgHeight = Math.max(640, SVG_WIDTH * heightRatio);

  const projection = geoMercator().fitExtent(
    [
      [MAP_FIT_PADDING, MAP_FIT_PADDING],
      [SVG_WIDTH - MAP_FIT_PADDING, svgHeight - MAP_FIT_PADDING],
    ],
    featureCollection as never,
  );
  const pathGenerator = geoPath(projection);

  return {
    svgHeight,
    features: featureCollection.features.map((feature) => {
      const [x, y] = projection(geoCentroid(feature as never)) ?? [0, 0];

      return {
        beznr: feature.properties.BEZNR,
        path: pathGenerator(feature as never) ?? '',
        center: { x, y },
      };
    }),
  };
}

export async function getViennaDistrictMapGeometry() {
  mapGeometryPromise ??= getViennaDistrictFeatureCollection().then((featureCollection) =>
    buildViennaDistrictMapGeometry(featureCollection),
  );

  return mapGeometryPromise;
}

export { SVG_WIDTH };
