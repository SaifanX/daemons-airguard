
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { lineString, length } from '@turf/turf';
import { 
  Plane, Trash2, Settings as SettingsIcon, Save, 
  History, X, ChevronRight, Play, Square, 
  Target, Zap, Wind, ShieldCheck,
  Wand2, Download, ExternalLink, Battery, Radio, Gauge, FileText, Check, LayoutDashboard, ChevronLeft, FastForward, Key, Eye, EyeOff, Shield, CloudSun, Clock, Navigation2, FileJson, Map as MapIcon, Scale, AlertOctagon, Info, Trophy, FileType
} from 'lucide-react';
import { Coordinate, PreFlightChecklist as ChecklistType, SidebarTab } from '../types';
import { exportToGPX, exportToKML } from '../utils/exportUtils';

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
  const navigate = useNavigate();
  const { 
    droneSettings, updateSettings, clearPath, flightPath, 
    savedMissions, saveMission, loadMission, deleteMission,
    isSimulating, startSimulation,
    checklist, toggleChecklistItem, 
    sidebarTab, setSidebarTab, autoCheckChecklist,
    userApiKey, setApiKey, weatherApiKey, setWeatherApiKey,
    riskLevel, autoFixPath, violations, isFixingPath
  } = useStore();

  const [missionName, setMissionName] = useState('');
  const [saveStatus, setSaveStatus] = useState(false);

  const stats = useMemo(() => {
    if (flightPath.length < 2) return { distance: 0, eta: 0 };
    const line = lineString(flightPath.map(p => [p.lng, p.lat]));
    const dist = length(line, { units: 'kilometers' });
    const time = (dist / 40) * 60; 
    return { distance: dist.toFixed(2), eta: Math.ceil(time) };
  }, [flightPath]);

  const hasZoneViolation = useMemo(() => {
    return violations.some(v => v.includes('ZONE_INCURSION') || v.includes('ZONE_VIOLATION'));
  }, [violations]);

  const handleSave = () => {
    if (flightPath.length === 0) return;
    saveMission(missionName);
    setMissionName('');
  };

  const handleCommitSettings = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const checklistItems: { key: keyof ChecklistType; label: string; icon: React.ReactNode }[] = [
    { key: 'batteryChecked', label: 'Battery Checked', icon: <Battery size={14} /> },
    { key: 'propellersInspected', label: 'Propellers OK', icon: <Gauge size={14} /> },
    { key: 'gpsLock', label: 'GPS Signal Found', icon: <Radio size={14} /> },
    { key: 'permitChecked', label: 'Rules Checked', icon: <FileText size={14} /> },
    { key: 'softwareUpdated', label: 'Ready to Go', icon: <ShieldCheck size={14} /> },
  ];

  const allChecked = Object.values(checklist).every(v => v);

  return (
    <div className="absolute top-4 left-4 bottom-4 w-72 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col z-[1000] text-slate-200 overflow-hidden">
      <div className="p-5 pb-3 bg-slate-800/40 flex justify-between items-center">
        <div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded bg-aviation-orange flex items-center justify-center">
                <Plane className="text-white transform -rotate-45" size={16} />
            </div>
            <h1 className="text-lg font-black italic tracking-tighter uppercase">AirGuard</h1>
          </button>
          <p className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">TechnoFest 2026</p>
        </div>
        <button 
          onClick={() => setSidebarTab('SETTINGS')}
          className={`p-2 rounded-xl border transition-all ${sidebarTab === 'SETTINGS' ? 'bg-aviation-orange/20 border-aviation-orange text-aviation-orange' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
        >
          <SettingsIcon size={16} />
        </button>
      </div>

      <div className="px-4 flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
        {(['SETUP', 'CHECKLIST', 'SAVED', 'SAFETY', 'SETTINGS'] as SidebarTab[]).map(tab => (
           <button
             key={tab}
             onClick={() => setSidebarTab(tab)}
             className={`flex-shrink-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === tab ? 'border-aviation-orange text-aviation-orange' : 'border-transparent text-slate-500'}`}
           >
             {tab === 'SAVED' ? 'Routes' : tab === 'SAFETY' ? 'Safety' : tab}
           </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {sidebarTab === 'SETUP' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-4">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Flight Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <p className="text-[7px] text-slate-500 uppercase font-black mb-1">Distance</p>
                  <span className="text-base font-mono font-bold text-white">{stats.distance} km</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <p className="text-[7px] text-slate-500 uppercase font-black mb-1">Time</p>
                  <span className="text-base font-mono font-bold text-white">{stats.eta} min</span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Drone Options</h3>
              <div className="space-y-4">
                <select 
                  value={droneSettings.model}
                  onChange={(e) => updateSettings({ model: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-aviation-orange"
                >
                  <option value="Nano (<250g)">Mini Drone</option>
                  <option value="Micro (>2kg)">Heavy Drone</option>
                </select>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-bold uppercase">
                    <label className="text-slate-400">Flight Height</label>
                    <span className="text-aviation-orange">{droneSettings.altitude}m</span>
                  </div>
                  <input 
                    type="range" min="10" max="150" step="10"
                    value={droneSettings.altitude} 
                    onChange={(e) => updateSettings({ altitude: Number(e.target.value) })} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-aviation-orange" 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-4">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mission Controls</h3>
              <button onClick={clearPath} className="w-full py-2.5 bg-slate-800 hover:bg-red-500/10 rounded-xl text-xs font-bold text-slate-500 hover:text-red-400 border border-slate-700 transition-all flex items-center justify-center gap-2">
                <Trash2 size={14} />
                Clear Route (Shift+C)
              </button>
              {!isSimulating && (
                <div className="space-y-2">
                  <button onClick={startSimulation} className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-widest transition-all ${allChecked && flightPath.length > 1 ? 'bg-aviation-orange text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {allChecked ? 'Test Flight (Space)' : 'Checklist First'}
                  </button>
                  {hasZoneViolation && !isSimulating && (
                    <button 
                      onClick={autoFixPath}
                      disabled={isFixingPath}
                      className="w-full py-3 bg-slate-900 border border-aviation-orange/40 hover:border-aviation-orange rounded-xl text-[10px] font-bold text-aviation-orange uppercase tracking-widest flex items-center justify-center gap-2 transition-all group overflow-hidden relative"
                    >
                      {isFixingPath ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-aviation-orange border-t-transparent rounded-full animate-spin"></div>
                          <span>Computing...</span>
                        </div>
                      ) : (
                        <>
                          <Wand2 size={14} className="group-hover:animate-pulse" />
                          <span>AI Tactical Reroute</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </section>

            {flightPath.length > 1 && (
              <section className="space-y-3">
                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tactical Export</h3>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => exportToGPX(flightPath, droneSettings)}
                     className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                   >
                     <Download size={14} className="text-blue-400" />
                     <span className="text-[8px] font-black uppercase text-slate-500">GPX</span>
                   </button>
                   <button 
                     onClick={() => exportToKML(flightPath, droneSettings)}
                     className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                   >
                     <Download size={14} className="text-emerald-400" />
                     <span className="text-[8px] font-black uppercase text-slate-500">KML</span>
                   </button>
                </div>
              </section>
            )}
          </div>
        )}

        {sidebarTab === 'SAVED' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Store Route</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="Route Name" value={missionName} onChange={(e) => setMissionName(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-aviation-orange" />
                <button onClick={handleSave} className="px-3 bg-aviation-orange rounded-xl text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-950/20"><Save size={14} /></button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Saved Missions</h3>
              {savedMissions.length === 0 ? (
                <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                  <FileType size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-tight">No stored vectors</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedMissions.map(m => (
                    <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex gap-3 group">
                      <div className="w-12 h-12 rounded bg-slate-900 overflow-hidden"><PathThumbnail path={m.path} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-slate-200 truncate pr-2 uppercase">{m.name}</span>
                          <button onClick={() => deleteMission(m.id)} className="text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <button onClick={() => loadMission(m.id)} className="text-[9px] text-aviation-orange font-black hover:text-white transition-colors uppercase tracking-widest">Load</button>
                          <div className="w-[1px] h-2 bg-slate-800"></div>
                          <button onClick={() => exportToGPX(m.path, m.settings)} className="text-[9px] text-slate-500 hover:text-blue-400 font-black transition-colors uppercase">GPX</button>
                          <button onClick={() => exportToKML(m.path, m.settings)} className="text-[9px] text-slate-500 hover:text-emerald-400 font-black transition-colors uppercase">KML</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {sidebarTab === 'SAFETY' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Safety Rules</h3>
            {violations.length === 0 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                <ShieldCheck size={28} className="text-emerald-400" />
                <p className="text-xs font-bold text-emerald-400">ALL SYSTEMS GO</p>
                <p className="text-[9px] text-slate-400">Your current flight vector complies with all regulatory restrictions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold text-red-400 uppercase">Mission Restricted</p>
                  <p className="text-[8px] text-slate-400 mt-1">{violations.length} critical alerts detected in path.</p>
                </div>
                {violations.map((v, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-3">
                    <AlertOctagon size={14} className="text-red-500 shrink-0" />
                    <p className="text-[9px] text-slate-400 italic leading-relaxed">{v}</p>
                  </div>
                ))}
                <button onClick={autoFixPath} className="w-full py-3 bg-aviation-orange rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-950/20">Auto-Reroute Vector</button>
              </div>
            )}
          </div>
        )}

        {sidebarTab === 'CHECKLIST' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pre-Flight Audit</h3>
              <button onClick={autoCheckChecklist} className="text-[8px] font-bold text-aviation-orange uppercase border border-aviation-orange/30 px-2 py-0.5 rounded-full hover:bg-aviation-orange hover:text-white transition-all">Quick Pass</button>
            </div>
            <div className="space-y-2">
              {checklistItems.map(item => (
                <button key={item.key} onClick={() => toggleChecklistItem(item.key)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${checklist[item.key] ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${checklist[item.key] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>{checklist[item.key] && <Check size={10} className="text-white" />}</div>
                </button>
              ))}
            </div>
            {allChecked && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                 <p className="text-[10px] font-black text-emerald-400 uppercase">Protocol Complete</p>
              </div>
            )}
          </div>
        )}

        {sidebarTab === 'SETTINGS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <section className="space-y-4">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Configuration</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Key size={10}/> Gemini AI Key</label>
                  <input type="password" value={userApiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter key..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-aviation-orange" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Wind size={10}/> Weather Data Key</label>
                  <input type="password" value={weatherApiKey} onChange={(e) => setWeatherApiKey(e.target.value)} placeholder="Enter key..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-400" />
                </div>
              </div>
            </section>
            <button onClick={handleCommitSettings} className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${saveStatus ? 'bg-emerald-500 text-white shadow-emerald-950/20 shadow-lg' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'}`}>
              {saveStatus ? 'Settings Applied' : 'Commit Changes'}
            </button>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[8px] text-slate-500 font-mono text-center leading-relaxed">SYSTEM_STATUS: NOMINAL<br/>AIRGUARD TACTICAL_LINK v2.6</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
