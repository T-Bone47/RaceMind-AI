export interface GameTitle {
  id: string;
  name: string;
  short: string;
  season: string;
  circuits: number;
  status: 'connected' | 'available' | 'legacy';
  accent: string;
  build: string;
}

export const games: GameTitle[] = [
{ id: 'f126', name: 'EA SPORTS F1 26', short: 'F1 26', season: '2026', circuits: 26, status: 'connected', accent: '#00E5FF', build: '1.04 · live telemetry' },
{ id: 'f125', name: 'EA SPORTS F1 25', short: 'F1 25', season: '2025', circuits: 25, status: 'connected', accent: '#00D68F', build: '1.19 · UDP linked' },
{ id: 'f124', name: 'EA SPORTS F1 24', short: 'F1 24', season: '2024', circuits: 24, status: 'available', accent: '#B15CFF', build: '1.22 · archive' },
{ id: 'f123', name: 'EA SPORTS F1 23', short: 'F1 23', season: '2023', circuits: 23, status: 'available', accent: '#FFC531', build: '1.16 · archive' },
{ id: 'f122', name: 'EA SPORTS F1 22', short: 'F1 22', season: '2022', circuits: 22, status: 'legacy', accent: '#8E99A8', build: '1.18 · read only' }];


export interface Circuit {
  id: string;
  name: string;
  country: string;
  code: string;
  downforce: 'Low' | 'Medium' | 'High' | 'Maximum';
  brakeDemand: number;
  tyreStress: number;
  avgSpeed: number;
  laps: number;
  lengthKm: number;
  drsZones: number;
  weather: 'Clear' | 'Hot' | 'Overcast' | 'Night' | 'Humid' | 'Rain risk';
  path: string;
  zones: {t: number;kind: 'speed' | 'brake' | 'traction' | 'drs';label: string;}[];
  aero: [number, number];
  note: string;
}

export const circuits: Circuit[] = [
{
  id: 'bhr', name: 'Bahrain International', country: 'Bahrain', code: 'BHR', downforce: 'Medium', brakeDemand: 88, tyreStress: 82, avgSpeed: 213, laps: 57, lengthKm: 5.412, drsZones: 3, weather: 'Night',
  path: 'M24 78 C 18 52, 34 26, 62 24 C 92 22, 104 44, 132 44 C 158 44, 166 24, 182 32 C 196 39, 190 60, 168 66 C 146 72, 132 62, 112 70 C 88 80, 74 98, 50 96 C 32 95, 27 90, 24 78 Z',
  zones: [{ t: 0.08, kind: 'brake', label: 'T1 heavy braking' }, { t: 0.3, kind: 'traction', label: 'T4 traction' }, { t: 0.52, kind: 'brake', label: 'T10 late brake' }, { t: 0.78, kind: 'drs', label: 'DRS main straight' }],
  aero: [7, 9], note: 'Rear-limited traction circuit. Long stints punish rear degradation more than any other round.'
},
{
  id: 'jed', name: 'Jeddah Corniche', country: 'Saudi Arabia', code: 'JED', downforce: 'Low', brakeDemand: 64, tyreStress: 71, avgSpeed: 252, laps: 50, lengthKm: 6.174, drsZones: 3, weather: 'Night',
  path: 'M20 96 C 16 60, 30 30, 56 22 C 78 15, 92 34, 116 30 C 140 26, 148 8, 170 14 C 190 20, 192 44, 176 54 C 158 65, 140 54, 124 66 C 106 79, 108 98, 84 102 C 56 107, 24 110, 20 96 Z',
  zones: [{ t: 0.12, kind: 'speed', label: 'T4-6 flat sequence' }, { t: 0.44, kind: 'speed', label: 'T22-23 commitment' }, { t: 0.7, kind: 'brake', label: 'T27 braking' }, { t: 0.9, kind: 'drs', label: 'DRS to the line' }],
  aero: [4, 5], note: 'Lowest total downforce of the calendar. Stability through blind high-speed walls is worth more than peak grip.'
},
{
  id: 'aus', name: 'Albert Park', country: 'Australia', code: 'AUS', downforce: 'Medium', brakeDemand: 72, tyreStress: 66, avgSpeed: 232, laps: 58, lengthKm: 5.278, drsZones: 4, weather: 'Clear',
  path: 'M26 68 C 22 40, 44 20, 74 24 C 100 27, 108 46, 134 42 C 158 38, 172 22, 186 34 C 198 45, 184 64, 162 70 C 140 76, 120 68, 100 78 C 78 89, 62 100, 42 94 C 28 90, 27 80, 26 68 Z',
  zones: [{ t: 0.16, kind: 'speed', label: 'T9-10 flowing' }, { t: 0.4, kind: 'brake', label: 'T11 heavy' }, { t: 0.64, kind: 'traction', label: 'T13 exit' }, { t: 0.86, kind: 'drs', label: 'DRS zone 4' }],
  aero: [8, 10], note: 'Kerb-heavy street-park hybrid. Compliance over kerbs matters more than raw stiffness.'
},
{
  id: 'suz', name: 'Suzuka', country: 'Japan', code: 'SUZ', downforce: 'High', brakeDemand: 61, tyreStress: 94, avgSpeed: 228, laps: 53, lengthKm: 5.807, drsZones: 1, weather: 'Overcast',
  path: 'M22 74 C 20 46, 40 22, 68 26 C 90 29, 96 48, 118 50 C 140 52, 152 34, 172 40 C 190 46, 192 68, 172 76 C 152 84, 132 74, 112 82 C 90 91, 76 104, 52 98 C 30 92, 23 88, 22 74 Z',
  zones: [{ t: 0.1, kind: 'speed', label: 'Esses S1-2' }, { t: 0.34, kind: 'speed', label: 'Degner' }, { t: 0.58, kind: 'brake', label: 'Hairpin' }, { t: 0.82, kind: 'speed', label: '130R' }],
  aero: [9, 8], note: 'Highest lateral tyre energy on the calendar. Front camber and ARB balance define the esses.'
},
{
  id: 'mon', name: 'Circuit de Monaco', country: 'Monaco', code: 'MON', downforce: 'Maximum', brakeDemand: 79, tyreStress: 42, avgSpeed: 158, laps: 78, lengthKm: 3.337, drsZones: 1, weather: 'Clear',
  path: 'M28 88 C 20 62, 32 34, 58 28 C 82 22, 92 42, 114 40 C 136 38, 144 20, 166 26 C 186 32, 188 52, 170 62 C 152 72, 136 62, 120 74 C 102 88, 96 100, 72 100 C 46 100, 32 98, 28 88 Z',
  zones: [{ t: 0.14, kind: 'traction', label: 'Ste Dévote exit' }, { t: 0.38, kind: 'brake', label: 'Mirabeau' }, { t: 0.62, kind: 'traction', label: 'Portier to tunnel' }, { t: 0.9, kind: 'brake', label: 'Rascasse' }],
  aero: [10, 11], note: 'Maximum downforce, softest possible platform. Mechanical grip and kerb compliance outrank every other factor.'
},
{
  id: 'sil', name: 'Silverstone', country: 'Great Britain', code: 'SIL', downforce: 'High', brakeDemand: 58, tyreStress: 91, avgSpeed: 244, laps: 52, lengthKm: 5.891, drsZones: 2, weather: 'Rain risk',
  path: 'M24 70 C 24 42, 46 20, 76 24 C 102 28, 110 48, 136 46 C 160 44, 176 26, 188 38 C 198 49, 182 66, 160 72 C 138 78, 118 70, 98 80 C 76 91, 58 100, 40 92 C 27 86, 24 80, 24 70 Z',
  zones: [{ t: 0.12, kind: 'speed', label: 'Maggotts-Becketts' }, { t: 0.36, kind: 'speed', label: 'Copse' }, { t: 0.6, kind: 'brake', label: 'Stowe' }, { t: 0.84, kind: 'drs', label: 'Hangar straight' }],
  aero: [9, 9], note: 'Sustained high-speed load. Front-left tyre energy is the limiting factor across a long stint.'
},
{
  id: 'spa', name: 'Spa-Francorchamps', country: 'Belgium', code: 'SPA', downforce: 'Low', brakeDemand: 66, tyreStress: 88, avgSpeed: 236, laps: 44, lengthKm: 7.004, drsZones: 2, weather: 'Rain risk',
  path: 'M20 84 C 16 54, 34 24, 62 20 C 88 16, 100 38, 126 36 C 150 34, 164 16, 182 26 C 198 35, 194 58, 174 66 C 154 74, 136 64, 118 74 C 98 85, 92 102, 66 104 C 38 106, 22 100, 20 84 Z',
  zones: [{ t: 0.1, kind: 'traction', label: 'La Source exit' }, { t: 0.22, kind: 'speed', label: 'Eau Rouge' }, { t: 0.56, kind: 'brake', label: 'Les Combes' }, { t: 0.88, kind: 'drs', label: 'Kemmel DRS' }],
  aero: [5, 6], note: 'Compromise circuit. Sector 1 rewards low drag, sector 2 punishes anything under-winged.'
},
{
  id: 'mnz', name: 'Monza', country: 'Italy', code: 'MNZ', downforce: 'Low', brakeDemand: 92, tyreStress: 58, avgSpeed: 264, laps: 53, lengthKm: 5.793, drsZones: 2, weather: 'Hot',
  path: 'M22 92 C 18 58, 26 26, 52 20 C 76 15, 94 30, 120 28 C 146 26, 160 12, 178 20 C 194 27, 196 50, 178 60 C 160 70, 142 60, 126 70 C 108 82, 108 100, 82 104 C 52 108, 24 108, 22 92 Z',
  zones: [{ t: 0.08, kind: 'brake', label: 'T1 chicane' }, { t: 0.3, kind: 'brake', label: 'Roggia' }, { t: 0.58, kind: 'speed', label: 'Lesmo' }, { t: 0.86, kind: 'drs', label: 'Main straight DRS' }],
  aero: [2, 3], note: 'Minimum drag. Brake temperature management through the chicanes decides the race.'
},
{
  id: 'sin', name: 'Marina Bay', country: 'Singapore', code: 'SIN', downforce: 'Maximum', brakeDemand: 86, tyreStress: 74, avgSpeed: 174, laps: 62, lengthKm: 4.940, drsZones: 3, weather: 'Humid',
  path: 'M26 82 C 22 54, 36 28, 62 24 C 86 20, 96 42, 120 42 C 144 42, 154 24, 174 30 C 192 36, 192 58, 172 66 C 152 74, 134 64, 116 76 C 96 90, 90 102, 66 102 C 42 102, 28 96, 26 82 Z',
  zones: [{ t: 0.16, kind: 'traction', label: 'T5 exit' }, { t: 0.42, kind: 'brake', label: 'T7 heavy' }, { t: 0.66, kind: 'traction', label: 'T14 exit' }, { t: 0.9, kind: 'brake', label: 'T16 final' }],
  aero: [10, 10], note: 'Longest race duration. Cooling, brake wear and driver load all sit at the limit under humidity.'
},
{
  id: 'lvg', name: 'Las Vegas Strip', country: 'United States', code: 'LVG', downforce: 'Low', brakeDemand: 84, tyreStress: 46, avgSpeed: 248, laps: 50, lengthKm: 6.201, drsZones: 2, weather: 'Night',
  path: 'M20 88 C 18 58, 28 30, 54 24 C 80 18, 96 36, 122 34 C 148 32, 162 16, 180 24 C 196 31, 196 54, 176 62 C 156 70, 138 62, 120 72 C 100 84, 98 100, 74 104 C 46 108, 22 104, 20 88 Z',
  zones: [{ t: 0.12, kind: 'brake', label: 'T5 braking' }, { t: 0.46, kind: 'speed', label: 'Strip flat out' }, { t: 0.72, kind: 'brake', label: 'T14 heavy' }, { t: 0.92, kind: 'drs', label: 'DRS to T14' }],
  aero: [3, 4], note: 'Cold track surface. Getting tyres into the window on an out-lap is the entire challenge.'
},
{
  id: 'abu', name: 'Yas Marina', country: 'Abu Dhabi', code: 'ABU', downforce: 'Medium', brakeDemand: 76, tyreStress: 62, avgSpeed: 214, laps: 58, lengthKm: 5.281, drsZones: 2, weather: 'Night',
  path: 'M24 76 C 22 48, 42 24, 70 26 C 94 28, 104 46, 128 44 C 152 42, 168 26, 184 36 C 198 45, 186 64, 164 70 C 142 76, 122 68, 102 78 C 80 89, 64 100, 44 94 C 28 89, 25 86, 24 76 Z',
  zones: [{ t: 0.14, kind: 'brake', label: 'T5 braking' }, { t: 0.4, kind: 'traction', label: 'T9 exit' }, { t: 0.68, kind: 'speed', label: 'T12-13' }, { t: 0.88, kind: 'drs', label: 'DRS back straight' }],
  aero: [7, 8], note: 'Balanced circuit used as the setup baseline. Track temperature drops sharply after sunset.'
}];


export const sessionTypes = [
'Practice', 'Qualifying', 'Sprint', 'Race', 'Time Trial', 'Wet Setup', 'Dry Setup', 'Career Mode', 'League Racing', 'Esports', 'Custom Setup'] as
const;
export type SessionKind = (typeof sessionTypes)[number];

export const weatherOptions = ['Dry', 'Light rain', 'Heavy rain', 'Hot', 'Cold'] as const;
export type WeatherKind = (typeof weatherOptions)[number];

export interface SetupValues {
  frontWing: number;
  rearWing: number;
  onThrottleDiff: number;
  offThrottleDiff: number;
  engineBraking: number;
  frontCamber: number;
  rearCamber: number;
  frontToe: number;
  rearToe: number;
  frontSuspension: number;
  rearSuspension: number;
  frontARB: number;
  rearARB: number;
  frontRideHeight: number;
  rearRideHeight: number;
  brakePressure: number;
  brakeBias: number;
  pressureFL: number;
  pressureFR: number;
  pressureRL: number;
  pressureRR: number;
}

export interface ParamSpec {
  key: keyof SetupValues;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint: string;
}

export const paramGroups: {id: string;title: string;accent: string;hint: string;params: ParamSpec[];}[] = [
{
  id: 'aero',
  title: 'Aerodynamics',
  accent: '#00E5FF',
  hint: 'Wing levels set drag versus downforce and shift aero balance',
  params: [
  { key: 'frontWing', label: 'Front wing aero', min: 0, max: 50, step: 1, hint: 'Higher adds front grip and understeer resistance' },
  { key: 'rearWing', label: 'Rear wing aero', min: 0, max: 50, step: 1, hint: 'Higher adds rear stability at the cost of top speed' }]

},
{
  id: 'transmission',
  title: 'Transmission',
  accent: '#00D68F',
  hint: 'Differential locking and engine braking define corner entry and exit',
  params: [
  { key: 'onThrottleDiff', label: 'On-throttle differential', min: 50, max: 100, step: 1, unit: '%', hint: 'Lower frees rotation on exit, higher adds traction' },
  { key: 'offThrottleDiff', label: 'Off-throttle differential', min: 50, max: 100, step: 1, unit: '%', hint: 'Higher stabilises the rear under braking' },
  { key: 'engineBraking', label: 'Engine braking', min: 0, max: 100, step: 5, unit: '%', hint: 'More engine braking slows the car but loads the rear axle' }]

},
{
  id: 'geometry',
  title: 'Suspension Geometry',
  accent: '#B15CFF',
  hint: 'Camber and toe trade peak grip against tyre temperature and drag',
  params: [
  { key: 'frontCamber', label: 'Front camber', min: -3.5, max: -2.5, step: 0.1, unit: '°', hint: 'More negative increases cornering grip and front tyre wear' },
  { key: 'rearCamber', label: 'Rear camber', min: -2.0, max: -1.0, step: 0.1, unit: '°', hint: 'More negative helps rotation but hurts traction' },
  { key: 'frontToe', label: 'Front toe-out', min: 0, max: 0.2, step: 0.01, unit: '°', hint: 'More toe-out sharpens turn-in and raises drag' },
  { key: 'rearToe', label: 'Rear toe-in', min: 0, max: 0.5, step: 0.01, unit: '°', hint: 'More toe-in stabilises the rear and heats tyres' }]

},
{
  id: 'suspension',
  title: 'Suspension',
  accent: '#FFC531',
  hint: 'Spring rates, roll bars and ride height set the mechanical platform',
  params: [
  { key: 'frontSuspension', label: 'Front suspension', min: 1, max: 41, step: 1, hint: 'Stiffer improves response, softer improves kerb compliance' },
  { key: 'rearSuspension', label: 'Rear suspension', min: 1, max: 41, step: 1, hint: 'Softer rear improves traction out of slow corners' },
  { key: 'frontARB', label: 'Front anti-roll bar', min: 1, max: 21, step: 1, hint: 'Stiffer front adds understeer and stability' },
  { key: 'rearARB', label: 'Rear anti-roll bar', min: 1, max: 21, step: 1, hint: 'Stiffer rear adds rotation and oversteer' },
  { key: 'frontRideHeight', label: 'Front ride height', min: 20, max: 50, step: 1, unit: 'mm', hint: 'Lower increases downforce but risks bottoming' },
  { key: 'rearRideHeight', label: 'Rear ride height', min: 20, max: 50, step: 1, unit: 'mm', hint: 'Rake angle drives total aero load' }]

},
{
  id: 'brakes',
  title: 'Brakes',
  accent: '#E10600',
  hint: 'Pressure and bias control stopping power and lock-up risk',
  params: [
  { key: 'brakePressure', label: 'Brake pressure', min: 80, max: 100, step: 1, unit: '%', hint: 'Higher stops harder but locks more easily' },
  { key: 'brakeBias', label: 'Brake bias', min: 50, max: 70, step: 0.5, unit: '% F', hint: 'Forward bias stabilises entry, rearward frees rotation' }]

},
{
  id: 'tyres',
  title: 'Tyre Pressures',
  accent: '#FF7A29',
  hint: 'Pressure sets contact patch, working range and degradation',
  params: [
  { key: 'pressureFL', label: 'Front left', min: 22, max: 25, step: 0.1, unit: 'psi', hint: 'Lower pressure grows the contact patch' },
  { key: 'pressureFR', label: 'Front right', min: 22, max: 25, step: 0.1, unit: 'psi', hint: 'Match the loaded side to the circuit direction' },
  { key: 'pressureRL', label: 'Rear left', min: 20, max: 23, step: 0.1, unit: 'psi', hint: 'Lower rear pressure improves traction' },
  { key: 'pressureRR', label: 'Rear right', min: 20, max: 23, step: 0.1, unit: 'psi', hint: 'Watch overheating on traction-limited circuits' }]

}];


export const baseSetup: SetupValues = {
  frontWing: 7, rearWing: 9,
  onThrottleDiff: 72, offThrottleDiff: 58, engineBraking: 55,
  frontCamber: -3.0, rearCamber: -1.6, frontToe: 0.06, rearToe: 0.22,
  frontSuspension: 26, rearSuspension: 12, frontARB: 14, rearARB: 6,
  frontRideHeight: 30, rearRideHeight: 44,
  brakePressure: 96, brakeBias: 56.5,
  pressureFL: 23.4, pressureFR: 23.4, pressureRL: 21.6, pressureRR: 21.6
};

export interface SetupSource {
  id: string;
  label: string;
  author: string;
  tag: string;
  color: string;
  values: SetupValues;
}

export const setupSources: SetupSource[] = [
{
  id: 'ai', label: 'AI Recommended', author: 'RaceMind v7.2', tag: 'Generated 4s ago', color: '#00E5FF',
  values: { ...baseSetup, frontWing: 9, rearWing: 11, onThrottleDiff: 68, offThrottleDiff: 54, engineBraking: 50, rearARB: 5, rearSuspension: 9, frontRideHeight: 29, rearRideHeight: 45, brakeBias: 55.5, pressureRL: 21.2, pressureRR: 21.2 }
},
{
  id: 'esports', label: 'Pro Esports', author: 'J. Opmeer replica', tag: 'League verified', color: '#B15CFF',
  values: { ...baseSetup, frontWing: 5, rearWing: 7, onThrottleDiff: 78, offThrottleDiff: 62, engineBraking: 70, frontCamber: -3.3, rearARB: 9, frontSuspension: 33, rearSuspension: 16, brakePressure: 100, brakeBias: 54, pressureFL: 22.8, pressureFR: 22.8 }
},
{
  id: 'friend', label: "Teammate's Setup", author: 'K. Antonelli', tag: 'Shared 2 days ago', color: '#00D68F',
  values: { ...baseSetup, frontWing: 8, rearWing: 12, onThrottleDiff: 75, engineBraking: 60, frontARB: 11, rearARB: 7, rearRideHeight: 46, brakeBias: 57.5 }
},
{
  id: 'community', label: 'Community Top Rated', author: '4,812 upvotes', tag: 'Wheel users', color: '#FFC531',
  values: { ...baseSetup, frontWing: 11, rearWing: 13, onThrottleDiff: 65, offThrottleDiff: 52, frontCamber: -2.8, frontSuspension: 21, rearSuspension: 8, frontARB: 9, brakePressure: 92, pressureFL: 23.8, pressureFR: 23.8 }
}];


export interface SetupDoc {
  id: string;
  name: string;
  kind: 'PDF' | 'XLSX' | 'DOCX' | 'CSV' | 'IMG' | 'TELEMETRY';
  game: string;
  circuit: string;
  session: string;
  weather: string;
  author: string;
  uploaded: string;
  version: string;
  size: string;
  aiStatus: 'parsed' | 'analysing' | 'queued' | 'failed';
  extracted: number;
  summary: string;
}

export const documents: SetupDoc[] = [
{ id: 'd1', name: 'Bahrain_Race_Setup_v4.pdf', kind: 'PDF', game: 'F1 26', circuit: 'Bahrain', session: 'Race', weather: 'Dry', author: 'A. Shovlin', uploaded: '2h ago', version: 'v4.2', size: '1.8 MB', aiStatus: 'parsed', extracted: 21, summary: 'Long-run focused setup with a softer rear platform to protect the rear-left over 18 lap stints.' },
{ id: 'd2', name: 'Monaco_Quali_Reference.xlsx', kind: 'XLSX', game: 'F1 26', circuit: 'Monaco', session: 'Qualifying', weather: 'Dry', author: 'Esports Team', uploaded: 'Yesterday', version: 'v2.0', size: '412 KB', aiStatus: 'parsed', extracted: 21, summary: 'Maximum downforce single-lap configuration. Soft springs, high front wing, aggressive kerb usage.' },
{ id: 'd3', name: 'Wet_Weather_Guide_2026.docx', kind: 'DOCX', game: 'F1 26', circuit: 'All circuits', session: 'Wet Setup', weather: 'Heavy rain', author: 'Performance Group', uploaded: '3 days ago', version: 'v1.1', size: '840 KB', aiStatus: 'analysing', extracted: 14, summary: 'Cross-circuit wet weather principles: raise ride height, soften ARBs, reduce brake pressure by 4%.' },
{ id: 'd4', name: 'Suzuka_Telemetry_Stint.csv', kind: 'CSV', game: 'F1 25', circuit: 'Suzuka', session: 'Practice', weather: 'Overcast', author: 'Telemetry Bot', uploaded: '5 days ago', version: 'v1.0', size: '18 MB', aiStatus: 'parsed', extracted: 8, summary: 'Twenty-two lap long run. Front-left surface temperature exceeded the window after lap nine.' },
{ id: 'd5', name: 'Monza_Lowdrag_Notes.png', kind: 'IMG', game: 'F1 24', circuit: 'Monza', session: 'Race', weather: 'Hot', author: 'Community', uploaded: '1 week ago', version: 'v1.0', size: '2.4 MB', aiStatus: 'queued', extracted: 0, summary: 'Screenshot of a low-drag configuration. Awaiting optical value extraction.' },
{ id: 'd6', name: 'Spa_Compromise_Study.pdf', kind: 'PDF', game: 'F1 26', circuit: 'Spa', session: 'League Racing', weather: 'Rain risk', author: 'M. Doyle', uploaded: '2 weeks ago', version: 'v3.1', size: '3.1 MB', aiStatus: 'parsed', extracted: 21, summary: 'Sector-by-sector wing level study concluding that rear wing 6 is the optimum compromise.' }];


export const assistantMessages = [
{ id: 'a1', role: 'system' as const, text: 'Parsed Bahrain_Race_Setup_v4.pdf — 21 of 21 setup values extracted with 96% confidence.' },
{ id: 'a2', role: 'ai' as const, text: 'This document runs rear wing 9 with a soft rear suspension of 12. The intent is clear: protect the rear-left through the long right-hand loads at turns 11 and 12 rather than chase single-lap pace.' },
{ id: 'a3', role: 'user' as const, text: 'Adapt it for a controller player on a wet track.' },
{ id: 'a4', role: 'ai' as const, text: 'Three changes. Raise both ride heights by 4 mm for standing water clearance, soften the rear ARB from 6 to 3 so throttle inputs are less spiky on a pad, and drop brake pressure to 90% to cut lock-ups without traction control.' }];


export const adaptOptions = [
{ id: 'wheel', label: 'Wheel', group: 'Input' },
{ id: 'pad', label: 'Controller', group: 'Input' },
{ id: 'smooth', label: 'Smooth', group: 'Style' },
{ id: 'aggressive', label: 'Aggressive', group: 'Style' },
{ id: 'rookie', label: 'Rookie', group: 'Skill' },
{ id: 'pro', label: 'Professional', group: 'Skill' }];