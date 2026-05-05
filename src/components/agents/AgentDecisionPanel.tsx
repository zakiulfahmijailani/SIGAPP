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
  KRITIS: "bg-red-500/15 text-red-400 border border-red-500/30",
  TINGGI: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  SEDANG: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  NORMAL: "bg-green-500/15 text-green-400 border border-green-500/30",
};

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] || "bg-slate-500/15 text-slate-400 border border-slate-500/30";
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            🤖 Agent Analysis
          </span>
          <span className="text-[10px] text-slate-400">{analysisDate}</span>
        </div>
        <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-medium">
          Auto-generated
        </span>
      </div>

      {/* Compact 4-col grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Dominant Pillar */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Dominant Pillar</p>
          <p className="font-semibold text-slate-700 leading-tight">{dominantPillar}</p>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5">
            <div
              className="h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              style={{ width: `${dominantScore * 100}%` }}
            />
          </div>
        </div>

        {/* Tier Change */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Tier Change</p>
          {tierChanged ? (
            <div className="flex items-center gap-1 mt-0.5">
              <TierBadge tier={previousTier} />
              <span className="text-slate-300 text-[10px]">→</span>
              <TierBadge tier={currentTier} />
            </div>
          ) : (
            <p className="text-slate-400">No change</p>
          )}
        </div>

        {/* Trigger */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Triggered By</p>
          <p className="font-medium text-violet-600">⚡ Auto-recompute</p>
          <p className="text-[10px] text-slate-400">Monthly cycle</p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Actions</p>
          <div className="flex flex-col gap-0.5">
            {reportGenerated && (
              <span className="text-[10px] text-blue-600">✅ Report generated</span>
            )}
            {emailDispatched && (
              <span className="text-[10px] text-green-600">✅ Stakeholders notified</span>
            )}
            {!reportGenerated && !emailDispatched && (
              <span className="text-[10px] text-slate-400">⏳ Awaiting agent</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
