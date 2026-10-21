import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Mic, Sparkles } from 'lucide-react';
import { aiInsights } from '../../data/race';
import { Panel } from '../ui/Panel';
import { BarMeter } from '../ui/Trace';

const toneMap = { cyan: '#00E5FF', amber: '#FFC531', orange: '#FF7A29' };

export function AIEngineer() {
  const [active, setActive] = useState(0);
  const insight = aiInsights[active];
  const tone = toneMap[insight.tone];

  return (
    <Panel
      title="Ollie · Race Engineer"
      subtitle="Reasoning model v7.2 · 42 ms · advisory"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="h-[calc(100%-45px)] flex flex-col"
      actions={
      <span className="flex items-center gap-1.5 rounded-md border border-f1-cyan/30 bg-f1-cyan/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-cyan">
          <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-cyan" /> Thinking
        </span>
      }>
      
      <div className="relative flex items-center gap-4 border-b border-white/[0.06] px-4 py-4">
        <div className="relative grid h-[68px] w-[68px] shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-f1-cyan/10 blur-md" />
          <motion.span
            className="absolute inset-0 rounded-full border border-f1-cyan/30"
            animate={{ scale: [1, 1.14, 1], opacity: [0.7, 0.15, 0.7] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
          
          <motion.span
            className="absolute inset-[9px] rounded-full border border-f1-cyan/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
          
          <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-f1-cyan/15 ring-1 ring-f1-cyan/40">
            <Sparkles className="h-4 w-4 text-f1-cyan" strokeWidth={1.6} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-f1-red px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white">
              Priority 1
            </span>
            <span className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-silver/65">
              Strategy
            </span>
          </div>
          <p className="mt-2 font-mono text-[19px] font-bold uppercase leading-none tracking-[0.06em] text-f1-white">
            Box lap 45 — soft
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-silver">
            Undercut Norris before McLaren can react. Out-lap target 1:15.4.
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-silver/60">
                <span>DECISION CONFIDENCE</span>
                <span className="text-f1-cyan">84%</span>
              </div>
              <BarMeter value={84} color="#00E5FF" />
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-f1-cyan px-2.5 py-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-carbon-900 transition-transform hover:scale-[1.03] active:scale-95">
              
              Commit <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 px-3 pt-3">
        {aiInsights.map((ins, i) =>
        <button
          key={ins.id}
          type="button"
          onClick={() => setActive(i)}
          className={`h-[3px] flex-1 rounded-full transition-colors ${
          i === active ? '' : 'bg-white/[0.08] hover:bg-white/20'}`
          }
          style={i === active ? { background: toneMap[ins.tone] } : undefined}
          aria-label={ins.title} />

        )}
      </div>

      <div className="min-h-0 flex-1 px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24 }}>
            
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
              <p className="text-[12.5px] font-medium text-f1-white">{insight.title}</p>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-silver">{insight.body}</p>
            <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
              <span>Model confidence</span>
              <span style={{ color: tone }}>{insight.confidence}%</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2">
          <Mic className="h-3.5 w-3.5 text-f1-cyan" strokeWidth={1.7} />
          <input
            className="flex-1 bg-transparent font-mono text-[11px] text-f1-white placeholder:text-silver/45 focus:outline-none"
            placeholder="Ask Ollie…"
            aria-label="Ask Ollie, your AI race engineer" />
          
          <div className="flex h-4 items-end gap-[2px]">
            {[4, 9, 6, 12, 7, 10, 5].map((h, i) =>
            <motion.span
              key={i}
              className="w-[2px] rounded-full bg-f1-cyan/70"
              animate={{ height: [h, h * 0.4, h] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }} />

            )}
          </div>
        </div>
      </div>
    </Panel>);

}