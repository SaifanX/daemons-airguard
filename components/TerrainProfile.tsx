
import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Activity } from 'lucide-react';

const TerrainProfile: React.FC = () => {
  const { flightPath, droneSettings, simProgress, isSimulating } = useStore();

  // Generate fake but consistent terrain data based on flight path waypoints
  const terrainPoints = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      // Create some "mountains" and "valleys"
      const noise = Math.sin(i * 0.8) * 15 + Math.cos(i * 1.5) * 10;
      return 20 + noise;
    });
  }, [flightPath]);

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[900] w-full max-w-3xl px-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-aviation-orange" />
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Terrain Profile (Estimated)</h3>
          </div>
          <div className="text-[10px] font-mono font-bold text-aviation-orange">
            AGL: <span className="text-white">{droneSettings.altitude}m</span>
          </div>
        </div>

        {/* The Bar Chart */}
        <div className="relative h-24 flex items-end gap-[2px] px-2 pt-4">
          {/* Simulation Marker (Vertical Line) */}
          {isSimulating && (
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-white/40 z-20 transition-all duration-100 ease-linear shadow-[0_0_10px_white]"
              style={{ left: `${simProgress * 100}%` }}
            >
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}

          {terrainPoints.map((elevation, idx) => {
            const barWidth = 100 / terrainPoints.length;
            const droneAltPx = Math.max(0, droneSettings.altitude / 3); // Scaled for UI
            const terrainPx = Math.max(0, elevation / 3);

            return (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-[1px]">
                {/* Drone Altitude Bar (Orange) */}
                <div 
                  className="w-full bg-aviation-orange/60 rounded-t-sm transition-all duration-500 hover:bg-aviation-orange"
                  style={{ height: `${droneAltPx}px` }}
                ></div>
                {/* Terrain Bar (Slate) */}
                <div 
                  className="w-full bg-slate-700 rounded-t-sm transition-all duration-500"
                  style={{ height: `${terrainPx}px` }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-2 px-2 text-[8px] font-black text-slate-500 font-mono tracking-widest">
           <span>START</span>
           <div className="w-[1px] h-2 bg-slate-800"></div>
           <div className="w-[1px] h-2 bg-slate-800"></div>
           <div className="w-[1px] h-2 bg-slate-800"></div>
           <span>RECON_VECTOR</span>
           <div className="w-[1px] h-2 bg-slate-800"></div>
           <div className="w-[1px] h-2 bg-slate-800"></div>
           <div className="w-[1px] h-2 bg-slate-800"></div>
           <span>11.6 KM</span>
        </div>
      </div>
    </div>
  );
};

export default TerrainProfile;
