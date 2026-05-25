"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { MacroInsightKecamatan, SEMESTERS, TREND_COLORS } from "@/lib/macroInsightData";

interface MacroInsightTrendChartProps {
  allKecamatanData: MacroInsightKecamatan[];
  selectedKabupaten: string | null;
  highlightKecamatan: string | null;
}

export default function MacroInsightTrendChart({
  allKecamatanData,
  selectedKabupaten,
  highlightKecamatan
}: MacroInsightTrendChartProps) {
  
  const chartData = useMemo(() => {
    // We need data in the format:
    // [ { name: "S1", "Kec A": 50, "Kec B": 60 }, { name: "S2", ... } ]
    
    // 1. Filter kecamatan
    const relevantKecs = allKecamatanData.filter(k => 
      !selectedKabupaten || selectedKabupaten === "all" || k.kabupaten_name === selectedKabupaten
    );
    
    // Group by report_id (which maps to semester)
    const bySemester: Record<string, Record<string, unknown>> = {};
    
    SEMESTERS.forEach(sem => {
      bySemester[sem.key] = { name: sem.label, _sortIndex: SEMESTERS.indexOf(sem) };
    });

    relevantKecs.forEach(k => {
      const semKey = k.id.split("-").pop(); // Extract semester key from ID e.g., mik-alok-S1 -> S1
      if (semKey && bySemester[semKey]) {
        bySemester[semKey][k.kecamatan_name] = k.sigapp_index;
        // Store trend type for coloring
        if (!bySemester[semKey][`${k.kecamatan_name}_trend`]) {
          bySemester[semKey][`${k.kecamatan_name}_trend`] = k.trend_type;
        }
      }
    });

    return Object.values(bySemester).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a._sortIndex as number) - (b._sortIndex as number));
  }, [allKecamatanData, selectedKabupaten]);

  // Extract unique kecamatan names to create Line components
  const kecamatanNames = useMemo(() => {
    const names = new Set<string>();
    const relevantKecs = allKecamatanData.filter(k => 
      !selectedKabupaten || selectedKabupaten === "all" || k.kabupaten_name === selectedKabupaten
    );
    relevantKecs.forEach(k => names.add(k.kecamatan_name));
    return Array.from(names);
  }, [allKecamatanData, selectedKabupaten]);

  // Helper to get color based on trend type from the latest data point
  const getLineColor = (kecName: string) => {
    const latestData = allKecamatanData.find(k => k.kecamatan_name === kecName && k.id.endsWith(SEMESTERS[SEMESTERS.length-1].key));
    if (latestData) {
      return TREND_COLORS[latestData.trend_type] || "#94A3B8";
    }
    return "#94A3B8";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm w-full h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Tren SIGAPP Index (5 Semester)</h3>
      </div>
      
      <div className="w-full h-[300px]">
        {chartData.length > 0 && kecamatanNames.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#0D2137", border: "none", borderRadius: "8px", color: "white", fontSize: "12px" }}
                itemStyle={{ color: "white" }}
              />
              
              {kecamatanNames.map(name => {
                const isHighlighted = highlightKecamatan === name;
                // If there's a highlight, dim others significantly
                const opacity = highlightKecamatan 
                  ? (isHighlighted ? 1 : 0.1) 
                  : 0.6;
                  
                return (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={getLineColor(name)}
                    strokeWidth={isHighlighted ? 4 : 1.5}
                    strokeOpacity={opacity}
                    dot={isHighlighted ? { r: 5, fill: getLineColor(name), strokeWidth: 0 } : false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Tidak ada data tren tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
