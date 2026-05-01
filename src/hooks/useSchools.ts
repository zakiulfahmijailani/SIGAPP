import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { SchoolWithIndex } from "@/lib/types";
import { PriorityTier } from "@/lib/utils";

// Map Supabase priority_tier (KRITIS/TINGGI/SEDANG/RENDAH) to CSS key
export function getPriorityClassFromTier(tier: PriorityTier): string {
  switch (tier) {
    case 'KRITIS': return 'sangat_prioritas';
    case 'TINGGI': return 'prioritas_tinggi';
    case 'SEDANG': return 'prioritas_sedang';
    case 'RENDAH': return 'prioritas_rendah';
    default:       return 'tidak_prioritas';
  }
}

// Fallback: calculate from raw index (absolute thresholds)
export function getPriorityClass(index: number): string {
  if (index >= 0.8) return 'sangat_prioritas';
  if (index >= 0.6) return 'prioritas_tinggi';
  if (index >= 0.4) return 'prioritas_sedang';
  if (index >= 0.2) return 'prioritas_rendah';
  return 'tidak_prioritas';
}

export function useSchools() {
  const [schools, setSchools] = useState<SchoolWithIndex[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSchools() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchErr } = await getSupabase()
          .from("schools")
          .select("*, school_index(*)");

        if (fetchErr) throw new Error(fetchErr.message);

        // Normalize the data (Supabase joins return arrays or single objects depending on relationship)
        const normalized = (data ?? []).map((s: Record<string, unknown>) => ({
          ...s,
          school_index: Array.isArray(s.school_index)
            ? s.school_index[0]
            : s.school_index,
        })) as SchoolWithIndex[];

        setSchools(normalized);
      } catch (err: unknown) {
        console.error("Failed to fetch schools:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setSchools([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSchools();
  }, []);

  return { schools, loading, error };
}
