"use client";

import { District, Weights, calcPersonalScore, scoreColor, scoreLabel, PROFILES } from "@/lib/data";
import { TbAward, TbChevronRight } from "react-icons/tb";

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

  const profile = PROFILES[profileKey];
  const medals  = ["🥇", "🥈", "🥉"];
  const maxScore = ranked[0]?.ps ?? 100;

  return (
    <div
      className="fade-up"
      style={{
        position: "absolute", top: 12, left: 12,
        background: "rgba(7,13,26,0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid #0f1e32",
        borderRadius: 14,
        zIndex: 700, width: 240,
        maxHeight: "calc(100vh - 80px)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #0f1e32", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <TbAward size={13} color="#34d399" />
          <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-display)" }}>
            Класация
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
          <span>{profile.icon}</span>
          <span style={{ fontWeight: 500 }}>{profile.label}</span>
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {ranked.map((d, i) => {
          const isSelected = d.id === selectedId;
          const col        = scoreColor(d.ps);
          const barWidth   = (d.ps / maxScore) * 100;

          return (
            <div
              key={d.id}
              onClick={() => onSelect(d)}
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                background: isSelected ? `${col}0d` : "transparent",
                borderLeft: `2px solid ${isSelected ? col : "transparent"}`,
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-raised)"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                {/* Position */}
                <span style={{
                  width: 20, fontSize: i < 3 ? 13 : 10,
                  textAlign: "center", flexShrink: 0,
                  color: i >= 3 ? "var(--text-faint)" : undefined,
                  fontFamily: "var(--font-display)", fontWeight: 700,
                }}>
                  {i < 3 ? medals[i] : `${i + 1}`}
                </span>

                {/* Name */}
                <span style={{
                  flex: 1, fontSize: 12,
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: isSelected ? 600 : 400,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {d.name}
                </span>

                {/* Score + chevron */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: col, fontFamily: "Greengoth, var(--font-display)" }}>
                    {d.ps}
                  </span>
                  {isSelected && <TbChevronRight size={11} color={col} />}
                </div>
              </div>

              {/* Mini progress bar */}
              <div style={{ marginLeft: 28, height: 2, background: "#0f1e32", borderRadius: 1, overflow: "hidden" }}>
                <div style={{
                  width: `${barWidth}%`, height: "100%",
                  background: `linear-gradient(90deg, ${col}55, ${col})`,
                  borderRadius: 1,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid #0f1e32", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>
            {ranked.length} района
          </span>
          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
            Среден: <span style={{ color: "#34d399", fontWeight: 700 }}>
              {Math.round(ranked.reduce((s, d) => s + d.ps, 0) / ranked.length)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
