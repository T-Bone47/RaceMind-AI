import { compoundSpec, type SimInputs } from '../data/strategy';
import { clamp, seeded } from './format';

export interface SimResult {
  projectedPos: number;
  netDelta: number;
  confidence: number;
  distribution: {pos: number;probability: number;}[];
  undercutGain: number;
  trafficRisk: number;
  tyreMargin: number;
  stintLength: number;
  risk: 'low' | 'medium' | 'high';
  headline: string;
}

const TOTAL_LAPS = 78;
const CURRENT_LAP = 43;

export function simulate(inputs: SimInputs): SimResult {
  const spec = compoundSpec[inputs.compound];
  const stintLength = TOTAL_LAPS - inputs.pitLap;
  const tyreMargin = spec.life - stintLength;

  // Undercut power decays the longer you wait past the optimum window.
  const optimum = 45;
  const window = Math.abs(inputs.pitLap - optimum);
  const undercutGain = clamp(2.9 - window * 0.34 - spec.warmup * 0.8, -2.6, 2.9);

  const neutralBonus = inputs.neutralisation === 'sc' ? 11.4 : inputs.neutralisation === 'vsc' ? 6.1 : 0;
  const rainPenalty = inputs.rain / 100 * (inputs.compound === 'HARD' ? 6.2 : 9.4);
  const agg = inputs.aggression / 100;

  const paceGain = spec.pace * stintLength * 0.22;
  const wearLoss = tyreMargin < 0 ? Math.abs(tyreMargin) * 0.52 : 0;
  const trafficRisk = clamp(18 + window * 3.4 + (inputs.compound === 'HARD' ? 12 : 0) - agg * 10, 4, 96);

  const netDelta = Number(
    (paceGain + wearLoss + rainPenalty - neutralBonus - undercutGain * 1.6 + trafficRisk / 100 * 2.4).toFixed(1)
  );

  const score = -netDelta + agg * 1.2;
  const projectedPos = clamp(Math.round(3 - score / 2.2), 1, 8);

  const confidence = Math.round(
    clamp(
      86 - window * 2.6 - Math.max(0, -tyreMargin) * 2.1 - inputs.rain / 100 * 26 + (inputs.neutralisation !== 'none' ? 5 : 0),
      22,
      96
    )
  );

  const distribution = Array.from({ length: 8 }, (_, i) => {
    const pos = i + 1;
    const spread = 1.35 + (100 - confidence) / 34;
    const weight = Math.exp(-((pos - projectedPos) ** 2) / (2 * spread * spread));
    return { pos, weight: weight * (0.9 + seeded(pos * 7 + inputs.pitLap) * 0.2) };
  });
  const total = distribution.reduce((a, d) => a + d.weight, 0);

  const risk: SimResult['risk'] = confidence > 76 ? 'low' : confidence > 55 ? 'medium' : 'high';

  const headline =
  tyreMargin < 0 ?
  `${inputs.compound} cannot reach the flag — ${Math.abs(tyreMargin)} laps beyond the cliff` :
  inputs.neutralisation !== 'none' ?
  `${inputs.neutralisation.toUpperCase()} converts this into a cheap stop — box the moment it is called` :
  window <= 1 ?
  'Optimal undercut window — Norris cannot respond in time' :
  inputs.pitLap > optimum ?
  'Overcut territory — requires clean air to pay off' :
  'Early stop — exposes you to a long final stint';

  return {
    projectedPos,
    netDelta,
    confidence,
    distribution: distribution.map((d) => ({ pos: d.pos, probability: Math.round(d.weight / total * 100) })),
    undercutGain: Number(undercutGain.toFixed(2)),
    trafficRisk: Math.round(trafficRisk),
    tyreMargin,
    stintLength,
    risk,
    headline
  };
}

/** Projected race trace: lap -> position for each car, reacting to the chosen pit lap. */
export function projectTrace(inputs: SimInputs, result: SimResult) {
  const laps = Array.from({ length: 36 }, (_, i) => CURRENT_LAP + i);
  const build = (start: number, end: number, boxLap: number, seed: number) =>
  laps.map((lap) => {
    const t = (lap - CURRENT_LAP) / 35;
    const base = start + (end - start) * Math.min(1, t * 1.35);
    const pitBump = lap >= boxLap && lap <= boxLap + 2 ? 2.1 : 0;
    return clamp(base + pitBump + (seeded(lap + seed) - 0.5) * 0.35, 1, 8);
  });

  return {
    laps,
    series: [
    { code: 'RUS', color: '#00E5FF', width: 2.4, values: build(3, result.projectedPos, inputs.pitLap, 1) },
    { code: 'LEC', color: '#E10600', width: 1.3, values: build(2, 2.6, 48, 5) },
    { code: 'NOR', color: '#FF7A29', width: 1.3, values: build(4, result.projectedPos <= 2 ? 4.2 : 3.2, 44, 9) },
    { code: 'VER', color: '#3D8BFF', width: 1.3, values: build(1, 1.2, 56, 13) }]

  };
}