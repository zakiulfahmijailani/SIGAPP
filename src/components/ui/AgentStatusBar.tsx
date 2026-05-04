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
    <div className="w-full h-9 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0 z-50">
      {/* Left — Agent Status */}
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span>🤖 SIGAPP Agent · <span className="text-green-400 font-medium">Active</span></span>
      </div>

      {/* Center — Last Analysis */}
      <div className="hidden sm:block text-xs text-slate-400">
        Last analysis: 2 hours ago · 3 schools re-tiered · 1 new KRITIS detected
      </div>

      {/* Right — Countdown */}
      <div className="text-xs text-slate-400">
        Next run: <span className="text-white font-mono font-medium">{hours}h {String(minutes).padStart(2, "0")}m</span>
      </div>
    </div>
  );
}
