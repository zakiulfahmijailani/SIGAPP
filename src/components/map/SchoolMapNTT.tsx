// src/components/map/SchoolMapNTT.tsx
"use client";

import { useEffect } from "react";
import {
  MapContainer, TileLayer,
  CircleMarker, Tooltip, Popup, useMap,
} from "react-leaflet";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fixLeafletIcons } from "./LeafletFix";
import {
  SekolahNTTFull,
  Jenjang,
  PriorityTierNTT,
  JENJANG_COLOR,
  JENJANG_LABEL,
  TIER_BG_COLORS_NTT,
  TIER_LABEL_NTT,
} from "@/lib/types-ntt";
import { getTierNTT, getTierBgHex, getDisplayName } from "@/lib/utils-ntt";

// ─────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────

type ColorMode = "tier" | "jenjang";

interface SchoolMapNTTProps {
  schools: SekolahNTTFull[];
  onSchoolClick?: (school: SekolahNTTFull) => void;
  selectedId?: number | null;
  loading?: boolean;
  colorMode?: ColorMode;        // default: "tier"
  filterJenjang?: Jenjang[];
  filterTier?: PriorityTierNTT[];
  onMapReady?: (map: L.Map) => void;
}

// MapController exposes the leaflet map instance to the parent
function MapController({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

// ─────────────────────────────────────────────────────────
// LEGEND — TIER
// ─────────────────────────────────────────────────────────

const TIER_ORDER: PriorityTierNTT[] = ["KRITIS", "TINGGI", "SEDANG", "RENDAH"];

function LegendTier({ activeTier }: { activeTier: PriorityTierNTT[] }) {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: "bottomleft" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      Object.assign(div.style, {
        backgroundColor: "#1e293b",
        padding: "10px 14px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        fontSize: "12px",
        color: "#f1f5f9",
        minWidth: "190px",
        border: "1px solid #334155",
      });

      const shown = activeTier.length > 0 ? activeTier : TIER_ORDER;

      let html = `<div style="font-weight:700;color:#38bdf8;margin-bottom:8px;font-size:11px;letter-spacing:.05em;text-transform:uppercase">
        \u26a0\ufe0f Prioritas Intervensi
      </div>`;

      for (const t of shown) {
        html += `
          <div style="display:flex;align-items:center;margin-bottom:5px;">
            <span style="display:inline-block;width:11px;height:11px;
              border-radius:50%;background:${TIER_BG_COLORS_NTT[t]};margin-right:8px;flex-shrink:0"></span>
            <span style="color:#e2e8f0">${TIER_LABEL_NTT[t]}</span>
          </div>`;
      }

      html += `<div style="margin-top:8px;padding-top:7px;border-top:1px solid #334155;
        color:#64748b;font-size:10px">SIGAPP Index • NTT 2026</div>`;

      div.innerHTML = html;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    legend.addTo(map);
    return () => { legend.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, activeTier.join(",")]);

  return null;
}

// ─────────────────────────────────────────────────────────
// LEGEND — JENJANG
// ─────────────────────────────────────────────────────────

const JENJANG_ORDER: Jenjang[] = ["TK", "SD", "SMP", "SMA"];

function LegendJenjang({ activeJenjang }: { activeJenjang: Jenjang[] }) {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: "bottomleft" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      Object.assign(div.style, {
        backgroundColor: "#1e293b",
        padding: "10px 14px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        fontSize: "12px",
        color: "#f1f5f9",
        minWidth: "190px",
        border: "1px solid #334155",
      });

      const shown = activeJenjang.length > 0 ? activeJenjang : JENJANG_ORDER;

      let html = `<div style="font-weight:700;color:#38bdf8;margin-bottom:8px;font-size:11px;letter-spacing:.05em;text-transform:uppercase">
        \uD83C\uDFEB Jenjang Sekolah
      </div>`;

      for (const j of shown) {
        html += `
          <div style="display:flex;align-items:center;margin-bottom:5px;">
            <span style="display:inline-block;width:11px;height:11px;
              border-radius:50%;background:${JENJANG_COLOR[j]};margin-right:8px;flex-shrink:0"></span>
            <span style="color:#e2e8f0">${j} <small style="color:#94a3b8">— ${JENJANG_LABEL[j]}</small></span>
          </div>`;
      }

      div.innerHTML = html;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    legend.addTo(map);
    return () => { legend.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, activeJenjang.join(",")]);

  return null;
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────

export default function SchoolMapNTT({
  schools,
  onSchoolClick,
  selectedId = null,
  loading = false,
  colorMode = "tier",
  filterJenjang = [],
  filterTier = [],
  onMapReady,
}: SchoolMapNTTProps) {
  const router = useRouter();
  useEffect(() => { fixLeafletIcons(); }, []);

  const center: [number, number] = [-9.5, 121.5];

  function getColor(school: SekolahNTTFull): string {
    if (colorMode === "jenjang") {
      return JENJANG_COLOR[school.jenjang] ?? "#94a3b8";
    }
    // tier mode
    const tier = getTierNTT(school.sigapp_index ?? undefined);
    return getTierBgHex(tier);
  }

  function getRadius(school: SekolahNTTFull, isSelected: boolean): number {
    if (isSelected) return 11;
    // KRITIS sedikit lebih besar untuk visibilitas
    if (colorMode === "tier") {
      const tier = getTierNTT(school.sigapp_index ?? undefined);
      if (tier === "KRITIS") return 8;
      if (tier === "TINGGI") return 7;
    }
    return 5;
  }

  return (
    <div className="relative w-full h-full bg-slate-900">

      {/* ── Loading ── */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-300">Memuat data sekolah NTT...</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && schools.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="bg-slate-800 px-5 py-3 rounded-lg border border-slate-600">
            <p className="text-sm text-slate-300">Tidak ada data sekolah ditemukan.</p>
          </div>
        </div>
      )}

      {/* ── Stats Badge ── */}
      {!loading && schools.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1 items-end">
          <div className="bg-slate-800/90 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 shadow-lg">
            <span className="font-semibold text-teal-400">
              {schools.length.toLocaleString("id-ID")}
            </span>{" "}
            sekolah
          </div>
          {/* Tier mini-summary */}
          <div className="bg-slate-800/90 border border-slate-600 rounded-lg px-3 py-1.5 text-xs shadow-lg flex gap-2">
            {TIER_ORDER.map((t) => {
              const count = schools.filter(
                (s) => getTierNTT(s.sigapp_index ?? undefined) === t
              ).length;
              if (count === 0) return null;
              return (
                <span key={t} style={{ color: TIER_BG_COLORS_NTT[t] }}
                  className="font-semibold">
                  {t[0]}{count}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={7}
        minZoom={6}
        maxZoom={17}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController onMapReady={onMapReady} />

        {/* Legend berganti sesuai colorMode */}
        {colorMode === "tier"
          ? <LegendTier activeTier={filterTier} />
          : <LegendJenjang activeJenjang={filterJenjang} />
        }

        {schools.map((school) => {
          const isSelected = selectedId === school.id;
          const color = getColor(school);
          const radius = getRadius(school, isSelected);
          const tier = getTierNTT(school.sigapp_index ?? undefined);
          const name = getDisplayName(school);

          return (
            <CircleMarker
              key={school.id}
              center={[school.lat, school.lon]}
              radius={radius}
              fillColor={color}
              fillOpacity={isSelected ? 1 : 0.82}
              color={isSelected ? "#ffffff" : "#0f172a"}
              weight={isSelected ? 2.5 : 0.6}
              eventHandlers={{ click: () => onSchoolClick?.(school) }}
            >
              <Tooltip>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{name}</div>
                  <div>{school.jenjang} · {school.kabupaten ?? school.addr_city ?? "-"}</div>
                  {school.sigapp_index != null && (
                    <div style={{ marginTop: 3, color: TIER_BG_COLORS_NTT[tier] }}>
                      {TIER_LABEL_NTT[tier]} • {school.sigapp_index.toFixed(3)}
                    </div>
                  )}
                </div>
              </Tooltip>

              <Popup>
                <div style={{ fontSize: 12, lineHeight: 1.5, minWidth: "160px" }}>
                  <div style={{ fontWeight: 800, marginBottom: 4, color: "#f8fafc", fontSize: "13px" }}>{name}</div>
                  <div style={{ color: "#94a3b8", marginBottom: 6 }}>
                    {school.jenjang} · {school.kabupaten ?? school.addr_city ?? "-"}
                  </div>
                  
                  {school.sigapp_index != null && (
                    <div style={{ 
                      backgroundColor: `${TIER_BG_COLORS_NTT[tier]}22`,
                      border: `1px solid ${TIER_BG_COLORS_NTT[tier]}44`,
                      padding: "4px 8px",
                      borderRadius: "6px",
                      marginBottom: "10px"
                    }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: TIER_BG_COLORS_NTT[tier], letterSpacing: "0.05em" }}>
                        SIGAPP Index
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: "#f1f5f9" }}>
                        {school.sigapp_index.toFixed(3)} <span style={{ fontSize: "10px", fontWeight: 700, opacity: 0.8 }}>• {TIER_LABEL_NTT[tier]}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "8px", borderTop: "1px solid #334155", paddingTop: "8px" }}>
                    <button
                      onClick={() => router.push(`/ntt/${school.id}`)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        backgroundColor: "#0f172a",
                        color: "#38bdf8",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontWeight: "800",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        transition: "all 0.2s"
                      }}
                    >
                      🔍 Lihat Detail Sekolah →
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
