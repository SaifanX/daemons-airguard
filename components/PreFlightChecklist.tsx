
import React from 'react';
import { useStore } from '../store';
import { ShieldCheck, Battery, Radio, Gauge, FileText, Check, X } from 'lucide-react';
import { PreFlightChecklist as ChecklistType } from '../types';

const PreFlightChecklist: React.FC = () => {
  const { checklist, toggleChecklistItem, uiElements, toggleUiElement } = useStore();

  if (!uiElements.checklist) return null;

  const items: { key: keyof ChecklistType; label: string; icon: React.ReactNode }[] = [
    { key: 'batteryChecked', label: 'Cell Voltage Stability Check', icon: <Battery size={18} /> },
    { key: 'propellersInspected', label: 'Structural Integrity (Props)', icon: <Gauge size={18} /> },
    { key: 'gpsLock', label: 'GNSS Satellite Lock (>12 Sat)', icon: <Radio size={18} /> },
    { key: 'regulatoryClearance', label: 'Digital Sky Permit Validation', icon: <FileText size={18} /> },
    { key: 'firmwareValidated', label: 'System Firmware Hash Check', icon: <ShieldCheck size={18} /> },
  ];

  const allChecked = Object.values(checklist).every(v => v);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Safety Protocol</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Pre-Flight Audit Sequence</p>
          </div>
          <button onClick={() => toggleUiElement('checklist')} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleChecklistItem(item.key)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                checklist[item.key] 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${checklist[item.key] ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                checklist[item.key] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'
              }`}>
                {checklist[item.key] && <Check size={12} className="text-white" />}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 bg-slate-800/30 border-t border-slate-700">
          <button
            onClick={() => toggleUiElement('checklist')}
            disabled={!allChecked}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all ${
              allChecked 
                ? 'bg-aviation-orange text-white shadow-xl shadow-orange-950/40 hover:scale-[1.02]' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {allChecked ? 'COMMENCE MISSION' : 'PENDING SAFETY CHECKS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreFlightChecklist;
