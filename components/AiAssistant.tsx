
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, Bot, FileText, Loader2, Activity, ShieldAlert, Zap } from 'lucide-react';
import { useStore } from '../store';
import { getCaptainCritique } from '../services/geminiService';
import * as turf from '@turf/turf';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: 'init',
    sender: 'ai',
    text: "Captain Arjun here. I'm monitoring your vectors. If you plan to breach restricted airspace, expect a reprimand. Awaiting your flight plan."
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAutoTriggeredRisk, setLastAutoTriggeredRisk] = useState(0);
  
  const { riskLevel, violations, droneSettings, weather, flightPath, telemetry, userApiKey } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // AUTO-TRIGGER LOGIC: Force deployment if risk level spikes above 50%
  useEffect(() => {
    if (riskLevel > 50 && riskLevel > lastAutoTriggeredRisk + 10) {
        if (!isOpen) setIsOpen(true);
        handleSend("EMERGENCY_BRIEF: System risk assessment indicates unsafe flight parameters. Provide immediate safety critique.");
        setLastAutoTriggeredRisk(riskLevel);
    } else if (riskLevel < 30) {
        setLastAutoTriggeredRisk(0);
    }
  }, [riskLevel]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInput('');
    setIsLoading(true);

    let flightStats;
    try {
        if (flightPath.length >= 2) {
            const line = turf.lineString(flightPath.map(p => [p.lng, p.lat]));
            flightStats = { 
                distance: parseFloat(turf.length(line, { units: 'kilometers' }).toFixed(2)), 
                waypoints: flightPath.length 
            };
        }
    } catch (e) {}

    const aiResponseText = await getCaptainCritique(
      textToSend,
      riskLevel,
      violations,
      droneSettings,
      weather,
      flightStats,
      telemetry,
      flightPath,
      userApiKey
    );

    const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end">
      
      {/* Chat HUD */}
      {isOpen && (
        <div className="mb-4 w-[400px] h-[550px] bg-slate-900/98 backdrop-blur-2xl border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-5 bg-slate-800/60 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-aviation-orange/50 p-1">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    <Bot size={28} className="text-aviation-orange" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-slate-100 italic tracking-tight uppercase">Captain Arjun</h3>
                <p className="text-[9px] text-aviation-orange font-mono font-bold tracking-[0.2em]">TACTICAL SAFETY OFFICER</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Quick Actions HUD */}
          <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700 flex gap-2 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => handleSend("Request full mission briefing.")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-all whitespace-nowrap"
            >
                <FileText size={12} className="text-aviation-orange" /> BRIEFING
            </button>
            <button 
                onClick={() => handleSend("Analyze current violations and Rule citations.")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-all whitespace-nowrap"
            >
                <ShieldAlert size={12} className="text-red-400" /> VIOLATIONS
            </button>
            <button 
                onClick={() => handleSend("Current battery and telemetry health check.")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-all whitespace-nowrap"
            >
                <Zap size={12} className="text-yellow-400" /> HEALTH
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-950/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-aviation-orange text-white rounded-br-none shadow-xl' 
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-none font-mono text-[13px]'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex gap-3 items-center">
                  <Loader2 size={16} className="animate-spin text-aviation-orange" />
                  <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Consulting DGCA Registry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Console */}
          <div className="p-5 bg-slate-800/40 border-t border-slate-700 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query safety protocol..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-aviation-orange outline-none transition-all placeholder:text-slate-600 font-mono"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-3.5 bg-aviation-orange text-white rounded-xl hover:bg-orange-600 disabled:opacity-30 transition-all shadow-lg shadow-orange-950/40"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`group flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white p-5 rounded-2xl shadow-2xl border-2 transition-all hover:scale-105 active:scale-95 ${
            riskLevel > 50 ? 'border-red-500 animate-pulse' : 'border-aviation-orange'
          }`}
        >
          <div className="relative">
             <MessageSquare size={28} />
             {riskLevel > 50 && (
                 <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
                 </span>
             )}
          </div>
          <span className="font-black text-sm tracking-widest uppercase italic pr-2">Command Link</span>
        </button>
      )}
    </div>
  );
};

export default AiAssistant;
