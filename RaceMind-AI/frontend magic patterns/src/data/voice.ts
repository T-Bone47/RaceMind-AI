export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface Turn {
  id: string;
  speaker: 'DRIVER' | 'AI' | 'ENGINEER';
  time: string;
  lap: number;
  text: string;
  latency?: number;
  confidence?: number;
  actions?: string[];
}

export const conversation: Turn[] = [
{
  id: 't1',
  speaker: 'DRIVER',
  lap: 41,
  time: '14:39:02',
  text: 'The rears are giving up through the swimming pool section. I have no rotation on entry.'
},
{
  id: 't2',
  speaker: 'AI',
  lap: 41,
  time: '14:39:03',
  latency: 0.41,
  confidence: 91,
  text: 'Copy. Rear-left surface is 6°C above target and slip is up 1.4%. Move diff entry to position 4 and shift brake bias 0.5 forward — that should restore rotation without costing traction on exit.',
  actions: ['Apply diff position 4', 'Brake bias +0.5 front']
},
{
  id: 't3',
  speaker: 'ENGINEER',
  lap: 42,
  time: '14:41:31',
  text: 'George, diff entry four, bias plus zero-five. Confirm when you have it.'
},
{
  id: 't4',
  speaker: 'DRIVER',
  lap: 42,
  time: '14:41:44',
  text: 'Confirmed. That feels better already, the car is turning again.'
},
{
  id: 't5',
  speaker: 'AI',
  lap: 43,
  time: '14:42:08',
  latency: 0.38,
  confidence: 84,
  text: 'Balance restored — last lap 0.27s quicker in sector two. Undercut window on Norris opens in two laps. Recommend box lap 45 on SOFT for a projected net gain of one position.',
  actions: ['Arm pit window L45', 'Notify pit crew']
}];


export const reasoning = [
{ id: 'r1', label: 'Parsing driver intent', detail: 'Rear grip complaint · corner cluster T13–T16', status: 'done' as const, ms: 62 },
{ id: 'r2', label: 'Cross-referencing telemetry', detail: 'Slip +1.4% · RL surface 124°C · deg 0.09 s/lap', status: 'done' as const, ms: 118 },
{ id: 'r3', label: 'Evaluating setup levers', detail: '7 candidate changes · 3 within driver comfort band', status: 'done' as const, ms: 94 },
{ id: 'r4', label: 'Simulating race outcome', detail: '12,000 Monte Carlo runs · undercut branch dominant', status: 'active' as const, ms: 141 },
{ id: 'r5', label: 'Composing recommendation', detail: 'Confidence gate 0.80 · awaiting strategist ack', status: 'pending' as const, ms: 0 }];


export const contextSignals = [
{ label: 'Session', value: 'Monaco GP · Lap 43/78', tone: '#F3F7FB' },
{ label: 'Driver state', value: 'Focused · HR 148 bpm', tone: '#00D68F' },
{ label: 'Tyre', value: 'MEDIUM · 18 laps · cliff L49', tone: '#FFC531' },
{ label: 'Rival threat', value: 'NOR closing 0.18 s/lap', tone: '#FF7A29' },
{ label: 'Channel', value: 'Encrypted · 12 ms uplink', tone: '#00E5FF' }];


export const suggestedCommands = [
'Should we cover Norris if he boxes?',
'What is the rear tyre cliff estimate?',
'Model a safety car on lap 48',
'Give me the fuel margin to the flag',
'Compare my sector two to Leclerc'];


export const recentSessions = [
{ id: 'v1', title: 'Qualifying Q3 debrief', time: 'Yesterday 17:24', turns: 34, tag: 'QUALI' },
{ id: 'v2', title: 'FP2 long run analysis', time: 'Yesterday 14:02', turns: 61, tag: 'FP2' },
{ id: 'v3', title: 'Imola race — SC decision', time: '2 weeks ago', turns: 88, tag: 'RACE' },
{ id: 'v4', title: 'Simulator correlation run', time: '3 weeks ago', turns: 27, tag: 'SIM' }];


export const voiceProfile = {
  model: 'RaceMind Voice v7.2',
  persona: 'Race Engineer · calm',
  latency: 380,
  wakeWord: 'Engineer',
  language: 'EN-GB',
  verbosity: 62
};