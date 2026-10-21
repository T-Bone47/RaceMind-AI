import type { ControlMessage, DriverEntry, RadioMessage, StrategyOption, TyreCorner } from '../types/race';

export const session = {
  event: 'FORMULA 1 GRAND PRIX DE MONACO',
  round: 'ROUND 08',
  circuit: 'Circuit de Monaco',
  location: 'Monte Carlo, MC',
  type: 'RACE',
  lap: 43,
  totalLaps: 78,
  trackTemp: 47.2,
  airTemp: 26.4,
  humidity: 58,
  windSpeed: 11.4,
  windDir: 218,
  rainProbability: 34,
  trackEvolution: 0.72,
  gripIndex: 91.4,
  elapsed: 4917
};

export const focusDriver = {
  code: 'RUS',
  name: 'George Russell',
  number: 63,
  team: 'Mercedes-AMG PETRONAS',
  teamColor: '#00E5FF',
  position: 3,
  championshipPos: 4,
  championshipPts: 137,
  gapAhead: 1.842,
  gapBehind: 2.317,
  lastLap: 75.412,
  bestLap: 74.983,
  compound: 'MEDIUM' as const,
  tyreAge: 18,
  fuelRemaining: 42.6,
  fuelDelta: -0.34,
  ersCharge: 68,
  ersDeployed: 2.9,
  engineMode: 'STRAT 6',
  confidence: 88
};

export const drivers: DriverEntry[] = [
{ pos: 1, code: 'VER', name: 'M. Verstappen', number: 1, team: 'Red Bull', teamColor: '#3D8BFF', gap: null, interval: null, lastLap: 75.108, bestLap: 74.612, compound: 'HARD', tyreAge: 21, stops: 1, sectors: ['green', 'purple', 'green'], drs: false, pit: false, trend: 'hold' },
{ pos: 2, code: 'LEC', name: 'C. Leclerc', number: 16, team: 'Ferrari', teamColor: '#E10600', gap: 3.204, interval: 3.204, lastLap: 75.331, bestLap: 74.744, compound: 'MEDIUM', tyreAge: 16, stops: 1, sectors: ['green', 'green', 'yellow'], drs: false, pit: false, trend: 'hold' },
{ pos: 3, code: 'RUS', name: 'G. Russell', number: 63, team: 'Mercedes', teamColor: '#00E5FF', gap: 5.046, interval: 1.842, lastLap: 75.412, bestLap: 74.983, compound: 'MEDIUM', tyreAge: 18, stops: 1, sectors: ['purple', 'green', 'green'], drs: true, pit: false, trend: 'up' },
{ pos: 4, code: 'NOR', name: 'L. Norris', number: 4, team: 'McLaren', teamColor: '#FF7A29', gap: 7.363, interval: 2.317, lastLap: 75.208, bestLap: 74.881, compound: 'SOFT', tyreAge: 6, stops: 2, sectors: ['green', 'green', 'purple'], drs: true, pit: false, trend: 'up' },
{ pos: 5, code: 'HAM', name: 'L. Hamilton', number: 44, team: 'Ferrari', teamColor: '#E10600', gap: 12.884, interval: 5.521, lastLap: 75.702, bestLap: 75.02, compound: 'HARD', tyreAge: 24, stops: 1, sectors: ['yellow', 'green', 'green'], drs: false, pit: false, trend: 'down' },
{ pos: 6, code: 'PIA', name: 'O. Piastri', number: 81, team: 'McLaren', teamColor: '#FF7A29', gap: 15.117, interval: 2.233, lastLap: 75.554, bestLap: 74.998, compound: 'MEDIUM', tyreAge: 19, stops: 1, sectors: ['green', 'yellow', 'green'], drs: false, pit: false, trend: 'hold' },
{ pos: 7, code: 'ALO', name: 'F. Alonso', number: 14, team: 'Aston Martin', teamColor: '#00D68F', gap: 21.409, interval: 6.292, lastLap: 75.914, bestLap: 75.311, compound: 'HARD', tyreAge: 27, stops: 1, sectors: ['green', 'green', 'yellow'], drs: false, pit: false, trend: 'hold' },
{ pos: 8, code: 'SAI', name: 'C. Sainz', number: 55, team: 'Williams', teamColor: '#3D8BFF', gap: 24.882, interval: 3.473, lastLap: 76.041, bestLap: 75.402, compound: 'MEDIUM', tyreAge: 14, stops: 2, sectors: ['yellow', 'green', 'green'], drs: false, pit: false, trend: 'up' },
{ pos: 9, code: 'ANT', name: 'K. Antonelli', number: 12, team: 'Mercedes', teamColor: '#00E5FF', gap: 28.117, interval: 3.235, lastLap: 76.114, bestLap: 75.488, compound: 'SOFT', tyreAge: 4, stops: 2, sectors: ['green', 'purple', 'green'], drs: true, pit: false, trend: 'up' },
{ pos: 10, code: 'GAS', name: 'P. Gasly', number: 10, team: 'Alpine', teamColor: '#B15CFF', gap: 33.502, interval: 5.385, lastLap: 76.318, bestLap: 75.61, compound: 'HARD', tyreAge: 31, stops: 1, sectors: ['yellow', 'yellow', 'green'], drs: false, pit: true, trend: 'down' },
{ pos: 11, code: 'HUL', name: 'N. Hulkenberg', number: 27, team: 'Kick Sauber', teamColor: '#00D68F', gap: 38.221, interval: 4.719, lastLap: 76.482, bestLap: 75.771, compound: 'MEDIUM', tyreAge: 22, stops: 1, sectors: ['green', 'yellow', 'yellow'], drs: false, pit: false, trend: 'hold' },
{ pos: 12, code: 'TSU', name: 'Y. Tsunoda', number: 22, team: 'Red Bull', teamColor: '#3D8BFF', gap: 41.9, interval: 3.679, lastLap: 76.55, bestLap: 75.804, compound: 'HARD', tyreAge: 26, stops: 1, sectors: ['yellow', 'green', 'yellow'], drs: false, pit: false, trend: 'down' }];


export const radioMessages: RadioMessage[] = [
{ id: 'r1', from: 'AI', lap: 43, time: '14:42:08', text: 'Undercut window on NOR opens in 2 laps. Recommend box lap 45 on SOFT — projected net gain +1 position.', sentiment: 'positive' },
{ id: 'r2', from: 'DRIVER', lap: 42, time: '14:41:12', text: 'Rears are going away through turn 12, losing rotation on entry.', sentiment: 'urgent' },
{ id: 'r3', from: 'ENGINEER', lap: 42, time: '14:41:31', text: 'Copy that George. Switch to STRAT 6, diff entry position 4. We have pace in hand.', sentiment: 'calm' },
{ id: 'r4', from: 'AI', lap: 41, time: '14:39:55', text: 'Track evolution +0.34s since lap 30. Grip index now 91.4. Extending stint remains viable.', sentiment: 'calm' },
{ id: 'r5', from: 'DRIVER', lap: 40, time: '14:38:02', text: 'That was a good lap. Balance is much better now.', sentiment: 'positive' },
{ id: 'r6', from: 'ENGINEER', lap: 39, time: '14:36:44', text: 'Leclerc is 1.8 ahead, DRS available next lap. Push on the exit of the tunnel.', sentiment: 'calm' }];


export const controlMessages: ControlMessage[] = [
{ id: 'c1', lap: 43, time: '14:42:20', category: 'DRS', text: 'DRS ENABLED — DETECTION ZONE 1', severity: 'info' },
{ id: 'c2', lap: 42, time: '14:41:02', category: 'INCIDENT', text: 'TURN 6 INCIDENT INVOLVING CAR 10 (GAS) NOTED', severity: 'warning' },
{ id: 'c3', lap: 41, time: '14:39:18', category: 'FLAG', text: 'YELLOW FLAG SECTOR 2 CLEARED — TRACK CLEAR', severity: 'info' },
{ id: 'c4', lap: 40, time: '14:37:51', category: 'PENALTY', text: '5 SECOND TIME PENALTY — CAR 22 (TSU) — TRACK LIMITS', severity: 'critical' },
{ id: 'c5', lap: 38, time: '14:35:07', category: 'CAR', text: 'CAR 27 (HUL) — UNSAFE RELEASE UNDER INVESTIGATION', severity: 'warning' }];


export const strategyOptions: StrategyOption[] = [
{ id: 's1', label: 'UNDERCUT — BOX LAP 45', detail: 'SOFT to flag · 33 lap stint · aggressive out-lap target 75.4', stops: '1 stop remaining', projectedPos: 2, delta: -2.4, confidence: 84, risk: 'medium', recommended: true },
{ id: 's2', label: 'EXTEND — BOX LAP 51', detail: 'HARD to flag · covers Leclerc reaction · SC exposure 22%', stops: '1 stop remaining', projectedPos: 3, delta: 0.8, confidence: 71, risk: 'low' },
{ id: 's3', label: 'OVERCUT — BOX LAP 55', detail: 'SOFT sprint finish · requires clean air lap 46-54', stops: '1 stop remaining', projectedPos: 4, delta: 3.1, confidence: 46, risk: 'high' }];


export const tyres: TyreCorner[] = [
{ label: 'FL', surface: 103, carcass: 91, wear: 42, pressure: 23.1 },
{ label: 'FR', surface: 118, carcass: 99, wear: 58, pressure: 23.4 },
{ label: 'RL', surface: 97, carcass: 88, wear: 37, pressure: 21.2 },
{ label: 'RR', surface: 124, carcass: 104, wear: 66, pressure: 21.6 }];


export const aiInsights = [
{ id: 'a1', title: 'Pit window optimal at lap 45', body: 'Monte Carlo across 12,000 runs: boxing lap 45 yields P2 in 68% of outcomes vs 41% for lap 51.', confidence: 84, tone: 'cyan' as const },
{ id: 'a2', title: 'Rear-left thermal risk rising', body: 'RR surface trending +1.6°C/lap. Degradation cliff projected at lap 49 on current delta.', confidence: 76, tone: 'amber' as const },
{ id: 'a3', title: 'Norris will react within 1 lap', body: 'McLaren pit-crew activity detected on lap 42. Undercut counter-response probability 79%.', confidence: 79, tone: 'orange' as const }];


export const raceEvents = [
{ lap: 1, label: 'LIGHTS OUT', kind: 'start' as const },
{ lap: 12, label: 'VSC — DEBRIS T3', kind: 'vsc' as const },
{ lap: 18, label: 'BOX — MEDIUM', kind: 'pit' as const },
{ lap: 26, label: 'OVERTAKE ON PIA', kind: 'gain' as const },
{ lap: 34, label: 'FASTEST S1', kind: 'purple' as const },
{ lap: 43, label: 'CURRENT', kind: 'now' as const },
{ lap: 45, label: 'PIT WINDOW', kind: 'window' as const },
{ lap: 78, label: 'CHEQUERED', kind: 'end' as const }];


export const stints = [
{ compound: 'SOFT', from: 1, to: 18, color: '#E10600' },
{ compound: 'MEDIUM', from: 18, to: 43, color: '#FFC531' },
{ compound: 'PROJECTED SOFT', from: 45, to: 78, color: '#00E5FF' }];