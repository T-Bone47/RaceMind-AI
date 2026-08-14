export type Compound = 'SOFT' | 'MEDIUM' | 'HARD';
export type Neutralisation = 'none' | 'vsc' | 'sc';

export interface SimInputs {
  pitLap: number;
  compound: Compound;
  neutralisation: Neutralisation;
  rain: number;
  aggression: number;
}

export const compoundSpec: Record<Compound, {color: string;pace: number;life: number;warmup: number;}> = {
  SOFT: { color: '#E10600', pace: -0.42, life: 26, warmup: 0.9 },
  MEDIUM: { color: '#FFC531', pace: 0, life: 34, warmup: 0.5 },
  HARD: { color: '#F3F7FB', pace: 0.36, life: 44, warmup: 0.2 }
};

export const opponents = [
{
  code: 'VER',
  name: 'Verstappen',
  color: '#3D8BFF',
  pos: 1,
  stops: 1,
  current: 'HARD · 21 laps',
  predictedBox: 56,
  intent: 'Track position hold',
  threat: 24
},
{
  code: 'LEC',
  name: 'Leclerc',
  color: '#E10600',
  pos: 2,
  stops: 1,
  current: 'MEDIUM · 16 laps',
  predictedBox: 48,
  intent: 'Cover Mercedes',
  threat: 61
},
{
  code: 'NOR',
  name: 'Norris',
  color: '#FF7A29',
  pos: 4,
  stops: 2,
  current: 'SOFT · 6 laps',
  predictedBox: 44,
  intent: 'Aggressive undercut',
  threat: 88
},
{
  code: 'PIA',
  name: 'Piastri',
  color: '#FF7A29',
  pos: 6,
  stops: 1,
  current: 'MEDIUM · 19 laps',
  predictedBox: 52,
  intent: 'Offset for clean air',
  threat: 32
}];


export const crew = [
{ role: 'Jack front', status: 'ready' as const, name: 'M. Doyle' },
{ role: 'Jack rear', status: 'ready' as const, name: 'T. Brandt' },
{ role: 'FL gun', status: 'ready' as const, name: 'K. Osei' },
{ role: 'FR gun', status: 'warming' as const, name: 'S. Novak' },
{ role: 'RL gun', status: 'ready' as const, name: 'D. Iyer' },
{ role: 'RR gun', status: 'ready' as const, name: 'J. Ferrer' },
{ role: 'Stabiliser', status: 'ready' as const, name: 'A. Lindqvist' },
{ role: 'Lollipop', status: 'ready' as const, name: 'R. Okafor' }];


export const stopBreakdown = [
{ label: 'Approach', seconds: 2.4, color: '#3D8BFF' },
{ label: 'Stationary', seconds: 2.3, color: '#00E5FF' },
{ label: 'Release', seconds: 1.1, color: '#00D68F' },
{ label: 'Pit exit', seconds: 13.8, color: '#8E99A8' }];


export const branches = [
{
  id: 'b1',
  trigger: 'No neutralisation',
  probability: 47,
  color: '#8E99A8',
  outcome: 'P3 · +0.0s',
  action: 'Execute planned stop'
},
{
  id: 'b2',
  trigger: 'VSC deployed L44–L50',
  probability: 22,
  color: '#FFC531',
  outcome: 'P2 · −6.1s',
  action: 'Box immediately, cheap stop'
},
{
  id: 'b3',
  trigger: 'Safety Car deployed',
  probability: 24,
  color: '#FF7A29',
  outcome: 'P2 · −11.4s',
  action: 'Double stack behind leader'
},
{
  id: 'b4',
  trigger: 'Rain intensity > 0.4 mm',
  probability: 7,
  color: '#3D8BFF',
  outcome: 'P5 · +9.8s',
  action: 'Switch to intermediates'
}];


export const raceTrace = {
  laps: Array.from({ length: 36 }, (_, i) => 43 + i),
  cars: [
  { code: 'RUS', color: '#00E5FF', width: 2.2 },
  { code: 'LEC', color: '#E10600', width: 1.4 },
  { code: 'NOR', color: '#FF7A29', width: 1.4 },
  { code: 'VER', color: '#3D8BFF', width: 1.4 }]

};