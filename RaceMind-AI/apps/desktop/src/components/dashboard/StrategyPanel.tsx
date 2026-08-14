import { useRaceData } from '../../hooks/useRaceData';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldAlert, Timer } from 'lucide-react';
import { Panel } from '../ui/Panel';

const riskColor = { low: '#00D68F', medium: '#FFC531', high: '#E10600' };

export function StrategyPanel() {
  const { session, stints, strategyOptions } = useRaceData();

  const [selected, setSelected] = useState(strategyOptions[0]?.id || "");

  return (
    <Panel
      title="Strategy Board"
      subtitle="Monte Carlo · 12,000 runs · updated 4s ago"
      accent="#B15CFF"
      className="h-full"
      bodyClassName="p-4 space-y-4"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/60">
          <Timer className="h-3 w-3 text-f1-purple" /> Window opens L45
        </span>
      }>
      
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <span>Stint plan</span>
          <span>L1 — L{session.totalLaps}</span>
        </div>
        <div className="relative h-9 overflow-hidden rounded-lg border border-white/[0.07] bg-black/30">
          {stints.map((s) => {
            const left = s.from / session.totalLaps * 100;
            const width = (s.to - s.from) / session.totalLaps * 100;
            const projected = s.compound.startsWith('PROJECTED');
            return (
              <motion.div
                key={s.compound}
                initial={{ opacity: 0, scaleX: 0.7 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-y-[3px] flex items-center justify-center overflow-hidden rounded-md"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  background: `${s.color}${projected ? '1a' : '26'}`,
                  border: `1px ${projected ? 'dashed' : 'solid'} ${s.color}66`,
                  transformOrigin: 'left'
                }}>
                
                <span className="truncate px-1 font-mono text-[9px] font-semibold tracking-[0.1em]" style={{ color: s.color }}>
                  {s.compound.replace('PROJECTED ', '')}
                </span>
              </motion.div>);

          })}
          <span
            className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_12px_#fff]"
            style={{ left: `${session.lap / session.totalLaps * 100}%` }} />
          
          <span
            className="absolute inset-y-0 bg-f1-cyan/10"
            style={{ left: `${45 / session.totalLaps * 100}%`, width: `${6 / session.totalLaps * 100}%` }} />
          
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[8.5px] text-silver/45">
          <span>L1</span>
          <span className="text-f1-cyan">PIT WINDOW L45–L51</span>
          <span>L78</span>
        </div>
      </div>

      <ul className="space-y-2">
        {strategyOptions.map((opt) => {
          const isSelected = opt.id === selected;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => setSelected(opt.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${
                isSelected ?
                'border-f1-purple/45 bg-f1-purple/[0.08]' :
                'border-white/[0.06] bg-white/[0.015] hover:border-white/[0.14]'}`
                }>
                
                <div className="flex items-center gap-2">
                  {isSelected ?
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-f1-purple" /> :

                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20" />
                  }
                  <span className="flex-1 truncate font-mono text-[10.5px] font-semibold tracking-[0.08em] text-f1-white">
                    {opt.label}
                  </span>
                  {opt.recommended &&
                  <span className="rounded bg-f1-cyan/15 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-f1-cyan">
                      AI pick
                    </span>
                  }
                </div>
                <p className="mt-1.5 pl-[22px] text-[11px] leading-relaxed text-silver/80">{opt.detail}</p>
                <div className="mt-2 flex items-center gap-4 pl-[22px]">
                  <Stat label="Proj" value={`P${opt.projectedPos}`} color="#F3F7FB" />
                  <Stat
                    label="Δ Race"
                    value={`${opt.delta > 0 ? '+' : ''}${opt.delta.toFixed(1)}s`}
                    color={opt.delta < 0 ? '#00D68F' : '#FF7A29'} />
                  
                  <Stat label="Conf" value={`${opt.confidence}%`} color="#00E5FF" />
                  <span className="ml-auto flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: riskColor[opt.risk] }}>
                    <ShieldAlert className="h-2.5 w-2.5" /> {opt.risk} risk
                  </span>
                </div>
              </button>
            </li>);

        })}
      </ul>
    </Panel>);

}

function Stat({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/45">{label}</span>
      <span className="font-mono text-[11px] font-semibold tabular" style={{ color }}>
        {value}
      </span>
    </span>);

}