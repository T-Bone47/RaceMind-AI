// @ts-nocheck
import { brakeTrace, deltaTrace, gearTrace, speedTrace, throttleTrace, wave } from '../utils/series';
import { seeded } from '../utils/format';

export const SAMPLES = 280;

export const speed = speedTrace(SAMPLES, 7);
export const refSpeed = speedTrace(SAMPLES, 7).map((v, i) => v - Math.sin(i / 9) * 5 - 2.5);
export const throttle = throttleTrace(speed);
export const brake = brakeTrace(speed);
export const gear = gearTrace(speed);
export const rpm = speed.map((v, i) => 6800 + v / 336 * 4600 + Math.sin(i / 3) * 220);
export const steering = wave(SAMPLES, 2, 1).map((v) => v * 118);
export const drs = speed.map((v, i) => v > 292 && i % 280 > 40 ? 1 : 0);
export const ers = wave(SAMPLES, 5, 1).map((v) => Math.max(0, Math.min(160, 80 + v * 74)));
export const battery = (() => {
  let charge = 74;
  return ers.map((d, i) => {
    charge += (brake[i] > 30 ? 0.9 : 0) - d / 140;
    charge = Math.max(18, Math.min(100, charge));
    return charge;
  });
})();
export const fuelFlow = throttle.map((t) => 22 + t / 100 * 78);
export const delta = deltaTrace(SAMPLES, 3);

export const gLat = steering.map((s, i) => s / 118 * 4.6 * (speed[i] / 336) * 1.4);
export const gLon = speed.map((v, i) => {
  const next = speed[Math.min(i + 2, speed.length - 1)];
  return (next - v) * 0.42;
});

export const rideHeightFront = wave(SAMPLES, 12, 1).map((v) => 26 + v * 7);
export const rideHeightRear = wave(SAMPLES, 17, 1).map((v) => 62 + v * 9);
export const wheelSlip = brake.map((b, i) => Math.max(0, b * 0.06 + (throttle[i] > 92 ? 1.8 : 0) + seeded(i) * 0.6));

export const laps = [
{ id: 43, time: 75.412, compound: 'MEDIUM', status: 'current' as const, sectors: [24.118, 33.902, 17.392] },
{ id: 42, time: 75.688, compound: 'MEDIUM', status: 'clean' as const, sectors: [24.24, 34.03, 17.418] },
{ id: 41, time: 76.104, compound: 'MEDIUM', status: 'traffic' as const, sectors: [24.51, 34.18, 17.414] },
{ id: 34, time: 74.983, compound: 'MEDIUM', status: 'best' as const, sectors: [23.902, 33.744, 17.337] },
{ id: 29, time: 75.221, compound: 'MEDIUM', status: 'clean' as const, sectors: [24.011, 33.86, 17.35] },
{ id: 18, time: 76.902, compound: 'SOFT', status: 'outlap' as const, sectors: [24.88, 34.51, 17.512] }];


export const cornerAnalysis = [
{ id: 'T1', name: 'Sainte Dévote', entry: 268, apex: 92, exit: 178, delta: -0.042, gear: 2, brakeBar: 118, timeLoss: 0 },
{ id: 'T4', name: 'Massenet', entry: 244, apex: 128, exit: 201, delta: 0.031, gear: 3, brakeBar: 96, timeLoss: 0.031 },
{ id: 'T7', name: 'Mirabeau', entry: 231, apex: 74, exit: 141, delta: -0.018, gear: 2, brakeBar: 132, timeLoss: 0 },
{ id: 'T10', name: 'Portier', entry: 196, apex: 61, exit: 122, delta: 0.064, gear: 1, brakeBar: 108, timeLoss: 0.064 },
{ id: 'T13', name: 'Tabac', entry: 288, apex: 145, exit: 214, delta: -0.055, gear: 4, brakeBar: 89, timeLoss: 0 },
{ id: 'T16', name: 'Rascasse', entry: 172, apex: 108, exit: 156, delta: 0.012, gear: 2, brakeBar: 71, timeLoss: 0.012 }];


export const microSectors = Array.from({ length: 24 }, (_, i) => {
  const d = (seeded(i * 3.3) - 0.5) * 0.09;
  return { id: i + 1, delta: d, state: d < -0.02 ? 'purple' : d < 0 ? 'green' : d < 0.03 ? 'yellow' : 'red' };
}) as {id: number;delta: number;state: 'purple' | 'green' | 'yellow' | 'red';}[];

export const brakeTemps = [
{ label: 'FL', value: 612, max: 1000 },
{ label: 'FR', value: 704, max: 1000 },
{ label: 'RL', value: 488, max: 1000 },
{ label: 'RR', value: 531, max: 1000 }];


export const tyreLoads = [
{ label: 'FL', value: 2.9 },
{ label: 'FR', value: 4.4 },
{ label: 'RL', value: 3.1 },
{ label: 'RR', value: 4.8 }];


export const comparisonDrivers = [
{ code: 'LEC', color: '#E10600', gap: '+0.212', label: 'Ferrari · P2' },
{ code: 'VER', color: '#3D8BFF', gap: '+0.371', label: 'Red Bull · P1' },
{ code: 'NOR', color: '#FF7A29', gap: '-0.098', label: 'McLaren · P4' }];