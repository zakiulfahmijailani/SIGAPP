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
      <div className="bg-slate-900/60 rounded-xl border border-slate-700 p-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">🧠</span>
          <span className="text-sm font-semibold text-white">SIGAPP Agent</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-green-400 font-semibold">ACTIVE</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 uppercase">Cycle</p>
            <p className="text-xs text-slate-300 mt-0.5">Monthly</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 uppercase">Monitored</p>
            <p className="text-xs text-slate-300 mt-0.5">1,247 schools</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 uppercase">Last Run</p>
            <p className="text-xs text-slate-300 mt-0.5">2 hours ago</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 uppercase">Actions Taken</p>
            <p className="text-xs text-white font-bold mt-0.5">{pulseCount}</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 uppercase">New KRITIS</p>
            <p className="text-xs text-red-400 font-semibold mt-0.5">1 school</p>
          </div>
        </div>

        <div className="border-b border-slate-700 my-3 opacity-50" />
        
        <p className="text-xs text-slate-500 text-center">
          ⚡ Next analysis in 22h 14m
        </p>
      </div>

      {/* SECTION B — Agent Activity Feed */}
      <AgentActivityFeed />
    </div>
  );
}
