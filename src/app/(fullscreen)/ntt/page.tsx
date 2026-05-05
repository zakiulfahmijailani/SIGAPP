// src/app/(fullscreen)/ntt/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSekolahNTT } from "@/hooks/useSekolahNTT";
import { Jenjang, JENJANG_COLOR, SekolahNTT } from "@/lib/types-ntt";

// Dynamic import: Leaflet tidak support SSR
const SchoolMapNTT = dynamic(
  () => import("@/components/map/SchoolMapNTT"),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-900" /> }
);

const ALL_JENJANG: Jenjang[] = ["TK", "SD", "SMP", "SMA"];

export default function NTTPage() {
  const [activeJenjang, setActiveJenjang] = useState<Jenjang[]>([]);
  const [selected, setSelected]           = useState<SekolahNTT | null>(null);

  const { data, loading, error, stats } = useSekolahNTT({
    jenjang: activeJenjang.length > 0 ? activeJenjang : undefined,
  });

  const toggleJenjang = (j: Jenjang) => {
    setActiveJenjang(prev =>
      prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-slate-100">
      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700 flex-wrap">
        <span className="text-xs text-slate-400 mr-1">Filter Jenjang:</span>
        {ALL_JENJANG.map(j => (
          <button
            key={j}
            onClick={() => toggleJenjang(j)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border
              ${
                activeJenjang.includes(j) || activeJenjang.length === 0
                  ? "border-transparent text-white"
                  : "border-slate-600 text-slate-400 bg-transparent"
              }`}
            style={{
              backgroundColor:
                activeJenjang.includes(j) || activeJenjang.length === 0
                  ? JENJANG_COLOR[j]
                  : undefined,
            }}
          >
            {j}
            {stats[j] ? (
              <span className="ml-1 opacity-75">({stats[j]})</span>
            ) : null}
          </button>
        ))}

        {error && (
          <span className="ml-auto text-xs text-red-400">\u26a0 {error}</span>
        )}
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative">
        <SchoolMapNTT
          schools={data}
          loading={loading}
          filterJenjang={activeJenjang}
          selectedId={selected?.id ?? null}
          onSchoolClick={setSelected}
        />
      </div>

      {/* ── Detail Panel ── */}
      {selected && (
        <div className="absolute bottom-4 left-4 z-[1001] w-72 bg-slate-800 border
                        border-slate-600 rounded-xl p-4 shadow-2xl">
          <div className="flex justify-between items-start">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: JENJANG_COLOR[selected.jenjang] }}
            >
              {selected.jenjang}
            </span>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-white text-lg leading-none"
            >
              \u00d7
            </button>
          </div>
          <p className="mt-2 font-semibold text-white text-sm">
            {selected.name ?? "Tanpa Nama"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            \uD83D\uDCCD {selected.addr_city ?? "-"}
          </p>
          {selected.operator && (
            <p className="text-xs text-slate-400">\uD83C\uDFDB {selected.operator}</p>
          )}
          {selected.phone && (
            <p className="text-xs text-slate-400">\uD83D\uDCDE {selected.phone}</p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}
