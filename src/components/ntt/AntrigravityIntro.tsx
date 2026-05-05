"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { SekolahNTTFull, TIER_BG_COLORS_NTT, PriorityTierNTT } from "@/lib/types-ntt";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AntrigravityIntroProps {
  schools: SekolahNTTFull[];
  onComplete: () => void;
}

interface Dot {
  id: number;
  x: number;      // px from left edge of screen
  y: number;      // px from top edge of screen
  color: string;
  size: number;   // px
  delay: number;  // seconds, stagger for fade-in
}

// ─── NTT bounding box ─────────────────────────────────────────────────────────

const LAT_MIN = -11.0;
const LAT_MAX =  -8.0;
const LON_MIN = 118.9;
const LON_MAX = 125.2;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTierFromIndex(idx: number): PriorityTierNTT {
  if (idx >= 0.75) return "KRITIS";
  if (idx >= 0.50) return "TINGGI";
  if (idx >= 0.25) return "SEDANG";
  return "RENDAH";
}

function geoToScreen(
  lat: number,
  lon: number,
  width: number,
  height: number
): { x: number; y: number } {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * width;
  // lat inverted: larger lat = north = top of screen (y = 0)
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * height;
  return { x, y };
}

// ─── Phase numeric map (for comparison operators) ────────────────────────────

const PHASE_ORDER = {
  idle:      0,
  title:     1,
  subtitle:  2,
  region:    3,
  dots:      4,
  fadeout:   5,
  done:      6,
} as const;
type Phase = keyof typeof PHASE_ORDER;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AntrigravityIntro({
  schools,
  onComplete,
}: AntrigravityIntroProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [screenSize, setScreenSize] = useState({ w: 1920, h: 1080 });
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Capture screen size once on mount
  useEffect(() => {
    setScreenSize({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  // Phase sequencing (runs once)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("title"),    80);
    const t2 = setTimeout(() => setPhase("subtitle"), 800);
    const t3 = setTimeout(() => setPhase("region"),   1500);
    const t4 = setTimeout(() => setPhase("dots"),     2200);
    const t5 = setTimeout(() => setPhase("fadeout"),  3200);
    const t6 = setTimeout(() => {
      setPhase("done");
      onCompleteRef.current();
    }, 3900);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally once

  // Build dots from geo data — recomputes when schools or screen size changes
  const dots = useMemo<Dot[]>(() => {
    const valid = schools.filter((s) => s.sigapp_index != null);

    // Random sample of up to 120 schools for performance
    const sample = [...valid]
      .sort(() => Math.random() - 0.5)
      .slice(0, 120);

    return sample.map((s) => {
      const pos   = geoToScreen(s.lat, s.lon, screenSize.w, screenSize.h);
      const tier  = getTierFromIndex(s.sigapp_index!);
      const color = TIER_BG_COLORS_NTT[tier];
      // Higher priority schools appear slightly larger (6–14 px range)
      const size  = 6 + (s.sigapp_index!) * 8;
      const delay = Math.random() * 1.5; // seconds, natural stagger

      return { id: s.id, x: pos.x, y: pos.y, color, size, delay };
    });
  }, [schools, screenSize]);

  if (phase === "done") return null;

  // ── Convenience flags ────────────────────────────────────────────────────────
  const phaseNum     = PHASE_ORDER[phase];
  const showTitle    = phaseNum >= PHASE_ORDER.title;
  const showSubtitle = phaseNum >= PHASE_ORDER.subtitle;
  const showRegion   = phaseNum >= PHASE_ORDER.region;
  const showDots     = phaseNum >= PHASE_ORDER.dots;
  const isFadingOut  = phaseNum >= PHASE_ORDER.fadeout;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#020617", // slate-950
        overflow: "hidden",
        transition: "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? "none" : "all",
      }}
    >
      {/* ── Geo-positioned school dots ── */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            marginLeft: -dot.size / 2,
            marginTop: -dot.size / 2,
            borderRadius: "50%",
            backgroundColor: dot.color,
            boxShadow: `0 0 ${dot.size * 2}px ${dot.color}88`,
            opacity: showDots ? 1 : 0,
            transform: showDots ? "scale(1)" : "scale(0)",
            transition: `opacity 0.4s ease ${dot.delay}s, transform 0.4s ease ${dot.delay}s`,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* ── Ambient radial glow ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(20,184,166,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Text layer ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          textAlign: "center",
          padding: "0 1.5rem",
          userSelect: "none",
        }}
      >
        {/* SIGAPP wordmark */}
        <h1
          style={{
            fontWeight: 900,
            letterSpacing: "0.3em",
            color: "#ffffff",
            textTransform: "uppercase",
            fontSize: "clamp(3rem, 10vw, 7rem)",
            textShadow: "0 0 60px rgba(20,184,166,0.35), 0 2px 4px rgba(0,0,0,0.6)",
            transition: "opacity 600ms ease, transform 600ms ease",
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? "translateY(0)" : "translateY(18px)",
          }}
        >
          SIGAPP
        </h1>

        {/* Subtitle / Region — cross-fade */}
        <div style={{ position: "relative", height: "2rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Subtitle */}
          <p
            style={{
              position: "absolute",
              color: "#94a3b8",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontSize: "clamp(0.65rem, 1.5vw, 0.875rem)",
              transition: "opacity 500ms ease, transform 500ms ease",
              opacity: showSubtitle && !showRegion ? 1 : 0,
              transform: showSubtitle && !showRegion ? "translateY(0)" : "translateY(6px)",
            }}
          >
            Sistem Informasi Geospasial Analitik Pendidikan
          </p>

          {/* Region */}
          <p
            style={{
              position: "absolute",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#2dd4bf", // teal-400
              fontSize: "clamp(0.75rem, 2vw, 1rem)",
              textShadow: "0 0 20px rgba(20,184,166,0.5)",
              transition: "opacity 500ms ease, transform 500ms ease",
              opacity: showRegion ? 1 : 0,
              transform: showRegion ? "translateY(0)" : "translateY(8px)",
            }}
          >
            📍 Nusa Tenggara Timur
          </p>
        </div>

        {/* Teal underline accent */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(to right, transparent, #14b8a6, transparent)",
            opacity: 0.6,
            width: showTitle ? "clamp(160px, 30vw, 360px)" : "0px",
            transition: "width 800ms cubic-bezier(0.4, 0, 0.2, 1) 400ms",
          }}
        />

        {/* Subtle school count label */}
        {showDots && dots.length > 0 && (
          <p
            style={{
              color: "#475569",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              transition: "opacity 800ms ease 0.5s",
              opacity: showDots ? 1 : 0,
            }}
          >
            {dots.length} sekolah terpetakan
          </p>
        )}
      </div>
    </div>
  );
}
