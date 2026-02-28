"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { DISTRICTS, PROFILES, Weights, IndicatorKey, District } from "@/lib/data";

// Dynamic imports (Leaflet cannot run on server)
const HeroScreen      = dynamic(() => import("@/components/HeroScreen"),      { ssr: false });
const MapView         = dynamic(() => import("@/components/MapView"),          { ssr: false });
const DistrictPanel   = dynamic(() => import("@/components/DistrictPanel"),    { ssr: false });
const TopBar          = dynamic(() => import("@/components/TopBar"),           { ssr: false });
const LayerPanel      = dynamic(() => import("@/components/LayerPanel"),       { ssr: false });
const RankingPanel    = dynamic(() => import("@/components/RankingPanel"),     { ssr: false });
const CustomWeightsBar = dynamic(() => import("@/components/CustomWeightsBar"), { ssr: false });
const Legend          = dynamic(() => import("@/components/Legend"),           { ssr: false });

export default function Home() {
  const [showHero, setShowHero]     = useState(true);
  const [profile, setProfile]       = useState("family");
  const [customW, setCustomW]       = useState<Weights>(PROFILES.custom.weights);
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

  if (showHero) {
    return <HeroScreen onEnter={() => setShowHero(false)} />;
  }

  const sidebarOpen = selectedDistrict !== null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        overflow: "hidden",
      }}
    >
      <TopBar
        profile={profile}
        onProfileChange={setProfile}
        showLayers={showLayers}
        onToggleLayers={() => setShowLayers((v) => !v)}
        showRanking={showRanking}
        onToggleRanking={() => setShowRanking((v) => !v)}
      />

      {/* Map area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapView
          weights={weights}
          activeLayerId={activeLayer}
          selectedId={selectedDistrict?.id ?? null}
          onSelectDistrict={setSelected}
          districts={DISTRICTS}
        />

        {/* Hint */}
        {!sidebarOpen && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-full)",
              padding: "6px 16px",
              fontSize: 11,
              color: "var(--text-muted)",
              pointerEvents: "none",
              zIndex: 600,
              letterSpacing: 0.3,
            }}
          >
            Кликни на район за детайли
          </div>
        )}

        {/* Legend */}
        <Legend />

        {/* Ranking panel */}
        {showRanking && (
          <RankingPanel
            districts={DISTRICTS}
            weights={weights}
            profileKey={profile}
            selectedId={selectedDistrict?.id ?? null}
            onSelect={setSelected}
          />
        )}

        {/* Layer panel */}
        {showLayers && (
          <LayerPanel
            activeId={activeLayer}
            onToggle={handleLayerToggle}
            rightOffset={sidebarOpen ? 310 : 0}
          />
        )}

        {/* Custom weights */}
        {profile === "custom" && (
          <CustomWeightsBar weights={customW} onChange={handleCustomWeight} />
        )}

        {/* District sidebar */}
        {selectedDistrict && (
          <DistrictPanel
            district={selectedDistrict}
            weights={weights}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
