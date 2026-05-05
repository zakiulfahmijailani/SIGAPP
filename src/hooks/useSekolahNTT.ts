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

/**
 * Adapter: converts SekolahNTTFull into the shape expected by existing
 * components (SchoolWithIndex). This allows SchoolMap, Sidebar, FilterBar,
 * etc. to work without any modification.
 */
export function adaptSekolahNTT(s: SekolahNTTFull) {
  return {
    // --- School fields ---
    id: String(s.id),
    npsn: s.npsn,
    school_name: s.school_name,
    jenjang: s.jenjang as 'SD' | 'SMP' | 'SMA' | 'SMK',
    kecamatan: s.kecamatan,
    kelurahan: '',                   // not available in NTT
    kota: s.kabupaten,               // map kabupaten → kota so filters work
    address: s.addr_street ?? '',
    latitude: s.lat,
    longitude: s.lon,
    total_students: s.total_students,
    total_teachers: s.total_teachers,
    student_kip_count: 0,            // not available in NTT
    // --- SchoolIndex fields (flat in NTT, nested in Jakarta) ---
    school_index: {
      id: String(s.id),
      school_id: String(s.id),
      sigapp_index: s.sigapp_index,
      p1_quality_gap: s.p1_quality_gap,
      p2_spatial_inequity: s.p2_spatial_inequity,
      p3_structural_risk: s.p3_structural_risk,
      p4_public_signal: s.p4_public_signal,
      notes: s.index_notes,
      computed_at: s.computed_at ?? '',
    },
  };
}

export function useSekolahNTT() {
  const [schools, setSchools] = useState<ReturnType<typeof adaptSekolahNTT>[]>([]);
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

      const adapted = (data ?? []).map((s) => adaptSekolahNTT(s as SekolahNTTFull));
      setSchools(adapted);
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
