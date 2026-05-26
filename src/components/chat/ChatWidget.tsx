"use client";

import { MessageCircle, Bot, PanelRight } from "lucide-react";

export type ChatState = 'bubble' | 'expanded' | 'docked';

export interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
}



import { ChatUI } from "./ChatUI";

export interface ChatWidgetProps {
  chatState: ChatState;
  onChatStateChange: (state: ChatState) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showChips: boolean;
  setShowChips: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChatWidget({ 
  chatState, 
  onChatStateChange,
  messages,
  setMessages,
  showChips,
  setShowChips
}: ChatWidgetProps) {
  if (chatState === 'docked') return null;

  return (
    <>
      {/* 1. BUBBLE */}
      {chatState === 'bubble' && (
        <button
          onClick={() => onChatStateChange('expanded')}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full 
                     bg-[#00B4B4] shadow-lg flex items-center justify-center
                     hover:scale-110 hover:bg-[#0D2137] transition-all duration-200"
          aria-label="Buka chat"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* 2. EXPANDED PANEL */}
      {chatState === 'expanded' && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[480px] 
                        bg-white rounded-2xl shadow-2xl border border-gray-200
                        flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="relative h-12 bg-[#0D2137] flex items-center justify-between px-4 pr-12 shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[#00B4B4]" />
              <span className="text-white text-sm font-medium">SIGAPP AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChatStateChange('docked')}
                className="text-gray-400 hover:text-white transition-colors"
                title="Dock ke sidebar"
              >
                <PanelRight size={16} />
              </button>
            </div>
            <button
              onClick={() => onChatStateChange('bubble')}
              className="absolute top-3 right-3 text-white/70 hover:text-white 
                         transition-colors rounded-full p-1 hover:bg-white/10"
              aria-label="Tutup chatbot"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Chat UI */}
          <ChatUI 
            messages={messages}
            setMessages={setMessages}
            showChips={showChips}
            setShowChips={setShowChips}
          />
        </div>
      )}
    </>
  );
}
