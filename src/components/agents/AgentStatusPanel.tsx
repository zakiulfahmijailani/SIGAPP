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
      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            {icon}
            <span>{title}</span>
          </div>
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold border border-emerald-200">
            <CheckCircle2 size={12} />
            Agent Aktif — Tier 1
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-white/50 rounded-lg border border-emerald-100 border-dashed">
            <p className="text-sm text-emerald-600/70 italic text-center">
              {isReport ? "Laporan belum dibuat" : "Belum ada pengiriman"}
            </p>
          </div>
          
          <button 
            disabled 
            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed transition-all"
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
      <div className="border border-amber-200 bg-amber-50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold">
            {icon}
            <span>{title}</span>
          </div>
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold border border-amber-200">
            <AlertCircle size={12} />
            🟡 Agent Standby — Tier 2
          </span>
        </div>

        <p className="text-sm text-amber-800/80 mb-4 leading-relaxed">
          Sekolah ini berada di status {priorityTier}. Agent akan aktif otomatis jika sekolah naik ke Tier 1.
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-medium text-amber-700">
            <span>Jarak ke Tier 1</span>
            <span>{sigappIndex.toFixed(3)} / {threshold.toFixed(3)}</span>
          </div>
          <div className="bg-amber-200/50 rounded-full h-2 w-full overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button 
          disabled 
          className="w-full py-2.5 border border-amber-300 text-amber-700 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed hover:bg-amber-100/50 transition-all flex items-center justify-center gap-2"
        >
          <Lock size={14} />
          Aktifkan Manual
        </button>
      </div>
    );
  }

  // Unavailable
  return (
    <div className="border border-slate-200 bg-slate-50 rounded-xl p-5 opacity-75 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          {icon}
          <span>{title}</span>
        </div>
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full font-semibold border border-slate-300">
          <Slash size={12} />
          ⚫ Agent Tidak Tersedia
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-2">
        Sekolah ini berada di status {priorityTier}. Sumber daya agent diprioritaskan untuk Tier 1 dan 2.
      </p>
      <p className="text-xs text-slate-400">
        Data sekolah tetap tersedia for analisis manual melalui panel di atas.
      </p>
    </div>
  );
}
