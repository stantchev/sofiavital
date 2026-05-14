"use client";

import { useEffect, useRef } from "react";
import { District, Weights, calcPersonalScore, scoreColor, LAYERS } from "@/lib/data";
import {
  fetchScoringDatasets, scoreKvartal,
  type DatasetCache, type KvartalScore,
} from "@/lib/spatialScore";

interface Props {
  weights: Weights;
  activeLayerId: string | null;
  selectedId: string | null;
  onSelectDistrict: (d: District) => void;
  districts: District[];
}

// Accurate centroids per district id — used for flyTo
const DISTRICT_CENTROIDS: Record<string, [number, number]> = {
  bankya:       [42.718, 23.142],
  vitosha:      [42.638, 23.295],
  vrabnitsa:    [42.724, 23.262],
  vazrazhdane:  [42.699, 23.313],
  ilinden:      [42.697, 23.288],
  iskar:        [42.713, 23.413],
  izgrev:       [42.674, 23.363],
  krasna_pol:   [42.708, 23.272],
  krasno_selo:  [42.686, 23.286],
  kremikovtsi:  [42.764, 23.452],
  lozenets:     [42.669, 23.338],
  lyulin:       [42.697, 23.245],
  mladost:      [42.651, 23.379],
  nadezhda:     [42.731, 23.288],
  novi_iskar:   [42.762, 23.345],
  oborishte:    [42.703, 23.347],
  ovcha_kupel:  [42.679, 23.257],
  pancharevo:   [42.612, 23.404],
  poduyane:     [42.724, 23.352],
  serdika:      [42.722, 23.308],
  slatina:      [42.706, 23.376],
  sredets:      [42.697, 23.328],
  studentski:   [42.659, 23.348],
  triaditza:    [42.682, 23.313],
};

// CYR name -> district id (from dataset 350 obns_cyr field)
const CYR_TO_ID: Record<string, string> = {
  "БАНКЯ": "bankya",            "ВИТОША": "vitosha",
  "ВРЪБНИЦА": "vrabnitsa",      "ВЪЗРАЖДАНЕ": "vazrazhdane",
  "ИЛИНДЕН": "ilinden",         "ИСКЪР": "iskar",
  "ИЗГРЕВ": "izgrev",           "КРАСНА ПОЛЯНА": "krasna_pol",
  "КРАСНО СЕЛО": "krasno_selo", "КРЕМИКОВЦИ": "kremikovtsi",
  "ЛОЗЕНЕЦ": "lozenets",        "ЛЮЛИН": "lyulin",
  "МЛАДОСТ": "mladost",         "НАДЕЖДА": "nadezhda",
  "НОВИ ИСКЪР": "novi_iskar",   "ОБОРИЩЕ": "oborishte",
  "ОВЧА КУПЕЛ": "ovcha_kupel",  "ПАНЧАРЕВО": "pancharevo",
  "ПОДУЯНЕ": "poduyane",        "СЕРДИКА": "serdika",
  "СЛАТИНА": "slatina",         "СРЕДЕЦ": "sredets",
  "СТУДЕНТСКИ": "studentski",   "ТРИАДИЦА": "triaditza",
};

const HOME_CENTER: [number, number] = [42.693, 23.330];
const HOME_ZOOM    = 11;
const DISTRICT_ZOOM = 13;
const KVARTAL_ZOOM  = 15;

export default function MapView({
  weights, activeLayerId, selectedId, onSelectDistrict, districts,
}: Props) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<any>(null);
  const districtLayer   = useRef<any>(null);
  const kvartalLayer    = useRef<any>(null);
  const kvartalLabels   = useRef<any[]>([]);   // label markers — tracked separately
  const overlayLayer    = useRef<any>(null);
  const L               = useRef<any>(null);
  const initializedFor  = useRef<HTMLDivElement | null>(null);
  const prevSelectedId  = useRef<string | null>(null);
  // Track which district is "drilled into" for kvartal view
  const drilledDistrict  = useRef<string | null>(null);
  const datasetsCache    = useRef<DatasetCache | null>(null);   // scoring datasets — fetched once
  const kvartalScoreMap  = useRef<Map<string, KvartalScore>>(new Map()); // kvname -> score

  // ── Init map ──────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (initializedFor.current === container) return;

    async function init() {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css"; link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      const leaflet = await import("leaflet");
      L.current = leaflet.default ?? leaflet;

      if ((container as any)._leaflet_id) {
        mapRef.current?.remove();
        mapRef.current = null;
      }

      initializedFor.current = container;

      const map = L.current.map(container, {
        center: HOME_CENTER, zoom: HOME_ZOOM,
        minZoom: 10, maxZoom: 18,
        zoomControl: false, attributionControl: false,
        zoomSnap: 0.5,
      });

      L.current.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" }
      ).addTo(map);

      L.current.control.zoom({ position: "bottomright" }).addTo(map);
      mapRef.current = map;

      // Click on empty map = zoom back out and clear kvartal view
      map.on("click", () => {
        if (drilledDistrict.current) {
          clearKvartali();
          map.flyTo(HOME_CENTER, HOME_ZOOM, { animate: true, duration: 0.9 });
        }
      });

      loadDistricts();
    }

    init();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      initializedFor.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── flyTo when selectedId changes ─────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedId && selectedId !== prevSelectedId.current) {
      prevSelectedId.current = selectedId;
      const center = DISTRICT_CENTROIDS[selectedId];
      if (center) {
        mapRef.current.flyTo(center, DISTRICT_ZOOM, {
          animate: true, duration: 1.1, easeLinearity: 0.20,
        });
      }
      // Load kvartali for the clicked district
      loadKvartali(selectedId);
    } else if (!selectedId && prevSelectedId.current !== null) {
      prevSelectedId.current = null;
      clearKvartali();
      mapRef.current.flyTo(HOME_CENTER, HOME_ZOOM, {
        animate: true, duration: 0.9, easeLinearity: 0.25,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ── Match district from GeoJSON feature ───────────────────────
  function matchDistrict(feature: any): District {
    const props  = feature?.properties ?? {};
    const cyrRaw = (props.obns_cyr ?? props.RAION ?? props.name ?? "").trim().toUpperCase();
    const id = CYR_TO_ID[cyrRaw];
    if (id) return districts.find((x) => x.id === id) ?? districts[0];
    if (cyrRaw) {
      const found = districts.find((d) => {
        const dn = d.name.toUpperCase();
        return cyrRaw.startsWith(dn.slice(0, 6)) || dn.startsWith(cyrRaw.slice(0, 6));
      });
      if (found) return found;
    }
    return districts[0];
  }

  // ── Tooltip HTML ──────────────────────────────────────────────
  function buildDistrictTooltip(d: District, ps: number) {
    const col = scoreColor(ps);
    return `<div style="background:#0c1524;border:1px solid #1a2d47;border-left:3px solid ${col};border-radius:10px;padding:10px 14px;font-family:'DM Sans',sans-serif;min-width:140px;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
      <div style="font-size:13px;font-weight:600;color:#e8f0fe;margin-bottom:5px">${d.name}</div>
      <div style="display:flex;gap:8px;align-items:center">
        <span style="font-size:20px;font-weight:800;color:${col};line-height:1">${ps}</span>
        <div style="font-size:10px;color:#7a9ab8">Vital Score</div>
      </div>
      <div style="font-size:10px;color:#34d399;margin-top:5px">Клик за квартали →</div>
    </div>`;
  }

  function buildKvartalTooltip(name: string) {
    const clean = name.replace(/^(ж\.к\.|кв\.|с\.|С\.) /i, "").trim();
    return `<div style="background:#0c1524;border:1px solid #1a2d47;border-left:3px solid #a78bfa;border-radius:8px;padding:8px 12px;font-family:'DM Sans',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
      <div style="font-size:11px;color:#7a9ab8;margin-bottom:2px">Квартал</div>
      <div style="font-size:13px;font-weight:600;color:#e8f0fe">${clean}</div>
    </div>`;
  }

  // ── Load district polygons ────────────────────────────────────
  async function loadDistricts() {
    if (!mapRef.current || !L.current) return;
    try {
      const res = await fetch("/api/sofiaplan/datasets/350");
      if (!res.ok) throw new Error("network");
      renderDistrictPolygons(await res.json());
    } catch {
      renderFallbackMarkers();
    }
  }

  function renderDistrictPolygons(geojson: any) {
    if (!L.current || !mapRef.current) return;
    if (districtLayer.current) districtLayer.current.remove();

    const layer = L.current.geoJSON(geojson, {
      style: (feature: any) => {
        const d  = matchDistrict(feature);
        const ps = calcPersonalScore(d, weights);
        return {
          fillColor: scoreColor(ps), fillOpacity: 0.28,
          color: scoreColor(ps), weight: 1, opacity: 0.6,
        };
      },
      onEachFeature: (feature: any, lyr: any) => {
        const d  = matchDistrict(feature);
        const ps = calcPersonalScore(d, weights);

        lyr.on({
          mouseover(e: any) {
            e.target.setStyle({ fillOpacity: 0.55, weight: 2, opacity: 0.9 });
            e.target.bindTooltip(buildDistrictTooltip(d, ps), {
              sticky: true, opacity: 1, className: "sv-tooltip",
            }).openTooltip();
          },
          mouseout(e: any) {
            layer.resetStyle(e.target);
            e.target.closeTooltip();
          },
          click(e: any) {
            L.current.DomEvent.stopPropagation(e);
            onSelectDistrict(d);
          },
        });
      },
    }).addTo(mapRef.current);

    districtLayer.current = layer;
  }

  // ── Load & render kvartali for a district ─────────────────────
  async function loadKvartali(districtId: string) {
    if (!mapRef.current || !L.current) return;
    clearKvartali();
    drilledDistrict.current = districtId;

    try {
      // Fetch kvartal boundaries + district polygons in parallel
      // Also pre-fetch scoring datasets (cached after first load)
      const fetchDistricts = fetch("/api/sofiaplan/datasets/350");
      const fetchKvartali  = fetch("/api/sofiaplan/datasets/297");

      // Start scoring dataset fetch in background (cached)
      if (!datasetsCache.current) {
        fetchScoringDatasets().then(cache => {
          datasetsCache.current = cache;
          // Re-score if kvartals already rendered
          if (drilledDistrict.current === districtId && kvartalLayer.current) {
            applyKvartalScores();
          }
        });
      }

      const [distRes, kvRes] = await Promise.all([fetchDistricts, fetchKvartali]);
      if (!distRes.ok || !kvRes.ok) throw new Error("network");
      const [distGeojson, kvGeojson] = await Promise.all([distRes.json(), kvRes.json()]);

      // Find the polygon(s) for the selected district
      const districtFeature = distGeojson.features.find((f: any) => {
        const cyrRaw = (f.properties?.obns_cyr ?? "").trim().toUpperCase();
        return CYR_TO_ID[cyrRaw] === districtId;
      });

      if (!districtFeature) {
        console.warn("District polygon not found for", districtId);
        return;
      }

      // Extract all rings from the district polygon (handles MultiPolygon)
      const districtRings = extractRings(districtFeature.geometry);

      // Filter kvartali: keep only those whose centroid falls inside the district
      const filtered = {
        type: "FeatureCollection",
        features: kvGeojson.features.filter((f: any) => {
          try {
            const coords = getAllCoords(f.geometry);
            if (!coords.length) return false;
            const lats = coords.map((c: number[]) => c[1]);
            const lons = coords.map((c: number[]) => c[0]);
            const clat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const clon = (Math.min(...lons) + Math.max(...lons)) / 2;
            return districtRings.some((ring: number[][]) =>
              pointInPolygon(clon, clat, ring)
            );
          } catch { return false; }
        }),
      };

      if (filtered.features.length === 0) return;

      // Score kvartali if datasets already loaded, else render plain first
      if (datasetsCache.current) {
        kvartalScoreMap.current.clear();
        filtered.features.forEach((f: any) => {
          const s = scoreKvartal(f, datasetsCache.current!, weights);
          if (s) kvartalScoreMap.current.set(f.properties?.kvname ?? "", s);
        });
      }

      renderKvartalPolygons(filtered);
    } catch (err) {
      console.warn("Could not load kvartali:", err);
    }
  }

  // Re-apply scores to existing kvartal layer after datasets arrive
  function applyKvartalScores() {
    if (!kvartalLayer.current || !datasetsCache.current) return;
    kvartalLayer.current.eachLayer((lyr: any) => {
      const name = lyr.feature?.properties?.kvname ?? "";
      const s = kvartalScoreMap.current.get(name);
      if (!s) return;
      const col = scoreColor(s.vitals);
      lyr.setStyle({
        fillColor: col,
        color:     col,
        fillOpacity: 0.30,
        opacity: 0.85,
        dashArray: "",
        weight: 1.5,
      });
    });
    // Re-render labels with scores
    rebuildKvartalLabels();
  }

  // Extract all outer rings from a Polygon or MultiPolygon geometry
  function extractRings(geometry: any): number[][][] {
    const rings: number[][][] = [];
    try {
      if (geometry.type === "Polygon") {
        rings.push(geometry.coordinates[0]);
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((poly: number[][][]) => {
          rings.push(poly[0]); // outer ring only
        });
      }
    } catch { /* skip */ }
    return rings;
  }

  // Ray-casting point-in-polygon
  // ring: array of [lon, lat] pairs
  // px, py: point longitude, latitude
  function pointInPolygon(px: number, py: number, ring: number[][]): boolean {
    let inside = false;
    const n = ring.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect =
        yi > py !== yj > py &&
        px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function getFirstCoord(geometry: any): [number, number] | null {
    try {
      if (geometry.type === "MultiPolygon") return geometry.coordinates[0][0][0];
      if (geometry.type === "Polygon") return geometry.coordinates[0][0];
      return null;
    } catch { return null; }
  }

  function getKvartalStyle(name: string, hover = false) {
    const s = kvartalScoreMap.current.get(name);
    if (s) {
      const col = scoreColor(s.vitals);
      return {
        fillColor:   col,
        color:       col,
        fillOpacity: hover ? 0.55 : 0.28,
        opacity:     hover ? 1.0  : 0.80,
        weight:      hover ? 2.5  : 1.5,
        dashArray:   "",
      };
    }
    // No score yet — placeholder style
    return {
      fillColor:   "#a78bfa",
      fillOpacity: hover ? 0.30 : 0.10,
      color:       "#a78bfa",
      weight:      hover ? 2.5 : 1.5,
      opacity:     hover ? 1.0 : 0.60,
      dashArray:   s ? "" : "4 3",
    };
  }

  function buildKvartalTooltipScored(name: string): string {
    const clean = name.replace(/^(ж\.к\.|кв\.|с\.|С\.) /i, "").trim();
    const s = kvartalScoreMap.current.get(name);
    if (s) {
      const col = scoreColor(s.vitals);
      return `<div style="background:#0c1524;border:1px solid #1a2d47;border-left:3px solid ${col};border-radius:8px;padding:9px 13px;font-family:'DM Sans',sans-serif;min-width:160px;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
        <div style="font-size:10px;color:#7a9ab8;margin-bottom:3px">Квартал</div>
        <div style="font-size:13px;font-weight:700;color:#e8f0fe;margin-bottom:8px">${clean}</div>
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">
          <span style="font-size:22px;font-weight:800;color:${col};line-height:1">${s.vitals}</span>
          <div style="font-size:10px;color:#7a9ab8">Кварт. Score</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 10px">
          ${[
            ["🌿","Зеленина", s.scores.green],
            ["🚇","Транспорт", s.scores.transit],
            ["💨","Въздух",    s.scores.air],
            ["📚","Училища",   s.scores.schools],
            ["🏗️","Застрояване",s.scores.build],
          ].map(([ic,lb,v]) => `<div style="font-size:9px;color:#7a9ab8">${ic} ${lb}</div><div style="font-size:9px;font-weight:700;color:${scoreColor(v as number)}">${v}</div>`).join("")}
        </div>
      </div>`;
    }
    return `<div style="background:#0c1524;border:1px solid #1a2d47;border-left:3px solid #a78bfa;border-radius:8px;padding:8px 12px;font-family:'DM Sans',sans-serif">
      <div style="font-size:11px;color:#7a9ab8;margin-bottom:2px">Квартал</div>
      <div style="font-size:13px;font-weight:600;color:#e8f0fe">${clean}</div>
      <div style="font-size:10px;color:#3d5470;margin-top:4px">Зарежда score...</div>
    </div>`;
  }

  function renderKvartalPolygons(geojson: any) {
    if (!L.current || !mapRef.current) return;

    const layer = L.current.geoJSON(geojson, {
      style: (feature: any) => {
        const name = feature?.properties?.kvname ?? "";
        return getKvartalStyle(name);
      },
      onEachFeature: (feature: any, lyr: any) => {
        const name = feature.properties?.kvname ?? "Квартал";

        lyr.on({
          mouseover(e: any) {
            e.target.setStyle(getKvartalStyle(name, true));
            e.target.bindTooltip(buildKvartalTooltipScored(name), {
              sticky: true, opacity: 1, className: "sv-tooltip",
            }).openTooltip();
          },
          mouseout(e: any) {
            e.target.setStyle(getKvartalStyle(name, false));
            e.target.closeTooltip();
          },
          click(e: any) {
            L.current.DomEvent.stopPropagation(e);
            const bounds = e.target.getBounds();
            mapRef.current.flyToBounds(bounds, {
              padding: [40, 40], maxZoom: KVARTAL_ZOOM,
              animate: true, duration: 0.8,
            });
          },
        });
      },
    });

    layer.addTo(mapRef.current);
    addKvartalLabels(geojson, layer);
    kvartalLayer.current = layer;

    try {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.flyToBounds(bounds, {
          padding: [30, 30], maxZoom: DISTRICT_ZOOM + 1,
          animate: true, duration: 0.9,
        });
      }
    } catch { /* empty */ }
  }

  function buildLabelHtml(name: string): string {
    const clean = name.replace(/^(ж\.к\.|кв\.|с\.|С\.) /i, "").trim();
    const s = kvartalScoreMap.current.get(name);
    const col = s ? scoreColor(s.vitals) : "#c4b5fd";
    const scoreStr = s ? `<span style="font-size:11px;font-weight:800;color:${col};margin-left:4px">${s.vitals}</span>` : "";
    return `<div style="display:flex;align-items:center;gap:0;pointer-events:none;white-space:nowrap;">
      <span style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;color:${col};text-shadow:0 1px 3px rgba(0,0,0,0.95),0 0 8px rgba(0,0,0,0.9);letter-spacing:0.3px;">${clean}</span>
      ${scoreStr}
    </div>`;
  }

  function addKvartalLabels(geojson: any, _layer: any) {
    geojson.features.forEach((feature: any) => {
      try {
        const name = feature.properties?.kvname ?? "";
        if (!name) return;

        const coords = getAllCoords(feature.geometry);
        if (!coords.length) return;

        const lats = coords.map((c: number[]) => c[1]);
        const lons = coords.map((c: number[]) => c[0]);
        const clat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const clon = (Math.min(...lons) + Math.max(...lons)) / 2;

        const icon = L.current.divIcon({
          html: buildLabelHtml(name),
          className: "",
          iconAnchor: [0, 8],
        });

        const lm = L.current.marker([clat, clon], { icon, interactive: false })
          .addTo(mapRef.current);
        kvartalLabels.current.push(lm);
      } catch { /* skip */ }
    });
  }

  // Rebuild labels in-place after scores arrive
  function rebuildKvartalLabels() {
    kvartalLabels.current.forEach((m) => {
      try {
        const pos = m.getLatLng();
        // Find which kvartal this label belongs to by proximity
        let bestName = "";
        let bestDist = Infinity;
        kvartalScoreMap.current.forEach((_, name) => {
          const s = kvartalScoreMap.current.get(name);
          if (!s) return;
          const d = Math.abs(s.centroid[0] - pos.lat) + Math.abs(s.centroid[1] - pos.lng);
          if (d < bestDist) { bestDist = d; bestName = name; }
        });
        if (bestName) {
          m.setIcon(L.current.divIcon({
            html: buildLabelHtml(bestName),
            className: "",
            iconAnchor: [0, 8],
          }));
        }
      } catch { /* skip */ }
    });
  }

  function getAllCoords(geometry: any): number[][] {
    const result: number[][] = [];
    try {
      if (geometry.type === "Polygon") {
        geometry.coordinates[0].forEach((c: number[]) => result.push(c));
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((poly: number[][][]) => {
          poly[0].forEach((c: number[]) => result.push(c));
        });
      }
    } catch { /* skip */ }
    return result;
  }

  function clearKvartali() {
    if (kvartalLayer.current) {
      kvartalLayer.current.remove();
      kvartalLayer.current = null;
    }
    kvartalLabels.current.forEach((m) => { try { m.remove(); } catch { /* skip */ } });
    kvartalLabels.current = [];
    kvartalScoreMap.current.clear();
    drilledDistrict.current = null;
  }

  // ── Fallback markers ─────────────────────────────────────────
  function renderFallbackMarkers() {
    if (!L.current || !mapRef.current) return;
    districts.forEach((d) => {
      const pos = DISTRICT_CENTROIDS[d.id] ?? HOME_CENTER;
      const ps  = calcPersonalScore(d, weights);
      const col = scoreColor(ps);
      const icon = L.current.divIcon({
        html: `<div style="width:42px;height:42px;background:${col}22;border:1.5px solid ${col};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${col};font-family:'Syne',sans-serif;box-shadow:0 0 16px ${col}44;cursor:pointer;">${ps}</div>`,
        iconSize: [42, 42], iconAnchor: [21, 21], className: "",
      });
      L.current.marker(pos, { icon })
        .addTo(mapRef.current)
        .on("click", () => onSelectDistrict(d))
        .bindTooltip(buildDistrictTooltip(d, ps), { sticky: true, opacity: 1, className: "sv-tooltip" });
    });
  }

  // ── Update colors when weights change ─────────────────────────
  useEffect(() => {
    // Update district layer colors
    if (districtLayer.current) {
      districtLayer.current.eachLayer((lyr: any) => {
        if (!lyr.feature) return;
        const d  = matchDistrict(lyr.feature);
        const ps = calcPersonalScore(d, weights);
        lyr.setStyle({ fillColor: scoreColor(ps), color: scoreColor(ps) });
      });
    }
    // Re-score kvartali with new weights if a district is drilled
    if (kvartalLayer.current && datasetsCache.current && drilledDistrict.current) {
      kvartalScoreMap.current.clear();
      kvartalLayer.current.eachLayer((lyr: any) => {
        if (!lyr.feature) return;
        const s = scoreKvartal(lyr.feature, datasetsCache.current!, weights);
        if (s) kvartalScoreMap.current.set(lyr.feature.properties?.kvname ?? "", s);
      });
      applyKvartalScores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights]);

  // ── Overlay layer ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !L.current) return;
    if (overlayLayer.current) { overlayLayer.current.remove(); overlayLayer.current = null; }
    if (!activeLayerId) return;

    const cfg = LAYERS.find((l) => l.id === activeLayerId);
    if (!cfg) return;

    fetch(`/api/sofiaplan/datasets/${cfg.apiId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.type) return;
        const l = L.current.geoJSON(data, {
          style: () => ({ color: cfg.color, weight: 2, opacity: 0.75, fillColor: cfg.color, fillOpacity: 0.18 }),
          pointToLayer: (_: any, latlng: any) =>
            L.current.circleMarker(latlng, { radius: 5, fillColor: cfg.color, color: "#fff", weight: 1, opacity: 0.9, fillOpacity: 0.85 }),
        }).addTo(mapRef.current);
        overlayLayer.current = l;
      })
      .catch(console.warn);
  }, [activeLayerId]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
  );
}
