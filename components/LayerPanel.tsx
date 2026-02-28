"use client";

import { LAYERS } from "@/lib/data";

interface Props {
  activeId: string | null;
  onToggle: (id: string) => void;
  rightOffset: number;
}

export default function LayerPanel({ activeId, onToggle, rightOffset }: Props) {
  return (
    <div
      className="fade-up"
      style={{
        position: "absolute",
        top: 12,
        right: rightOffset + 12,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 0",
        zIndex: 700,
        width: 210,
        backdropFilter: "blur(12px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, padding: "0 14px 10px", fontFamily: "var(--font-display)" }}>
        Слоеве данни
      </div>

      {LAYERS.map((layer) => {
        const active = activeId === layer.id;
        return (
          <button
            key={layer.id}
            onClick={() => onToggle(layer.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "8px 14px",
              background: active ? `${layer.color}12` : "transparent",
              border: "none",
              borderLeft: active ? `2px solid ${layer.color}` : "2px solid transparent",
              cursor: "pointer", transition: "all 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-raised)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{layer.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: active ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: active ? 600 : 400 }}>
                {layer.label}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                {layer.description}
              </div>
            </div>
            {active && (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: layer.color, flexShrink: 0, boxShadow: `0 0 6px ${layer.color}` }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
