// @ts-nocheck
import React, { useId } from 'react';
import { toAreaPath, toPath } from '../../utils/series';

interface TraceProps {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
  min?: number;
  max?: number;
  strokeWidth?: number;
  baseline?: number;
  className?: string;
  grid?: boolean;
}

export function Trace({
  values,
  color = '#00E5FF',
  height = 56,
  width = 320,
  fill = true,
  min,
  max,
  strokeWidth = 1.5,
  baseline,
  className = '',
  grid = false
}: TraceProps) {
  const id = useId().replace(/:/g, '');
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const span = hi - lo || 1;
  const baseY = baseline !== undefined ? height - (baseline - lo) / span * height : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      style={{ height }}
      aria-hidden="true">
      
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid &&
      [0.25, 0.5, 0.75].map((g) =>
      <line key={g} x1="0" x2={width} y1={height * g} y2={height * g} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      )}
      {baseY !== null &&
      <line x1="0" x2={width} y1={baseY} y2={baseY} stroke="rgba(255,255,255,0.14)" strokeDasharray="3 4" strokeWidth="1" />
      }
      {fill && <path d={toAreaPath(values, width, height, lo, hi)} fill={`url(#g-${id})`} />}
      <path
        d={toPath(values, width, height, lo, hi)}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 5px ${color}55)` }} />
      
    </svg>);

}

export function BarMeter({
  value,
  max = 100,
  color = '#00E5FF',
  height = 5,
  track = 'rgba(255,255,255,0.07)'






}: {value: number;max?: number;color?: string;height?: number;track?: string;}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height, background: track }}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}77` }} />
      
    </div>);

}