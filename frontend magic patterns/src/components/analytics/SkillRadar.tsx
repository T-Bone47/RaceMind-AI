import React from 'react';
import { motion } from 'framer-motion';
import { skillRadar, comparisons } from '../../data/analytics';
import { Panel } from '../ui/Panel';

const SIZE = 300;
const CENTER = SIZE / 2;
const R = 108;

function pointsFor(values: number[]): string {
  return values.
  map((v, i) => {
    const angle = i / values.length * Math.PI * 2 - Math.PI / 2;
    const r = v / 100 * R;
    return `${(CENTER + Math.cos(angle) * r).toFixed(1)},${(CENTER + Math.sin(angle) * r).toFixed(1)}`;
  }).
  join(' ');
}

export function SkillRadar({ compareTo }: {compareTo: string;}) {
  const rival = comparisons.find((c) => c.code === compareTo) ?? comparisons[0];
  const rivalValues = skillRadar.map((a) => compareTo === 'FIELD' ? a.field : a.rival);

  return (
    <Panel
      title="Driver Profile"
      subtitle={`RUS vs ${rival.name} · percentile model`}
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[9px] text-f1-cyan">
            <span className="h-[2px] w-3 rounded-full bg-f1-cyan" /> RUS
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: rival.color }}>
            <span className="h-[2px] w-3 rounded-full" style={{ background: rival.color }} /> {rival.code}
          </span>
        </div>
      }>
      
      <div className="flex justify-center">
        <svg width={SIZE} height={SIZE} role="img" aria-label="Driver skill radar">
          {[0.25, 0.5, 0.75, 1].map((ring) =>
          <polygon
            key={ring}
            points={pointsFor(skillRadar.map(() => ring * 100))}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1" />

          )}
          {skillRadar.map((a, i) => {
            const angle = i / skillRadar.length * Math.PI * 2 - Math.PI / 2;
            const lx = CENTER + Math.cos(angle) * (R + 24);
            const ly = CENTER + Math.sin(angle) * (R + 24);
            return (
              <g key={a.key}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={CENTER + Math.cos(angle) * R}
                  y2={CENTER + Math.sin(angle) * R}
                  stroke="rgba(255,255,255,0.06)" />
                
                <text
                  x={lx}
                  y={ly}
                  fontSize="9.5"
                  fill="#8E99A8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono"
                  letterSpacing="0.6">
                  
                  {a.label}
                </text>
              </g>);

          })}

          <motion.polygon
            points={pointsFor(rivalValues)}
            fill={`${rival.color}14`}
            stroke={rival.color}
            strokeWidth="1.4"
            strokeDasharray="4 3"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: 'center' }} />
          
          <motion.polygon
            points={pointsFor(skillRadar.map((a) => a.self))}
            fill="rgba(0,229,255,0.16)"
            stroke="#00E5FF"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            style={{ transformOrigin: 'center', filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.4))' }} />
          
          {skillRadar.map((a, i) => {
            const angle = i / skillRadar.length * Math.PI * 2 - Math.PI / 2;
            const r = a.self / 100 * R;
            return (
              <circle
                key={a.key}
                cx={CENTER + Math.cos(angle) * r}
                cy={CENTER + Math.sin(angle) * r}
                r="3"
                fill="#00E5FF" />);


          })}
        </svg>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {skillRadar.map((a, i) => {
          const rv = rivalValues[i];
          const diff = a.self - rv;
          return (
            <li key={a.key} className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-silver/55">{a.label}</span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] text-f1-white tabular">{a.self}</span>
                <span
                  className="font-mono text-[9px] tabular"
                  style={{ color: diff >= 0 ? '#00D68F' : '#FF7A29' }}>
                  
                  {diff >= 0 ? '+' : ''}
                  {diff}
                </span>
              </span>
            </li>);

        })}
      </ul>
    </Panel>);

}