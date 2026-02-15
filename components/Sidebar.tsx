
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Plane, Trash2, Settings, Save, 
  History, X, ChevronRight, Play, Square, 
  Target, Zap, Wind, ShieldCheck,
  Wand2, Download, ExternalLink, Battery, Radio, Gauge, FileText, Check, LayoutDashboard, ChevronLeft, FastForward
} from 'lucide-react';
import { exportToGPX, exportToKML } from '../utils/exportUtils';
import { PreFlightChecklist as ChecklistType, SidebarTab, Coordinate } from '../types';

const PathThumbnail = ({ path }: { path: Coordinate[] }) => {
  if (path.length < 2) return <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Plane size={12} className="text-slate-600 opacity-20" /></div>;
  
  const lats = path.map(p => p.lat);
  const lngs = path.map(p => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const padding = 10;
  const width = 100;
  const height = 100;
  
  const normalize = (val: number, min: number, max: number, range: number) => {
    if (max === min) return range / 2;
    return padding + ((val - min) / (max - min)) * (range - 2 * padding);
  };

  const points = path.map(p => ({
    x: normalize(p.lng, minLng, maxLng, width),
    y: height - normalize(p.lat, minLat, maxLat, height)
  }));

  const pathStr = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full bg-slate-900/50">
      <path d={pathStr} fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[0].x} cy={points[0].y} r="6" fill="#10b981" />
      <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="6" fill="#ef4444" />
    </svg>
  );
};

const Sidebar: React.FC = () => {
  const { 
    droneSettings, updateSettings, clearPath, flightPath, 
    savedMissions, saveMission, loadMission, deleteMission,
    toggleUiElement, isSimulating, startSimulation,
    autoFixPath, checklist, toggleChecklistItem, riskLevel,
    sidebarTab, setSidebarTab, autoCheckChecklist
  } = useStore();

  const [missionName, setMissionName] = useState('');

  const handleSave = () => {
    if (flightPath.length === 0) return;
    saveMission(missionName);
    setMissionName('');
  };

  const checklistItems: { key: keyof ChecklistType; label: string; icon: React.ReactNode }[] = [
    { key: 'batteryChecked', label: 'Cell Voltage Check', icon: <Battery size={14} /> },
    { key: 'propellersInspected', label: 'Propeller Structural Check', icon: <Gauge size={14} /> },
    { key: 'gpsLock', label: 'GNSS Satellite Lock', icon: <Radio size={14} /> },
    { key: 'regulatoryClearance', label: 'Digital Sky Permit', icon: <FileText size={14} /> },
    { key: 'firmwareValidated', label: 'System Firmware Check', icon: <ShieldCheck size={14} /> },
  ];

  const allChecked = Object.values(checklist).every(v => v);

  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col z-[1000] text-slate-200 overflow-hidden">
      <div className="p-6 pb-4 bg-slate-800/40 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1 group">
            <div className="w-8 h-8 rounded bg-aviation-orange flex items-center justify-center transition-transform group-hover:rotate-12">
                <Plane className="text-white transform -rotate-45" size={18} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">AirGuard</h1>
          </div>
          <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Tactical Operations Hub</p>
        </div>
        <button 
          onClick={() => toggleUiElement('settings')}
          className="p-2.5 bg-slate-800 hover:bg-aviation-orange/20 rounded-xl text-slate-400 hover:text-aviation-orange transition-all border border-slate-700"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="px-6 flex border-b border-slate-800">
        {(['CONFIG', 'CHECKLIST', 'MISSIONS'] as SidebarTab[]).map(tab => (
           <button
             key={tab}
             onClick={() => setSidebarTab(tab)}
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
               sidebarTab === tab 
                ? 'border-aviation-orange text-aviation-orange' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
             }`}
           >
             {tab}
           </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {sidebarTab === 'CONFIG' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <LayoutDashboard size={12} className="text-blue-400" /> Aircraft Config
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Model Class</label>
                  <select 
                    value={droneSettings.model}
                    onChange={(e) => updateSettings({ model: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-aviation-orange"
                  >
                    <option value="Nano (<250g)">Nano (&lt;250g)</option>
                    <option value="Micro (>2kg)">Micro (&gt;2kg)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <label className="text-slate-400">Altitude (AGL)</label>
                    <span className={`font-mono ${droneSettings.altitude > 120 ? 'text-red-400 animate-pulse' : 'text-aviation-orange'}`}>{droneSettings.altitude}m</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="400" 
                    step="10"
                    value={droneSettings.altitude} 
                    onChange={(e) => updateSettings({ altitude: Number(e.target.value) })} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-aviation-orange" 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Wand2 size={12} className="text-emerald-400" /> Mission Control
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={clearPath} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 transition-all">
                  <Trash2 size={14} /> Reset
                </button>
                <button onClick={() => setSidebarTab('MISSIONS')} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 transition-all">
                  <Save size={14} /> Save
                </button>
              </div>

              {!isSimulating && (
                <button onClick={startSimulation} className={`w-full py-4 rounded-xl font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-3 ${allChecked && flightPath.length > 1 ? 'bg-aviation-orange text-white shadow-xl' : 'bg-slate-800 text-slate-300 hover:text-aviation-orange border border-slate-700 transition-colors'}`}>
                  {allChecked ? <Play size={14} fill="currentColor" /> : <ShieldCheck size={14} />}
                  {allChecked ? 'Execute Simulation' : 'Complete Checklist'}
                </button>
              )}
            </section>
          </div>
        )}

        {sidebarTab === 'CHECKLIST' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center px-1">
              <button onClick={() => setSidebarTab('CONFIG')} className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                <ChevronLeft size={14} /> Return to Config
              </button>
              <button onClick={autoCheckChecklist} className="flex items-center gap-1.5 px-3 py-1 bg-aviation-orange/10 border border-aviation-orange/30 rounded-lg text-[9px] font-black uppercase text-aviation-orange hover:bg-aviation-orange hover:text-white transition-all">
                <FastForward size={12} /> Master Override
              </button>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-3">
              {checklistItems.map(item => (
                <button key={item.key} onClick={() => toggleChecklistItem(item.key)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${checklist[item.key] ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${checklist[item.key] ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>{item.icon}</div>
                    <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${checklist[item.key] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>{checklist[item.key] && <Check size={10} className="text-white" />}</div>
                </button>
              ))}
            </div>
            {allChecked && (
               <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-500">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  <div><h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Flight Status: Ready</h4><p className="text-[9px] text-emerald-400/60 font-mono">ALL_SYSTEMS_OPTIMAL</p></div>
               </div>
            )}
            <button onClick={startSimulation} disabled={!allChecked} className={`w-full py-4 rounded-xl font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-3 ${allChecked ? 'bg-aviation-orange text-white shadow-xl' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}>
              <Play size={14} fill="currentColor" /> Engage Simulation
            </button>
          </div>
        )}

        {sidebarTab === 'MISSIONS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-3">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capture Mission</label>
               <div className="flex gap-2">
                 <input type="text" placeholder="CODE_NAME" value={missionName} onChange={(e) => setMissionName(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 focus:border-aviation-orange outline-none" />
                 <button onClick={handleSave} disabled={flightPath.length === 0} className="px-4 bg-aviation-orange hover:bg-orange-600 rounded-xl text-white transition-all disabled:opacity-30"><Save size={16} /></button>
               </div>
            </section>
            <section className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><History size={12} /> Black Box Analytics</h3>
              <div className="space-y-3">
                {savedMissions.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl"><p className="text-[10px] text-slate-600 font-mono italic">No flights logged yet</p></div>
                ) : (
                  savedMissions.map(m => (
                    <div key={m.id} className="group bg-slate-950/50 border border-slate-800 rounded-xl p-3 hover:border-aviation-orange/40 transition-all flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0 bg-slate-900">
                        <PathThumbnail path={m.path} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-200 truncate">{m.name}</span>
                          <button onClick={() => deleteMission(m.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className={`${m.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>{m.riskScore}% RISK</span>
                          <button onClick={() => loadMission(m.id)} className="text-aviation-orange hover:text-white flex items-center gap-1 font-black">Recall <ChevronRight size={12} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
