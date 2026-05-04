"use client";

import { ChevronRight, BarChart2, List, MessageCircle } from "lucide-react";
import { StatsTab } from "./StatsTab";
import { RankedTab } from "./RankedTab";
import { SchoolWithIndex } from "@/lib/types";
import type { Message } from "@/components/chat/ChatWidget";
import { AgentTab } from "./AgentTab";
import { ChatUI } from "@/components/chat/ChatUI";
import { Bot } from "lucide-react";

export interface SidebarProps {
  activeTab: 'stats' | 'list' | 'chat' | 'agent';
  onTabChange: (tab: 'stats' | 'list' | 'chat' | 'agent') => void;
  onClose: () => void;
  selectedSchoolId?: string | null;
  onSchoolSelect?: (school: SchoolWithIndex | null) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showChips: boolean;
  setShowChips: React.Dispatch<React.SetStateAction<boolean>>;
  schools: SchoolWithIndex[];
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  onClose, 
  selectedSchoolId = null, 
  onSchoolSelect = () => {},
  messages,
  setMessages,
  showChips,
  setShowChips,
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
          icon={<MessageCircle size={16} />}
          label="Chat"
          isActive={activeTab === 'chat'}
          onClick={() => onTabChange('chat')}
        />
        <TabButton
          icon={<Bot size={16} />}
          label="Agent"
          isActive={activeTab === 'agent'}
          onClick={() => onTabChange('agent')}
        />
      </div>

      {/* 3. TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24">
        {activeTab === 'stats' && <StatsTab schools={schools} />}
        {activeTab === 'list' && (
          <RankedTab
            selectedSchoolId={selectedSchoolId}
            onSchoolSelect={onSchoolSelect}
          />
        )}
        {activeTab === 'chat' && (
          <ChatUI
            messages={messages}
            setMessages={setMessages}
            showChips={showChips}
            setShowChips={setShowChips}
          />
        )}
        {activeTab === 'agent' && <AgentTab />}
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
