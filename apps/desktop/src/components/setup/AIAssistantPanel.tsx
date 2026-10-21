import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Sparkles, User } from 'lucide-react';
import { adaptOptions, assistantMessages, documents } from '../../data/setups';
import { Panel } from '../ui/Panel';

interface Props {
  documentId: string;
}

export function AIAssistantPanel({ documentId }: Props) {
  const [adapt, setAdapt] = useState<string[]>(['wheel', 'smooth']);
  const doc = documents.find((d) => d.id === documentId) ?? documents[0]!;

  const toggle = (id: string) => {
    const group = adaptOptions.find((o) => o.id === id)?.group;
    setAdapt((prev) => {
      const withoutGroup = prev.filter((p) => adaptOptions.find((o) => o.id === p)?.group !== group);
      return prev.includes(id) ? withoutGroup : [...withoutGroup, id];
    });
  };

  const groups = Array.from(new Set(adaptOptions.map((o) => o.group)));

  return (
    <Panel
      title="AI Engineering Assistant"
      subtitle={`Reading ${doc.name}`}
      accent="#00E5FF"
      className="flex h-full flex-col"
      bodyClassName="flex-1 min-h-0 flex flex-col"
      actions={
      <span className="flex items-center gap-1.5 rounded-md border border-f1-cyan/30 bg-f1-cyan/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-cyan">
          <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-cyan" /> Active
        </span>
      }>
      
      <div className="border-b border-white/[0.06] p-3">
        <div className="flex items-center gap-2 rounded-lg border border-f1-green/25 bg-f1-green/[0.06] px-2.5 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-f1-green" />
          <p className="min-w-0 flex-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-f1-green">
            {doc.extracted} values extracted · {doc.circuit} · {doc.session}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto scrollbar-thin p-3">
        {assistantMessages.map((m, i) => {
          const isUser = m.role === 'user';
          const isSystem = m.role === 'system';
          if (isSystem) {
            return (
              <motion.p
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="text-center font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/40">
                
                {m.text}
              </motion.p>);

          }
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-lg border p-2.5 ${
              isUser ? 'border-white/[0.07] bg-black/25' : 'border-f1-cyan/25 bg-f1-cyan/[0.05]'}`
              }>
              
              <div className="flex items-center gap-2">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
                  style={{
                    background: isUser ? 'rgba(255,255,255,0.07)' : 'rgba(0,229,255,0.14)',
                    color: isUser ? '#8E99A8' : '#00E5FF'
                  }}>
                  
                  {isUser ? <User className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
                </span>
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.14em]"
                  style={{ color: isUser ? '#8E99A8' : '#00E5FF' }}>
                  
                  {isUser ? 'You' : 'RaceMind'}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-silver-light">{m.text}</p>
            </motion.div>);

        })}
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Adapt this setup for</p>
        <div className="space-y-1.5">
          {groups.map((g) =>
          <div key={g} className="flex items-center gap-1.5">
              <span className="w-[38px] shrink-0 font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/40">
                {g}
              </span>
              {adaptOptions.
            filter((o) => o.group === g).
            map((o) => {
              const on = adapt.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggle(o.id)}
                  className={`flex-1 rounded-md border py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                  on ?
                  'border-f1-cyan/45 bg-f1-cyan/[0.1] text-f1-cyan' :
                  'border-white/[0.07] bg-black/25 text-silver/60 hover:text-f1-white'}`
                  }>
                  
                      {o.label}
                    </button>);

            })}
            </div>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/35 px-2.5 py-2">
          <input
            placeholder="Ask about this document…"
            aria-label="Ask the engineering assistant"
            className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-f1-white placeholder:text-silver/45 focus:outline-none" />
          
          <button
            type="button"
            aria-label="Send"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-f1-cyan/15 text-f1-cyan transition-colors hover:bg-f1-cyan/25">
            
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </Panel>);

}