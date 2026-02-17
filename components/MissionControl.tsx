
import React, { useState, useEffect, useRef } from 'react';
import MapEngine from './MapEngine';
import Sidebar from './Sidebar';
import RiskMeter from './RiskMeter';
import AiAssistant from './AiAssistant';
import WeatherWidget from './WeatherWidget';
import SimulationEngine from './SimulationEngine';
import PlaybackControlHub from './PlaybackControlHub';
import { useStore } from '../store';
import { 
  Hand, Navigation, Search, Undo2, Eye, EyeOff, LayoutGrid, Ghost, 
  Wind, Loader2, Cpu, ChevronRight, ChevronLeft, Shield, 
  Settings2, MoreVertical, Layers, Keyboard, Command, Monitor, Zap
} from 'lucide-react';

const MissionControl: React.FC = () => {
  const { 
    uiVisible, 
    uiElements, 
    mapMode, 
    setMapMode, 
    flightPath, 
    removeLastPoint,
    isSimulating,
    isInteracting,
    toggleZenMode,
    toggleUiElement,
    setMapCenter,
    startSimulation,
    stopSimulation,
    clearPath
  } = useStore();

  const [ghostMode, setGhostMode] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsControlMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Command Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        removeLastPoint();
        triggerGhost('UNDO');
      } else if (e.key.toLowerCase() === 'd') {
        setMapMode('DRAW');
      } else if (e.key.toLowerCase() === 'h') {
        setMapMode('PAN');
      } else if (e.key.toLowerCase() === 's') {
        setMapMode('SEARCH');
      } else if (e.key.toLowerCase() === 'z') {
        toggleZenMode();
        triggerGhost('ZEN');
      } else if (e.key.toLowerCase() === 'm') {
        toggleUiElement('sidebar');
      } else if (e.key.toLowerCase() === 'w') {
        toggleUiElement('weatherWidget');
      } else if (e.key.toLowerCase() === 'a') {
        toggleUiElement('aiAssistant');
      } else if (e.key.toLowerCase() === 'r') {
        toggleUiElement('riskMeter');
      } else if (e.key === ' ') {
        e.preventDefault();
        if (isSimulating) stopSimulation();
        else if (flightPath.length >= 2) startSimulation();
      } else if (e.key === 'Escape') {
        setIsControlMenuOpen(false);
        if (mapMode !== 'PAN') setMapMode('PAN');
      } else if (e.key.toLowerCase() === 'c' && e.shiftKey) {
        clearPath();
        triggerGhost('CLEARED');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removeLastPoint, setMapMode, toggleZenMode, toggleUiElement, isSimulating, flightPath, startSimulation, stopSimulation, clearPath, mapMode]);

  const triggerGhost = (mode: string) => {
    setGhostMode(mode);
    setTimeout(() => setGhostMode(null), 600);
  };

  useEffect(() => {
    if (mapMode) triggerGhost(mapMode);
  }, [mapMode]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapMode('PAN'); 
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Desktop Only Guard */}
      {isMobile && (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-aviation-orange/10 rounded-3xl border border-aviation-orange/30 flex items-center justify-center mb-6">
            <Monitor className="text-aviation-orange" size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Desktop Environment Required</h2>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            AirGuard Mission Control requires a larger viewport and keyboard peripherals for high-precision tactical operations.
          </p>
          <button onClick={() => window.history.back()} className="mt-8 text-xs font-bold text-aviation-orange uppercase tracking-widest flex items-center gap-2">
            <ChevronLeft size={14} /> Return to Base
          </button>
        </div>
      )}

      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapEngine />
      </div>

      {/* Power Moves Shortcut Button */}
      <div 
        className="absolute top-4 right-[300px] z-[2000]"
        onMouseEnter={() => setShowShortcuts(true)}
        onMouseLeave={() => setShowShortcuts(false)}
      >
        <button className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/50 flex items-center justify-center text-slate-500 hover:text-aviation-orange hover:border-aviation-orange transition-all shadow-xl backdrop-blur-md">
          <Command size={18} />
        </button>
        
        {showShortcuts && (
          <div className="absolute top-12 right-0 w-56 bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap size={12} className="text-aviation-orange" />
              Power Moves
            </h4>
            <div className="space-y-2">
              {[
                { k: 'Space', v: 'Simulate/Stop' },
                { k: 'D', v: 'Draw Vector' },
                { k: 'H', v: 'Hand Pan' },
                { k: 'S', v: 'Global Search' },
                { k: 'Z', v: 'Zen Mode' },
                { k: 'Shift+C', v: 'Full Purge' },
                { k: 'Esc', v: 'Reset Hud' },
                { k: 'Ctrl+Z', v: 'Undo Point' }
              ].map(item => (
                <div key={item.k} className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">{item.v}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] font-mono border border-slate-800 text-aviation-orange">{item.k}</kbd>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(mapMode === 'DRAW' || mapMode === 'SEARCH') && !isSimulating && (
        <div className="absolute inset-0 z-[500] pointer-events-none flex items-center justify-center opacity-70">
          <div className="relative w-12 h-12 flex items-center justify-center">
             <div className="absolute inset-0 border border-aviation-orange/30 rounded-full scale-125 animate-pulse"></div>
             <div className="w-1.5 h-1.5 bg-aviation-orange rounded-full"></div>
             <div className="absolute top-0 w-[2px] h-4 bg-aviation-orange/50"></div>
             <div className="absolute bottom-0 w-[2px] h-4 bg-aviation-orange/50"></div>
             <div className="absolute left-0 w-4 h-[2px] bg-aviation-orange/50"></div>
             <div className="absolute right-0 w-4 h-[2px] bg-aviation-orange/50"></div>
          </div>
        </div>
      )}

      {isInteracting && !isSimulating && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900/90 border border-aviation-orange/30 px-5 py-2 rounded-full flex items-center gap-3 shadow-xl backdrop-blur-md">
             <Cpu size={14} className="text-aviation-orange animate-spin-slow" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-aviation-orange">Busy...</span>
          </div>
        </div>
      )}

      {ghostMode && (
        <div className="absolute inset-0 z-[5000] flex items-center justify-center pointer-events-none">
          <div className="animate-ghost-flash flex flex-col items-center gap-4 text-white">
            <span className="text-6xl font-black italic uppercase text-aviation-orange/60">{ghostMode}</span>
          </div>
        </div>
      )}

      <SimulationEngine />

      <div className={`transition-opacity duration-500 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
        {uiElements.sidebar && <Sidebar />}
        
        <div 
          ref={menuRef}
          className={`absolute top-4 transition-all duration-300 z-[2000] ${uiElements.sidebar ? 'left-[304px]' : 'left-4'}`}
        >
          <div className="relative">
            <button 
              onClick={() => setIsControlMenuOpen(!isControlMenuOpen)}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all shadow-2xl backdrop-blur-xl ${
                isControlMenuOpen 
                ? 'bg-aviation-orange border-aviation-orange text-white' 
                : 'bg-slate-900/90 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
              title="Interface Controls (Esc)"
            >
              <Layers size={22} className={isControlMenuOpen ? 'animate-pulse' : ''} />
            </button>

            {isControlMenuOpen && (
              <div className="absolute top-14 left-0 w-52 bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl p-2 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-slate-800 mb-1 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HUD Config</span>
                  <Keyboard size={12} className="text-slate-600" />
                </div>

                <button 
                  onClick={() => { toggleZenMode(); setIsControlMenuOpen(false); }}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all ${uiElements.isZenMode ? 'bg-aviation-orange/20 text-aviation-orange' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    {uiElements.isZenMode ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="text-xs font-bold uppercase tracking-tight">Zen Mode</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] border border-slate-700">Z</kbd>
                </button>

                <button 
                  onClick={() => toggleUiElement('sidebar')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all ${uiElements.sidebar ? 'text-white bg-slate-800' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">Main Menu</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] border border-slate-700">M</kbd>
                </button>

                <button 
                  onClick={() => toggleUiElement('weatherWidget')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all ${uiElements.weatherWidget ? 'text-blue-400 bg-blue-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <Wind size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">Weather</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] border border-slate-700">W</kbd>
                </button>

                <button 
                  onClick={() => toggleUiElement('aiAssistant')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all ${uiElements.aiAssistant ? 'text-aviation-orange bg-aviation-orange/10' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <Ghost size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">AI Advisor</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] border border-slate-700">A</kbd>
                </button>

                <button 
                  onClick={() => toggleUiElement('riskMeter')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all ${uiElements.riskMeter ? 'text-red-400 bg-red-500/10' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">Risk Hub</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] border border-slate-700">R</kbd>
                </button>
              </div>
            )}
          </div>
        </div>

        {uiElements.riskMeter && (
          <>
            <RiskMeter />
            {isSimulating && <PlaybackControlHub />}
          </>
        )}
        {uiElements.weatherWidget && <WeatherWidget />}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-4 w-full max-w-lg px-6">
        {mapMode === 'SEARCH' && (
          <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
             <div className="relative w-full">
                <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Find a tactical location..."
                  className="w-full h-14 bg-slate-900/90 backdrop-blur-md border border-aviation-orange rounded-2xl px-6 pr-16 text-sm text-white focus:outline-none shadow-2xl"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-all"
                >
                  {isSearching ? <Loader2 size={18} className="text-aviation-orange animate-spin" /> : <Search size={18} className="text-slate-400" />}
                </button>
             </div>
          </div>
        )}

        <div className="flex items-center bg-slate-900/95 border border-slate-800/60 p-1.5 rounded-2xl shadow-2xl gap-1 backdrop-blur-xl">
          <div className="flex px-2 gap-1">
            <button onClick={() => setMapMode('PAN')} title="Pan (H)" className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${mapMode === 'PAN' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Hand size={20} /></button>
            <button onClick={() => setMapMode('DRAW')} title="Draw (D)" className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${mapMode === 'DRAW' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`} disabled={isSimulating}><Navigation size={18} className="rotate-[30deg]" /></button>
            <button onClick={() => setMapMode('SEARCH')} title="Search (S)" className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${mapMode === 'SEARCH' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Search size={18} /></button>
          </div>
          {flightPath.length > 0 && !isSimulating && (
            <div className="flex items-center">
              <div className="w-[1px] h-6 bg-slate-800 mx-1"></div>
              <button onClick={removeLastPoint} title="Undo (Ctrl+Z)" className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"><Undo2 size={18} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-[2000]">
         {uiElements.aiAssistant && <AiAssistant />}
      </div>
    </div>
  );
};

export default MissionControl;
