
import React, { useState, useEffect, useRef } from 'react';
import MapEngine from './MapEngine';
import Sidebar from './Sidebar';
import RiskMeter from './RiskMeter';
import AiAssistant from './AiAssistant';
import WeatherWidget from './WeatherWidget';
import SettingsOverlay from './SettingsOverlay';
import SimulationEngine from './SimulationEngine';
import PlaybackControlHub from './PlaybackControlHub';
import { useStore } from '../store';
import { Hand, Navigation, Search, Undo2 } from 'lucide-react';

const MissionControl: React.FC = () => {
  const { 
    uiVisible, 
    uiElements, 
    mapMode, 
    setMapMode, 
    flightPath, 
    removeLastPoint,
    isSimulating,
    isFixingPath,
    isInteracting
  } = useStore();

  const [ghostMode, setGhostMode] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGhostMode(mapMode);
    const timer = setTimeout(() => setGhostMode(null), 600);
    return () => clearTimeout(timer);
  }, [mapMode]);

  useEffect(() => {
    if (mapMode === 'SEARCH') {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [mapMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="absolute inset-0 z-0">
        <MapEngine />
      </div>

      {/* ULTRA-MINIMAL CROSSHAIR (Matching Reference Image) */}
      {(mapMode === 'DRAW' || mapMode === 'SEARCH') && !isSimulating && (
        <div className="absolute inset-0 z-[500] pointer-events-none flex items-center justify-center opacity-90">
          <div className="relative w-5 h-5 flex items-center justify-center">
             <div className="w-2 h-2 border-[1px] border-aviation-orange rounded-full"></div>
             <div className="absolute top-0 w-1 h-[1px] bg-aviation-orange"></div>
             <div className="absolute bottom-0 w-1 h-[1px] bg-aviation-orange"></div>
             <div className="absolute left-0 w-[1px] h-1 bg-aviation-orange"></div>
             <div className="absolute right-0 w-[1px] h-1 bg-aviation-orange"></div>
          </div>
        </div>
      )}

      {/* INTERACTIVE MODE INDICATOR (Shows ONLY when moving map/drawing) */}
      {isInteracting && !isSimulating && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900/95 border border-aviation-orange/50 px-5 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(249,115,22,0.3)] backdrop-blur-md">
             <div className="w-5 h-5 flex items-center justify-center">
                <div className="absolute inset-0 border border-aviation-orange/20 rounded-full animate-ping"></div>
                {mapMode === 'PAN' && <Hand size={13} className="text-aviation-orange" />}
                {mapMode === 'DRAW' && <Navigation size={13} className="text-aviation-orange rotate-[30deg]" />}
                {mapMode === 'SEARCH' && <Search size={13} className="text-aviation-orange" />}
             </div>
             <span className="text-[10px] font-black uppercase italic tracking-[0.25em] text-aviation-orange">
                {mapMode === 'PAN' ? 'Panning' : mapMode === 'DRAW' ? 'Targeting' : 'Locating'}
             </span>
          </div>
        </div>
      )}

      {ghostMode && (
        <div className="absolute inset-0 z-[5000] flex items-center justify-center pointer-events-none">
          <div className="animate-ghost-flash flex flex-col items-center gap-4 text-white">
            {ghostMode === 'PAN' && <Hand size={100} strokeWidth={1} />}
            {ghostMode === 'DRAW' && <Navigation size={100} strokeWidth={1} className="rotate-[30deg]" />}
            {ghostMode === 'SEARCH' && <Search size={100} strokeWidth={1} />}
            <span className="text-3xl font-black italic tracking-tighter uppercase">{ghostMode}</span>
          </div>
        </div>
      )}

      {isFixingPath && (
        <div className="absolute inset-0 z-[4000] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-laser-sweep"></div>
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
        </div>
      )}

      <SettingsOverlay />
      <SimulationEngine />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-4 w-full max-w-lg px-6">
        {mapMode === 'SEARCH' && (
          <div className="w-full flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
             <div className="relative w-full">
                <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search location (e.g. 'Cubbon Park')"
                  className="w-full h-14 bg-slate-900 border-2 border-aviation-orange rounded-full px-8 pr-16 text-sm text-white focus:outline-none shadow-2xl"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Search size={18} className="text-slate-400" />
                </div>
             </div>
             <button onClick={() => setMapMode('PAN')} className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest underline underline-offset-4 decoration-dotted">Cancel Search</button>
          </div>
        )}

        <div className="flex items-center bg-slate-900/95 border border-slate-800/40 p-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.7)] gap-1">
          <button onClick={() => setMapMode('PAN')} title="Panning Mode" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${mapMode === 'PAN' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}><Hand size={20} /></button>
          <button onClick={() => setMapMode('DRAW')} title="Vectoring Mode" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${mapMode === 'DRAW' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`} disabled={isSimulating}><Navigation size={18} className="rotate-[30deg]" /></button>
          <button onClick={() => setMapMode('SEARCH')} title="Search Mode" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${mapMode === 'SEARCH' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}><Search size={18} /></button>
          {flightPath.length > 0 && !isSimulating && (
            <div className="flex items-center">
              <div className="w-[1px] h-6 bg-slate-800 mx-1"></div>
              <button onClick={removeLastPoint} title="Undo Waypoint" className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"><Undo2 size={18} /></button>
            </div>
          )}
        </div>
      </div>

      <div className={`transition-opacity duration-500 ${uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {uiElements.sidebar && <Sidebar />}
        {uiElements.riskMeter && (
          <>
            <RiskMeter />
            {isSimulating && <PlaybackControlHub />}
          </>
        )}
        {uiElements.weatherWidget && <WeatherWidget />}
        {uiElements.aiAssistant && <AiAssistant />}
      </div>
      
      <div className="absolute top-4 right-[320px] z-[1000] hidden lg:block">
        <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-full text-[10px] font-mono text-slate-400 flex items-center gap-3 shadow-xl">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span>GNSS_LOCKED</span></div>
          <div className="w-[1px] h-3 bg-slate-700"></div>
          <div className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-aviation-orange animate-ping' : 'bg-blue-500'}`}></div><span>{isSimulating ? 'SIM_ACTIVE' : 'READY_STANDBY'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
