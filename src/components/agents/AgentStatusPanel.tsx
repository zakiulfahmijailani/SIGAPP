"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Slash, Lock, FileText, Mail } from "lucide-react";
import dynamic from "next/dynamic";
import { SchoolIndex, PillarVariables, School } from "@/lib/types";
import { PriorityTier } from "@/lib/utils";

const ReportAgent = dynamic(
  () => import("./ReportAgent"),
  { ssr: false }
);

const EmailAgent = dynamic(
  () => import("./EmailAgent"),
  { ssr: false }
);

interface AgentStatusPanelProps {
  agentType: "report" | "email";
  priorityTier: PriorityTier;
  sigappIndex: number;
  schoolName: string;
  school?: {
    id: string;
    school_name: string;
    address?: string;
    kelurahan?: string;
    kecamatan?: string;
    kota?: string;
    jenjang?: string;
    npsn?: string;
    total_students?: number;
    total_teachers?: number;
  };
  schoolIndex?: SchoolIndex;
  pillarVariables?: PillarVariables | null;
}

export default function AgentStatusPanel({
  agentType,
  priorityTier,
  sigappIndex,
  school,
  schoolIndex,
  pillarVariables,
}: AgentStatusPanelProps) {
  const status = 
    priorityTier === 'KRITIS' ? "active" : 
    priorityTier === 'TINGGI' ? "standby" : 
    "unavailable";

  const isReport = agentType === "report";
  const title = isReport ? "📄 Report Agent" : "📧 Email Agent";
  const icon = isReport ? <FileText size={20} /> : <Mail size={20} />;

  if (status === "active") {
    // For Tier 1 (KRITIS) schools, we render the functional components
    if (isReport && school && schoolIndex) {
      return (
        <ReportAgent
          school={school}
          schoolIndex={schoolIndex}
          pillarVariables={pillarVariables ?? null}
        />
      );
    }

    if (!isReport && school && schoolIndex) {
      return (
        <EmailAgent
          school={school as School}
          schoolIndex={schoolIndex}
        />
      );
    }

    // Default active UI (if data is missing)
    return (
      <div className="border border-slate-600 bg-slate-950 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            {icon}
            <span>{title}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-emerald-900/40 text-emerald-200 rounded-full font-bold border border-emerald-500/30 uppercase tracking-wide">
            <CheckCircle2 size={12} />
            Agent Aktif — Tier 1
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 border-dashed">
            <p className="text-sm text-slate-400 italic text-center font-medium">
              {isReport ? "Laporan belum dibuat" : "Belum ada pengiriman"}
            </p>
          </div>
          
          <button 
            disabled 
            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold opacity-50 cursor-not-allowed shadow-lg"
          >
            {isReport ? "Generate Laporan" : "Kirim Laporan"}
          </button>
        </div>
      </div>
    );
  }

  if (status === "standby") {
    const threshold = 0.720;
    const progress = Math.min((sigappIndex / threshold) * 100, 100);

    return (
      <div className="border border-slate-600 bg-slate-950 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            {icon}
            <span>{title}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-amber-900/40 text-amber-200 rounded-full font-bold border border-amber-500/30 uppercase tracking-wide">
            <AlertCircle size={12} />
            🟡 Agent Standby — Tier 2
          </span>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed font-medium">
          Sekolah ini berada di status {priorityTier}. Agent akan aktif otomatis jika sekolah naik ke Tier 1.
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Jarak ke Tier 1</span>
            <span className="text-slate-200">{sigappIndex.toFixed(3)} / {threshold.toFixed(3)}</span>
          </div>
          <div className="bg-slate-800 rounded-full h-2 w-full overflow-hidden border border-slate-700/50">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button 
          disabled 
          className="w-full py-2.5 border border-slate-700 bg-slate-900 text-slate-400 rounded-lg text-sm font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock size={14} />
          Aktifkan Manual
        </button>
      </div>
    );
  }

  // Unavailable
  return (
    <div className="border border-slate-700 bg-slate-900/50 rounded-xl p-5 opacity-80 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-tight">
          {icon}
          <span>{title}</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full font-bold border border-slate-700 uppercase tracking-wide">
          <Slash size={12} />
          ⚫ Agent Tidak Tersedia
        </span>
      </div>

      <p className="text-sm text-slate-300 mb-2 font-medium">
        Sekolah ini berada di status {priorityTier}. Sumber daya agent diprioritaskan untuk Tier 1 dan 2.
      </p>
      <p className="text-xs text-slate-400 italic">
        Data sekolah tetap tersedia for analisis manual melalui panel di atas.
      </p>
    </div>
  );
}
