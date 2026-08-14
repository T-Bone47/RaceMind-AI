// @ts-nocheck
import { seeded } from './format';

export type Point = {x: number;y: number;};

/** Builds a smooth catmull-rom-ish SVG polyline path through normalized points. */
export function toPath(values: number[], width: number, height: number, min?: number, max?: number): string {
  if (values.length === 0) return '';
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const span = hi - lo || 1;
  const step = width / (values.length - 1 || 1);
  return values.
  map((v, i) => {
    const x = i * step;
    const y = height - (v - lo) / span * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).
  join(' ');
}

export function toAreaPath(values: number[], width: number, height: number, min?: number, max?: number): string {
  const line = toPath(values, width, height, min, max);
  if (!line) return '';
  return `${line} L${width},${height} L0,${height} Z`;
}

/** Speed trace for one flying lap: 0..1 lap distance -> km/h */
export function speedTrace(samples = 220, seed = 7): number[] {
  const corners = [0.06, 0.14, 0.23, 0.31, 0.42, 0.5, 0.58, 0.67, 0.74, 0.83, 0.91];
  const severity = [0.55, 0.72, 0.38, 0.62, 0.8, 0.45, 0.68, 0.3, 0.75, 0.5, 0.6];
  const out: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    let v = 336;
    corners.forEach((c, ci) => {
      const d = Math.abs(t - c);
      const w = Math.exp(-(d * d) / 0.00055);
      v -= w * severity[ci] * 250;
    });
    v += (seeded(i + seed * 31) - 0.5) * 4;
    out.push(Math.max(62, v));
  }
  return out;
}

export function throttleTrace(speed: number[]): number[] {
  return speed.map((v, i) => {
    const next = speed[Math.min(i + 3, speed.length - 1)];
    const rising = next - v;
    return Math.max(0, Math.min(100, 50 + rising * 26 + (v > 280 ? 46 : 0)));
  });
}

export function brakeTrace(speed: number[]): number[] {
  return speed.map((v, i) => {
    const next = speed[Math.min(i + 3, speed.length - 1)];
    const falling = v - next;
    return Math.max(0, Math.min(100, falling * 12 - 4));
  });
}

export function gearTrace(speed: number[]): number[] {
  return speed.map((v) => Math.max(1, Math.min(8, Math.round((v - 50) / 36))));
}

export function deltaTrace(samples = 220, seed = 3): number[] {
  const out: number[] = [];
  let acc = 0;
  for (let i = 0; i < samples; i++) {
    acc += (seeded(i * 1.7 + seed) - 0.48) * 0.035;
    out.push(acc);
  }
  return out;
}

export function wave(samples: number, seed: number, amp = 1): number[] {
  return Array.from({ length: samples }, (_, i) => {
    const t = i / samples;
    return (
      amp * (
      Math.sin(t * Math.PI * 6 + seed) * 0.5 +
      Math.sin(t * Math.PI * 13 + seed * 2) * 0.28 +
      (seeded(i + seed) - 0.5) * 0.4));

  });
}