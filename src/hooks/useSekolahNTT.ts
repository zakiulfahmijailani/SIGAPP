// src/hooks/useSekolahNTT.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Jenjang, SekolahNTTFull, PriorityTierNTT } from "@/lib/types-ntt";
import { getTierNTT } from "@/lib/utils-ntt";

// ─────────────────────────────────────────────
// OPTIONS
// ─────────────────────────────────────────────

interface UseSekolahNTTOptions {
  jenjang?: Jenjang[];
  kabupaten?: string;
  tier?: PriorityTierNTT[];
  limit?: number;
}

interface UseSekolahNTTReturn {
  data: SekolahNTTFull[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  stats: {
    byJenjang: Partial<Record<Jenjang, number>>;
    byTier: Partial<Record<PriorityTierNTT, number>>;
    byKabupaten: Record<string, number>;
    total: number;
    hasIndex: number;   // berapa yang sudah punya sigapp_index
  };
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useSekolahNTT(
  options: UseSekolahNTTOptions = {}
): UseSekolahNTTReturn {
  const { jenjang, kabupaten, tier, limit = 3000 } = options;

  const [data, setData]       = useState<SekolahNTTFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Query dari VIEW sekolah_ntt_full (sudah join index + pillar)
      let query = supabase
        .from("sekolah_ntt_full")
        .select("*")
        .not("lat", "is", null)
        .not("lon", "is", null)
        .limit(limit);

      if (jenjang && jenjang.length > 0) {
        query = query.in("jenjang", jenjang);
      }

      if (kabupaten) {
        query = query.ilike("kabupaten", `%${kabupaten}%`);
      }

      const { data: rows, error: err } = await query;
      if (err) throw err;

      let result = (rows as SekolahNTTFull[]) ?? [];

      // Filter by tier (client-side, karena tier dihitung dari sigapp_index)
      if (tier && tier.length > 0) {
        result = result.filter((s) =>
          tier.includes(getTierNTT(s.sigapp_index ?? undefined))
        );
      }

      setData(result);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Gagal fetch data sekolah NTT"
      );
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    jenjang?.join(","),
    kabupaten,
    tier?.join(","),
    limit,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stats ──────────────────────────────────
  const stats = data.reduce(
    (acc, s) => {
      // by jenjang
      acc.byJenjang[s.jenjang] = (acc.byJenjang[s.jenjang] ?? 0) + 1;

      // by tier
      const t = getTierNTT(s.sigapp_index ?? undefined);
      acc.byTier[t] = (acc.byTier[t] ?? 0) + 1;

      // by kabupaten
      const kab = s.kabupaten ?? s.addr_city ?? "Tidak Diketahui";
      acc.byKabupaten[kab] = (acc.byKabupaten[kab] ?? 0) + 1;

      // has index
      if (s.sigapp_index != null) acc.hasIndex += 1;

      acc.total += 1;
      return acc;
    },
    {
      byJenjang: {} as Partial<Record<Jenjang, number>>,
      byTier: {} as Partial<Record<PriorityTierNTT, number>>,
      byKabupaten: {} as Record<string, number>,
      total: 0,
      hasIndex: 0,
    }
  );

  return { data, loading, error, refetch: fetchData, stats };
}

// ─────────────────────────────────────────────
// SINGLE SCHOOL HOOK — untuk halaman /ntt/[id]
// ─────────────────────────────────────────────

interface UseSekolahNTTDetailReturn {
  data: SekolahNTTFull | null;
  loading: boolean;
  error: string | null;
}

export function useSekolahNTTDetail(
  schoolId: number | null
): UseSekolahNTTDetailReturn {
  const [data, setData]       = useState<SekolahNTTFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;

    setLoading(true);
    setError(null);

    supabase
      .from("sekolah_ntt_full")
      .select("*")
      .eq("id", schoolId)
      .single()
      .then(({ data: row, error: err }) => {
        if (err) setError(err.message);
        else setData(row as SekolahNTTFull);
        setLoading(false);
      });
  }, [schoolId]);

  return { data, loading, error };
}
