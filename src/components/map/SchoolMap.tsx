"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcons } from "./LeafletFix";
import { SchoolWithIndex } from "@/lib/types";
import { getTierFromIndex, TIER_BG_COLORS, PriorityTier } from "@/lib/utils";
import { AGENT_NEWLY_FLAGGED_NPSN } from "@/lib/agentFlags";
import { PulsingMarker } from "./PulsingMarker";
import L from "leaflet";

const TIER_LABELS: Record<PriorityTier, string> = {
  KRITIS: "Sangat Prioritas (Kritis)",
  TINGGI: "Prioritas Tinggi",
  SEDANG: "Prioritas Sedang",
  RENDAH: "Prioritas Rendah",
};

const CITY_LABELS = [
  { name: "Jakarta Utara", pos: [-6.1481, 106.8998] as [number, number] },
  { name: "Jakarta Selatan", pos: [-6.2935, 106.8318] as [number, number] },
  { name: "Jakarta Barat", pos: [-6.1674, 106.7637] as [number, number] },
  { name: "Jakarta Timur", pos: [-6.2251, 106.9004] as [number, number] },
  { name: "Jakarta Pusat", pos: [-6.1862, 106.8358] as [number, number] },
];

interface SchoolMapProps {
  schools: SchoolWithIndex[];
  onSchoolClick: (school: SchoolWithIndex) => void;
  selectedSchoolId: string | null;
  loading?: boolean;
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

// Custom Legend Control Component
function LegendControl() {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: "bottomleft" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.style.backgroundColor = "white";
      div.style.padding = "12px";
      div.style.borderRadius = "0.5rem";
      div.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
      div.style.fontSize = "13px";
      div.style.color = "#1E293B";

      let html = `<h4 style="margin: 0 0 8px 0; font-weight: bold; color: #00B4B4;">Prioritas Intervensi</h4>`;
      
      const keys: PriorityTier[] = ["KRITIS", "TINGGI", "SEDANG", "RENDAH"];
      for (const key of keys) {
        html += `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${TIER_BG_COLORS[key]}; margin-right: 8px;"></span>
            ${TIER_LABELS[key]}
          </div>
        `;
      }

      div.innerHTML = html;
      
      // Stop clicks on the legend from propagating to the map
      L.DomEvent.disableClickPropagation(div);
      
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}

export default function SchoolMap({ schools, onSchoolClick, selectedSchoolId, loading = false, onMapReady }: SchoolMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const center: [number, number] = [-6.2088, 106.8456];

  return (
    <div className="relative w-full h-full bg-slate-50">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm font-medium text-slate-600">Loading map data...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && schools.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 px-4 py-2 rounded shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">No school data available.</p>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={11}
        minZoom={10}
        maxZoom={16}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapController onMapReady={onMapReady} />

        <LegendControl />

        {/* TODO: Add GeoJSON boundary layers here once files are available in /public/geojson/:
             - jakarta_province.geojson -> style: black border 1.5px, no fill
             - jakarta_cities.geojson -> style: gray #6B7280 border 1px, no fill
             - jakarta_subdistricts.geojson -> style: gray #9CA3AF dashed border 0.5px, no fill
        */}

        {/* City Labels */}
        {CITY_LABELS.map((city) => (
          <CircleMarker
            key={city.name}
            center={city.pos}
            radius={0}
            opacity={0}
            fillOpacity={0}
          >
            <Tooltip
              direction="center"
              permanent
              className="city-label-tooltip"
            >
              {city.name}
            </Tooltip>
          </CircleMarker>
        ))}

        {/* School Dots */}
        {schools.map((school) => {
          if (!school.latitude || !school.longitude || !school.school_index) return null;

          const isSelected = selectedSchoolId === school.id;
          const tier = getTierFromIndex(school.school_index.sigapp_index);
          const color = TIER_BG_COLORS[tier] || "#94A3B8";
          const isFlagged = AGENT_NEWLY_FLAGGED_NPSN.includes(school.npsn);

          if (isFlagged) {
            return (
              <PulsingMarker
                key={school.id}
                school={school}
                color={color}
                isSelected={isSelected}
                onClick={() => onSchoolClick(school)}
              />
            );
          }

          return (
            <CircleMarker
              key={school.id}
              center={[school.latitude, school.longitude]}
              radius={isSelected ? 9 : 6}
              fillColor={color}
              fillOpacity={0.85}
              color={isSelected ? "#0D2137" : "#FFFFFF"}
              weight={isSelected ? 2 : 1}
              eventHandlers={{
                click: () => onSchoolClick(school),
              }}
            >
              {/* Tooltip on hover (optional enhancement since popups are disabled) */}
              <Tooltip>{school.school_name}</Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
