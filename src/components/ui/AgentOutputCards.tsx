"use client";

import { FileText, Bell } from "lucide-react";

interface AgentOutputCardsProps {
  reportsGenerated: number;
  reportsToday: number;
  stakeholdersNotified: number;
  notificationsPending: number;
}

export function AgentOutputCards({
  reportsGenerated,
  reportsToday,
  stakeholdersNotified,
  notificationsPending,
}: AgentOutputCardsProps) {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center gap-3 flex-shrink-0 z-50">
      {/* Card 1 — Reports Generated */}
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 min-w-[180px]">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/15">
          <FileText size={15} className="text-blue-400" />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none mb-0.5">
            Reports Generated
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white tabular-nums leading-none">
              {reportsGenerated}
            </span>
            {reportsToday > 0 && (
              <span className="text-[10px] text-blue-400 font-medium">
                +{reportsToday} today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card 2 — Stakeholders Notified */}
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 min-w-[200px]">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500/15">
          <Bell size={15} className="text-green-400" />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none mb-0.5">
            Stakeholders Notified
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white tabular-nums leading-none">
              {stakeholdersNotified}
            </span>
            {notificationsPending > 0 && (
              <span className="text-[10px] text-yellow-400 font-medium">
                {notificationsPending} pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
