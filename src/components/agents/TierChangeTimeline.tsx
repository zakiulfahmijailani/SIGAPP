"use client";

interface TimelineEntry {
  month: string;
  tier: string;
  index: number;
  note?: string;
  agentDetected?: boolean;
}

interface TierChangeTimelineProps {
  entries: TimelineEntry[];
  schoolName: string;
}

const TIER_DOT: Record<string, string> = {
  KRITIS: "bg-red-500 border-red-400",
  TINGGI: "bg-orange-500 border-orange-400",
  SEDANG: "bg-yellow-500 border-yellow-400",
  NORMAL: "bg-green-500 border-green-400",
};

const TIER_BADGE: Record<string, string> = {
  KRITIS: "bg-red-500/20 text-red-400 border border-red-500/30",
  TINGGI: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  SEDANG: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  NORMAL: "bg-green-500/20 text-green-400 border border-green-500/30",
};

export default function TierChangeTimeline({ entries, schoolName }: TierChangeTimelineProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 backdrop-blur-sm p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          📈 Index History — {schoolName}
        </span>
        <span className="text-[10px] text-slate-500 italic">
          Tracked by SIGAPP Agent
        </span>
      </div>

      <div className="border-b border-slate-700/60 my-3" />

      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />

        {entries.map((entry, i) => {
          const isLast = i === entries.length - 1;
          const dotColor = TIER_DOT[entry.tier] || "bg-slate-500 border-slate-400";
          const badgeColor = TIER_BADGE[entry.tier] || "bg-slate-500/20 text-slate-400 border border-slate-500/30";
          const dotSize = isLast ? "w-4 h-4" : "w-3 h-3";
          const dotOffset = isLast ? "-left-[22px] top-0.5" : "-left-[18px] top-1";

          return (
            <div key={entry.month} className={`relative ${isLast ? "" : "mb-4"}`}>
              {/* Agent detection ring */}
              {entry.agentDetected && (
                <div className="absolute -left-[26px] top-0 w-5 h-5 rounded-full border border-purple-500/50 animate-pulse" />
              )}

              {/* Dot */}
              <div className={`absolute ${dotOffset} ${dotSize} rounded-full border-2 ${dotColor} z-10`} />

              {/* Content */}
              <div className="ml-2">
                {/* Row 1: Month + Tier badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isLast ? "font-semibold text-white" : "font-medium text-slate-300"}`}>
                    {entry.month}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>
                    {entry.tier}
                  </span>
                </div>

                {/* Row 2: Index + progress bar */}
                <div className="flex items-center mt-1">
                  <span className="text-[11px] text-slate-400">
                    SIGAPP Index: {entry.index.toFixed(3)}
                  </span>
                  <span className="inline-block w-16 h-1 bg-slate-700 rounded-full ml-2">
                    <span
                      className="block h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(entry.index * 100, 100)}%` }}
                    />
                  </span>
                </div>

                {/* Row 3: Note */}
                {entry.note && (
                  <p className="text-[10px] text-slate-500 italic mt-0.5">{entry.note}</p>
                )}

                {/* Row 4: Agent detected */}
                {entry.agentDetected && (
                  <p className="text-[10px] text-purple-400 mt-0.5">⚡ Agent detected this change</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
