
import React from 'react';
import { useStore } from '../store';
import { Play, Square, Crosshair, Wind, ShieldCheck, Zap, Gauge } from 'lucide-react';

const PlaybackControlHub: React.FC = () => {
  const { 
    isSimulating, 
    stopSimulation, 
    simSpeedMultiplier, 
    setSimSpeedMultiplier,
    activeScenario,
    applyScenario,
    simFollowMode,
    toggleFollowMode
  } = useStore();

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-3 animate-in slide-in-from-top-4 duration-500">
      
      {/* Dynamic Scenario Badge */}
      <div className="flex gap-2">
        {activeScenario === 'HEAVY_WEATHER' && (
          <div className="px-4 py-1.5 bg-blue-600 border-2 border-blue-400 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-in zoom-in-50">
            <Wind size={14} className="text-white animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Heavy Wind Simulation</span>
          </div>
        )}
        {activeScenario === 'EMERGENCY_LANDING' && (
          <div className="px-4 py-1.5 bg-red-600 border-2 border-red-400 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse">
            <Zap size={14} className="text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Emergency Landing Sequence</span>
          </div>
        )}
        {activeScenario === 'STANDARD' && (
          <div className="px-4 py-1.5 bg-emerald-600/90 border-2 border-emerald-400/50 rounded-full flex items-center gap-2">
            <ShieldCheck size={14} className="text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Standard Recon</span>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-700 px-5 py-4 rounded-3xl flex items-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
        
        {/* Play/Stop Toggle */}
        <button 
          onClick={stopSimulation}
          className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500"
        >
          <Square size={20} fill="currentColor" />
        </button>

        <div className="w-[1px] h-8 bg-slate-800"></div>

        {/* Integrated Scenario Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Protocol</label>
          <select 
            value={activeScenario}
            onChange={(e) => applyScenario(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-[11px] font-black text-slate-200 px-3 py-1.5 rounded-lg outline-none cursor-pointer uppercase tracking-tighter"
          >
            <option value="STANDARD">Standard Ops</option>
            <option value="HEAVY_WEATHER">High Wind Ops</option>
            <option value="EMERGENCY_LANDING">System Failure</option>
          </select>
        </div>

        <div className="w-[1px] h-8 bg-slate-800"></div>

        {/* Warp Speed Multiplier */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Warp</span>
             <span className="text-[11px] font-black text-aviation-orange font-mono">{simSpeedMultiplier}x</span>
          </div>
          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[1, 2, 5].map(speed => (
              <button
                key={speed}
                onClick={() => setSimSpeedMultiplier(speed)}
                className={`w-8 py-1 rounded text-[10px] font-black transition-all ${
                  simSpeedMultiplier === speed ? 'bg-aviation-orange text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="w-[1px] h-8 bg-slate-800"></div>

        {/* Precision Follow Mode Toggle */}
        <button 
          onClick={toggleFollowMode}
          title="Toggle Track Cam"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            simFollowMode 
              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]' 
              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          <Crosshair size={22} className={simFollowMode ? "animate-pulse" : ""} />
        </button>
      </div>
    </div>
  );
};

export default PlaybackControlHub;
