"use client";

import dynamic from "next/dynamic";

const SofiaHero = dynamic(() => import("@/components/ui/SofiaHero"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "200vh", background: "#000", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "45vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "Greengoth, 'Syne', sans-serif",
          fontSize: "clamp(3.5rem, 14vw, 11rem)",
          fontWeight: 900, color: "#fff", lineHeight: 0.85,
          textShadow: "0 0 60px rgba(52,211,153,0.3)",
        }}>SOFIA</div>
        <div style={{
          fontFamily: "Greengoth, 'Syne', sans-serif",
          fontSize: "clamp(2rem, 7vw, 5.5rem)",
          fontWeight: 900, color: "#34d399", lineHeight: 1,
          letterSpacing: "0.12em", textShadow: "0 0 40px rgba(52,211,153,0.5)",
        }}>VITAL</div>
      </div>
    </div>
  ),
});

export default function SofiaHeroWrapper() {
  return <SofiaHero />;
}
