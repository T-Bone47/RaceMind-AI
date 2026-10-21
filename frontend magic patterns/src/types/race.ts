export type SectorState = 'purple' | 'green' | 'yellow' | 'idle';
export type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';

export interface DriverEntry {
  pos: number;
  code: string;
  name: string;
  number: number;
  team: string;
  teamColor: string;
  gap: number | null;
  interval: number | null;
  lastLap: number;
  bestLap: number;
  compound: Compound;
  tyreAge: number;
  stops: number;
  sectors: SectorState[];
  drs: boolean;
  pit: boolean;
  trend: 'up' | 'down' | 'hold';
}

export interface RadioMessage {
  id: string;
  from: 'DRIVER' | 'ENGINEER' | 'AI';
  lap: number;
  time: string;
  text: string;
  sentiment?: 'calm' | 'urgent' | 'positive';
}

export interface ControlMessage {
  id: string;
  lap: number;
  time: string;
  category: 'FLAG' | 'DRS' | 'INCIDENT' | 'PENALTY' | 'CAR';
  text: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface StrategyOption {
  id: string;
  label: string;
  detail: string;
  stops: string;
  projectedPos: number;
  delta: number;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  recommended?: boolean;
}

export interface TyreCorner {
  label: string;
  surface: number;
  carcass: number;
  wear: number;
  pressure: number;
}