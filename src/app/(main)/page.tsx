"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/ui/Map"), {
  ssr: false,
  loading: () => <div className="skeleton-shimmer rounded-xl w-full h-full min-h-[400px]"></div>
});
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getSupabase } from "@/lib/supabase";
import { SchoolWithIndex } from "@/lib/types";
import { formatIndex, getTierFromIndex } from "@/lib/utils";
import { IndexBadge } from "@/components/ui/IndexBadge";

// ══════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════
const TIER_COLORS: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MEDIUM: "#EAB308",
  LOW: "#22C55E",
};

const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK"];

// ══════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [schools, setSchools] = useState<SchoolWithIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("");

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

  // ── Derived: filter options ─────────────────────────────────
  const kecamatanOptions = useMemo(
    () =>
      Array.from(new Set(schools.map((s) => s.kecamatan)))
        .filter(Boolean)
        .sort(),
    [schools]
  );

  // ── Filtered data ───────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = schools;
    if (kecamatanFilter)
      result = result.filter((s) => s.kecamatan === kecamatanFilter);
    if (jenjangFilter)
      result = result.filter((s) => s.jenjang === jenjangFilter);
    return result;
  }, [schools, kecamatanFilter, jenjangFilter]);

  // ── KPI values ──────────────────────────────────────────────
  const kpi = useMemo(() => {
    const withIndex = filtered.filter((s) => s.school_index);
    const criticalCount = withIndex.filter(
      (s) => s.school_index.priority_tier === "CRITICAL"
    ).length;
    const avg =
      withIndex.length > 0
        ? withIndex.reduce((sum, s) => sum + s.school_index.sigapp_index, 0) /
          withIndex.length
        : 0;
    const kecamatanCount = new Set(filtered.map((s) => s.kecamatan)).size;

    return {
      total: filtered.length,
      critical: criticalCount,
      avgIndex: avg,
      kecamatanCovered: kecamatanCount,
    };
  }, [filtered]);

  // ── Top 10 ──────────────────────────────────────────────────
  const top10 = useMemo(() => {
    return [...filtered]
      .filter((s) => s.school_index)
      .sort(
        (a, b) => b.school_index.sigapp_index - a.school_index.sigapp_index
      )
      .slice(0, 10);
  }, [filtered]);

  // ── Bar chart: avg index per kecamatan ──────────────────────
  const barData = useMemo(() => {
    const agg: Record<string, { sum: number; count: number }> = {};
    for (const s of filtered) {
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
  }, [filtered]);

  // ── Pie chart: tier distribution ────────────────────────────
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    for (const s of filtered) {
      if (!s.school_index) continue;
      const tier =
        s.school_index.priority_tier ??
        getTierFromIndex(s.school_index.sigapp_index);
      counts[tier] = (counts[tier] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [filtered]);

  const hasFilters = kecamatanFilter !== "" || jenjangFilter !== "";

  // ══════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Education Priority Index · Jakarta
        </p>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          id="filter-kecamatan"
          value={kecamatanFilter}
          onChange={(e) => setKecamatanFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
                     transition-colors min-w-[170px]"
        >
          <option value="">All Kecamatan</option>
          {kecamatanOptions.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          id="filter-jenjang"
          value={jenjangFilter}
          onChange={(e) => setJenjangFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
                     transition-colors min-w-[130px]"
        >
          <option value="">All Jenjang</option>
          {JENJANG_OPTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            id="reset-filters"
            onClick={() => {
              setKecamatanFilter("");
              setJenjangFilter("");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg
                       border border-slate-200 bg-white text-slate-500
                       hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          Failed to load data: {error}
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────── */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* ── KPI Cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              id="kpi-total"
              icon={GraduationCap}
              label="Total Schools"
              value={kpi.total.toString()}
              color="#00B4B4"
            />
            <KpiCard
              id="kpi-critical"
              icon={AlertTriangle}
              label="Critical Priority"
              value={kpi.critical.toString()}
              color="#EF4444"
            />
            <KpiCard
              id="kpi-avg"
              icon={TrendingUp}
              label="Avg SIGAPP Index"
              value={formatIndex(kpi.avgIndex)}
              color="#F97316"
            />
            <KpiCard
              id="kpi-kecamatan"
              icon={MapPin}
              label="Kecamatan Covered"
              value={kpi.kecamatanCovered.toString()}
              color="#8B5CF6"
            />
          </div>

          {/* ── Map + Top 10 ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-8">
            {/* Interactive Leaflet Map */}
            <div className="relative rounded-xl" style={{ minHeight: 400, height: 500 }}>
              <DynamicMap schools={filtered} />
            </div>

            {/* Top 10 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Top 10 — Highest Index
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {top10.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-slate-400">
                    No data available.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {top10.map((s, i) => (
                      <li key={s.id}>
                        <Link
                          href={`/schools/${s.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Rank */}
                          <span className="text-xs font-bold text-slate-300 w-5 text-right tabular-nums">
                            {i + 1}
                          </span>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {s.school_name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {s.kecamatan}
                            </p>
                          </div>

                          {/* Badge */}
                          <IndexBadge
                            index={s.school_index.sigapp_index}
                          />

                          {/* Arrow */}
                          <ArrowRight
                            size={14}
                            className="text-slate-300 group-hover:text-teal transition-colors flex-shrink-0"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* ── Charts ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart — avg index per kecamatan */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">
                Average Index by Kecamatan
              </h2>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(barData.length * 36, 200)}>
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E2E8F0"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 1]}
                      tickCount={6}
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0D2137",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#fff",
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [
                        formatIndex(Number(value ?? 0)),
                        "Avg Index",
                      ]}
                    />
                    <Bar
                      dataKey="avg"
                      fill="#00B4B4"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                  No data available.
                </div>
              )}
            </div>

            {/* Pie chart — tier distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">
                Priority Tier Distribution
              </h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={{ stroke: "#94A3B8", strokeWidth: 1 }}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={TIER_COLORS[entry.name] ?? "#94A3B8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0D2137",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#fff",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                  No data available.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════

interface KpiCardProps {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

function KpiCard({ id, icon: Icon, label, value, color }: KpiCardProps) {
  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}14` }}
        >
          <Icon size={18} className="flex-shrink-0" style={{ color }} />
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-3xl font-bold text-slate-800 tabular-nums">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="skeleton-shimmer h-4 w-24 rounded mb-4" />
            <div className="skeleton-shimmer h-8 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Map + Top 10 skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="skeleton-shimmer rounded-xl" style={{ height: 400 }} />
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="skeleton-shimmer h-4 w-32 rounded mb-5" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-4">
              <div className="skeleton-shimmer h-3 w-4 rounded" />
              <div className="skeleton-shimmer h-3 flex-1 rounded" />
              <div className="skeleton-shimmer h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton-shimmer rounded-xl" style={{ height: 320 }} />
        <div className="skeleton-shimmer rounded-xl" style={{ height: 320 }} />
      </div>
    </div>
  );
}
