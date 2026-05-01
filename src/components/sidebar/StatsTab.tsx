"use client";

import { useEffect, useState } from "react";
import { SchoolWithIndex } from "@/lib/types";
import { PriorityTier, TIER_BG_COLORS } from "@/lib/utils";

interface StatsTabProps {
  schools: SchoolWithIndex[];
}

interface DistributionItem {
  label: string;
  tier: PriorityTier;
  color: string;
  count: number;
  total: number;
}

export function StatsTab({ schools }: StatsTabProps) {
  const totalSchools = schools.length;
  const withIndex = schools.filter(s => s.school_index);

  const kritisCount = withIndex.filter(s => s.school_index.priority_tier === 'KRITIS').length;
  const tinggiCount = withIndex.filter(s => s.school_index.priority_tier === 'TINGGI').length;

  const avgIndex = withIndex.length > 0
    ? withIndex.reduce((sum, s) => sum + s.school_index.sigapp_index, 0) / withIndex.length
    : 0;

  const uniqueKecamatan = new Set(schools.map(s => s.kecamatan)).size;

  const kpis = [
    { title: "Total Sekolah",   value: totalSchools.toString(),                subtitle: "DKI Jakarta (Sampel)",    color: "#0D2137" },
    { title: "Kritis + Tinggi", value: (kritisCount + tinggiCount).toString(), subtitle: "Butuh intervensi segera", color: "#DC2626" },
    { title: "Rata-rata Index", value: avgIndex.toFixed(2),                   subtitle: "Skala 0.0 – 1.0",         color: "#00B4B4" },
    { title: "Kec. Terdampak",  value: uniqueKecamatan.toString(),             subtitle: "Dari 44 kecamatan",       color: "#F97316" },
  ];

  const distribution: DistributionItem[] = [
    { label: 'Sangat Prioritas (Kritis)', tier: 'KRITIS', color: TIER_BG_COLORS.KRITIS, count: 0, total: totalSchools || 1 },
    { label: 'Prioritas Tinggi',          tier: 'TINGGI', color: TIER_BG_COLORS.TINGGI, count: 0, total: totalSchools || 1 },
    { label: 'Prioritas Sedang',          tier: 'SEDANG', color: TIER_BG_COLORS.SEDANG, count: 0, total: totalSchools || 1 },
    { label: 'Prioritas Rendah',          tier: 'RENDAH', color: TIER_BG_COLORS.RENDAH, count: 0, total: totalSchools || 1 },
  ].map(item => ({
    ...item,
    count: withIndex.filter(s => s.school_index.priority_tier === item.tier).length,
  })) as DistributionItem[];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">
          Ringkasan Data
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
              <h4 className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 truncate" title={kpi.title}>
                {kpi.title}
              </h4>
              <p className="text-2xl font-bold" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                {kpi.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">
          Distribusi Prioritas
        </h3>
        <div>
          {distribution.map((item, idx) => (
            <AnimatedBar key={idx} item={item} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AnimatedBar({
  item,
  index,
}: {
  item: DistributionItem;
  index: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const targetWidth = (item.count / item.total) * 100;
    const timer = setTimeout(() => {
      setWidth(targetWidth);
    }, index * 100 + 50);
    return () => clearTimeout(timer);
  }, [item.count, item.total, index]);

  return (
    <div className="flex flex-col gap-1 mb-3 last:mb-0">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600 font-medium">{item.label}</span>
        <span className="text-xs text-gray-400">{item.count}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}
