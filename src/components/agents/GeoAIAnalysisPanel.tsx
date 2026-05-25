"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Zap,
  Droplets,
  Satellite,
  TreePine,
  AlertTriangle,
  Navigation,
  Wifi,
  Mountain,
  Activity,
  Radio,
  Layers,
} from "lucide-react";
import { SekolahNTTFull } from "@/lib/types";

interface GeoAIAnalysisPanelProps {
  school: SekolahNTTFull;
}

// Deterministic seed generator dari data sekolah
function makeSeed(school: SekolahNTTFull): number {
  return (
    school.id * 31 +
    Math.floor(Math.abs(school.lat) * 1000) +
    Math.floor(Math.abs(school.lon) * 1000)
  );
}

function seededRand(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function generateSpatialData(school: SekolahNTTFull) {
  const s = makeSeed(school);
  return {
    distRoad: (0.5 + seededRand(s, 1) * 12).toFixed(1),
    distFaskes: (0.8 + seededRand(s, 2) * 18).toFixed(1),
    distTransport: (1.0 + seededRand(s, 3) * 20).toFixed(1),
    roadType: ["Jalan Tanah", "Jalan Kerikil", "Jalan Aspal", "Jalan Beton"][
      Math.floor(seededRand(s, 4) * 4)
    ],
    blankSpot: seededRand(s, 5) > 0.6,
    travelTime15: Math.floor(1 + seededRand(s, 6) * 4),
    travelTime30: Math.floor(2 + seededRand(s, 7) * 8),
    travelTime60: Math.floor(5 + seededRand(s, 8) * 15),
    catchmentArea: (5 + seededRand(s, 9) * 95).toFixed(0),
    popGrid: Math.floor(200 + seededRand(s, 10) * 9800),
    builtUpArea: (0.5 + seededRand(s, 11) * 29.5).toFixed(1),
    infraScore: Math.floor(30 + seededRand(s, 12) * 65),
    serviceOverlap: Math.floor(1 + seededRand(s, 13) * 4),
  };
}

function generateRemoteData(school: SekolahNTTFull) {
  const s = makeSeed(school);
  const floodYears = [2, 5, 10, 25, 50, 100];
  const roofConditions = ["Baik", "Perlu Perhatian", "Rusak Ringan", "Tidak Terdeteksi"];
  const landCovers = ["Hutan Primer", "Hutan Sekunder", "Pertanian", "Padang Rumput", "Permukiman", "Lahan Terbuka"];
  return {
    nightLight: Math.floor(seededRand(s, 20) * 63),
    electrification: ["Terlistriki Penuh", "Terlistriki Sebagian", "Belum Terlistriki"][
      Math.floor(seededRand(s, 21) * 3)
    ],
    floodRecurrence: floodYears[Math.floor(seededRand(s, 22) * 6)],
    waterOccurrence: (seededRand(s, 23) * 80).toFixed(0),
    floodCategory: ["Rendah", "Sedang", "Tinggi", "Sangat Tinggi"][
      Math.floor(seededRand(s, 24) * 4)
    ],
    ndvi: (0.15 + seededRand(s, 25) * 0.65).toFixed(2),
    ndviAnomaly: ((seededRand(s, 26) - 0.5) * 0.3).toFixed(2),
    landCover: landCovers[Math.floor(seededRand(s, 27) * 6)],
    landCoverChange: (seededRand(s, 28) * 25).toFixed(1),
    roofCondition: roofConditions[Math.floor(seededRand(s, 29) * 4)],
    roofConfidence: Math.floor(55 + seededRand(s, 30) * 44),
    builtChange: ((seededRand(s, 31) - 0.3) * 20).toFixed(1),
    elevation: Math.floor(10 + seededRand(s, 32) * 1490),
    slope: (seededRand(s, 33) * 35).toFixed(1),
  };
}

function InfraScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";
  const label = score >= 70 ? "Baik" : score >= 50 ? "Sedang" : "Rendah";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">Skor Infrastruktur Akses</span>
        <span className="font-bold tabular-nums" style={{ color }}>
          {score}/100 · {label}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "#00B4B4",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[11px] text-slate-400 font-medium leading-tight">{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Rendah: "bg-green-900/50 text-green-400 border-green-700/50",
    Sedang: "bg-yellow-900/50 text-yellow-400 border-yellow-700/50",
    Tinggi: "bg-orange-900/50 text-orange-400 border-orange-700/50",
    "Sangat Tinggi": "bg-red-900/50 text-red-400 border-red-700/50",
  };
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
        map[level] ?? "bg-slate-800 text-slate-400 border-slate-700"
      }`}
    >
      {level}
    </span>
  );
}

function NightLightGauge({ value }: { value: number }) {
  const pct = Math.round((value / 63) * 100);
  const color = pct > 66 ? "#22C55E" : pct > 33 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#1E293B" strokeWidth="12" />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 38 * pct / 100} ${2 * Math.PI * 38}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tabular-nums text-white" style={{ color }}>{value}</span>
          <span className="text-[9px] text-slate-500">DN</span>
        </div>
      </div>
      <span className="text-[11px] text-slate-400">Night-time Lights</span>
    </div>
  );
}

// ── GeoAI Map Image Component ──────────────────────────────────────────────
function GeoAIMapImage({ school, mode }: { school: SekolahNTTFull; mode: "spatial" | "remote" }) {
  // Rotate through 10 pre-generated maps, deterministic per school
  const mapIndex = String((school.id % 10) + 1).padStart(2, "0");
  const src = mode === "spatial"
    ? `/school-maps/map_s_${mapIndex}.png`
    : `/school-maps/map_r_${mapIndex}.png`;

  const LAYER_LEGENDS = {
    spatial: [
      { color: "#00B4B4", label: "Service Area Ring" },
      { color: "#8B5CF6", label: "Catchment Zone" },
      { color: "#F59E0B", label: "Isochrone 30 mnt" },
      { color: "#22C55E", label: "Infrastruktur Akses" },
    ],
    remote: [
      { color: "#FFD700", label: "Night Light Halo" },
      { color: "#3B82F6", label: "Flood Risk Zone" },
      { color: "#166534", label: "NDVI / Vegetasi" },
      { color: "#EC4899", label: "Built-up Change" },
    ],
  };

  return (
    <div className="mb-6">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Layers size={12} />
        GeoAI Spatial Map
      </p>

      {/* Map Image */}
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800">
        <Image
          src={src}
          alt={`GeoAI Map - ${school.school_name ?? "Sekolah"}`}
          width={800}
          height={500}
          className="w-full object-cover"
          priority
          unoptimized
        />

        {/* Top-left: school name overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700/60">
          <p className="text-[11px] font-semibold text-white leading-tight">
            {school.school_name ?? "–"}
          </p>
          <p className="text-[9px] text-slate-400">
            {school.lat?.toFixed(4)}, {school.lon?.toFixed(4)}
          </p>
        </div>

        {/* Top-right: mode badge */}
        <div className="absolute top-3 right-3 bg-violet-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-violet-700/50">
          <p className="text-[10px] font-mono text-violet-300">
            {mode === "spatial" ? "📍 Spatial Layers" : "🛰️ Remote Sensing"}
          </p>
        </div>

        {/* Bottom: sim disclaimer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent px-4 py-3">
          <p className="text-[9px] font-mono text-slate-500">
            ⚡ SIGAPP GeoAI v1.2 · Simulasi Deterministik · Phase 2: Real GEE API
          </p>
        </div>
      </div>

      {/* Layer legend chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {LAYER_LEGENDS[mode].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 rounded-full px-3 py-1">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { id: "spatial", label: "📍 Spatial Analysis" },
  { id: "remote", label: "🛰️ Remote Sensing & GeoAI" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function GeoAIAnalysisPanel({ school }: GeoAIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("spatial");
  const sp = generateSpatialData(school);
  const rs = generateRemoteData(school);

  const runTime = new Date();
  runTime.setMinutes(runTime.getMinutes() - ((school.id % 11) + 2));
  const runLabel = `${runTime.getHours().toString().padStart(2, "0")}:${runTime.getMinutes().toString().padStart(2, "0")} WIB`;

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900 overflow-hidden shadow-xl mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
          </span>
          <span className="text-sm font-semibold text-white tracking-tight">
            GeoAI Spatial Analysis
          </span>
          <span className="text-[10px] text-slate-500 font-mono">· Agent Run: {runLabel}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 border border-violet-700/50 font-medium">
          SIGAPP GeoAI v1.2
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60 bg-slate-900">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-violet-500 text-violet-300 bg-slate-800/40"
                : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {/* ─── TAB 1: SPATIAL ANALYSIS ─── */}
        {activeTab === "spatial" && (
          <div className="space-y-6">
            {/* GeoAI Map Image */}
            <GeoAIMapImage school={school} mode="spatial" />

            {/* Proximity Metrics */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Service Area & Proximity
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <MetricCard
                  icon={Navigation}
                  label="Jarak ke Jalan Raya"
                  value={`${sp.distRoad} km`}
                  sub={`Tipe: ${sp.roadType}`}
                  color="#00B4B4"
                />
                <MetricCard
                  icon={Activity}
                  label="Jarak ke Faskes"
                  value={`${sp.distFaskes} km`}
                  sub="Puskesmas/Klinik terdekat"
                  color="#00B4B4"
                />
                <MetricCard
                  icon={MapPin}
                  label="Jarak ke Transport"
                  value={`${sp.distTransport} km`}
                  sub="Angkutan umum terdekat"
                  color="#00B4B4"
                />
                <MetricCard
                  icon={Wifi}
                  label="Status Blank Spot"
                  value={sp.blankSpot ? "Ya" : "Tidak"}
                  sub="Sinyal seluler/internet"
                  color={sp.blankSpot ? "#EF4444" : "#22C55E"}
                />
              </div>
            </div>

            {/* Infra Score */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
              <InfraScoreBar score={sp.infraScore} />
            </div>

            {/* Catchment Isochrone */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Catchment Isochrone & Travel Time
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                  <Clock size={16} className="mx-auto mb-2 text-violet-400" />
                  <p className="text-2xl font-bold text-white tabular-nums">{sp.travelTime15}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Sekolah lain dalam 15 mnt</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                  <Clock size={16} className="mx-auto mb-2 text-teal-400" />
                  <p className="text-2xl font-bold text-white tabular-nums">{sp.travelTime30}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Sekolah lain dalam 30 mnt</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                  <Clock size={16} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-2xl font-bold text-white tabular-nums">{sp.travelTime60}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Sekolah lain dalam 60 mnt</p>
                </div>
              </div>
            </div>

            {/* Admin Boundary Context */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Administrative & Spatial Context
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  icon={MapPin}
                  label="Catchment Area"
                  value={`${sp.catchmentArea} km²`}
                  color="#8B5CF6"
                />
                <MetricCard
                  icon={Radio}
                  label="Populasi Grid"
                  value={sp.popGrid.toLocaleString("id-ID")}
                  sub="WorldPop estimate"
                  color="#8B5CF6"
                />
                <MetricCard
                  icon={Mountain}
                  label="Area Terbangun"
                  value={`${sp.builtUpArea} km²`}
                  sub="GEE · Built-up layer"
                  color="#8B5CF6"
                />
                <MetricCard
                  icon={Navigation}
                  label="Service Overlap"
                  value={`${sp.serviceOverlap} sekolah`}
                  sub="Zona layanan beririsan"
                  color="#8B5CF6"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: REMOTE SENSING & GeoAI ─── */}
        {activeTab === "remote" && (
          <div className="space-y-6">
            {/* GeoAI Map Image */}
            <GeoAIMapImage school={school} mode="remote" />

            {/* Night-time Lights */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Night-time Lights & Elektrifikasi
              </p>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
                <NightLightGauge value={rs.nightLight} />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Status Elektrifikasi</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        rs.electrification === "Terlistriki Penuh"
                          ? "bg-green-900/50 text-green-400 border-green-700/50"
                          : rs.electrification === "Terlistriki Sebagian"
                          ? "bg-yellow-900/50 text-yellow-400 border-yellow-700/50"
                          : "bg-red-900/50 text-red-400 border-red-700/50"
                      }`}
                    >
                      {rs.electrification}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Nilai cahaya malam (DN {rs.nightLight}/63) digunakan sebagai proksi aktivitas
                    ekosistem belajar malam hari dan tingkat akses energi di sekitar sekolah.
                    Sumber: VIIRS Night-time Lights via Google Earth Engine.
                  </p>
                </div>
              </div>
            </div>

            {/* Satellite Imagery */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Citra Satelit & Computer Vision
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Satellite size={15} className="text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-300">Kondisi Atap/Bangunan</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold ${
                        rs.roofCondition === "Baik"
                          ? "text-green-400"
                          : rs.roofCondition === "Rusak Ringan"
                          ? "text-orange-400"
                          : rs.roofCondition === "Perlu Perhatian"
                          ? "text-yellow-400"
                          : "text-slate-400"
                      }`}
                    >
                      {rs.roofCondition}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Conf. {rs.roofConfidence}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                      style={{ width: `${rs.roofConfidence}%` }}
                    />
                  </div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mountain size={15} className="text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-300">Perubahan Area Terbangun</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-white">
                    {rs.builtChange.startsWith("-") ? rs.builtChange : `+${rs.builtChange}`}%
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">5 tahun terakhir · GEE Built-up Layer</p>
                </div>
              </div>
            </div>

            {/* Flood & Water Risk */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Flood Recurrence & Water Occurrence
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets size={14} className="text-blue-400" />
                    <span className="text-xs text-slate-400">Flood Recurrence</span>
                  </div>
                  <p className="text-2xl font-bold text-white tabular-nums">{rs.floodRecurrence} yr</p>
                  <p className="text-[10px] text-slate-500 mt-1">Return period · GFD</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets size={14} className="text-blue-400" />
                    <span className="text-xs text-slate-400">Water Occurrence</span>
                  </div>
                  <p className="text-2xl font-bold text-white tabular-nums">{rs.waterOccurrence}%</p>
                  <p className="text-[10px] text-slate-500 mt-1">JRC Surface Water · GEE</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-orange-400" />
                    <span className="text-xs text-slate-400">Kategori Risiko Banjir</span>
                  </div>
                  <RiskBadge level={rs.floodCategory} />
                </div>
              </div>
            </div>

            {/* NDVI & Land Cover */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                NDVI & Land Cover Change
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  icon={TreePine}
                  label="Nilai NDVI"
                  value={rs.ndvi}
                  sub="Indeks vegetasi (0–1)"
                  color="#22C55E"
                />
                <MetricCard
                  icon={Activity}
                  label="Anomali NDVI"
                  value={`${Number(rs.ndviAnomaly) >= 0 ? "+" : ""}${rs.ndviAnomaly}`}
                  sub="Deviasi dari rata-rata"
                  color={Number(rs.ndviAnomaly) >= 0 ? "#22C55E" : "#EF4444"}
                />
                <MetricCard
                  icon={TreePine}
                  label="Tutupan Lahan"
                  value={rs.landCover}
                  color="#10B981"
                />
                <MetricCard
                  icon={Mountain}
                  label="Perubahan Tutupan"
                  value={`${rs.landCoverChange}%`}
                  sub="5 tahun · ESA WorldCover"
                  color="#F59E0B"
                />
              </div>
            </div>

            {/* Elevation & Slope */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={Mountain}
                label="Elevasi"
                value={`${rs.elevation} m`}
                sub="DEM · SRTM 30m"
                color="#8B5CF6"
              />
              <MetricCard
                icon={Zap}
                label="Slope"
                value={`${rs.slope}°`}
                sub="Kemiringan lereng"
                color={Number(rs.slope) > 20 ? "#EF4444" : "#8B5CF6"}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="px-5 py-2.5 bg-slate-800/40 border-t border-slate-700/40">
        <p className="text-[10px] text-slate-600 font-mono">
          ⚠ Data bersifat simulasi deterministik berbasis koordinat sekolah · Sumber real: GEE, OSM, BPS, WorldPop, GADM · Phase 2: integrasi API aktif
        </p>
      </div>
    </div>
  );
}
