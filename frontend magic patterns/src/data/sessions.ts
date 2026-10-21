export type SessionType = 'RACE' | 'QUALI' | 'SPRINT' | 'FP' | 'TEST' | 'SIM';

export interface SessionRecord {
  id: string;
  event: string;
  circuit: string;
  country: string;
  type: SessionType;
  date: string;
  laps: number;
  bestLap: number;
  avgLap: number;
  position: number;
  compoundsUsed: string[];
  distanceKm: number;
  sizeGb: number;
  conditions: 'Dry' | 'Damp' | 'Wet';
  rating: number;
  bookmarked: boolean;
  note: string;
}

export const typeColor: Record<SessionType, string> = {
  RACE: '#E10600',
  QUALI: '#B15CFF',
  SPRINT: '#FF7A29',
  FP: '#00E5FF',
  TEST: '#00D68F',
  SIM: '#8E99A8'
};

export const sessions: SessionRecord[] = [
{ id: 's01', event: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', country: 'MC', type: 'RACE', date: '2032-05-23', laps: 78, bestLap: 74.983, avgLap: 76.412, position: 3, compoundsUsed: ['SOFT', 'MEDIUM'], distanceKm: 260.3, sizeGb: 14.2, conditions: 'Dry', rating: 4, bookmarked: true, note: 'Undercut on Norris executed lap 45. Rear-left thermal management was the defining factor.' },
{ id: 's02', event: 'Monaco Qualifying', circuit: 'Circuit de Monaco', country: 'MC', type: 'QUALI', date: '2032-05-22', laps: 24, bestLap: 71.104, avgLap: 73.882, position: 2, compoundsUsed: ['SOFT'], distanceKm: 80.1, sizeGb: 6.8, conditions: 'Dry', rating: 5, bookmarked: true, note: 'Q3 lap was the strongest of the season — 0.31s clear of the teammate benchmark.' },
{ id: 's03', event: 'Monaco Practice 3', circuit: 'Circuit de Monaco', country: 'MC', type: 'FP', date: '2032-05-22', laps: 31, bestLap: 72.441, avgLap: 75.02, position: 4, compoundsUsed: ['MEDIUM', 'SOFT'], distanceKm: 103.4, sizeGb: 8.1, conditions: 'Dry', rating: 3, bookmarked: false, note: 'Front-wing flap adjustment validated. Balance moved 0.4% forward.' },
{ id: 's04', event: 'Monaco Practice 2', circuit: 'Circuit de Monaco', country: 'MC', type: 'FP', date: '2032-05-21', laps: 44, bestLap: 73.118, avgLap: 76.334, position: 6, compoundsUsed: ['HARD', 'MEDIUM'], distanceKm: 146.8, sizeGb: 11.4, conditions: 'Damp', rating: 3, bookmarked: false, note: 'Long run compromised by a damp track in the first thirty minutes.' },
{ id: 's05', event: 'Emilia-Romagna Grand Prix', circuit: 'Imola', country: 'IT', type: 'RACE', date: '2032-05-09', laps: 63, bestLap: 78.204, avgLap: 79.881, position: 2, compoundsUsed: ['MEDIUM', 'HARD'], distanceKm: 309.0, sizeGb: 16.9, conditions: 'Dry', rating: 5, bookmarked: true, note: 'Safety car decision on lap 34 converted P4 into P2. Reference race for the strategy model.' },
{ id: 's06', event: 'Imola Qualifying', circuit: 'Imola', country: 'IT', type: 'QUALI', date: '2032-05-08', laps: 19, bestLap: 74.902, avgLap: 76.55, position: 4, compoundsUsed: ['SOFT'], distanceKm: 93.2, sizeGb: 5.9, conditions: 'Dry', rating: 3, bookmarked: false, note: 'Traffic in Q2 cost an estimated two grid positions.' },
{ id: 's07', event: 'Miami Grand Prix', circuit: 'Miami International', country: 'US', type: 'RACE', date: '2032-04-25', laps: 41, bestLap: 88.412, avgLap: 90.114, position: 18, compoundsUsed: ['MEDIUM', 'HARD'], distanceKm: 222.1, sizeGb: 12.1, conditions: 'Dry', rating: 1, bookmarked: false, note: 'Retired lap 41 with a hydraulic pressure loss. Full failure trace archived.' },
{ id: 's08', event: 'Miami Sprint', circuit: 'Miami International', country: 'US', type: 'SPRINT', date: '2032-04-24', laps: 19, bestLap: 89.004, avgLap: 90.442, position: 5, compoundsUsed: ['MEDIUM'], distanceKm: 102.9, sizeGb: 5.2, conditions: 'Dry', rating: 3, bookmarked: false, note: 'Energy deployment map D2 trialled — 0.08s per lap slower than D3.' },
{ id: 's09', event: 'Chinese Grand Prix', circuit: 'Shanghai', country: 'CN', type: 'RACE', date: '2032-04-11', laps: 56, bestLap: 94.201, avgLap: 96.007, position: 5, compoundsUsed: ['SOFT', 'MEDIUM', 'HARD'], distanceKm: 305.1, sizeGb: 17.4, conditions: 'Wet', rating: 4, bookmarked: true, note: 'Wet-to-dry crossover called two laps early. Driver wet pace was outstanding.' },
{ id: 's10', event: 'Japanese Grand Prix', circuit: 'Suzuka', country: 'JP', type: 'RACE', date: '2032-03-28', laps: 53, bestLap: 91.884, avgLap: 93.442, position: 1, compoundsUsed: ['MEDIUM', 'HARD'], distanceKm: 307.5, sizeGb: 18.2, conditions: 'Dry', rating: 5, bookmarked: true, note: 'Season-defining victory. Two-stop offset beat the field by eleven seconds.' },
{ id: 's11', event: 'Suzuka Qualifying', circuit: 'Suzuka', country: 'JP', type: 'QUALI', date: '2032-03-27', laps: 21, bestLap: 87.114, avgLap: 89.331, position: 1, compoundsUsed: ['SOFT'], distanceKm: 121.4, sizeGb: 6.4, conditions: 'Dry', rating: 5, bookmarked: false, note: 'Pole position by 0.114s. Sector 1 was the fastest recorded all weekend.' },
{ id: 's12', event: 'Barcelona Aero Test', circuit: 'Circuit de Barcelona', country: 'ES', type: 'TEST', date: '2032-02-19', laps: 118, bestLap: 78.442, avgLap: 82.11, position: 0, compoundsUsed: ['HARD', 'MEDIUM'], distanceKm: 549.7, sizeGb: 41.8, conditions: 'Dry', rating: 4, bookmarked: false, note: 'Floor edge correlation run. Wind-tunnel to track delta closed to 1.8%.' },
{ id: 's13', event: 'Bahrain Pre-Season Test', circuit: 'Bahrain International', country: 'BH', type: 'TEST', date: '2032-02-08', laps: 141, bestLap: 92.008, avgLap: 96.884, position: 0, compoundsUsed: ['SOFT', 'MEDIUM', 'HARD'], distanceKm: 763.2, sizeGb: 52.6, conditions: 'Dry', rating: 4, bookmarked: false, note: 'Baseline tyre degradation model rebuilt from this dataset.' },
{ id: 's14', event: 'Monaco Simulator Block', circuit: 'Brackley Simulator', country: 'GB', type: 'SIM', date: '2032-05-19', laps: 96, bestLap: 71.884, avgLap: 74.002, position: 0, compoundsUsed: ['SOFT', 'MEDIUM'], distanceKm: 320.4, sizeGb: 9.8, conditions: 'Dry', rating: 3, bookmarked: false, note: 'Traction limitation at T10 identified here before the race weekend.' }];


export const artifacts = [
{ label: 'Telemetry package', format: 'MAT · 280 Hz', size: '8.4 GB' },
{ label: 'Timing & scoring', format: 'CSV', size: '18 MB' },
{ label: 'Team radio archive', format: 'FLAC', size: '412 MB' },
{ label: 'Strategy log', format: 'JSON', size: '9 MB' },
{ label: 'Onboard video', format: 'MP4 · 4K', size: '5.1 GB' },
{ label: 'Engineer report', format: 'PDF', size: '2 MB' }];


export const archive = {
  totalSessions: 214,
  totalHours: 486,
  storageUsedTb: 3.8,
  storageCapTb: 6,
  retentionDays: 730
};