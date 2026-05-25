"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { MacroInsightKecamatan, TREND_LABELS, TREND_COLORS, TrendType } from "@/lib/macroInsightData";

interface MacroInsightTableProps {
  data: MacroInsightKecamatan[];
  onRowClick: (kecamatanName: string) => void;
  expandedRow: string | null;
}

type SortField = "kecamatan_name" | "kabupaten_name" | "sigapp_index" | "trend_type" | "critical_schools" | "delta_from_prev";

export default function MacroInsightTable({ data, onRowClick, expandedRow }: MacroInsightTableProps) {
  const [sortField, setSortField] = useState<SortField>("sigapp_index");
  const [sortAsc, setSortAsc] = useState<boolean>(true); // Ascending for sigapp_index = worst first

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // Default directions
      if (field === "sigapp_index" || field === "critical_schools") {
        setSortAsc(false); // Highest first for index/critical
      } else {
        setSortAsc(true);
      }
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let valA: unknown = a[sortField as keyof MacroInsightKecamatan];
    let valB: unknown = b[sortField as keyof MacroInsightKecamatan];

    // Handle nulls in delta
    if (sortField === "delta_from_prev") {
      valA = valA ?? 0;
      valB = valB ?? 0;
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    
    const numA = (valA as number) || 0;
    const numB = (valB as number) || 0;
    return sortAsc ? (numA > numB ? 1 : -1) : (numA < numB ? 1 : -1);
  });

  const getTrendBgColor = (trend: TrendType) => {
    switch (trend) {
      case "recovery": return "bg-green-50";
      case "declining": return "bg-red-50";
      case "chronic_critical": return "bg-purple-50";
      case "stable_good": return "bg-blue-50";
      case "volatile": return "bg-amber-50";
      default: return "";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort("kecamatan_name")}>
                Kecamatan {sortField === "kecamatan_name" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort("kabupaten_name")}>
                Kabupaten {sortField === "kabupaten_name" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort("sigapp_index")}>
                SIGAPP Index {sortField === "sigapp_index" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort("delta_from_prev")}>
                Delta {sortField === "delta_from_prev" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort("trend_type")}>
                Status Tren {sortField === "trend_type" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort("critical_schools")}>
                Sekolah Kritis {sortField === "critical_schools" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 font-medium text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row) => {
              const isExpanded = expandedRow === row.kecamatan_name;
              
              return (
                <tr 
                  key={row.id} 
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${getTrendBgColor(row.trend_type)}`}
                  onClick={() => onRowClick(row.kecamatan_name)}
                >
                  <td className="px-6 py-4 font-medium text-slate-800">{row.kecamatan_name}</td>
                  <td className="px-6 py-4 text-slate-600">{row.kabupaten_name}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{row.sigapp_index}</td>
                  <td className="px-6 py-4">
                    {row.delta_from_prev !== null ? (
                      <div className={`flex items-center gap-1 font-medium ${row.delta_from_prev > 0 ? "text-green-600" : row.delta_from_prev < 0 ? "text-red-600" : "text-slate-400"}`}>
                        {row.delta_from_prev > 0 ? <ArrowUp size={14} /> : row.delta_from_prev < 0 ? <ArrowDown size={14} /> : <Minus size={14} />}
                        {Math.abs(row.delta_from_prev)}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${TREND_COLORS[row.trend_type]}15`,
                        color: TREND_COLORS[row.trend_type]
                      }}
                    >
                      {TREND_LABELS[row.trend_type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${row.critical_schools > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {row.critical_schools}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">/ {row.total_schools}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {isExpanded ? <ChevronUp size={18} className="inline" /> : <ChevronDown size={18} className="inline" />}
                  </td>
                </tr>
              );
            })}
            
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  Tidak ada data yang tersedia untuk filter saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
