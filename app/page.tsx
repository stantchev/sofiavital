"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { DISTRICTS, PROFILES, Weights, IndicatorKey, District } from "@/lib/data";

const HeroScreen       = dynamic(() => import("@/components/HeroScreen"),       { ssr: false });
const MapView          = dynamic(() => import("@/components/MapView"),           { ssr: false });
const DistrictPanel    = dynamic(() => import("@/components/DistrictPanel"),     { ssr: false });
const TopBar           = dynamic(() => import("@/components/TopBar"),            { ssr: false });
const LayerPanel       = dynamic(() => import("@/components/LayerPanel"),        { ssr: false });
const RankingPanel     = dynamic(() => import("@/components/RankingPanel"),      { ssr: false });
const CustomWeightsBar = dynamic(() => import("@/components/CustomWeightsBar"),  { ssr: false });
const Legend           = dynamic(() => import("@/components/Legend"),            { ssr: false });
const ChatWidget       = dynamic(() => import("@/components/ChatWidget"),        { ssr: false });
const MobileLayout     = dynamic(() => import("@/components/MobileLayout"),     { ssr: false });

// ── Device detection ──────────────────────────────────────────────────────────
function useDevice(): "mobile" | "desktop" | null {
  const [device, setDevice] = useState<"mobile" | "desktop" | null>(null);
  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent;
      const isPhoneUA =
        (/Android/i.test(ua) && /Mobile/i.test(ua))
        || /iPhone|iPod/i.test(ua)
        || /Windows Phone/i.test(ua)
        || /BlackBerry|BB10/i.test(ua)
        || /Opera Mini/i.test(ua);
      setDevice(isPhoneUA && window.innerWidth < 768 ? "mobile" : "desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return device;
}

// ── Desktop layout ────────────────────────────────────────────────────────────
function DesktopLayout() {
  const [showHero, setShowHero]         = useState(true);
  const [profile, setProfile]           = useState("family");
  const [customW, setCustomW]           = useState<Weights>(PROFILES.custom.weights);
  const [selectedDistrict, setSelected] = useState<District | null>(null);
  const [activeLayer, setActiveLayer]   = useState<string | null>(null);
  const [showLayers, setShowLayers]     = useState(false);
  const [showRanking, setShowRanking]   = useState(false);

  const weights = profile === "custom" ? customW : PROFILES[profile].weights;

  const handleCustomWeight = useCallback((key: IndicatorKey, val: number) => {
    setCustomW((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleLayerToggle = useCallback((id: string) => {
    setActiveLayer((prev) => (prev === id ? null : id));
  }, []);

  if (showHero) return <HeroScreen onEnter={() => setShowHero(false)} />;

  const sidebarOpen = selectedDistrict !== null;

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)", overflow: "hidden" }}>
      <TopBar
        profile={profile}
        onProfileChange={setProfile}
        showLayers={showLayers}
        onToggleLayers={() => setShowLayers((v) => !v)}
        showRanking={showRanking}
        onToggleRanking={() => setShowRanking((v) => !v)}
      />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapView
          weights={weights}
          activeLayerId={activeLayer}
          selectedId={selectedDistrict?.id ?? null}
          onSelectDistrict={setSelected}
          districts={DISTRICTS}
        />

        {/* Hint — changes based on state */}
        {!sidebarOpen && (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-full)", padding: "6px 16px",
            fontSize: 11, color: "var(--text-muted)", pointerEvents: "none",
            zIndex: 600, letterSpacing: 0.3, transition: "opacity 0.3s",
          }}>
            Кликни на район за квартали и детайли
          </div>
        )}

        <Legend />

        {showRanking && (
          <RankingPanel
            districts={DISTRICTS} weights={weights} profileKey={profile}
            selectedId={selectedDistrict?.id ?? null} onSelect={setSelected}
          />
        )}
        {showLayers && (
          <LayerPanel activeId={activeLayer} onToggle={handleLayerToggle} rightOffset={sidebarOpen ? 300 : 0} />
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
export default function Home() {
  const device = useDevice();
  if (device === null) return <div style={{ width: "100vw", height: "100vh", background: "#03070f" }} />;
  if (device === "mobile") return <MobileLayout />;
  return <DesktopLayout />;
}
