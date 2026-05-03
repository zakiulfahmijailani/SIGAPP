"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { School, SchoolIndex } from "@/lib/types";
import { getTierFromIndex } from "@/lib/utils";
import {
  StakeholderRecipient,
  generateStakeholders,
  RecipientStatus,
} from "@/lib/agentData";

const EmailThreadModal = dynamic(() => import("./EmailThreadModal"), {
  ssr: false,
});

interface EmailAgentProps {
  school: School;
  schoolIndex: SchoolIndex;
}

const statusConfig: Record<RecipientStatus, { icon: string; label: string; color: string }> = {
  pending:  { icon: "⬜", label: "Belum dikirim",   color: "text-slate-400" },
  sent:     { icon: "⏳", label: "Menunggu balasan", color: "text-amber-600" },
  replied:  { icon: "✅", label: "Sudah dibalas",    color: "text-emerald-600" },
  escalate: { icon: "🔴", label: "Perlu eskalasi",   color: "text-red-500" },
};

const levelIcon: Record<string, string> = {
  sekolah:    "🏫",
  kelurahan:  "🏘️",
  kecamatan:  "🏢",
  kota:       "🏛️",
  provinsi:   "🗺️",
};

export default function EmailAgent({ school, schoolIndex }: EmailAgentProps) {
  const [agentStatus, setAgentStatus] = useState<
    "idle" | "sending" | "active"
  >("idle");
  const [isSending, setIsSending] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [recipients, setRecipients] = useState<StakeholderRecipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] =
    useState<StakeholderRecipient | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const repliedCount = recipients.filter((r) => r.status === "replied").length;
  const pendingCount = recipients.filter(
    (r) => r.status === "sent" || r.status === "escalate"
  ).length;

  const handleSend = async () => {
    setIsSending(true);
    try {
      setAgentStatus("sending");

      const steps = [
        "Menyiapkan daftar pemangku kepentingan...",
        "Menyusun pesan untuk setiap penerima...",
        "Melampirkan laporan PDF...",
        "Mengirim email ke 5 penerima...",
        "Memulai monitoring balasan...",
      ];

      for (const step of steps) {
        setLoadingStep(step);
        await new Promise((r) => setTimeout(r, 600));
      }

      // Generate data stakeholder
      const data = generateStakeholders(school, schoolIndex);
      setRecipients(data);

      // Tampilkan penerima satu per satu dengan delay
      setVisibleCount(0);
      setAgentStatus("active");

      for (let i = 1; i <= data.length; i++) {
        await new Promise((r) => setTimeout(r, 300));
        setVisibleCount(i);
      }
      setToast({ message: 'Laporan berhasil dikirim', type: 'success' });
    } catch {
      setToast({ message: 'Gagal mengirim laporan', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              📧 Email Agent
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              🤖 Agent Aktif — {getTierFromIndex(schoolIndex.sigapp_index)}
            </span>
          </div>
          {(agentStatus === "idle" || agentStatus === "sending") && (
            <button
              onClick={handleSend}
              disabled={isSending}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengirim...
                </span>
              ) : (
                'Kirim Laporan'
              )}
            </button>
          )}
          {agentStatus === "active" && (
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-700">
                {repliedCount}/{recipients.length} dibalas
              </p>
              {pendingCount > 0 && (
                <p className="text-[10px] font-medium text-amber-600">
                  {pendingCount} menunggu tindak lanjut
                </p>
              )}
            </div>
          )}
        </div>

        {/* Idle state */}
        {agentStatus === "idle" && (
          <p className="text-xs text-slate-500 italic leading-relaxed">
            Laporan belum dikirim. Klik &ldquo;Kirim Laporan&rdquo; untuk mendistribusikan
            prioritas intervensi ke seluruh pemangku kepentingan terkait secara otomatis.
          </p>
        )}

        {/* Sending state */}
        {agentStatus === "sending" && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <span className="animate-spin inline-block text-lg">⚙️</span>
              <span>{loadingStep}</span>
            </div>
            <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden shadow-inner">
              <div className="bg-emerald-500 h-full rounded-full animate-pulse w-3/4 shadow-sm" />
            </div>
          </div>
        )}

        {/* Active state — daftar penerima */}
        {agentStatus === "active" && (
          <div className="space-y-2">
            {recipients.slice(0, visibleCount).map((r) => {
              const cfg = statusConfig[r.status];
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRecipient(r)}
                  className="bg-white border border-slate-100 rounded-xl px-3 py-3 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/40 transition-all shadow-sm group animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex items-center justify-between">
                    {/* Kiri: icon level + role */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-lg group-hover:bg-white transition-colors text-xl">
                        {levelIcon[r.level]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {r.role}
                        </p>
                        {r.sentAt && (
                          <p className="text-[10px] text-slate-400 font-medium">
                            Dikirim {r.sentAt}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Kanan: status */}
                    <div className="text-right">
                      <p className={`text-[11px] font-bold ${cfg.color} flex items-center justify-end gap-1`}>
                        <span className="text-[10px]">{cfg.icon}</span> {cfg.label}
                      </p>
                      {r.repliedAt && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          {r.repliedAt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preview balasan terakhir jika ada */}
                  {r.status === "replied" && r.thread.length > 0 && (() => {
                    const lastReply = [...r.thread]
                      .reverse()
                      .find((m) => m.from === "recipient");
                    return lastReply ? (
                      <p className="mt-2.5 text-[11px] text-slate-500 italic truncate border-t border-slate-50 pt-2.5 px-1 font-medium">
                        💬 &ldquo;{lastReply.body.substring(0, 80)}...&rdquo;
                      </p>
                    ) : null;
                  })()}

                  {/* Warning eskalasi */}
                  {r.status === "escalate" && (
                    <p className="mt-2.5 text-[10px] text-red-500 border-t border-red-50 pt-2.5 px-1 font-bold flex items-center gap-1">
                      ⚠️ Eskalasi Otomatis (H+2 Tanpa Respons)
                    </p>
                  )}
                </div>
              );
            })}

            {/* Agent status summary */}
            {visibleCount === recipients.length && (
              <div className="mt-4 bg-emerald-600 text-white rounded-xl px-4 py-3 shadow-md">
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">
                  🤖 Monitoring Aktif
                </p>
                <p className="text-[11px] leading-relaxed mt-1 font-medium">
                  {repliedCount} dari {recipients.length} pemangku kepentingan telah merespons.{" "}
                  {pendingCount > 0
                    ? `Sedang memantau ${pendingCount} pihak lainnya. Reminder otomatis dijadwalkan pada 4 Mei 2026.`
                    : "Seluruh koordinasi tingkat wilayah telah selesai dikonfirmasi."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal thread email */}
      {selectedRecipient && (
        <EmailThreadModal
          recipient={selectedRecipient}
          onClose={() => setSelectedRecipient(null)}
        />
      )}
      {toast && (
        <div role="alert" aria-live="assertive" className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </>
  );
}
