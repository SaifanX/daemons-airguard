
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import * as turf from '@turf/turf';

const SimulationEngine: React.FC = () => {
  const { 
    isSimulating, 
    flightPath, 
    setSimProgress, 
    setSimPosition, 
    updateTelemetry,
    droneSettings,
    stopSimulation,
    simSpeedMultiplier,
    activeScenario
  } = useStore();
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const distanceRef = useRef<number>(0); 
  
  // High-performance base speeds: Nano at 80m/s, Micro at 140m/s for rapid tactical review
  const baseDroneSpeed = droneSettings.model.includes('Nano') ? 80 : 140; 
  
  const animate = (time: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1); // Cap delta to prevent teleports
    lastTimeRef.current = time;

    if (flightPath.length < 2) {
      stopSimulation();
      return;
    }

    try {
      const line = turf.lineString(flightPath.map(p => [p.lng, p.lat]));
      const totalLength = turf.length(line, { units: 'meters' });
      
      const frameDistance = deltaTime * baseDroneSpeed * simSpeedMultiplier;
      distanceRef.current += frameDistance;
      
      const progress = Math.min(distanceRef.current / totalLength, 1);
      
      if (progress >= 1) {
        setSimProgress(1);
        stopSimulation();
        return;
      }

      const currentPoint = turf.along(line, distanceRef.current, { units: 'meters' });
      let coords = [...currentPoint.geometry.coordinates];

      // Physical effects
      if (activeScenario === 'HEAVY_WEATHER') {
          const jitter = 0.0004;
          coords[0] += (Math.random() - 0.5) * jitter;
          coords[1] += (Math.random() - 0.5) * jitter;
      }
      
      const lookAheadDistance = Math.min(distanceRef.current + 2, totalLength);
      const lookAheadPoint = turf.along(line, lookAheadDistance, { units: 'meters' });
      const bearing = turf.bearing(currentPoint, lookAheadPoint);

      setSimProgress(progress);
      setSimPosition({ lat: coords[1], lng: coords[0] });
      
      const batteryDrain = activeScenario === 'EMERGENCY_LANDING' ? progress * 95 : progress * 5;
      updateTelemetry({
        speed: (baseDroneSpeed * simSpeedMultiplier) / 3.6, // Display in km/h effectively
        heading: bearing,
        battery: Math.max(0, 100 - batteryDrain),
        altitudeAGL: droneSettings.altitude + (activeScenario === 'HEAVY_WEATHER' ? (Math.random() - 0.5) * 6 : 0),
        signalStrength: Math.max(5, 100 - (distanceRef.current / 120)),
        satCount: 18 + Math.floor(Math.random() * 4)
      });
    } catch (err) {
      stopSimulation();
      return;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isSimulating) {
      lastTimeRef.current = 0;
      distanceRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSimulating, activeScenario, simSpeedMultiplier]);

  return null;
};

export default SimulationEngine;
