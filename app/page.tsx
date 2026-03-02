"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { DISTRICTS, PROFILES, Weights, IndicatorKey, District } from "@/lib/data";

// Dynamic imports — Leaflet and Anime.js cannot run on the server
const HeroScreen       = dynamic(() => import("@/components/HeroScreen"),       { ssr: false });
const MapView          = dynamic(() => import("@/components/MapView"),           { ssr: false });
const DistrictPanel    = dynamic(() => import("@/components/DistrictPanel"),     { ssr: false });
const TopBar           = dynamic(() => import("@/components/TopBar"),            { ssr: false });
const LayerPanel       = dynamic(() => import("@/components/LayerPanel"),        { ssr: false });
const RankingPanel     = dynamic(() => import("@/components/RankingPanel"),      { ssr: false });
const CustomWeightsBar = dynamic(() => import("@/components/CustomWeightsBar"),  { ssr: false });
const Legend           = dynamic(() => import("@/components/Legend"),            { ssr: false });

// ── Mobile phone detection ────────────────────────────────────────────────────
// Targets phones only. Tablets (≥768 px) and desktops pass through normally.
function useIsMobilePhone(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent;

      const isPhoneUA =
        (/Android/i.test(ua) && /Mobile/i.test(ua)) // Android phone (tablets omit "Mobile")
        || /iPhone|iPod/i.test(ua)
        || /Windows Phone/i.test(ua)
        || /BlackBerry|BB10/i.test(ua)
        || /Opera Mini/i.test(ua);

      const isNarrow = window.innerWidth < 768;

      setIsMobile(isPhoneUA && isNarrow);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

// ── Mobile wall ───────────────────────────────────────────────────────────────
function MobileWall() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, #091c38 0%, #03070f 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 28px",
        textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
        zIndex: 99999,
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#0f1e3218 1px, transparent 1px), linear-gradient(90deg, #0f1e3218 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 0%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 320 }}>
        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            margin: "0 auto 28px",
          }}
        >
          🖥️
        </div>

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(6,95,70,0.35)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#34d399",
              display: "inline-block",
              animation: "pulse-dot 1.8s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#6ee7b7",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            В разработка
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: "#e8f0fe",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 14px",
          }}
        >
          SofiaVital
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: 15,
            color: "#7a9ab8",
            lineHeight: 1.65,
            margin: "0 0 28px",
          }}
        >
          Мобилната версия е в разработка.
          <br />
          Моля, използвайте{" "}
          <span style={{ color: "#34d399", fontWeight: 500 }}>
            лаптоп, компютър или таблет
          </span>
          .
        </p>

        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, #1a2d47, transparent)",
            margin: "0 auto 24px",
          }}
        />

        {/* Device icons */}
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {[
            { icon: "💻", label: "Лаптоп" },
            { icon: "🖥️", label: "Компютър" },
            { icon: "⬛", label: "Таблет" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontSize: 10, color: "#3d5470", letterSpacing: 0.5 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const isMobilePhone = useIsMobilePhone();

  const [showHero, setShowHero]             = useState(true);
  const [profile, setProfile]               = useState("family");
  const [customW, setCustomW]               = useState<Weights>(PROFILES.custom.weights);
  const [selectedDistrict, setSelected]     = useState<District | null>(null);
  const [activeLayer, setActiveLayer]       = useState<string | null>(null);
  const [showLayers, setShowLayers]         = useState(false);
  const [showRanking, setShowRanking]       = useState(false);

  const weights = profile === "custom" ? customW : PROFILES[profile].weights;

  const handleCustomWeight = useCallback((key: IndicatorKey, val: number) => {
    setCustomW((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleLayerToggle = useCallback((id: string) => {
    setActiveLayer((prev) => (prev === id ? null : id));
  }, []);

  // Mobile phones see the wall — tablets and desktops continue normally
  if (isMobilePhone) return <MobileWall />;

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
