
import { create } from 'zustand';
import { AppState, WeatherData, TelemetryData, Coordinate, SavedMission, SimScenario, PreFlightChecklist, SidebarTab } from './types';
import { calculatePathRisk, autoFixPathCoordinates } from './utils/flightLogic';

const STORAGE_KEY = 'airguard_missions_v3';
const API_KEY_STORAGE = 'airguard_api_key';

const generateWeather = (override?: Partial<WeatherData>): WeatherData => {
  const windSpeed = override?.windSpeed ?? Math.floor(Math.random() * 25);
  const visibility = override?.visibility ?? 8 + Math.floor(Math.random() * 4);
  const condition = override?.condition ?? (windSpeed > 20 ? 'Cloudy' : 'Clear');
  
  return {
    temp: 22 + Math.floor(Math.random() * 8),
    windSpeed,
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    visibility,
    condition,
    isFlyable: windSpeed < 30 && visibility > 2 && condition !== 'Storm'
  };
};

const initialTelemetry: TelemetryData = {
  speed: 0,
  heading: 0,
  battery: 100,
  altitudeAGL: 0,
  signalStrength: 100,
  satCount: 18
};

const initialChecklist: PreFlightChecklist = {
  batteryChecked: false,
  propellersInspected: false,
  gpsLock: false,
  regulatoryClearance: false,
  firmwareValidated: false
};

const getSavedMissions = (): SavedMission[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const useStore = create<AppState>()((set, get) => ({
  flightPath: [],
  riskLevel: 0,
  violations: [],
  droneSettings: {
    altitude: 60,
    model: 'Nano (<250g)',
  },
  telemetry: initialTelemetry,
  weather: generateWeather(),
  mapMode: 'DRAW',
  sidebarTab: 'CONFIG',
  uiVisible: true,
  uiElements: {
    sidebar: true,
    riskMeter: true,
    weatherWidget: true,
    aiAssistant: true,
    settings: false,
  },
  selectedWaypointIndex: null,
  checklist: initialChecklist,
  isFixingPath: false,
  isInteracting: false,
  
  isSimulating: false,
  simProgress: 0,
  simPosition: null,
  simFollowMode: false,
  simSpeedMultiplier: 1,
  activeScenario: 'STANDARD',

  savedMissions: getSavedMissions(),
  userApiKey: localStorage.getItem(API_KEY_STORAGE) || '',

  addPoint: (point) => {
    const newPath = [...get().flightPath, point];
    set({ flightPath: newPath });
    get().calculateRisk();
  },

  updatePoint: (index, point) => {
    const newPath = [...get().flightPath];
    if (index >= 0 && index < newPath.length) {
      newPath[index] = point;
      set({ flightPath: newPath });
      get().calculateRisk();
    }
  },

  removeLastPoint: () => {
    const newPath = get().flightPath.slice(0, -1);
    set({ flightPath: newPath });
    get().calculateRisk();
  },

  clearPath: () => set({ 
    flightPath: [], 
    riskLevel: 0, 
    violations: [],
    selectedWaypointIndex: null,
    isSimulating: false,
    simProgress: 0,
    simPosition: null,
    checklist: initialChecklist,
    isFixingPath: false
  }),

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
      violations = [...violations, `WEATHER: Severe conditions (${weather.condition})`];
    } else if (weather.windSpeed > 18) {
      riskScore += 15;
      violations = [...violations, `WIND: High crosswinds (${weather.windSpeed}km/h)`];
    }

    set({ riskLevel: Math.min(riskScore, 100), violations });
  },

  autoFixPath: () => {
    set({ isFixingPath: true });
    setTimeout(() => {
      const fixed = autoFixPathCoordinates(get().flightPath);
      set({ flightPath: fixed, isFixingPath: false });
      get().calculateRisk();
    }, 1200);
  },

  refreshWeather: () => {
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
  toggleChecklistItem: (item) => set(state => ({
    checklist: { ...state.checklist, [item]: !state.checklist[item] }
  })),
  autoCheckChecklist: () => set({
    checklist: {
      batteryChecked: true,
      propellersInspected: true,
      gpsLock: true,
      regulatoryClearance: true,
      firmwareValidated: true
    }
  }),
  setIsInteracting: (interacting) => set({ isInteracting: interacting }),

  // Simulation
  startSimulation: () => {
    const allChecked = Object.values(get().checklist).every(v => v);
    if (!allChecked) {
      // Switch to checklist tab automatically
      set({ sidebarTab: 'CHECKLIST' });
      return;
    }
    if (get().flightPath.length < 2) return;
    set({ isSimulating: true, simProgress: 0 });
  },
  stopSimulation: () => set({ isSimulating: false, simProgress: 0, simPosition: null }),
  setSimProgress: (progress) => set({ simProgress: progress }),
  setSimPosition: (pos) => set({ simPosition: pos }),
  toggleFollowMode: () => set(state => ({ simFollowMode: !state.simFollowMode })),
  setSimSpeedMultiplier: (speed) => set({ simSpeedMultiplier: speed }),
  
  applyScenario: (scenario) => {
    set({ activeScenario: scenario });
    if (scenario === 'HEAVY_WEATHER') {
      set({ weather: generateWeather({ windSpeed: 32, condition: 'Storm' }) });
    } else if (scenario === 'EMERGENCY_LANDING') {
      set({ telemetry: { ...get().telemetry, battery: 15 } });
    } else {
      set({ weather: generateWeather({ windSpeed: 5, condition: 'Clear' }) });
    }
    get().calculateRisk();
  },

  updateTelemetry: (data) => set(state => ({ telemetry: { ...state.telemetry, ...data } })),

  saveMission: (name) => {
    const mission: SavedMission = {
      id: crypto.randomUUID(),
      name: name || `MISSION_${Date.now().toString().slice(-4)}`,
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
    localStorage.setItem(API_KEY_STORAGE, key);
    set({ userApiKey: key });
  }
}));
