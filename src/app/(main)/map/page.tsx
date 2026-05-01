"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SchoolWithIndex } from "@/lib/types";
import { useSchools, getPriorityClass } from "@/hooks/useSchools";
import { IndexBadge } from "@/components/ui/IndexBadge";
import { getTierFromIndex } from "@/lib/utils";
import Link from "next/link";
import { X, ArrowRight, MapPin } from "lucide-react";

// Dynamically import the map component with ssr: false
const SchoolMap = dynamic(() => import("@/components/map/SchoolMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-sm font-medium text-slate-600">Initializing map...</p>
      </div>
    </div>
  ),
});

export default function InteractiveMapPage() {
  const { schools, loading } = useSchools();
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithIndex | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 relative">
        <SchoolMap
          schools={schools}
          loading={loading}
          selectedSchoolId={selectedSchool?.id || null}
          onSchoolClick={(school) => setSelectedSchool(school)}
        />
      </div>

      {/* Details Sidebar */}
      {selectedSchool && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col h-full z-[1001] transition-transform duration-300">
          <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {selectedSchool.npsn} • {selectedSchool.jenjang}
              </p>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                {selectedSchool.school_name}
              </h2>
              <div className="flex items-center gap-1 mt-2 text-slate-500 text-sm">
                <MapPin size={14} />
                <span>{selectedSchool.kecamatan}, {selectedSchool.kelurahan}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedSchool(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Overall Priority</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {selectedSchool.school_index.sigapp_index.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 capitalize mt-1">
                    {getPriorityClass(selectedSchool.school_index.sigapp_index).replace('_', ' ')}
                  </p>
                </div>
                <IndexBadge 
                  index={selectedSchool.school_index.sigapp_index} 
                  tier={getTierFromIndex(selectedSchool.school_index.sigapp_index)} 
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Pillar Breakdown</h3>
              <div className="space-y-4">
                <PillarBar label="P1: Quality Gap" score={selectedSchool.school_index.p1_quality_gap} color="bg-red-500" />
                <PillarBar label="P2: Spatial Inequity" score={selectedSchool.school_index.p2_spatial_inequity} color="bg-orange-500" />
                <PillarBar label="P3: Structural Risk" score={selectedSchool.school_index.p3_structural_risk} color="bg-yellow-500" />
                <PillarBar label="P4: Public Signal" score={selectedSchool.school_index.p4_public_signal} color="bg-teal" />
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-white">
            <Link
              href={`/schools/${selectedSchool.id}`}
              className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
            >
              View Full Profile
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function PillarBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{score.toFixed(2)}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full`} 
          style={{ width: `${Math.max(5, score * 100)}%` }}
        />
      </div>
    </div>
  );
}
