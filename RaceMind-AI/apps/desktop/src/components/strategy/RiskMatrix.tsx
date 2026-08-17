import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { branches } from '../../data/strategy';
import { Panel } from '../ui/Panel';

export function RiskMatrix() {
  return (
    <Panel
      title="Scenario Branches"
      subtitle="Contingency tree · auto-armed responses"
      accent="#FFC531"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          <GitBranch className="h-3 w-3" /> 4 branches
        </span>
      }>
      
      <div className="relative pl-5">
        <span className="absolute bottom-4 left-[7px] top-2 w-px bg-white/[0.08]" aria-hidden="true" />
        <ul className="space-y-2.5">
          {branches.map((b, i) =>
          <motion.li
            key={b.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative">
            
              <span
              className="absolute -left-5 top-3 h-2 w-2 rounded-full"
              style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
            
              <span
              className="absolute -left-[14px] top-4 h-px w-3"
              style={{ background: 'rgba(255,255,255,0.12)' }} />
            
              <div className="rounded-lg border border-white/[0.06] bg-black/25 p-2.5 transition-colors hover:border-white/[0.14]">
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[12px] font-medium text-f1-white">{b.trigger}</span>
                  <span className="font-mono text-[11px] font-semibold tabular" style={{ color: b.color }}>
                    {b.probability}%
                  </span>
                </div>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                  className="h-full rounded-full"
                  style={{ background: b.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.probability}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06 }} />
                
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-silver/55">{b.action}</span>
                  <span className="font-mono text-[10px] font-semibold tabular text-f1-white">{b.outcome}</span>
                </div>
              </div>
            </motion.li>
          )}
        </ul>
      </div>

      <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Auto-response</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-silver">
          If a VSC or Safety Car is declared before lap 52, RaceMind will pre-arm the crew and push the box call to the
          driver within 400 ms — no strategist confirmation required.
        </p>
      </div>
    </Panel>);

}