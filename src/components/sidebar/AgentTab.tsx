"use client";

import { useState, useEffect } from "react";
import { AgentActivityFeed } from "./AgentActivityFeed";

export function AgentTab() {
  const [pulseCount, setPulseCount] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* SECTION A — Agent Brain Stats */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-600 p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">🧠</span>
          <span className="text-sm font-semibold text-white">SIGAPP Agent</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Status</p>
            <div className="flex items-center gap-1.5 mt-0.5 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-300 font-bold uppercase">Active</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Cycle</p>
            <p className="text-xs text-slate-200 mt-0.5">Monthly</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Monitored</p>
            <p className="text-xs text-slate-200 mt-0.5">1,247 schools</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Last Run</p>
            <p className="text-xs text-slate-200 mt-0.5">2 hours ago</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Actions Taken</p>
            <p className="text-xs text-white font-bold mt-0.5">{pulseCount}</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">New KRITIS</p>
            <div className="bg-red-900/30 px-2 py-0.5 rounded border border-red-500/20 w-fit mt-0.5">
              <p className="text-[10px] text-red-300 font-bold uppercase">1 school</p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-600 my-3 opacity-80" />
        
        <p className="text-xs text-slate-300 text-center font-medium">
          ⚡ Next analysis in 22h 14m
        </p>
      </div>

      {/* SECTION B — Agent Activity Feed */}
      <AgentActivityFeed />
    </div>
  );
}
