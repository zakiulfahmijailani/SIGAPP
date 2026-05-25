"use client";

import { useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { 
  BarChart2, 
  MapPin, 
  TrendingUp, 
  Activity, 
  Globe, 
  RefreshCw 
} from "lucide-react";

import { 
  SEMESTERS, 
  MACRO_INSIGHT_KECAMATAN_DATA, 
  getKecamatanBySemester, 
  getKabupatenBySemester
} from "@/lib/macroInsightData";

import MacroInsightTrendChart from "@/components/MacroInsightTrendChart";
import MacroInsightTable from "@/components/MacroInsightTable";
import MacroInsightNarrative from "@/components/MacroInsightNarrative";

// Dynamic import for Leaflet map
const MacroInsightMap = dynamic(() => import('@/components/MacroInsightMap'), { 
  ssr: false, 
  loading: () => (
    <div className="h-[450px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center border border-slate-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#00B4B4] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Memuat peta interaktif...</p>
      </div>
    </div>
  ) 
});

export default function MacroInsightPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>(SEMESTERS[SEMESTERS.length - 1].key);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kecamatan" | "kabupaten">("kecamatan");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [kabupatenFilter, setKabupatenFilter] = useState<string | null>("all");
  const [isGenerating, setIsGenerating] = useState(false);

  // Derived Data
  const currentKecData = useMemo(() => getKecamatanBySemester(selectedSemester), [selectedSemester]);
  const currentKabData = useMemo(() => getKabupatenBySemester(selectedSemester), [selectedSemester]);
  
  const allKabupatenNames = useMemo(() => {
    return Array.from(new Set(MACRO_INSIGHT_KECAMATAN_DATA.map(k => k.kabupaten_name))).sort();
  }, []);

  const stats = useMemo(() => {
    const totalKec = currentKecData.length;
    const kritisKec = currentKecData.filter(k => k.sigapp_index < 40).length;
    const membaik = currentKecData.filter(k => k.delta_from_prev !== null && k.delta_from_prev > 0).length;
    const memburuk = currentKecData.filter(k => k.delta_from_prev !== null && k.delta_from_prev < 0).length;
    const avgIndex = totalKec > 0 
      ? Math.round(currentKecData.reduce((s, k) => s + k.sigapp_index, 0) / totalKec) 
      : 0;

    return { totalKec, kritisKec, membaik, memburuk, avgIndex };
  }, [currentKecData]);

  // Handle Generate
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // In a real app, this would hit the API endpoint we're creating
      // For now, we simulate the delay to show the UI
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Laporan Macro Insight berhasil dibuat dan email notifikasi dikirim.");
    } catch (error: unknown) {
      alert("Gagal membuat laporan: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKecamatanSelect = (name: string | null) => {
    setSelectedKecamatan(name);
    if (name) {
      setExpandedRow(name);
    }
  };

  // Find selected narrative data
  const selectedKecData = useMemo(() => 
    selectedKecamatan ? currentKecData.find(k => k.kecamatan_name === selectedKecamatan) || null : null
  , [selectedKecamatan, currentKecData]);

  const selectedKabData = useMemo(() => {
    if (selectedKecamatan) return null; // Prioritize kecamatan
    if (kabupatenFilter !== "all" && kabupatenFilter !== null) {
      return currentKabData.find(k => k.kabupaten_name === kabupatenFilter) || null;
    }
    return null;
  }, [selectedKecamatan, kabupatenFilter, currentKabData]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Globe className="text-[#0D2137]" size={24} />
            <h1 className="text-2xl font-bold text-slate-800">Macro Insight</h1>
          </div>
          <p className="text-sm text-slate-500 max-w-xl">
            Analisis agregasi wilayah NTT per kecamatan dan kabupaten untuk prioritas intervensi strategis.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-xs font-medium text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Terakhir diperbarui: 1 Januari 2026
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="h-10 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#00B4B4] focus:border-transparent outline-none"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            {SEMESTERS.map(sem => (
              <option key={sem.key} value={sem.key}>{sem.label}</option>
            ))}
          </select>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-10 inline-flex items-center gap-2 bg-[#0D2137] hover:bg-[#132D47] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Memproses..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <MapPin size={20} />
            </div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kecamatan Terpantau</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.totalKec}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Activity size={20} />
            </div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kecamatan Kritis</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-800">{stats.kritisKec}</p>
            <p className="text-sm font-medium text-slate-400 mb-1">({Math.round((stats.kritisKec/stats.totalKec)*100)}%)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tren Semester Ini</h3>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.membaik}</p>
              <p className="text-xs text-slate-400 font-medium">Membaik</p>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.memburuk}</p>
              <p className="text-xs text-slate-400 font-medium">Memburuk</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-[#00B4B4]">
              <BarChart2 size={20} />
            </div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Index NTT</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.avgIndex}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 3. MAP SECTION (Left, 2 columns wide on XL) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Peta Persebaran Risiko</h3>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode("kecamatan")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "kecamatan" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Per Kecamatan
                </button>
                <button 
                  onClick={() => setViewMode("kabupaten")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "kabupaten" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Per Kabupaten
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <MacroInsightMap 
                kecamatanData={currentKecData}
                kabupatenData={currentKabData}
                viewMode={viewMode}
                selectedKecamatan={selectedKecamatan}
                onKecamatanSelect={handleKecamatanSelect}
              />
            </div>
          </div>
        </div>

        {/* 4 & 6. NARRATIVE & CHART SECTION (Right, 1 column wide on XL) */}
        <div className="space-y-6 flex flex-col">
          <div className="flex-1 min-h-[400px]">
            <MacroInsightNarrative 
              kecamatan={selectedKecData}
              kabupaten={selectedKabData}
            />
          </div>
        </div>

      </div>

      {/* 5. TREND CHART SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Dinamika Tren SIGAPP Index</h3>
          <select
            className="h-9 px-3 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#00B4B4] outline-none"
            value={kabupatenFilter || "all"}
            onChange={(e) => setKabupatenFilter(e.target.value)}
          >
            <option value="all">Semua Kabupaten</option>
            {allKabupatenNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <MacroInsightTrendChart 
          allKecamatanData={MACRO_INSIGHT_KECAMATAN_DATA}
          selectedKabupaten={kabupatenFilter}
          highlightKecamatan={selectedKecamatan}
        />
      </div>

      {/* 5. DETAIL TABLE SECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Detail Wilayah</h3>
        <MacroInsightTable 
          data={
            kabupatenFilter && kabupatenFilter !== "all" 
              ? currentKecData.filter(k => k.kabupaten_name === kabupatenFilter)
              : currentKecData
          }
          onRowClick={handleKecamatanSelect}
          expandedRow={expandedRow}
        />
      </div>

    </div>
  );
}
