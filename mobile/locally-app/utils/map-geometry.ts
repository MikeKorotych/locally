import type { Position } from 'geojson';

type LngLat = [number, number];
type Ring = Position[];

const METERS_PER_DEGREE_LAT = 111320;

export const toRadians = (value: number) => (value * Math.PI) / 180;

export const projectMeters = (origin: LngLat, point: LngLat) => {
  const latRad = toRadians(origin[1]);
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos(latRad);
  const x = (point[0] - origin[0]) * metersPerDegreeLng;
  const y = (point[1] - origin[1]) * METERS_PER_DEGREE_LAT;
  return [x, y] as [number, number];
};

export const distancePointToSegmentMeters = (
  origin: LngLat,
  point: LngLat,
  a: LngLat,
  b: LngLat
) => {
  const p = projectMeters(origin, point);
  const p1 = projectMeters(origin, a);
  const p2 = projectMeters(origin, b);
  const vx = p2[0] - p1[0];
  const vy = p2[1] - p1[1];
  const wx = p[0] - p1[0];
  const wy = p[1] - p1[1];
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) {
    const dx = p[0] - p1[0];
    const dy = p[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  }
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) {
    const dx = p[0] - p2[0];
    const dy = p[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }
  const t = c1 / c2;
  const projX = p1[0] + t * vx;
  const projY = p1[1] + t * vy;
  const dx = p[0] - projX;
  const dy = p[1] - projY;
  return Math.sqrt(dx * dx + dy * dy);
};

const toLngLat = (position: Position): LngLat | null => {
  if (position.length < 2) {
    return null;
  }
  return [position[0], position[1]];
};

const toLngLatRing = (ring: Ring): LngLat[] =>
  ring
    .map((position) => toLngLat(position))
    .filter((value): value is LngLat => value !== null);

export const pointInPolygon = (point: LngLat, ring: Ring) => {
  const lngLatRing = toLngLatRing(ring);
  if (lngLatRing.length === 0) {
    return false;
  }
  let inside = false;
  for (
    let i = 0, j = lngLatRing.length - 1;
    i < lngLatRing.length;
    j = i++
  ) {
    const xi = lngLatRing[i][0];
    const yi = lngLatRing[i][1];
    const xj = lngLatRing[j][0];
    const yj = lngLatRing[j][1];
    const intersect =
      yi > point[1] !== yj > point[1] &&
      point[0] <
        ((xj - xi) * (point[1] - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const distancePointToRingMeters = (point: LngLat, ring: Ring) => {
  const lngLatRing = toLngLatRing(ring);
  if (lngLatRing.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  if (pointInPolygon(point, ring)) {
    return 0;
  }
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < lngLatRing.length - 1; i++) {
    const a = lngLatRing[i];
    const b = lngLatRing[i + 1];
    const d = distancePointToSegmentMeters(point, point, a, b);
    if (d < min) {
      min = d;
    }
  }
  return min;
};

export const polygonAreaMeters = (origin: LngLat, ring: Ring) => {
  const lngLatRing = toLngLatRing(ring);
  if (lngLatRing.length === 0) {
    return 0;
  }
  let area = 0;
  for (
    let i = 0, j = lngLatRing.length - 1;
    i < lngLatRing.length;
    j = i++
  ) {
    const p1 = projectMeters(origin, lngLatRing[j]);
    const p2 = projectMeters(origin, lngLatRing[i]);
    area += p1[0] * p2[1] - p2[0] * p1[1];
  }
  return Math.abs(area) / 2;
};

export const ringKey = (ring: Ring, precision = 6) =>
  toLngLatRing(ring)
    .map(
      (point) =>
        `${point[0].toFixed(precision)},${point[1].toFixed(precision)}`
    )
    .join(';');
