// src/lib/utils-ntt.ts
import {
  PriorityTierNTT,
  TIER_BG_COLORS_NTT,
  TIER_TEXT_COLORS_NTT,
  TIER_LABEL_NTT,
  PILLAR_WEIGHTS,
  SekolahNTTFull,
} from "./types-ntt";

// ─────────────────────────────────────────────
// TIER HELPERS
// ─────────────────────────────────────────────

/**
 * Tentukan tier prioritas dari sigapp_index (0–1).
 * Sama dengan logika Jakarta agar konsisten.
 */
export function getTierNTT(index: number | null | undefined): PriorityTierNTT {
  if (index == null) return "RENDAH";
  if (index >= 0.65) return "KRITIS";
  if (index >= 0.50) return "TINGGI";
  if (index >= 0.35) return "SEDANG";
  return "RENDAH";
}

export function getTierColorNTT(tier: PriorityTierNTT): string {
  const bg: Record<PriorityTierNTT, string> = {
    KRITIS: "text-red-400 bg-red-900/40 border-red-700",
    TINGGI: "text-orange-400 bg-orange-900/40 border-orange-700",
    SEDANG: "text-yellow-400 bg-yellow-900/40 border-yellow-700",
    RENDAH: "text-green-400 bg-green-900/40 border-green-700",
  };
  return bg[tier];
}

export function getTierBgHex(tier: PriorityTierNTT): string {
  return TIER_BG_COLORS_NTT[tier];
}

export function getTierLabel(tier: PriorityTierNTT): string {
  return TIER_LABEL_NTT[tier];
}

export function getTierTextClass(tier: PriorityTierNTT): string {
  return TIER_TEXT_COLORS_NTT[tier];
}

// ─────────────────────────────────────────────
// INDEX HELPERS
// ─────────────────────────────────────────────

export function formatIndex(index: number | null | undefined): string {
  if (index == null) return "—";
  return index.toFixed(2);
}

/**
 * Hitung sigapp_index dari 4 pilar + bobot.
 * Digunakan di Python juga (logika yang sama).
 *
 * sigapp_index = P1*0.30 + P2*0.25 + P3*0.25 + P4*0.20
 */
export function computeSigappIndex(
  p1: number,
  p2: number,
  p3: number,
  p4: number
): number {
  return (
    p1 * PILLAR_WEIGHTS.p1_quality_gap +
    p2 * PILLAR_WEIGHTS.p2_spatial_inequity +
    p3 * PILLAR_WEIGHTS.p3_structural_risk +
    p4 * PILLAR_WEIGHTS.p4_public_signal
  );
}

/**
 * Pillar breakdown untuk radar chart.
 * Returns array of { key, label, value, weight }
 */
export function getPillarBreakdown(school: SekolahNTTFull) {
  return [
    {
      key: "p1_quality_gap",
      label: "Kualitas Pendidikan",
      icon: "🎓",
      value: school.p1_quality_gap ?? 0,
      weight: PILLAR_WEIGHTS.p1_quality_gap,
    },
    {
      key: "p2_spatial_inequity",
      label: "Ketimpangan Spasial",
      icon: "📍",
      value: school.p2_spatial_inequity ?? 0,
      weight: PILLAR_WEIGHTS.p2_spatial_inequity,
    },
    {
      key: "p3_structural_risk",
      label: "Risiko Struktural",
      icon: "🏚",
      value: school.p3_structural_risk ?? 0,
      weight: PILLAR_WEIGHTS.p3_structural_risk,
    },
    {
      key: "p4_public_signal",
      label: "Sinyal Publik",
      icon: "📡",
      value: school.p4_public_signal ?? 0,
      weight: PILLAR_WEIGHTS.p4_public_signal,
    },
  ];
}

// ─────────────────────────────────────────────
// DISPLAY HELPERS
// ─────────────────────────────────────────────

export function getDisplayName(school: {
  school_name?: string | null;
  name?: string | null;
  jenjang: string;
}): string {
  return school.school_name ?? school.name ?? `Sekolah ${school.jenjang} (Tanpa Nama)`;
}

export function getKabupatenLabel(kabupaten: string | null): string {
  if (!kabupaten) return "Kabupaten tidak diketahui";
  return kabupaten
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

export function formatStudentCount(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("id-ID") + " siswa";
}

export function formatTeacherRatio(ratio: number | null): string {
  if (ratio == null) return "—";
  return ratio.toFixed(1) + " guru/100 murid";
}
