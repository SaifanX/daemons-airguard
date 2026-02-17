
// Complying with Gemini API guidelines by removing UI for entering or managing the API key.
import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Shield, Key, Eye, EyeOff, Save, CheckCircle2, AlertTriangle, Cpu, CloudSun } from 'lucide-react';

const SettingsOverlay: React.FC = () => {
  const { weatherApiKey, setWeatherApiKey, toggleUiElement, uiElements } = useStore();
  const [weatherInput, setWeatherInput] = useState(weatherApiKey);
  const [showWeatherKey, setShowWeatherKey] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  if (!uiElements.settings) return null;

  const handleSave = () => {
    setWeatherApiKey(weatherInput);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-0 left-0 w-full h-[2px] bg-aviation-orange/50 animate-[scan_4s_linear_infinite]"></div>
      </div>

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="px-8 py-6 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-aviation-orange/10 border border-aviation-orange/30 flex items-center justify-center">
              <Shield className="text-aviation-orange" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Systems Configuration</h2>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest">ENCRYPTED ENVIRONMENT PARAMETERS</p>
            </div>
          </div>
          <button 
            onClick={() => toggleUiElement('settings')}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <CloudSun className="text-blue-400" size={16} />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Environmental Data (OpenWeatherMap)</h3>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type={showWeatherKey ? "text" : "password"} 
                  value={weatherInput}
                  onChange={(e) => setWeatherInput(e.target.value)}
                  placeholder="Enter OpenWeatherMap API Key..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-blue-400 outline-none font-mono pr-12 transition-all"
                />
                <button 
                  onClick={() => setShowWeatherKey(!showWeatherKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showWeatherKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Optional: Providing localized keys enables specific telemetry. Environmental data is fetched using your provided key.
              </p>
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-800">
             <div className="flex items-center gap-2">
              <Cpu className="text-blue-400" size={16} />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Environment Status</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono">LATENCY_SYNC</span>
                  <span className="text-[10px] text-emerald-400 font-bold">OPTIMIZED</span>
               </div>
               <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono">ENCRYPTION</span>
                  <span className="text-[10px] text-blue-400 font-bold">AES-256</span>
               </div>
            </div>
          </section>
        </div>

        <div className="px-8 py-6 bg-slate-800/30 border-t border-slate-700 flex justify-end gap-3">
          <button 
            onClick={() => toggleUiElement('settings')}
            className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            DISCARD
          </button>
          <button 
            onClick={handleSave}
            className={`
              flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xl
              ${savedStatus ? 'bg-emerald-500 text-white' : 'bg-aviation-orange hover:bg-orange-600 text-white shadow-orange-900/20'}
            `}
          >
            {savedStatus ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {savedStatus ? 'CONFIG SAVED' : 'COMMIT CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
