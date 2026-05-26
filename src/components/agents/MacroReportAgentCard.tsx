"use client";

import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";

interface MacroReportAgentCardProps {
  semesterLabel: string;
  totalKecamatan: number;
  onReportGenerated: () => void;
}

export default function MacroReportAgentCard({
  semesterLabel,
  totalKecamatan,
  onReportGenerated
}: MacroReportAgentCardProps) {
  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      setStatus("generating");
      
      const steps = [
        `Mengumpulkan data ${totalKecamatan} kecamatan...`,
        "Menganalisis tren 5 semester...",
        "Menyusun narasi per wilayah...",
        "Mengompilasi laporan makro NTT...",
      ];

      for (const step of steps) {
        setLoadingStep(step);
        await new Promise(r => setTimeout(r, 700));
      }

      // API call placeholder for MVP
      // await fetch('/api/macro-insight/generate', { ... })

      setStatus("ready");
      onReportGenerated();
      setToast({ message: 'Laporan makro berhasil dibuat', type: 'success' });
    } catch {
      setToast({ message: 'Gagal membuat laporan', type: 'error' });
      setStatus("idle");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <FileText size={16} className="text-emerald-700" />
            Macro Report Agent
          </h3>
          <div className="flex flex-col mt-1">
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block w-fit">
              🤖 Agent Aktif — {semesterLabel}
            </span>
          </div>
        </div>
        {(status === "idle" || status === "generating") && (
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              'Generate Macro Report'
            )}
          </button>
        )}
        {status === "ready" && (
          <button
            onClick={generateReport}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            🔄 Generate Ulang
          </button>
        )}
      </div>

      <p className="text-[10px] text-slate-500 mb-4 ml-0.5">
        Jadwal otomatis: setiap 6 bulan (per semester)
      </p>

      {/* Status idle */}
      {status === "idle" && (
        <p className="text-xs text-slate-500 italic leading-relaxed bg-white/50 p-3 rounded-lg border border-emerald-100 border-dashed">
          Laporan agregasi wilayah NTT belum digenerate untuk semester ini. Klik untuk menyusun laporan makro seluruh kecamatan secara otomatis.
        </p>
      )}

      {/* Status loading */}
      {status === "generating" && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-emerald-700">
            <span className="animate-spin text-lg">⚙️</span>
            <span>{loadingStep}</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Status ready */}
      {status === "ready" && (
        <div className="space-y-3 mt-4">
          <div className="text-[10px] text-slate-400 font-medium">
            DIBUAT: {new Date().toLocaleString("id-ID")} · VERSI 1.0
          </div>
          
          <div className="bg-white border border-emerald-100 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              ✅ Laporan Semester ini tersedia.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Mencakup analisis komprehensif terhadap {totalKecamatan} kecamatan di wilayah NTT beserta rekomendasi intervensi strategis.
            </p>
          </div>

          <button
            className="w-full text-xs bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            📥 Unduh Laporan Macro PDF
          </button>
        </div>
      )}

      {toast && (
        <div role="alert" aria-live="assertive" className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </div>
  );
}
