"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DISTRICTS, PROFILES, LAYERS, Weights, IndicatorKey, District,
  calcPersonalScore, scoreColor, scoreLabel, INDICATOR_LABELS,
} from "@/lib/data";
import {
  TbMapPin, TbAward, TbLayersLinked, TbBrandGoogleMaps,
  TbArrowLeft, TbX, TbChevronDown, TbChevronUp,
  TbWind, TbTrees, TbTrain, TbSchool, TbVolume2, TbTemperature,
  TbBabyCarriage, TbBike, TbDropletHalf2, TbBuildingFactory2,
} from "react-icons/tb";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type Tab = "map" | "ranking" | "layers" | "chat";

const INDICATOR_ICONS: Record<string, React.ElementType> = {
  air: TbWind, green: TbTrees, transit: TbTrain, schools: TbSchool,
  noise: TbVolume2, heat: TbTemperature, build: TbBuildingFactory2,
  kindergartens: TbBabyCarriage, cycling: TbBike, flood: TbDropletHalf2,
};

// ── Mobile Hero ───────────────────────────────────────────────────────────────
function MobileHero({ onEnter }: { onEnter: () => void }) {
  const tags = ["💨 Въздух", "🌿 Зеленина", "🚇 Транспорт", "📚 Образование", "🚲 Велосипеди", "🌊 Наводнения"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden",
      background: "radial-gradient(ellipse 100% 70% at 50% 20%, #091c38 0%, #03070f 70%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 24px",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(#0f1e3218 1px, transparent 1px), linear-gradient(90deg, #0f1e3218 1px, transparent 1px)",
        backgroundSize: "36px 36px",
        maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 0%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 0%, transparent 80%)",
      }} />

      <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(6,95,70,0.4)", border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: 999, padding: "5px 14px", marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "#6ee7b7", letterSpacing: 1, fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
            Данни от Sofiaplan
          </span>
        </div>

        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            fontFamily: "Greengoth, var(--font-display)",
            fontSize: "clamp(32px, 10vw, 52px)",
            fontWeight: 900, color: "#e8f0fe",
            letterSpacing: "-0.01em", lineHeight: 1, marginBottom: 6,
          }}>
            Sofia<span style={{ color: "#34d399" }}>Vital</span>
          </div>
        </Link>

        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(15px, 4vw, 20px)",
          fontWeight: 600, color: "#7a9ab8", lineHeight: 1.4,
          letterSpacing: "-0.01em", margin: "0 0 18px",
        }}>
          Кой квартал е най-добър за теб?
        </h1>

        <p style={{ fontSize: "clamp(12px, 3vw, 14px)", color: "#3d5470", lineHeight: 1.65, margin: "0 0 28px" }}>
          Интерактивна карта на 24 района и 700+ квартала по реални данни.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 32 }}>
          {tags.map(t => (
            <span key={t} style={{
              background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)",
              borderRadius: 999, padding: "4px 11px", fontSize: 11, color: "var(--text-muted)",
            }}>{t}</span>
          ))}
        </div>

        <button
          onClick={onEnter}
          style={{
            width: "100%", maxWidth: 320,
            background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
            border: "none", borderRadius: 999,
            color: "#022c22", fontSize: 15, fontWeight: 700,
            fontFamily: "var(--font-display)", letterSpacing: 0.3,
            padding: "14px 0", cursor: "pointer",
            boxShadow: "0 0 40px rgba(52,211,153,0.25), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          Разгледай картата →
        </button>

        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 32 }}>
          {[["24","района"],["700+","квартала"],["10","показателя"]].map(([n,l], i) => (
            <div key={l} style={{ textAlign: "center", padding: "0 18px", borderRight: i < 2 ? "1px solid var(--border-subtle)" : "none" }}>
              <div style={{ fontFamily: "Greengoth, var(--font-display)", fontSize: 20, fontWeight: 900, color: "#e8f0fe" }}>{n}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Bottom Navigation ─────────────────────────────────────────────────────────
const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "map",     icon: TbBrandGoogleMaps, label: "Карта" },
  { id: "ranking", icon: TbAward,           label: "Класация" },
  { id: "layers",  icon: TbLayersLinked,    label: "Слоеве" },
];

function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(7,13,26,0.97)", backdropFilter: "blur(16px)",
      borderTop: "1px solid #0f1e32",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {TABS.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "10px 0 8px", background: "none", border: "none",
            cursor: "pointer", gap: 4, position: "relative",
          }}>
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "25%", right: "25%", height: 2,
                background: "#34d399", borderRadius: "0 0 2px 2px",
              }} />
            )}
            <Icon size={22} color={isActive ? "#34d399" : "#3d5470"} />
            <span style={{ fontSize: 10, color: isActive ? "#34d399" : "#3d5470", fontFamily: "var(--font-body)", letterSpacing: 0.2 }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Profile pills ─────────────────────────────────────────────────────────────
function ProfilePills({ profile, onChange }: { profile: string; onChange: (p: string) => void }) {
  return (
    <div style={{
      display: "flex", gap: 7, overflowX: "auto", padding: "8px 14px",
      background: "rgba(7,13,26,0.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #0f1e32", scrollbarWidth: "none", flexShrink: 0,
    }}>
      {Object.entries(PROFILES).map(([key, p]) => {
        const active = profile === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 12px",
            background: active ? "rgba(52,211,153,0.1)" : "var(--bg-raised)",
            border: `1px solid ${active ? "rgba(52,211,153,0.3)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-full)",
            color: active ? "#34d399" : "var(--text-muted)",
            fontSize: 12, fontWeight: active ? 600 : 400,
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}>
            <span>{p.icon}</span><span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── District bottom sheet ─────────────────────────────────────────────────────
type SheetTab = "overview" | "kvartali";

function DistrictSheet({ district, weights, onClose }: {
  district: District; weights: Weights; onClose: () => void;
}) {
  const sheetRef   = useRef<HTMLDivElement>(null);
  const handleRef  = useRef<HTMLDivElement>(null);
  const startY     = useRef(0);
  const currentY   = useRef(0);
  const [tab, setTab] = useState<SheetTab>("overview");
  const [expanded, setExpanded] = useState(false);
  const personalScore = calcPersonalScore(district, weights);

  useEffect(() => {
    setTab("overview");
    setExpanded(false);
    if (!sheetRef.current) return;
    sheetRef.current.style.transform = "translateY(100%)";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!sheetRef.current) return;
      sheetRef.current.style.transition = "transform 0.35s cubic-bezier(0.16,1,0.3,1)";
      sheetRef.current.style.transform  = "translateY(0)";
    }));
  }, [district.id]);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle || !sheetRef.current) return;
    const onStart = (e: TouchEvent) => { startY.current = e.touches[0].clientY; currentY.current = 0; if (sheetRef.current) sheetRef.current.style.transition = "none"; };
    const onMove  = (e: TouchEvent) => { const dy = e.touches[0].clientY - startY.current; currentY.current = dy; if (sheetRef.current && dy > 0) sheetRef.current.style.transform = `translateY(${dy}px)`; };
    const onEnd   = () => {
      if (!sheetRef.current) return;
      sheetRef.current.style.transition = "transform 0.3s cubic-bezier(0.16,1,0.3,1)";
      if (currentY.current > 80) { sheetRef.current.style.transform = "translateY(100%)"; setTimeout(onClose, 320); }
      else sheetRef.current.style.transform = "translateY(0)";
    };
    handle.addEventListener("touchstart", onStart, { passive: true });
    handle.addEventListener("touchmove",  onMove,  { passive: true });
    handle.addEventListener("touchend",   onEnd);
    return () => { handle.removeEventListener("touchstart", onStart); handle.removeEventListener("touchmove", onMove); handle.removeEventListener("touchend", onEnd); };
  }, [onClose]);

  const indicators = Object.entries(INDICATOR_LABELS) as [IndicatorKey, string][];
  const sCol       = scoreColor(district.score);
  const pCol       = scoreColor(personalScore);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 850, backdropFilter: "blur(2px)" }} />
      <div ref={sheetRef} style={{
        position: "fixed", bottom: 56, left: 0, right: 0, zIndex: 860,
        background: "rgba(7,13,26,0.98)", backdropFilter: "blur(20px)",
        borderRadius: "20px 20px 0 0",
        borderTop: "1px solid #1a2d47",
        maxHeight: expanded ? "90vh" : "60vh",
        display: "flex", flexDirection: "column",
        transition: "max-height 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Drag handle */}
        <div ref={handleRef} style={{ padding: "10px 0 4px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "grab", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#1a2d47" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "6px 16px 12px", borderBottom: "1px solid #0f1e32", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-display)", marginBottom: 2 }}>Район</div>
              <div style={{ fontFamily: "Greengoth, var(--font-display)", fontSize: 22, fontWeight: 900, color: "#e8f0fe", letterSpacing: "-0.01em", lineHeight: 1 }}>{district.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{district.pop.toLocaleString("bg-BG")} жители</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              {/* Score cards */}
              {([["Score", district.score, sCol], ["За теб", personalScore, pCol]] as const).map(([l, v, c]) => (
                <div key={l} style={{ background: `${c}0d`, border: `1px solid ${c}22`, borderRadius: 10, padding: "8px 10px", textAlign: "center", minWidth: 50 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: c, fontFamily: "Greengoth, var(--font-display)", lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
                  <div style={{ fontSize: 9, color: c, marginTop: 1 }}>{scoreLabel(v)}</div>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button onClick={() => setExpanded(e => !e)} style={{ width: 28, height: 28, borderRadius: 7, background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {expanded ? <TbChevronDown size={14} /> : <TbChevronUp size={14} />}
                </button>
                <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TbX size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {([
              { id: "overview",  label: "Показатели", icon: TbAward },
              { id: "kvartali",  label: "Квартали",   icon: TbMapPin },
            ] as const).map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "7px", background: active ? "rgba(52,211,153,0.1)" : "transparent",
                  border: "none", borderBottom: `2px solid ${active ? "#34d399" : "transparent"}`,
                  color: active ? "#34d399" : "var(--text-muted)",
                  fontSize: 11, fontWeight: active ? 600 : 400,
                  cursor: "pointer", fontFamily: "var(--font-body)",
                }}>
                  <Icon size={12} /> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {tab === "overview" && (
            <div style={{ padding: "12px 16px 24px" }}>
              {indicators.map(([key, label]) => {
                const val   = district[key] as number;
                const col   = scoreColor(val);
                const Icon  = INDICATOR_ICONS[key] ?? TbWind;
                const w     = weights[key] ?? 0;
                return (
                  <div key={key} style={{ marginBottom: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon size={11} color={col} />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          {label}
                          {w > 0 && <span style={{ fontSize: 9, color: "var(--text-muted)", marginLeft: 4 }}>{Math.round(w*100)}%</span>}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: col, fontFamily: "var(--font-display)" }}>{val}</span>
                    </div>
                    <div style={{ height: 3, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${val}%`, height: "100%", background: `linear-gradient(90deg, ${col}66, ${col})`, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}

              {/* Chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 14 }}>
                {indicators.filter(([k]) => (district[k] as number) >= 75).map(([k, label]) => (
                  <span key={k} style={{ background: "rgba(6,95,70,0.3)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.2)", fontSize: 9, padding: "2px 8px", borderRadius: 999 }}>
                    ✓ {label}
                  </span>
                ))}
                {indicators.filter(([k]) => (district[k] as number) < 55).map(([k, label]) => (
                  <span key={k} style={{ background: "rgba(120,53,15,0.3)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)", fontSize: 9, padding: "2px 8px", borderRadius: 999 }}>
                    ⚠ {label}
                  </span>
                ))}
              </div>

              <button onClick={() => setTab("kvartali")} style={{
                width: "100%", marginTop: 16,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px", background: "rgba(52,211,153,0.07)",
                border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10,
                color: "#34d399", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--font-body)",
              }}>
                <TbMapPin size={13} /> Виж класация на квартали →
              </button>
            </div>
          )}

          {tab === "kvartali" && (
            <div style={{ padding: "12px 0 80px" }}>
              <div style={{ padding: "8px 16px", color: "var(--text-muted)", fontSize: 11 }}>
                Spatial score на кварталите в {district.name} — зарежда се...
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
                <div style={{ width: 24, height: 24, border: "2px solid #34d399", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Ranking tab ───────────────────────────────────────────────────────────────
function RankingTab({ weights, profile, onSelect }: {
  weights: Weights; profile: string; onSelect: (d: District) => void;
}) {
  const ranked = [...DISTRICTS].map(d => ({ ...d, ps: calcPersonalScore(d, weights) })).sort((a,b) => b.ps - a.ps);
  const medals = ["🥇","🥈","🥉"];
  const p      = PROFILES[profile];
  const maxPts = ranked[0]?.ps ?? 100;

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #0f1e32" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-display)" }}>Класация</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{p.icon} {p.label}</div>
      </div>
      {ranked.map((d, i) => {
        const col = scoreColor(d.ps);
        return (
          <div key={d.id} onClick={() => onSelect(d)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            borderBottom: "1px solid #0f1e32", cursor: "pointer",
          }}
            onTouchStart={e => { e.currentTarget.style.background = "var(--bg-raised)"; }}
            onTouchEnd={e   => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ width: 24, fontSize: i < 3 ? 18 : 12, textAlign: "center", flexShrink: 0, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
              {i < 3 ? medals[i] : `${i+1}`}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 5 }}>{d.name}</div>
              <div style={{ height: 2, background: "#0f1e32", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ width: `${(d.ps/maxPts)*100}%`, height: "100%", background: `linear-gradient(90deg, ${col}55, ${col})`, borderRadius: 1 }} />
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: col, fontFamily: "Greengoth, var(--font-display)", lineHeight: 1 }}>{d.ps}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>{scoreLabel(d.ps)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Layers tab ────────────────────────────────────────────────────────────────
function LayersTab({ activeId, onToggle }: { activeId: string | null; onToggle: (id: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 80px" }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-display)", marginBottom: 12 }}>
        Слоеве данни
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {LAYERS.map(layer => {
          const active = activeId === layer.id;
          return (
            <button key={layer.id} onClick={() => onToggle(layer.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px 12px",
              background: active ? `${layer.color}12` : "var(--bg-raised)",
              border: `1px solid ${active ? layer.color + "44" : "var(--border-subtle)"}`,
              borderLeft: `3px solid ${active ? layer.color : "transparent"}`,
              borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)",
            }}>
              <span style={{ fontSize: 22 }}>{layer.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>{layer.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{layer.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Chat tab ──────────────────────────────────────────────────────────────────
interface ChatMsg { role: "user" | "assistant"; content: string; }
const SUGGESTED = [
  "Кой район е най-добър за семейство?",
  "Риск от наводнения — кои райони?",
  "Най-добра велосипедна мрежа?",
  "Сравни Лозенец и Младост",
];

function ChatTab() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput(""); setError(null);
    const newMsgs: ChatMsg[] = [...messages, { role: "user", content: q }];
    setMessages(newMsgs); setLoading(true);
    try {
      const res  = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Грешка."); setMessages(messages); return; }
      setMessages([...newMsgs, { role: "assistant", content: data.text }]);
      if (data.remaining !== undefined) setRemaining(data.remaining);
    } catch { setError("Няма връзка."); setMessages(messages); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #0f1e32", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "Greengoth, var(--font-display)" }}>Sofia<span style={{ color: "#34d399" }}>AI</span></div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Асистент за SofiaVital</div>
        </div>
        {remaining !== null && (
          <div style={{ marginLeft: "auto", fontSize: 10, color: remaining <= 2 ? "#fb923c" : "var(--text-muted)", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: 999, padding: "2px 8px" }}>
            {remaining} оставащи
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗺️</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "Greengoth, var(--font-display)", marginBottom: 6 }}>Питай за районите</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.5 }}>Анализирам 24 района по 10 показателя.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTED.map(q => (
                <button key={q} onClick={() => send(q)} style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", lineHeight: 1.4 }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 13px",
              borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              background: m.role === "user" ? "rgba(52,211,153,0.12)" : "var(--bg-raised)",
              border: `1px solid ${m.role === "user" ? "rgba(52,211,153,0.2)" : "var(--border-subtle)"}`,
              fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55, whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 3px", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", opacity: 0.6, animation: `pulse-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        {error && <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", fontSize: 12, color: "#f87171", textAlign: "center" }}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid #0f1e32", display: "flex", gap: 8, flexShrink: 0, paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}>
        <input
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Питай за район..." disabled={loading}
          style={{ flex: 1, background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-body)" }}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: input.trim() && !loading ? "linear-gradient(135deg, #34d399, #059669)" : "var(--bg-raised)",
          border: "1px solid var(--border-subtle)", cursor: input.trim() && !loading ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          color: input.trim() && !loading ? "#022c22" : "var(--text-faint)",
        }}>↑</button>
      </div>
    </div>
  );
}

// ── Custom weights sheet ──────────────────────────────────────────────────────
function CustomWeightsSheet({ weights, onChange, onClose }: {
  weights: Weights; onChange: (k: IndicatorKey, v: number) => void; onClose: () => void;
}) {
  const total = Object.values(weights).reduce((s,v) => s+v, 0);
  const keys  = Object.keys(INDICATOR_LABELS) as IndicatorKey[];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900 }} />
      <div style={{ position: "fixed", bottom: 56, left: 0, right: 0, zIndex: 910, background: "rgba(7,13,26,0.98)", backdropFilter: "blur(16px)", borderRadius: "20px 20px 0 0", borderTop: "1px solid #1a2d47", padding: "16px 18px 24px", maxHeight: "75vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#1a2d47", margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-display)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Тегла по избор</span>
          <span style={{ fontSize: 11, color: total > 1.02 || total < 0.98 ? "#fb923c" : "#34d399" }}>Сума: {Math.round(total*100)}%</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {keys.map(key => {
            const pct = Math.round(weights[key]*100);
            return (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{INDICATOR_LABELS[key]}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399", fontFamily: "var(--font-display)" }}>{pct}%</span>
                </div>
                <input type="range" min={0} max={50} value={pct} onChange={e => onChange(key, parseInt(e.target.value)/100)} style={{ width: "100%", accentColor: "#34d399" }} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Main Mobile Layout ────────────────────────────────────────────────────────
export default function MobileLayout() {
  const [showHero, setShowHero]             = useState(true);
  const [activeTab, setActiveTab]           = useState<Tab>("map");
  const [profile, setProfile]               = useState("family");
  const [customW, setCustomW]               = useState<Weights>(PROFILES.custom.weights);
  const [selectedDistrict, setSelected]     = useState<District | null>(null);
  const [activeLayer, setActiveLayer]       = useState<string | null>(null);
  const [showCustomWeights, setShowCustomW] = useState(false);

  const weights = profile === "custom" ? customW : PROFILES[profile].weights;

  const handleCustomWeight = useCallback((key: IndicatorKey, val: number) => {
    setCustomW(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleLayerToggle = useCallback((id: string) => {
    setActiveLayer(prev => prev === id ? null : id);
  }, []);

  const handleSelectDistrict = useCallback((d: District) => {
    setSelected(d); setActiveTab("map");
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab !== "map") setSelected(null);
  }, []);

  if (showHero) return <MobileHero onEnter={() => setShowHero(false)} />;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-base)", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)", overflow: "hidden" }}>

      {/* Profile pills — visible on map + ranking */}
      {(activeTab === "map" || activeTab === "ranking") && (
        <div style={{ flexShrink: 0, zIndex: 600 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ProfilePills profile={profile} onChange={p => { setProfile(p); if (p === "custom") setShowCustomW(true); }} />
            </div>
            {profile === "custom" && (
              <button onClick={() => setShowCustomW(true)} style={{ flexShrink: 0, padding: "0 12px", height: 42, background: "rgba(7,13,26,0.95)", border: "none", borderLeft: "1px solid #0f1e32", color: "#34d399", fontSize: 18, cursor: "pointer" }}>⚙</button>
            )}
          </div>
        </div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Map — always mounted */}
        <div style={{ position: "absolute", inset: 0, display: activeTab === "map" ? "block" : "none", zIndex: 1 }}>
          <MapView weights={weights} activeLayerId={activeLayer} selectedId={selectedDistrict?.id ?? null} onSelectDistrict={handleSelectDistrict} districts={DISTRICTS} />

          {!selectedDistrict && activeTab === "map" && (
            <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(7,13,26,0.88)", backdropFilter: "blur(10px)", border: "1px solid #1a2d47", borderRadius: 999, padding: "5px 14px", fontSize: 11, color: "var(--text-muted)", pointerEvents: "none", zIndex: 10, whiteSpace: "nowrap" }}>
              Докосни район за детайли
            </div>
          )}

          {/* Mobile legend — compact */}
          <div style={{ position: "absolute", bottom: 70, right: 12, background: "rgba(7,13,26,0.92)", backdropFilter: "blur(8px)", border: "1px solid #0f1e32", borderRadius: 10, padding: "7px 10px", zIndex: 10 }}>
            <div style={{ fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, fontFamily: "var(--font-display)" }}>Score</div>
            {[["#4ade80","75+"],["#86efac","65+"],["#fbbf24","55+"],["#f97316","45+"],["#f87171","<45"]].map(([c,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {activeTab === "ranking" && <RankingTab weights={weights} profile={profile} onSelect={handleSelectDistrict} />}
        {activeTab === "layers"  && <LayersTab activeId={activeLayer} onToggle={handleLayerToggle} />}
        {activeTab === "chat"    && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <ChatTab />
          </div>
        )}
      </div>

      {/* District sheet */}
      {selectedDistrict && activeTab === "map" && (
        <DistrictSheet district={selectedDistrict} weights={weights} onClose={() => setSelected(null)} />
      )}

      {/* Custom weights sheet */}
      {showCustomWeights && (
        <CustomWeightsSheet weights={customW} onChange={handleCustomWeight} onClose={() => setShowCustomW(false)} />
      )}

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
}
