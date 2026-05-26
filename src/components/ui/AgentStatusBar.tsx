"use client";

import { useState, useEffect } from "react";

interface AgentStatusBarProps {
  mode?: "micro" | "macro";
}

export function AgentStatusBar({ mode = "micro" }: AgentStatusBarProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (mode === "macro") {
      // Next run: ~36 days from now (simulated)
      return 36 * 24 * 3600;
    }
    return 22 * 3600 + 14 * 60;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (mode === "macro") {
    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);

    return (
      <div className="w-full h-9 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0 z-50">
        {/* Left — Agent Status */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span>SIGAPP Macro Agent · <span className="text-green-400 font-medium">Active</span></span>
          <span className="hidden lg:inline text-slate-600 ml-1">· Siklus 6 bulan</span>
        </div>

        {/* Center — Last Macro Run */}
        <div className="hidden sm:block text-xs text-slate-400">
          Last macro run: Semester 2 2025 · 22 kecamatan dianalisis · 5 zona kritis terdeteksi · 3 instansi dinotifikasi
        </div>

        {/* Right — Countdown */}
        <div className="text-xs text-slate-400">
          Next run: <span className="text-white font-mono font-medium">1 Jul 2026</span>
          <span className="hidden md:inline text-slate-500 ml-1">· {days}d {hours}h lagi</span>
        </div>
      </div>
    );
  }

  // ─── Micro Mode (default, original behavior) ───
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
        <span>SIGAPP Agent · <span className="text-green-400 font-medium">Active</span></span>
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
