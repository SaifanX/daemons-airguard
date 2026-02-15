
import * as turf from '@turf/turf';
import { Coordinate, DroneSettings, ZoneType } from '../types';
import { RESTRICTED_ZONES } from '../data/zones';

export const calculatePathRisk = (
  path: Coordinate[],
  settings: DroneSettings
): { riskScore: number; violations: string[] } => {
  let riskScore = 0;
  const violations: string[] = [];

  if (path.length < 2) return { riskScore: 0, violations: [] };

  const lineCoordinates = path.map(p => [p.lng, p.lat]);
  const line = turf.lineString(lineCoordinates);

  // 1. Precise Altitude Risk (Regulatory limit: 120m AGL)
  if (settings.altitude > 120) {
    const altExcess = settings.altitude - 120;
    const altRisk = Math.min(60, 40 + (altExcess * 0.15));
    riskScore += altRisk;
    violations.push(`RULE_33_VIOLATION: ${settings.altitude}m exceeds 120m limit.`);
  }

  // 2. VLOS Distance Risk
  const lengthKm = turf.length(line, { units: 'kilometers' });
  if (lengthKm > 2) {
    riskScore += Math.min(30, (lengthKm - 2) * 10);
    violations.push(`BVLOS_WARNING: Distance ${lengthKm.toFixed(2)}km may exceed Visual Line of Sight.`);
  }

  // 3. Airspace Intersections
  RESTRICTED_ZONES.forEach(zone => {
    const polyCoords = zone.coordinates.map(c => [c.lng, c.lat]);
    polyCoords.push(polyCoords[0]);
    const polygon = turf.polygon([polyCoords]);

    const intersects = turf.booleanIntersects(line, polygon);
    
    if (intersects) {
      if (zone.type === ZoneType.CRITICAL) {
        riskScore = 100;
        violations.push(`NFZ_BREACH: Intersects Critical Zone (${zone.name}).`);
      } else if (zone.type === ZoneType.RESTRICTED) {
        riskScore = Math.max(riskScore, 85);
        violations.push(`AIRSPACE_CAUTION: Entry into ${zone.name}.`);
      } 
      // Controlled zones (Blue) like Bangalore City now trigger no caution/score penalty
    }
  });

  return { 
    riskScore: parseFloat(Math.min(riskScore, 100).toFixed(2)), 
    violations 
  };
};

/**
 * Attempts to nudge waypoints out of Critical No-Fly Zones
 */
export const autoFixPathCoordinates = (path: Coordinate[]): Coordinate[] => {
  if (path.length < 2) return path;

  return path.map(point => {
    const pt = turf.point([point.lng, point.lat]);
    let shifted = false;
    let newPt = pt;

    // Check each critical zone
    RESTRICTED_ZONES.forEach(zone => {
      if (zone.type !== ZoneType.CRITICAL) return;
      
      const polyCoords = zone.coordinates.map(c => [c.lng, c.lat]);
      polyCoords.push(polyCoords[0]);
      const polygon = turf.polygon([polyCoords]);

      if (turf.booleanPointInPolygon(pt, polygon)) {
        // Point is inside NFZ, nudge it to the nearest boundary plus 50m buffer
        const buffer = turf.buffer(polygon, 0.05, { units: 'kilometers' });
        const zoneCenter = turf.center(polygon);
        const bearing = turf.bearing(zoneCenter, pt);
        newPt = turf.destination(zoneCenter, 0.1, bearing, { units: 'kilometers' });
        shifted = true;
      }
    });

    return shifted ? { lat: newPt.geometry.coordinates[1], lng: newPt.geometry.coordinates[0] } : point;
  });
};
