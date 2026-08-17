import { useRaceData } from '../../hooks/useRaceData';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Flag, Info, Play, Sparkles, User, Wrench } from 'lucide-react';
import { Panel } from '../ui/Panel';

const fromMeta = {
  DRIVER: { color: '#FFC531', icon: User, label: 'Russell' },
  ENGINEER: { color: '#00D68F', icon: Wrench, label: 'Shovlin' },
  AI: { color: '#00E5FF', icon: Sparkles, label: 'RaceMind' }
};

const severityMeta = {
  info: { color: '#8E99A8', icon: Info },
  warning: { color: '#FFC531', icon: AlertTriangle },
  critical: { color: '#E10600', icon: Flag }
};

export function CommsFeed() {
  const { controlMessages, radioMessages } = useRaceData();

  const [tab, setTab] = useState<'radio' | 'control'>('radio');

  return (
    <Panel
      title="Communications"
      subtitle={tab === 'radio' ? 'Team radio · channel 63' : 'FIA race control'}
      accent="#FFC531"
      className="flex h-full flex-col"
      bodyClassName="flex-1 min-h-0"
      actions={
      <div className="flex overflow-hidden rounded-md border border-white/[0.08]">
          {(['radio', 'control'] as const).map((t) =>
        <button
          key={t}
          type="button"
          onClick={() => setTab(t)}
          className={`px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
          tab === t ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
          }>
          
              {t}
            </button>
        )}
        </div>
      }>
      
      <AnimatePresence mode="wait">
        <motion.ul
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="h-full space-y-2 overflow-y-auto scrollbar-thin p-3">
          
          {tab === 'radio' ?
          radioMessages.map((m) => {
            const meta = fromMeta[m.from];
            const Icon = meta.icon;
            return (
              <li
                key={m.id}
                className="group rounded-lg border border-white/[0.06] bg-black/25 p-2.5 transition-colors hover:border-white/[0.13]">
                
                    <div className="flex items-center gap-2">
                      <span
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
                    style={{ background: `${meta.color}1f`, color: meta.color }}>
                    
                        <Icon className="h-2.5 w-2.5" />
                      </span>
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="font-mono text-[9px] text-silver/40">L{m.lap} · {m.time}</span>
                      <button
                    type="button"
                    aria-label="Replay transmission"
                    className="ml-auto grid h-5 w-5 place-items-center rounded-md border border-white/[0.08] text-silver opacity-0 transition-opacity hover:text-f1-white group-hover:opacity-100">
                    
                        <Play className="h-2.5 w-2.5" />
                      </button>
                    </div>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-silver-light">{m.text}</p>
                    {m.from !== 'AI' &&
                <div className="mt-2 flex h-3 items-end gap-[2px] opacity-60">
                        {Array.from({ length: 34 }, (_, i) =>
                  <span
                    key={i}
                    className="w-[2px] rounded-full"
                    style={{
                      height: `${3 + Math.abs(Math.sin(i * 0.7 + m.lap)) * 10}px`,
                      background: meta.color,
                      opacity: 0.55
                    }} />

                  )}
                      </div>
                }
                  </li>);

          }) :
          controlMessages.map((m) => {
            const meta = severityMeta[m.severity];
            const Icon = meta.icon;
            return (
              <li
                key={m.id}
                className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-black/25 p-2.5 transition-colors hover:border-white/[0.13]">
                
                    <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md"
                  style={{ background: `${meta.color}1f`, color: meta.color }}>
                  
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: meta.color }}>
                          {m.category}
                        </span>
                        <span className="font-mono text-[9px] text-silver/40">L{m.lap} · {m.time}</span>
                      </div>
                      <p className="mt-1 font-mono text-[10.5px] leading-relaxed tracking-[0.04em] text-silver-light">
                        {m.text}
                      </p>
                    </div>
                  </li>);

          })}
        </motion.ul>
      </AnimatePresence>
    </Panel>);

}