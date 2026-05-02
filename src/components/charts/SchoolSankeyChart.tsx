"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import { SchoolIndex, PillarVariables } from "@/lib/types";

interface SchoolSankeyChartProps {
  schoolIndex: SchoolIndex;
  pillarVariables: PillarVariables;
}

export default function SchoolSankeyChart({
  schoolIndex,
  pillarVariables,
}: SchoolSankeyChartProps) {
  // 1. Define Nodes
  const nodes = [
    // Sources
    { id: "Rapor Pendidikan", color: "#0B2A4A" },
    { id: "BPS", color: "#B7C3CE" },
    { id: "OpenStreetMap", color: "#1FB5A8" },
    { id: "Google Earth Engine", color: "#123A63" },
    { id: "Dapodik", color: "#D9E6F2" },
    { id: "Social Media", color: "#178F87" },
    
    // Variables
    { id: "Literasi", color: "#D9E6F2" },
    { id: "Numerasi", color: "#D9E6F2" },
    { id: "Kualitas GTK", color: "#D9E6F2" },
    { id: "% Penduduk Miskin", color: "#E9EEF3" },
    { id: "Travel Time", color: "#D9F2EF" },
    { id: "Kondisi Bangunan", color: "#F4D7E5" },
    { id: "Tren Enrollment", color: "#F4D7E5" },
    { id: "Frekuensi Keluhan", color: "#FCE3D1" },
    
    // Pillars
    { id: "Quality Gap", color: "#E75D5D" },
    { id: "Spatial Inequity", color: "#F28E2B" },
    { id: "Structural Risk", color: "#8A6BE8" },
    { id: "Public Signal", color: "#E0A21D" },
    
    // Output
    { id: "SIGAPP Index", color: "#1FB5A8" },
  ];

  // 2. Define Links with normalization and filtering
  const rawLinks = [
    // Data Source -> Variables
    { source: "Rapor Pendidikan", target: "Literasi", value: pillarVariables.literacy_score },
    { source: "Rapor Pendidikan", target: "Numerasi", value: pillarVariables.numeracy_score },
    { source: "Rapor Pendidikan", target: "Kualitas GTK", value: pillarVariables.teacher_quality_score },
    { source: "BPS", target: "% Penduduk Miskin", value: pillarVariables.poverty_rate },
    { source: "OpenStreetMap", target: "Travel Time", value: Math.min(pillarVariables.travel_time_minutes / 100, 1) },
    { source: "Google Earth Engine", target: "Kondisi Bangunan", value: pillarVariables.building_damage_weight },
    { source: "Dapodik", target: "Tren Enrollment", value: Math.abs(pillarVariables.enrollment_trend_3yr) },
    { source: "Social Media", target: "Frekuensi Keluhan", value: Math.min(pillarVariables.complaint_frequency / 100, 1) },
    
    // Variables -> Pillars
    { source: "Literasi", target: "Quality Gap", value: pillarVariables.literacy_score },
    { source: "Numerasi", target: "Quality Gap", value: pillarVariables.numeracy_score },
    { source: "Kualitas GTK", target: "Quality Gap", value: pillarVariables.teacher_quality_score },
    { source: "% Penduduk Miskin", target: "Spatial Inequity", value: pillarVariables.poverty_rate },
    { source: "Travel Time", target: "Spatial Inequity", value: Math.min(pillarVariables.travel_time_minutes / 100, 1) },
    { source: "Kondisi Bangunan", target: "Structural Risk", value: pillarVariables.building_damage_weight },
    { source: "Tren Enrollment", target: "Structural Risk", value: Math.abs(pillarVariables.enrollment_trend_3yr) },
    { source: "Frekuensi Keluhan", target: "Public Signal", value: Math.min(pillarVariables.complaint_frequency / 100, 1) },
    
    // Pillars -> Final Index
    { source: "Quality Gap", target: "SIGAPP Index", value: schoolIndex.p1_quality_gap * 0.35 },
    { source: "Spatial Inequity", target: "SIGAPP Index", value: schoolIndex.p2_spatial_inequity * 0.25 },
    { source: "Structural Risk", target: "SIGAPP Index", value: schoolIndex.p3_structural_risk * 0.25 },
    { source: "Public Signal", target: "SIGAPP Index", value: schoolIndex.p4_public_signal * 0.15 },
  ];

  // Filter out invalid or zero links to prevent Nivo crashes
  const links = rawLinks.filter(l => typeof l.value === 'number' && l.value > 0 && !isNaN(l.value));

  return (
    <div style={{ height: 480 }}>
      <ResponsiveSankey<{ id: string; color: string }, { source: string; target: string; value: number }>
        data={{ nodes, links }}
        margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
        align="justify"
        colors={{ datum: 'color' }}
        nodeOpacity={1}
        nodeThickness={18}
        nodeInnerPadding={4}
        nodeSpacing={24}
        nodeBorderWidth={0}
        linkOpacity={0.4}
        linkHoverOpacity={0.7}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
        nodeTooltip={(node) => (
          <div style={{ padding: '8px 12px', background: '#0D2137', borderRadius: 6, color: '#fff', fontSize: 12 }}>
            <strong style={{ color: node.node.color }}>{node.node.id}</strong>: {typeof node.node.value === 'number' ? node.node.value.toFixed(3) : node.node.value}
          </div>
        )}
      />
    </div>
  );
}
