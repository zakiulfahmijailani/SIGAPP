"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { SekolahNTTFull } from "@/lib/types";

interface PulsingMarkerProps {
  school: SekolahNTTFull;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

// Inject keyframes once globally
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ping-ring {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .pulse-ring {
      animation: ping-ring 1.4s ease-out infinite;
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
}

export function PulsingMarker({ school, color, isSelected, onClick }: PulsingMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    injectStyles();

    const size = isSelected ? 18 : 12;
    const ringSize = size + 16;

    const icon = L.divIcon({
      className: "",
      iconSize: [ringSize + 10, ringSize + 20],
      iconAnchor: [(ringSize + 10) / 2, (ringSize + 20) / 2],
      html: `
        <div style="position:relative; width:${ringSize + 10}px; height:${ringSize + 20}px; display:flex; align-items:center; justify-content:center;">
          <!-- NEW badge -->
          <span style="
            position:absolute;
            top:0;
            left:50%;
            transform:translateX(-50%);
            background:#EF4444;
            color:#fff;
            font-size:9px;
            font-weight:700;
            padding:1px 4px;
            border-radius:3px;
            line-height:1.2;
            letter-spacing:0.5px;
            white-space:nowrap;
            z-index:10;
          ">NEW</span>
          <!-- Pulsing ring -->
          <div class="pulse-ring" style="
            position:absolute;
            width:${ringSize}px;
            height:${ringSize}px;
            border-radius:50%;
            border:2px solid ${color};
            top:50%;
            left:50%;
            transform:translate(-50%, -50%);
          "></div>
          <!-- Main dot -->
          <div style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${color};
            border:${isSelected ? "2px solid #0D2137" : "1.5px solid #fff"};
            position:relative;
            z-index:5;
            margin-top:6px;
          "></div>
        </div>
      `,
    });

    const marker = L.marker([school.lat, school.lon], { icon });
    marker.on("click", onClick);
    marker.bindTooltip(school?.school_name || '-');
    marker.addTo(map);
    markerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [map, school, color, isSelected, onClick]);

  return null;
}
