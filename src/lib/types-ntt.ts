// src/lib/types-ntt.ts

// ─────────────────────────────────────────────
// ENUMS & CONSTANTS
// ─────────────────────────────────────────────

export type Jenjang = "TK" | "SD" | "SMP" | "SMA";
export type PriorityTierNTT = "KRITIS" | "TINGGI" | "SEDANG" | "RENDAH";

export const JENJANG_COLOR: Record<Jenjang, string> = {
  TK:  "#f59e0b",
  SD:  "#3b82f6",
  SMP: "#10b981",
  SMA: "#ef4444",
};

export const JENJANG_LABEL: Record<Jenjang, string> = {
  TK:  "Taman Kanak-Kanak",
  SD:  "Sekolah Dasar",
  SMP: "Sekolah Menengah Pertama",
  SMA: "Sekolah Menengah Atas / SMK",
};

export const TIER_BG_COLORS_NTT: Record<PriorityTierNTT, string> = {
  KRITIS: "#EF4444",
  TINGGI: "#F97316",
  SEDANG: "#EAB308",
  RENDAH: "#22C55E",
};

export const TIER_TEXT_COLORS_NTT: Record<PriorityTierNTT, string> = {
  KRITIS: "text-red-500",
  TINGGI: "text-orange-400",
  SEDANG: "text-yellow-400",
  RENDAH: "text-green-400",
};

export const TIER_LABEL_NTT: Record<PriorityTierNTT, string> = {
  KRITIS: "Sangat Prioritas",
  TINGGI: "Prioritas Tinggi",
  SEDANG: "Prioritas Sedang",
  RENDAH: "Prioritas Rendah",
};

// Bobot pilar (harus jumlah = 1.0)
export const PILLAR_WEIGHTS = {
  p1_quality_gap:      0.30,
  p2_spatial_inequity: 0.25,
  p3_structural_risk:  0.25,
  p4_public_signal:    0.20,
} as const;

export const PILLAR_LABEL: Record<keyof typeof PILLAR_WEIGHTS, string> = {
  p1_quality_gap:      "P1 — Kualitas Pendidikan",
  p2_spatial_inequity: "P2 — Ketimpangan Spasial",
  p3_structural_risk:  "P3 — Risiko Struktural",
  p4_public_signal:    "P4 — Sinyal Publik",
};

export const PILLAR_ICON: Record<keyof typeof PILLAR_WEIGHTS, string> = {
  p1_quality_gap:      "🎓",
  p2_spatial_inequity: "📍",
  p3_structural_risk:  "🏚",
  p4_public_signal:    "📡",
};

// ─────────────────────────────────────────────
// BASE: Data sekolah dari tabel sekolah_ntt
// ─────────────────────────────────────────────

export interface SekolahNTT {
  id: number;
  name: string | null;
  school_name: string | null;   // nama resmi (dari kolom baru Tahap 1)
  npsn: string | null;
  jenjang: Jenjang;
  kabupaten: string | null;
  kecamatan: string | null;
  addr_city: string | null;
  addr_street: string | null;
  address: string | null;
  operator: string | null;
  isced_level: string | null;
  website: string | null;
  phone: string | null;
  lat: number;
  lon: number;
  total_students: number | null;
  total_teachers: number | null;
}

// ─────────────────────────────────────────────
// INDEX: Data dari tabel sekolah_ntt_index
// ─────────────────────────────────────────────

export interface SekolahNTTIndex {
  id: number;
  school_id: number;
  sigapp_index: number;          // 0.0 – 1.0 composite
  p1_quality_gap: number;
  p2_spatial_inequity: number;
  p3_structural_risk: number;
  p4_public_signal: number;
  notes: string | null;
  computed_at: string;
}

// ─────────────────────────────────────────────
// PILLAR: Variabel mentah dari sekolah_ntt_pillar
// ─────────────────────────────────────────────

export interface PillarVariablesNTT {
  id: number;
  school_id: number;

  // P1 — Kualitas Pendidikan
  teacher_ratio: number | null;
  facility_score: number | null;
  literacy_score: number | null;
  numeracy_score: number | null;

  // P2 — Ketimpangan Spasial
  nearest_school_km: number | null;
  school_density_per_km2: number | null;
  travel_time_minutes: number | null;

  // P3 — Risiko Struktural
  building_damage_weight: number | null;
  disaster_risk_score: number | null;
  enrollment_trend_3yr: number | null;

  // P4 — Sinyal Publik
  complaint_frequency: number | null;
  internet_access: boolean | null;
  remote_status: boolean | null;

  computed_at: string;
}

// ─────────────────────────────────────────────
// COMPOSED: Untuk peta & list (join index)
// ─────────────────────────────────────────────

export interface SekolahNTTWithIndex extends SekolahNTT {
  school_index: SekolahNTTIndex | null;
}

// ─────────────────────────────────────────────
// DETAIL: Untuk halaman /ntt/[id]
// ─────────────────────────────────────────────

export interface SekolahNTTDetail extends SekolahNTT {
  school_index: SekolahNTTIndex | null;
  pillar_variables: PillarVariablesNTT | null;
}

// ─────────────────────────────────────────────
// FULL VIEW: Dari view sekolah_ntt_full
// (flat — untuk query efisien dari frontend)
// ─────────────────────────────────────────────

export interface SekolahNTTFull {
  id: number;
  name: string | null;
  school_name: string | null;
  npsn: string | null;
  jenjang: Jenjang;
  kabupaten: string | null;
  kecamatan: string | null;
  addr_city: string | null;
  addr_street: string | null;
  address: string | null;
  operator: string | null;
  phone: string | null;
  website: string | null;
  lat: number;
  lon: number;
  total_students: number | null;
  total_teachers: number | null;
  // index
  sigapp_index: number | null;
  p1_quality_gap: number | null;
  p2_spatial_inequity: number | null;
  p3_structural_risk: number | null;
  p4_public_signal: number | null;
  index_notes: string | null;
  computed_at: string | null;
  // pillar
  teacher_ratio: number | null;
  facility_score: number | null;
  nearest_school_km: number | null;
  disaster_risk_score: number | null;
  internet_access: boolean | null;
  remote_status: boolean | null;
}
