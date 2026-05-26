"use client";

import React from "react";
import { Zap, RefreshCw } from "lucide-react";
import { 
  MacroInsightKecamatan, 
  MacroInsightKabupaten, 
  TriggerType
} from "@/lib/macroInsightData";

interface MacroAgentAnalysisCardProps {
  kecamatanData: MacroInsightKecamatan[];
  kabupatenData: MacroInsightKabupaten[];
  semesterLabel: string;
  triggerType: TriggerType;
  reportGenerated: boolean;
  emailSent: boolean;
}

export default function MacroAgentAnalysisCard({
  kecamatanData,
  semesterLabel,
  triggerType,
  reportGenerated,
  emailSent,
}: MacroAgentAnalysisCardProps) {
  // Find worst kecamatan
  const worstKecamatan = [...kecamatanData].sort((a, b) => a.sigapp_index - b.sigapp_index)[0];
  
  // Calculate trend
  const membaik = kecamatanData.filter(k => k.delta_from_prev !== null && k.delta_from_prev > 0).length;
  const memburuk = kecamatanData.filter(k => k.delta_from_prev !== null && k.delta_from_prev < 0).length;
  const trendLabel = membaik > memburuk ? "Membaik ▲" : memburuk > membaik ? "Memburuk ▼" : "Stagnan →";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            🤖 MACRO AGENT ANALYSIS
          </span>
          <span className="text-[10px] text-slate-400">{semesterLabel}</span>
        </div>
        <span className={`border text-[10px] px-2 py-0.5 rounded-full font-medium ${
          triggerType === "auto" 
            ? "bg-green-50 text-green-600 border-green-200" 
            : "bg-blue-50 text-blue-600 border-blue-200"
        }`}>
          {triggerType === "auto" ? "Auto-generated · Setiap 6 bulan" : "Manual trigger"}
        </span>
      </div>

      {/* Compact 4-col grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Dominant Region */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">DOMINANT REGION</p>
          <div className="flex items-end gap-1.5 mb-1.5">
            <p className="font-semibold text-slate-700 leading-tight">{worstKecamatan?.kecamatan_name || "-"}</p>
            <p className="text-[10px] font-bold text-red-500">{worstKecamatan?.sigapp_index || 0}</p>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-0.5">
            <div
              className="h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              style={{ width: `${Math.min(100, worstKecamatan?.sigapp_index || 0)}%` }}
            />
          </div>
        </div>

        {/* Trend NTT */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">TREND NTT</p>
          <p className={`font-semibold ${membaik > memburuk ? "text-green-600" : memburuk > membaik ? "text-red-600" : "text-slate-600"}`}>
            {trendLabel}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {membaik} naik / {memburuk} turun
          </p>
        </div>

        {/* Triggered By */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">TRIGGERED BY</p>
          <div className="flex items-center gap-1">
            {triggerType === "auto" ? (
              <Zap size={14} className="text-violet-500" />
            ) : (
              <RefreshCw size={14} className="text-blue-500" />
            )}
            <p className={`font-medium ${triggerType === "auto" ? "text-violet-600" : "text-blue-600"}`}>
              {triggerType === "auto" ? "Auto-schedule" : "Manual trigger"}
            </p>
          </div>
          {triggerType === "auto" && (
            <p className="text-[10px] text-slate-400 mt-1">Setiap 6 bulan</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">ACTIONS</p>
          <div className="flex flex-col gap-0.5">
            {reportGenerated && (
              <span className="text-[10px] text-blue-600">✅ Macro report generated</span>
            )}
            {emailSent && (
              <span className="text-[10px] text-green-600">✅ 4 instansi dinotifikasi</span>
            )}
            {!reportGenerated && !emailSent && (
              <span className="text-[10px] text-slate-400">⏳ Menunggu trigger</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
