"use client";

import { useState, useEffect } from "react";

export function AgentBrainWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [pulseCount, setPulseCount] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Expanded Panel */}
      <div
        className={`fixed bottom-20 right-4 z-[9999] w-64 bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl shadow-black/60 p-4 transition-all duration-200 ease-out ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-semibold text-white">SIGAPP Agent</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors text-sm leading-none"
            aria-label="Close agent panel"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-slate-600 my-3" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status</p>
            <div className="flex items-center gap-1.5 mt-0.5 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-300 font-bold uppercase">Active</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Cycle</p>
            <p className="text-xs text-slate-200 font-medium mt-0.5">Monthly</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Monitored</p>
            <p className="text-xs text-slate-200 font-medium mt-0.5">1,247 schools</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Last Run</p>
            <p className="text-xs text-slate-200 font-medium mt-0.5">2 hours ago</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Actions Taken</p>
            <p className="text-xs text-white font-bold mt-0.5">{pulseCount}</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">New KRITIS</p>
            <div className="bg-red-900/30 px-2 py-0.5 rounded border border-red-500/20 w-fit mt-0.5">
              <p className="text-[10px] text-red-300 font-bold uppercase">1 school</p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-700 my-3" />

        {/* Footer */}
        <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-tighter opacity-80">
          ⚡ Next analysis in 22h 14m
        </p>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 z-[9999] w-14 h-14 rounded-full bg-slate-900 border-2 border-green-500 shadow-lg shadow-green-500/20 flex items-center justify-center text-2xl hover:scale-105 transition-transform group"
        aria-label="SIGAPP Agent"
      >
        🧠
        {/* Pulsing dot */}
        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        {/* Hover tooltip */}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          SIGAPP Agent
        </span>
      </button>
    </>
  );
}
