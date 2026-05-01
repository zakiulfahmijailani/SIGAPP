"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import type { Message } from "./ChatWidget";

interface ChatUIProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showChips: boolean;
  setShowChips: React.Dispatch<React.SetStateAction<boolean>>;
}

const FAQ = [
  {
    chips: "Apa itu SIGAPP Index?",
    answer: "SIGAPP Index adalah skor prioritas sekolah dari 0.0 hingga 1.0. Skor mendekati 1.0 berarti sekolah tersebut membutuhkan intervensi lebih mendesak. Dihitung dari 4 dimensi: Kualitas Pendidikan (P1), Kesenjangan Spasial (P2), Risiko Struktural (P3), dan Sinyal Publik (P4)."
  },
  {
    chips: "Bagaimana cara membaca peta ini?",
    answer: "Setiap titik mewakili satu sekolah. Warna menunjukkan kelas prioritas: 🔴 merah (sangat prioritas), 🟠 oranye (tinggi), 🟡 kuning (sedang), 🟢 hijau (rendah), ⚪ abu-abu (tidak prioritas). Klik titik manapun untuk melihat detail sekolah."
  }
];

const FALLBACK = "Maaf, saya belum bisa menjawab pertanyaan itu. Untuk info lebih lanjut, hubungi tim SIGAPP.";

export function ChatUI({ messages, setMessages, showChips, setShowChips }: ChatUIProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => { 
    scrollToBottom(); 
  }, [messages, isTyping]);

  // Get bot answer from FAQ or fallback
  const getBotAnswer = (text: string): string => {
    const match = FAQ.find(f =>
      text.toLowerCase().includes(f.chips.toLowerCase().slice(0, 10))
    );
    return match ? match.answer : FALLBACK;
  };

  // Send message handler
  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowChips(false);
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: getBotAnswer(text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-[#00B4B4] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }
            `}>
              {msg.text}
              <div className="text-[10px] mt-1 opacity-50">
                {msg.timestamp.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                      style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                      style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                      style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* FAQ chips — shown only before first user message */}
        {showChips && (
          <div className="flex flex-col gap-2 mt-2">
            {FAQ.map(f => (
              <button
                key={f.chips}
                onClick={() => handleSend(f.chips)}
                className="text-left text-xs border border-[#00B4B4] text-[#00B4B4] 
                           rounded-xl px-3 py-2 hover:bg-teal-50 transition-colors duration-150"
              >
                {f.chips}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
          placeholder="Ketik pertanyaan..."
          className="flex-1 text-sm border border-gray-200 rounded-xl 
                     px-3 py-2 outline-none focus:ring-1 focus:ring-[#00B4B4]
                     placeholder:text-gray-300"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     bg-[#00B4B4] text-white disabled:opacity-40
                     hover:bg-[#0D2137] transition-colors duration-150"
        >
          <SendHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
