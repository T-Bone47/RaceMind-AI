export interface RadarAxis {
  key: string;
  label: string;
  self: number;
  rival: number;
  field: number;
}

export const skillRadar: RadarAxis[] = [
{ key: 'quali', label: 'Qualifying', self: 94, rival: 81, field: 72 },
{ key: 'racecraft', label: 'Racecraft', self: 88, rival: 74, field: 70 },
{ key: 'tyre', label: 'Tyre mgmt', self: 82, rival: 69, field: 68 },
{ key: 'wet', label: 'Wet pace', self: 91, rival: 66, field: 65 },
{ key: 'starts', label: 'Starts', self: 71, rival: 84, field: 69 },
{ key: 'consistency', label: 'Consistency', self: 90, rival: 72, field: 71 },
{ key: 'braking', label: 'Late braking', self: 79, rival: 88, field: 70 },
{ key: 'feedback', label: 'Feedback', self: 96, rival: 77, field: 66 }];


export const rounds = [
{ round: 'BHR', quali: 0.12, race: 0.08, points: 15, dnf: false },
{ round: 'JED', quali: -0.04, race: 0.14, points: 12, dnf: false },
{ round: 'AUS', quali: 0.21, race: -0.03, points: 18, dnf: false },
{ round: 'JPN', quali: -0.11, race: -0.09, points: 25, dnf: false },
{ round: 'CHN', quali: 0.06, race: 0.19, points: 10, dnf: false },
{ round: 'MIA', quali: -0.18, race: -0.12, points: 0, dnf: true },
{ round: 'IMO', quali: 0.02, race: -0.06, points: 18, dnf: false },
{ round: 'MON', quali: -0.14, race: -0.11, points: 39, dnf: false }];


export const lapDistribution = [
{ bucket: '74.6', count: 1 },
{ bucket: '74.8', count: 3 },
{ bucket: '75.0', count: 7 },
{ bucket: '75.2', count: 12 },
{ bucket: '75.4', count: 9 },
{ bucket: '75.6', count: 5 },
{ bucket: '75.8', count: 3 },
{ bucket: '76.0', count: 2 },
{ bucket: '76.2+', count: 1 }];


export const cornerPerformance = [
{ id: 'T1', type: 'Slow', delta: -0.042 },
{ id: 'T2', type: 'Slow', delta: -0.018 },
{ id: 'T3', type: 'Medium', delta: 0.011 },
{ id: 'T4', type: 'Medium', delta: 0.031 },
{ id: 'T5', type: 'Fast', delta: -0.052 },
{ id: 'T6', type: 'Fast', delta: -0.061 },
{ id: 'T7', type: 'Slow', delta: -0.018 },
{ id: 'T8', type: 'Slow', delta: 0.024 },
{ id: 'T9', type: 'Medium', delta: 0.008 },
{ id: 'T10', type: 'Slow', delta: 0.064 },
{ id: 'T11', type: 'Medium', delta: -0.014 },
{ id: 'T12', type: 'Fast', delta: -0.048 },
{ id: 'T13', type: 'Fast', delta: -0.055 },
{ id: 'T14', type: 'Medium', delta: 0.019 },
{ id: 'T15', type: 'Slow', delta: 0.041 },
{ id: 'T16', type: 'Slow', delta: 0.012 },
{ id: 'T17', type: 'Medium', delta: -0.009 },
{ id: 'T18', type: 'Fast', delta: -0.037 },
{ id: 'T19', type: 'Medium', delta: 0.006 }];


export const pedalMetrics = [
{ label: 'Throttle application', value: 88, benchmark: 79, unit: '%', note: 'Smoothest on exit of slow corners' },
{ label: 'Trail braking', value: 71, benchmark: 84, unit: '%', note: 'Releases 0.08s earlier than optimum' },
{ label: 'Peak brake pressure', value: 132, benchmark: 141, unit: 'bar', note: 'Under-uses the first 40 ms' },
{ label: 'Coasting time', value: 3.1, benchmark: 2.2, unit: '%', note: '0.9% above field median' },
{ label: 'Steering smoothness', value: 93, benchmark: 82, unit: '%', note: 'Minimal mid-corner correction' },
{ label: 'Downshift precision', value: 96, benchmark: 90, unit: '%', note: 'Near-perfect rev matching' }];


export const coachingInsights = [
{
  id: 'c1',
  kind: 'strength' as const,
  title: 'Elite in high-speed direction changes',
  body: 'Gains 0.19s across T5, T6, T12, T13 versus the field median. Commitment on turn-in is in the 96th percentile.',
  impact: 'ic +0.19s/lap'
},
{
  id: 'c2',
  kind: 'weakness' as const,
  title: 'Slow-corner traction loss',
  body: 'Losing 0.11s in T10 and T15. Throttle re-application is 60 ms late relative to the reference model.',
  impact: '−0.11s/lap'
},
{
  id: 'c3',
  kind: 'weakness' as const,
  title: 'Race starts remain the outlier',
  body: 'Average of 1.4 positions lost off the line this season. Clutch bite point release is inconsistent under load.',
  impact: '−1.4 places'
},
{
  id: 'c4',
  kind: 'strength' as const,
  title: 'Best-in-class wet pace',
  body: 'Wet-condition delta of −0.41s to teammate across three sessions. Confidence under low grip is exceptional.',
  impact: '+0.41s/lap'
}];


export const scoreCards = [
{ label: 'Performance index', value: '92.4', delta: '+2.1', color: '#00E5FF' },
{ label: 'Race pace rank', value: '2nd', delta: '+1', color: '#00D68F' },
{ label: 'Consistency σ', value: '0.184s', delta: '−0.03', color: '#B15CFF' },
{ label: 'Overtakes made', value: '31', delta: '+6', color: '#FFC531' },
{ label: 'Points scored', value: '137', delta: '+39', color: '#F3F7FB' }];


export const comparisons = [
{ code: 'ANT', name: 'Antonelli', color: '#00D68F', label: 'Teammate' },
{ code: 'FIELD', name: 'Field median', color: '#8E99A8', label: 'Grid' }];