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
import { SchoolDetail } from "@/lib/types";
import { formatIndex, getTierFromIndex, getPillarName, TIER_BG_COLORS, PriorityTier } from "@/lib/utils";
import { IndexBadge } from "@/components/ui/IndexBadge";
import dynamic from 'next/dynamic';

const SchoolSankeyChart = dynamic(
  () => import('@/components/charts/SchoolSankeyChart'),
  { ssr: false, loading: () => <div className="h-[480px] skeleton-shimmer rounded-xl" /> }
)

const AgentStatusPanel = dynamic(
  () => import('@/components/agents/AgentStatusPanel'),
  { ssr: false, loading: () => <div className="h-[200px] skeleton-shimmer rounded-xl" /> }
)

// ── Pillar config ────────────────────────────────────────────────
const PILLARS = [
  { key: "p1_quality_gap", weight: 35 },
  { key: "p2_spatial_inequity", weight: 25 },
  { key: "p3_structural_risk", weight: 25 },
  { key: "p4_public_signal", weight: 15 },
] as const;

type PillarKey = (typeof PILLARS)[number]["key"];

function pillarBarColor(score: number): string {
  const tier = getTierFromIndex(score);
  return TIER_BG_COLORS[tier];
}

// ── Key variable cards config ───────────────────────────────────
const KEY_VARS = [
  { key: "literacy_score", label: "Literacy Score", icon: BookOpen, format: (v: number) => formatIndex(v) },
  { key: "numeracy_score", label: "Numeracy Score", icon: Calculator, format: (v: number) => formatIndex(v) },
  { key: "poverty_rate", label: "Poverty Rate", icon: Percent, format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: "travel_time_minutes", label: "Travel Time", icon: Clock, format: (v: number) => `${v} min` },
  { key: "building_damage_weight", label: "Building Damage", icon: Building2, format: (v: number) => formatIndex(v) },
  { key: "complaint_frequency", label: "Complaint Frequency", icon: MessageSquareWarning, format: (v: number) => v.toFixed(0) },
] as const;

// ════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════
export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch school ─────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    async function fetchSchool() {
      setLoading(true);
      setError(null);
      const sb = getSupabase();

      const { data, error: fetchErr } = await sb
        .from("schools")
        .select("*, school_index(*), pillar_variables(*)")
        .eq("id", id)
        .single();

      if (fetchErr || !data) {
        setError(fetchErr?.message ?? "School not found");
        setLoading(false);
        return;
      }

      const normalized: SchoolDetail = {
        ...data,
        school_index: Array.isArray(data.school_index)
          ? data.school_index[0]
          : data.school_index,
        pillar_variables: Array.isArray(data.pillar_variables)
          ? data.pillar_variables[0]
          : data.pillar_variables,
      } as SchoolDetail;

      setSchool(normalized);

      if (normalized.school_index) {
        const { count } = await sb
          .from("school_index")
          .select("id", { count: "exact", head: true })
          .gt("sigapp_index", normalized.school_index.sigapp_index);

        setRank(count !== null ? count + 1 : null);
      }

      setLoading(false);
    }

    fetchSchool();
  }, [id]);

  // ── Derived: radar chart data ──────────────────────────────────
  const radarData = useMemo(() => {
    if (!school?.school_index) return [];
    return PILLARS.map(({ key }) => ({
      pillar: getPillarName(key),
      score: school.school_index[key as PillarKey],
      fullMark: 1,
    }));
  }, [school]);

  // ── Derived: highest pillar ─────────────────────────────────────
  const highestPillar = useMemo(() => {
    if (!school?.school_index) return null;
    let max = { key: "", score: -1 };
    for (const { key } of PILLARS) {
      const s = school.school_index[key as PillarKey];
      if (s > max.score) max = { key, score: s };
    }
    return max;
  }, [school]);

  // ── Derived: analysis text ──────────────────────────────────────
  const analysisText = useMemo(() => {
    if (!school?.school_index) return "";
    const si = school.school_index;

    if (si.notes) return si.notes;

    const pillarLabel = highestPillar ? getPillarName(highestPillar.key) : "N/A";
    const pillarScore = highestPillar ? formatIndex(highestPillar.score) : "N/A";

    return `School ${school.school_name} in ${school.kecamatan} received a SIGAPP Index of ${formatIndex(si.sigapp_index)}, placing it in the ${si.priority_tier} priority tier. The primary concern is ${pillarLabel} (score: ${pillarScore}), which indicates structural and academic vulnerabilities requiring immediate attention.`;
  }, [school, highestPillar]);

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px]">
        <div className="skeleton-shimmer h-4 w-28 rounded mb-6" />
        <div className="skeleton-shimmer h-8 w-72 rounded mb-2" />
        <div className="skeleton-shimmer h-4 w-48 rounded mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton-shimmer h-80 rounded-xl" />
          <div className="skeleton-shimmer h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error || !school) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px]">
        <Link
          href="/schools"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal transition-colors mb-6"
        >
          <ArrowLeft size={15} /> All Schools
        </Link>
        <div className="px-4 py-8 rounded-xl bg-red-50 border border-red-200 text-center text-red-700">
          {error ?? "School not found."}
        </div>
      </div>
    );
  }

  const si = school.school_index;
  const pv = school.pillar_variables;
  const tier = (si?.priority_tier ?? getTierFromIndex(si?.sigapp_index ?? 0)) as PriorityTier;
  const tierColor = TIER_BG_COLORS[tier] ?? "#94A3B8";

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <Link
        href="/schools"
        id="back-to-schools"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal transition-colors mb-5"
      >
        <ArrowLeft size={15} /> All Schools
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {school.school_name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            NPSN {school.npsn}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {school.jenjang}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {school.kecamatan}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            SIGAPP Index
          </p>
          {si ? (
            <p className="text-4xl font-bold tabular-nums" style={{ color: tierColor }}>
              {formatIndex(si.sigapp_index)}
            </p>
          ) : (
            <p className="text-4xl font-bold text-slate-300">—</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Priority Tier
          </p>
          {si ? (
            <IndexBadge index={si.sigapp_index} tier={tier} />
          ) : (
            <p className="text-slate-300">—</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Rank
          </p>
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-amber-400" />
            <p className="text-4xl font-bold text-slate-800 tabular-nums">
              {rank !== null ? `#${rank}` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">
            Pillar Breakdown
          </h2>
          <div className="space-y-4 mb-6">
            {PILLARS.map(({ key, weight }) => {
              const score = si?.[key as PillarKey] ?? 0;
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
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(score * 100, 100)}%`, backgroundColor: barColor }}
                    />
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [formatIndex(Number(value ?? 0)), "Score"]}
                  />
                  <Radar name="Score" dataKey="score" stroke="#00B4B4" fill="#00B4B4" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
            Analysis Summary
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{analysisText}</p>
          <p className="mt-6 text-xs italic text-slate-400">
            Note: LLM-powered narrative coming in Phase 2.
          </p>
        </div>
      </div>

      {pv && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
            Key Variables
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {KEY_VARS.map(({ key, label, icon: Icon, format }) => {
              const value = pv[key as keyof typeof pv] as number;
              return (
                <div key={key} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <Icon size={18} className="text-teal mb-2" />
                  <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                  <p className="text-lg font-bold text-slate-800 tabular-nums">{format(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {si && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Data Flow — Transparansi Metodologi
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Alur nilai dari sumber data → variabel → pilar → SIGAPP Index untuk sekolah ini.
            Hover pada node atau link untuk melihat nilai aktual.
          </p>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
            <SchoolSankeyChart schoolIndex={si} pillarVariables={pv ?? null} />
          </div>
        </div>
      )}

      {/* Agent Section */}
      {si && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
            SIGAPP Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AgentStatusPanel
              agentType="report"
              priorityTier={si.priority_tier}
              sigappIndex={si.sigapp_index}
              schoolName={school.school_name}
              school={{
                id: school.id,
                name: school.school_name,
                address: school.address,
                kelurahan: school.kelurahan,
                kecamatan: school.kecamatan,
              }}
              schoolIndex={si}
              pillarVariables={pv ?? null}
            />
            <AgentStatusPanel
              agentType="email"
              priorityTier={si.priority_tier}
              sigappIndex={si.sigapp_index}
              schoolName={school.school_name}
              school={{
                id: school.id,
                name: school.school_name,
                address: school.address,
                kelurahan: school.kelurahan,
                kecamatan: school.kecamatan,
              }}
              schoolIndex={si}
              pillarVariables={pv ?? null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
