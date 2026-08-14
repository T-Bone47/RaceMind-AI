import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { coachingInsights } from '../../data/analytics';
import { Panel } from '../ui/Panel';

export function CoachingInsights() {
  return (
    <Panel
      title="AI Coaching"
      subtitle="Strength & weakness detection"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-3 space-y-2"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-cyan">
          <Sparkles className="h-3 w-3" /> 4 findings
        </span>
      }>
      
      {coachingInsights.map((c, i) => {
        const strength = c.kind === 'strength';
        const color = strength ? '#00D68F' : '#FF7A29';
        const Icon = strength ? TrendingUp : TrendingDown;
        return (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group rounded-lg border p-3 transition-colors"
            style={{ borderColor: `${color}2e`, background: `${color}0a` }}>
            
            <div className="flex items-center gap-2">
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
                style={{ background: `${color}1f`, color }}>
                
                <Icon className="h-2.5 w-2.5" />
              </span>
              <h3 className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-f1-white">{c.title}</h3>
              <span className="shrink-0 font-mono text-[10px] font-semibold tabular" style={{ color }}>
                {c.impact}
              </span>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-silver">{c.body}</p>
            <button
              type="button"
              className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/60 transition-colors hover:text-f1-white">
              
              Open telemetry evidence <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.article>);

      })}

      <div className="rounded-lg border border-f1-cyan/25 bg-f1-cyan/[0.06] p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-f1-cyan">Priority coaching action</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-f1-white">
          Target slow-corner traction in the next simulator block. Recovering 60 ms of throttle re-application at T10
          and T15 is worth an estimated 0.11s per lap — enough to convert P3 into a front-row qualifying threat.
        </p>
      </div>
    </Panel>);

}