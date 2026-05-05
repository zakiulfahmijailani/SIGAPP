"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSekolahNTTDetail } from "@/hooks/useSekolahNTT";
import { 
  JENJANG_COLOR, 
  PILLAR_LABEL, 
  PILLAR_ICON 
} from "@/lib/types-ntt";
import { 
  getTierNTT, 
  getTierBgHex, 
  getTierLabel, 
  getTierColorNTT, 
  getDisplayName, 
  formatIndex 
} from "@/lib/utils-ntt";
import TierChangeTimeline from "@/components/agents/TierChangeTimeline";
import AgentDecisionPanel from "@/components/agents/AgentDecisionPanel";

export default function NTTSchoolDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: school, loading, error } = useSekolahNTTDetail(id);

  // ── Mock Timeline Data ──────────────────────────────────────────────────
  const mockTimeline = useMemo(() => {
    if (!school) return [];
    
    const currentIdx = school.sigapp_index ?? 0.45;
    
    // Generate 5 months of history
    const months = ["Januari", "Februari", "Maret", "April", "Mei"];
    return months.map((m, i) => {
      const isLast = i === months.length - 1;
      const val = isLast ? currentIdx : currentIdx - (0.05 * (months.length - 1 - i));
      const t = getTierNTT(val);
      const displayTier = t === "RENDAH" ? "NORMAL" : t;

      return {
        month: `${m} 2026`,
        tier: displayTier,
        index: val,
        note: isLast ? "Hasil analisis siklus terbaru" : "Pemantauan rutin",
        agentDetected: val > 0.6,
      };
    });
  }, [school]);

  // ── Render States ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 animate-pulse">Memuat data sekolah NTT...</p>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Data tidak ditemukan</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          {error || "Maaf, sekolah yang Anda cari tidak tersedia di database NTT."}
        </p>
        <Link href="/ntt" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl transition-all border border-slate-700">
          ← Kembali ke Peta NTT
        </Link>
      </div>
    );
  }

  if (!school) return null;

  const name = getDisplayName(school);
  const tier = getTierNTT(school.sigapp_index);
  const tierHex = getTierBgHex(tier);
  const jenjangColor = JENJANG_COLOR[school.jenjang];

  const pillars = [
    { id: "p1_quality_gap", label: PILLAR_LABEL.p1_quality_gap, icon: PILLAR_ICON.p1_quality_gap, val: school.p1_quality_gap },
    { id: "p2_spatial_inequity", label: PILLAR_LABEL.p2_spatial_inequity, icon: PILLAR_ICON.p2_spatial_inequity, val: school.p2_spatial_inequity },
    { id: "p3_structural_risk", label: PILLAR_LABEL.p3_structural_risk, icon: PILLAR_ICON.p3_structural_risk, val: school.p3_structural_risk },
    { id: "p4_public_signal", label: PILLAR_LABEL.p4_public_signal, icon: PILLAR_ICON.p4_public_signal, val: school.p4_public_signal },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* ── Top Navigation ── */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/ntt" className="text-sm font-bold text-teal-400 hover:text-teal-300 flex items-center gap-2 transition-colors">
            ← Kembali ke Peta NTT
          </Link>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold hidden sm:block">
            SIGAPP School Detail • NTT
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* ── Section 5: Agent Decision Panel ── */}
        <AgentDecisionPanel 
          dominantPillar={pillars.reduce((prev, current) => ((prev.val ?? 0) > (current.val ?? 0)) ? prev : current).label}
          dominantScore={pillars.reduce((prev, current) => ((prev.val ?? 0) > (current.val ?? 0)) ? prev : current).val ?? 0}
          previousTier={mockTimeline[mockTimeline.length - 2]?.tier}
          currentTier={tier === "RENDAH" ? "NORMAL" : tier}
          tierChanged={mockTimeline[mockTimeline.length - 2]?.tier !== (tier === "RENDAH" ? "NORMAL" : tier)}
          analysisDate={new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " WITA"}
          reportGenerated={tier === "KRITIS" || tier === "TINGGI"}
          emailDispatched={tier === "KRITIS"}
        />

        {/* ── Section 1: Header Sekolah ── */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-lg text-xs font-black text-white" style={{ backgroundColor: jenjangColor }}>
              {school.jenjang}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-black border ${getTierColorNTT(tier)}`}>
              {getTierLabel(tier)}
            </span>
            <span className="text-slate-500 text-xs font-mono ml-auto">NPSN: {school.npsn || "—"}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
            {name}
          </h1>
          
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="text-teal-500">📍</span>
            <span>{school.kabupaten || "—"}</span>
            <span className="opacity-30">•</span>
            <span>Kec. {school.kecamatan || "—"}</span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (SIGAPP Index & Pillars) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ── Section 2: SIGAPP Index Card ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl font-black italic">INDEX</div>
              
              <div className="relative z-10">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mb-4">SIGAPP COMPOSITE INDEX</p>
                <div className="flex items-baseline gap-4 mb-6">
                  <h2 className="text-7xl font-black tracking-tighter" style={{ color: tierHex }}>
                    {formatIndex(school.sigapp_index)}
                  </h2>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400">NTT Tier 2026</span>
                    <span className={`text-sm font-black ${getTierColorNTT(tier).split(' ')[0]}`}>{getTierLabel(tier)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3 mb-10 border border-slate-700/50">
                  <div 
                    className="h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-1000"
                    style={{ 
                      width: `${((school.sigapp_index ?? 0) * 100).toFixed(1)}%`,
                      backgroundColor: tierHex,
                      boxShadow: `0 0 15px ${tierHex}44`
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  {pillars.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.icon}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.label}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">{(p.val ?? 0).toFixed(3)}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 delay-300"
                          style={{ 
                            width: `${((p.val ?? 0) * 100).toFixed(1)}%`,
                            backgroundColor: tierHex,
                            opacity: 0.8
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 4: Tier Change Timeline ── */}
            <TierChangeTimeline 
              entries={mockTimeline}
              schoolName={name}
            />

          </div>

          {/* Right Column (Info Sekolah) */}
          <div className="space-y-8">
            
            {/* ── Section 3: Info Sekolah ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">
                Informasi Institusi
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Alamat</p>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {school.address || school.addr_street || "Informasi alamat tidak tersedia"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Siswa</p>
                    <p className="text-sm text-white font-bold">{school.total_students ? school.total_students.toLocaleString("id-ID") : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Guru</p>
                    <p className="text-sm text-white font-bold">{school.total_teachers ? school.total_teachers.toLocaleString("id-ID") : "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Operator</p>
                  <p className="text-sm text-slate-200 font-medium">🏙 {school.operator || "—"}</p>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Akses Internet</span>
                    <span className={`font-bold ${school.internet_access ? 'text-emerald-400' : 'text-red-400'}`}>
                      {school.internet_access ? "✅ Tersedia" : "❌ Tidak Ada"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status Wilayah</span>
                    <span className="text-slate-200 font-bold">
                      {school.remote_status ? "🏔 Terpencil / 3T" : "—"}
                    </span>
                  </div>
                </div>

                {school.phone && (
                  <div className="pt-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Kontak</p>
                    <p className="text-sm text-teal-400 font-mono">📞 {school.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions / External Links */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-1 gap-3">
                <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all text-center">
                  📄 Cetak Profil Sekolah
                </button>
                {school.website && (
                  <a href={school.website} target="_blank" className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all text-center">
                    🌐 Kunjungi Website
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
