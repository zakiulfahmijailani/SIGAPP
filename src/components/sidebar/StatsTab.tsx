"use client";

import { useEffect, useState } from "react";

const KPI_DATA = [
  { title: "Total Sekolah", value: "500", subtitle: "DKI Jakarta (Sampel)", color: "#0D2137" },
  { title: "Sangat Prioritas", value: "47", subtitle: "Butuh intervensi segera", color: "#DC2626" },
  { title: "Rata-rata Index", value: "0.51", subtitle: "Skala 0.0 – 1.0", color: "#00B4B4" },
  { title: "Kec. Terdampak", value: "32", subtitle: "Dari 44 kecamatan", color: "#F97316" },
];

const DISTRIBUTION_DATA = [
  { label: 'Sangat Prioritas', count: 47,  color: '#DC2626', total: 500 },
  { label: 'Prioritas Tinggi', count: 123, color: '#F97316', total: 500 },
  { label: 'Prioritas Sedang', count: 187, color: '#EAB308', total: 500 },
  { label: 'Prioritas Rendah', count: 103, color: '#22C55E', total: 500 },
  { label: 'Tidak Prioritas',  count: 40,  color: '#94A3B8', total: 500 },
];

export function StatsTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* SECTION 1: KPI CARDS */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">
          Ringkasan Data
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {KPI_DATA.map((kpi, idx) => (
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

      {/* SECTION 2: DISTRIBUTION BARS */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">
          Distribusi Prioritas
        </h3>
        <div>
          {DISTRIBUTION_DATA.map((item, idx) => (
            <AnimatedBar key={idx} item={item} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AnimatedBar({ 
  item, 
  index 
}: { 
  item: typeof DISTRIBUTION_DATA[0]; 
  index: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const targetWidth = (item.count / item.total) * 100;
    
    // Delay each bar by index * 100ms
    const timer = setTimeout(() => {
      setWidth(targetWidth);
    }, index * 100 + 50); // Add a tiny 50ms initial delay so the animation feels right

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
