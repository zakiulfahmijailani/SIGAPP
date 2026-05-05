"use client";

import React from "react";
import { StakeholderRecipient } from "@/lib/agentData";

interface EmailThreadModalProps {
  recipient: StakeholderRecipient;
  onClose: () => void;
}

export default function EmailThreadModal({
  recipient,
  onClose,
}: EmailThreadModalProps) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal box */}
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="px-6 py-5 border-b border-slate-700 flex items-start justify-between bg-slate-800/50">
          <div>
            <p className="font-bold text-white text-base tracking-tight">{recipient.role}</p>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-0.5">{recipient.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Thread */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
          {recipient.thread.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1.5 ${
                msg.from === "system" ? "items-end" : "items-start"
              }`}
            >
              {/* Bubble */}
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow-lg ${
                  msg.from === "system"
                    ? msg.isAuto
                      ? "bg-slate-800 text-slate-200 border border-slate-700 rounded-tr-none font-medium"
                      : "bg-emerald-600 text-white rounded-tr-none font-bold"
                    : "bg-slate-950 text-white border border-slate-800 rounded-tl-none font-medium"
                }`}
              >
                {msg.body}
              </div>
              {/* Meta */}
              <div className={`flex items-center gap-1.5 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter ${msg.from === "system" ? "flex-row-reverse" : "flex-row"}`}>
                <span className="text-slate-300">{msg.senderName}</span>
                <span className="opacity-50">·</span>
                <span>{msg.timestamp}</span>
                {msg.isAuto && (
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded italic border border-slate-700/50">otomatis</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/30">
          <p className="text-[10px] text-slate-400 text-center italic font-bold uppercase tracking-wider">
            Thread ini dikelola secara otomatis oleh SIGAPP Email Agent untuk memantau respons pemangku kepentingan.
          </p>
        </div>
      </div>
    </div>
  );
}
