// ============================================================
// SIGAPP Macro Insight — Seed Data (5 Semesters, ~30 Kecamatan)
// ============================================================

// ─── Shared Types ────────────────────────────────────────────

export type DominantDimension = "infrastruktur" | "akademik" | "sosial" | "spasial";
export type SpatialPattern = "klaster" | "tersebar" | "isolasi";
export type TrendType = "recovery" | "declining" | "chronic_critical" | "stable_good" | "volatile";
export type ReportStatus = "draft" | "published" | "sent";
export type TriggerType = "auto" | "manual";

export interface MacroInsightReport {
  id: string;
  semester_label: string;
  semester_date: string;
  generated_at: string;
  trigger_type: TriggerType;
  generated_by: string | null;
  status: ReportStatus;
}

export interface MacroInsightKecamatan {
  id: string;
  report_id: string;
  kecamatan_name: string;
  kabupaten_name: string;
  sigapp_index: number;
  total_schools: number;
  critical_schools: number;
  stable_schools: number;
  dominant_dimension: DominantDimension;
  spatial_pattern: SpatialPattern;
  trend_type: TrendType;
  delta_from_prev: number | null;
  agent_summary: string;
  agent_recommendation: string;
}

export interface MacroInsightKabupaten {
  id: string;
  report_id: string;
  kabupaten_name: string;
  sigapp_index_avg: number;
  total_kecamatan: number;
  critical_kecamatan: number;
  best_kecamatan: string;
  worst_kecamatan: string;
  dominant_dimension: DominantDimension;
  trend_type: TrendType;
  delta_from_prev: number | null;
  agent_executive_summary: string;
  agent_recommendation: string;
}

// ─── Semester Definitions ────────────────────────────────────

export const SEMESTERS = [
  { label: "Semester 1 2024", date: "2024-01-01T00:00:00Z", key: "S1" },
  { label: "Semester 2 2024", date: "2024-07-01T00:00:00Z", key: "S2" },
  { label: "Semester 1 2025", date: "2025-01-01T00:00:00Z", key: "S3" },
  { label: "Semester 2 2025", date: "2025-07-01T00:00:00Z", key: "S4" },
  { label: "Semester 1 2026", date: "2026-01-01T00:00:00Z", key: "S0" },
] as const;

// ─── Report IDs ──────────────────────────────────────────────

const REPORT_IDS = [
  "r-s1-2024", "r-s2-2024", "r-s1-2025", "r-s2-2025", "r-s0-2026"
];

export const MACRO_INSIGHT_REPORTS: MacroInsightReport[] = SEMESTERS.map((s, i) => ({
  id: REPORT_IDS[i],
  semester_label: s.label,
  semester_date: s.date,
  generated_at: s.date,
  trigger_type: "auto" as TriggerType,
  generated_by: null,
  status: "published" as ReportStatus,
}));

// ─── Kecamatan Centroids (approximate) ──────────────────────

export interface KecamatanCentroid {
  kecamatan: string;
  kabupaten: string;
  lat: number;
  lon: number;
}

export const KECAMATAN_CENTROIDS: KecamatanCentroid[] = [
  // Kab. Kupang
  { kecamatan: "Kupang Tengah",   kabupaten: "Kab. Kupang",  lat: -10.18, lon: 123.63 },
  { kecamatan: "Amarasi",         kabupaten: "Kab. Kupang",  lat: -10.08, lon: 123.78 },
  { kecamatan: "Sulamu",          kabupaten: "Kab. Kupang",  lat: -10.06, lon: 123.87 },
  // Kab. TTS
  { kecamatan: "Kota Soe",        kabupaten: "Kab. TTS",     lat: -9.86, lon: 124.28 },
  { kecamatan: "Amanuban Selatan", kabupaten: "Kab. TTS",    lat: -9.95, lon: 124.32 },
  { kecamatan: "Mollo Utara",     kabupaten: "Kab. TTS",     lat: -9.72, lon: 124.18 },
  // Kab. TTU
  { kecamatan: "Kefamenanu",      kabupaten: "Kab. TTU",     lat: -9.45, lon: 124.48 },
  { kecamatan: "Insana",          kabupaten: "Kab. TTU",     lat: -9.38, lon: 124.40 },
  { kecamatan: "Biboki Utara",    kabupaten: "Kab. TTU",     lat: -9.28, lon: 124.60 },
  // Kab. Belu
  { kecamatan: "Kota Atambua",    kabupaten: "Kab. Belu",    lat: -9.11, lon: 124.89 },
  { kecamatan: "Lamaknen",        kabupaten: "Kab. Belu",    lat: -9.05, lon: 124.95 },
  { kecamatan: "Tasifeto Barat",  kabupaten: "Kab. Belu",    lat: -9.15, lon: 124.82 },
  // Kab. Ende
  { kecamatan: "Ende Selatan",    kabupaten: "Kab. Ende",    lat: -8.85, lon: 121.67 },
  { kecamatan: "Ndona",           kabupaten: "Kab. Ende",    lat: -8.82, lon: 121.72 },
  { kecamatan: "Wolowaru",        kabupaten: "Kab. Ende",    lat: -8.73, lon: 121.85 },
  // Kab. Sikka
  { kecamatan: "Alok",            kabupaten: "Kab. Sikka",   lat: -8.62, lon: 122.22 },
  { kecamatan: "Nita",            kabupaten: "Kab. Sikka",   lat: -8.63, lon: 122.10 },
  { kecamatan: "Paga",            kabupaten: "Kab. Sikka",   lat: -8.68, lon: 122.15 },
  // Kab. Manggarai
  { kecamatan: "Langke Rembong",  kabupaten: "Kab. Manggarai", lat: -8.61, lon: 120.47 },
  { kecamatan: "Cibal",           kabupaten: "Kab. Manggarai", lat: -8.58, lon: 120.52 },
  { kecamatan: "Wae Rii",         kabupaten: "Kab. Manggarai", lat: -8.55, lon: 120.42 },
  // Kab. Manggarai Barat
  { kecamatan: "Komodo",          kabupaten: "Kab. Manggarai Barat", lat: -8.50, lon: 119.89 },
  { kecamatan: "Lembor",          kabupaten: "Kab. Manggarai Barat", lat: -8.60, lon: 120.10 },
  // Kab. Sumba Timur
  { kecamatan: "Kota Waingapu",   kabupaten: "Kab. Sumba Timur", lat: -9.66, lon: 120.27 },
  { kecamatan: "Pandawai",        kabupaten: "Kab. Sumba Timur", lat: -9.72, lon: 120.18 },
  { kecamatan: "Haharu",          kabupaten: "Kab. Sumba Timur", lat: -9.55, lon: 120.05 },
  // Kab. Ngada
  { kecamatan: "Bajawa",          kabupaten: "Kab. Ngada",   lat: -8.79, lon: 121.00 },
  { kecamatan: "Aimere",          kabupaten: "Kab. Ngada",   lat: -8.85, lon: 121.10 },
  // Kab. Lembata
  { kecamatan: "Nubatukan",       kabupaten: "Kab. Lembata", lat: -8.36, lon: 123.01 },
  { kecamatan: "Ile Ape",         kabupaten: "Kab. Lembata", lat: -8.30, lon: 123.10 },
];

// ─── Trend Profiles ──────────────────────────────────────────

type TrendProfile = {
  trend: TrendType;
  indices: [number, number, number, number, number]; // S1-S0
  dimension: DominantDimension;
  pattern: SpatialPattern;
};

const TREND_PROFILES: Record<string, TrendProfile> = {
  // RECOVERY ZONE (~20%)
  "Kupang Tengah":     { trend: "recovery",         indices: [28, 25, 38, 52, 61], dimension: "infrastruktur", pattern: "klaster" },
  "Kota Soe":          { trend: "recovery",         indices: [32, 30, 42, 55, 64], dimension: "akademik",      pattern: "tersebar" },
  "Ende Selatan":      { trend: "recovery",         indices: [22, 24, 35, 48, 58], dimension: "sosial",        pattern: "klaster" },
  "Alok":              { trend: "recovery",         indices: [30, 28, 40, 53, 62], dimension: "infrastruktur", pattern: "tersebar" },
  "Bajawa":            { trend: "recovery",         indices: [26, 27, 36, 50, 60], dimension: "spasial",       pattern: "klaster" },
  "Nubatukan":         { trend: "recovery",         indices: [24, 22, 33, 46, 56], dimension: "infrastruktur", pattern: "isolasi" },
  // DECLINING ZONE (~15%)
  "Amarasi":           { trend: "declining",         indices: [68, 65, 58, 48, 39], dimension: "akademik",      pattern: "tersebar" },
  "Insana":            { trend: "declining",         indices: [72, 70, 62, 50, 42], dimension: "infrastruktur", pattern: "isolasi" },
  "Ndona":             { trend: "declining",         indices: [65, 63, 55, 45, 37], dimension: "sosial",        pattern: "klaster" },
  "Cibal":             { trend: "declining",         indices: [70, 68, 60, 52, 44], dimension: "spasial",       pattern: "tersebar" },
  // CHRONIC CRITICAL (~15%)
  "Sulamu":            { trend: "chronic_critical",   indices: [22, 20, 18, 21, 19], dimension: "infrastruktur", pattern: "isolasi" },
  "Amanuban Selatan":  { trend: "chronic_critical",   indices: [18, 19, 17, 20, 18], dimension: "spasial",       pattern: "isolasi" },
  "Biboki Utara":      { trend: "chronic_critical",   indices: [25, 23, 22, 24, 21], dimension: "infrastruktur", pattern: "isolasi" },
  "Haharu":            { trend: "chronic_critical",   indices: [15, 16, 14, 17, 15], dimension: "spasial",       pattern: "isolasi" },
  "Ile Ape":           { trend: "chronic_critical",   indices: [20, 21, 19, 22, 20], dimension: "infrastruktur", pattern: "isolasi" },
  // STABLE GOOD (~25%)
  "Kefamenanu":        { trend: "stable_good",       indices: [74, 76, 75, 78, 77], dimension: "akademik",      pattern: "klaster" },
  "Kota Atambua":      { trend: "stable_good",       indices: [78, 80, 79, 81, 80], dimension: "infrastruktur", pattern: "klaster" },
  "Langke Rembong":    { trend: "stable_good",       indices: [72, 74, 73, 76, 75], dimension: "akademik",      pattern: "tersebar" },
  "Komodo":            { trend: "stable_good",       indices: [70, 71, 72, 73, 74], dimension: "sosial",        pattern: "tersebar" },
  "Kota Waingapu":     { trend: "stable_good",       indices: [76, 78, 77, 79, 78], dimension: "infrastruktur", pattern: "klaster" },
  "Nita":              { trend: "stable_good",       indices: [68, 70, 69, 72, 71], dimension: "akademik",      pattern: "tersebar" },
  "Mollo Utara":       { trend: "stable_good",       indices: [66, 68, 67, 70, 69], dimension: "sosial",        pattern: "klaster" },
  // VOLATILE (~25%)
  "Lamaknen":          { trend: "volatile",          indices: [45, 60, 38, 65, 42], dimension: "sosial",        pattern: "tersebar" },
  "Tasifeto Barat":    { trend: "volatile",          indices: [55, 40, 62, 35, 58], dimension: "infrastruktur", pattern: "klaster" },
  "Wolowaru":          { trend: "volatile",          indices: [50, 65, 42, 60, 45], dimension: "akademik",      pattern: "tersebar" },
  "Paga":              { trend: "volatile",          indices: [62, 45, 58, 40, 55], dimension: "spasial",       pattern: "isolasi" },
  "Wae Rii":           { trend: "volatile",          indices: [48, 62, 40, 58, 44], dimension: "infrastruktur", pattern: "tersebar" },
  "Lembor":            { trend: "volatile",          indices: [58, 42, 55, 38, 52], dimension: "sosial",        pattern: "klaster" },
  "Pandawai":          { trend: "volatile",          indices: [52, 38, 60, 42, 55], dimension: "akademik",      pattern: "tersebar" },
  "Aimere":            { trend: "volatile",          indices: [42, 58, 36, 62, 40], dimension: "infrastruktur", pattern: "isolasi" },
};

// ─── Agent Narrative Templates ───────────────────────────────

function agentSummary(kec: string, kab: string, idx: number, trend: TrendType, dim: DominantDimension, delta: number | null): string {
  const deltaStr = delta !== null ? (delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : "N/A";

  switch (trend) {
    case "recovery":
      return `Kecamatan ${kec}, ${kab}, menunjukkan tren pemulihan positif dengan SIGAPP Index ${idx} (delta ${deltaStr} dari semester sebelumnya). Dimensi ${dim} menjadi pendorong utama perbaikan. Intervensi yang telah dilakukan pada periode sebelumnya mulai menunjukkan dampak nyata terhadap kualitas layanan pendidikan di wilayah ini.`;
    case "declining":
      return `Kecamatan ${kec}, ${kab}, mengalami penurunan signifikan dengan SIGAPP Index ${idx} (delta ${deltaStr}). Dimensi ${dim} menjadi area yang paling terdampak. Kondisi ini memerlukan perhatian segera karena tren penurunan berlangsung konsisten selama dua semester terakhir.`;
    case "chronic_critical":
      return `Kecamatan ${kec}, ${kab}, berada dalam kondisi kritis berkelanjutan dengan SIGAPP Index ${idx} yang konsisten rendah. Dimensi ${dim} merupakan permasalahan struktural utama. Diperlukan intervensi menyeluruh dan alokasi anggaran khusus untuk mengatasi kesenjangan pendidikan di wilayah ini.`;
    case "stable_good":
      return `Kecamatan ${kec}, ${kab}, mempertahankan kinerja baik dengan SIGAPP Index ${idx} (delta ${deltaStr}). Dimensi ${dim} menjadi keunggulan utama. Wilayah ini dapat dijadikan model replikasi praktik terbaik bagi kecamatan lain di ${kab}.`;
    case "volatile":
      return `Kecamatan ${kec}, ${kab}, menunjukkan fluktuasi signifikan dengan SIGAPP Index ${idx} (delta ${deltaStr}). Dimensi ${dim} mengalami ketidakstabilan yang perlu diinvestigasi lebih lanjut. Faktor eksternal seperti bencana alam, migrasi penduduk, atau perubahan kebijakan lokal diduga menjadi penyebab utama.`;
  }
}

function agentRecommendation(trend: TrendType, kec: string, kab: string, dim: DominantDimension): string {
  switch (trend) {
    case "recovery":
      return `Level Kabupaten/Kota: Dinas Pendidikan ${kab} disarankan melanjutkan program intervensi yang telah berjalan di ${kec} dan memperkuat monitoring berkala pada dimensi ${dim}. Level Provinsi: Dinas Pendidikan Provinsi NTT dapat mengalokasikan insentif tambahan sebagai penghargaan atas kemajuan yang dicapai. Level Pusat: Kemendikdasmen dapat menjadikan ${kec} sebagai studi kasus keberhasilan intervensi untuk replikasi nasional.`;
    case "declining":
      return `Level Kabupaten/Kota: Dinas Pendidikan ${kab} perlu segera membentuk tim investigasi untuk mengidentifikasi akar permasalahan penurunan kualitas di ${kec}, khususnya pada dimensi ${dim}. Level Provinsi: Dinas Pendidikan Provinsi NTT disarankan mengalokasikan dana darurat dan tenaga pendamping untuk ${kec}. Level Pusat: Kemendikdasmen dimohon mempertimbangkan ${kec} dalam program prioritas intervensi cepat tahun anggaran berjalan.`;
    case "chronic_critical":
      return `Level Kabupaten/Kota: Dinas Pendidikan ${kab} memerlukan restrukturisasi program pendidikan di ${kec} dengan fokus pada dimensi ${dim} yang terdampak paling parah. Level Provinsi: Dinas Pendidikan Provinsi NTT perlu mengusulkan ${kec} sebagai wilayah prioritas dalam RPJMD pendidikan. Level Pusat: Kemendikdasmen sangat diharapkan mengalokasikan anggaran DAK Afirmasi dan program khusus 3T untuk ${kec}, mengingat kondisi kritis yang berlangsung lebih dari 2 tahun.`;
    case "stable_good":
      return `Level Kabupaten/Kota: Dinas Pendidikan ${kab} disarankan mendokumentasikan praktik terbaik di ${kec} dan menjadikannya pusat pembelajaran bagi kecamatan tertinggal. Level Provinsi: Dinas Pendidikan Provinsi NTT dapat memfasilitasi program pertukaran guru dan studi banding dari kecamatan kritis ke ${kec}. Level Pusat: Kemendikdasmen dapat mengapresiasi ${kec} sebagai model keberhasilan pengelolaan pendidikan daerah.`;
    case "volatile":
      return `Level Kabupaten/Kota: Dinas Pendidikan ${kab} perlu melakukan analisis mendalam terhadap faktor-faktor yang menyebabkan fluktuasi di ${kec}, terutama pada dimensi ${dim}. Level Provinsi: Dinas Pendidikan Provinsi NTT disarankan menempatkan tim monitoring tetap dan membangun sistem peringatan dini untuk ${kec}. Level Pusat: Kemendikdasmen dimohon menyertakan ${kec} dalam program stabilisasi mutu pendidikan dengan dukungan teknis dan pendampingan intensif.`;
  }
}

// ─── Generate Seed Data ──────────────────────────────────────

function generateKecamatanData(): MacroInsightKecamatan[] {
  const result: MacroInsightKecamatan[] = [];

  for (const centroid of KECAMATAN_CENTROIDS) {
    const profile = TREND_PROFILES[centroid.kecamatan];
    if (!profile) continue;

    for (let si = 0; si < SEMESTERS.length; si++) {
      const sem = SEMESTERS[si];
      const idx = profile.indices[si];
      const prevIdx = si > 0 ? profile.indices[si - 1] : null;
      const delta = prevIdx !== null ? idx - prevIdx : null;

      const totalSchools = 8 + Math.floor(Math.abs(idx) / 10);
      const criticalSchools = idx < 40 ? Math.floor(totalSchools * 0.6) : idx < 55 ? Math.floor(totalSchools * 0.3) : Math.floor(totalSchools * 0.1);
      const stableSchools = totalSchools - criticalSchools;

      result.push({
        id: `mik-${centroid.kecamatan.toLowerCase().replace(/\s+/g, "-")}-${sem.key}`,
        report_id: REPORT_IDS[si],
        kecamatan_name: centroid.kecamatan,
        kabupaten_name: centroid.kabupaten,
        sigapp_index: idx,
        total_schools: totalSchools,
        critical_schools: criticalSchools,
        stable_schools: stableSchools,
        dominant_dimension: profile.dimension,
        spatial_pattern: profile.pattern,
        trend_type: profile.trend,
        delta_from_prev: delta,
        agent_summary: agentSummary(centroid.kecamatan, centroid.kabupaten, idx, profile.trend, profile.dimension, delta),
        agent_recommendation: agentRecommendation(profile.trend, centroid.kecamatan, centroid.kabupaten, profile.dimension),
      });
    }
  }

  return result;
}

function generateKabupatenData(): MacroInsightKabupaten[] {
  const kecData = generateKecamatanData();
  const result: MacroInsightKabupaten[] = [];

  for (let si = 0; si < SEMESTERS.length; si++) {
    const sem = SEMESTERS[si];
    const reportId = REPORT_IDS[si];
    const semKec = kecData.filter(k => k.report_id === reportId);

    const kabGroups: Record<string, MacroInsightKecamatan[]> = {};
    for (const k of semKec) {
      if (!kabGroups[k.kabupaten_name]) kabGroups[k.kabupaten_name] = [];
      kabGroups[k.kabupaten_name].push(k);
    }

    for (const [kabName, kecs] of Object.entries(kabGroups)) {
      const avgIndex = Math.round(kecs.reduce((s, k) => s + k.sigapp_index, 0) / kecs.length);
      const criticalKec = kecs.filter(k => k.sigapp_index < 40).length;
      const sorted = [...kecs].sort((a, b) => b.sigapp_index - a.sigapp_index);
      const best = sorted[0].kecamatan_name;
      const worst = sorted[sorted.length - 1].kecamatan_name;

      // Determine dominant dimension (most frequent among kecamatan)
      const dimCounts: Record<string, number> = {};
      for (const k of kecs) {
        dimCounts[k.dominant_dimension] = (dimCounts[k.dominant_dimension] || 0) + 1;
      }
      const domDim = Object.entries(dimCounts).sort((a, b) => b[1] - a[1])[0][0] as DominantDimension;

      // Determine trend type (most frequent)
      const trendCounts: Record<string, number> = {};
      for (const k of kecs) {
        trendCounts[k.trend_type] = (trendCounts[k.trend_type] || 0) + 1;
      }
      const domTrend = Object.entries(trendCounts).sort((a, b) => b[1] - a[1])[0][0] as TrendType;

      // Delta
      const prevSemKab = si > 0
        ? kecData.filter(k => k.report_id === REPORT_IDS[si - 1] && k.kabupaten_name === kabName)
        : [];
      const prevAvg = prevSemKab.length > 0
        ? Math.round(prevSemKab.reduce((s, k) => s + k.sigapp_index, 0) / prevSemKab.length)
        : null;
      const delta = prevAvg !== null ? avgIndex - prevAvg : null;

      result.push({
        id: `mikab-${kabName.toLowerCase().replace(/[\s.]+/g, "-")}-${sem.key}`,
        report_id: reportId,
        kabupaten_name: kabName,
        sigapp_index_avg: avgIndex,
        total_kecamatan: kecs.length,
        critical_kecamatan: criticalKec,
        best_kecamatan: best,
        worst_kecamatan: worst,
        dominant_dimension: domDim,
        trend_type: domTrend,
        delta_from_prev: delta,
        agent_executive_summary: `${kabName} memiliki rata-rata SIGAPP Index ${avgIndex} pada ${sem.label} dengan ${kecs.length} kecamatan terpantau. Terdapat ${criticalKec} kecamatan dalam kondisi kritis. Kecamatan dengan kinerja terbaik adalah ${best}, sedangkan ${worst} memerlukan perhatian prioritas. Dimensi ${domDim} menjadi fokus utama perbaikan di kabupaten ini.`,
        agent_recommendation: `Dinas Pendidikan ${kabName} disarankan memprioritaskan intervensi pada Kecamatan ${worst} yang berada dalam kondisi paling memerlukan perhatian. Program replikasi dari Kecamatan ${best} dapat dipertimbangkan sebagai model perbaikan. Koordinasi dengan Dinas Pendidikan Provinsi NTT diperlukan untuk dukungan anggaran dan tenaga teknis.`,
      });
    }
  }

  return result;
}

// ─── Exported Data ───────────────────────────────────────────

export const MACRO_INSIGHT_KECAMATAN_DATA: MacroInsightKecamatan[] = generateKecamatanData();
export const MACRO_INSIGHT_KABUPATEN_DATA: MacroInsightKabupaten[] = generateKabupatenData();

// Helper: get data for a specific semester
export function getKecamatanBySemester(semesterKey: string): MacroInsightKecamatan[] {
  const sem = SEMESTERS.find(s => s.key === semesterKey);
  if (!sem) return [];
  const reportId = REPORT_IDS[SEMESTERS.indexOf(sem)];
  return MACRO_INSIGHT_KECAMATAN_DATA.filter(k => k.report_id === reportId);
}

export function getKabupatenBySemester(semesterKey: string): MacroInsightKabupaten[] {
  const sem = SEMESTERS.find(s => s.key === semesterKey);
  if (!sem) return [];
  const reportId = REPORT_IDS[SEMESTERS.indexOf(sem)];
  return MACRO_INSIGHT_KABUPATEN_DATA.filter(k => k.report_id === reportId);
}

// Helper: get all semester data for one kecamatan (for trend chart)
export function getKecamatanHistory(kecamatanName: string): MacroInsightKecamatan[] {
  return MACRO_INSIGHT_KECAMATAN_DATA.filter(k => k.kecamatan_name === kecamatanName);
}

// Trend type labels (Indonesian)
export const TREND_LABELS: Record<TrendType, string> = {
  recovery: "Recovery Zone",
  declining: "Declining Zone",
  chronic_critical: "Chronic Critical",
  stable_good: "Stable Good",
  volatile: "Volatile",
};

export const TREND_COLORS: Record<TrendType, string> = {
  recovery: "#22C55E",
  declining: "#EF4444",
  chronic_critical: "#7C3AED",
  stable_good: "#3B82F6",
  volatile: "#F59E0B",
};
