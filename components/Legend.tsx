"use client";

export default function Legend() {
  const items = [
    ["75–100", "#34d399", "Отлично"],
    ["65–74",  "#6ee7b7", "Добро"],
    ["55–64",  "#fcd34d", "Средно"],
    ["45–54",  "#fb923c", "Под средното"],
    ["0–44",   "#f87171", "Слабо"],
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 16,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        zIndex: 600,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "var(--font-display)" }}>
        Vital Score
      </div>
      {items.map(([range, color, label]) => (
        <div key={range} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "var(--text-muted)", width: 38 }}>{range}</span>
          <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
