/**
 * Mirrors backend/api/schemas/*.py *Read shapes. These are the response
 * contracts the website's authenticated areas and the desktop app both
 * consume from the FastAPI backend.
 */

import type { GameTitle, SessionType, TyreCompound, WeatherCondition } from "./enums";

export interface User {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}

export interface RaceSession {
  id: string;
  userId: string;
  game: GameTitle;
  trackName: string;
  sessionType: SessionType;
  weather: WeatherCondition | null;
  airTempC: number | null;
  trackTempC: number | null;
  totalLaps: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface Lap {
  id: string;
  sessionId: string;
  lapNumber: number;
  lapTimeMs: number | null;
  sector1Ms: number | null;
  sector2Ms: number | null;
  sector3Ms: number | null;
  isValid: boolean;
  tyreCompound: TyreCompound | null;
  trackPosition: number | null;
}

export interface TyreStint {
  id: string;
  sessionId: string;
  compound: TyreCompound;
  ageLaps: number;
  wearFlPct: number;
  wearFrPct: number;
  wearRlPct: number;
  wearRrPct: number;
  recordedAt: string;
}

export interface StrategyPlan {
  id: string;
  sessionId: string;
  recommendedPitLap: number | null;
  recommendedCompound: TyreCompound | null;
  reason: string | null;
  isActive: boolean;
  generatedAt: string;
}

/** Live telemetry frame shape, mirrors telemetry.models.TelemetryFrame -
 * this is the WebSocket wire format, not a REST response. */
export interface TelemetryFrame {
  type: "frame";
  sessionId: string | null;
  timestamp: string;
  lapNumber: number | null;
  lapDistanceM: number | null;
  speedKph: number;
  throttlePct: number;
  brakePct: number;
  steering: number;
  gear: number;
  engineRpm: number;
  drsActive: boolean;
}
