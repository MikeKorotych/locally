import type { Position } from 'geojson';

type LngLat = [number, number];
type Ring = Position[];

const toLngLat = (position: Position): LngLat | null => {
  if (position.length < 2) {
    return null;
  }
  return [position[0], position[1]];
};

export const getRingCenter = (ring: Ring): LngLat | null => {
  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  for (const point of ring) {
    const lngLat = toLngLat(point);
    if (!lngLat) {
      continue;
    }
    const [lng, lat] = lngLat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  if (
    minLng === Number.POSITIVE_INFINITY ||
    minLat === Number.POSITIVE_INFINITY
  ) {
    return null;
  }
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};

export const getPolygonCenter = (rings: Ring[]): LngLat | null => {
  if (!rings.length) {
    return null;
  }
  return getRingCenter(rings[0]);
};
