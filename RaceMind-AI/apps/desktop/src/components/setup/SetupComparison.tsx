import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Download } from 'lucide-react';
import { paramGroups, type Circuit, type SetupValues, type SetupSource } from '../../data/setups';
import { scoreSetup } from '../../utils/setupScore';
import { Panel } from '../ui/Panel';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  current: SetupValues;
  circuit: Circuit;
  sources: SetupSource[];
  onLoad: (values: SetupValues) => void;
}

const allParams = paramGroups.flatMap((g) => g.params);

export function SetupComparison({ current, circuit, sources, onLoad }: Props) {
  const [againstId, setAgainstId] = useState(sources[0]?.id ?? '');
  const against = sources.find((s) => s.id === againstId) ?? sources[0]!;

  const currentScore = scoreSetup(current, circuit);
  const againstScore = scoreSetup(against.values, circuit);

  const diffs = allParams.
  map((p) => ({ p, a: current[p.key] as number, b: against.values[p.key] as number })).
  filter((d) => Math.abs(d.a - d.b) > 0.001);

  return (
    <Panel
      title="Setup Comparison"
      subtitle={`Current vs ${against.label}`}
      accent={against.color}
      className="h-full"
      bodyClassName="p-3"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          <ArrowRightLeft className="h-3 w-3" /> {diffs.length} deltas
        </span>
      }>
      
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {sources.map((s) => {
          const on = s.id === against.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setAgainstId(s.id)}
              className="rounded-lg border px-2.5 py-2 text-left transition-colors"
              style={{
                borderColor: on ? `${s.color}66` : 'rgba(255,255,255,0.07)',
                background: on ? `${s.color}12` : 'rgba(0,0,0,0.25)'
              }}>
              
              <p className="truncate text-[11.5px] font-medium" style={{ color: on ? s.color : '#F3F7FB' }}>
                {s.label}
              </p>
              <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">{s.author}</p>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-silver/35">{s.tag}</p>
            </button>);

        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.05] sm:grid-cols-4">
        <ScoreCell label="Overall" a={currentScore.overall} b={againstScore.overall} />
        <ScoreCell label="Quali pace" a={currentScore.qualiPace} b={againstScore.qualiPace} />
        <ScoreCell label="Race pace" a={currentScore.racePace} b={againstScore.racePace} />
        <ScoreCell label="Tyre life" a={currentScore.tyreDeg} b={againstScore.tyreDeg} />
      </div>

      <div className="mt-3 max-h-[268px] overflow-y-auto scrollbar-thin rounded-lg border border-white/[0.06]">
        <div className="grid grid-cols-[1fr_58px_58px_54px] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/45">
          <span>Parameter</span>
          <span className="text-right">Current</span>
          <span className="text-right">{against.label.split(' ')[0]}</span>
          <span className="text-right">Δ</span>
        </div>

        {diffs.length === 0 ?
        <EmptyState
          title="Setups are identical"
          body="Adjust any slider on the setup sheet and the parameter deltas will appear here."
          compact /> :


        <ul>
            {diffs.map(({ p, a, b }, i) => {
            const decimals = p.step < 1 ? p.step < 0.05 ? 2 : 1 : 0;
            const delta = a - b;
            return (
              <motion.li
                key={p.key}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.24) }}
                className="grid grid-cols-[1fr_58px_58px_54px] items-center gap-2 border-b border-white/[0.035] px-2.5 py-1.5 last:border-b-0 hover:bg-white/[0.03]">
                
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-silver/70">
                    {p.label}
                  </span>
                  <span className="text-right font-mono text-[10.5px] tabular text-f1-white">{a.toFixed(decimals)}</span>
                  <span className="text-right font-mono text-[10.5px] tabular" style={{ color: against.color }}>
                    {b.toFixed(decimals)}
                  </span>
                  <span
                  className="text-right font-mono text-[10px] tabular"
                  style={{ color: delta > 0 ? '#00D68F' : '#FF7A29' }}>
                  
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(decimals)}
                  </span>
                </motion.li>);

          })}
          </ul>
        }
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={() => onLoad(against.values)}
          className="flex-1 rounded-lg border px-3 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] transition-colors"
          style={{ borderColor: `${against.color}55`, background: `${against.color}12`, color: against.color }}>
          
          Load {against.label}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver transition-colors hover:border-white/[0.18] hover:text-f1-white">
          
          <Download className="h-3 w-3" /> Export diff
        </button>
      </div>
    </Panel>);

}

function ScoreCell({ label, a, b }: {label: string;a: number;b: number;}) {
  const delta = a - b;
  return (
    <div className="bg-carbon-700/85 px-2.5 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[16px] font-semibold leading-none tabular text-f1-white">{a}</p>
      <p
        className="mt-1 font-mono text-[9px] tabular"
        style={{ color: delta > 0 ? '#00D68F' : delta < 0 ? '#FF7A29' : '#8E99A8' }}>
        
        {delta > 0 ? '+' : ''}
        {delta} vs {b}
      </p>
    </div>);

}