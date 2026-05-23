"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

const AppClient = dynamic(() => import("@/components/AppClient"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100vw", height: "100vh", background: "#03070f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #34d399", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 13, color: "#3d5470", fontFamily: "sans-serif" }}>Зарежда се...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  ),
});

export default function AppClientWrapper() {
  // Lock body scroll for /map — Leaflet requires it
  useEffect(() => {
    document.body.classList.add("map-body");
    return () => document.body.classList.remove("map-body");
  }, []);

  return <AppClient />;
}
