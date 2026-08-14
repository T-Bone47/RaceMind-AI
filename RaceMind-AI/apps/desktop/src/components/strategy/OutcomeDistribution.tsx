import React from 'react';
import { motion } from 'framer-motion';
import { Panel } from '../ui/Panel';
import { RingGauge } from '../ui/RingGauge';
import type { SimResult } from '../../utils/strategySim';

export function OutcomeDistribution({ result }: {result: SimResult;}) {
  const peak = Math.max(...result.distribution.map((d) => d.probability));
  const podium = result.distribution.
  filter((d) => d.pos <= 3).
  reduce((a, d) => a + d.probability, 0);

  return (
    <Panel
      title="Outcome Distribution"
      subtitle="Finishing position · 12,000 runs"
      accent="#B15CFF"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-f1-purple">
          Podium {podium}%
        </span>
      }>
      
      <div className="flex h-[150px] items-end gap-2">
        {result.distribution.map((d) => {
          const isMode = d.pos === result.projectedPos;
          const color = d.pos <= 3 ? '#B15CFF' : d.pos <= 5 ? '#00E5FF' : 'rgba(255,255,255,0.16)';
          return (
            <div key={d.pos} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className="font-mono text-[9.5px] tabular"
                style={{ color: isMode ? '#F3F7FB' : '#8E99A8' }}>
                
                {d.probability}%
              </span>
              <motion.div
                className="w-full rounded-t-sm"
                animate={{ height: `${Math.max(4, d.probability / peak * 108)}px` }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                style={{
                  background: color,
                  boxShadow: isMode ? `0 0 16px ${color}` : undefined,
                  outline: isMode ? '1px solid rgba(255,255,255,0.35)' : undefined
                }} />
              
              <span
                className="font-mono text-[9px] uppercase tracking-[0.1em]"
                style={{ color: isMode ? '#F3F7FB' : '#8E99A8' }}>
                
                P{d.pos}
              </span>
            </div>);

        })}
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-lg border border-white/[0.06] bg-black/25 p-3">
        <RingGauge
          value={result.confidence}
          label="Confidence"
          unit="%"
          color={result.risk === 'low' ? '#00D68F' : result.risk === 'medium' ? '#FFC531' : '#E10600'}
          size={82} />
        
        <div className="min-w-0 flex-1 space-y-2">
          <Row label="Expected finish" value={`P${result.projectedPos}`} color="#F3F7FB" />
          <Row label="Points swing" value={`+${Math.max(0, (4 - result.projectedPos) * 5)} pts`} color="#00D68F" />
          <Row label="Stint length" value={`${result.stintLength} laps`} color="#00E5FF" />
          <Row label="Risk grade" value={result.risk.toUpperCase()} color={result.risk === 'low' ? '#00D68F' : result.risk === 'medium' ? '#FFC531' : '#E10600'} />
        </div>
      </div>
    </Panel>);

}

function Row({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">{label}</span>
      <span className="font-mono text-[11.5px] font-semibold tabular" style={{ color }}>
        {value}
      </span>
    </div>);

}