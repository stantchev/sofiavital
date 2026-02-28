"use client";

import { useState } from "react";
import { PROFILES } from "@/lib/data";

interface Props {
  profile: string;
  onProfileChange: (p: string) => void;
  showLayers: boolean;
  onToggleLayers: () => void;
  showRanking: boolean;
  onToggleRanking: () => void;
}

export default function TopBar({
  profile, onProfileChange,
  showLayers, onToggleLayers,
  showRanking, onToggleRanking,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <header
      style={{
        height: 52,
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
        flexShrink: 0,
        zIndex: 600,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d39988", animation: "pulse-dot 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Sofia<span style={{ color: "#34d399" }}>Vital</span>
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />

      {/* Profile tabs */}
      <div style={{ display: "flex", gap: 4 }}>
        {Object.entries(PROFILES).map(([key, p]) => {
          const active = profile === key;
          return (
            <button
              key={key}
              onClick={() => onProfileChange(key)}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 11px",
                background: active ? "rgba(52,211,153,0.1)" : hovered === key ? "var(--bg-raised)" : "transparent",
                border: `1px solid ${active ? "rgba(52,211,153,0.3)" : "transparent"}`,
                borderRadius: "var(--radius-full)",
                color: active ? "#34d399" : "var(--text-muted)",
                fontSize: 12, fontWeight: active ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "var(--font-body)",
              }}
            >
              <span style={{ fontSize: 13 }}>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: "flex", gap: 6 }}>
        {([
          { key: "layers",  label: "Слоеве",   icon: "⬡", active: showLayers,  toggle: onToggleLayers  },
          { key: "ranking", label: "Класация",  icon: "↑↓", active: showRanking, toggle: onToggleRanking },
        ] as const).map(({ key, label, icon, active, toggle }) => (
          <button
            key={key}
            onClick={toggle}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px",
              background: active ? "var(--bg-overlay)" : "transparent",
              border: `1px solid ${active ? "var(--border-default)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 12, cursor: "pointer", transition: "all 0.15s",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = active ? "var(--bg-overlay)" : "transparent"; }}
          >
            <span style={{ fontSize: 11 }}>{icon}</span> {label}
          </button>
        ))}
      </div>
    </header>
  );
}
