"use client";

import { ChevronRight, BarChart2, List, MessageCircle } from "lucide-react";
import { StatsTab } from "./StatsTab";
import { RankedTab } from "./RankedTab";
import { SchoolWithIndex } from "@/lib/types";
import { ChatTab } from "./ChatTab";
import type { ChatState, Message } from "@/components/chat/ChatWidget";
import { AgentActivityFeed } from "./AgentActivityFeed";

export interface SidebarProps {
  activeTab: 'stats' | 'list' | 'chat';
  onTabChange: (tab: 'stats' | 'list' | 'chat') => void;
  onClose: () => void;
  selectedSchoolId?: string | null;
  onSchoolSelect?: (school: SchoolWithIndex | null) => void;
  chatState: ChatState;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showChips: boolean;
  setShowChips: React.Dispatch<React.SetStateAction<boolean>>;
  onUndock: () => void;
  schools: SchoolWithIndex[];
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  onClose, 
  selectedSchoolId = null, 
  onSchoolSelect = () => {},
  chatState,
  messages,
  setMessages,
  showChips,
  setShowChips,
  onUndock,
  schools
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* 1. SIDEBAR HEADER */}
      <div className="h-12 bg-[#0D2137] flex flex-row items-center justify-between px-3 shrink-0">
        <span className="text-white text-sm font-medium">Data Panel</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Close sidebar"
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>

      {/* 2. TAB BAR */}
      <div className="flex flex-row border-b border-gray-200 bg-white shrink-0">
        <TabButton
          icon={<BarChart2 size={16} />}
          label="Stats"
          isActive={activeTab === 'stats'}
          onClick={() => onTabChange('stats')}
        />
        <TabButton
          icon={<List size={16} />}
          label="Ranked"
          isActive={activeTab === 'list'}
          onClick={() => onTabChange('list')}
        />
        <TabButton
          icon={
            <div className="relative">
              <MessageCircle size={16} />
              {chatState === 'docked' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00B4B4] rounded-full" />
              )}
            </div>
          }
          label="Chat"
          isActive={activeTab === 'chat'}
          onClick={() => onTabChange('chat')}
        />
      </div>

      {/* 3. TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-4">
            <StatsTab schools={schools} />
            <AgentActivityFeed />
          </div>
        )}
        {activeTab === 'list' && (
          <RankedTab
            selectedSchoolId={selectedSchoolId}
            onSchoolSelect={onSchoolSelect}
          />
        )}
        {activeTab === 'chat' && (
          chatState === 'docked'
            ? <ChatTab
                messages={messages}
                setMessages={setMessages}
                showChips={showChips}
                setShowChips={setShowChips}
                onUndock={onUndock}
              />
            : <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
                <MessageCircle size={32} className="text-[#00B4B4] opacity-50" />
                <p className="text-sm font-medium text-gray-600">AI Chat tersedia</p>
                <p className="text-xs text-gray-400 max-w-[180px]">
                  Gunakan tombol chat di pojok kanan bawah untuk mulai bertanya.
                </p>
              </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ 
  icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors
        ${isActive 
          ? 'text-[#00B4B4] border-b-2 border-[#00B4B4]' 
          : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'}
      `}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
