"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  BookOpen,
  Calculator,
  Percent,
  Clock,
  Building2,
  MessageSquareWarning,
  ChevronRight,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getSupabase } from "@/lib/supabase";
import { SekolahNTTFull } from "@/lib/types";
import { formatIndex, getTierFromIndex, getPillarName, TIER_BG_COLORS } from "@/lib/utils";
import dynamic from 'next/dynamic';

const SchoolSankeyChart = dynamic(
  () => import('@/components/charts/SchoolSankeyChart'),
  { ssr: false, loading: () => <div className="h-[480px] skeleton-shimmer rounded-xl" /> }
);

const AgentStatusPanel = dynamic(
  () => import('@/components/agents/AgentStatusPanel'),
  { ssr: false, loading: () => <div className="h-[200px] skeleton-shimmer rounded-xl" /> }
);

const AgentDecisionPanel = dynamic(
  () => import('@/components/agents/AgentDecisionPanel'),
  { ssr: false, loading: () => <div className="h-[120px] skeleton-shimmer rounded-xl mb-6" /> }
);

const PILLARS = [
  { key: "p1_quality_gap",       weight: 35 },
  { key: "p2_spatial_inequity",  weight: 25 },
  { key: "p3_structural_risk",   weight: 25 },
  { key: "p4_public_signal",     weight: 15 },
] as const;

type PillarKey = (typeof PILLARS)[number]["key"];

function pillarBarColor(score: number): string {
  return TIER_BG_COLORS[getTierFromIndex(score)];
}

// NTT-specific key variables (from sekolah_ntt_full columns)
const KEY_VARS = [
  { key: "teacher_ratio",        label: "Rasio Guru/Siswa",  icon: BookOpen,            format: (v: number | null) => v != null ? v.toFixed(2) : "—" },
  { key: "facility_score",       label: "Skor Fasilitas",    icon: Calculator,          format: (v: number | null) => v != null ? formatIndex(v) : "—" },
  { key: "nearest_school_km",    label: "Sekolah Terdekat",  icon: Clock,               format: (v: number | null) => v != null ? `${v.toFixed(1)} km` : "—" },
  { key: "disaster_risk_score",  label: "Risiko Bencana",    icon: Building2,           format: (v: number | null) => v != null ? formatIndex(v) : "—" },
  { key: "total_students",       label: "Total Siswa",       icon: Percent,             format: (v: number | null) => v != null ? v.toLocaleString('id-ID') : "—" },
  { key: "total_teachers",       label: "Total Guru",        icon: MessageSquareWarning,format: (v: number | null) => v != null ? v.toLocaleString('id-ID') : "—" },
] as const;

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<SekolahNTTFull | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchSchool() {
      setLoading(true);
      setError(null);
      const sb = getSupabase();

      const { data, error: fetchErr } = await sb
        .from("sekolah_ntt_full")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (fetchErr || !data) {
        setError(fetchErr?.message ?? "Sekolah tidak ditemukan");
        setLoading(false);
        return;
      }

      setSchool(data as SekolahNTTFull);

      // Calculate rank: count schools with higher sigapp_index
      const { count } = await sb
        .from("sekolah_ntt_full")
        .select("id", { count: "exact", head: true })
        .gt("sigapp_index", (data as SekolahNTTFull).sigapp_index);

      setRank(count !== null ? count + 1 : null);
      setLoading(false);
    }
    fetchSchool();
  }, [id]);

  const radarData = useMemo(() => {
    if (!school) return [];
    return PILLARS.map(({ key }) => ({
      pillar: getPillarName(key),
      score: school[key as PillarKey] ?? 0,
      fullMark: 1,
    }));
  }, [school]);

  const highestPillar = useMemo(() => {
    if (!school) return null;
    let max = { key: "", score: -1 };
    for (const { key } of PILLARS) {
      const s = school[key as PillarKey] ?? 0;
      if (s > max.score) max = { key, score: s };
    }
    return max;
  }, [school]);

  const analysisText = useMemo(() => {
    if (!school) return "";
    if (school.index_notes) return school.index_notes;
    const tier = getTierFromIndex(school.sigapp_index);
    const pillarLabel = highestPillar ? getPillarName(highestPillar.key) : "N/A";
    const pillarScore = highestPillar ? formatIndex(highestPillar.score) : "N/A";
    return `Sekolah ${school.school_name} di ${school.kecamatan}, ${school.kabupaten} mendapat SIGAPP Index ${formatIndex(school.sigapp_index)}, masuk tier prioritas ${tier}. Indikator utama: ${pillarLabel} (skor: ${pillarScore}).`;
  }, [school, highestPillar]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="space-y-2">
          <div className="h-6 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-200" />
        </div>
        <div className="h-16 w-40 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-200" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px]">
        <Link href="/schools" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-500 transition-colors mb-6">
          <ArrowLeft size={15} /> Semua Sekolah
        </Link>
        <div className="px-4 py-8 rounded-xl bg-red-50 border border-red-200 text-center text-red-700">
          {error ?? "Sekolah tidak ditemukan."}
        </div>
      </div>
    );
  }

  const tier = getTierFromIndex(school.sigapp_index);
  const tierColor = TIER_BG_COLORS[tier] ?? "#94A3B8";

  // Build school_index shape for legacy components (AgentStatusPanel, SchoolSankeyChart)
  const si = {
    id: String(school.id),
    school_id: String(school.id),
    sigapp_index: school.sigapp_index,
    p1_quality_gap: school.p1_quality_gap,
    p2_spatial_inequity: school.p2_spatial_inequity,
    p3_structural_risk: school.p3_structural_risk,
    p4_public_signal: school.p4_public_signal,
    notes: school.index_notes,
    computed_at: school.computed_at ?? "",
  };

  // Build school shape for AgentStatusPanel
  const schoolShape = {
    id: String(school.id),
    school_name: school.school_name,
    address: school.addr_street ?? "",
    kelurahan: "",
    kecamatan: school.kecamatan,
    kota: school.kabupaten,
    jenjang: school.jenjang as 'SD' | 'SMP' | 'SMA' | 'SMK',
    npsn: school.npsn,
    total_students: school.total_students,
    total_teachers: school.total_teachers,
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-[#00B4B4] transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <Link href="/schools" className="hover:text-[#00B4B4] transition-colors">Sekolah</Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate max-w-[200px] text-slate-800 font-medium">{school.school_name}</span>
      </nav>

      <Link href="/schools" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-500 transition-colors mb-5">
        <ArrowLeft size={15} /> Semua Sekolah
      </Link>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{school.school_name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">NPSN {school.npsn}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{school.jenjang}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{school.kecamatan}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{school.kabupaten}</span>
        </div>
      </div>

      {/* Agent Decision Panel */}
      <AgentDecisionPanel
        dominantPillar="P3 — Structural Risk"
        dominantScore={school.p3_structural_risk}
        previousTier="SEDANG"
        currentTier={tier}
        tierChanged={false}
        analysisDate={school.computed_at ? new Date(school.computed_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : "—"}
        reportGenerated={true}
        emailDispatched={tier === 'KRITIS' || tier === 'TINGGI'}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">SIGAPP Index</p>
          <p className="text-4xl font-bold tabular-nums" style={{ color: tierColor }}>
            {formatIndex(school.sigapp_index)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Rank</p>
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-amber-400" />
            <p className="text-4xl font-bold text-slate-800 tabular-nums">
              {rank !== null ? `#${rank}` : "—"}
            </p>
          </div>
        </div>

        <AgentStatusPanel
          agentType="report"
          priorityTier={tier}
          sigappIndex={school.sigapp_index}
          schoolName={school.school_name}
          school={schoolShape}
          schoolIndex={si}
          pillarVariables={null}
        />

        <AgentStatusPanel
          agentType="email"
          priorityTier={tier}
          sigappIndex={school.sigapp_index}
          schoolName={school.school_name}
          school={schoolShape}
          schoolIndex={si}
          pillarVariables={null}
        />
      </div>

      {/* Pillar Breakdown + Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">Pillar Breakdown</h2>
          <div className="space-y-4 mb-6">
            {PILLARS.map(({ key, weight }) => {
              const score = school[key as PillarKey] ?? 0;
              const barColor = pillarBarColor(score);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{getPillarName(key)}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-8 text-right">{weight}%</span>
                      <span className="font-semibold tabular-nums w-10 text-right" style={{ color: barColor }}>
                        {formatIndex(score)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(score * 100, 100)}%`, backgroundColor: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
          {radarData.length > 0 && (
            <div className="mt-2 -mx-2">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fontSize: 10, fill: "#94A3B8" }} tickCount={5} />
                  <Tooltip
                    contentStyle={{ background: "#0D2137", border: "none", borderRadius: 8, fontSize: 12, color: "#fff" }}
                    formatter={(value) => [formatIndex(Number(value ?? 0)), "Score"]}
                  />
                  <Radar name="Score" dataKey="score" stroke="#00B4B4" fill="#00B4B4" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Analysis Summary</h2>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{analysisText}</p>
          {school.internet_access !== null && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400">Akses Internet:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ school.internet_access ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                {school.internet_access ? 'Tersedia' : 'Tidak Tersedia'}
              </span>
            </div>
          )}
          {school.remote_status !== null && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Status Terpencil:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ school.remote_status ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600' }`}>
                {school.remote_status ? 'Ya' : 'Tidak'}
              </span>
            </div>
          )}
          <p className="mt-6 text-xs italic text-slate-400">Note: LLM-powered narrative coming in Phase 2.</p>
        </div>
      </div>

      {/* Key Variables */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Key Variables</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {KEY_VARS.map(({ key, label, icon: Icon, format }) => {
            const value = school[key as keyof SekolahNTTFull] as number | null;
            return (
              <div key={key} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <Icon size={18} className="text-teal-500 mb-2" />
                <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                <p className="text-lg font-bold text-slate-800 tabular-nums">{format(value)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sankey */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Data Flow — Transparansi Metodologi</h2>
        <p className="text-xs text-slate-400 mb-4">
          Alur nilai dari sumber data → variabel → pilar → SIGAPP Index untuk sekolah ini.
        </p>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
          <SchoolSankeyChart schoolIndex={si} pillarVariables={null} />
        </div>
      </div>
    </div>
  );
}
