// src/hooks/useSekolahNTT.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { SekolahNTT, Jenjang } from "@/lib/types-ntt";

interface UseSekolahNTTOptions {
  jenjang?: Jenjang[];      // filter jenjang, kosong = semua
  kota?: string;            // filter kota/kabupaten
  limit?: number;           // default 2000
}

interface UseSekolahNTTReturn {
  data: SekolahNTT[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  stats: Record<Jenjang, number>;
}

export function useSekolahNTT(
  options: UseSekolahNTTOptions = {}
): UseSekolahNTTReturn {
  const { jenjang, kota, limit = 2000 } = options;

  const [data, setData]       = useState<SekolahNTT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("sekolah_ntt")
        .select("id, name, jenjang, addr_city, addr_street, operator, isced_level, website, phone, lat, lon")
        .not("lat", "is", null)
        .not("lon", "is", null)
        .limit(limit);

      // Filter jenjang (multi-value)
      if (jenjang && jenjang.length > 0) {
        query = query.in("jenjang", jenjang);
      }

      // Filter kota
      if (kota) {
        query = query.ilike("addr_city", `%${kota}%`);
      }

      const { data: rows, error: err } = await query;

      if (err) throw err;

      setData((rows as SekolahNTT[]) ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal fetch data sekolah NTT");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jenjang?.join(","), kota, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hitung stats per jenjang
  const stats = data.reduce(
    (acc, s) => {
      acc[s.jenjang] = (acc[s.jenjang] ?? 0) + 1;
      return acc;
    },
    {} as Record<Jenjang, number>
  );

  return { data, loading, error, refetch: fetchData, stats };
}
