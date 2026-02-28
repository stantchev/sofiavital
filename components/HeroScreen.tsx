"use client";

import { useEffect, useRef } from "react";

interface Props {
  onEnter: () => void;
}

export default function HeroScreen({ onEnter }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const btnRef       = useRef<HTMLButtonElement>(null);
  const tagsRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anime: any;

    async function run() {
      // Dynamically import animejs
      const mod = await import("animejs");
      anime = (mod as any).default ?? mod;

      if (!headingRef.current) return;

      // Split heading into word spans for stagger
      const words = headingRef.current.innerText.split(" ");
      headingRef.current.innerHTML = words
        .map((w) => `<span class="hero-word" style="display:inline-block;opacity:0;transform:translateY(28px)">${w}&nbsp;</span>`)
        .join("");

      const tl = anime.timeline({ easing: "easeOutExpo" });

      tl.add({
        targets: ".hero-word",
        opacity: [0, 1],
        translateY: [28, 0],
        delay: anime.stagger(60),
        duration: 700,
      })
        .add(
          {
            targets: subRef.current,
            opacity: [0, 1],
            translateY: [16, 0],
            duration: 600,
          },
          "-=300"
        )
        .add(
          {
            targets: tagsRef.current?.children ? Array.from(tagsRef.current.children) : [],
            opacity: [0, 1],
            translateY: [10, 0],
            delay: anime.stagger(80),
            duration: 400,
          },
          "-=200"
        )
        .add(
          {
            targets: btnRef.current,
            opacity: [0, 1],
            scale: [0.88, 1],
            duration: 500,
            easing: "easeOutBack",
          },
          "-=100"
        );

      // Floating particles
      anime({
        targets: ".hero-particle",
        translateY: () => anime.random(-20, 20),
        translateX: () => anime.random(-12, 12),
        opacity: () => [anime.random(0.1, 0.3), anime.random(0.4, 0.9)],
        duration: () => anime.random(2500, 4500),
        delay: () => anime.random(0, 1500),
        loop: true,
        direction: "alternate",
        easing: "easeInOutSine",
      });
    }

    run();
  }, []);

  const tags = [
    { icon: "💨", text: "Въздух" },
    { icon: "🌿", text: "Зеленина" },
    { icon: "🔊", text: "Шум" },
    { icon: "🚇", text: "Транспорт" },
    { icon: "📚", text: "Образование" },
    { icon: "🔥", text: "Топлинни острови" },
    { icon: "🏗️", text: "Застрояване" },
  ];

  // Generate particles
  const particles = Array.from({ length: 40 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top:  `${Math.random() * 100}%`,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.3 + 0.05,
  }));

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 30%, #091c38 0%, #03070f 65%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#0f1e3222 1px, transparent 1px), linear-gradient(90deg, #0f1e3222 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 80%)",
        }}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="hero-particle"
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "#34d399",
            opacity: p.opacity,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "20%", left: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "25%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ maxWidth: 680, width: "100%", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(6, 95, 70, 0.4)", border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: "var(--radius-full)", padding: "5px 14px", marginBottom: 36,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "pulse-dot 1.8s ease-in-out infinite", display: "inline-block" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#6ee7b7", letterSpacing: 1, fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
            Данни от Софияплан
          </span>
        </div>

        <h1
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4.5vw, 52px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}
        >
          Къде е най-добре да живея в София?
        </h1>

        <p
          ref={subRef}
          style={{
            fontSize: "clamp(14px, 1.8vw, 17px)",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 36px",
            opacity: 0,
          }}
        >
          Интерактивна карта на 24-те района по реални данни — въздух, зеленина,
          шум, транспорт, образование. Избери профила си, картата се оцветява за теб.
        </p>

        {/* Data tags */}
        <div
          ref={tagsRef}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 44 }}
        >
          {tags.map((t) => (
            <span
              key={t.text}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)", padding: "5px 12px",
                fontSize: 12, color: "var(--text-secondary)",
                opacity: 0,
              }}
            >
              <span>{t.icon}</span> {t.text}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          ref={btnRef}
          onClick={onEnter}
          style={{
            background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
            border: "none",
            borderRadius: "var(--radius-full)",
            color: "#022c22",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            letterSpacing: 0.3,
            padding: "14px 40px",
            cursor: "pointer",
            boxShadow: "0 0 48px rgba(52,211,153,0.25), 0 4px 20px rgba(0,0,0,0.5)",
            opacity: 0,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 64px rgba(52,211,153,0.35), 0 8px 24px rgba(0,0,0,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 48px rgba(52,211,153,0.25), 0 4px 20px rgba(0,0,0,0.5)";
          }}
        >
          Разгледай картата →
        </button>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 52 }}>
          {[["24", "района"], ["100+", "набора данни"], ["7", "показателя"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{n}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
