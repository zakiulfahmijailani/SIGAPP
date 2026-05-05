"use client";

import { useEffect, useState, useRef } from "react";
import { SekolahNTTFull, TIER_BG_COLORS_NTT, PriorityTierNTT } from "@/lib/types-ntt";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AntrigravityIntroProps {
  schools: SekolahNTTFull[];
  onComplete: () => void;
}

interface Particle {
  id: number;
  color: string;
  size: number;         // px
  angle: number;        // degrees, direction of travel
  distance: number;     // final translation distance in px
  duration: number;     // ms
  delay: number;        // ms
  x: number;           // spawn offset from center (px) for a tiny natural spread
  y: number;
}

// ─── Tier helper ──────────────────────────────────────────────────────────────

function getTierFromIndex(index: number | null): PriorityTierNTT {
  if (index === null) return "RENDAH";
  if (index >= 0.72) return "KRITIS";
  if (index >= 0.50) return "TINGGI";
  if (index >= 0.30) return "SEDANG";
  return "RENDAH";
}

// ─── Particle factory ─────────────────────────────────────────────────────────

function buildParticles(schools: SekolahNTTFull[], count: number): Particle[] {
  const tierColors = Object.values(TIER_BG_COLORS_NTT);

  // Pre-compute tier colors from the real school data so the distribution
  // mirrors the actual dataset (more red = more KRITIS schools in the data).
  const colorPool: string[] =
    schools.length > 0
      ? schools.map((s) => TIER_BG_COLORS_NTT[getTierFromIndex(s.sigapp_index)])
      : tierColors;

  return Array.from({ length: count }, (_, i) => {
    const color = colorPool[Math.floor(Math.random() * colorPool.length)];
    const angle = Math.random() * 360;
    const distance = 220 + Math.random() * 380; // 220–600 px from center
    const size = 5 + Math.random() * 8;         // 5–13 px

    return {
      id: i,
      color,
      size,
      angle,
      distance,
      duration: 900 + Math.random() * 900,      // 900–1800 ms travel time
      delay: Math.random() * 600,               // 0–600 ms stagger
      x: (Math.random() - 0.5) * 12,           // slight spawn jitter ±6 px
      y: (Math.random() - 0.5) * 12,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AntrigravityIntro({
  schools,
  onComplete,
}: AntrigravityIntroProps) {
  // Phases:
  //   idle        → initial black screen
  //   title       → "SIGAPP" fades in
  //   subtitle    → subtitle fades in below title
  //   region      → text swaps to "📍 Nusa Tenggara Timur"
  //   particles   → dots explode outward
  //   fadeout     → whole overlay fades out
  //   done        → component unmounts (onComplete fired)
  type Phase =
    | "idle"
    | "title"
    | "subtitle"
    | "region"
    | "particles"
    | "fadeout"
    | "done";

  const [phase, setPhase] = useState<Phase>("idle");
  const [particles, setParticles] = useState<Particle[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Kick off phase sequencing once on mount
  useEffect(() => {
    const PARTICLE_COUNT = 65;
    const prebuilt = buildParticles(schools, PARTICLE_COUNT);

    const t1 = setTimeout(() => setPhase("title"),    80);
    const t2 = setTimeout(() => setPhase("subtitle"), 800);
    const t3 = setTimeout(() => setPhase("region"),   1500);
    const t4 = setTimeout(() => {
      setParticles(prebuilt);
      setPhase("particles");
    }, 2200);
    const t5 = setTimeout(() => setPhase("fadeout"),  3000);
    const t6 = setTimeout(() => {
      setPhase("done");
      onCompleteRef.current();
    }, 3700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once — schools is stable after mount

  if (phase === "done") return null;

  // ── Derived booleans ────────────────────────────────────────────────────────
  const showTitle    = phase !== "idle";
  const showSubtitle = ["subtitle", "region", "particles", "fadeout"].includes(phase);
  const showRegion   = ["region", "particles", "fadeout"].includes(phase);
  const showParticles = ["particles", "fadeout"].includes(phase);
  const isFadingOut  = phase === "fadeout";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950"
      style={{
        transition: "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? "none" : "all",
      }}
    >
      {/* ── Particle layer ── */}
      {showParticles && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {particles.map((p) => {
            // Convert angle → dx/dy for CSS transform
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance + p.x;
            const ty = Math.sin(rad) * p.distance + p.y;

            return (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 1.5}px ${p.color}99`,
                  // Start at center (0,0) and fly to (tx, ty)
                  transform: "translate(0px, 0px) scale(1)",
                  animation: `antigravity-fly ${p.duration}ms cubic-bezier(0.1, 0.6, 0.3, 1) ${p.delay}ms forwards`,
                  // Pass destination via CSS custom properties
                  ["--tx" as string]: `${tx}px`,
                  ["--ty" as string]: `${ty}px`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* ── Text layer ── */}
      <div className="relative z-10 flex flex-col items-center gap-4 select-none text-center px-6">
        {/* SIGAPP wordmark */}
        <h1
          className="font-black tracking-[0.25em] text-white uppercase"
          style={{
            fontSize: "clamp(3rem, 10vw, 7rem)",
            transition: "opacity 600ms ease, transform 600ms ease",
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? "translateY(0)" : "translateY(18px)",
            textShadow: "0 0 60px rgba(20,184,166,0.35), 0 2px 4px rgba(0,0,0,0.6)",
            letterSpacing: "0.3em",
          }}
        >
          SIGAPP
        </h1>

        {/* Subtitle / Region — stacked, cross-fade */}
        <div className="relative h-8 flex items-center justify-center w-full">
          {/* Subtitle */}
          <p
            className="absolute text-slate-400 font-medium tracking-widest uppercase text-xs sm:text-sm"
            style={{
              transition: "opacity 500ms ease, transform 500ms ease",
              opacity: showSubtitle && !showRegion ? 1 : 0,
              transform: showSubtitle && !showRegion ? "translateY(0)" : "translateY(6px)",
              letterSpacing: "0.18em",
            }}
          >
            Sistem Informasi Geospasial Analitik Pendidikan
          </p>

          {/* Region */}
          <p
            className="absolute font-bold tracking-widest text-teal-400 text-sm sm:text-base"
            style={{
              transition: "opacity 500ms ease, transform 500ms ease",
              opacity: showRegion ? 1 : 0,
              transform: showRegion ? "translateY(0)" : "translateY(8px)",
              letterSpacing: "0.15em",
              textShadow: "0 0 20px rgba(20,184,166,0.5)",
            }}
          >
            📍 Nusa Tenggara Timur
          </p>
        </div>

        {/* Thin teal underline accent */}
        <div
          className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"
          style={{
            width: showTitle ? "clamp(160px, 30vw, 360px)" : "0px",
            transition: "width 800ms cubic-bezier(0.4, 0, 0.2, 1) 400ms",
            opacity: 0.6,
          }}
        />
      </div>

      {/* ── Ambient radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(20,184,166,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes antigravity-fly {
          0% {
            transform: translate(0px, 0px) scale(0.4);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          70% {
            opacity: 0.85;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
