import { useSessionStore } from '../store/sessionStore';
import { useActiveStrategy } from '../lib/api/strategy';
import type { DriverEntry, RadioMessage, StrategyOption, TyreCorner, ControlMessage } from '../types/race';

export function useRaceData() {
  const store = useSessionStore();
  const { data: strategyData } = useActiveStrategy(store.activeSessionId || "");

  const session = {
    event: 'FORMULA 1 GRAND PRIX',
    round: 'RACE',
    circuit: store.trackName || 'Unknown',
    location: '',
    type: 'RACE',
    lap: store.currentLap,
    totalLaps: store.totalLaps,
    trackTemp: store.trackTempC,
    airTemp: store.airTempC,
    humidity: 0,
    windSpeed: 0,
    windDir: 0,
    rainProbability: 0,
    trackEvolution: 0,
    gripIndex: 0,
    elapsed: 0,
    weather: store.weather
  };

  const focusDriver = {
    code: 'RUS',
    name: 'George Russell',
    number: 63,
    team: 'Mercedes',
    teamColor: '#00E5FF',
    position: store.position,
    championshipPos: 0,
    championshipPts: 0,
    gapAhead: 0,
    gapBehind: 0,
    lastLap: store.lastLapMs / 1000,
    bestLap: store.bestLapMs / 1000,
    compound: store.tyres.compound.toUpperCase() as 'SOFT'|'MEDIUM'|'HARD'|'INTER'|'WET',
    tyreAge: store.tyres.ageLaps,
    fuelRemaining: store.fuelKg,
    fuelDelta: 0,
    ersCharge: 0,
    ersDeployed: 0,
    engineMode: 'STRAT 6',
    confidence: 0
  };

  const meDriver: DriverEntry = {
    pos: store.position,
    code: 'RUS',
    name: 'G. Russell',
    number: 63,
    team: 'Mercedes',
    teamColor: '#00E5FF',
    gap: null,
    interval: store.deltaMs,
    lastLap: store.lastLapMs / 1000,
    bestLap: store.bestLapMs / 1000,
    compound: store.tyres.compound.toUpperCase() as 'SOFT'|'MEDIUM'|'HARD'|'INTER'|'WET',
    tyreAge: store.tyres.ageLaps,
    stops: 1,
    sectors: ['idle', 'idle', 'idle'],
    drs: store.driverInputs.drsActive,
    pit: false,
    trend: 'hold'
  };

  const drivers: DriverEntry[] = [meDriver];

  const radioMessages: RadioMessage[] = store.messages.map(m => ({
    id: m.id,
    from: m.from === 'engineer' ? 'AI' : 'DRIVER',
    lap: store.currentLap,
    time: m.timestamp,
    text: m.text,
    sentiment: 'calm'
  }));

  const controlMessages: ControlMessage[] = [];

  const strategyOptions: StrategyOption[] = [];
  if (strategyData && strategyData.is_active) {
    strategyOptions.push({
      id: strategyData.id,
      label: `RECOMMENDED — BOX LAP ${strategyData.recommended_pit_lap}`,
      detail: `${strategyData.recommended_compound?.toUpperCase() || 'UNKNOWN'} to flag · ${strategyData.reason || ''}`,
      stops: '1 stop remaining',
      projectedPos: 0,
      delta: 0,
      confidence: 100,
      risk: 'low',
      recommended: true
    });
  }

  const tyres: TyreCorner[] = [
    { label: 'FL', surface: 0, carcass: 0, wear: store.tyres.fl, pressure: 0 },
    { label: 'FR', surface: 0, carcass: 0, wear: store.tyres.fr, pressure: 0 },
    { label: 'RL', surface: 0, carcass: 0, wear: store.tyres.rl, pressure: 0 },
    { label: 'RR', surface: 0, carcass: 0, wear: store.tyres.rr, pressure: 0 }
  ];

  const aiInsights = strategyData ? [
    { 
      id: strategyData.id, 
      title: `Pit window optimal at lap ${strategyData.recommended_pit_lap}`, 
      body: strategyData.reason || 'Optimal pit strategy.', 
      confidence: 100, 
      tone: 'cyan' as const 
    }
  ] : [];

  const raceEvents = [
    { lap: store.currentLap, label: 'CURRENT', kind: 'now' as const }
  ];

  const stints = [
    { compound: store.tyres.compound.toUpperCase(), from: 1, to: store.currentLap, color: '#FFC531' }
  ];
  
  if (strategyData && strategyData.recommended_pit_lap) {
      stints.push({ compound: `PROJECTED ${strategyData.recommended_compound?.toUpperCase()}`, from: strategyData.recommended_pit_lap, to: store.totalLaps, color: '#00E5FF' });
  }

  return {
    session,
    focusDriver,
    drivers,
    radioMessages,
    controlMessages,
    strategyOptions,
    tyres,
    aiInsights,
    raceEvents,
    stints
  };
}
