
import React, { useState } from 'react';
import { useStore } from '../store';
import { AlertTriangle, CheckCircle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

const RiskMeter: React.FC = () => {
  const { riskLevel, violations } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    if (riskLevel === 0) return 'text-emerald-400 border-emerald-500 bg-slate-900 shadow-2xl';
    if (riskLevel < 50) return 'text-yellow-400 border-yellow-500 bg-slate-900 shadow-2xl';
    return 'text-red-400 border-red-500 bg-slate-900 shadow-2xl';
  };

  const getBarColor = () => {
    if (riskLevel === 0) return 'bg-emerald-500';
    if (riskLevel < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (riskLevel === 0) return 'CLEARED';
    if (riskLevel < 50) return 'CAUTION';
    return 'RESTRICTED';
  };

  const Icon = riskLevel === 0 ? CheckCircle : (riskLevel < 50 ? AlertTriangle : ShieldAlert);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center">
      {/* Compact Status Bar - Pills Everywhere */}
      <div 
        className={`
          flex items-center gap-4 px-6 py-3 rounded-full border-2 transition-all duration-300
          ${getStatusColor()} cursor-pointer hover:scale-105 active:scale-95
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon size={20} className={riskLevel > 0 ? "animate-pulse" : ""} />
          <span className="font-black font-mono text-sm tracking-[0.2em]">{getStatusText()}</span>
        </div>

        <div className="h-8 w-[1px] bg-slate-700 mx-1"></div>

        <div className="flex flex-col items-end min-w-[70px]">
          <span className="text-xs font-black tracking-tight">{riskLevel}% RISK</span>
          {/* Mini progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor()}`} 
              style={{ width: `${riskLevel}%` }}
            />
          </div>
        </div>

        {violations.length > 0 && (
           <div className="flex items-center text-xs opacity-70">
             {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
           </div>
        )}
      </div>

      {/* Expanded Details Dropdown */}
      {isExpanded && violations.length > 0 && (
        <div className="mt-3 w-80 bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.6)] p-5 animate-in slide-in-from-top-4 duration-300">
           <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Violations</span>
              <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-mono border border-white/5">{violations.length}</span>
           </div>
           <ul className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
             {violations.map((v, i) => (
               <li key={i} className="flex items-start gap-3 text-xs text-slate-300 border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                 <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" />
                 <span className="font-mono leading-relaxed">{v}</span>
               </li>
             ))}
           </ul>
        </div>
      )}
    </div>
  );
};

export default RiskMeter;
