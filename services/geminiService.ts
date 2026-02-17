
import { GoogleGenAI } from "@google/genai";
import { RESTRICTED_ZONES } from "../data/zones";
import { ZoneType } from "../types";
import { lineString, polygon, booleanIntersects } from '@turf/turf';

export const getCaptainCritique = async (
  userMessage: string,
  riskLevel: number,
  violations: string[],
  flightDetails: any,
  weather?: any,
  flightStats?: { distance: number; waypoints: number },
  telemetry?: { speed: number; heading: number; battery: number; altitudeAGL: number },
  path?: { lat: number, lng: number }[]
): Promise<string> => {
  // Use the pre-configured environment variable exclusively.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const weatherContext = weather 
    ? `- Weather: ${weather.condition}, Wind: ${weather.windSpeed} km/h`
    : "- Weather telemetry not synced";

  let zoneContext = "Primary airspace is clear of active restrictions.";
  if (path && path.length >= 2) {
    try {
      const line = lineString(path.map(p => [p.lng, p.lat]));
      const intersected = RESTRICTED_ZONES.filter(zone => {
        if (zone.type === ZoneType.CONTROLLED) return false;
        const polyCoords = [...zone.coordinates.map(c => [c.lng, c.lat]), [zone.coordinates[0].lng, zone.coordinates[0].lat]];
        const poly = polygon([polyCoords as any]);
        return booleanIntersects(line, poly);
      }).map(z => z.name);
      
      if (intersected.length > 0) zoneContext = `CRITICAL: Flight vector enters restricted zones: ${intersected.join(", ")}.`;
    } catch (e) {
      console.warn("Zone intersection check failed during AI context generation");
    }
  }

  const systemInstruction = `
    You are 'Guard-1', a helpful AI flight safety assistant for AirGuard (a project by Team Daemons, winner of 2nd place at TechnoFest 2026, Stonehill School).
    Your goal is to help drone pilots fly safely by providing concise, actionable advice based on the provided mission context.
    
    MISSION CONTEXT:
    - Current Risk Assessment: ${riskLevel}%
    - Safety Violations Found: ${violations.length > 0 ? violations.join(", ") : "None Detected"}
    - Drone Config: ${flightDetails.model} (Operating Height: ${flightDetails.altitude}m)
    - ${weatherContext}
    - Airspace Status: ${zoneContext}

    PERSONALITY:
    - Professional, encouraging, and clear.
    - Use aviation terminology where appropriate but keep it accessible.
    - If risk is high (>60%), be more urgent and professional.
    - Always reference safety first.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Communication relay weak. Please rephrase your request, Pilot.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return "Relay Error: Could not connect to the AI Tactical Core. Verify your connection.";
  }
};
