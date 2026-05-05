"use client";

import { useState, useEffect } from "react";

export function AgentStatusBar() {
  const [secondsLeft, setSecondsLeft] = useState(22 * 3600 + 14 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);

  return (
    <div className="w-full h-9 bg-slate-950 border-b border-slate-600 flex items-center justify-between px-4 flex-shrink-0 z-50">
      {/* Left — Agent Status */}
      <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span>🤖 SIGAPP Agent · <span className="text-emerald-400 font-bold uppercase tracking-tight">Active</span></span>
      </div>

      {/* Center — Last Analysis */}
      <div className="hidden sm:block text-[11px] text-slate-300 font-medium">
        Last analysis: 2 hours ago · 3 schools re-tiered · <span className="text-red-400 font-bold">1 new KRITIS detected</span>
      </div>

      {/* Right — Countdown */}
      <div className="text-[11px] text-slate-300 font-medium">
        Next run: <span className="text-white font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded ml-1">{hours}h {String(minutes).padStart(2, "0")}m</span>
      </div>
    </div>
  );
}
