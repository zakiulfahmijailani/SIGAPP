"use client";

import { useState, useRef, useMemo, Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { FilterBar } from "@/components/ui/FilterBar";
import ChatWidget, { ChatState, Message } from "@/components/chat/ChatWidget";
import { useSekolahNTT } from "@/hooks/useSekolahNTT";
import { getTierFromIndex } from "@/lib/utils";
import dynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';
import { useSearchParams, useRouter } from 'next/navigation';
import { SchoolWithIndex } from "@/lib/types";
import { AgentStatusBar } from "@/components/ui/AgentStatusBar";

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

function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats'|'list'|'chat'>(
    (searchParams.get('tab') as 'stats'|'list'|'chat') || 'stats'
  );
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    searchParams.get('school')
  );
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
  const [kotaFilter, setKotaFilter] = useState(searchParams.get('kota') || 'all');
  const [jenjangFilter, setJenjangFilter] = useState(searchParams.get('jenjang') || 'all');
  const [prioritasFilter, setPrioritasFilter] = useState(searchParams.get('prioritas') || 'all');

  const { schools } = useSekolahNTT();
  const mapRef = useRef<LeafletMap | null>(null);

  const filteredSchools = useMemo(() => 
    schools.filter(s => {
      const sKota = s.kota;
      
      return (
        (kotaFilter === 'all' || sKota === kotaFilter) &&
        (jenjangFilter === 'all' || s.jenjang === jenjangFilter) &&
        (prioritasFilter === 'all' || getTierFromIndex(s.school_index?.sigapp_index || 0) === prioritasFilter)
      );
    }),
    [schools, kotaFilter, jenjangFilter, prioritasFilter]
  );

  function updateURL(overrides: {
    school?: string | null;
    q?: string;
    kota?: string;
    jenjang?: string;
    prioritas?: string;
    tab?: string;
  }) {
    const params = new URLSearchParams(window.location.search);
    const school = 'school' in overrides ? overrides.school : selectedSchoolId;
    const kota = overrides.kota ?? kotaFilter;
    const jenjang = overrides.jenjang ?? jenjangFilter;
    const prioritas = overrides.prioritas ?? prioritasFilter;
    const tab = overrides.tab ?? activeTab;

    if (school) params.set('school', school);
    else params.delete('school');

    if (kota !== 'all') params.set('kota', kota);
    else params.delete('kota');

    if (jenjang !== 'all') params.set('jenjang', jenjang);
    else params.delete('jenjang');

    if (prioritas !== 'all') params.set('prioritas', prioritas);
    else params.delete('prioritas');

    if (tab !== 'stats') params.set('tab', tab);
    else params.delete('tab');

    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/', { scroll: false });
  }

  const handleSchoolSelect = (school: SchoolWithIndex | null) => {
    const newId = school?.id || null;
    setSelectedSchoolId(newId);
    if (school) {
      setActiveTab('list');
      setSidebarOpen(true);
      updateURL({ school: newId, tab: 'list' });
      
      // Fly map to selected school
      if (mapRef.current && school.latitude && school.longitude) {
        mapRef.current.flyTo(
          [school.latitude, school.longitude],
          15,
          { duration: 1.2, easeLinearity: 0.25 }
        );
      }
    } else {
      updateURL({ school: null });
    }
  };

  const handleMapDotClick = (school: SchoolWithIndex) => {
    handleSchoolSelect(school);
  };

  function changeTab(tab: 'stats'|'list'|'chat') {
    setActiveTab(tab);
    updateURL({ tab });
  }

  const handleChatStateChange = (state: ChatState) => {
    setChatState(state);
    if (state === 'docked') {
      changeTab('chat');
      setSidebarOpen(true);
    }
    if (state === 'expanded' && chatState === 'docked') {
      changeTab('stats');
    }
  };

  const today = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });

  return (
    <>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50">

      {/* 0. AGENT STATUS BAR */}
      <AgentStatusBar />

      {/* 1. NAVBAR */}
      <nav className="h-16 bg-white flex-shrink-0 flex items-center justify-between px-6 z-50 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <img src="/logo-light-mode-with-texts.png" alt="SIGAPP Logo" className="h-12 w-auto object-contain" />
            <div className="h-10 w-px bg-gray-200 ml-1 hidden sm:block"></div>
            <span className="text-[#0D2137]/40 text-[10px] uppercase tracking-widest font-bold hidden sm:block">NTT Dashboard</span>
          </div>

          <div className="flex items-center gap-8">
            <Link href="/schools" className="text-[#0D2137]/60 hover:text-[#00B4B4] text-xs uppercase tracking-widest font-bold transition-colors">Schools</Link>
            <Link href="/insights" className="text-[#0D2137]/60 hover:text-[#00B4B4] text-xs uppercase tracking-widest font-bold transition-colors">Insights</Link>
            <Link href="/about" className="text-[#0D2137]/60 hover:text-[#00B4B4] text-xs uppercase tracking-widest font-bold transition-colors">About</Link>
          </div>
        </div>
        
        <div className="text-[#0D2137]/60 text-xs font-bold uppercase tracking-wide">
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
            onKotaChange={(val) => { setKotaFilter(val); updateURL({ kota: val }); }}
            onJenjangChange={(val) => { setJenjangFilter(val); updateURL({ jenjang: val }); }}
            onPrioritasChange={(val) => { setPrioritasFilter(val); updateURL({ prioritas: val }); }}
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
            onTabChange={changeTab}
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

export default function DashboardRoot() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}
