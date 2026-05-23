"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  District, Weights, calcPersonalScore, scoreColor, scoreLabel,
  INDICATOR_LABELS, IndicatorKey,
} from "@/lib/data";
import { KvartalScore, fetchScoringDatasets, scoreKvartal, DatasetCache } from "@/lib/spatialScore";
import {
  TbX, TbChartBar, TbMapPin, TbAward, TbWind, TbTrees,
  TbTrain, TbSchool, TbBabyCarriage, TbBike, TbDropletHalf2,
  TbBuildingFactory2, TbVolume2, TbTemperature, TbArrowUpRight,
  TbChevronRight,
} from "react-icons/tb";

interface Props {
  district: District;
  weights: Weights;
  onClose: () => void;
}

// ── Icon map for indicators ───────────────────────────────────────────────────
const INDICATOR_ICONS: Record<IndicatorKey, React.ElementType> = {
  air:           TbWind,
  green:         TbTrees,
  transit:       TbTrain,
  schools:       TbSchool,
  noise:         TbVolume2,
  heat:          TbTemperature,
  build:         TbBuildingFactory2,
  kindergartens: TbBabyCarriage,
  cycling:       TbBike,
  flood:         TbDropletHalf2,
};

// ── Animated bar ──────────────────────────────────────────────────────────────
function Bar({ label, value, weight, color, iconKey }: {
  label: string; value: number; weight: number; color: string; iconKey: IndicatorKey;
}) {
  const [width, setWidth] = useState(0);
  const Icon = INDICATOR_ICONS[iconKey];

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 60);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={12} color={color} />
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {label}
            {weight > 0 && <span style={{ color: "var(--text-muted)", fontSize: 9, marginLeft: 4 }}>{Math.round(weight * 100)}%</span>}
          </span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-display)" }}>{value}</span>
      </div>
      <div style={{ height: 3, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          borderRadius: 2, transition: "width 0.65s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, color, size = 34 }: { target: number; color: string; size?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = Math.ceil(target / 28);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setValue(target); clearInterval(t); } else setValue(v);
    }, 18);
    return () => clearInterval(t);
  }, [target]);
  return <span style={{ fontSize: size, fontWeight: 800, color, fontFamily: "Greengoth, var(--font-display)", lineHeight: 1 }}>{value}</span>;
}

// ── Kvartal ranking list ──────────────────────────────────────────────────────
function KvartalRanking({ districtId, weights }: { districtId: string; weights: Weights }) {
  const [scores, setScores]   = useState<KvartalScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const cacheRef = useRef<DatasetCache | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      // Fetch district boundaries + kvartal data
      const [distRes, kvRes] = await Promise.all([
        fetch("/api/sofiaplan/datasets/350"),
        fetch("/api/sofiaplan/datasets/297"),
      ]);
      if (!distRes.ok || !kvRes.ok) throw new Error("network");
      const [distGj, kvGj] = await Promise.all([distRes.json(), kvRes.json()]);

      // Point-in-polygon filter (same as MapView)
      const CYR_TO_ID: Record<string, string> = {
        "БАНКЯ":"bankya","ВИТОША":"vitosha","ВРЪБНИЦА":"vrabnitsa","ВЪЗРАЖДАНЕ":"vazrazhdane",
        "ИЛИНДЕН":"ilinden","ИСКЪР":"iskar","ИЗГРЕВ":"izgrev","КРАСНА ПОЛЯНА":"krasna_pol",
        "КРАСНО СЕЛО":"krasno_selo","КРЕМИКОВЦИ":"kremikovtsi","ЛОЗЕНЕЦ":"lozenets","ЛЮЛИН":"lyulin",
        "МЛАДОСТ":"mladost","НАДЕЖДА":"nadezhda","НОВИ ИСКЪР":"novi_iskar","ОБОРИЩЕ":"oborishte",
        "ОВЧА КУПЕЛ":"ovcha_kupel","ПАНЧАРЕВО":"pancharevo","ПОДУЯНЕ":"poduyane","СЕРДИКА":"serdika",
        "СЛАТИНА":"slatina","СРЕДЕЦ":"sredets","СТУДЕНТСКИ":"studentski","ТРИАДИЦА":"triaditza",
      };

      const distFeature = distGj.features.find((f: any) =>
        CYR_TO_ID[(f.properties?.obns_cyr ?? "").trim().toUpperCase()] === districtId
      );
      if (!distFeature) throw new Error("district not found");

      // Get outer rings for PIP
      const outerRings = (g: any): number[][][] => {
        const r: number[][][] = [];
        if (g.type === "Polygon") r.push(g.coordinates[0]);
        else if (g.type === "MultiPolygon") g.coordinates.forEach((p: number[][][]) => r.push(p[0]));
        return r;
      };
      const pip = (px: number, py: number, ring: number[][]): boolean => {
        let inside = false; const n = ring.length;
        for (let i = 0, j = n-1; i < n; j = i++) {
          const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
          if ((yi > py) !== (yj > py) && px < ((xj-xi)*(py-yi))/(yj-yi)+xi) inside = !inside;
        }
        return inside;
      };
      const allCoords = (g: any): number[][] => {
        const r: number[][] = [];
        const collect = (a: any) => { if (typeof a[0] === "number") r.push(a); else a.forEach(collect); };
        collect(g.coordinates); return r;
      };
      const distRings = outerRings(distFeature.geometry);

      const filtered = kvGj.features.filter((f: any) => {
        const coords = allCoords(f.geometry); if (!coords.length) return false;
        const lats = coords.map((c: number[]) => c[1]), lons = coords.map((c: number[]) => c[0]);
        const clat = (Math.min(...lats)+Math.max(...lats))/2;
        const clon = (Math.min(...lons)+Math.max(...lons))/2;
        return distRings.some(ring => pip(clon, clat, ring));
      });

      // Fetch scoring datasets (cached)
      if (!cacheRef.current) cacheRef.current = await fetchScoringDatasets();

      // Score each kvartal
      const scored = filtered
        .map((f: any) => scoreKvartal(f, cacheRef.current!, weights))
        .filter((s: KvartalScore | null): s is KvartalScore => s !== null)
        .sort((a: KvartalScore, b: KvartalScore) => b.vitals - a.vitals);

      setScores(scored);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [districtId, weights]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ padding: "24px 0", textAlign: "center" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #34d399", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 10px" }} />
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Изчислява се...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || scores.length === 0) return (
    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
      Няма данни за квартали
    </div>
  );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      {/* Summary stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        {[
          { label: "Квартала", value: scores.length },
          { label: "Топ score", value: scores[0]?.vitals ?? 0 },
          { label: "Среден", value: Math.round(scores.reduce((s, k) => s + k.vitals, 0) / scores.length) },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center", background: "var(--bg-raised)", borderRadius: 8, padding: "8px 4px" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#34d399", fontFamily: "Greengoth, var(--font-display)", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Ranked list */}
      {scores.map((kv, i) => {
        const col    = scoreColor(kv.vitals);
        const clean  = kv.kvname.replace(/^(ж\.к\.|кв\.|с\.|С\.) /i, "").trim();
        return (
          <div
            key={kv.kvname}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 16px",
              borderBottom: "1px solid var(--border-subtle)",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-raised)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ width: 22, fontSize: i < 3 ? 14 : 11, textAlign: "center", flexShrink: 0, color: i < 3 ? undefined : "var(--text-faint)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
              {i < 3 ? medals[i] : `${i + 1}`}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {clean}
              </div>
              {/* Mini bar */}
              <div style={{ height: 2, background: "var(--bg-raised)", borderRadius: 1, marginTop: 4, overflow: "hidden" }}>
                <div style={{ width: `${kv.vitals}%`, height: "100%", background: col, borderRadius: 1, transition: "width 0.5s ease" }} />
              </div>
            </div>

            <span style={{ fontSize: 13, fontWeight: 700, color: col, fontFamily: "var(--font-display)", flexShrink: 0 }}>{kv.vitals}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
type PanelTab = "overview" | "kvartali";

export default function DistrictPanel({ district, weights, onClose }: Props) {
  const panelRef      = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<PanelTab>("overview");
  const personalScore = calcPersonalScore(district, weights);

  // Slide-in animation
  useEffect(() => {
    if (!panelRef.current) return;
    panelRef.current.style.transform = "translateX(20px)";
    panelRef.current.style.opacity   = "0";
    requestAnimationFrame(() => setTimeout(() => {
      if (!panelRef.current) return;
      panelRef.current.style.transition = "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease";
      panelRef.current.style.transform  = "translateX(0)";
      panelRef.current.style.opacity    = "1";
    }, 10));
  }, [district.id]);

  // Reset tab on district change
  useEffect(() => { setTab("overview"); }, [district.id]);

  const indicators = Object.entries(INDICATOR_LABELS) as [IndicatorKey, string][];
  const strengths  = indicators.filter(([k]) => (district[k] as number) >= 75);
  const warnings   = indicators.filter(([k]) => (district[k] as number) < 55);
  const pCol       = scoreColor(personalScore);
  const sCol       = scoreColor(district.score);

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: 310,
        background: "rgba(7,13,26,0.96)",
        backdropFilter: "blur(16px)",
        borderLeft: "1px solid #0f1e32",
        zIndex: 800, display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: "16px 16px 0", flexShrink: 0 }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TbMapPin size={14} color="#34d399" />
            <div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-display)" }}>Район</div>
              <h2 style={{ fontFamily: "Greengoth, var(--font-display)", fontSize: 20, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1 }}>
                {district.name}
              </h2>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                {district.pop.toLocaleString("bg-BG")} жители
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "var(--radius-sm)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-overlay)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <TbX size={14} />
          </button>
        </div>

        {/* Score cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {([
            { label: "Vital Score",  val: district.score, col: sCol, icon: TbAward },
            { label: "За теб",       val: personalScore,  col: pCol, icon: TbChartBar },
          ] as const).map(({ label, val, col, icon: Icon }) => (
            <div key={label} style={{
              background: `${col}0a`,
              border: `1px solid ${col}22`,
              borderRadius: "var(--radius-md)", padding: "10px",
              textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <Icon size={11} color={col} />
                <span style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.7, fontFamily: "var(--font-display)" }}>{label}</span>
              </div>
              <Counter target={val} color={col} size={30} />
              <div style={{ fontSize: 9, color: col, marginTop: 3 }}>{scoreLabel(val)}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 0 }}>
          {([
            { id: "overview",  label: "Показатели", icon: TbChartBar },
            { id: "kvartali",  label: "Квартали",   icon: TbMapPin },
          ] as const).map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "7px 8px",
                  background: active ? "rgba(52,211,153,0.1)" : "transparent",
                  border: "none",
                  borderBottom: `2px solid ${active ? "#34d399" : "transparent"}`,
                  color: active ? "#34d399" : "var(--text-muted)",
                  fontSize: 11, fontWeight: active ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border-subtle)", flexShrink: 0 }} />

      {/* ── Overview tab ── */}
      {tab === "overview" && (
        <div style={{ overflowY: "auto", flex: 1, padding: "14px 16px" }}>
          {/* Indicators */}
          {indicators.map(([key, label]) => (
            <Bar
              key={key}
              iconKey={key}
              label={label}
              value={district[key] as number}
              weight={weights[key] ?? 0}
              color={scoreColor(district[key] as number)}
            />
          ))}

          {/* Chips */}
          <div style={{ marginTop: 16 }}>
            {strengths.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 7, fontFamily: "var(--font-display)" }}>Силни страни</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {strengths.map(([k, label]) => (
                    <span key={k} style={{ background: "rgba(6,95,70,0.3)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.2)", fontSize: 9, padding: "3px 8px", borderRadius: "var(--radius-full)" }}>
                      ✓ {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {warnings.length > 0 && (
              <div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 7, fontFamily: "var(--font-display)" }}>Слаби места</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {warnings.map(([k, label]) => (
                    <span key={k} style={{ background: "rgba(120,53,15,0.3)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)", fontSize: 9, padding: "3px 8px", borderRadius: "var(--radius-full)" }}>
                      ⚠ {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick action */}
          <button
            onClick={() => setTab("kvartali")}
            style={{
              width: "100%", marginTop: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px",
              background: "rgba(52,211,153,0.06)",
              border: "1px solid rgba(52,211,153,0.18)",
              borderRadius: "var(--radius-md)",
              color: "#34d399", fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(52,211,153,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(52,211,153,0.06)"}
          >
            <TbMapPin size={13} />
            Виж класация на квартали
            <TbChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Kvartali tab ── */}
      {tab === "kvartali" && (
        <KvartalRanking districtId={district.id} weights={weights} />
      )}
    </div>
  );
}
