import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, User, Wrench } from 'lucide-react';
import { conversation } from '../../data/voice';
import { Panel } from '../ui/Panel';

const meta = {
  DRIVER: { color: '#FFC531', icon: User, label: 'Russell · 63' },
  AI: { color: '#00E5FF', icon: Sparkles, label: 'RaceMind AI' },
  ENGINEER: { color: '#00D68F', icon: Wrench, label: 'Shovlin · pit wall' }
};

export function ConversationLog() {
  return (
    <Panel
      title="Conversation"
      subtitle="Live transcript · lap 41 → 43"
      accent="#00E5FF"
      className="flex h-full flex-col"
      bodyClassName="flex-1 min-h-0"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">5 turns</span>
      }>
      
      <ul className="h-full space-y-2.5 overflow-y-auto scrollbar-thin p-3">
        {conversation.map((turn, i) => {
          const m = meta[turn.speaker];
          const Icon = m.icon;
          const isAI = turn.speaker === 'AI';
          return (
            <motion.li
              key={turn.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`rounded-lg border p-3 transition-colors ${
              isAI ?
              'border-f1-cyan/25 bg-f1-cyan/[0.05]' :
              'border-white/[0.06] bg-black/25 hover:border-white/[0.13]'}`
              }>
              
              <div className="flex items-center gap-2">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
                  style={{ background: `${m.color}1f`, color: m.color }}>
                  
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: m.color }}>
                  {m.label}
                </span>
                <span className="ml-auto font-mono text-[9px] text-silver/40">
                  L{turn.lap} · {turn.time}
                </span>
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-silver-light">{turn.text}</p>

              {isAI &&
              <div className="mt-2.5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em]">
                  <span className="text-silver/50">
                    Latency <span className="text-f1-white">{turn.latency}s</span>
                  </span>
                  <span className="text-silver/50">
                    Confidence <span className="text-f1-cyan">{turn.confidence}%</span>
                  </span>
                  <div className="ml-auto h-[3px] w-16 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                    className="h-full rounded-full bg-f1-cyan"
                    style={{ width: `${turn.confidence}%` }} />
                  
                  </div>
                </div>
              }

              {turn.actions &&
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {turn.actions.map((a) =>
                <button
                  key={a}
                  type="button"
                  className="flex items-center gap-1.5 rounded-md border border-f1-cyan/30 bg-f1-cyan/[0.08] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-f1-cyan transition-colors hover:bg-f1-cyan/[0.16]">
                  
                      <Check className="h-2.5 w-2.5" />
                      {a}
                    </button>
                )}
                </div>
              }
            </motion.li>);

        })}
      </ul>
    </Panel>);

}