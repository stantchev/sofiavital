"use client";

import { District, Weights, calcPersonalScore, scoreColor, PROFILES } from "@/lib/data";

interface Props {
  districts: District[];
  weights: Weights;
  profileKey: string;
  selectedId: string | null;
  onSelect: (d: District) => void;
}

export default function RankingPanel({ districts, weights, profileKey, selectedId, onSelect }: Props) {
  const ranked = [...districts]
    .map((d) => ({ ...d, ps: calcPersonalScore(d, weights) }))
    .sort((a, b) => b.ps - a.ps);

  const medals = ["🥇", "🥈", "🥉"];
  const profile = PROFILES[profileKey];

  return (
    <div
      className="fade-up"
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        zIndex: 700,
        width: 230,
        maxHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-display)" }}>
          Класация
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>
          {profile.icon} {profile.label} · {profile.description}
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {ranked.map((d, i) => {
          const isSelected = d.id === selectedId;
          const col = scoreColor(d.ps);
          return (
            <div
              key={d.id}
              onClick={() => onSelect(d)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 14px",
                cursor: "pointer",
                background: isSelected ? "var(--bg-overlay)" : "transparent",
                borderLeft: isSelected ? `2px solid ${col}` : "2px solid transparent",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--bg-raised)"; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
            >
              {/* Position */}
              <span style={{ width: 20, fontSize: i < 3 ? 14 : 11, textAlign: "center", color: i < 3 ? undefined : "var(--text-faint)", fontFamily: "var(--font-display)", fontWeight: 700, flexShrink: 0 }}>
                {i < 3 ? medals[i] : `${i + 1}`}
              </span>

              {/* Name */}
              <span style={{ flex: 1, fontSize: 12, color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isSelected ? 600 : 400 }}>
                {d.name}
              </span>

              {/* Score */}
              <span style={{ fontSize: 13, fontWeight: 700, color: col, fontFamily: "var(--font-display)" }}>
                {d.ps}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
