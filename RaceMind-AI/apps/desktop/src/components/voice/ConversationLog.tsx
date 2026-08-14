// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, User, Wrench } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { useSessionStore } from '@/store/sessionStore';

const meta = {
  driver: { color: '#FFC531', icon: User, label: 'Russell · 63' },
  engineer: { color: '#00E5FF', icon: Sparkles, label: 'RaceMind AI' }
};

export function ConversationLog() {
  const messages = useSessionStore(s => s.messages);
  
  return (
    <Panel
      title="Conversation"
      subtitle="Live transcript"
      accent="#00E5FF"
      className="flex h-full flex-col"
      bodyClassName="flex-1 min-h-0"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">{messages.length} messages</span>
      }>
      
      <ul className="h-full space-y-2.5 overflow-y-auto scrollbar-thin p-3">
        {messages.map((turn, i) => {
          const m = meta[turn.from];
          const Icon = m.icon;
          const isAI = turn.from === 'engineer';
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
                  {turn.timestamp}
                </span>
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-silver-light">{turn.text}</p>

            </motion.li>);

        })}
      </ul>
    </Panel>);

}