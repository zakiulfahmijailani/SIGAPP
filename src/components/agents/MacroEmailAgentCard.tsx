"use client";

import React, { useState, useEffect } from "react";
import { Mail, Landmark, Building2, MapPin } from "lucide-react";

interface MacroEmailAgentCardProps {
  semesterLabel: string;
  reportGenerated: boolean;
  onEmailSent: () => void;
}

const MACRO_STAKEHOLDERS = [
  { id: 'ms-1', role: 'Kemendikdasmen RI', level: 'pusat', icon: Landmark },
  { id: 'ms-2', role: 'Dinas Pendidikan Provinsi NTT', level: 'provinsi', icon: Building2 },
  { id: 'ms-3', role: 'Bappeda Provinsi NTT', level: 'provinsi', icon: Building2 },
  { id: 'ms-4', role: 'Dinas Pendidikan Kab/Kota Terkait', level: 'kabupaten', icon: MapPin },
];

export default function MacroEmailAgentCard({
  semesterLabel,
  reportGenerated,
  onEmailSent
}: MacroEmailAgentCardProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "active">("idle");
  const [isSending, setIsSending] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      setStatus("sending");

      const steps = [
        "Menyiapkan laporan untuk 4 instansi...",
        "Mengirim ke Kemendikdasmen RI...",
        "Mengirim ke Dinas Pendidikan NTT...",
        "Mengirim ke Bappeda NTT...",
        "Mengirim ke Dinas Kab/Kota...",
      ];

      for (const step of steps) {
        setLoadingStep(step);
        await new Promise(r => setTimeout(r, 600));
      }

      // API call placeholder for MVP
      // await fetch('/api/macro-insight/send-email', { ... })

      setVisibleCount(0);
      setStatus("active");

      // Animate recipient reveal
      for (let i = 1; i <= MACRO_STAKEHOLDERS.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        setVisibleCount(i);
      }

      onEmailSent();
      setToast({ message: 'Laporan makro berhasil didistribusikan', type: 'success' });
    } catch {
      setToast({ message: 'Gagal mengirim laporan', type: 'error' });
      setStatus("idle");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Mail size={16} className="text-emerald-700" />
            Macro Email Agent
          </h3>
          <div className="flex flex-col mt-1">
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block w-fit">
              🤖 Agent Aktif — 4 Instansi
            </span>
          </div>
        </div>
        {(status === "idle" || status === "sending") && (
          <div className="relative group">
            <button
              onClick={handleSend}
              disabled={isSending || !reportGenerated}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengirim...
                </span>
              ) : (
                'Kirim Laporan Makro'
              )}
            </button>
            {!reportGenerated && (
              <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap z-10">
                Generate laporan terlebih dahulu
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            )}
          </div>
        )}
        {status === "active" && (
          <div className="text-right">
            <p className="text-xs font-bold text-emerald-700">
              4/4 Instansi
            </p>
            <p className="text-[10px] font-medium text-emerald-600">
              Berhasil terkirim
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-500 mb-4 ml-0.5">
        Distribusi otomatis: setiap 6 bulan setelah laporan digenerate
      </p>

      {/* Status idle */}
      {status === "idle" && (
        <p className="text-xs text-slate-500 italic leading-relaxed bg-white/50 p-3 rounded-lg border border-emerald-100 border-dashed">
          Laporan makro belum dikirim ke stakeholder semester ini. Klik untuk mendistribusikan ke Kemendikdasmen, Dinas Provinsi NTT, Bappeda NTT, dan Dinas Kab/Kota terkait.
        </p>
      )}

      {/* Status loading */}
      {status === "sending" && (
        <div className="space-y-3 py-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
            <span className="animate-spin inline-block text-lg">⚙️</span>
            <span>{loadingStep}</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden shadow-inner">
            <div className="bg-emerald-500 h-full rounded-full animate-pulse w-3/4 shadow-sm" />
          </div>
        </div>
      )}

      {/* Status active */}
      {status === "active" && (
        <div className="space-y-2 mt-4">
          {MACRO_STAKEHOLDERS.slice(0, visibleCount).map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className="bg-white border border-slate-100 rounded-xl px-3 py-3 shadow-sm group animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-lg text-slate-500">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {r.role}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Level: {r.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <span className="text-[10px]">✅</span> Terkirim
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {visibleCount === MACRO_STAKEHOLDERS.length && (
            <div className="mt-4 bg-emerald-600 text-white rounded-xl px-4 py-3 shadow-md">
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">
                🤖 Distribusi Selesai
              </p>
              <p className="text-[11px] leading-relaxed mt-1 font-medium">
                Laporan Macro Insight {semesterLabel} telah didistribusikan ke 4 instansi pemerintah. Monitoring balasan aktif. Siklus berikutnya: 6 bulan.
              </p>
            </div>
          )}
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
