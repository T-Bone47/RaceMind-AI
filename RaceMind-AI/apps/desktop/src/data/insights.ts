import { wave } from '../utils/series';

export type Severity = 'critical' | 'opportunity' | 'watch' | 'informational';
export type Domain = 'Strategy' | 'Reliability' | 'Performance' | 'Energy' | 'Driver';

export interface Insight {
  id: string;
  title: string;
  summary: string;
  detail: string;
  domain: Domain;
  severity: Severity;
  confidence: number;
  horizon: string;
  impact: string;
  impactTone: string;
  evidence: {label: string;unit: string;color: string;values: number[];annotation: string;};
  contributions: {label: string;weight: number;}[];
  actions: {label: string;detail: string;primary?: boolean;}[];
  counterfactual: string;
}

export const severityMeta: Record<Severity, {color: string;label: string;}> = {
  critical: { color: '#E10600', label: 'Critical' },
  opportunity: { color: '#00D68F', label: 'Opportunity' },
  watch: { color: '#FFC531', label: 'Watch' },
  informational: { color: '#8E99A8', label: 'Info' }
};

export const insights: Insight[] = [
{
  id: 'i1',
  title: 'Undercut on Norris closes in 2 laps',
  summary: 'Boxing lap 45 converts P3 into P2 in 68% of simulated races. The window shuts once McLaren commits.',
  detail:
  'Norris is on a 6-lap SOFT and McLaren pit activity was detected on lap 42. Our reaction model gives them a 79% chance of boxing on lap 44. If we pre-empt by one lap we exit ahead of the Ferrari pit cycle and inherit clean air for eleven laps, which is worth 2.4 seconds of net race time.',
  domain: 'Strategy',
  severity: 'opportunity',
  confidence: 84,
  horizon: 'Next 2 laps',
  impact: '+1 position',
  impactTone: '#00D68F',
  evidence: {
    label: 'Undercut delta vs Norris',
    unit: 's',
    color: '#00D68F',
    values: wave(60, 3, 1).map((v, i) => 2.6 - i * 0.052 + v * 0.22),
    annotation: 'Window optimum at lap 45 · decays 0.34 s/lap'
  },
  contributions: [
  { label: 'Tyre offset advantage', weight: 34 },
  { label: 'Clean air projection', weight: 27 },
  { label: 'Pit crew readiness', weight: 18 },
  { label: 'Rival reaction latency', weight: 21 }],

  actions: [
  { label: 'Arm pit window for lap 45', detail: 'Notifies crew and pre-heats the SOFT set', primary: true },
  { label: 'Brief driver on out-lap target', detail: 'Target 75.4 with maximum ERS deployment' },
  { label: 'Model the McLaren counter', detail: 'Re-run with Norris boxing on lap 44' }],

  counterfactual: 'Waiting until lap 51 drops the P2 probability from 68% to 41% and raises traffic exposure to 46%.'
},
{
  id: 'i2',
  title: 'Rear-left thermal cliff projected lap 49',
  summary: 'Surface temperature is climbing 1.6 °C per lap. Degradation becomes non-linear six laps from now.',
  detail:
  'The rear-left is running 124 °C surface against a 112 °C target window. Carcass temperature is lagging, which usually precedes a sharp drop in mechanical grip through the low-speed sequence. Historic Monaco data shows a 0.31 s/lap penalty once the cliff is crossed, with no recovery inside a stint.',
  domain: 'Performance',
  severity: 'critical',
  confidence: 76,
  horizon: '6 laps',
  impact: '−0.31 s/lap',
  impactTone: '#E10600',
  evidence: {
    label: 'Rear-left surface temperature',
    unit: '°C',
    color: '#E10600',
    values: wave(60, 8, 1).map((v, i) => 104 + i * 0.42 + v * 2.4),
    annotation: 'Target window 108–116 °C · breach projected lap 49'
  },
  contributions: [
  { label: 'Traction demand T10/T15', weight: 38 },
  { label: 'Track temperature 47.2 °C', weight: 26 },
  { label: 'Stint age 18 laps', weight: 22 },
  { label: 'Diff entry setting', weight: 14 }],

  actions: [
  { label: 'Shift diff entry to position 4', detail: 'Reduces rear slip by an estimated 1.1%', primary: true },
  { label: 'Lift-and-coast 40 m at T10', detail: 'Costs 0.05 s/lap, buys 3 laps of tyre life' },
  { label: 'Bring the stop forward to lap 45', detail: 'Aligns with the undercut opportunity' }],

  counterfactual: 'Holding current inputs to lap 51 costs an estimated 1.9 s cumulative and risks losing P3 to Norris.'
},
{
  id: 'i3',
  title: 'MGU-K harvest shortfall on the final stint',
  summary: 'Energy budget is 0.4 MJ light for a full-attack finish if we run STRAT 6 to the flag.',
  detail:
  'Deployment is currently averaging 2.9 MJ per lap against a 4.0 MJ allowance, but harvest is limited by the low braking energy of the final sector. Running the higher engine mode from lap 60 exhausts the store two laps before the end, which would surrender DRS defence into the tunnel.',
  domain: 'Energy',
  severity: 'watch',
  confidence: 81,
  horizon: 'Laps 60–78',
  impact: '−0.18 s/lap',
  impactTone: '#FFC531',
  evidence: {
    label: 'Projected battery state of charge',
    unit: '%',
    color: '#FFC531',
    values: wave(60, 14, 1).map((v, i) => 88 - i * 0.78 + v * 3.1),
    annotation: 'Reserve floor 18% · breach projected lap 76'
  },
  contributions: [
  { label: 'Sector 3 braking energy', weight: 41 },
  { label: 'Engine mode selection', weight: 29 },
  { label: 'Fuel-flow ceiling', weight: 17 },
  { label: 'Ambient cooling margin', weight: 13 }],

  actions: [
  { label: 'Stage STRAT 6 from lap 64', detail: 'Preserves 0.6 MJ for the final two laps', primary: true },
  { label: 'Increase harvest at T1 and T7', detail: 'Adds 0.2 MJ per lap with no lap-time cost' }],

  counterfactual: 'Deploying from lap 60 leaves no defensive energy for the final two laps against a DRS attack.'
},
{
  id: 'i4',
  title: 'Gearbox oil temperature trending high',
  summary: 'Third consecutive stint above the 118 °C advisory. No failure risk yet, but the margin is narrowing.',
  detail:
  'Running in traffic through laps 33–41 reduced cooling airflow and lifted gearbox oil temperature to 121 °C. The reliability model still rates finish probability at 97.4%, but a second neutralisation period spent behind a leading car would push the component into its caution band.',
  domain: 'Reliability',
  severity: 'watch',
  confidence: 69,
  horizon: 'Rest of race',
  impact: '97.4% finish',
  impactTone: '#FFC531',
  evidence: {
    label: 'Gearbox oil temperature',
    unit: '°C',
    color: '#FF7A29',
    values: wave(60, 22, 1).map((v, i) => 112 + i * 0.18 + v * 3.4),
    annotation: 'Advisory 118 °C · caution band 128 °C'
  },
  contributions: [
  { label: 'Time spent in dirty air', weight: 44 },
  { label: 'Ambient 26.4 °C', weight: 24 },
  { label: 'Cooling configuration', weight: 20 },
  { label: 'Component age 6 races', weight: 12 }],

  actions: [
  { label: 'Open the cooling exit by one click', detail: 'Costs 0.03 s/lap of drag', primary: true },
  { label: 'Avoid extended running within 1.0 s', detail: 'Manage the gap rather than sit in the tow' }],

  counterfactual: 'No action keeps finish probability above 95%, but removes all margin if a Safety Car bunches the field.'
},
{
  id: 'i5',
  title: 'Driver rhythm at its season peak',
  summary: 'Nine consecutive laps inside a 0.14 s band — the tightest sequence Russell has produced this year.',
  detail:
  'Steering smoothness is in the 93rd percentile and mid-corner corrections have fallen to 1.2 per lap. This pattern historically correlates with a willingness to extend a stint, which supports the later strategy branches if the tyre thermal issue can be managed.',
  domain: 'Driver',
  severity: 'informational',
  confidence: 88,
  horizon: 'Current stint',
  impact: 'σ 0.184 s',
  impactTone: '#00E5FF',
  evidence: {
    label: 'Lap-time deviation from stint median',
    unit: 's',
    color: '#00E5FF',
    values: wave(60, 31, 1).map((v) => v * 0.11),
    annotation: 'Nine-lap band 0.14 s · season best'
  },
  contributions: [
  { label: 'Steering smoothness', weight: 36 },
  { label: 'Braking repeatability', weight: 28 },
  { label: 'Throttle modulation', weight: 21 },
  { label: 'Track evolution', weight: 15 }],

  actions: [
  { label: 'Log as reference behaviour', detail: 'Feeds the coaching model for the next round', primary: true },
  { label: 'Extend stint option remains open', detail: 'Consider only if rear-left is stabilised' }],

  counterfactual: 'No downside — this insight raises confidence in every strategy branch that depends on driver execution.'
}];


export const predictions = [
{ id: 'p1', label: 'Norris boxes before lap 46', probability: 79, status: 'pending' as const, window: 'L44–L46' },
{ id: 'p2', label: 'Safety Car before lap 60', probability: 31, status: 'pending' as const, window: 'L43–L60' },
{ id: 'p3', label: 'Russell sets fastest sector 2', probability: 64, status: 'hit' as const, window: 'L43' },
{ id: 'p4', label: 'Rain reaches the circuit', probability: 34, status: 'pending' as const, window: '+50 min' },
{ id: 'p5', label: 'Leclerc covers our stop within 1 lap', probability: 72, status: 'pending' as const, window: 'L45–L47' },
{ id: 'p6', label: 'Hamilton drops behind Piastri', probability: 58, status: 'missed' as const, window: 'L41' }];


export const models = [
{ name: 'Strategy engine', version: 'v7.2', accuracy: 91.4, latency: 42, status: 'active' as const },
{ name: 'Tyre thermal model', version: 'v5.8', accuracy: 88.1, latency: 61, status: 'active' as const },
{ name: 'Reliability forecaster', version: 'v3.4', accuracy: 84.7, latency: 118, status: 'active' as const },
{ name: 'Rival intent model', version: 'v6.0', accuracy: 79.3, latency: 88, status: 'degraded' as const },
{ name: 'Weather nowcast', version: 'v4.1', accuracy: 92.8, latency: 204, status: 'active' as const }];


export const accuracyHistory = [
{ round: 'BHR', value: 84 },
{ round: 'JED', value: 86 },
{ round: 'AUS', value: 83 },
{ round: 'JPN', value: 89 },
{ round: 'CHN', value: 87 },
{ round: 'MIA', value: 90 },
{ round: 'IMO', value: 92 },
{ round: 'MON', value: 91 }];


export const executiveSummary = {
  generated: '14:42:11',
  headline: 'Pre-emptive stop on lap 45 is the highest-value action available',
  paragraphs: [
  'Russell holds P3 with a 1.842 s gap to Leclerc and 2.317 s to Norris. Pace is stable and the driver is producing his most consistent sequence of the season, which raises execution confidence across every strategy branch.',
  'Two constraints dominate the remainder of the race. The rear-left tyre is projected to cross its thermal cliff on lap 49, and McLaren is likely to commit Norris to a stop on lap 44. Both point to the same conclusion: the stop should come earlier than the nominal window.',
  'Boxing on lap 45 for a SOFT set resolves the tyre risk, pre-empts the McLaren undercut and yields P2 in 68% of simulated outcomes. The principal exposure is a Safety Car between laps 46 and 55, which would hand a cheap stop to the cars behind — a 24% branch we hold a double-stack response for.'],

  metrics: [
  { label: 'Recommended action', value: 'Box lap 45 · SOFT' },
  { label: 'Projected finish', value: 'P2 (68%)' },
  { label: 'Championship swing', value: '+15 points' },
  { label: 'Principal risk', value: 'SC laps 46–55 (24%)' }]

};