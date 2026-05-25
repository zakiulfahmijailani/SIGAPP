// ============================================================
// SIGAPP Macro Insight — Agentic AI Analysis Engine
// ============================================================

import { getSupabase } from "./supabase";
import {
  MacroInsightKecamatan,
  MacroInsightKabupaten,
  MacroInsightReport,
  DominantDimension,
  TrendType,
  SpatialPattern,
  KECAMATAN_CENTROIDS,
} from "./macroInsightData";

// ─── Types for internal processing ───────────────────────────

interface SchoolAggregate {
  kecamatan: string;
  kabupaten: string;
  totalSchools: number;
  indices: number[];
  criticalCount: number;
  stableCount: number;
  dimensions: {
    infrastruktur: number;
    akademik: number;
    sosial: number;
    spasial: number;
  };
}

interface TemporalRecord {
  kecamatan: string;
  kabupaten: string;
  historicalIndices: number[];
  currentIndex: number;
  delta: number | null;
  trendType: TrendType;
}

// ─── Step 1: Aggregation ─────────────────────────────────────

async function aggregateSchoolData(): Promise<SchoolAggregate[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("sekolah_ntt_full")
    .select("kecamatan, kabupaten, sigapp_index, p1_quality_gap, p2_spatial_inequity, p3_structural_risk, p4_public_signal");

  if (error) throw new Error(`Failed to fetch school data: ${error.message}`);
  if (!data || data.length === 0) return [];

  const groups: Record<string, SchoolAggregate> = {};

  for (const row of data) {
    const kec = row.kecamatan as string | null;
    const kab = row.kabupaten as string | null;
    if (!kec || !kab) continue;

    const idx = parseFloat(String(row.sigapp_index ?? "0")) * 100; // Convert 0-1 to 0-100
    if (idx === 0) continue;

    if (!groups[kec]) {
      groups[kec] = {
        kecamatan: kec,
        kabupaten: kab,
        totalSchools: 0,
        indices: [],
        criticalCount: 0,
        stableCount: 0,
        dimensions: { infrastruktur: 0, akademik: 0, sosial: 0, spasial: 0 },
      };
    }

    const g = groups[kec];
    g.totalSchools += 1;
    g.indices.push(idx);

    if (idx < 40) g.criticalCount += 1;
    else g.stableCount += 1;

    // Map pillar scores to dimensions
    const p1 = parseFloat(String(row.p1_quality_gap ?? "0"));
    const p2 = parseFloat(String(row.p2_spatial_inequity ?? "0"));
    const p3 = parseFloat(String(row.p3_structural_risk ?? "0"));
    const p4 = parseFloat(String(row.p4_public_signal ?? "0"));

    g.dimensions.akademik += p1;
    g.dimensions.spasial += p2;
    g.dimensions.infrastruktur += p3;
    g.dimensions.sosial += p4;
  }

  return Object.values(groups);
}

// ─── Step 2: Spatial Analysis ────────────────────────────────

function detectSpatialPattern(
  kecamatan: string,
  avgIndex: number,
  allAggregates: SchoolAggregate[]
): SpatialPattern {
  const centroid = KECAMATAN_CENTROIDS.find(c => c.kecamatan === kecamatan);
  if (!centroid) return "tersebar";

  // Find neighbors (within ~0.3 degrees)
  const neighbors = KECAMATAN_CENTROIDS.filter(c => {
    if (c.kecamatan === kecamatan) return false;
    const dist = Math.sqrt(
      Math.pow(c.lat - centroid.lat, 2) + Math.pow(c.lon - centroid.lon, 2)
    );
    return dist < 0.3;
  });

  if (neighbors.length === 0) return "isolasi";

  // Check if neighbors have similar index levels
  const neighborAggs = neighbors
    .map(n => allAggregates.find(a => a.kecamatan === n.kecamatan))
    .filter((a): a is SchoolAggregate => a !== undefined);

  if (neighborAggs.length === 0) return "isolasi";

  const neighborAvgs = neighborAggs.map(a =>
    a.indices.reduce((s, v) => s + v, 0) / a.indices.length
  );

  const allSimilar = neighborAvgs.every(n => Math.abs(n - avgIndex) < 20);
  return allSimilar ? "klaster" : "tersebar";
}

// ─── Step 3: Temporal Analysis ───────────────────────────────

async function analyzeTemporalTrends(
  aggregates: SchoolAggregate[]
): Promise<TemporalRecord[]> {
  const supabase = getSupabase();

  // Fetch historical data from previous reports
  const { data: prevReports } = await supabase
    .from("macro_insight_kecamatan")
    .select("kecamatan_name, sigapp_index, report_id")
    .order("report_id", { ascending: true });

  const historicalMap: Record<string, number[]> = {};
  if (prevReports) {
    for (const rec of prevReports) {
      const name = rec.kecamatan_name as string;
      if (!historicalMap[name]) historicalMap[name] = [];
      historicalMap[name].push(rec.sigapp_index as number);
    }
  }

  return aggregates.map(agg => {
    const avgIndex = Math.round(
      agg.indices.reduce((s, v) => s + v, 0) / agg.indices.length
    );

    const history = historicalMap[agg.kecamatan] || [];
    const allIndices = [...history, avgIndex];

    // Calculate delta from most recent previous
    const delta = history.length > 0 ? avgIndex - history[history.length - 1] : null;

    // Classify trend
    const trendType = classifyTrend(allIndices);

    return {
      kecamatan: agg.kecamatan,
      kabupaten: agg.kabupaten,
      historicalIndices: allIndices,
      currentIndex: avgIndex,
      delta,
      trendType,
    };
  });
}

function classifyTrend(indices: number[]): TrendType {
  if (indices.length < 3) return "volatile";

  const last3 = indices.slice(-3);
  const first2 = indices.slice(0, 2);
  const allLow = indices.every(i => i < 35);
  const allHigh = indices.every(i => i > 60);

  if (allLow) return "chronic_critical";
  if (allHigh) return "stable_good";

  // Recovery: early values low, recent values improving
  const earlyAvg = first2.reduce((s, v) => s + v, 0) / first2.length;
  const recentAvg = last3.reduce((s, v) => s + v, 0) / last3.length;

  if (earlyAvg < 40 && recentAvg > earlyAvg + 15) return "recovery";
  if (earlyAvg > 55 && recentAvg < earlyAvg - 15) return "declining";

  // Check volatility (standard deviation)
  const mean = indices.reduce((s, v) => s + v, 0) / indices.length;
  const variance = indices.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / indices.length;
  const stddev = Math.sqrt(variance);

  if (stddev > 12) return "volatile";
  if (mean > 60) return "stable_good";
  if (mean < 35) return "chronic_critical";

  return "volatile";
}

// ─── Step 4: Narrative Generation ────────────────────────────

function generateNarrative(
  kecamatan: string,
  kabupaten: string,
  index: number,
  delta: number | null,
  trendType: TrendType,
  dominantDim: DominantDimension,
  spatialPattern: SpatialPattern,
  totalSchools: number,
  criticalSchools: number,
): { summary: string; recommendation: string } {
  const deltaStr = delta !== null ? (delta >= 0 ? `+${delta}` : `${delta}`) : "N/A";

  // In production, this would call the LLM API with the system prompt:
  // "Kamu adalah analis kebijakan pendidikan GeoAI untuk wilayah NTT..."
  // For now, generate deterministic narratives.

  const summaryMap: Record<TrendType, string> = {
    recovery: `Kecamatan ${kecamatan}, ${kabupaten}, menunjukkan tren pemulihan positif dengan SIGAPP Index ${index} (delta ${deltaStr}). Terdapat ${totalSchools} sekolah terpantau dengan ${criticalSchools} sekolah masih dalam kondisi kritis. Dimensi ${dominantDim} menjadi pendorong utama perbaikan, dan pola spasial ${spatialPattern} mengindikasikan intervensi sebelumnya mulai berdampak secara merata.`,
    declining: `Kecamatan ${kecamatan}, ${kabupaten}, mengalami penurunan signifikan dengan SIGAPP Index ${index} (delta ${deltaStr}). Dari ${totalSchools} sekolah, ${criticalSchools} sekolah berada dalam kondisi kritis. Dimensi ${dominantDim} menjadi area yang paling terdampak dengan pola ${spatialPattern} yang memerlukan perhatian segera.`,
    chronic_critical: `Kecamatan ${kecamatan}, ${kabupaten}, berada dalam kondisi kritis berkelanjutan dengan SIGAPP Index ${index}. Sebanyak ${criticalSchools} dari ${totalSchools} sekolah dalam kondisi kritis. Dimensi ${dominantDim} merupakan permasalahan struktural dengan pola spasial ${spatialPattern}. Diperlukan intervensi menyeluruh.`,
    stable_good: `Kecamatan ${kecamatan}, ${kabupaten}, mempertahankan kinerja baik dengan SIGAPP Index ${index} (delta ${deltaStr}). Dari ${totalSchools} sekolah, hanya ${criticalSchools} yang masih memerlukan perhatian. Dimensi ${dominantDim} menjadi keunggulan utama wilayah ini.`,
    volatile: `Kecamatan ${kecamatan}, ${kabupaten}, menunjukkan fluktuasi dengan SIGAPP Index ${index} (delta ${deltaStr}). Terdapat ${criticalSchools} sekolah kritis dari ${totalSchools} total. Dimensi ${dominantDim} mengalami ketidakstabilan dengan pola ${spatialPattern} yang perlu investigasi lanjutan.`,
  };

  const recMap: Record<TrendType, string> = {
    recovery: `Level Kabupaten/Kota: Lanjutkan program intervensi yang berjalan dan perkuat monitoring pada dimensi ${dominantDim}. Level Provinsi: Alokasikan insentif tambahan sebagai penghargaan. Level Pusat: Jadikan studi kasus keberhasilan.`,
    declining: `Level Kabupaten/Kota: Bentuk tim investigasi segera untuk dimensi ${dominantDim}. Level Provinsi: Alokasikan dana darurat dan tenaga pendamping. Level Pusat: Pertimbangkan dalam program prioritas intervensi cepat.`,
    chronic_critical: `Level Kabupaten/Kota: Restrukturisasi program pendidikan dengan fokus ${dominantDim}. Level Provinsi: Usulkan sebagai wilayah prioritas RPJMD. Level Pusat: Alokasikan DAK Afirmasi dan program 3T.`,
    stable_good: `Level Kabupaten/Kota: Dokumentasikan praktik terbaik dan jadikan pusat pembelajaran. Level Provinsi: Fasilitasi pertukaran guru dan studi banding. Level Pusat: Apresiasi sebagai model keberhasilan.`,
    volatile: `Level Kabupaten/Kota: Analisis mendalam faktor penyebab fluktuasi ${dominantDim}. Level Provinsi: Tempatkan tim monitoring tetap. Level Pusat: Sertakan dalam program stabilisasi mutu.`,
  };

  return {
    summary: summaryMap[trendType],
    recommendation: recMap[trendType],
  };
}

// ─── Step 5: Kabupaten Roll-up ───────────────────────────────

function rollUpToKabupaten(
  kecResults: MacroInsightKecamatan[],
  reportId: string,
  semesterLabel: string,
): MacroInsightKabupaten[] {
  const groups: Record<string, MacroInsightKecamatan[]> = {};
  for (const k of kecResults) {
    if (!groups[k.kabupaten_name]) groups[k.kabupaten_name] = [];
    groups[k.kabupaten_name].push(k);
  }

  return Object.entries(groups).map(([kabName, kecs]) => {
    const avgIndex = Math.round(kecs.reduce((s, k) => s + k.sigapp_index, 0) / kecs.length);
    const criticalKec = kecs.filter(k => k.sigapp_index < 40).length;
    const sorted = [...kecs].sort((a, b) => b.sigapp_index - a.sigapp_index);
    const best = sorted[0].kecamatan_name;
    const worst = sorted[sorted.length - 1].kecamatan_name;

    const dimCounts: Record<string, number> = {};
    const trendCounts: Record<string, number> = {};
    for (const k of kecs) {
      dimCounts[k.dominant_dimension] = (dimCounts[k.dominant_dimension] || 0) + 1;
      trendCounts[k.trend_type] = (trendCounts[k.trend_type] || 0) + 1;
    }
    const domDim = Object.entries(dimCounts).sort((a, b) => b[1] - a[1])[0][0] as DominantDimension;
    const domTrend = Object.entries(trendCounts).sort((a, b) => b[1] - a[1])[0][0] as TrendType;

    return {
      id: `mikab-gen-${kabName.toLowerCase().replace(/[\s.]+/g, "-")}`,
      report_id: reportId,
      kabupaten_name: kabName,
      sigapp_index_avg: avgIndex,
      total_kecamatan: kecs.length,
      critical_kecamatan: criticalKec,
      best_kecamatan: best,
      worst_kecamatan: worst,
      dominant_dimension: domDim,
      trend_type: domTrend,
      delta_from_prev: null,
      agent_executive_summary: `${kabName} memiliki rata-rata SIGAPP Index ${avgIndex} pada ${semesterLabel} dengan ${kecs.length} kecamatan terpantau. Terdapat ${criticalKec} kecamatan dalam kondisi kritis. Kecamatan ${best} menunjukkan kinerja terbaik, sedangkan ${worst} memerlukan perhatian prioritas.`,
      agent_recommendation: `Dinas Pendidikan ${kabName} disarankan memprioritaskan intervensi pada Kecamatan ${worst}. Program replikasi dari Kecamatan ${best} dapat dipertimbangkan. Koordinasi dengan Dinas Provinsi NTT diperlukan untuk dukungan anggaran.`,
    };
  });
}

// ─── Main Entry Point ────────────────────────────────────────

export async function generateMacroInsight(
  triggerType: "auto" | "manual",
  generatedBy?: string
): Promise<{ reportId: string; kecamatanCount: number; kabupatenCount: number }> {
  const supabase = getSupabase();

  // Determine current semester
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();
  const semesterNum = month < 6 ? 1 : 2;
  const semesterLabel = `Semester ${semesterNum} ${year}`;
  const semesterDate = new Date(year, semesterNum === 1 ? 0 : 6, 1).toISOString();

  // Step 1: Aggregate school data
  const aggregates = await aggregateSchoolData();

  // Step 2 & 3: Spatial + Temporal analysis
  const temporalRecords = await analyzeTemporalTrends(aggregates);

  // Step 4: Generate narratives and build kecamatan results
  const reportId = crypto.randomUUID();

  const kecResults: MacroInsightKecamatan[] = aggregates.map(agg => {
    const avgIndex = Math.round(
      agg.indices.reduce((s, v) => s + v, 0) / agg.indices.length
    );
    const temporal = temporalRecords.find(t => t.kecamatan === agg.kecamatan);
    const trendType = temporal?.trendType ?? "volatile";
    const delta = temporal?.delta ?? null;

    // Determine dominant dimension
    const dims = agg.dimensions;
    const dimEntries = Object.entries(dims) as [DominantDimension, number][];
    dimEntries.sort((a, b) => b[1] - a[1]);
    const dominantDim = dimEntries[0][0];

    const spatialPattern = detectSpatialPattern(agg.kecamatan, avgIndex, aggregates);

    const narrative = generateNarrative(
      agg.kecamatan, agg.kabupaten, avgIndex, delta,
      trendType, dominantDim, spatialPattern,
      agg.totalSchools, agg.criticalCount,
    );

    return {
      id: crypto.randomUUID(),
      report_id: reportId,
      kecamatan_name: agg.kecamatan,
      kabupaten_name: agg.kabupaten,
      sigapp_index: avgIndex,
      total_schools: agg.totalSchools,
      critical_schools: agg.criticalCount,
      stable_schools: agg.stableCount,
      dominant_dimension: dominantDim,
      spatial_pattern: spatialPattern,
      trend_type: trendType,
      delta_from_prev: delta,
      agent_summary: narrative.summary,
      agent_recommendation: narrative.recommendation,
    };
  });

  // Step 5: Roll-up to kabupaten
  const kabResults = rollUpToKabupaten(kecResults, reportId, semesterLabel);

  // Step 6: Save to database
  const report: MacroInsightReport = {
    id: reportId,
    semester_label: semesterLabel,
    semester_date: semesterDate,
    generated_at: new Date().toISOString(),
    trigger_type: triggerType,
    generated_by: generatedBy ?? null,
    status: "draft",
  };

  const { error: reportErr } = await supabase
    .from("macro_insight_reports")
    .insert(report);
  if (reportErr) throw new Error(`Failed to insert report: ${reportErr.message}`);

  if (kecResults.length > 0) {
    const { error: kecErr } = await supabase
      .from("macro_insight_kecamatan")
      .insert(kecResults);
    if (kecErr) throw new Error(`Failed to insert kecamatan data: ${kecErr.message}`);
  }

  if (kabResults.length > 0) {
    const { error: kabErr } = await supabase
      .from("macro_insight_kabupaten")
      .insert(kabResults);
    if (kabErr) throw new Error(`Failed to insert kabupaten data: ${kabErr.message}`);
  }

  // Step 7: Update status to published
  const { error: updateErr } = await supabase
    .from("macro_insight_reports")
    .update({ status: "published" })
    .eq("id", reportId);
  if (updateErr) throw new Error(`Failed to update report status: ${updateErr.message}`);

  return {
    reportId,
    kecamatanCount: kecResults.length,
    kabupatenCount: kabResults.length,
  };
}
