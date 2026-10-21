import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, GitCompare, Sparkles } from 'lucide-react';
import { severityMeta, type Insight } from '../../data/insights';
import { Panel } from '../ui/Panel';
import { Trace } from '../ui/Trace';

export function InsightDetail({ insight }: {insight: Insight;}) {
  const meta = severityMeta[insight.severity];

  return (
    <Panel
      title="Insight Detail"
      subtitle={`${insight.domain} · ${insight.horizon}`}
      accent={meta.color}
      className="h-full"
      bodyClassName="p-0"
      actions={
      <span
        className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
        style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}12` }}>
        
          <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
      }>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.26 }}>
          
          <header className="border-b border-white/[0.06] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="max-w-[560px] text-balance text-[19px] font-semibold leading-tight tracking-tight text-f1-white">
                {insight.title}
              </h2>
              <div className="flex items-center gap-3">
                <Stat label="Impact" value={insight.impact} color={insight.impactTone} />
                <Stat label="Confidence" value={`${insight.confidence}%`} color={meta.color} />
              </div>
            </div>
            <p className="mt-2.5 max-w-[820px] text-[12.5px] leading-relaxed text-silver-light">{insight.detail}</p>
          </header>

          <div className="border-b border-white/[0.06] p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
                Evidence · {insight.evidence.label}
              </span>
              <span className="font-mono text-[10px]" style={{ color: insight.evidence.color }}>
                {insight.evidence.values[insight.evidence.values.length - 1]!.toFixed(1)} {insight.evidence.unit}
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/30 px-1 pt-1">
              <Trace values={insight.evidence.values} color={insight.evidence.color} height={112} width={780} grid />
            </div>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-silver/45">
              {insight.evidence.annotation}
            </p>
          </div>

          <div className="grid gap-4 border-b border-white/[0.06] p-4 lg:grid-cols-2">
            <div>
              <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
                <GitCompare className="h-3 w-3" /> What drives this prediction
              </p>
              <ul className="space-y-2">
                {insight.contributions.map((c, i) =>
                <li key={c.label}>
                    <div className="flex items-center justify-between font-mono text-[9.5px]">
                      <span className="uppercase tracking-[0.1em] text-silver/60">{c.label}</span>
                      <span className="tabular" style={{ color: meta.color }}>
                        {c.weight}%
                      </span>
                    </div>
                    <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                      className="h-full rounded-full"
                      style={{ background: meta.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.weight}%` }}
                      transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }} />
                    
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
                <Sparkles className="h-3 w-3" /> Recommended actions
              </p>
              <ul className="space-y-1.5">
                {insight.actions.map((a) =>
                <li key={a.label}>
                    <button
                    type="button"
                    className={`group flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors ${
                    a.primary ?
                    'border-f1-cyan/35 bg-f1-cyan/[0.07] hover:bg-f1-cyan/[0.13]' :
                    'border-white/[0.06] bg-black/25 hover:border-white/[0.16]'}`
                    }>
                    
                      <div className="min-w-0 flex-1">
                        <p
                        className="truncate text-[12px] font-medium"
                        style={{ color: a.primary ? '#00E5FF' : '#F3F7FB' }}>
                        
                          {a.label}
                        </p>
                        <p className="truncate font-mono text-[9px] text-silver/50">{a.detail}</p>
                      </div>
                      <ArrowRight className="h-3 w-3 shrink-0 text-silver/45 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="p-4">
            <div className="rounded-lg border border-white/[0.07] bg-black/30 p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">If we do nothing</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-silver-light">{insight.counterfactual}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Panel>);

}

function Stat({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-black/30 px-3 py-1.5 text-right">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{label}</p>
      <p className="mt-0.5 font-mono text-[16px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}