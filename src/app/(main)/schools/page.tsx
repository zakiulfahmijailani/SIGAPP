"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { SchoolWithIndex } from "@/lib/types";
import { IndexBadge } from "@/components/ui/IndexBadge";
import { SkeletonRow } from "@/components/ui/SkeletonRow";

const PAGE_SIZE = 20;

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolWithIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  // ── Fetch data ──────────────────────────────────────────────
  useEffect(() => {
    async function fetchSchools() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getSupabase()
        .from("schools")
        .select("*, school_index(*)")
        .order("sigapp_index", {
          foreignTable: "school_index",
          ascending: false,
        });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      // Normalize: Supabase returns school_index as array or object
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

  // ── Derived: unique filter options ──────────────────────────
  const kecamatanOptions = useMemo(
    () =>
      Array.from(new Set(schools.map((s) => s.kecamatan)))
        .filter(Boolean)
        .sort(),
    [schools]
  );

  const jenjangOptions: string[] = ["SD", "SMP", "SMA", "SMK"];

  // ── Filtered + paginated data ───────────────────────────────
  const filtered = useMemo(() => {
    let result = schools;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.school_name.toLowerCase().includes(q)
      );
    }

    if (kecamatanFilter) {
      result = result.filter((s) => s.kecamatan === kecamatanFilter);
    }

    if (jenjangFilter) {
      result = result.filter((s) => s.jenjang === jenjangFilter);
    }

    return result;
  }, [schools, search, kecamatanFilter, jenjangFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, kecamatanFilter, jenjangFilter]);

  // ── Rank helper (global rank in filtered set) ───────────────
  function getRank(pageIndex: number) {
    return (page - 1) * PAGE_SIZE + pageIndex + 1;
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Schools</h1>
        <p className="mt-1 text-sm text-slate-500">
          Jakarta · {loading ? "…" : `${filtered.length} schools`}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            id="search-schools"
            type="text"
            placeholder="Search school name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white
                       text-slate-700 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
                       transition-colors"
          />
        </div>

        {/* Kecamatan */}
        <select
          id="filter-kecamatan"
          value={kecamatanFilter}
          onChange={(e) => setKecamatanFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
                     transition-colors min-w-[160px]"
        >
          <option value="">All Kecamatan</option>
          {kecamatanOptions.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        {/* Jenjang */}
        <select
          id="filter-jenjang"
          value={jenjangFilter}
          onChange={(e) => setJenjangFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
                     transition-colors min-w-[120px]"
        >
          <option value="">All Jenjang</option>
          {jenjangOptions.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          Failed to load schools: {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider w-[60px]">
                  Rank
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Kecamatan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider w-[90px]">
                  Jenjang
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider w-[140px]">
                  SIGAPP Index
                </th>
                <th className="px-4 py-3 w-[50px]" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonRow key={i} columns={6} />
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No schools found.
                  </td>
                </tr>
              ) : (
                paged.map((school, i) => (
                  <tr
                    key={school.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 text-slate-400 font-medium tabular-nums">
                      {getRank(i)}
                    </td>

                    {/* School Name */}
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[280px] truncate">
                      {school.school_name}
                    </td>

                    {/* Kecamatan */}
                    <td className="px-4 py-3 text-slate-600">
                      {school.kecamatan}
                    </td>

                    {/* Jenjang */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {school.jenjang}
                      </span>
                    </td>

                    {/* SIGAPP Index */}
                    <td className="px-4 py-3">
                      {school.school_index ? (
                        <IndexBadge
                          index={school.school_index.sigapp_index}
                        />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Link */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/schools/${school.id}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md
                                   text-slate-400 hover:text-teal hover:bg-teal/10 transition-colors"
                        aria-label={`View ${school.school_name}`}
                      >
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                id="pagination-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm
                           border border-slate-200 bg-white text-slate-600
                           hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-xs text-slate-600 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                id="pagination-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm
                           border border-slate-200 bg-white text-slate-600
                           hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
