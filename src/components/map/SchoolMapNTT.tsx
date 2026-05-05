// src/components/map/SchoolMapNTT.tsx
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fixLeafletIcons } from "./LeafletFix";
import { SekolahNTT, Jenjang, JENJANG_COLOR, JENJANG_LABEL } from "@/lib/types-ntt";

interface SchoolMapNTTProps {
  schools: SekolahNTT[];
  onSchoolClick?: (school: SekolahNTT) => void;
  selectedId?: number | null;
  loading?: boolean;
  filterJenjang?: Jenjang[];
}

// ── Legend ──────────────────────────────────────────────
function LegendNTT({ activeJenjang }: { activeJenjang: Jenjang[] }) {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: "bottomleft" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      Object.assign(div.style, {
        backgroundColor: "#1e293b",
        padding: "10px 14px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        fontSize: "12px",
        color: "#f1f5f9",
        minWidth: "180px",
      });

      const shown: Jenjang[] =
        activeJenjang.length > 0
          ? activeJenjang
          : (Object.keys(JENJANG_COLOR) as Jenjang[]);

      let html = `<div style="font-weight:700;color:#38bdf8;margin-bottom:8px">
                    \uD83C\uDFEB Jenjang Sekolah \u2014 NTT
                  </div>`;

      for (const j of shown) {
        html += `
          <div style="display:flex;align-items:center;margin-bottom:5px;">
            <span style="display:inline-block;width:11px;height:11px;
              border-radius:50%;background:${JENJANG_COLOR[j]};margin-right:8px;"></span>
            <span>${j} \u2014 <small style="color:#94a3b8">${JENJANG_LABEL[j]}</small></span>
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

// ── Main Component ───────────────────────────────────────
export default function SchoolMapNTT({
  schools,
  onSchoolClick,
  selectedId = null,
  loading = false,
  filterJenjang = [],
}: SchoolMapNTTProps) {
  useEffect(() => { fixLeafletIcons(); }, []);

  // NTT center
  const center: [number, number] = [-9.0, 121.5];

  return (
    <div className="relative w-full h-full bg-slate-900">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-300">Memuat data sekolah NTT...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && schools.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="bg-slate-800 px-5 py-3 rounded-lg border border-slate-600 shadow">
            <p className="text-sm text-slate-300">Tidak ada data sekolah ditemukan.</p>
          </div>
        </div>
      )}

      {/* Stats Badge */}
      {!loading && schools.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] bg-slate-800/90 border border-slate-600
                        rounded-lg px-3 py-2 text-xs text-slate-200 shadow-lg">
          <span className="font-semibold text-teal-400">{schools.length.toLocaleString()}</span>
          {" "}sekolah ditampilkan
        </div>
      )}

      <MapContainer
        center={center}
        zoom={7}
        minZoom={6}
        maxZoom={16}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <LegendNTT activeJenjang={filterJenjang} />

        {schools.map((school) => {
          const isSelected = selectedId === school.id;
          const color = JENJANG_COLOR[school.jenjang] ?? "#94a3b8";

          return (
            <CircleMarker
              key={school.id}
              center={[school.lat, school.lon]}
              radius={isSelected ? 10 : 6}
              fillColor={color}
              fillOpacity={0.85}
              color={isSelected ? "#ffffff" : "#0f172a"}
              weight={isSelected ? 2 : 0.8}
              eventHandlers={{
                click: () => onSchoolClick?.(school),
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <p className="font-bold">{school.name ?? "Tanpa Nama"}</p>
                  <p>{school.jenjang} \u00b7 {school.addr_city ?? "-"}</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
