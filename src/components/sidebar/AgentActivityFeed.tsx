"use client";

const agentLog = [
  {
    time: "12:04",
    type: "kritis",
    message: "SDN Penjaringan 01 crossed KRITIS threshold",
  },
  {
    time: "12:01",
    type: "report",
    message: "Intervention report auto-generated for 3 schools",
  },
  {
    time: "11:58",
    type: "rescore",
    message: "SDN Tambora 03 re-scored — P3 weight increased",
  },
  {
    time: "11:52",
    type: "email",
    message: "Reports dispatched to 5 administrative levels",
  },
  {
    time: "11:45",
    type: "cycle",
    message: "SIGAPP Index re-computed — 1,247 schools updated",
  },
  {
    time: "09:30",
    type: "rescore",
    message: "SDN Cengkareng 07 re-scored — P1 weight decreased",
  },
  {
    time: "09:15",
    type: "cycle",
    message: "Monthly data ingestion completed — 4 pillars refreshed",
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  kritis:  { icon: "🔴", color: "text-red-400" },
  report:  { icon: "📄", color: "text-blue-400" },
  rescore: { icon: "🔄", color: "text-yellow-400" },
  email:   { icon: "✉️", color: "text-green-400" },
  cycle:   { icon: "⚡", color: "text-purple-400" },
};

export function AgentActivityFeed() {
  return (
    <div className="w-full bg-slate-900/60 rounded-xl p-3 border border-slate-800 overflow-hidden my-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400">
          🤖 Agent Activity
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">live</span>
        </div>
      </div>

      {/* Scrollable log */}
      <div className="max-h-36 overflow-y-auto">
        {agentLog.map((entry, i) => {
          const config = TYPE_CONFIG[entry.type] || { icon: "•", color: "text-slate-400" };
          const isLast = i === agentLog.length - 1;

          return (
            <div
              key={i}
              className={`flex items-start gap-2 py-1.5 ${!isLast ? "border-b border-slate-800" : ""}`}
            >
              <span className="text-xs leading-none mt-0.5">{config.icon}</span>
              <span className="text-[10px] text-slate-500 w-8 flex-shrink-0 mt-px">{entry.time}</span>
              <span className={`text-xs ${config.color} leading-snug`}>{entry.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
