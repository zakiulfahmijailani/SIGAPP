interface AgentDecisionPanelProps {
  dominantPillar: string;
  dominantScore: number;
  previousTier: string;
  currentTier: string;
  tierChanged: boolean;
  analysisDate: string;
  reportGenerated: boolean;
  emailDispatched: boolean;
}

const TIER_STYLES: Record<string, string> = {
  KRITIS: "bg-red-900/40 text-red-200 border border-red-500/30",
  TINGGI: "bg-orange-900/40 text-orange-200 border border-orange-500/30",
  SEDANG: "bg-yellow-900/40 text-yellow-200 border border-yellow-500/30",
  NORMAL: "bg-green-900/40 text-green-200 border border-green-500/30",
};

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] || "bg-slate-800 text-slate-200 border border-slate-600";
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${style}`}>
      {tier}
    </span>
  );
}

export default function AgentDecisionPanel({
  dominantPillar,
  dominantScore,
  previousTier,
  currentTier,
  tierChanged,
  analysisDate,
  reportGenerated,
  emailDispatched,
}: AgentDecisionPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-900/90 backdrop-blur-md p-4 mb-6 shadow-xl">
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            🤖 Agent Analysis
          </p>
          <p className="text-xs text-slate-300 font-medium">{analysisDate}</p>
        </div>
        <span className="bg-emerald-900/40 text-emerald-200 border border-emerald-500/30 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
          Generated automatically
        </span>
      </div>

      <div className="border-b border-slate-600/60 my-3" />

      {/* Middle Row — 3 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Column 1 — Dominant Pillar */}
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dominant Pillar</p>
          <p className="text-sm font-bold text-white tracking-tight">{dominantPillar}</p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 border border-slate-700/50">
            <div
              className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${dominantScore * 100}%` }}
            />
          </div>
        </div>

        {/* Column 2 — Tier Change */}
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tier Change</p>
          {tierChanged ? (
            <div className="flex items-center gap-1.5 mt-1">
              <TierBadge tier={previousTier} />
              <span className="text-slate-500 font-bold">→</span>
              <TierBadge tier={currentTier} />
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No change this cycle</p>
          )}
        </div>

        {/* Column 3 — Trigger */}
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Triggered By</p>
          <p className="text-sm text-purple-300 font-bold">⚡ Auto-recompute</p>
          <p className="text-xs text-slate-400 font-medium">Monthly cycle</p>
        </div>
      </div>

      <div className="border-b border-slate-600/60 my-3" />

      {/* Bottom Row — Actions Taken */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Actions Taken</p>
        <div className="flex flex-wrap gap-2">
          {reportGenerated && (
            <span className="bg-blue-900/40 text-blue-200 border border-blue-500/30 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wide">
              ✅ Report generated
            </span>
          )}
          {emailDispatched && (
            <span className="bg-emerald-900/40 text-emerald-200 border border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wide">
              ✅ Stakeholders notified
            </span>
          )}
          {!reportGenerated && !emailDispatched && (
            <span className="text-[10px] text-slate-400 font-bold uppercase italic">⏳ Awaiting agent cycle</span>
          )}
        </div>
      </div>
    </div>
  );
}
