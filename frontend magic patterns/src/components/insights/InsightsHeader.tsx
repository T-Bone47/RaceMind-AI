import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { insights, severityMeta, type Severity } from '../../data/insights';

const order: Severity[] = ['critical', 'opportunity', 'watch', 'informational'];

interface Props {
  filter: Severity | 'all';
  onFilter: (f: Severity | 'all') => void;
}

export function InsightsHeader({ filter, onFilter }: Props) {
  const counts = order.map((s) => ({ severity: s, count: insights.filter((i) => i.severity === s).length }));
  const avgConfidence = Math.round(insights.reduce((a, i) => a + i.confidence, 0) / insights.length);

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full opacity-20 blur-[80px]"
        style={{ background: '#00E5FF' }}
        aria-hidden="true" />
      

      <div className="relative flex flex-col gap-4 p-4 2xl:flex-row 2xl:items-center">
        <div className="flex items-center gap-3.5">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-f1-cyan/35 bg-f1-cyan/[0.08]">
            <BrainCircuit className="h-5 w-5 text-f1-cyan" strokeWidth={1.6} />
            <motion.span
              className="absolute inset-0 rounded-xl border border-f1-cyan/40"
              animate={{ opacity: [0.7, 0.1, 0.7], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
            
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">
              Intelligence briefing · Monaco GP · lap 43
            </p>
            <h1 className="mt-1 text-[22px] font-semibold leading-none tracking-tight text-f1-white">AI Insights</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver">
              <span className="flex items-center gap-1 text-f1-green">
                <ShieldCheck className="h-3 w-3" /> {avgConfidence}% mean confidence
              </span>
              <span className="text-silver/30">·</span>
              <span>5 models active</span>
              <span className="text-silver/30">·</span>
              <span className="flex items-center gap-1 text-f1-cyan">
                <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} /> refreshed 4s ago
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 2xl:ml-auto">
          <button
            type="button"
            onClick={() => onFilter('all')}
            className={`rounded-lg border px-2.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-colors ${
            filter === 'all' ?
            'border-white/25 bg-white/[0.07] text-f1-white' :
            'border-white/[0.07] bg-black/25 text-silver/60 hover:text-f1-white'}`
            }>
            
            All {insights.length}
          </button>
          {counts.map(({ severity, count }) => {
            const meta = severityMeta[severity];
            const on = filter === severity;
            return (
              <button
                key={severity}
                type="button"
                onClick={() => onFilter(severity)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-colors"
                style={{
                  color: on ? meta.color : '#8E99A8',
                  borderColor: on ? `${meta.color}66` : 'rgba(255,255,255,0.07)',
                  background: on ? `${meta.color}14` : 'rgba(0,0,0,0.25)'
                }}>
                
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                {meta.label} {count}
              </button>);

          })}

          <button
            type="button"
            className="ml-1 flex items-center gap-2 rounded-lg bg-f1-cyan px-3 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-carbon-900 transition-transform hover:scale-[1.03] active:scale-95">
            
            <FileText className="h-3.5 w-3.5" /> Export briefing
          </button>
        </div>
      </div>
    </section>);

}