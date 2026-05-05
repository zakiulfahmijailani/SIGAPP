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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <p className="font-bold text-slate-800 text-base">{recipient.role}</p>
            <p className="text-xs text-slate-500 font-medium">{recipient.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
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
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                  msg.from === "system"
                    ? msg.isAuto
                      ? "bg-slate-100 text-slate-600 border border-slate-200 rounded-tr-none"
                      : "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                }`}
              >
                {msg.body}
              </div>
              {/* Meta */}
              <div className={`flex items-center gap-1.5 px-1 text-[10px] font-medium text-slate-400 ${msg.from === "system" ? "flex-row-reverse" : "flex-row"}`}>
                <span>{msg.senderName}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
                {msg.isAuto && (
                  <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded italic">otomatis</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-[10px] text-slate-400 text-center italic font-medium">
            Thread ini dikelola secara otomatis oleh SIGAPP Email Agent untuk memantau respons pemangku kepentingan.
          </p>
        </div>
      </div>
    </div>
  );
}
