
export interface Coordinate {
  lat: number;
  lng: number;
}

export enum ZoneType {
  CRITICAL = 'CRITICAL', // Red
  RESTRICTED = 'RESTRICTED', // Yellow
  CONTROLLED = 'CONTROLLED', // Blue
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  coordinates: Coordinate[];
}

export interface DroneSettings {
  altitude: number;
  model: 'Nano (<250g)' | 'Micro (>2kg)';
}

export interface WeatherData {
  temp: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  condition: 'Clear' | 'Cloudy' | 'Rain' | 'Storm';
  isFlyable: boolean;
}

export interface TelemetryData {
  speed: number;
  heading: number;
  battery: number;
  altitudeAGL: number;
  signalStrength: number;
  satCount: number;
}

export interface SavedMission {
  id: string;
  name: string;
  timestamp: number;
  path: Coordinate[];
  settings: DroneSettings;
  riskScore: number;
}

export type MapMode = 'PAN' | 'DRAW' | 'SEARCH';
export type SidebarTab = 'SETUP' | 'CHECKLIST' | 'SAVED' | 'SETTINGS' | 'SAFETY' | 'COMPLIANCE';

export interface UiVisibility {
  sidebar: boolean;
  riskMeter: boolean;
  weatherWidget: boolean;
  aiAssistant: boolean;
  settings: boolean;
  isZenMode: boolean;
  // Added checklist to UiVisibility to fix navigation errors
  checklist: boolean;
}

// Added tactical scenarios used in SimulationEngine and PlaybackControlHub
export type SimScenario = 'STANDARD' | 'WINDY' | 'LOW_BATTERY' | 'HEAVY_WEATHER' | 'EMERGENCY_LANDING';

export interface PreFlightChecklist {
  batteryChecked: boolean;
  propellersInspected: boolean;
  gpsLock: boolean;
  permitChecked: boolean;
  softwareUpdated: boolean;
}

export interface AppState {
  flightPath: Coordinate[];
  previewPath: Coordinate[] | null; 
  riskLevel: number;
  violations: string[];
  droneSettings: DroneSettings;
  telemetry: TelemetryData;
  weather: WeatherData;
  mapMode: MapMode;
  sidebarTab: SidebarTab;
  uiVisible: boolean;
  uiElements: UiVisibility;
  selectedWaypointIndex: number | null;
  checklist: PreFlightChecklist;
  isFixingPath: boolean;
  isInteracting: boolean; 
  
  // Test Flight State
  isSimulating: boolean;
  simProgress: number; 
  simPosition: Coordinate | null;
  simFollowMode: boolean;
  simSpeedMultiplier: number;
  activeScenario: SimScenario;
  
  // Saved Data
  savedMissions: SavedMission[];
  userApiKey: string;
  weatherApiKey: string;
  
  // Actions
  addPoint: (point: Coordinate) => void;
  updatePoint: (index: number, point: Coordinate) => void;
  setPreviewPoint: (index: number, point: Coordinate) => void; 
  clearPreviewPath: () => void;
  removeLastPoint: () => void;
  clearPath: () => void;
  updateSettings: (settings: Partial<DroneSettings>) => void;
  calculateRisk: () => void;
  refreshWeather: () => void;
  setSelectedWaypointIndex: (index: number | null) => void;
  setMapMode: (mode: MapMode) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  toggleUi: () => void;
  toggleUiElement: (element: keyof UiVisibility) => void;
  toggleZenMode: () => void;
  toggleChecklistItem: (item: keyof PreFlightChecklist) => void;
  autoCheckChecklist: () => void;
  autoFixPath: () => void;
  setIsInteracting: (interacting: boolean) => void;
  
  // Test Flight Actions
  startSimulation: () => void;
  stopSimulation: () => void;
  setSimProgress: (progress: number) => void;
  setSimPosition: (pos: Coordinate | null) => void;
  toggleFollowMode: () => void;
  setSimSpeedMultiplier: (speed: number) => void;
  applyScenario: (scenario: SimScenario) => void;
  updateTelemetry: (data: Partial<TelemetryData>) => void;

  // Save Actions
  saveMission: (name: string) => void;
  loadMission: (id: string) => void;
  deleteMission: (id: string) => void;
  setApiKey: (key: string) => void;
  setWeatherApiKey: (key: string) => void;
}
