export interface ReportTemplate {
  id: string;
  name: string;
  audience: string;
  cadence: string;
  pages: number;
  accent: string;
  description: string;
}

export const templates: ReportTemplate[] = [
{
  id: 'race-debrief',
  name: 'Race Debrief',
  audience: 'Sporting director · engineering leads',
  cadence: 'After every grand prix',
  pages: 14,
  accent: '#00E5FF',
  description: 'Full post-race analysis: strategy execution, stint pace, tyre management and decision review.'
},
{
  id: 'driver-review',
  name: 'Driver Performance Review',
  audience: 'Driver · driver coach',
  cadence: 'Every two rounds',
  pages: 9,
  accent: '#B15CFF',
  description: 'Corner-by-corner benchmarking against the teammate, with prioritised coaching actions.'
},
{
  id: 'reliability',
  name: 'Reliability Bulletin',
  audience: 'Power unit · systems group',
  cadence: 'Weekly',
  pages: 6,
  accent: '#E10600',
  description: 'Component life, thermal exceedances and predicted failure probability across the pool.'
},
{
  id: 'sponsor',
  name: 'Partner Summary',
  audience: 'Commercial · title partners',
  cadence: 'Monthly',
  pages: 5,
  accent: '#FFC531',
  description: 'Plain-language race outcomes, broadcast exposure and championship narrative for partners.'
},
{
  id: 'setup-digest',
  name: 'Setup Digest',
  audience: 'Vehicle dynamics group',
  cadence: 'Per event weekend',
  pages: 11,
  accent: '#00D68F',
  description: 'Setup convergence across sessions, correlation to the simulator and validated direction.'
}];


export interface ReportSection {
  id: string;
  title: string;
  detail: string;
  kind: 'summary' | 'chart' | 'table' | 'narrative' | 'appendix';
  words: number;
}

export const defaultSections: ReportSection[] = [
{ id: 'exec', title: 'Executive summary', detail: 'AI-written headline, result and the single decisive moment.', kind: 'summary', words: 220 },
{ id: 'result', title: 'Result & championship impact', detail: 'Finishing position, points and standings movement.', kind: 'summary', words: 140 },
{ id: 'pace', title: 'Stint pace analysis', detail: 'Lap time evolution per stint against the two closest rivals.', kind: 'chart', words: 310 },
{ id: 'strategy', title: 'Strategy execution', detail: 'Planned versus actual pit laps, undercut outcomes and lost time.', kind: 'chart', words: 380 },
{ id: 'tyre', title: 'Tyre management', detail: 'Degradation per compound, thermal windows and cliff onset.', kind: 'chart', words: 290 },
{ id: 'driver', title: 'Driver performance', detail: 'Sector benchmarking, consistency and input technique.', kind: 'table', words: 260 },
{ id: 'reliability', title: 'Reliability & component life', detail: 'Exceedances, wear rates and remaining allocation.', kind: 'table', words: 180 },
{ id: 'decisions', title: 'Decision review', detail: 'Every AI recommendation, whether it was taken and the outcome.', kind: 'narrative', words: 340 },
{ id: 'next', title: 'Actions for the next round', detail: 'Owned, dated actions carried into the following event.', kind: 'narrative', words: 160 },
{ id: 'appendix', title: 'Telemetry appendix', detail: 'Raw channel exports and lap-by-lap timing tables.', kind: 'appendix', words: 90 }];


export interface Recipient {
  id: string;
  name: string;
  role: string;
  channel: 'Email' | 'Secure link' | 'Team portal';
  initials: string;
  color: string;
}

export const recipients: Recipient[] = [
{ id: 'r1', name: 'Toto Wolff', role: 'Team principal', channel: 'Secure link', initials: 'TW', color: '#00E5FF' },
{ id: 'r2', name: 'Andrew Shovlin', role: 'Trackside engineering', channel: 'Email', initials: 'AS', color: '#00D68F' },
{ id: 'r3', name: 'George Russell', role: 'Driver · car 63', channel: 'Team portal', initials: 'GR', color: '#B15CFF' },
{ id: 'r4', name: 'Vehicle Dynamics', role: 'Group distribution', channel: 'Email', initials: 'VD', color: '#FFC531' },
{ id: 'r5', name: 'Power Unit Group', role: 'Brixworth', channel: 'Secure link', initials: 'PU', color: '#E10600' }];


export interface ArchivedReport {
  id: string;
  title: string;
  event: string;
  generated: string;
  pages: number;
  format: 'PDF' | 'DOCX' | 'Deck';
  status: 'published' | 'draft' | 'scheduled';
  opens: number;
  size: string;
}

export const archive: ArchivedReport[] = [
{ id: 'a1', title: 'Monaco GP — Race Debrief', event: 'Round 8 · Monaco', generated: '2h ago', pages: 14, format: 'PDF', status: 'published', opens: 23, size: '4.8 MB' },
{ id: 'a2', title: 'Monaco — Setup Digest', event: 'Round 8 · Monaco', generated: 'Yesterday', pages: 11, format: 'PDF', status: 'published', opens: 11, size: '3.2 MB' },
{ id: 'a3', title: 'Reliability Bulletin — Week 21', event: 'Season wide', generated: '3 days ago', pages: 6, format: 'DOCX', status: 'published', opens: 18, size: '1.1 MB' },
{ id: 'a4', title: 'Imola GP — Race Debrief', event: 'Round 7 · Imola', generated: '2 weeks ago', pages: 15, format: 'PDF', status: 'published', opens: 31, size: '5.2 MB' },
{ id: 'a5', title: 'Canada — Pre-event Brief', event: 'Round 9 · Montréal', generated: 'Scheduled', pages: 8, format: 'Deck', status: 'scheduled', opens: 0, size: '—' },
{ id: 'a6', title: 'Q2 Driver Review — Russell', event: 'Rounds 5-8', generated: 'Draft', pages: 9, format: 'PDF', status: 'draft', opens: 0, size: '2.0 MB' }];


export const reportKpis = [
{ label: 'Finishing position', value: 'P3', delta: '+2 from grid', color: '#00D68F' },
{ label: 'Race pace vs field', value: '+0.18s', delta: 'Second fastest', color: '#00E5FF' },
{ label: 'Strategy execution', value: '96%', delta: 'Plan adherence', color: '#B15CFF' },
{ label: 'Tyre delta to plan', value: '−1.4 laps', delta: 'Cliff arrived early', color: '#FF7A29' }];


export const stintSeries = [
{ label: 'Stint 1 · MEDIUM', color: '#FFC531', values: [76.9, 76.4, 76.2, 76.3, 76.5, 76.6, 76.9, 77.2, 77.4, 77.8, 78.1, 78.6] },
{ label: 'Stint 2 · HARD', color: '#F3F7FB', values: [77.4, 76.8, 76.5, 76.4, 76.4, 76.5, 76.6, 76.8, 76.9, 77.0, 77.2, 77.3] },
{ label: 'Rival · NOR', color: '#FF7A29', values: [77.1, 76.9, 76.7, 76.6, 76.8, 77.0, 77.3, 77.5, 77.9, 78.2, 78.4, 78.9] }];


export const narrative = {
  headline: 'A third place built on tyre discipline rather than raw pace.',
  body:
  'Car 63 converted a fourth-place grid slot into a podium by protecting the rear-left through the opening stint and taking the undercut on lap 45, two laps earlier than the pre-race plan. The decision cost 0.6s of track position immediately but returned 3.1s once Norris hit the degradation cliff. The limiting factor across the race was rear thermal management out of turns 10 and 11; the same configuration will not hold at a higher ambient temperature.',
  decisive:
  'Lap 45 pit call — executed 2 laps ahead of plan on the AI recommendation, worth an estimated 3.1 seconds and one position.'
};