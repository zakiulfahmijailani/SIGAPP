"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapPin,
  AlertOctagon,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getSupabase } from "@/lib/supabase";
import { SchoolWithIndex } from "@/lib/types";
import { formatIndex, getPillarName } from "@/lib/utils";

export default function InsightsPage() {
  const [schools, setSchools] = useState<SchoolWithIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────
  useEffect(() => {
    async function fetchSchools() {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await getSupabase()
        .from("schools")
        .select("*, school_index(*)");

      if (fetchErr) {
        setError(fetchErr.message);
        setLoading(false);
        return;
      }

      const normalized = (data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        school_index: Array.isArray(s.school_index)
          ? s.school_index[0]
          : s.school_index,
      })) as SchoolWithIndex[];

      setSchools(normalized);
      setLoading(false);
    }

    fetchSchools();
  }, []);

  // ── Derived Data for Chart 1: Avg Index per Kecamatan ───────
  const kecamatanData = useMemo(() => {
    const agg: Record<string, { sum: number; count: number }> = {};
    for (const s of schools) {
      if (!s.school_index) continue;
      if (!agg[s.kecamatan]) agg[s.kecamatan] = { sum: 0, count: 0 };
      agg[s.kecamatan].sum += s.school_index.sigapp_index;
      agg[s.kecamatan].count += 1;
    }
    return Object.entries(agg)
      .map(([name, { sum, count }]) => ({
        name,
        avg: parseFloat((sum / count).toFixed(3)),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [schools]);

  // ── Derived Data for Chart 2: Avg Pillar per Jenjang ────────
  const jenjangData = useMemo(() => {
    const agg: Record<string, { p1: number; p2: number; p3: number; p4: number; count: number }> = {};
    const jenjangs = ["SD", "SMP", "SMA", "SMK"];
    jenjangs.forEach((j) => (agg[j] = { p1: 0, p2: 0, p3: 0, p4: 0, count: 0 }));

    for (const s of schools) {
      if (!s.school_index) continue;
      const j = s.jenjang;
      if (agg[j]) {
        agg[j].p1 += s.school_index.p1_quality_gap;
        agg[j].p2 += s.school_index.p2_spatial_inequity;
        agg[j].p3 += s.school_index.p3_structural_risk;
        agg[j].p4 += s.school_index.p4_public_signal;
        agg[j].count += 1;
      }
    }

    return Object.entries(agg).map(([name, totals]) => ({
      name,
      P1: totals.count > 0 ? parseFloat((totals.p1 / totals.count).toFixed(3)) : 0,
      P2: totals.count > 0 ? parseFloat((totals.p2 / totals.count).toFixed(3)) : 0,
      P3: totals.count > 0 ? parseFloat((totals.p3 / totals.count).toFixed(3)) : 0,
      P4: totals.count > 0 ? parseFloat((totals.p4 / totals.count).toFixed(3)) : 0,
    }));
  }, [schools]);

  // ── Derived Data for Stat Cards ─────────────────────────────
  const stats = useMemo(() => {
    if (schools.length === 0) return { riskKecamatan: "—", weakestPillar: "—", studentsAtRisk: 0 };

    // Most At-Risk Kecamatan
    const topKec = kecamatanData.length > 0 ? kecamatanData[0] : null;

    // Weakest Pillar overall
    let p1Sum = 0, p2Sum = 0, p3Sum = 0, p4Sum = 0, count = 0;
    for (const s of schools) {
      if (s.school_index) {
        p1Sum += s.school_index.p1_quality_gap;
        p2Sum += s.school_index.p2_spatial_inequity;
        p3Sum += s.school_index.p3_structural_risk;
        p4Sum += s.school_index.p4_public_signal;
        count++;
      }
    }
    
    let weakestPillarName = "—";
    if (count > 0) {
      const avgs = [
        { key: "p1_quality_gap", avg: p1Sum / count },
        { key: "p2_spatial_inequity", avg: p2Sum / count },
        { key: "p3_structural_risk", avg: p3Sum / count },
        { key: "p4_public_signal", avg: p4Sum / count },
      ];
      avgs.sort((a, b) => b.avg - a.avg);
      weakestPillarName = `${getPillarName(avgs[0].key)} (${formatIndex(avgs[0].avg)})`;
    }

    // Students in Critical+High schools
    let atRiskStudents = 0;
    for (const s of schools) {
      if (s.school_index && (s.school_index.priority_tier === "CRITICAL" || s.school_index.priority_tier === "HIGH")) {
        atRiskStudents += s.total_students || 0;
      }
    }

    return {
      riskKecamatan: topKec ? `${topKec.name} (${formatIndex(topKec.avg)})` : "—",
      weakestPillar: weakestPillarName,
      studentsAtRisk: atRiskStudents,
    };
  }, [schools, kecamatanData]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Macro Insights</h1>
        <p className="mt-1 text-sm text-slate-500">
          Aggregated analytics for regional education prioritization
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          Failed to load data: {error}
        </div>
      )}

      {loading ? (
        <InsightsSkeleton />
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart 1: Avg Index per Kecamatan */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">
                Avg Index by Kecamatan
              </h2>
              {kecamatanData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(kecamatanData.length * 36, 300)}>
                  <BarChart
                    data={kecamatanData}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis type="number" domain={[0, 1]} tickCount={6} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0D2137", border: "none", borderRadius: 8, fontSize: 12, color: "#fff" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [formatIndex(Number(value ?? 0)), "Avg Index"]}
                    />
                    <Bar dataKey="avg" fill="#00B4B4" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">No data available.</div>
              )}
            </div>

            {/* Chart 2: Avg Pillar Scores by Jenjang */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">
                Avg Pillar Scores by Jenjang
              </h2>
              {jenjangData.length > 0 ? (
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={jenjangData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis type="number" domain={[0, 1]} tickCount={6} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#0D2137", border: "none", borderRadius: 8, fontSize: 12, color: "#fff" }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [formatIndex(Number(value ?? 0)), "Avg Score"]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar dataKey="P1" name="P1 Quality Gap" fill="#EF4444" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="P2" name="P2 Spatial Ineq." fill="#F97316" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="P3" name="P3 Struct. Risk" fill="#EAB308" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="P4" name="P4 Public Signal" fill="#00B4B4" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">No data available.</div>
              )}
            </div>
          </div>

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <MapPin size={20} />
                </div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Most At-Risk Kecamatan</h3>
              </div>
              <p className="text-xl font-bold text-slate-800">{stats.riskKecamatan}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <AlertOctagon size={20} />
                </div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weakest Pillar Overall</h3>
              </div>
              <p className="text-xl font-bold text-slate-800">{stats.weakestPillar}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Users size={20} />
                </div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students in Critical/High</h3>
              </div>
              <p className="text-xl font-bold text-slate-800 tabular-nums">{stats.studentsAtRisk.toLocaleString()}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton-shimmer h-[400px] rounded-xl" />
        <div className="skeleton-shimmer h-[400px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex gap-3 mb-2 items-center">
              <div className="skeleton-shimmer h-10 w-10 rounded-full" />
              <div className="skeleton-shimmer h-4 w-32 rounded" />
            </div>
            <div className="skeleton-shimmer h-6 w-48 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
