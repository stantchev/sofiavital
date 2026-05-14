/**
 * Spatial Scoring Engine
 * Calculates per-kvartal quality scores via spatial joins with SofiaPlan datasets.
 * All computation runs client-side — no backend needed.
 */

import { Weights } from "./data";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KvartalScore {
  kvname: string;
  centroid: [number, number]; // [lat, lon]
  scores: {
    green:   number; // 0-100
    transit: number;
    air:     number;
    schools: number;
    build:   number; // inverse of construction density
  };
  vitals: number; // weighted final score
}

interface FeaturePoint {
  lat: number;
  lon: number;
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

/** Ray-casting point-in-polygon. coords are [lon, lat] pairs. */
function pointInRing(px: number, py: number, ring: number[][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Haversine distance in metres between two [lat,lon] points. */
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bounding-box centroid of a GeoJSON geometry. Returns [lat, lon]. */
function centroidOf(geometry: any): [number, number] | null {
  try {
    const coords: number[][] = [];
    const collect = (arr: any) => {
      if (typeof arr[0] === "number") { coords.push(arr); return; }
      arr.forEach(collect);
    };
    collect(geometry.coordinates);
    if (!coords.length) return null;
    const lats = coords.map(c => c[1]);
    const lons = coords.map(c => c[0]);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lons) + Math.max(...lons)) / 2,
    ];
  } catch { return null; }
}

/** Extract all outer rings from a Polygon or MultiPolygon. */
function outerRings(geometry: any): number[][][] {
  const rings: number[][][] = [];
  try {
    if (geometry.type === "Polygon") rings.push(geometry.coordinates[0]);
    else if (geometry.type === "MultiPolygon")
      geometry.coordinates.forEach((p: number[][][]) => rings.push(p[0]));
  } catch { /* skip */ }
  return rings;
}

/** True if point [lat,lon] is inside any ring of the geometry. */
function pointInGeometry(lat: number, lon: number, geometry: any): boolean {
  return outerRings(geometry).some(ring => pointInRing(lon, lat, ring));
}

/** Compute approximate area of a polygon ring in m² (shoelace on equirectangular). */
function ringAreaM2(ring: number[][]): number {
  const R = 6371000;
  let area = 0;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0] * Math.PI / 180 * R;
    const yi = ring[i][1] * Math.PI / 180 * R;
    const xj = ring[j][0] * Math.PI / 180 * R;
    const yj = ring[j][1] * Math.PI / 180 * R;
    area += (xi * yj - xj * yi);
  }
  return Math.abs(area / 2);
}

/** Kvartal area in m². */
function kvartalAreaM2(geometry: any): number {
  let total = 0;
  outerRings(geometry).forEach(ring => { total += ringAreaM2(ring); });
  return total || 1; // avoid division by zero
}

// ── Normalise helpers ─────────────────────────────────────────────────────────

/** Clamp and scale raw value to 0-100. */
function norm(value: number, min: number, max: number): number {
  return Math.round(Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)));
}

/** Inverse-normalise (higher raw = lower score). */
function normInv(value: number, min: number, max: number): number {
  return 100 - norm(value, min, max);
}

// ── Extract point features from a GeoJSON dataset ────────────────────────────

function extractPoints(geojson: any): FeaturePoint[] {
  const pts: FeaturePoint[] = [];
  try {
    geojson.features.forEach((f: any) => {
      const c = centroidOf(f.geometry);
      if (c) pts.push({ lat: c[0], lon: c[1] });
    });
  } catch { /* skip */ }
  return pts;
}

/** Count points within `radiusM` metres of [lat, lon]. */
function countWithinRadius(
  pts: FeaturePoint[],
  lat: number, lon: number,
  radiusM: number
): number {
  return pts.filter(p => haversineM(lat, lon, p.lat, p.lon) <= radiusM).length;
}

/** Count points that fall inside a geometry. */
function countInside(pts: FeaturePoint[], geometry: any): number {
  return pts.filter(p => pointInGeometry(p.lat, p.lon, geometry)).length;
}

// ── PM10 air quality: average grid value inside kvartal ───────────────────────

/**
 * Dataset 579 returns PM10 concentration grid cells.
 * Each feature has a numeric property (e.g. "PM10", "gridcode", "value").
 * We average the values of grid cells whose centroid is inside the kvartal,
 * or fallback to proximity-weighted average.
 */
function airScore(pm10Geojson: any, geometry: any, centroid: [number, number]): number {
  if (!pm10Geojson?.features?.length) return 50;

  // Detect the numeric value property
  const sample = pm10Geojson.features[0]?.properties ?? {};
  const valueKey = ["PM10", "pm10", "gridcode", "GRIDCODE", "value", "VALUE", "rast"]
    .find(k => typeof sample[k] === "number") ?? null;

  interface PM10Entry { value: number; lat: number; lon: number; }
  const entries: PM10Entry[] = [];

  pm10Geojson.features.forEach((f: any) => {
    const c = centroidOf(f.geometry);
    if (!c) return;
    const raw = valueKey ? f.properties[valueKey] : null;
    if (raw === null || raw === undefined) return;
    entries.push({ value: raw, lat: c[0], lon: c[1] });
  });

  if (!entries.length) return 50;

  // Prefer cells whose centroid falls inside the kvartal
  const inside = entries.filter(e => pointInGeometry(e.lat, e.lon, geometry));
  const pool = inside.length >= 1 ? inside
    // fallback: nearest 5 cells
    : [...entries]
        .sort((a, b) =>
          haversineM(centroid[0], centroid[1], a.lat, a.lon) -
          haversineM(centroid[0], centroid[1], b.lat, b.lon)
        )
        .slice(0, 5);

  const avg = pool.reduce((s, e) => s + e.value, 0) / pool.length;

  // PM10 µg/m³: WHO guideline 15, Sofia typical range 15-80
  // Lower PM10 = better air = higher score
  return normInv(avg, 10, 90);
}

// ── Green score: park/garden area density ─────────────────────────────────────

/**
 * Dataset 235: park polygons.
 * Score = total park area intersecting kvartal / kvartal area, normalised.
 * We approximate intersection by checking which park centroids are inside,
 * plus parks that overlap via bounding box proximity.
 */
function greenScore(parksGeojson: any, geometry: any, centroid: [number, number], kvAreaM2: number): number {
  if (!parksGeojson?.features?.length) return 50;

  let overlapAreaM2 = 0;

  parksGeojson.features.forEach((f: any) => {
    try {
      const pc = centroidOf(f.geometry);
      if (!pc) return;
      const dM = haversineM(centroid[0], centroid[1], pc[0], pc[1]);
      // Include parks whose centroid is within 600m
      if (dM > 600) return;

      // Estimate park area
      const parkArea = outerRings(f.geometry).reduce((s, r) => s + ringAreaM2(r), 0);

      if (pointInGeometry(pc[0], pc[1], geometry)) {
        // Park centroid inside kvartal — count full area (capped at kvartal area)
        overlapAreaM2 += Math.min(parkArea, kvAreaM2 * 0.5);
      } else {
        // Park nearby but outside — count partial credit (proximity decay)
        const decay = Math.max(0, 1 - dM / 600);
        overlapAreaM2 += parkArea * decay * 0.3;
      }
    } catch { /* skip */ }
  });

  // Ratio of green area to kvartal area, capped at 80%
  const ratio = Math.min(overlapAreaM2 / kvAreaM2, 0.8);
  // Typical Sofia kvartal: 0-30% green. Excellent = ≥25%.
  return norm(ratio, 0, 0.25);
}

// ── Transit score: metro + tram line proximity ────────────────────────────────

/**
 * Datasets 32 (metro) and 254 (tram): line geometries.
 * Score based on closest stop/point on any line within walking distance.
 * Metro within 500m = excellent. Tram within 300m = good.
 */
function transitScore(
  metroGeojson: any,
  tramGeojson: any,
  centroid: [number, number]
): number {
  const metroPts = extractPoints(metroGeojson);
  const tramPts  = extractPoints(tramGeojson);

  const closestMetro = metroPts.length
    ? Math.min(...metroPts.map(p => haversineM(centroid[0], centroid[1], p.lat, p.lon)))
    : Infinity;
  const closestTram = tramPts.length
    ? Math.min(...tramPts.map(p => haversineM(centroid[0], centroid[1], p.lat, p.lon)))
    : Infinity;

  // Metro: 0-800m → 100-0 pts (weight 0.6)
  const metroScore = closestMetro <= 800
    ? Math.max(0, 100 - (closestMetro / 800) * 100)
    : 0;

  // Tram: 0-500m → 100-0 pts (weight 0.4)
  const tramScore = closestTram <= 500
    ? Math.max(0, 100 - (closestTram / 500) * 100)
    : 0;

  return Math.round(metroScore * 0.6 + tramScore * 0.4);
}

// ── School score: schools within walking distance ─────────────────────────────

function schoolScore(schoolsGeojson: any, centroid: [number, number]): number {
  if (!schoolsGeojson?.features?.length) return 50;
  const pts = extractPoints(schoolsGeojson);
  // Count schools within 800m
  const count = countWithinRadius(pts, centroid[0], centroid[1], 800);
  // 0 = 0, 1 = 55, 2 = 75, 3+ = 90+
  return norm(count, 0, 4);
}

// ── Construction score: inverse of building permit density ────────────────────

function buildScore(buildGeojson: any, geometry: any, centroid: [number, number], kvAreaM2: number): number {
  if (!buildGeojson?.features?.length) return 70;
  const pts = extractPoints(buildGeojson);
  // Count permits inside kvartal + 100m buffer
  const inside = countInside(pts, geometry);
  const nearby = countWithinRadius(pts, centroid[0], centroid[1], 100) - inside;
  const total = inside + Math.round(nearby * 0.3);
  // Density per km²
  const density = total / (kvAreaM2 / 1_000_000);
  // Inverse: high density = low score. Range: 0-50 permits/km²
  return normInv(density, 0, 50);
}

// ── Main export: score all kvartali in a district ─────────────────────────────

export interface DatasetCache {
  parks:   any;
  metro:   any;
  tram:    any;
  air:     any;
  schools: any;
  build:   any;
}

/**
 * Fetch all scoring datasets in parallel.
 * Returns a cache object to be reused across kvartal recalculations.
 */
export async function fetchScoringDatasets(): Promise<DatasetCache> {
  const ids = {
    parks:   235,
    metro:   32,
    tram:    254,
    air:     579,
    schools: 281,
    build:   628,
  };

  const entries = Object.entries(ids) as [keyof DatasetCache, number][];

  const results = await Promise.allSettled(
    entries.map(([, id]) =>
      fetch(`/api/sofiaplan/datasets/${id}`).then(r => r.ok ? r.json() : null)
    )
  );

  const cache: DatasetCache = {
    parks: null, metro: null, tram: null,
    air: null, schools: null, build: null,
  };

  entries.forEach(([key], i) => {
    const r = results[i];
    cache[key] = r.status === "fulfilled" ? r.value : null;
  });

  return cache;
}

/**
 * Score a single kvartal feature against loaded datasets.
 */
export function scoreKvartal(
  feature: any,
  datasets: DatasetCache,
  weights: Weights
): KvartalScore | null {
  try {
    const geometry = feature.geometry;
    const kvname   = feature.properties?.kvname ?? "Квартал";
    const centroid = centroidOf(geometry);
    if (!centroid) return null;

    const kvAreaM2 = kvartalAreaM2(geometry);

    const raw = {
      green:   greenScore(datasets.parks,   geometry, centroid, kvAreaM2),
      transit: transitScore(datasets.metro, datasets.tram, centroid),
      air:     airScore(datasets.air,       geometry, centroid),
      schools: schoolScore(datasets.schools, centroid),
      build:   buildScore(datasets.build,   geometry, centroid, kvAreaM2),
    };

    // Map our 5 spatial indicators to the full weight set
    // Indicators not covered spatially use district-level data (weight passed through)
    const spatialWeightSum =
      (weights.green   ?? 0) +
      (weights.transit ?? 0) +
      (weights.air     ?? 0) +
      (weights.schools ?? 0) +
      (weights.build   ?? 0);

    const vitals = spatialWeightSum > 0
      ? Math.round(
          (raw.green   * (weights.green   ?? 0) +
           raw.transit * (weights.transit ?? 0) +
           raw.air     * (weights.air     ?? 0) +
           raw.schools * (weights.schools ?? 0) +
           raw.build   * (weights.build   ?? 0)) / spatialWeightSum
        )
      : Math.round((raw.green + raw.transit + raw.air + raw.schools + raw.build) / 5);

    return { kvname, centroid, scores: raw, vitals };
  } catch { return null; }
}
