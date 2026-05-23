"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  TbWind, TbTrees, TbTrain, TbSchool, TbVolume2, TbTemperature,
  TbBabyCarriage, TbBike, TbDropletHalf2, TbBuildingFactory2,
  TbMapPin, TbBrain, TbLayersLinked, TbDeviceMobile,
  TbChartBar, TbDatabase, TbShieldCheck, TbSparkles,
  TbArrowRight, TbChevronLeft, TbChevronRight, TbMenu, TbX,
  TbBrandGithub, TbBrandLinkedin, TbBrandX, TbMail, TbWorld,
} from "react-icons/tb";
import { District } from "@/lib/data";

interface Props {
  faqItems: { q: string; a: string }[];
  topDistricts: District[];
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  accent:      "#34d399",
  accentDim:   "rgba(52,211,153,0.12)",
  border:      "1px solid #0f1e32",
  borderAccent:"1px solid rgba(52,211,153,0.18)",
  card: {
    background: "linear-gradient(135deg, #070d1a 0%, #0a1525 100%)",
    border:     "1px solid #0f1e32",
    borderRadius: 16,
  },
};

const scoreColor = (s: number) =>
  s >= 75 ? "#34d399" : s >= 65 ? "#6ee7b7" : s >= 55 ? "#fbbf24" : s >= 45 ? "#fb923c" : "#f87171";

// ── useWindowWidth hook ────────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(1200);
  useEffect(() => {
    const upd = () => setW(window.innerWidth);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);
  return w;
}

// ── Responsive container ───────────────────────────────────────────────────────
function Container({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", ...style }}>
      {children}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHead({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <span style={{
        display: "inline-block", fontSize: 10,
        fontFamily: "var(--font-display)", fontWeight: 600,
        color: C.accent, textTransform: "uppercase", letterSpacing: "2.5px",
        background: C.accentDim, border: C.borderAccent,
        borderRadius: 999, padding: "4px 14px", marginBottom: 14,
      }}>{tag}</span>
      <h2 style={{
        fontFamily: "Greengoth, 'Syne', sans-serif",
        fontSize: "clamp(22px, 4vw, 40px)",
        fontWeight: 900, color: "#fff",
        letterSpacing: "-0.02em", margin: "0 0 12px", lineHeight: 1.1,
      }}>{title}</h2>
      {sub && <p style={{ fontSize: "clamp(13px, 2vw, 16px)", color: "#7a9ab8", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );
}

// ── Sticky Nav ─────────────────────────────────────────────────────────────────
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const w = useWidth();
  const isMobile = w < 640;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        padding: isMobile ? "1rem 1.25rem" : "1.2rem 2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(52,211,153,0.08)",
      }}>
        {/* Logo — links to / */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "Greengoth, 'Syne', sans-serif",
            fontSize: isMobile ? 17 : 20, fontWeight: 900,
            color: "#fff", letterSpacing: "0.02em",
          }}>
            Sofia<span style={{ color: "#34d399" }}>Vital</span>
          </span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "2rem", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" as const }}>
            {[["#features","Функции"],["#districts","Райони"],["#faq","FAQ"]].map(([href,label]) => (
              <a key={href} href={href} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>{label}</a>
            ))}
          </div>
        )}

        {/* CTA / hamburger */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/map" style={{
            background: "linear-gradient(135deg, #34d399, #059669)",
            color: "#022c22", fontSize: isMobile ? 11 : 11, fontWeight: 700,
            fontFamily: "var(--font-body)",
            padding: isMobile ? "6px 14px" : "7px 18px",
            borderRadius: 999, textDecoration: "none",
            letterSpacing: "0.5px", textTransform: "uppercase" as const,
          }}>
            {isMobile ? "Картата →" : "+ Отвори картата"}
          </Link>
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}>
              {menuOpen ? <TbX size={22} /> : <TbMenu size={22} />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 190,
          background: "rgba(7,13,26,0.98)", backdropFilter: "blur(16px)",
          borderBottom: C.border, padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 0,
        }}>
          {[["#features","Функции"],["#districts","Райони"],["#faq","FAQ"]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              color: "rgba(255,255,255,0.8)", textDecoration: "none",
              fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 500,
              padding: "14px 0", borderBottom: C.border,
              letterSpacing: "0.5px",
            }}>{label}</a>
          ))}
        </div>
      )}
    </>
  );
}

// ── Indicators ─────────────────────────────────────────────────────────────────
const INDICATORS = [
  { icon: TbWind,             label: "Въздух",         desc: "PM10 замърсяване 2018", color: "#38bdf8" },
  { icon: TbTrees,            label: "Зеленина",        desc: "Паркове и зелени площи", color: "#4ade80" },
  { icon: TbTrain,            label: "Транспорт",       desc: "Метро + трамваи", color: "#a78bfa" },
  { icon: TbSchool,           label: "Образование",     desc: "Училища и гимназии", color: "#fbbf24" },
  { icon: TbVolume2,          label: "Тишина",          desc: "Шумово замърсяване", color: "#34d399" },
  { icon: TbTemperature,      label: "Прохлада",        desc: "Топлинни острови", color: "#fb923c" },
  { icon: TbBabyCarriage,     label: "Детски градини",  desc: "Ясли и градини", color: "#f472b6" },
  { icon: TbBike,             label: "Велосипеди",      desc: "Веломрежа 2021", color: "#86efac" },
  { icon: TbDropletHalf2,     label: "Наводнения",      desc: "Риск от заливане", color: "#60a5fa" },
  { icon: TbBuildingFactory2, label: "Застрояване",     desc: "Строителни разрешения", color: "#94a3b8" },
];

function IndicatorsCarousel() {
  const w = useWidth();
  const visible = w < 480 ? 1 : w < 768 ? 2 : w < 1024 ? 3 : 4;
  const [idx, setIdx] = useState(0);
  const maxIdx = Math.max(0, INDICATORS.length - visible);

  useEffect(() => { setIdx(0); }, [visible]);

  const slide = (dir: number) => setIdx(i => Math.max(0, Math.min(maxIdx, i + dir)));

  return (
    <div>
      <div style={{ overflow: "hidden" }}>
        <div style={{
          display: "flex", gap: 12,
          transform: `translateX(calc(-${idx} * (100% / ${visible} + 3px)))`,
          transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {INDICATORS.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} style={{
              ...C.card,
              flexShrink: 0,
              width: `calc(${100 / visible}% - ${12 * (visible - 1) / visible}px)`,
              padding: "24px 20px",
              transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}44`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#0f1e32"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "#e8f0fe", marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 11, color: "#3d5470", lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {maxIdx > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24 }}>
          <button onClick={() => slide(-1)} disabled={idx === 0} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: idx === 0 ? "#070d1a" : C.accentDim,
            border: `1px solid ${idx === 0 ? "#0f1e32" : "rgba(52,211,153,0.25)"}`,
            color: idx === 0 ? "#1f3350" : C.accent,
            cursor: idx === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><TbChevronLeft size={17} /></button>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: maxIdx + 1 }, (_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 18 : 6, height: 6, borderRadius: 3,
                background: i === idx ? C.accent : "#1a2d47",
                border: "none", cursor: "pointer", transition: "all 0.25s", padding: 0,
              }} />
            ))}
          </div>
          <button onClick={() => slide(1)} disabled={idx === maxIdx} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: idx === maxIdx ? "#070d1a" : C.accentDim,
            border: `1px solid ${idx === maxIdx ? "#0f1e32" : "rgba(52,211,153,0.25)"}`,
            color: idx === maxIdx ? "#1f3350" : C.accent,
            cursor: idx === maxIdx ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><TbChevronRight size={17} /></button>
        </div>
      )}
    </div>
  );
}

// ── Features ───────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: TbMapPin,      title: "Кварталнo drill-down", desc: "Кликни на район — 50-100 квартала с индивидуален spatial score от реални данни.", color: "#34d399" },
  { icon: TbBrain,       title: "AI асистент",          desc: "Питай на български. 'Кой квартал е добър за алергик?' Powered by Google Gemini.", color: "#a78bfa" },
  { icon: TbLayersLinked,title: "10 слоя данни",        desc: "Метро, трамваи, паркове, въздух, топлинни острови, училища, детски градини.", color: "#60a5fa" },
  { icon: TbDeviceMobile,title: "Мобилна версия",       desc: "Bottom navigation, drag-to-dismiss sheets. Не просто responsive — изцяло преработен.", color: "#fbbf24" },
  { icon: TbChartBar,    title: "Spatial scoring",      desc: "Score за всеки квартал от паркова площ, метро разстояние, PM10, брой училища.", color: "#f472b6" },
  { icon: TbDatabase,    title: "12 реални datasets",   desc: "Данни от Sofiaplan — официалния отворен API на Столична община. Без догадки.", color: "#fb923c" },
];

// ── District card ──────────────────────────────────────────────────────────────
function DistrictCard({ d, rank }: { d: District; rank: number }) {
  const col    = scoreColor(d.score);
  const medals = ["🥇", "🥈", "🥉", "4.", "5."];

  return (
    <div style={{ ...C.card, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.2s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${col}33`}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#0f1e32"}
    >
      <span style={{ fontSize: rank < 3 ? 22 : 13, width: 28, textAlign: "center", flexShrink: 0, color: "#3d5470", fontFamily: "var(--font-display)", fontWeight: 700 }}>
        {medals[rank]}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 5, color: "#e8f0fe" }}>{d.name}</div>
        <div style={{ height: 3, background: "#0a1525", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${d.score}%`, height: "100%", background: `linear-gradient(90deg, ${col}66, ${col})`, borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: col, fontFamily: "Greengoth, 'Syne', sans-serif", lineHeight: 1 }}>{d.score}</div>
        <div style={{ fontSize: 9, color: "#3d5470", textTransform: "uppercase", letterSpacing: 0.8 }}>score</div>
      </div>
    </div>
  );
}

// ── FAQ accordion ──────────────────────────────────────────────────────────────
function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(({ q, a }, i) => (
        <div key={i} style={{ ...C.card, borderColor: open === i ? "rgba(52,211,153,0.2)" : "#0f1e32", overflow: "hidden", transition: "border-color 0.2s" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", background: "none", border: "none", padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontFamily: "var(--font-body)" }}
          >
            <span style={{ fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 600, color: "#e8f0fe", textAlign: "left" }}>{q}</span>
            <span style={{ fontSize: 20, color: C.accent, flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.25s", lineHeight: 1, fontWeight: 300 }}>+</span>
          </button>
          <div style={{ maxHeight: open === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
            <p style={{ fontSize: "clamp(12px, 2vw, 13px)", color: "#7a9ab8", lineHeight: 1.7, margin: 0, padding: "0 20px 16px" }}>{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Ticker ─────────────────────────────────────────────────────────────────────
const TICKER = ["24 РАЙОНА", "700+ КВАРТАЛА", "12 DATASETS", "SOFIAPLAN API", "AI АСИСТЕНТ", "SPATIAL SCORING", "РЕАЛНИ ДАННИ", "БЕЗПЛАТНО", "OPEN DATA", "МОБИЛНА ВЕРСИЯ", "10 ПОКАЗАТЕЛЯ", "SOFIA"];

function Ticker() {
  return (
    <div style={{ overflow: "hidden", borderTop: C.border, borderBottom: C.border, padding: "12px 0", background: "#03070f" }}>
      <div style={{ display: "flex", gap: 40, animation: "ticker 22s linear infinite", width: "max-content" }}>
        {[...TICKER, ...TICKER].map((item, i) => (
          <span key={i} style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 700, color: i % 3 === 0 ? C.accent : "#1a2d47", letterSpacing: "2px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
            {item}<span style={{ color: "#0f1e32", fontSize: 7 }}>◆</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
}


// ── Footer ────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { title: "Функции",  href: "#features" },
  { title: "Райони",   href: "#districts" },
  { title: "FAQ",      href: "#faq" },
  { title: "Картата",  href: "/map" },
  { title: "Sofiaplan",href: "https://sofiaplan.bg" },
  { title: "GitHub",   href: "https://github.com" },
];

const SOCIAL_LINKS = [
  { icon: TbBrandGithub,  label: "GitHub",     href: "https://github.com" },
  { icon: TbWorld,        label: "Sofiaplan",  href: "https://sofiaplan.bg" },
  { icon: TbBrandX,       label: "X / Twitter",href: "#" },
  { icon: TbBrandLinkedin,label: "LinkedIn",   href: "#" },
  { icon: TbMail,         label: "Email",      href: "mailto:hello@sofiavital.bg" },
];

function Footer({ isMobile, gutter }: { isMobile: boolean; gutter: string }) {
  return (
    <footer style={{ padding: "64px 0 32px", borderTop: C.border, background: "#020509" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: gutter }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
          <Link href="/" aria-label="Начало" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "Greengoth, 'Syne', sans-serif",
              fontSize: 28, fontWeight: 900, color: "#fff",
              letterSpacing: "0.02em",
              textShadow: "0 0 30px rgba(52,211,153,0.2)",
            }}>
              Sofia<span style={{ color: C.accent }}>Vital</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: isMobile ? "12px 20px" : "8px 32px", marginBottom: 36,
        }}>
          {NAV_LINKS.map(({ title, href }) => (
            <a
              key={title}
              href={href}
              style={{
                fontSize: 13, color: "#3d5470", textDecoration: "none",
                fontFamily: "var(--font-body)", transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#7a9ab8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#3d5470")}
            >
              {title}
            </a>
          ))}
        </div>

        {/* Social icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 36 }}>
          {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={label}
              style={{
                color: "#3d5470", textDecoration: "none",
                transition: "color 0.15s, transform 0.15s",
                display: "flex",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = C.accent;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "#3d5470";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Icon size={22} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p style={{
          textAlign: "center", fontSize: 12,
          color: "#1f3350", fontFamily: "var(--font-body)",
        }}>
          © {new Date().getFullYear()} SofiaVital. Данни:{" "}
          <a href="https://sofiaplan.bg" style={{ color: "#1f3350", textDecoration: "none" }}>Sofiaplan</a>
          {" "}·{" "}
          <a href="https://openstreetmap.org" style={{ color: "#1f3350", textDecoration: "none" }}>OpenStreetMap</a>
          {" "}· MIT License
        </p>
      </div>
    </footer>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function LandingSections({ faqItems, topDistricts }: Props) {
  const w       = useWidth();
  const isMobile = w < 640;
  const isTablet = w < 1024;

  const sectionPad = isMobile ? "64px 0" : "96px 0";
  const gutter     = isMobile ? "0 16px" : "0 24px";

  return (
    <>
      {/* Nav */}
      <Nav />

      {/* Ticker */}
      <Ticker />

      {/* ── Indicators ───────────────────────────────────────────────── */}
      <section id="features" style={{ padding: sectionPad, borderTop: C.border }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: gutter }}>
          <SectionHead
            tag="10 Показателя"
            title="Измерено, не предполагано"
            sub="Всеки показател идва от официален dataset на Sofiaplan — реални измервания."
          />
          <IndicatorsCarousel />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section style={{ padding: sectionPad, background: "#020509", borderTop: C.border }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: gutter }}>
          <SectionHead tag="Функционалности" title="Всичко за един клик" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: 14 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ ...C.card, padding: "24px 22px", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}33`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#0f1e32"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", color: "#e8f0fe", marginBottom: 7 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#3d5470", lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Profiles ─────────────────────────────────────────────────── */}
      <section style={{ padding: sectionPad, borderTop: C.border }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: gutter }}>
          <SectionHead
            tag="Профили"
            title="Картата се оцветява за теб"
            sub="Избери профил — или настрой 10-те тегла сам."
          />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
            {[
              { icon: "👨‍👩‍👧", label: "Семейство",      desc: "Детски градини · Училища · Зеленина", accent: "#34d399" },
              { icon: "💼", label: "Млад специалист", desc: "Транспорт · Велосипеди · Въздух",     accent: "#a78bfa" },
              { icon: "🌿", label: "Пенсионер",        desc: "Тишина · Въздух · Зеленина",         accent: "#60a5fa" },
              { icon: "⚙️", label: "По избор",          desc: "10 слайдера за пълен контрол",       accent: "#fbbf24" },
            ].map(({ icon, label, desc, accent }) => (
              <div key={label} style={{ ...C.card, padding: "22px 18px", borderLeft: `3px solid ${accent}44`, transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderLeftColor = accent; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderLeftColor = `${accent}44`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "#e8f0fe", marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: isMobile ? 10 : 11, color: "#3d5470", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Districts ─────────────────────────────────────────────────── */}
      <section id="districts" style={{ padding: sectionPad, background: "#020509", borderTop: C.border }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: gutter }}>
          <SectionHead tag="Класация" title="Топ 5 района по Vital Score" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topDistricts.map((d, i) => <DistrictCard key={d.id} d={d} rank={i} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/map" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: C.accent, border: "1px solid rgba(52,211,153,0.25)", borderRadius: 999, padding: "9px 22px", textDecoration: "none", fontFamily: "var(--font-body)" }}>
              Пълна класация в картата <TbArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Data sources ──────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "48px 0" : "64px 0", borderTop: C.border }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: gutter }}>
          <p style={{ textAlign: "center", fontSize: 10, color: "#3d5470", textTransform: "uppercase", letterSpacing: 2, fontFamily: "var(--font-display)", marginBottom: 32 }}>
            Доверени източници
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
            {[
              { icon: TbDatabase,    label: "Sofiaplan API",    sub: "api.sofiaplan.bg" },
              { icon: TbShieldCheck, label: "Столична община",  sub: "Официални данни" },
              { icon: TbMapPin,      label: "OpenStreetMap",    sub: "Картографски данни" },
              { icon: TbSparkles,    label: "Google Gemini",    sub: "AI асистент" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ background: "#070d1a", border: C.border, borderRadius: 12, padding: "18px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <Icon size={20} color="#34d399" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#e8f0fe" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "#3d5470", marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "72px 0" : "100px 0", borderTop: C.border, borderBottom: C.border, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: gutter, textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(6,95,70,0.3)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 999, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#6ee7b7", letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--font-display)" }}>
              Безплатно · Без регистрация · Без реклами
            </span>
          </div>
          <h2 style={{ fontFamily: "Greengoth, 'Syne', sans-serif", fontSize: "clamp(24px, 5vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.1 }}>
            Намери своя идеален квартал
          </h2>
          <p style={{ fontSize: "clamp(13px, 2vw, 16px)", color: "#7a9ab8", marginBottom: 36, lineHeight: 1.65 }}>
            Реални данни · Персонализиран score · Кварталнo ниво · AI асистент
          </p>
          <Link href="/map" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #34d399 0%, #059669 100%)", color: "#022c22", fontSize: "clamp(13px, 2vw, 15px)", fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: 0.3, padding: isMobile ? "12px 28px" : "14px 36px", borderRadius: 999, textDecoration: "none", boxShadow: "0 0 48px rgba(52,211,153,0.25), 0 4px 20px rgba(0,0,0,0.4)" }}>
            Отвори картата <TbArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: gutter }}>
          <SectionHead tag="FAQ" title="Чести въпроси" />
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Footer isMobile={isMobile} gutter={gutter} />
    </>
  );
}
