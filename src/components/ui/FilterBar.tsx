"use client";

import { useEffect, useState } from "react";

interface FilterBarProps {
  kotaFilter: string;
  jenjangFilter: string;
  prioritasFilter: string;
  onKotaChange: (value: string) => void;
  onJenjangChange: (value: string) => void;
  onPrioritasChange: (value: string) => void;
  totalVisible: number;
  totalAll: number;
}

export function FilterBar({
  kotaFilter,
  jenjangFilter,
  prioritasFilter,
  onKotaChange,
  onJenjangChange,
  onPrioritasChange,
  totalVisible,
  totalAll,
}: FilterBarProps) {
  const [flash, setFlash] = useState(false);
  
  // Is any filter active?
  const hasActiveFilter = kotaFilter !== "all" || jenjangFilter !== "all" || prioritasFilter !== "all";

  // Flash counter color on change
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 300);
    return () => clearTimeout(timer);
  }, [totalVisible]);

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-white rounded-xl shadow-md px-4 py-2.5 flex flex-row items-center gap-3 border border-gray-100">
        
        {/* DROPDOWN 1 — Kota */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Kota</span>
          <select
            value={kotaFilter}
            onChange={(e) => onKotaChange(e.target.value)}
            className="text-sm text-gray-700 font-medium border-none outline-none bg-transparent cursor-pointer focus:ring-0 min-w-fit p-0"
          >
            <option value="all">Semua Kota</option>
            <option value="Jakarta Utara">Jakarta Utara</option>
            <option value="Jakarta Selatan">Jakarta Selatan</option>
            <option value="Jakarta Barat">Jakarta Barat</option>
            <option value="Jakarta Timur">Jakarta Timur</option>
            <option value="Jakarta Pusat">Jakarta Pusat</option>
          </select>
        </div>

        {/* DROPDOWN 2 — Jenjang */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Jenjang</span>
          <select
            value={jenjangFilter}
            onChange={(e) => onJenjangChange(e.target.value)}
            className="text-sm text-gray-700 font-medium border-none outline-none bg-transparent cursor-pointer focus:ring-0 min-w-fit p-0"
          >
            <option value="all">Semua</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="SMK">SMK</option>
          </select>
        </div>

        {/* DROPDOWN 3 — Prioritas */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Prioritas</span>
          <select
            value={prioritasFilter}
            onChange={(e) => onPrioritasChange(e.target.value)}
            className="text-sm text-gray-700 font-medium border-none outline-none bg-transparent cursor-pointer focus:ring-0 min-w-fit p-0"
          >
            <option value="all">Semua</option>
            <option value="KRITIS">🔴 Kritis</option>
            <option value="TINGGI">🟠 Tinggi</option>
            <option value="SEDANG">🟡 Sedang</option>
            <option value="RENDAH">🟢 Rendah</option>
          </select>
        </div>

        {/* DIVIDER */}
        <div className="w-px h-8 bg-gray-200 mx-1"></div>

        {/* RESULT COUNTER */}
        <div className="flex flex-col items-start min-w-[100px]">
          <span
            className={`text-lg font-bold transition-colors duration-300 ${
              flash ? "text-[#00B4B4]" : "text-[#0D2137]"
            }`}
          >
            {totalVisible}
          </span>
          <span className="text-xs text-gray-400 leading-none">dari {totalAll} sekolah</span>
        </div>

        {/* RESET BUTTON */}
        {hasActiveFilter && (
          <button
            onClick={() => {
              onKotaChange("all");
              onJenjangChange("all");
              onPrioritasChange("all");
            }}
            className="ml-1 text-xs text-[#00B4B4] hover:text-[#0D2137] underline cursor-pointer transition-colors duration-150"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
