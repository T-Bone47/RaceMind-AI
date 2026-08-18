import { create } from "zustand";

import type { TyreCompound, WeatherCondition } from "@racemind/types";

export interface DriverInputs {
  throttlePct: number;
  brakePct: number;
  steering: number; // -1 (full left) to 1 (full right)
  gear: number;
  speedKph: number;
  engineRpm: number;
  drsActive: boolean;
}

export interface TyreWear {
  compound: TyreCompound;
  ageLaps: number;
  fl: number;
  fr: number;
  rl: number;
  rr: number;
}

export interface RadioMessage {
  id: string;
  from: "engineer" | "driver";
  text: string;
  timestamp: string;
}

interface SessionState {
  connected: boolean;
  trackName: string;
  currentLap: number;
  totalLaps: number;
  position: number;
  lastLapMs: number;
  bestLapMs: number;
  deltaMs: number;
  weather: WeatherCondition;
  airTempC: number;
  trackTempC: number;
  fuelKg: number;
  fuelPerLapKg: number;
  tyres: TyreWear;
  driverInputs: DriverInputs;
  speedHistory: number[]; // rolling window for the telemetry graph
  throttleHistory: number[];
  brakeHistory: number[];
  gearHistory: number[];
  messages: RadioMessage[];

  connectWebSocket: (sessionId: string) => void;
  disconnectWebSocket: () => void;
  addMessage: (message: Omit<RadioMessage, "id" | "timestamp">) => void;
  setConnected: (connected: boolean) => void;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
}

const MAX_SPEED_HISTORY = 60;

let ws: WebSocket | null = null;

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSessionId: null,
  connected: false,
  trackName: "Silverstone Circuit",
  currentLap: 14,
  totalLaps: 52,
  position: 3,
  lastLapMs: 87_432,
  bestLapMs: 86_991,
  deltaMs: -0.312,
  weather: "light_cloud",
  airTempC: 21,
  trackTempC: 34,
  fuelKg: 39.6,
  fuelPerLapKg: 1.82,
  tyres: { compound: "medium", ageLaps: 9, fl: 42, fr: 45, rl: 38, rr: 40 },
  driverInputs: {
    throttlePct: 78,
    brakePct: 0,
    steering: 0.12,
    gear: 6,
    speedKph: 241,
    engineRpm: 11200,
    drsActive: false,
  },
  speedHistory: Array.from({ length: MAX_SPEED_HISTORY }, () => 0),
  throttleHistory: Array.from({ length: MAX_SPEED_HISTORY }, () => 0),
  brakeHistory: Array.from({ length: MAX_SPEED_HISTORY }, () => 0),
  gearHistory: Array.from({ length: MAX_SPEED_HISTORY }, () => 0),
  messages: [
    { id: "m1", from: "engineer", text: "Gap ahead is 2.1, gap behind 3.4. You're in the window.", timestamp: "14:02:18" },
    { id: "m2", from: "engineer", text: "Tyre wear is on plan. No cliff before lap 24.", timestamp: "14:04:51" },
  ],

  connectWebSocket: (sessionId: string) => {
    if (ws) {
      ws.close();
    }
    
    // Set initial connection state
    set({ activeSessionId: sessionId, connected: false });
    
    // Create new WebSocket
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    ws = new WebSocket(`${wsUrl}/ws/telemetry/${sessionId}`);
    
    ws.onopen = () => {
      set({ connected: true });
    };
    
    ws.onclose = () => {
      set({ connected: false });
      // Retry connection after delay
      setTimeout(() => {
        const currentId = get().activeSessionId;
        if (currentId === sessionId) {
          get().connectWebSocket(sessionId);
        }
      }, 5000);
    };
    
    ws.onerror = (err) => {
      console.error("Telemetry WebSocket error:", err);
    };
    
    ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data);
        const state = get();
        
        // Update histories
        let nextSpeedHistory = state.speedHistory;
        let nextThrottleHistory = state.throttleHistory;
        let nextBrakeHistory = state.brakeHistory;
        let nextGearHistory = state.gearHistory;
        
        if (frame.speed_kph !== undefined) {
            nextSpeedHistory = [...state.speedHistory.slice(1), frame.speed_kph];
        }
        if (frame.throttle_pct !== undefined) {
            nextThrottleHistory = [...state.throttleHistory.slice(1), frame.throttle_pct];
        }
        if (frame.brake_pct !== undefined) {
            nextBrakeHistory = [...state.brakeHistory.slice(1), frame.brake_pct];
        }
        if (frame.gear !== undefined) {
            nextGearHistory = [...state.gearHistory.slice(1), frame.gear];
        }

        // Apply incoming frame data to state
        set({
          // Update flat session metadata
          currentLap: frame.current_lap ?? state.currentLap,
          totalLaps: frame.total_laps ?? state.totalLaps,
          position: frame.position ?? state.position,
          lastLapMs: frame.last_lap_ms ?? state.lastLapMs,
          bestLapMs: frame.best_lap_ms ?? state.bestLapMs,
          deltaMs: frame.delta_ms ?? state.deltaMs,
          weather: frame.weather ?? state.weather,
          airTempC: frame.air_temp_c ?? state.airTempC,
          trackTempC: frame.track_temp_c ?? state.trackTempC,
          fuelKg: frame.fuel_kg ?? state.fuelKg,
          fuelPerLapKg: frame.fuel_per_lap_kg ?? state.fuelPerLapKg,
          
          // Update driver inputs
          driverInputs: {
            ...state.driverInputs,
            throttlePct: frame.throttle_pct ?? state.driverInputs.throttlePct,
            brakePct: frame.brake_pct ?? state.driverInputs.brakePct,
            steering: frame.steering ?? state.driverInputs.steering,
            gear: frame.gear ?? state.driverInputs.gear,
            speedKph: frame.speed_kph ?? state.driverInputs.speedKph,
            engineRpm: frame.engine_rpm ?? state.driverInputs.engineRpm,
            drsActive: frame.drs_active ?? state.driverInputs.drsActive,
          },
          
          // Update tyres
          tyres: {
            ...state.tyres,
            fl: frame.tyre_wear_fl ?? state.tyres.fl,
            fr: frame.tyre_wear_fr ?? state.tyres.fr,
            rl: frame.tyre_wear_rl ?? state.tyres.rl,
            rr: frame.tyre_wear_rr ?? state.tyres.rr,
          },
          
          speedHistory: nextSpeedHistory,
          throttleHistory: nextThrottleHistory,
          brakeHistory: nextBrakeHistory,
          gearHistory: nextGearHistory
        });
      } catch (e) {
        console.error("Error parsing telemetry frame", e);
      }
    };
  },

  disconnectWebSocket: () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    set({ connected: false, activeSessionId: null });
  },

  addMessage: (message) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString("en-GB"),
        },
      ],
    })),

  setConnected: (connected: boolean) => set({ connected }),
  setActiveSessionId: (activeSessionId: string | null) => set({ activeSessionId }),
}));


