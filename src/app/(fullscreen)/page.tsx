"use client";

import { useState, useRef, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { FilterBar } from "@/components/ui/FilterBar";
import ChatWidget, { ChatState, Message } from "@/components/chat/ChatWidget";
import { useSchools } from "@/hooks/useSchools";
import { getTierFromIndex } from "@/lib/utils";
import dynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';
import { SchoolWithIndex } from "@/lib/types";

const SchoolMap = dynamic(
  () => import('@/components/map/SchoolMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex w-full h-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#00B4B4] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat peta...</p>
        </div>
      </div>
    )
  }
);

export default function DashboardRoot() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats'|'list'|'chat'>('stats');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [chatState, setChatState] = useState<ChatState>('bubble');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', 
      text: "Halo! Saya asisten SIGAPP. Pilih pertanyaan di bawah atau ketik sendiri.", 
      timestamp: new Date() 
    }
  ]);
  const [showChips, setShowChips] = useState(true);

  // Filters
  const [kotaFilter, setKotaFilter] = useState('all');
  const [jenjangFilter, setJenjangFilter] = useState('all');
  const [prioritasFilter, setPrioritasFilter] = useState('all');

  const { schools } = useSchools();
  const mapRef = useRef<LeafletMap | null>(null);

  const filteredSchools = useMemo(() => 
    schools.filter(s => {
      const sKota = s.kota;
      
      return (
        (kotaFilter === 'all' || sKota === kotaFilter) &&
        (jenjangFilter === 'all' || s.jenjang === jenjangFilter) &&
        (prioritasFilter === 'all' || (s.school_index?.priority_tier || getTierFromIndex(s.school_index?.sigapp_index || 0)) === prioritasFilter)
      );
    }),
    [schools, kotaFilter, jenjangFilter, prioritasFilter]
  );

  const handleSchoolSelect = (school: SchoolWithIndex | null) => {
    setSelectedSchoolId(school?.id || null);
    if (school) {
      setActiveTab('list');
      setSidebarOpen(true);
      
      // Fly map to selected school
      if (mapRef.current && school.latitude && school.longitude) {
        mapRef.current.flyTo(
          [school.latitude, school.longitude],
          15,
          { duration: 1.2, easeLinearity: 0.25 }
        );
      }
    }
  };

  const handleMapDotClick = (school: SchoolWithIndex) => {
    setSelectedSchoolId(school.id);
    setActiveTab('list');
    setSidebarOpen(true);
  };

  const handleChatStateChange = (state: ChatState) => {
    setChatState(state);
    if (state === 'docked') {
      setActiveTab('chat');
      setSidebarOpen(true);
    }
    if (state === 'expanded' && chatState === 'docked') {
      setActiveTab('stats');
    }
  };

  const today = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });

  return (
    <>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50">
      {/* 1. NAVBAR */}
      <nav className="h-14 bg-[#0D2137] flex-shrink-0 flex items-center justify-between px-6 z-50 shadow-md">
        <div className="flex items-center gap-8">
          <div className="flex items-baseline gap-3">
            <span className="text-[#00B4B4] font-bold text-xl tracking-wide">SIGAPP</span>
            <span className="text-white/50 text-sm font-medium">Jakarta Dashboard</span>
          </div>

          <div className="flex items-center gap-6 border-l border-white/10 pl-8 ml-2">
            <Link href="/schools" className="text-white/60 hover:text-[#00B4B4] text-xs uppercase tracking-widest font-semibold transition-colors">Schools</Link>
            <Link href="/insights" className="text-white/60 hover:text-[#00B4B4] text-xs uppercase tracking-widest font-semibold transition-colors">Insights</Link>
            <Link href="/about" className="text-white/60 hover:text-[#00B4B4] text-xs uppercase tracking-widest font-semibold transition-colors">About</Link>
          </div>
        </div>
        
        <div className="text-white/80 text-sm font-medium">
          {today}
        </div>
      </nav>

      {/* 2. MAIN AREA */}
      <main className="flex flex-1 flex-row overflow-hidden relative">
        
        {/* 2a. MAP AREA */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center relative z-0">
          <FilterBar
            kotaFilter={kotaFilter}
            jenjangFilter={jenjangFilter}
            prioritasFilter={prioritasFilter}
            onKotaChange={setKotaFilter}
            onJenjangChange={setJenjangFilter}
            onPrioritasChange={setPrioritasFilter}
            totalVisible={filteredSchools.length}
            totalAll={schools.length}
          />
          <SchoolMap
            schools={filteredSchools}
            selectedSchoolId={selectedSchoolId}
            onSchoolClick={handleMapDotClick}
            onMapReady={(map) => { mapRef.current = map; }}
          />
        </div>

        {/* 2b. SIDEBAR */}
        <aside
          className={`
            bg-white border-l border-gray-200 shadow-xl z-40
            transition-transform duration-300 ease-in-out absolute top-0 right-0 bottom-0
            flex flex-col
          `}
          style={{ width: "320px", transform: sidebarOpen ? "translateX(0)" : "translateX(100%)" }}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={() => setSidebarOpen(false)}
            selectedSchoolId={selectedSchoolId}
            onSchoolSelect={handleSchoolSelect}
            chatState={chatState}
            messages={messages}
            setMessages={setMessages}
            showChips={showChips}
            setShowChips={setShowChips}
            onUndock={() => handleChatStateChange('expanded')}
            schools={schools}
          />
        </aside>

        {/* 3. SIDEBAR TOGGLE BUTTON (When closed) [←] */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 border-r-0 shadow-md p-2 rounded-l-md z-40 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Open sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        )}

      </main>
      </div>

      <ChatWidget 
        chatState={chatState} 
        onChatStateChange={handleChatStateChange}
        messages={messages}
        setMessages={setMessages}
        showChips={showChips}
        setShowChips={setShowChips}
      />
    </>
  );
}
