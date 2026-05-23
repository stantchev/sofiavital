"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link   from "next/link";
import {
  DISTRICTS, PROFILES, Weights, IndicatorKey, District,
  calcPersonalScore, scoreColor,
} from "@/lib/data";
import {
  TbLayersLinked, TbX, TbMapPin, TbAward,
  TbArrowLeft, TbChevronDown,
} from "react-icons/tb";

const MapView          = dynamic(() => import("@/components/MapView"),          { ssr: false });
const DistrictPanel    = dynamic(() => import("@/components/DistrictPanel"),    { ssr: false });
const TopBar           = dynamic(() => import("@/components/TopBar"),           { ssr: false });
const LayerPanel       = dynamic(() => import("@/components/LayerPanel"),       { ssr: false });
const RankingPanel     = dynamic(() => import("@/components/RankingPanel"),     { ssr: false });
const CustomWeightsBar = dynamic(() => import("@/components/CustomWeightsBar"), { ssr: false });
const Legend           = dynamic(() => import("@/components/Legend"),           { ssr: false });
const ChatWidget       = dynamic(() => import("@/components/ChatWidget"),       { ssr: false });
const MobileLayout     = dynamic(() => import("@/components/MobileLayout"),    { ssr: false });

// ── Device detection ──────────────────────────────────────────────────────────
function useDevice(): "mobile" | "desktop" | null {
  const [device, setDevice] = useState<"mobile" | "desktop" | null>(null);
  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent;
      const isPhone =
        (/Android/i.test(ua) && /Mobile/i.test(ua)) ||
        /iPhone|iPod/i.test(ua) ||
        /Windows Phone/i.test(ua) ||
        /BlackBerry|BB10/i.test(ua) ||
        /Opera Mini/i.test(ua);
      setDevice(isPhone && window.innerWidth < 768 ? "mobile" : "desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return device;
}

// ── Hint pill ─────────────────────────────────────────────────────────────────
function HintPill() {
  return (
    <div style={{
      position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
      background: "rgba(7,13,26,0.88)", backdropFilter: "blur(12px)",
      border: "1px solid #1a2d47", borderRadius: "var(--radius-full)",
      padding: "6px 16px",
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 11, color: "var(--text-muted)",
      pointerEvents: "none", zIndex: 600, whiteSpace: "nowrap",
      animation: "fadeUp 0.4s ease both",
    }}>
      <TbMapPin size={12} color="#34d399" />
      Кликни на район за детайли и класация на кварталите
    </div>
  );
}

// ── Quick stats pill ──────────────────────────────────────────────────────────
function QuickStats({ district, weights }: { district: District; weights: Weights }) {
  const ps  = calcPersonalScore(district, weights);
  const col = scoreColor(ps);
  return (
    <div style={{
      position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
      background: "rgba(7,13,26,0.92)", backdropFilter: "blur(12px)",
      border: `1px solid ${col}33`, borderRadius: "var(--radius-full)",
      padding: "5px 16px 5px 12px",
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 12, zIndex: 600, pointerEvents: "none", whiteSpace: "nowrap",
      animation: "fadeUp 0.3s ease both",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: col, boxShadow: `0 0 6px ${col}` }} />
      <span style={{ fontFamily: "Greengoth, var(--font-display)", fontWeight: 700, color: "var(--text-primary)", fontSize: 13 }}>
        {district.name}
      </span>
      <div style={{ width: 1, height: 14, background: "var(--border-subtle)" }} />
      <span style={{ color: col, fontWeight: 700, fontFamily: "var(--font-display)" }}>{ps}</span>
      <span style={{ color: "var(--text-muted)", fontSize: 10 }}>за теб</span>
      <div style={{ width: 1, height: 14, background: "var(--border-subtle)" }} />
      <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
        Vital: <span style={{ color: scoreColor(district.score) }}>{district.score}</span>
      </span>
    </div>
  );
}

// ── Desktop layout ────────────────────────────────────────────────────────────
function DesktopLayout() {
  const [profile, setProfile]           = useState("family");
  const [customW, setCustomW]           = useState<Weights>(PROFILES.custom.weights);
  const [selectedDistrict, setSelected] = useState<District | null>(null);
  const [activeLayer, setActiveLayer]   = useState<string | null>(null);
  const [showLayers, setShowLayers]     = useState(false);
  const [showRanking, setShowRanking]   = useState(false);

  const weights     = profile === "custom" ? customW : PROFILES[profile].weights;
  const sidebarOpen = selectedDistrict !== null;

  const handleCustomWeight = useCallback((key: IndicatorKey, val: number) => {
    setCustomW(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleLayerToggle = useCallback((id: string) => {
    setActiveLayer(prev => prev === id ? null : id);
  }, []);

  return (
    <div style={{
      width: "100vw", height: "100vh",
      display: "flex", flexDirection: "column",
      background: "var(--bg-base)", overflow: "hidden",
    }}>
      <TopBar
        profile={profile}
        onProfileChange={setProfile}
        showLayers={showLayers}
        onToggleLayers={() => setShowLayers(v => !v)}
        showRanking={showRanking}
        onToggleRanking={() => setShowRanking(v => !v)}
      />

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapView
          weights={weights}
          activeLayerId={activeLayer}
          selectedId={selectedDistrict?.id ?? null}
          onSelectDistrict={setSelected}
          districts={DISTRICTS}
        />

        {/* Hint / quick stats */}
        {!sidebarOpen ? <HintPill /> : <QuickStats district={selectedDistrict!} weights={weights} />}

        {/* Legend */}
        <Legend />

        {/* Active layer badge */}
        {activeLayer && (
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            background: "rgba(7,13,26,0.92)", backdropFilter: "blur(10px)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-full)",
            padding: "5px 12px 5px 10px",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, color: "var(--text-secondary)",
            zIndex: 600, animation: "fadeUp 0.3s ease both",
          }}>
            <TbLayersLinked size={12} color="#34d399" />
            <span>Активен слой</span>
            <button
              onClick={() => setActiveLayer(null)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, display: "flex" }}
            >
              <TbX size={12} />
            </button>
          </div>
        )}

        {showRanking && (
          <RankingPanel
            districts={DISTRICTS} weights={weights} profileKey={profile}
            selectedId={selectedDistrict?.id ?? null} onSelect={setSelected}
          />
        )}
        {showLayers && (
          <LayerPanel activeId={activeLayer} onToggle={handleLayerToggle} rightOffset={sidebarOpen ? 310 : 0} />
        )}
        {profile === "custom" && (
          <CustomWeightsBar weights={customW} onChange={handleCustomWeight} />
        )}
        {selectedDistrict && (
          <DistrictPanel district={selectedDistrict} weights={weights} onClose={() => setSelected(null)} />
        )}
      </div>

      <ChatWidget />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AppClient() {
  const device = useDevice();
  if (device === null) return <div style={{ width: "100vw", height: "100vh", background: "#03070f" }} />;
  if (device === "mobile") return <MobileLayout />;
  return <DesktopLayout />;
}
