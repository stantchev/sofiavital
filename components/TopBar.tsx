"use client";

import { useState } from "react";
import Link from "next/link";
import { PROFILES } from "@/lib/data";
import {
  TbLayersLinked, TbAward, TbArrowLeft, TbChevronDown,
} from "react-icons/tb";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const activeProfile = PROFILES[profile];

  return (
    <header style={{
      height: 52,
      background: "rgba(7,13,26,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #0f1e32",
      display: "flex", alignItems: "center",
      padding: "0 14px", gap: 8,
      flexShrink: 0, zIndex: 600, position: "relative",
    }}>

      {/* ── Back to home ── */}
      <Link
        href="/"
        title="Начало"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          textDecoration: "none", color: "var(--text-muted)",
          padding: "5px 8px", borderRadius: "var(--radius-sm)",
          transition: "all 0.15s", flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-raised)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
      >
        <TbArrowLeft size={15} />
      </Link>

      {/* ── Logo ── */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 7, marginRight: 4 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#34d399", boxShadow: "0 0 8px #34d39988",
          animation: "pulse-dot 2s ease-in-out infinite", flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "Greengoth, var(--font-display)",
          fontSize: 16, fontWeight: 900,
          color: "var(--text-primary)", letterSpacing: "0.01em",
        }}>
          Sofia<span style={{ color: "#34d399" }}>Vital</span>
        </span>
      </Link>

      <div style={{ width: 1, height: 18, background: "var(--border-subtle)", flexShrink: 0 }} />

      {/* ── Profile selector ── */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setProfileOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: profileOpen ? "var(--bg-overlay)" : "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: "var(--radius-full)",
            color: "#34d399", fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            fontFamily: "var(--font-body)",
          }}
        >
          <span style={{ fontSize: 14 }}>{activeProfile.icon}</span>
          <span>{activeProfile.label}</span>
          <TbChevronDown
            size={13}
            style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          />
        </button>

        {profileOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            minWidth: 200, zIndex: 900,
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}>
            {Object.entries(PROFILES).map(([key, p]) => {
              const active = profile === key;
              return (
                <button
                  key={key}
                  onClick={() => { onProfileChange(key); setProfileOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 14px", background: active ? "rgba(52,211,153,0.08)" : "transparent",
                    border: "none", borderLeft: `2px solid ${active ? "#34d399" : "transparent"}`,
                    cursor: "pointer", transition: "all 0.12s", textAlign: "left",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-raised)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#34d399" : "var(--text-primary)" }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{p.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* ── Right actions ── */}
      <div style={{ display: "flex", gap: 6 }}>
        {([
          { key: "ranking", label: "Класация", Icon: TbAward,        active: showRanking, toggle: onToggleRanking },
          { key: "layers",  label: "Слоеве",   Icon: TbLayersLinked, active: showLayers,  toggle: onToggleLayers  },
        ] as const).map(({ key, label, Icon, active, toggle }) => (
          <button
            key={key}
            onClick={toggle}
            title={label}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px",
              background: active ? "rgba(52,211,153,0.1)" : "transparent",
              border: `1px solid ${active ? "rgba(52,211,153,0.3)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              color: active ? "#34d399" : "var(--text-muted)",
              fontSize: 12, cursor: "pointer", transition: "all 0.15s",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = active ? "rgba(52,211,153,0.1)" : "transparent"; e.currentTarget.style.color = active ? "#34d399" : "var(--text-muted)"; }}
          >
            <Icon size={14} />
            <span style={{ display: "none" }}>{label}</span>
            <span style={{ fontSize: 11 }}>{label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
