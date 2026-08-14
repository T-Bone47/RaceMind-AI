import React from 'react';
import { motion } from 'framer-motion';
import type { SetupScore } from '../../utils/setupScore';
import { Panel } from '../ui/Panel';

interface Props {
  score: SetupScore;
  reference: SetupScore;
}

const metrics: {key: keyof SetupScore;label: string;color: string;}[] = [
{ key: 'topSpeed', label: 'Top speed', color: '#3D8BFF' },
{ key: 'cornering', label: 'Cornering', color: '#00E5FF' },
{ key: 'highSpeedStability', label: 'High-speed stability', color: '#B15CFF' },
{ key: 'lowSpeedGrip', label: 'Low-speed grip', color: '#00D68F' },
{ key: 'acceleration', label: 'Acceleration', color: '#FFC531' },
{ key: 'braking', label: 'Braking', color: '#E10600' },
{ key: 'tyreDeg', label: 'Tyre life', color: '#FF7A29' },
{ key: 'racePace', label: 'Race pace', color: '#00D68F' },
{ key: 'qualiPace', label: 'Qualifying pace', color: '#B15CFF' },
{ key: 'fuelUse', label: 'Fuel efficiency', color: '#FFC531' },
{ key: 'ersEfficiency', label: 'ERS efficiency', color: '#00E5FF' },
{ key: 'traction', label: 'Traction', color: '#00D68F' }];


const RADAR = 260;
const CENTER = RADAR / 2;
const R = 92;

function polygon(values: number[]): string {
  return values.
  map((v, i) => {
    const angle = i / values.length * Math.PI * 2 - Math.PI / 2;
    const r = v / 100 * R;
    return `${(CENTER + Math.cos(angle) * r).toFixed(1)},${(CENTER + Math.sin(angle) * r).toFixed(1)}`;
  }).
  join(' ');
}

export function PerformanceAnalysis({ score, reference }: Props) {
  const radarKeys = metrics.slice(0, 8);

  return (
    <Panel
      title="Performance Analysis"
      subtitle="Live model output · dashed line is the baseline setup"
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[9px] text-f1-green">
            <span className="h-[2px] w-3 rounded-full bg-f1-green" /> Current
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] text-silver/60">
            <span className="h-[2px] w-3 rounded-full bg-silver/60" /> Baseline
          </span>
        </div>
      }>
      
      <div className="grid gap-4 xl:grid-cols-[268px_1fr]">
        <div className="flex justify-center">
          <svg width={RADAR} height={RADAR} role="img" aria-label="Setup performance radar">
            {[0.25, 0.5, 0.75, 1].map((ring) =>
            <polygon
              key={ring}
              points={polygon(radarKeys.map(() => ring * 100))}
              fill="none"
              stroke="rgba(255,255,255,0.06)" />

            )}
            {radarKeys.map((m, i) => {
              const angle = i / radarKeys.length * Math.PI * 2 - Math.PI / 2;
              return (
                <g key={m.key}>
                  <line
                    x1={CENTER}
                    y1={CENTER}
                    x2={CENTER + Math.cos(angle) * R}
                    y2={CENTER + Math.sin(angle) * R}
                    stroke="rgba(255,255,255,0.06)" />
                  
                  <text
                    x={CENTER + Math.cos(angle) * (R + 22)}
                    y={CENTER + Math.sin(angle) * (R + 22)}
                    fontSize="8.5"
                    fill="#8E99A8"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono">
                    
                    {m.label.split(' ')[0]}
                  </text>
                </g>);

            })}
            <polygon
              points={polygon(radarKeys.map((m) => reference[m.key] as number))}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.34)"
              strokeDasharray="4 3"
              strokeWidth="1.2" />
            
            <motion.polygon
              animate={{ points: polygon(radarKeys.map((m) => score[m.key] as number)) }}
              transition={{ type: 'spring', stiffness: 140, damping: 26 }}
              fill="rgba(0,214,143,0.16)"
              stroke="#00D68F"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,214,143,0.4))' }} />
            
          </svg>
        </div>

        <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {metrics.map((m) => {
            const value = score[m.key] as number;
            const ref = reference[m.key] as number;
            const delta = value - ref;
            return (
              <li key={m.key}>
                <div className="flex items-baseline justify-between font-mono text-[9.5px]">
                  <span className="uppercase tracking-[0.1em] text-silver/60">{m.label}</span>
                  <span className="flex items-baseline gap-1.5">
                    {delta !== 0 &&
                    <span className="text-[8.5px] tabular" style={{ color: delta > 0 ? '#00D68F' : '#FF7A29' }}>
                        {delta > 0 ? '+' : ''}
                        {delta}
                      </span>
                    }
                    <span className="text-[11px] font-semibold tabular" style={{ color: m.color }}>
                      {value}
                    </span>
                  </span>
                </div>
                <div className="relative mt-1 h-[4px] overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 28 }}
                    style={{ background: m.color, boxShadow: `0 0 8px ${m.color}55` }} />
                  
                  <span className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${ref}%` }} />
                </div>
              </li>);

          })}
        </ul>
      </div>
    </Panel>);

}