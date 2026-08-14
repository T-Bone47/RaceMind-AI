import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { rounds } from '../../data/analytics';
import { Panel } from '../ui/Panel';

const W = 880;
const H = 210;
const PAD = 26;

export function SeasonEvolution() {
  const [hover, setHover] = useState<number | null>(null);
  const maxAbs = 0.24;

  const x = (i: number) => PAD + i / (rounds.length - 1) * (W - PAD * 2);
  const y = (v: number) => H / 2 - v / maxAbs * (H / 2 - 22);

  const line = (key: 'quali' | 'race') =>
  rounds.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(' ');

  const active = hover === null ? rounds.length - 1 : hover;

  return (
    <Panel
      title="Season Evolution"
      subtitle="Delta to teammate · negative is faster"
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-3"
      actions={
      <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[9px] text-f1-purple">
            <span className="h-[2px] w-3 rounded-full bg-f1-purple" /> Quali
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] text-f1-green">
            <span className="h-[2px] w-3 rounded-full bg-f1-green" /> Race
          </span>
        </div>
      }>
      
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 210 }}
        role="img"
        aria-label="Season pace evolution"
        onMouseLeave={() => setHover(null)}>
        
        <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.14)" strokeDasharray="3 4" />
        {[-0.2, -0.1, 0.1, 0.2].map((g) =>
        <g key={g}>
            <line x1={PAD} x2={W - PAD} y1={y(g)} y2={y(g)} stroke="rgba(255,255,255,0.04)" />
            <text x={2} y={y(g) + 3} fontSize="9" fill="#8E99A8" className="font-mono">
              {g > 0 ? '+' : ''}
              {g.toFixed(1)}
            </text>
          </g>
        )}

        {rounds.map((r, i) =>
        <g key={r.round} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - 26} y={0} width={52} height={H} fill="transparent" />
            <motion.rect
            x={x(i) - 9}
            width={18}
            rx={2}
            initial={{ height: 0, y: H - 20 }}
            animate={{ height: r.points / 39 * 40, y: H - 20 - r.points / 39 * 40 }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            fill={r.dnf ? '#E10600' : 'rgba(255,255,255,0.12)'} />
          
            <text x={x(i)} y={H - 5} fontSize="9.5" fill={i === active ? '#F3F7FB' : '#8E99A8'} textAnchor="middle" className="font-mono">
              {r.round}
            </text>
          </g>
        )}

        <path d={line('quali')} fill="none" stroke="#B15CFF" strokeWidth="1.8" strokeLinejoin="round" opacity="0.9" />
        <path
          d={line('race')}
          fill="none"
          stroke="#00D68F"
          strokeWidth="2.2"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,214,143,0.45))' }} />
        

        {rounds.map((r, i) =>
        <g key={`pt-${r.round}`}>
            <circle cx={x(i)} cy={y(r.quali)} r={i === active ? 4 : 2.6} fill="#B15CFF" />
            <circle cx={x(i)} cy={y(r.race)} r={i === active ? 4.5 : 3} fill="#00D68F" />
          </g>
        )}

        <line x1={x(active)} x2={x(active)} y1={8} y2={H - 20} stroke="rgba(255,255,255,0.18)" />
      </svg>

      <div className="mt-1 grid grid-cols-4 gap-2 border-t border-white/[0.06] pt-3">
        <Readout label="Round" value={rounds[active].round} color="#F3F7FB" />
        <Readout
          label="Quali Δ"
          value={`${rounds[active].quali > 0 ? '+' : ''}${rounds[active].quali.toFixed(2)}s`}
          color={rounds[active].quali < 0 ? '#00D68F' : '#FF7A29'} />
        
        <Readout
          label="Race Δ"
          value={`${rounds[active].race > 0 ? '+' : ''}${rounds[active].race.toFixed(2)}s`}
          color={rounds[active].race < 0 ? '#00D68F' : '#FF7A29'} />
        
        <Readout
          label="Points"
          value={rounds[active].dnf ? 'DNF' : `${rounds[active].points}`}
          color={rounds[active].dnf ? '#E10600' : '#FFC531'} />
        
      </div>
    </Panel>);

}

function Readout({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div>
      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[14px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}