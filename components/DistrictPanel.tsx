"use client";

import { useEffect, useRef, useState } from "react";
import {
  District, Weights, calcPersonalScore, scoreColor, scoreLabel,
  INDICATOR_LABELS, IndicatorKey,
} from "@/lib/data";

interface Props {
  district: District;
  weights: Weights;
  onClose: () => void;
}

function Bar({ label, value, weight, color }: {
  label: string; value: number; weight: number; color: string;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          {label}
          {weight > 0 && (
            <span style={{ color: "var(--text-muted)", fontSize: 9, marginLeft: 4 }}>
              {Math.round(weight * 100)}%
            </span>
          )}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-display)" }}>{value}</span>
      </div>
      <div style={{ height: 3, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 2,
            transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}

function Counter({ target, color }: { target: number; color: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span style={{ fontSize: 34, fontWeight: 800, color, fontFamily: "var(--font-display)", lineHeight: 1 }}>
      {value}
    </span>
  );
}

export default function DistrictPanel({ district, weights, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const personalScore = calcPersonalScore(district, weights);

  useEffect(() => {
    if (!panelRef.current) return;
    panelRef.current.style.transform = "translateX(24px)";
    panelRef.current.style.opacity = "0";
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!panelRef.current) return;
        panelRef.current.style.transition = "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease";
        panelRef.current.style.transform = "translateX(0)";
        panelRef.current.style.opacity = "1";
      }, 10);
    });
  }, [district.id]);

  const metrics = (Object.entries(INDICATOR_LABELS) as [IndicatorKey, string][]).map(([k, label]) => ({
    key: k, label,
    value: district[k] as number,
    weight: weights[k] ?? 0,
    color: scoreColor(district[k] as number),
  }));

  const strengths = metrics.filter((m) => m.value >= 75);
  const warnings  = metrics.filter((m) => m.value < 55);

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0,
        width: 300,
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--border-subtle)",
        zIndex: 800,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "18px 18px 0", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, fontFamily: "var(--font-display)" }}>Район</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {district.name}
            </h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
              {district.pop.toLocaleString("bg-BG")} жители
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: "var(--radius-sm)",
              background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)", cursor: "pointer", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-overlay)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >×</button>
        </div>

        {/* Score cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([
            ["Vital Score", district.score, "#34d399"],
            ["За теб", personalScore, "#a78bfa"],
          ] as const).map(([lbl, val, col]) => (
            <div key={lbl} style={{
              background: "var(--bg-raised)", border: `1px solid ${col}22`,
              borderRadius: "var(--radius-md)", padding: "10px", textAlign: "center",
            }}>
              <Counter target={val as number} color={col as string} />
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: "var(--font-display)" }}>{lbl}</div>
              <div style={{ fontSize: 9, color: col, marginTop: 1 }}>{scoreLabel(val as number)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div style={{ padding: "14px 18px", overflowY: "auto", flex: 1 }}>
        <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: "var(--font-display)" }}>
          Показатели
        </div>
        {metrics.map((m) => (
          <Bar key={m.key} label={m.label} value={m.value} weight={m.weight} color={m.color} />
        ))}
      </div>

      {/* Chips */}
      {(strengths.length > 0 || warnings.length > 0) && (
        <div style={{ padding: "0 18px 16px", flexShrink: 0, borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
          {strengths.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "var(--font-display)" }}>Силни страни</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {strengths.map((m) => (
                  <span key={m.key} style={{ background: "rgba(6,95,70,0.3)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.2)", fontSize: 9, padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
                    ✓ {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "var(--font-display)" }}>Слаби места</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {warnings.map((m) => (
                  <span key={m.key} style={{ background: "rgba(120,53,15,0.3)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)", fontSize: 9, padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
                    ⚠ {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
