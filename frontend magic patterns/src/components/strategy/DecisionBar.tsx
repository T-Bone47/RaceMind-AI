import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, Radio, ShieldCheck, Zap } from 'lucide-react';
import type { SimInputs } from '../../data/strategy';
import type { SimResult } from '../../utils/strategySim';

const riskColor = { low: '#00D68F', medium: '#FFC531', high: '#E10600' };

export function DecisionBar({ inputs, result }: {inputs: SimInputs;result: SimResult;}) {
  const gain = result.netDelta < 0;
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 carbon-weave opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
        style={{ background: riskColor[result.risk], boxShadow: `0 0 20px ${riskColor[result.risk]}` }}
        aria-hidden="true" />
      

      <div className="relative flex flex-col gap-4 p-4 2xl:flex-row 2xl:items-center">
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">Projected</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={result.projectedPos}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="font-mono text-[42px] font-bold leading-none text-f1-white"
                style={{ textShadow: '0 0 26px rgba(0,229,255,0.5)' }}>
                
                P{result.projectedPos}
              </motion.p>
            </AnimatePresence>
            <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver/50">from P3</p>
          </div>

          <div className="h-14 w-px bg-white/[0.08]" />

          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">Strategy call</p>
            <h1 className="mt-1 text-[19px] font-semibold leading-tight tracking-tight text-f1-white">
              Box lap {inputs.pitLap} · {inputs.compound} to the flag
            </h1>
            <p className="mt-1 text-[11.5px] text-silver">{result.headline}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.05] sm:grid-cols-4 2xl:ml-auto 2xl:w-[560px]">
          <Cell
            label="Net race delta"
            value={`${gain ? '' : '+'}${result.netDelta.toFixed(1)}s`}
            tone={gain ? '#00D68F' : '#FF7A29'}
            icon={Zap} />
          
          <Cell label="Undercut gain" value={`${result.undercutGain.toFixed(2)}s`} tone="#00E5FF" icon={ShieldCheck} />
          <Cell label="Traffic risk" value={`${result.trafficRisk}%`} tone="#FFC531" icon={CircleAlert} />
          <Cell
            label="Confidence"
            value={`${result.confidence}%`}
            tone={riskColor[result.risk]}
            icon={ShieldCheck} />
          
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-f1-cyan px-3.5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-carbon-900 transition-transform hover:scale-[1.03] active:scale-95">
            
            Commit call
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-silver transition-colors hover:border-white/[0.18] hover:text-f1-white">
            
            <Radio className="h-3.5 w-3.5" /> Brief driver
          </button>
        </div>
      </div>
    </section>);

}

function Cell({
  label,
  value,
  tone,
  icon: Icon





}: {label: string;value: string;tone: string;icon: React.ComponentType<{className?: string;}>;}) {
  return (
    <div className="bg-carbon-700/85 px-3 py-2.5">
      <p className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">
        <Icon className="h-2.5 w-2.5" /> {label}
      </p>
      <p className="mt-1.5 font-mono text-[19px] font-semibold leading-none tabular" style={{ color: tone }}>
        {value}
      </p>
    </div>);

}