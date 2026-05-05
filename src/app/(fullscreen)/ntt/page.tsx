// src/app/(fullscreen)/ntt/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSekolahNTT } from "@/hooks/useSekolahNTT";
import {
  Jenjang, PriorityTierNTT,
  JENJANG_COLOR, TIER_BG_COLORS_NTT,
  TIER_LABEL_NTT, SekolahNTTFull,
} from "@/lib/types-ntt";
import {
  getTierNTT, getTierBgHex, getTierLabel,
  getTierColorNTT, getDisplayName, formatIndex,
} from "@/lib/utils-ntt";

const SchoolMapNTT = dynamic(
  () => import("@/components/map/SchoolMapNTT"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

const ALL_JENJANG: Jenjang[] = ["TK", "SD", "SMP", "SMA"];
const ALL_TIER: PriorityTierNTT[] = ["KRITIS", "TINGGI", "SEDANG", "RENDAH"];
type ColorMode = "tier" | "jenjang";

export default function NTTPage() {
  const [activeJenjang, setActiveJenjang] = useState<Jenjang[]>([]);
  const [activeTier, setActiveTier]       = useState<PriorityTierNTT[]>([]);
  const [colorMode, setColorMode]         = useState<ColorMode>("tier");
  const [selected, setSelected]           = useState<SekolahNTTFull | null>(null);

  const { data, loading, error, stats } = useSekolahNTT({
    jenjang: activeJenjang.length > 0 ? activeJenjang : undefined,
    tier:    activeTier.length   > 0 ? activeTier    : undefined,
  });

  const toggleJenjang = (j: Jenjang) =>
    setActiveJenjang(p => p.includes(j) ? p.filter(x => x !== j) : [...p, j]);

  const toggleTier = (t: PriorityTierNTT) =>
    setActiveTier(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const today = new Date().toLocaleDateString("id-ID", { dateStyle: "long" });

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-900 text-slate-100">

      {/* ── NAVBAR ── */}
      <nav className="h-14 bg-slate-800 flex-shrink-0 flex items-center justify-between px-5 border-b border-slate-700 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo-light-mode-with-texts.png" alt="SIGAPP"
            className="h-8 w-auto object-contain brightness-0 invert" />
          <div className="h-7 w-px bg-slate-600 hidden sm:block" />
          <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold hidden sm:block">
            NTT • Nusa Tenggara Timur
          </span>
        </div>

        {/* Color Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1 text-xs">
          {(["tier", "jenjang"] as ColorMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setColorMode(mode)}
              className={`px-3 py-1 rounded-md font-semibold transition-all capitalize ${
                colorMode === mode
                  ? "bg-teal-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === "tier" ? "\uD83D\uDFE1 Tier" : "\uD83C\uDFEB Jenjang"}
            </button>
          ))}
        </div>

        <div className="text-slate-500 text-xs font-medium hidden sm:block">{today}</div>
      </nav>

      {/* ── FILTER BAR ── */}
      <div className="flex items-center gap-x-3 gap-y-1.5 px-4 py-2
                      bg-slate-800 border-b border-slate-700 flex-wrap">

        {/* Filter Tier */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tier</span>
          {ALL_TIER.map(t => (
            <button key={t} onClick={() => toggleTier(t)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all border ${
                activeTier.includes(t) || activeTier.length === 0
                  ? "border-transparent text-white"
                  : "border-slate-600 text-slate-500 bg-transparent"
              }`}
              style={{
                backgroundColor:
                  activeTier.includes(t) || activeTier.length === 0
                    ? TIER_BG_COLORS_NTT[t] : undefined,
              }}
            >
              {t}
              {stats.byTier[t] ? (
                <span className="ml-1 opacity-70">({stats.byTier[t]})</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-600 hidden sm:block" />

        {/* Filter Jenjang */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Jenjang</span>
          {ALL_JENJANG.map(j => (
            <button key={j} onClick={() => toggleJenjang(j)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all border ${
                activeJenjang.includes(j) || activeJenjang.length === 0
                  ? "border-transparent text-white"
                  : "border-slate-600 text-slate-500 bg-transparent"
              }`}
              style={{
                backgroundColor:
                  activeJenjang.includes(j) || activeJenjang.length === 0
                    ? JENJANG_COLOR[j] : undefined,
              }}
            >
              {j}
              {stats.byJenjang[j] ? (
                <span className="ml-1 opacity-70">({stats.byJenjang[j]})</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Total + error */}
        <div className="ml-auto flex items-center gap-2">
          {!loading && (
            <span className="text-xs text-slate-400">
              <span className="text-teal-400 font-semibold">
                {data.length.toLocaleString("id-ID")}
              </span>{" "}sekolah
            </span>
          )}
          {error && <span className="text-xs text-red-400">⚠ {error}</span>}
        </div>
      </div>

      {/* ── MAP ── */}
      <div className="flex-1 relative">
        <SchoolMapNTT
          schools={data}
          loading={loading}
          colorMode={colorMode}
          filterJenjang={activeJenjang}
          filterTier={activeTier}
          selectedId={selected?.id ?? null}
          onSchoolClick={setSelected}
        />
      </div>

      {/* ── DETAIL PANEL ── */}
      {selected && (() => {
        const tier = getTierNTT(selected.sigapp_index ?? undefined);
        const tierHex = getTierBgHex(tier);
        const name = getDisplayName(selected);
        const pillars = [
          { label: "P1 Kualitas",  icon: "\uD83C\uDF93", val: selected.p1_quality_gap },
          { label: "P2 Spasial",   icon: "\uD83D\uDCCD", val: selected.p2_spatial_inequity },
          { label: "P3 Struktural",icon: "\uD83C\uDFDA", val: selected.p3_structural_risk },
          { label: "P4 Publik",    icon: "\uD83D\uDCE1", val: selected.p4_public_signal },
        ];

        return (
          <div className="absolute bottom-4 left-4 z-[1001] w-80 bg-slate-800
                          border border-slate-600 rounded-xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 flex items-start justify-between gap-2"
              style={{ borderBottom: `2px solid ${tierHex}` }}>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selected.jenjang} · {selected.kabupaten ?? selected.addr_city ?? "-"}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white text-xl leading-none flex-shrink-0">
                ×
              </button>
            </div>

            {/* SIGAPP Index */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">SIGAPP Index</p>
                <p className="text-2xl font-black mt-0.5" style={{ color: tierHex }}>
                  {formatIndex(selected.sigapp_index)}
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                getTierColorNTT(tier)
              }`}>
                {getTierLabel(tier)}
              </span>
            </div>

            {/* Pilar Breakdown */}
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Breakdown Pilar</p>
              <div className="space-y-2">
                {pillars.map(({ label, icon, val }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{icon} {label}</span>
                      <span className="text-slate-400 font-mono">
                        {val != null ? val.toFixed(3) : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${((val ?? 0) * 100).toFixed(1)}%`,
                          backgroundColor: tierHex,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info tambahan */}
            <div className="px-4 py-2.5 text-xs text-slate-400 space-y-0.5">
              {selected.kecamatan && <p>\uD83D\uDDFA Kec. {selected.kecamatan}</p>}
              {selected.operator  && <p>\uD83C\uDFDB {selected.operator}</p>}
              {selected.phone     && <p>\uD83D\uDCDE {selected.phone}</p>}
              {selected.internet_access != null && (
                <p>{selected.internet_access ? "\u2705" : "\u274C"} Internet access</p>
              )}
              {selected.remote_status != null && selected.remote_status && (
                <p>\uD83D\uDEA8 Area terpencil / 3T</p>
              )}
              <p className="text-slate-600 mt-1">
                {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}
              </p>
            </div>

          </div>
        );
      })()}
    </div>
  );
}
