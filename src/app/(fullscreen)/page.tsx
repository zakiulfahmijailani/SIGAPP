"use client";

import { useState, Suspense } from "react";
import { useSekolahNTT } from "@/hooks/useSekolahNTT";
import { Jenjang, JENJANG_COLOR, SekolahNTT } from "@/lib/types-ntt";
import dynamic from "next/dynamic";

const SchoolMapNTT = dynamic(
  () => import("@/components/map/SchoolMapNTT"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex w-full h-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Memuat peta NTT...</p>
        </div>
      </div>
    ),
  }
);

const ALL_JENJANG: Jenjang[] = ["TK", "SD", "SMP", "SMA"];

function DashboardInner() {
  const [activeJenjang, setActiveJenjang] = useState<Jenjang[]>([]);
  const [selected, setSelected] = useState<SekolahNTT | null>(null);

  const { data, loading, error, stats } = useSekolahNTT({
    jenjang: activeJenjang.length > 0 ? activeJenjang : undefined,
  });

  const toggleJenjang = (j: Jenjang) => {
    setActiveJenjang((prev) =>
      prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j]
    );
  };

  const today = new Date().toLocaleDateString("id-ID", { dateStyle: "long" });

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-900 text-slate-100">
      {/* ── NAVBAR ── */}
      <nav className="h-14 bg-slate-800 flex-shrink-0 flex items-center justify-between px-6 z-50 shadow border-b border-slate-700">
        <div className="flex items-center gap-4">
          <img
            src="/logo-light-mode-with-texts.png"
            alt="SIGAPP Logo"
            className="h-9 w-auto object-contain brightness-0 invert"
          />
          <div className="h-8 w-px bg-slate-600 hidden sm:block" />
          <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold hidden sm:block">
            NTT Dashboard
          </span>
        </div>
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wide">
          {today}
        </div>
      </nav>

      {/* ── FILTER BAR ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700 flex-wrap">
        <span className="text-xs text-slate-400 mr-1">Filter Jenjang:</span>
        {ALL_JENJANG.map((j) => (
          <button
            key={j}
            onClick={() => toggleJenjang(j)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
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

        {/* Total count */}
        {!loading && (
          <span className="ml-auto text-xs text-slate-400">
            <span className="text-teal-400 font-semibold">
              {data.length.toLocaleString("id-ID")}
            </span>{" "}
            sekolah ditampilkan
          </span>
        )}

        {error && (
          <span className="ml-2 text-xs text-red-400">⚠ {error}</span>
        )}
      </div>

      {/* ── MAP ── */}
      <div className="flex-1 relative">
        <SchoolMapNTT
          schools={data}
          loading={loading}
          filterJenjang={activeJenjang}
          selectedId={selected?.id ?? null}
          onSchoolClick={setSelected}
        />
      </div>

      {/* ── DETAIL PANEL ── */}
      {selected && (
        <div className="absolute bottom-4 left-4 z-[1001] w-72 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl">
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
              ×
            </button>
          </div>
          <p className="mt-2 font-semibold text-white text-sm">
            {selected.name ?? "Tanpa Nama"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            📍 {selected.addr_city ?? "-"}
          </p>
          {selected.operator && (
            <p className="text-xs text-slate-400">🏛 {selected.operator}</p>
          )}
          {selected.phone && (
            <p className="text-xs text-slate-400">📞 {selected.phone}</p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function DashboardRoot() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}
