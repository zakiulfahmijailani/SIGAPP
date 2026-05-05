import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { SekolahNTTFull } from "@/lib/types";
import { PriorityTier } from "@/lib/utils";

// Map priority_tier to CSS key (same logic as Jakarta)
export function getPriorityClassFromTier(tier: PriorityTier): string {
  switch (tier) {
    case 'KRITIS': return 'sangat_prioritas';
    case 'TINGGI': return 'prioritas_tinggi';
    case 'SEDANG': return 'prioritas_sedang';
    case 'RENDAH': return 'prioritas_rendah';
    default:       return 'tidak_prioritas';
  }
}

// Fallback: calculate from raw index
export function getPriorityClass(index: number): string {
  if (index >= 0.8) return 'sangat_prioritas';
  if (index >= 0.6) return 'prioritas_tinggi';
  if (index >= 0.4) return 'prioritas_sedang';
  if (index >= 0.2) return 'prioritas_rendah';
  return 'tidak_prioritas';
}

// Removed adaptSekolahNTT since components now use SekolahNTTFull directly

export function useSekolahNTT() {
  const [schools, setSchools] = useState<SekolahNTTFull[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await getSupabase()
        .from("sekolah_ntt_full")
        .select("*");

      if (fetchErr) throw new Error(fetchErr.message);

      setSchools((data ?? []) as SekolahNTTFull[]);
    } catch (err: unknown) {
      console.error("Failed to fetch sekolah NTT:", err);
      setError("Gagal memuat data sekolah NTT");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const retry = () => {
    setError(null);
    fetchSchools();
  };

  return { schools, loading, error, retry };
}
