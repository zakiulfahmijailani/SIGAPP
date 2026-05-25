"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { 
  MacroInsightKecamatan, 
  MacroInsightKabupaten,
  KECAMATAN_CENTROIDS 
} from "@/lib/macroInsightData";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
  index: number;
  color: string;
  isKabupaten: boolean;
}

interface MacroInsightMapProps {
  kecamatanData: MacroInsightKecamatan[];
  selectedKecamatan: string | null;
  onKecamatanSelect: (name: string | null) => void;
  viewMode: "kecamatan" | "kabupaten";
  kabupatenData: MacroInsightKabupaten[];
}

const TIER_COLORS = {
  kritis: "#EF4444", // < 40
  tinggi: "#F97316", // 40-55
  sedang: "#EAB308", // 55-70
  rendah: "#22C55E", // > 70
};

function getColorForIndex(index: number) {
  if (index < 40) return TIER_COLORS.kritis;
  if (index < 55) return TIER_COLORS.tinggi;
  if (index < 70) return TIER_COLORS.sedang;
  return TIER_COLORS.rendah;
}

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
      div.style.fontSize = "12px";
      div.style.color = "#1E293B";

      let html = `<div style="font-weight: 600; margin-bottom: 6px; color: #64748B;">SIGAPP Index</div>`;
      
      const tiers = [
        { label: "< 40 (Kritis)", color: TIER_COLORS.kritis },
        { label: "40 - 54 (Tinggi)", color: TIER_COLORS.tinggi },
        { label: "55 - 69 (Sedang)", color: TIER_COLORS.sedang },
        { label: ">= 70 (Baik)", color: TIER_COLORS.rendah },
      ];

      for (const tier of tiers) {
        html += `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${tier.color}; margin-right: 8px;"></span>
            ${tier.label}
          </div>
        `;
      }

      div.innerHTML = html;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };

    legend.addTo(map);
    return () => { legend.remove(); };
  }, [map]);

  return null;
}

export default function MacroInsightMap({ 
  kecamatanData, 
  selectedKecamatan, 
  onKecamatanSelect,
  viewMode,
  kabupatenData
}: MacroInsightMapProps) {
  
  const center: [number, number] = [-8.6573, 121.0794]; // NTT center

  // Pre-calculate positions and colors
  const markers = useMemo<Array<MapMarker | null>>(() => {
    if (viewMode === "kecamatan") {
      return kecamatanData.map(kec => {
        const centroid = KECAMATAN_CENTROIDS.find(c => c.kecamatan === kec.kecamatan_name);
        if (!centroid) return null;
        
        return {
          id: kec.kecamatan_name,
          name: kec.kecamatan_name,
          lat: centroid.lat,
          lon: centroid.lon,
          index: kec.sigapp_index,
          color: getColorForIndex(kec.sigapp_index),
          isKabupaten: false
        };
      }).filter(Boolean);
    } else {
      // Calculate approximate centroid for kabupaten from its kecamatan
      return kabupatenData.map(kab => {
        const kabKecs = KECAMATAN_CENTROIDS.filter(c => c.kabupaten === kab.kabupaten_name);
        if (kabKecs.length === 0) return null;
        
        const avgLat = kabKecs.reduce((s, k) => s + k.lat, 0) / kabKecs.length;
        const avgLon = kabKecs.reduce((s, k) => s + k.lon, 0) / kabKecs.length;

        return {
          id: kab.kabupaten_name,
          name: kab.kabupaten_name,
          lat: avgLat,
          lon: avgLon,
          index: kab.sigapp_index_avg,
          color: getColorForIndex(kab.sigapp_index_avg),
          isKabupaten: true
        };
      }).filter(Boolean);
    }
  }, [kecamatanData, kabupatenData, viewMode]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={8}
        minZoom={7}
        maxZoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <LegendControl />

        {markers.map((marker: MapMarker | null) => {
          if (!marker) return null;
          const isSelected = selectedKecamatan === marker.name;
          
          return (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lon]}
              radius={isSelected ? (marker.isKabupaten ? 24 : 14) : (marker.isKabupaten ? 20 : 10)}
              fillColor={marker.color}
              fillOpacity={0.8}
              color={isSelected ? "#0D2137" : "#FFFFFF"}
              weight={isSelected ? 3 : 2}
              eventHandlers={{
                click: () => !marker.isKabupaten && onKecamatanSelect(marker.name),
              }}
            >
              <Tooltip>
                <div className="text-center">
                  <div className="font-bold text-slate-800">{marker.name}</div>
                  <div className="text-xs text-slate-500">Index: <span className="font-semibold text-slate-700">{marker.index}</span></div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
