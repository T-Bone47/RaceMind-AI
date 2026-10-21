export interface SettingsState {
  // Profile
  driver: string;
  engineer: string;
  team: string;
  units: 'Metric' | 'Imperial';
  timeFormat: '24h' | '12h';
  // Intelligence
  autonomy: 'advisory' | 'assisted' | 'autonomous';
  confidenceGate: number;
  reasoningDepth: number;
  proactiveAlerts: boolean;
  monteCarloRuns: 6000 | 12000 | 24000;
  voicePersona: 'Calm' | 'Direct' | 'Analytical';
  wakeWord: boolean;
  verbosity: number;
  // Interface
  accent: string;
  density: 'comfortable' | 'compact' | 'dense';
  motion: boolean;
  glass: boolean;
  gridOverlay: boolean;
  fontScale: number;
  colourBlind: 'off' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  highContrast: boolean;
  // Telemetry
  sampleRate: 100 | 280 | 500;
  referenceLap: 'best' | 'previous' | 'teammate';
  autoScrub: boolean;
  channelSmoothing: number;
  // Notifications
  notifyStrategy: boolean;
  notifyReliability: boolean;
  notifyWeather: boolean;
  notifyRadio: boolean;
  quietPractice: boolean;
}

export const defaultSettings: SettingsState = {
  driver: 'George Russell',
  engineer: 'Andrew Shovlin',
  team: 'Mercedes-AMG PETRONAS',
  units: 'Metric',
  timeFormat: '24h',
  autonomy: 'assisted',
  confidenceGate: 80,
  reasoningDepth: 3,
  proactiveAlerts: true,
  monteCarloRuns: 12000,
  voicePersona: 'Calm',
  wakeWord: true,
  verbosity: 62,
  accent: '#00E5FF',
  density: 'comfortable',
  motion: true,
  glass: true,
  gridOverlay: true,
  fontScale: 100,
  colourBlind: 'off',
  highContrast: false,
  sampleRate: 280,
  referenceLap: 'best',
  autoScrub: true,
  channelSmoothing: 24,
  notifyStrategy: true,
  notifyReliability: true,
  notifyWeather: true,
  notifyRadio: false,
  quietPractice: false
};

export const accentOptions = [
{ value: '#00E5FF', label: 'Cyan' },
{ value: '#E10600', label: 'Race red' },
{ value: '#00D68F', label: 'Emerald' },
{ value: '#B15CFF', label: 'Violet' },
{ value: '#FFC531', label: 'Amber' },
{ value: '#3D8BFF', label: 'Electric blue' }];


export const integrations = [
{ name: 'FIA Live Timing', detail: 'Official timing & scoring feed', status: 'connected' as const, latency: '12 ms' },
{ name: 'Pirelli Tyre API', detail: 'Compound allocation & thermal models', status: 'connected' as const, latency: '84 ms' },
{ name: 'Meteo Nowcast', detail: 'Doppler radar · 6 km radius', status: 'connected' as const, latency: '204 ms' },
{ name: 'Brackley Simulator', detail: 'Driver-in-loop correlation bridge', status: 'syncing' as const, latency: '1.2 s' },
{ name: 'Team Radio Gateway', detail: 'Encrypted channel 63', status: 'connected' as const, latency: '31 ms' },
{ name: 'Wind Tunnel Archive', detail: 'Aero correlation datasets', status: 'disconnected' as const, latency: '—' }];


export const shortcuts = [
{ keys: ['⌘', 'K'], action: 'Open command palette' },
{ keys: ['G', 'D'], action: 'Go to dashboard' },
{ keys: ['G', 'T'], action: 'Go to live telemetry' },
{ keys: ['G', 'S'], action: 'Go to race strategy' },
{ keys: ['Space'], action: 'Play / pause telemetry replay' },
{ keys: ['←', '→'], action: 'Step the playhead one sample' },
{ keys: ['B'], action: 'Arm the pit window' },
{ keys: ['R'], action: 'Push to talk on team radio' },
{ keys: ['⇧', 'C'], action: 'Commit the active strategy call' },
{ keys: ['?'], action: 'Show this shortcut sheet' }];


export const sections = [
{ id: 'profile', label: 'Profile & Team', hint: 'Identity, units, session defaults' },
{ id: 'intelligence', label: 'AI & Voice', hint: 'Autonomy, reasoning, persona' },
{ id: 'interface', label: 'Interface', hint: 'Appearance, motion, accessibility' },
{ id: 'system', label: 'Data & System', hint: 'Telemetry, alerts, integrations' }] as
const;

export type SectionId = (typeof sections)[number]['id'];