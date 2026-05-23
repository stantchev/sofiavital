"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SofiaHero() {
  const containerRef     = useRef<HTMLDivElement>(null);
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const grainCanvasRef   = useRef<HTMLCanvasElement>(null);
  const frameRef         = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  const timeRef          = useRef<number>(0);

  useEffect(() => {
    const canvas      = canvasRef.current!;
    const grainCanvas = grainCanvasRef.current!;
    const ctx         = canvas.getContext("2d")!;
    const grainCtx    = grainCanvas.getContext("2d")!;

    const density = " .:-=+*#%@";

    const params = {
      rotation:          0,
      atmosphereShift:   0,
      glitchIntensity:   0,
      glitchFrequency:   0,
    };

    // ── GSAP animations ─────────────────────────────────────────
    const tl1 = gsap.to(params, {
      rotation: Math.PI * 2,
      duration: 24,
      repeat: -1,
      ease: "none",
    });

    const tl2 = gsap.to(params, {
      atmosphereShift: 1,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    const tl3 = gsap.to(params, {
      glitchIntensity: 1,
      duration: 0.12,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      repeatDelay: Math.random() * 4 + 2,
    });

    const tl4 = gsap.to(params, {
      glitchFrequency: 1,
      duration: 0.06,
      repeat: -1,
      yoyo: true,
      ease: "none",
    });

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=200",
      scrub: 1,
      onUpdate: (self) => { scrollProgressRef.current = self.progress; },
    });

    // ── Film grain ───────────────────────────────────────────────
    const generateGrain = (w: number, h: number, intensity = 0.15) => {
      const imageData = grainCtx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const g = (Math.random() - 0.5) * intensity * 255;
        data[i] = data[i+1] = data[i+2] = Math.max(0, Math.min(255, 128 + g));
        data[i + 3] = Math.abs(g) * 3;
      }
      return imageData;
    };

    // ── Glitched orb ─────────────────────────────────────────────
    const drawOrb = (
      cx: number, cy: number, radius: number,
      hue: number, gi: number
    ) => {
      ctx.save();
      const glitch = Math.random() < 0.08 && gi > 0.5;
      const gOff   = glitch ? (Math.random() - 0.5) * 18 * gi : 0;

      if (glitch) {
        ctx.translate(gOff, gOff * 0.8);
        ctx.scale(1 + (Math.random() - 0.5) * 0.3 * gi, 1);
      }

      // Gradient orb — teal/green hues matching SofiaVital brand
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
      g.addColorStop(0,   `hsla(${hue+10}, 90%, 90%, 0.9)`);
      g.addColorStop(0.2, `hsla(${hue+20}, 80%, 70%, 0.65)`);
      g.addColorStop(0.5, `hsla(${hue},   60%, 40%, 0.35)`);
      g.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bright core
      ctx.fillStyle = `hsla(${hue+20}, 100%, 95%, 0.75)`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Glitch effects
      if (glitch) {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `hsla(150, 100%, 50%, ${0.5 * gi})`;
        ctx.beginPath(); ctx.arc(cx + gOff * 0.5, cy, radius * 0.28, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `hsla(200, 100%, 50%, ${0.4 * gi})`;
        ctx.beginPath(); ctx.arc(cx - gOff * 0.5, cy, radius * 0.28, 0, Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = `rgba(52,211,153, ${0.6 * gi})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const y = cy - radius + Math.random() * radius * 2;
          ctx.beginPath();
          ctx.moveTo(cx - radius + Math.random() * 20, y);
          ctx.lineTo(cx + radius - Math.random() * 20, y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(52, 211, 153, ${0.35 * gi})`;
        for (let i = 0; i < 3; i++) {
          const bx = cx - radius + Math.random() * radius * 2;
          const by = cy - radius + Math.random() * radius * 2;
          ctx.fillRect(bx, by, Math.random() * 10 + 2, Math.random() * 6 + 1);
        }
      }

      // Outer ring
      ctx.strokeStyle = `hsla(${hue+20}, 80%, 65%, 0.55)`;
      ctx.lineWidth = 1.5;
      if (glitch) {
        for (let i = 0; i < 8; i++) {
          const sa = (i / 8) * Math.PI * 2;
          const ea = ((i + 1) / 8) * Math.PI * 2;
          const r  = radius * 1.2 + (Math.random() - 0.5) * 10 * gi;
          ctx.beginPath(); ctx.arc(cx, cy, r, sa, ea); ctx.stroke();
        }
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.restore();
    };

    // ── Render loop ──────────────────────────────────────────────
    function render() {
      timeRef.current += 0.016;
      const t = timeRef.current;

      const W = canvas.width = grainCanvas.width = window.innerWidth;
      const H = canvas.height = grainCanvas.height = window.innerHeight;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * 0.19;

      // Atmospheric bg — shifted to green/teal palette
      const hue = 155 + params.atmosphereShift * 45;
      const bg  = ctx.createRadialGradient(cx, cy - 60, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0,   `hsla(${hue+40}, 70%, 55%, 0.35)`);
      bg.addColorStop(0.3, `hsla(${hue},   55%, 35%, 0.25)`);
      bg.addColorStop(0.6, `hsla(${hue-20}, 35%, 15%, 0.18)`);
      bg.addColorStop(1,   "rgba(0,0,0,0.92)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawOrb(cx, cy, R, hue, params.glitchIntensity);

      // ASCII sphere
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const sp   = 9;
      const cols = Math.min(Math.floor(W / sp), 160);
      const rows = Math.min(Math.floor(H / sp), 110);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x  = (i - cols / 2) * sp + cx;
          const y  = (j - rows / 2) * sp + cy;
          const dx = x - cx, dy = y - cy;
          const d  = Math.sqrt(dx*dx + dy*dy);

          if (d < R && Math.random() > 0.42) {
            const z  = Math.sqrt(Math.max(0, R*R - dx*dx - dy*dy));
            const rz = dx * Math.sin(params.rotation) + z * Math.cos(params.rotation);
            const br = (rz + R) / (R * 2);

            if (rz > -R * 0.3) {
              let ch = density[Math.floor(br * (density.length - 1))];
              if (d < R*0.8 && params.glitchIntensity > 0.8 && Math.random() < 0.28) {
                const gc = ["█","▓","▒","░","▄","▀","■","□"];
                ch = gc[Math.floor(Math.random() * gc.length)];
              }
              ctx.fillStyle = `rgba(52,211,153, ${Math.max(0.15, br * 0.9)})`;
              ctx.fillText(ch, x, y);
            }
          }
        }
      }

      // Film grain
      grainCtx.clearRect(0, 0, W, H);
      const gi  = 0.20 + Math.sin(t * 10) * 0.025;
      grainCtx.putImageData(generateGrain(W, H, gi), 0, 0);

      grainCtx.globalCompositeOperation = "screen";
      const dots = params.glitchIntensity > 0.5 ? 280 : 100;
      for (let i = 0; i < dots; i++) {
        const op = Math.random() * (params.glitchIntensity > 0.5 ? 0.45 : 0.28);
        grainCtx.fillStyle = `rgba(52,211,153, ${op})`;
        grainCtx.beginPath();
        grainCtx.arc(Math.random()*W, Math.random()*H, Math.random()*2+0.5, 0, Math.PI*2);
        grainCtx.fill();
      }

      frameRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      tl1.kill(); tl2.kill(); tl3.kill(); tl4.kill();
      st.kill();
    };
  }, []);

  const sp = scrollProgressRef.current;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#000" }}>

      {/* ── Canvas ────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, width: "100%", height: "100vh" }}>
        <canvas ref={canvasRef}      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#000" }} />
        <canvas ref={grainCanvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.55 }} />

        {/* ── Hero text ──────────────────────────────────────── */}
        <div style={{
          position: "absolute", bottom: "16%", left: 0, right: 0, zIndex: 50,
          pointerEvents: "none", textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-gothic, 'Greengoth', 'Syne', sans-serif)",
            fontSize: "clamp(3.5rem, 14vw, 11rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 0.85,
            letterSpacing: "-0.01em",
            textShadow: "0 0 60px rgba(52,211,153,0.4), 0 0 120px rgba(52,211,153,0.15)",
            filter: "contrast(1.1)",
          }}>
            SOFIA
          </div>
          <div style={{
            fontFamily: "var(--font-gothic, 'Greengoth', 'Syne', sans-serif)",
            fontSize: "clamp(2rem, 7vw, 5.5rem)",
            fontWeight: 900,
            color: "#34d399",
            lineHeight: 1,
            letterSpacing: "0.12em",
            textShadow: "0 0 40px rgba(52,211,153,0.6)",
            marginTop: "0.1em",
          }}>
            VITAL
          </div>
        </div>

        {/* ── Left caption ───────────────────────────────────── */}
        <div style={{ position: "absolute", left: "2rem", top: "42%", zIndex: 50, maxWidth: 160 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#fff", lineHeight: 1.6, letterSpacing: "0.8px", textTransform: "uppercase", opacity: 0.7 }}>
            Реални данни<br />
            от Sofiaplan<br />
            за всеки район
          </div>
        </div>

        {/* ── Right caption ──────────────────────────────────── */}
        <div style={{ position: "absolute", right: "2rem", top: "42%", zIndex: 50, maxWidth: 160, textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#fff", lineHeight: 1.6, letterSpacing: "0.8px", textTransform: "uppercase", opacity: 0.7 }}>
            24 района<br />
            10 показателя<br />
            700+ квартала
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────── */}
        <div style={{ position: "absolute", bottom: "6%", left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", gap: 16 }}>
          <Link href="/map" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #34d399, #059669)",
            color: "#022c22", fontSize: 13, fontWeight: 700,
            fontFamily: "var(--font-display)",
            padding: "12px 28px", borderRadius: 999,
            textDecoration: "none", letterSpacing: 0.3,
            boxShadow: "0 0 40px rgba(52,211,153,0.3), 0 4px 16px rgba(0,0,0,0.5)",
          }}>
            Отвори картата →
          </Link>
          <a href="#features" style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)", fontSize: 13,
            padding: "12px 24px", borderRadius: 999, textDecoration: "none",
            backdropFilter: "blur(8px)",
          }}>
            Как работи
          </a>
        </div>

        {/* ── Bottom credit ──────────────────────────────────── */}
        <div style={{ position: "absolute", bottom: "2%", left: "2rem", zIndex: 50 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>
            Данни © Sofiaplan · Столична община
          </div>
        </div>
      </div>
    </div>
  );
}
