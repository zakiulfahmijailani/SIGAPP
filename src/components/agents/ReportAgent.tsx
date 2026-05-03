"use client";

import React, { useState } from "react";
import { SchoolIndex, PillarVariables } from "@/lib/types";
import { getTierFromIndex } from "@/lib/utils";

interface ReportData {
  generatedAt: string;       // ISO datetime
  version: number;
  summary: string;           // narasi 2-3 kalimat
  dominantPillar: string;    // nama pilar dengan skor tertinggi
  dominantScore: number;
  recommendations: string[]; // array 3 rekomendasi
  tierLabel: string;
}

interface ReportAgentProps {
  school: {
    id: string;
    school_name: string;
    address?: string;
    kelurahan?: string;
    kecamatan?: string;
    kota?: string;
    jenjang?: string;
    npsn?: string;
    total_students?: number;
    total_teachers?: number;
  };
  schoolIndex: SchoolIndex;
  pillarVariables: PillarVariables | null;
}

export default function ReportAgent({
  school,
  schoolIndex,
}: ReportAgentProps) {
  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [loadingStep, setLoadingStep] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const generateReport = async () => {
    setStatus("generating");
    
    const steps = [
      "Membaca data sekolah...",
      "Menganalisis skor pilar...",
      "Menyusun narasi laporan...",
      "Membuat dokumen PDF...",
    ];

    for (const step of steps) {
      setLoadingStep(step);
      await new Promise(r => setTimeout(r, 700));
    }

    // Tentukan pillar dominan
    const pillars = [
      { name: "Quality Gap",      score: schoolIndex.p1_quality_gap,       weight: 0.35 },
      { name: "Spatial Inequity", score: schoolIndex.p2_spatial_inequity,  weight: 0.25 },
      { name: "Structural Risk",  score: schoolIndex.p3_structural_risk,   weight: 0.25 },
      { name: "Public Signal",    score: schoolIndex.p4_public_signal,     weight: 0.15 },
    ];
    const dominant = pillars.reduce((a, b) => a.score > b.score ? a : b);

    // Tier label
    const tier = getTierFromIndex(schoolIndex.sigapp_index);
    const tierLabel =
      tier === 'KRITIS' ? "Prioritas Kritis" :
      tier === 'TINGGI' ? "Prioritas Tinggi" :
      tier === 'SEDANG' ? "Prioritas Sedang" :
                          "Prioritas Rendah";

    // Narasi summary otomatis
    const summary = `${school.school_name} masuk dalam ${tierLabel} dengan SIGAPP Index ${schoolIndex.sigapp_index.toFixed(3)}. ` +
      `Pilar dengan kontribusi dominan adalah ${dominant.name} (skor: ${dominant.score.toFixed(3)}). ` +
      `Sekolah ini memerlukan perhatian segera terutama pada aspek ${dominant.name.toLowerCase()}.`;

    // Rekomendasi berdasarkan pilar dominan
    const recommendationMap: Record<string, string[]> = {
      "Quality Gap": [
        "Tingkatkan program pelatihan guru berbasis kompetensi literasi dan numerasi.",
        "Alokasikan bantuan bahan ajar dan modul remedial untuk siswa tertinggal.",
        "Lakukan supervisi klinis berkala oleh pengawas sekolah.",
      ],
      "Spatial Inequity": [
        "Evaluasi aksesibilitas jalur menuju sekolah, terutama pada musim hujan.",
        "Pertimbangkan program antar-jemput atau subsidi transportasi siswa.",
        "Koordinasikan dengan dinas PUPR untuk perbaikan infrastruktur jalan.",
      ],
      "Structural Risk": [
        "Lakukan audit kondisi bangunan sekolah secara menyeluruh.",
        "Prioritaskan rehabilitasi ruang kelas dengan kerusakan berat.",
        "Ajukan proposal rehab bangunan ke Dinas Pendidikan Kota/Kabupaten.",
      ],
      "Public Signal": [
        "Tindaklanjuti keluhan masyarakat yang masuk melalui kanal resmi.",
        "Adakan forum wali murid untuk mendengar aspirasi dan kekhawatiran.",
        "Tingkatkan transparansi pengelolaan sekolah kepada komunitas.",
      ],
    };

    const recommendations = recommendationMap[dominant.name] ?? [
      "Lakukan evaluasi menyeluruh terhadap kondisi sekolah.",
      "Koordinasikan dengan pemangku kepentingan terkait.",
      "Susun rencana intervensi berbasis data SIGAPP.",
    ];

    setReportData({
      generatedAt: new Date().toISOString(),
      version: 1,
      summary,
      dominantPillar: dominant.name,
      dominantScore: dominant.score,
      recommendations,
      tierLabel,
    });
    setStatus("ready");
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(11, 42, 74);
    doc.text("SIGAPP — Laporan Prioritas Intervensi Sekolah", 20, 25);
    
    // Garis header
    doc.setDrawColor(31, 181, 168);
    doc.setLineWidth(0.8);
    doc.line(20, 30, 190, 30);
    
    // Info sekolah
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(school.school_name, 20, 42);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let infoY = 50;
    if (school.jenjang) { doc.text(`Jenjang: ${school.jenjang}`, 20, infoY); infoY += 6; }
    if (school.npsn)    { doc.text(`NPSN: ${school.npsn}`, 20, infoY); infoY += 6; }
    if (school.address) { doc.text(`Alamat: ${school.address}`, 20, infoY); infoY += 6; }
    if (school.kecamatan) { doc.text(`Kecamatan: ${school.kecamatan}`, 20, infoY); infoY += 6; }
    if (school.kota)    { doc.text(`Kota: ${school.kota}`, 20, infoY); infoY += 6; }
    if (school.total_students) { doc.text(`Jumlah Siswa: ${school.total_students}`, 20, infoY); infoY += 6; }
    if (school.total_teachers) { doc.text(`Jumlah Guru: ${school.total_teachers}`, 20, infoY); infoY += 6; }
    doc.text(`Tanggal Laporan: ${new Date(reportData.generatedAt).toLocaleString("id-ID")}`, 20, infoY);
    
    // Status prioritas
    const statusY = infoY + 12;
    doc.setFontSize(11);
    doc.setTextColor(11, 42, 74);
    doc.text(`Status: ${reportData.tierLabel}`, 20, statusY);
    doc.text(`SIGAPP Index: ${schoolIndex.sigapp_index.toFixed(3)}`, 20, statusY + 7);
    
    // Skor pilar
    const pillarY = statusY + 19;
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Skor Pilar:", 20, pillarY);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`• Quality Gap:      ${schoolIndex.p1_quality_gap.toFixed(3)}`, 25, pillarY + 8);
    doc.text(`• Spatial Inequity: ${schoolIndex.p2_spatial_inequity.toFixed(3)}`, 25, pillarY + 15);
    doc.text(`• Structural Risk:  ${schoolIndex.p3_structural_risk.toFixed(3)}`, 25, pillarY + 22);
    doc.text(`• Public Signal:    ${schoolIndex.p4_public_signal.toFixed(3)}`, 25, pillarY + 29);
    
    // Ringkasan
    const summaryY = pillarY + 42;
    doc.setFontSize(11);
    doc.setTextColor(11, 42, 74);
    doc.text("Ringkasan Kondisi:", 20, summaryY);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const summaryLines = doc.splitTextToSize(reportData.summary, 165);
    doc.text(summaryLines, 20, summaryY + 8);
    
    // Rekomendasi
    const recY = summaryY + 8 + (summaryLines.length * 6) + 10;
    doc.setFontSize(11);
    doc.setTextColor(11, 42, 74);
    doc.text("Rekomendasi Tindak Lanjut:", 20, recY);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    reportData.recommendations.forEach((rec, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, 165);
      doc.text(lines, 20, recY + 8 + i * 14);
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Dokumen ini dibuat otomatis oleh SIGAPP — Sistem Informasi Prioritas Intervensi Sekolah Jakarta",
      20, 285
    );
    
    // Save
    doc.save(`SIGAPP_${school.school_name.replace(/\s+/g, "_")}_Laporan.pdf`);
  };

  return (
    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">📄 Report Agent</h3>
          <span className="text-xs text-emerald-700 font-medium">🤖 Agent Aktif — Tier 1</span>
        </div>
        {status === "idle" && (
          <button
            onClick={generateReport}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Generate Laporan
          </button>
        )}
        {status === "ready" && (
          <button
            onClick={generateReport}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            🔄 Generate Ulang
          </button>
        )}
      </div>

      {/* Status idle */}
      {status === "idle" && (
        <p className="text-xs text-slate-500 italic">
          Laporan belum dibuat. Klik &ldquo;Generate Laporan&rdquo; untuk menyusun laporan kondisi sekolah ini.
        </p>
      )}

      {/* Status loading */}
      {status === "generating" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-emerald-700">
            <span className="animate-spin text-lg">⚙️</span>
            <span>{loadingStep}</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Status ready */}
      {status === "ready" && reportData && (
        <div className="space-y-3">
          {/* Meta */}
          <div className="text-[10px] text-slate-400 font-medium">
            DIBUAT: {new Date(reportData.generatedAt).toLocaleString("id-ID")} · VERSI {reportData.version}
          </div>

          {/* Summary */}
          <div className="bg-white border border-emerald-100 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-slate-700 leading-relaxed">{reportData.summary}</p>
          </div>

          {/* Rekomendasi */}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Rekomendasi Utama:</p>
            <ul className="space-y-2">
              {reportData.recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-slate-600 flex gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">{i + 1}.</span>
                  <span className="leading-tight">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tombol unduh */}
          <button
            onClick={handleDownloadPDF}
            className="w-full text-xs bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            📥 Unduh Laporan PDF
          </button>
        </div>
      )}
    </div>
  );
}
