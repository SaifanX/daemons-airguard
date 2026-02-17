
// Fixed TypeScript errors by removing window.process access and complying with Gemini API guidelines.
import { create } from 'zustand';
import { AppState, WeatherData, TelemetryData, Coordinate, SavedMission, SimScenario, PreFlightChecklist, SidebarTab, UiVisibility } from './types';
import { calculatePathRisk, intelligentReroute } from './utils/flightLogic';

const STORAGE_KEY = 'airguard_missions_v3';
const WEATHER_KEY_STORAGE = 'airguard_weather_key';

const generateWeather = (override?: Partial<WeatherData>): WeatherData => {
  const windSpeed = override?.windSpeed ?? Math.floor(Math.random() * 20);
  const visibility = override?.visibility ?? 10;
  const condition = override?.condition ?? 'Clear';
  
  return {
    temp: 22 + Math.floor(Math.random() * 5),
    windSpeed,
    windDirection: 'N',
    visibility,
    condition,
    isFlyable: windSpeed < 25
  };
};

const initialTelemetry: TelemetryData = {
  speed: 0,
  heading: 0,
  battery: 100,
  altitudeAGL: 0,
  signalStrength: 100,
  satCount: 15
};

const initialChecklist: PreFlightChecklist = {
  batteryChecked: false,
  propellersInspected: false,
  gpsLock: false,
  permitChecked: false,
  softwareUpdated: false
};

const getSavedMissions = (): SavedMission[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const useStore = create<AppState & { mapCenter: [number, number], setMapCenter: (center: [number, number]) => void }>()((set, get) => ({
  flightPath: [],
  previewPath: null,
  riskLevel: 0,
  violations: [],
  droneSettings: {
    altitude: 40,
    model: 'Nano (<250g)',
  },
  telemetry: initialTelemetry,
  weather: generateWeather(),
  mapMode: 'DRAW',
  sidebarTab: 'SETUP',
  uiVisible: true,
  uiElements: {
    sidebar: true,
    riskMeter: true,
    weatherWidget: true,
    aiAssistant: true,
    settings: false,
    isZenMode: false,
    checklist: false,
  },
  selectedWaypointIndex: null,
  checklist: initialChecklist,
  isFixingPath: false,
  isInteracting: false,
  mapCenter: [12.9716, 77.5946],
  
  isSimulating: false,
  simProgress: 0,
  simPosition: null,
  simFollowMode: false,
  simSpeedMultiplier: 1,
  activeScenario: 'STANDARD',

  savedMissions: getSavedMissions(),
  userApiKey: '', // Complying with guidelines: API key must be from process.env.API_KEY exclusively.
  weatherApiKey: localStorage.getItem(WEATHER_KEY_STORAGE) || '',

  setMapCenter: (center) => set({ mapCenter: center }),

  addPoint: (point) => {
    set(state => ({ flightPath: [...state.flightPath, point] }));
    get().calculateRisk();
  },

  updatePoint: (index, point) => {
    const newPath = [...get().flightPath];
    if (index >= 0 && index < newPath.length) {
      newPath[index] = point;
      set({ flightPath: newPath, previewPath: null });
      get().calculateRisk();
    }
  },

  setPreviewPoint: (index, point) => {
    const preview = [...get().flightPath];
    if (index >= 0 && index < preview.length) {
      preview[index] = point;
      set({ previewPath: preview });
    }
  },

  clearPreviewPath: () => set({ previewPath: null }),

  removeLastPoint: () => {
    set(state => ({ flightPath: state.flightPath.slice(0, -1) }));
    get().calculateRisk();
  },

  clearPath: () => {
    set({ 
      flightPath: [], 
      previewPath: null,
      riskLevel: 0, 
      violations: [],
      selectedWaypointIndex: null,
      isSimulating: false,
      simProgress: 0,
      simPosition: null,
      checklist: initialChecklist,
      isFixingPath: false
    });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      droneSettings: { ...state.droneSettings, ...newSettings }
    }));
    get().calculateRisk();
  },

  calculateRisk: () => {
    const { flightPath, droneSettings, weather } = get();
    let { riskScore, violations } = calculatePathRisk(flightPath, droneSettings);
    
    if (!weather.isFlyable) {
      riskScore = 100;
      violations = [...violations, `Flight blocked: Current wind speed (${weather.windSpeed} km/h) is too dangerous.`];
    }
    set({ riskLevel: Math.min(riskScore, 100), violations });
  },

  autoFixPath: () => {
    set({ isFixingPath: true });
    setTimeout(() => {
      const fixed = intelligentReroute(get().flightPath);
      set({ flightPath: fixed, isFixingPath: false });
      get().calculateRisk();
    }, 500);
  },

  refreshWeather: async () => {
    const key = get().weatherApiKey;
    if (key) {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=12.9716&lon=77.5946&appid=${key}&units=metric`);
        const data = await res.json();
        if (data.main) {
           set({ 
             weather: {
                temp: Math.round(data.main.temp),
                windSpeed: Math.round(data.wind.speed * 3.6),
                windDirection: 'N',
                visibility: (data.visibility || 10000) / 1000,
                condition: data.weather[0].main,
                isFlyable: (data.wind.speed * 3.6) < 25
             }
           });
           get().calculateRisk();
           return;
        }
      } catch (e) { }
    }
    set({ weather: generateWeather() });
    get().calculateRisk();
  },

  setSelectedWaypointIndex: (index) => set({ selectedWaypointIndex: index }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  toggleUi: () => set(state => ({ uiVisible: !state.uiVisible })),
  toggleUiElement: (element) => set(state => ({
    uiElements: { ...state.uiElements, [element]: !state.uiElements[element] }
  })),
  toggleZenMode: () => {
    const isZen = !get().uiElements.isZenMode;
    set(state => ({
      uiElements: { 
        ...state.uiElements, 
        isZenMode: isZen,
        sidebar: !isZen,
        weatherWidget: !isZen,
      }
    }));
  },
  toggleChecklistItem: (item) => set(state => ({
    checklist: { ...state.checklist, [item]: !state.checklist[item] }
  })),
  autoCheckChecklist: () => {
    set({
      checklist: {
        batteryChecked: true,
        propellersInspected: true,
        gpsLock: true,
        permitChecked: true,
        softwareUpdated: true
      }
    });
  },
  setIsInteracting: (interacting) => set({ isInteracting: interacting }),

  startSimulation: () => {
    const allChecked = Object.values(get().checklist).every(v => v);
    if (!allChecked) {
      set({ sidebarTab: 'CHECKLIST' });
      return;
    }
    if (get().flightPath.length < 2) return;
    set({ isSimulating: true, simProgress: 0 });
  },
  stopSimulation: () => {
    set({ isSimulating: false, simProgress: 0, simPosition: null });
  },
  setSimProgress: (progress) => set({ simProgress: progress }),
  setSimPosition: (pos) => set({ simPosition: pos }),
  toggleFollowMode: () => set(state => ({ simFollowMode: !state.simFollowMode })),
  setSimSpeedMultiplier: (speed) => set({ simSpeedMultiplier: speed }),
  
  applyScenario: (scenario) => {
    set({ activeScenario: scenario });
    if (scenario === 'WINDY' || scenario === 'HEAVY_WEATHER') {
      set({ weather: generateWeather({ windSpeed: 30, condition: 'Storm' }) });
    } else if (scenario === 'LOW_BATTERY' || scenario === 'EMERGENCY_LANDING') {
      set({ telemetry: { ...get().telemetry, battery: 10 } });
    } else {
      set({ weather: generateWeather({ windSpeed: 5, condition: 'Clear' }) });
    }
    get().calculateRisk();
  },

  updateTelemetry: (data) => set(state => ({ telemetry: { ...state.telemetry, ...data } })),

  saveMission: (name) => {
    const missionName = name || `Route ${get().savedMissions.length + 1}`;
    const mission: SavedMission = {
      id: crypto.randomUUID(),
      name: missionName,
      timestamp: Date.now(),
      path: get().flightPath,
      settings: get().droneSettings,
      riskScore: get().riskLevel
    };
    const updated = [mission, ...get().savedMissions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ savedMissions: updated });
  },

  loadMission: (id) => {
    const mission = get().savedMissions.find(m => m.id === id);
    if (mission) {
      set({
        flightPath: mission.path,
        droneSettings: mission.settings,
        selectedWaypointIndex: null,
        isSimulating: false
      });
      get().calculateRisk();
    }
  },

  deleteMission: (id) => {
    const updated = get().savedMissions.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ savedMissions: updated });
  },

  setApiKey: (key) => {
    // API key management is prohibited by guidelines. It must be provided via process.env.API_KEY.
    set({ userApiKey: '' });
  },

  setWeatherApiKey: (key) => {
    localStorage.setItem(WEATHER_KEY_STORAGE, key);
    set({ weatherApiKey: key });
    get().refreshWeather();
  }
}));
