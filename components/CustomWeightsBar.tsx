"use client";

import { INDICATOR_LABELS, IndicatorKey, Weights } from "@/lib/data";

interface Props {
  weights: Weights;
  onChange: (key: IndicatorKey, value: number) => void;
}

export default function CustomWeightsBar({ weights, onChange }: Props) {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);

  return (
    <div
      className="fade-up"
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        zIndex: 700,
        width: 620,
        backdropFilter: "blur(12px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-display)" }}>
          Персонализирани тегла
        </span>
        <span style={{ fontSize: 10, color: total > 1.02 || total < 0.98 ? "#fb923c" : "#34d399" }}>
          Сума: {Math.round(total * 100)}%
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
        {(Object.entries(INDICATOR_LABELS) as [IndicatorKey, string][]).map(([key, label]) => {
          const pct = Math.round(weights[key] * 100);
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 5 }}>{label}</div>
              <input
                type="range"
                min={0}
                max={50}
                value={pct}
                onChange={(e) => onChange(key, parseInt(e.target.value) / 100)}
                style={{ width: "100%", accentColor: "#34d399", cursor: "pointer" }}
              />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#34d399", fontFamily: "var(--font-display)", marginTop: 3 }}>
                {pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
