
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../store';
import { RESTRICTED_ZONES } from '../data/zones';
import { ZoneType } from '../types';

const MapHandlerController = () => {
  const map = useMap();
  const mapMode = useStore(state => state.mapMode);
  const { isSimulating, simPosition, simFollowMode } = useStore();

  useEffect(() => {
    if (mapMode === 'PAN') {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.enable();
    }
  }, [map, mapMode]);

  useEffect(() => {
    if (isSimulating && simPosition && simFollowMode) {
      map.setView([simPosition.lat, simPosition.lng], map.getZoom(), {
        animate: true,
        duration: 0.1
      });
    }
  }, [simPosition, simFollowMode, isSimulating, map]);

  return null;
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
};

const MapInteractions = () => {
  const { addPoint, mapMode, isSimulating, setIsInteracting } = useStore();
  const map = useMap();

  useMapEvents({
    mousedown() { setIsInteracting(true); },
    mouseup() { setIsInteracting(false); },
    touchstart() { setIsInteracting(true); },
    touchend() { setIsInteracting(false); },
    dragstart() { setIsInteracting(true); },
    dragend() { setIsInteracting(false); },
    click(e) {
      if (mapMode === 'DRAW' && !isSimulating) {
        addPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });

  useEffect(() => {
    const container = map.getContainer();
    if (isSimulating) {
      container.style.cursor = 'wait';
    } else if (mapMode === 'DRAW') {
      container.style.cursor = 'crosshair';
    } else if (mapMode === 'PAN') {
      container.style.cursor = 'grab';
    } else {
      container.style.cursor = 'default';
    }
  }, [mapMode, map, isSimulating]);

  return null;
};

const waypointIcon = (index: number, isSelected: boolean) => L.divIcon({
  className: 'waypoint-icon',
  html: `
    <div class="relative group">
      <div class="signal-ring absolute -inset-2 border-2 border-aviation-orange rounded-full animate-signal-ring ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
      <div class="relative w-7 h-7 bg-slate-900 border-2 ${isSelected ? 'border-white scale-110 bg-aviation-orange shadow-[0_0_15px_rgba(249,115,22,0.6)]' : 'border-aviation-orange'} text-aviation-orange text-[10px] font-bold flex items-center justify-center rounded-full transition-all">
        ${index === 0 ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' : index + 1}
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const droneGhostIcon = (heading: number, scenario: string) => {
  const isEmergency = scenario === 'EMERGENCY_LANDING';
  const isHeavyWind = scenario === 'HEAVY_WEATHER';
  
  return L.divIcon({
    className: 'drone-ghost-icon',
    html: `
      <div style="transform: rotate(${heading}deg)" class="relative transition-transform duration-100 ${isHeavyWind ? 'animate-bounce-fast' : ''}">
        <div class="w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_0_12px_${isEmergency ? 'rgba(239,68,68,1)' : 'rgba(249,115,22,1)'}]">
            <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="${isEmergency ? '#ef4444' : '#f97316'}" stroke="white" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 ${isEmergency ? 'border-red-500' : 'border-aviation-orange'}/40 rounded-full animate-ping opacity-30"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const MapEngine: React.FC = () => {
  const { 
    flightPath, 
    mapMode, 
    updatePoint, 
    selectedWaypointIndex, 
    setSelectedWaypointIndex,
    isSimulating,
    simPosition,
    telemetry,
    activeScenario
  } = useStore();
  
  const [mapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const pathPositions = useMemo(() => flightPath.map(p => [p.lat, p.lng] as [number, number]), [flightPath]);

  const getZoneOptions = (type: ZoneType) => {
    switch(type) {
      case ZoneType.CRITICAL: return { color: '#ef4444', fillOpacity: 0.2 };
      case ZoneType.CONTROLLED: return { color: '#3b82f6', fillOpacity: 0.1 };
      default: return { color: '#f97316', fillOpacity: 0.15 };
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950">
      <MapContainer center={mapCenter} zoom={12} className="w-full h-full" zoomControl={false} attributionControl={false}>
        <MapResizer />
        <MapHandlerController />
        <MapInteractions />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {RESTRICTED_ZONES.map(zone => (
            <Polygon
                key={zone.id}
                positions={zone.coordinates.map(c => [c.lat, c.lng])}
                pathOptions={{ 
                    ...getZoneOptions(zone.type),
                    dashArray: zone.type === ZoneType.CRITICAL ? '5, 8' : '0',
                    weight: 3,
                    className: zone.type === ZoneType.CRITICAL ? 'critical-zone-pulse' : ''
                }}
            >
                <Tooltip sticky className="ghost-tooltip">
                  <div className="uppercase">
                    <span className="font-bold text-slate-400 text-[8px] tracking-[0.2em]">{zone.type} AIRSPACE</span><br/>
                    <span className="text-xs font-bold text-white">{zone.name}</span>
                  </div>
                </Tooltip>
            </Polygon>
        ))}

        {pathPositions.length > 0 && (
          <>
            <Polyline positions={pathPositions} pathOptions={{ color: '#f97316', weight: 3, opacity: isSimulating ? 0.2 : 0.8, dashArray: isSimulating ? '10, 10' : '0' }} />
            {pathPositions.map((pos, idx) => (
              <Marker 
                key={idx} 
                position={pos} 
                icon={waypointIcon(idx, selectedWaypointIndex === idx)} 
                draggable={mapMode === 'DRAW' && !isSimulating}
                eventHandlers={{ 
                  dragend: (e) => {
                    const latlng = e.target.getLatLng();
                    updatePoint(idx, { lat: latlng.lat, lng: latlng.lng });
                  },
                  click: () => setSelectedWaypointIndex(idx)
                }}
              />
            ))}
          </>
        )}

        {isSimulating && simPosition && (
          <Marker position={[simPosition.lat, simPosition.lng]} icon={droneGhostIcon(telemetry.heading, activeScenario)} zIndexOffset={1000} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapEngine;
