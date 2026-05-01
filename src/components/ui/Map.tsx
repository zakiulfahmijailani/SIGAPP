"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SchoolWithIndex } from "@/lib/types";
import { getTierFromIndex } from "@/lib/utils";
import { IndexBadge } from "./IndexBadge";

// Fix Leaflet's default icon path issues by using a custom divIcon
function createCustomIcon(color: string) {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const TIER_COLORS: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MEDIUM: "#EAB308",
  LOW: "#22C55E",
};

interface MapProps {
  schools: SchoolWithIndex[];
}

export default function Map({ schools }: MapProps) {
  // Center map on Jakarta
  const center: [number, number] = [-6.2088, 106.8456];

  // Force a re-render or fix layout issues when parent container changes size
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [map, schools.length]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {schools.map((s) => {
          if (!s.latitude || !s.longitude || !s.school_index) return null;

          const tier = s.school_index.priority_tier ?? getTierFromIndex(s.school_index.sigapp_index);
          const color = TIER_COLORS[tier] || "#94A3B8";

          return (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              icon={createCustomIcon(color)}
            >
              <Popup className="sigapp-popup">
                <div className="flex flex-col gap-1 min-w-[200px]">
                  <p className="font-bold text-slate-800 m-0 leading-tight">
                    {s.school_name}
                  </p>
                  <p className="text-xs text-slate-500 m-0 mb-2 leading-tight">
                    {s.kecamatan} · {s.jenjang}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-semibold text-slate-600">SIGAPP Index</span>
                    <IndexBadge index={s.school_index.sigapp_index} tier={tier} />
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
