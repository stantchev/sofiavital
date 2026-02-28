"use client";

import { useEffect, useRef } from "react";
import { District, Weights, calcPersonalScore, scoreColor, LAYERS } from "@/lib/data";

interface Props {
  weights: Weights;
  activeLayerId: string | null;
  selectedId: string | null;
  onSelectDistrict: (d: District) => void;
  districts: District[];
}

// Centroids per district id — used for flyTo
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

const HOME_CENTER: [number, number] = [42.693, 23.330];
const HOME_ZOOM = 10;
const DISTRICT_ZOOM = 13;

export default function MapView({
  weights,
  activeLayerId,
  selectedId,
  onSelectDistrict,
  districts,
}: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<any>(null);
  const districtLayer  = useRef<any>(null);
  const overlayLayer   = useRef<any>(null);
  const L              = useRef<any>(null);
  const initializedFor = useRef<HTMLDivElement | null>(null);
  const prevSelectedId = useRef<string | null>(null);

  // ── Init ─────────────────────────────────────────────────────
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

      // If Leaflet already stamped this container, destroy first
      if ((container as any)._leaflet_id) {
        mapRef.current?.remove();
        mapRef.current = null;
      }

      initializedFor.current = container;

      const map = L.current.map(container, {
        center: HOME_CENTER,
        zoom: HOME_ZOOM,       // zoomed-out so all of Sofia is visible
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.5,
      });

      L.current.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" }
      ).addTo(map);

      L.current.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
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

  // ── flyTo when selectedId changes ────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedId && selectedId !== prevSelectedId.current) {
      // Fly into the district
      prevSelectedId.current = selectedId;
      const center = DISTRICT_CENTROIDS[selectedId];
      if (center) {
        mapRef.current.flyTo(center, DISTRICT_ZOOM, {
          animate: true,
          duration: 1.1,
          easeLinearity: 0.20,
        });
      }
    } else if (!selectedId && prevSelectedId.current !== null) {
      // Fly back to overview when sidebar is closed
      prevSelectedId.current = null;
      mapRef.current.flyTo(HOME_CENTER, HOME_ZOOM, {
        animate: true,
        duration: 0.9,
        easeLinearity: 0.25,
      });
    }
  }, [selectedId]);

  // ── CYR → id lookup ──────────────────────────────────────────
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

  function buildTooltipHtml(d: District, ps: number) {
    const col = scoreColor(ps);
    return `<div style="background:#0c1524;border:1px solid #1a2d47;border-left:3px solid ${col};border-radius:10px;padding:10px 14px;font-family:'DM Sans',sans-serif;min-width:140px;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
      <div style="font-size:13px;font-weight:600;color:#e8f0fe;margin-bottom:5px">${d.name}</div>
      <div style="display:flex;gap:8px;align-items:center">
        <span style="font-size:20px;font-weight:800;color:${col};line-height:1">${ps}</span>
        <div style="font-size:10px;color:#7a9ab8">Vital Score</div>
      </div>
      <div style="font-size:10px;color:#3d5470;margin-top:5px;font-style:italic">Клик за детайли</div>
    </div>`;
  }

  // ── Load districts from API ───────────────────────────────────
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
        const d = matchDistrict(feature);
        const ps = calcPersonalScore(d, weights);
        return { fillColor: scoreColor(ps), fillOpacity: 0.28, color: scoreColor(ps), weight: 1, opacity: 0.6 };
      },
      onEachFeature: (feature: any, lyr: any) => {
        const d  = matchDistrict(feature);
        const ps = calcPersonalScore(d, weights);

        lyr.on({
          mouseover(e: any) {
            e.target.setStyle({ fillOpacity: 0.55, weight: 2, opacity: 0.9 });
            e.target.bindTooltip(buildTooltipHtml(d, ps), { sticky: true, opacity: 1, className: "sv-tooltip" }).openTooltip();
          },
          mouseout(e: any) {
            layer.resetStyle(e.target);
            e.target.closeTooltip();
          },
          click() { onSelectDistrict(d); },
        });
      },
    }).addTo(mapRef.current);

    districtLayer.current = layer;
  }

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
        .bindTooltip(buildTooltipHtml(d, ps), { sticky: true, opacity: 1, className: "sv-tooltip" });
    });
  }

  // ── Update colors on weight change ────────────────────────────
  useEffect(() => {
    if (!districtLayer.current) return;
    districtLayer.current.eachLayer((lyr: any) => {
      if (!lyr.feature) return;
      const d  = matchDistrict(lyr.feature);
      const ps = calcPersonalScore(d, weights);
      lyr.setStyle({ fillColor: scoreColor(ps), color: scoreColor(ps) });
    });
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
