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
  KRITIS: "bg-red-500/20 text-red-400 border border-red-500/30",
  TINGGI: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  SEDANG: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  NORMAL: "bg-green-500/20 text-green-400 border border-green-500/30",
};

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] || "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style}`}>
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
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 backdrop-blur-sm p-4 mb-6">
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            🤖 Agent Analysis
          </p>
          <p className="text-xs text-slate-500">{analysisDate}</p>
        </div>
        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] px-2 py-0.5 rounded-full">
          Generated automatically
        </span>
      </div>

      <div className="border-b border-slate-700/60 my-3" />

      {/* Middle Row — 3 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Column 1 — Dominant Pillar */}
        <div>
          <p className="text-[10px] text-slate-500 uppercase mb-1">Dominant Pillar</p>
          <p className="text-sm font-semibold text-white">{dominantPillar}</p>
          <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1.5">
            <div
              className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${dominantScore * 100}%` }}
            />
          </div>
        </div>

        {/* Column 2 — Tier Change */}
        <div>
          <p className="text-[10px] text-slate-500 uppercase mb-1">Tier Change</p>
          {tierChanged ? (
            <div className="flex items-center gap-1 mt-0.5">
              <TierBadge tier={previousTier} />
              <span className="text-slate-500 mx-1">→</span>
              <TierBadge tier={currentTier} />
            </div>
          ) : (
            <p className="text-xs text-slate-500">No change this cycle</p>
          )}
        </div>

        {/* Column 3 — Trigger */}
        <div>
          <p className="text-[10px] text-slate-500 uppercase mb-1">Triggered By</p>
          <p className="text-sm text-purple-400 font-medium">⚡ Auto-recompute</p>
          <p className="text-xs text-slate-500">Monthly cycle</p>
        </div>
      </div>

      <div className="border-b border-slate-700/60 my-3" />

      {/* Bottom Row — Actions Taken */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase mb-2">Actions Taken</p>
        <div className="flex flex-wrap gap-2">
          {reportGenerated && (
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1 rounded-full">
              ✅ Report generated
            </span>
          )}
          {emailDispatched && (
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1 rounded-full">
              ✅ Stakeholders notified
            </span>
          )}
          {!reportGenerated && !emailDispatched && (
            <span className="text-xs text-slate-500">⏳ Awaiting agent cycle</span>
          )}
        </div>
      </div>
    </div>
  );
}
