import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { Panel } from '../ui/Panel';
import type { SimInputs } from '../../data/strategy';
import { clamp } from '../../utils/format';

export function UndercutLab({ inputs, onSelectLap }: {inputs: SimInputs;onSelectLap: (lap: number) => void;}) {
  const laps = Array.from({ length: 14 }, (_, i) => 44 + i);

  const rows = laps.map((lap) => {
    const under = clamp(2.9 - Math.abs(lap - 45) * 0.34, -2.4, 2.9);
    const over = clamp(-1.4 + (lap - 45) * 0.19 - Math.max(0, lap - 56) * 0.42, -2.4, 2.1);
    return { lap, under, over };
  });

  const scale = 2.9;

  return (
    <Panel
      title="Undercut / Overcut Lab"
      subtitle="Net gain vs Norris per candidate box lap"
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          <ArrowLeftRight className="h-3 w-3" /> ± {scale.toFixed(1)}s
        </span>
      }>
      
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em]">
        <span className="text-f1-green">Undercut</span>
        <span className="text-silver/40">Neutral</span>
        <span className="text-f1-orange">Overcut</span>
      </div>

      <ul className="space-y-[3px]">
        {rows.map((r) => {
          const selected = r.lap === inputs.pitLap;
          const best = r.under > r.over ? 'under' : 'over';
          const value = best === 'under' ? r.under : r.over;
          const color = best === 'under' ? '#00D68F' : '#FF7A29';
          const width = Math.abs(value) / scale * 46;
          return (
            <li key={r.lap}>
              <button
                type="button"
                onClick={() => onSelectLap(r.lap)}
                className={`flex w-full items-center gap-2 rounded-md px-1.5 py-[3px] transition-colors ${
                selected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]'}`
                }>
                
                <span
                  className="w-8 shrink-0 text-left font-mono text-[9.5px] tabular"
                  style={{ color: selected ? '#F3F7FB' : '#8E99A8' }}>
                  
                  L{r.lap}
                </span>
                <div className="relative h-3 flex-1">
                  <span className="absolute inset-y-0 left-1/2 w-px bg-white/[0.12]" />
                  <motion.span
                    className="absolute inset-y-[2px] rounded-sm"
                    animate={{ width: `${width}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                    style={{
                      background: color,
                      opacity: selected ? 1 : 0.55,
                      left: value >= 0 ? '50%' : undefined,
                      right: value < 0 ? '50%' : undefined,
                      boxShadow: selected ? `0 0 12px ${color}` : undefined
                    }} />
                  
                </div>
                <span
                  className="w-12 shrink-0 text-right font-mono text-[9.5px] tabular"
                  style={{ color: selected ? color : '#8E99A8' }}>
                  
                  {value >= 0 ? '+' : ''}
                  {value.toFixed(2)}
                </span>
              </button>
            </li>);

        })}
      </ul>

      <p className="mt-3 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2 text-[11px] leading-relaxed text-silver">
        Undercut power decays 0.34 s per lap past the optimum as track evolution flattens. Beyond lap 56 the overcut
        collapses — Norris will have completed his stop and be in clean air.
      </p>
    </Panel>);

}