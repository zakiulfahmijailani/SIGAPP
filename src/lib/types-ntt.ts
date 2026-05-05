// src/lib/types-ntt.ts

export type Jenjang = "TK" | "SD" | "SMP" | "SMA";

export interface SekolahNTT {
  id: number;
  name: string | null;
  jenjang: Jenjang;
  addr_city: string | null;
  addr_street: string | null;
  operator: string | null;
  isced_level: string | null;
  website: string | null;
  phone: string | null;
  lat: number;
  lon: number;
}

export const JENJANG_COLOR: Record<Jenjang, string> = {
  TK:  "#f59e0b",   // amber
  SD:  "#3b82f6",   // blue
  SMP: "#10b981",   // emerald
  SMA: "#ef4444",   // red
};

export const JENJANG_LABEL: Record<Jenjang, string> = {
  TK:  "Taman Kanak-Kanak",
  SD:  "Sekolah Dasar",
  SMP: "Sekolah Menengah Pertama",
  SMA: "Sekolah Menengah Atas / SMK",
};
