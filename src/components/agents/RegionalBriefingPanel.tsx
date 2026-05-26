"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, Activity, TrendingUp, TrendingDown, X, Clock, Building2, Landmark, Minus, School 
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine 
} from "recharts";
import { 
  MacroInsightKecamatan, 
  TREND_LABELS, 
  TREND_COLORS,
  getKecamatanHistory,
  SEMESTERS
} from "@/lib/macroInsightData";

interface RegionalBriefingPanelProps {
  kecamatan: MacroInsightKecamatan;
  allSemesterData: MacroInsightKecamatan[];
  nttAverage: number;
  onClose: () => void;
}

export default function RegionalBriefingPanel({
  kecamatan,
  nttAverage,
  onClose
}: RegionalBriefingPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"analisis" | "tren">("analisis");
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    // Trigger slide-in animation
    setIsVisible(true);
  }, []);

  // Typewriter effect for narrative
  useEffect(() => {
    if (activeTab !== "analisis") return;
    
    setDisplayedText("");
    const text = kecamatan.agent_summary;
    let i = 0;
    
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, [kecamatan.agent_summary, activeTab]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  // Parse recommendations
  const parseRecommendations = (text: string) => {
    const parts = text.split(/Level /i).filter(Boolean);
    return parts.map(part => {
      const isProv = part.toLowerCase().includes("provinsi");
      const isPusat = part.toLowerCase().includes("pusat");
      
      let level = "Kabupaten/Kota";
      let Icon = Building2;
      let colorClass = "border-l-amber-500 text-amber-400";
      
      if (isProv) {
        level = "Provinsi";
        Icon = MapPin;
        colorClass = "border-l-teal-500 text-teal-400";
      } else if (isPusat) {
        level = "Pusat";
        Icon = Landmark;
        colorClass = "border-l-violet-500 text-violet-400";
      }

      // Remove the level word from text if it's there
      const content = part.replace(/kabupaten\/kota|kabupaten|kota|provinsi|pusat/i, "").replace(/^[:\-\s]+/, "").trim();

      return { level, Icon, colorClass, content };
    });
  };

  const getTierInfo = (index: number) => {
    if (index < 40) return { label: "KRITIS", color: "bg-red-500" };
    if (index < 55) return { label: "WASPADA", color: "bg-orange-500" };
    if (index < 70) return { label: "STABIL", color: "bg-yellow-500" };
    return { label: "BAIK", color: "bg-green-500" };
  };

  const tierInfo = getTierInfo(kecamatan.sigapp_index);
  const chartData = getKecamatanHistory(kecamatan.kecamatan_name).map(k => ({
    semester: k.report_id.split("-")[1], // e.g. S0
    label: SEMESTERS.find(s => s.key === k.report_id.split("-")[1])?.label || k.report_id,
    index: k.sigapp_index
  })).reverse(); // Reverse to chronological

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Slide-in Panel */}
      <div 
        className={`absolute right-0 top-0 h-full w-full sm:w-[480px] bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex flex-col flex-shrink-0 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight leading-tight">
                  GeoAI Regional Analysis
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-slate-500 font-mono">Agent Run: Semester 1 2026</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 border border-violet-700/50 font-medium leading-none">
                    SIGAPP GeoAI v1.2
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-5 gap-6">
            <button
              onClick={() => setActiveTab("analisis")}
              className={`pb-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === "analisis" 
                  ? "border-violet-500 text-violet-300" 
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <MapPin size={14} />
              Analisis Wilayah
            </button>
            <button
              onClick={() => setActiveTab("tren")}
              className={`pb-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === "tren" 
                  ? "border-violet-500 text-violet-300" 
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Activity size={14} />
              Tren Historis
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {activeTab === "analisis" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{kecamatan.kecamatan_name}</h1>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Building2 size={12} /> {kecamatan.kabupaten_name}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-white tabular-nums tracking-tight">
                      {kecamatan.sigapp_index.toFixed(1)}
                    </span>
                    <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-md ${tierInfo.color}`}>
                      {tierInfo.label}
                    </span>
                  </div>
                  
                  {/* Delta Badge */}
                  <div className="mt-1 flex items-center gap-1">
                    {kecamatan.delta_from_prev !== null ? (
                      kecamatan.delta_from_prev > 0 ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
                          <TrendingUp size={10} /> +{kecamatan.delta_from_prev.toFixed(1)}
                        </div>
                      ) : kecamatan.delta_from_prev < 0 ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">
                          <TrendingDown size={10} /> {kecamatan.delta_from_prev.toFixed(1)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          <Minus size={10} /> 0.0
                        </div>
                      )
                    ) : (
                      <div className="text-[10px] text-slate-500">N/A</div>
                    )}
                  </div>
                </div>
              </div>

              {/* School Stats */}
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  Demografi Pendidikan
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-center">
                    <p className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><School size={10} /> Total</p>
                    <p className="text-lg font-bold text-white leading-none">{kecamatan.total_schools}</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 border-b-red-500/50 rounded-xl p-3 flex flex-col justify-center">
                    <p className="text-[10px] text-slate-400 mb-1">Sekolah Kritis</p>
                    <p className="text-lg font-bold text-red-400 leading-none">{kecamatan.critical_schools}</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 border-b-green-500/50 rounded-xl p-3 flex flex-col justify-center">
                    <p className="text-[10px] text-slate-400 mb-1">Sekolah Stabil</p>
                    <p className="text-lg font-bold text-green-400 leading-none">{kecamatan.stable_schools}</p>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="flex gap-2">
                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Dimensi Dominan</span>
                  <span className="font-medium text-white capitalize">{kecamatan.dominant_dimension}</span>
                </div>
                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Pola Spasial</span>
                  <span className="font-medium text-white capitalize">{kecamatan.spatial_pattern}</span>
                </div>
              </div>

              {/* Agent Narrative */}
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Clock size={12} className="text-violet-400" />
                  Analisis Agent SIGAPP
                </p>
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <p className="text-sm leading-relaxed text-slate-300 font-medium">
                    {displayedText}
                    {displayedText.length < kecamatan.agent_summary.length && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-violet-400 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              {displayedText.length === kecamatan.agent_summary.length && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 mt-6">
                    Rekomendasi Bertingkat
                  </p>
                  <div className="space-y-3">
                    {parseRecommendations(kecamatan.agent_recommendation).map((rec, i) => (
                      <div key={i} className={`bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 ml-2 border-l-2 ${rec.colorClass}`}>
                        <p className="text-xs font-bold mb-1 flex items-center gap-1.5">
                          <rec.Icon size={12} /> {rec.level}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "tren" && (
            <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Evolusi Indeks 5 Semester
              </p>
              
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 flex-shrink-0 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      stroke="#64748b" 
                      fontSize={10}
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      domain={[0, 100]} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <ReferenceLine 
                      y={nttAverage} 
                      stroke="#64748b" 
                      strokeDasharray="3 3" 
                      label={{ value: 'Rata-rata NTT', position: 'insideTopLeft', fill: '#64748b', fontSize: 10 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="index" 
                      name="SIGAPP Index"
                      stroke={TREND_COLORS[kecamatan.trend_type]} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">Pola Tren:</span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                    style={{ backgroundColor: `${TREND_COLORS[kecamatan.trend_type]}20`, color: TREND_COLORS[kecamatan.trend_type] }}
                  >
                    {TREND_LABELS[kecamatan.trend_type]}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Berdasarkan pemantauan 5 semester terakhir (2.5 tahun), wilayah {kecamatan.kecamatan_name} menunjukkan pola <strong className="text-white">{TREND_LABELS[kecamatan.trend_type]}</strong>.
                  {kecamatan.delta_from_prev !== null && (
                    <span> Perubahan terakhir mencatat {kecamatan.delta_from_prev > 0 ? "kenaikan" : "penurunan"} sebesar {Math.abs(kecamatan.delta_from_prev).toFixed(1)} poin dari semester sebelumnya.</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-800/40 border-t border-slate-700/40 flex-shrink-0">
          <p className="text-[10px] text-slate-600 font-mono text-center">
            SIGAPP GeoAI v1.2 · Analisis per 6 bulan (semester) · Data agregasi wilayah NTT
          </p>
        </div>
      </div>
    </div>
  );
}
