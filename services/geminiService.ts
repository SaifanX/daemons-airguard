
import { GoogleGenAI } from "@google/genai";
import { RESTRICTED_ZONES } from "../data/zones";
import * as turf from '@turf/turf';

export const getCaptainCritique = async (
  userMessage: string,
  riskLevel: number,
  violations: string[],
  flightDetails: any,
  weather?: any,
  flightStats?: { distance: number; waypoints: number },
  telemetry?: { speed: number; heading: number; battery: number; altitudeAGL: number },
  path?: { lat: number, lng: number }[],
  overrideApiKey?: string
): Promise<string> => {
  const activeApiKey = overrideApiKey || process.env.API_KEY || '';

  if (!activeApiKey) {
    return "COMMAND_FAILURE: System offline. Provide authorization key in settings to establish tactical link.";
  }

  const ai = new GoogleGenAI({ apiKey: activeApiKey });
  
  const weatherContext = weather 
    ? `- METAR: ${weather.condition}, ${weather.windSpeed} km/h ${weather.windDirection}`
    : "- METAR Unavailable";

  const statsContext = flightStats
    ? `- VECTORS: ${flightStats.distance} km, ${flightStats.waypoints} WPTs`
    : "";

  let zoneContext = "Clear of restricted zones.";
  if (path && path.length >= 2) {
    const line = turf.lineString(path.map(p => [p.lng, p.lat]));
    const intersected = RESTRICTED_ZONES.filter(zone => {
      const poly = turf.polygon([[...zone.coordinates.map(c => [c.lng, c.lat]), [zone.coordinates[0].lng, zone.coordinates[0].lat]]]);
      return turf.booleanIntersects(line, poly);
    }).map(z => z.name);
    
    if (intersected.length > 0) zoneContext = `ZONE_INTERSECT: ${intersected.join(", ")}`;
  }

  const systemInstruction = `
    IDENTITY: You are Captain Arjun, a retired IAF Wing Commander and strict Safety Inspector for DGCA.
    TONE: Professional, blunt, high-discipline, military-grade jargon.
    
    CONTEXT:
    - MISSION_RISK: ${riskLevel}%
    - VIOLATIONS: ${violations.join(", ") || "None"}
    - ASSET: ${flightDetails.model} @ ${flightDetails.altitude}m
    - ENVIRONMENT: ${weatherContext}
    - TELEMETRY: ${statsContext}
    - AIRSPACE: ${zoneContext}

    PROTOCOLS:
    1. Acknowledge user queries with "Roger" or "Negative".
    2. If Risk > 60%, prioritize safety reprimands.
    3. Refer to "Drone Rules 2021" specifically for Rule 31 (Zones) or Rule 33 (Altitude).
    4. Keep output concise (<120 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Radio silence. Repeat message.";
  } catch (error: any) {
    if (error.message?.includes("entity was not found")) {
      return "AUTHENTICATION_ERROR: Provided API key is invalid or unauthorized.";
    }
    return "COMMS_FAILURE: Unable to reach base. Signal attenuated.";
  }
};
