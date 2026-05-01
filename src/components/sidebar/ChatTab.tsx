"use client";

import { Bot, PanelRightOpen } from "lucide-react";
import { ChatUI } from "@/components/chat/ChatUI";
import type { Message } from "@/components/chat/ChatWidget";

interface ChatTabProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showChips: boolean;
  setShowChips: React.Dispatch<React.SetStateAction<boolean>>;
  onUndock: () => void;
}

export function ChatTab({
  messages,
  setMessages,
  showChips,
  setShowChips,
  onUndock
}: ChatTabProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. CHAT TAB HEADER */}
      <div className="flex justify-between items-center shrink-0 px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-[#00B4B4]" />
          <span className="text-xs font-medium text-gray-600">SIGAPP AI</span>
        </div>
        <button
          onClick={onUndock}
          className="text-xs text-gray-400 hover:text-[#00B4B4] flex items-center gap-1 transition-colors"
          title="Pindah ke floating panel"
        >
          <PanelRightOpen size={14} />
          <span>Undock</span>
        </button>
      </div>

      {/* 2. CHAT UI */}
      <div className="flex-1 overflow-hidden">
        <ChatUI
          messages={messages}
          setMessages={setMessages}
          showChips={showChips}
          setShowChips={setShowChips}
        />
      </div>
    </div>
  );
}
