"use client";

import { Bot, MapPin, Target, Activity } from "lucide-react";
import { 
  MacroInsightKecamatan, 
  MacroInsightKabupaten, 
  TREND_LABELS, 
  TREND_COLORS 
} from "@/lib/macroInsightData";

interface MacroInsightNarrativeProps {
  kecamatan: MacroInsightKecamatan | null;
  kabupaten: MacroInsightKabupaten | null;
}

export default function MacroInsightNarrative({ kecamatan, kabupaten }: MacroInsightNarrativeProps) {
  
  if (!kecamatan && !kabupaten) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm flex flex-col items-center justify-center text-center">
        <Bot size={48} className="text-slate-200 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Analisis Agent SIGAPP</h3>
        <p className="text-slate-500 max-w-md">
          Pilih kecamatan pada peta atau tabel untuk melihat narasi analisis dan rekomendasi intervensi dari AI Agent.
        </p>
      </div>
    );
  }

  const isKecamatan = !!kecamatan;
  const data = isKecamatan ? kecamatan : kabupaten;
  const title = isKecamatan ? `Kecamatan ${kecamatan.kecamatan_name}` : `Kabupaten ${kabupaten?.kabupaten_name || ""}`;
  
  // Parse recommendations by "Level " keyword to create bullet points
  const recText = isKecamatan ? kecamatan.agent_recommendation : (kabupaten?.agent_recommendation || "");
  const recItems = recText.split("Level ").filter(t => t.trim().length > 0).map(t => {
    if (t.includes(":")) return "Level " + t;
    return t;
  });

  // If parsing didn't find "Level", just use the whole text as one item
  const formattedRecs = recItems.length > 0 && recItems[0].startsWith("Level") 
    ? recItems 
    : [recText];

  return (
    <div className="bg-white rounded-xl border border-[#00B4B4]/20 shadow-sm overflow-hidden flex flex-col h-full relative">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#00B4B4] to-[#0D2137]"></div>
      
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0D2137] flex items-center justify-center flex-shrink-0">
              <Bot size={20} className="text-[#00B4B4]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={14} />
                <span>{isKecamatan ? kecamatan.kabupaten_name : "Provinsi NTT"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ 
                backgroundColor: `${TREND_COLORS[data?.trend_type || "volatile"]}15`,
                color: TREND_COLORS[data?.trend_type || "volatile"]
              }}
            >
              {TREND_LABELS[data?.trend_type || "volatile"]}
            </span>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">SIGAPP Index</span>
              <span className="text-2xl font-bold text-[#0D2137]">
                {isKecamatan ? kecamatan?.sigapp_index : kabupaten?.sigapp_index_avg}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-[#0D2137]">
              <Activity size={16} />
              <h4 className="font-semibold text-sm">Ringkasan Kondisi</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isKecamatan ? kecamatan?.agent_summary : kabupaten?.agent_executive_summary}
            </p>
            
            <div className="mt-4 flex gap-4 text-xs">
              <div className="bg-white px-3 py-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Dimensi Dominan</span>
                <span className="font-medium text-slate-700 capitalize">{data?.dominant_dimension}</span>
              </div>
              {isKecamatan && (
                <div className="bg-white px-3 py-1.5 rounded border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Pola Spasial</span>
                  <span className="font-medium text-slate-700 capitalize">{kecamatan.spatial_pattern}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendation Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-[#00B4B4]">
              <Target size={16} />
              <h4 className="font-semibold text-sm">Rekomendasi Bertingkat</h4>
            </div>
            <div className="space-y-3">
              {formattedRecs.map((rec, i) => {
                const parts = rec.split(":");
                const isLevel = parts.length > 1 && parts[0].includes("Level");
                
                return (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00B4B4]"></div>
                    </div>
                    <div>
                      {isLevel ? (
                        <>
                          <span className="font-semibold text-slate-700">{parts[0]}:</span>
                          <span className="text-slate-600 ml-1">{parts.slice(1).join(":")}</span>
                        </>
                      ) : (
                        <span className="text-slate-600">{rec}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
