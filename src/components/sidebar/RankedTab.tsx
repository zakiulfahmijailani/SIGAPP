"use client";

import { useState, useRef, useEffect } from "react";
import { Search, School as SchoolIcon } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useSchools } from "@/hooks/useSchools";
import { SchoolWithIndex } from "@/lib/types";
import { getTierFromIndex, getTierColor, PriorityTier } from "@/lib/utils";

export interface RankedTabProps {
  selectedSchoolId: string | null;
  onSchoolSelect: (school: SchoolWithIndex | null) => void;
}

export function RankedTab({ selectedSchoolId, onSchoolSelect }: RankedTabProps) {
  const { schools, loading, error, retry } = useSchools();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter and sort schools
  const filteredAndSorted = schools
    .filter((s) => s.school_name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const indexA = a.school_index?.sigapp_index || 0;
      const indexB = b.school_index?.sigapp_index || 0;
      return indexB - indexA;
    });

  function updateSearchURL(val: string) {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set('q', val);
    else params.delete('q');
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    if (selectedSchoolId) {
      // If the selected school is not in the current filtered list, clear the query
      const isVisible = filteredAndSorted.some(s => s.id === selectedSchoolId);
      if (!isVisible) {
        setQuery("");
        updateSearchURL("");
      }

      // Scroll to the item
      if (itemRefs.current[selectedSchoolId]) {
        itemRefs.current[selectedSchoolId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedSchoolId, filteredAndSorted]);

  return (
    <div className="flex flex-col h-full">
      {/* SECTION 1: SEARCH BAR */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama sekolah..."
            className="border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-[#00B4B4]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateSearchURL(e.target.value);
            }}
          />
        </div>
      </div>

      {/* SECTION 2: SCHOOL LIST */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-100 bg-white p-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  {/* Rank number */}
                  <div className="w-6 h-4 rounded bg-gray-100 shrink-0" />
                  {/* Name + subtitle */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3.5 rounded bg-gray-200 w-3/4" />
                    <div className="h-3 rounded bg-gray-100 w-1/2" />
                  </div>
                  {/* Score badge + agent badge */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="h-5 w-12 rounded-full bg-gray-200" />
                    <div className="h-4 w-16 rounded-full bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p className="text-sm text-gray-500">Gagal memuat data sekolah.</p>
            <button
              onClick={retry}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && filteredAndSorted.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-12 px-4 text-center">
            {query.trim() !== "" ? (
              // Case 1: search query exists but no match
              <>
                <Search size={28} className="text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  Sekolah tidak ditemukan
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tidak ada hasil untuk{" "}
                  <span className="font-semibold text-gray-600">
                    &ldquo;{query}&rdquo;
                  </span>
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    updateSearchURL("");
                  }}
                  className="mt-4 text-xs text-[#00B4B4] hover:underline"
                >
                  Hapus pencarian
                </button>
              </>
            ) : (
              // Case 2: no data at all
              <>
                <SchoolIcon size={28} className="text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  Belum ada data sekolah
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Data akan muncul setelah sinkronisasi selesai.
                </p>
              </>
            )}
          </div>
        )}

        {!loading &&
          filteredAndSorted.map((school, index) => {
            const isSelected = selectedSchoolId === school.id;
            const idxVal = school.school_index?.sigapp_index || 0;
            const tier = getTierFromIndex(idxVal);
            const badgeColors = getTierColor(tier as PriorityTier);

            return (
              <div
                key={school.id}
                ref={(el) => { itemRefs.current[school.id] = el; }}
                className={`
                  mb-2 overflow-hidden rounded-lg border cursor-pointer transition-all duration-150
                  active:scale-[0.98] hover:shadow-sm
                  ${isSelected 
                    ? "bg-teal-50/50 border-[#00B4B4] border-l-4 shadow-sm" 
                    : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                  }
                `}
              >
                {/* Row Header */}
                <div
                  className="flex flex-row items-center gap-3 p-3"
                  onClick={() => onSchoolSelect(isSelected ? null : school)}
                >
                  <div className="text-xs font-bold text-gray-400 w-6 text-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {school.school_name}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {school.kecamatan} · {school.jenjang}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeColors}`}>
                      {idxVal.toFixed(2)}
                    </div>
                    {/* Agent Badge */}
                    <span 
                      className={`
                        text-[10px] px-1.5 py-0.5 rounded-full font-medium border
                        ${tier === 'KRITIS' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                          tier === 'TINGGI' ? "bg-amber-50 text-amber-700 border-amber-100" : 
                          "bg-slate-50 text-slate-500 border-slate-100"}
                      `}
                    >
                      {tier === 'KRITIS' ? "Agent Aktif" : tier === 'TINGGI' ? "Standby" : "Agent N/A"}
                    </span>
                  </div>
                </div>

                {/* Accordion Detail */}
                <div
                  className={`
                    transition-all duration-300 ease-in-out
                    ${isSelected ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                  `}
                >
                  <div className="px-3 pb-3 pt-3 border-t border-gray-100">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-3 font-medium">
                      Breakdown Skor
                    </p>
                    
                    {[
                      { label: "P1 · Kualitas", value: school.school_index?.p1_quality_gap || 0 },
                      { label: "P2 · Spasial", value: school.school_index?.p2_spatial_inequity || 0 },
                      { label: "P3 · Risiko", value: school.school_index?.p3_structural_risk || 0 },
                      { label: "P4 · Sinyal", value: school.school_index?.p4_public_signal || 0 },
                    ].map((pillar) => (
                      <div key={pillar.label} className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">{pillar.label}</span>
                          <span className="text-xs font-medium text-gray-700">{pillar.value.toFixed(2)}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5 w-full">
                          <div
                            className="bg-[#00B4B4] rounded-full h-1.5"
                            style={{ width: `${Math.max(5, pillar.value * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Summary Line */}
                    <p className="text-xs text-gray-500 italic mt-3">
                      {getSummaryText(school.school_index)}
                    </p>

                    {/* DETAIL BUTTON */}
                    <div className="mt-4">
                      <a
                        href={`/schools/${school.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-[#0D2137] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a5a] transition-colors"
                      >
                        Lihat Laporan Lengkap
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// Helper to determine the highest pillar and return summary text
function getSummaryText(indexRecord: NonNullable<SchoolWithIndex["school_index"]> | undefined) {
  if (!indexRecord) return "";
  
  const pillars = [
    { key: "p1", val: indexRecord.p1_quality_gap },
    { key: "p2", val: indexRecord.p2_spatial_inequity },
    { key: "p3", val: indexRecord.p3_structural_risk },
    { key: "p4", val: indexRecord.p4_public_signal },
  ];

  const highest = pillars.reduce((prev, current) => (prev.val > current.val ? prev : current));

  switch (highest.key) {
    case "p1": return "Perlu perhatian pada kualitas pendidikan.";
    case "p2": return "Terdapat kesenjangan akses spasial.";
    case "p3": return "Risiko struktural bangunan cukup tinggi.";
    case "p4": return "Banyak keluhan publik tercatat.";
    default: return "";
  }
}
