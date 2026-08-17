import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { games } from '../../data/setups';
import { Panel } from '../ui/Panel';

const statusMeta = {
  connected: { color: '#00D68F', label: 'Connected' },
  available: { color: '#8E99A8', label: 'Available' },
  legacy: { color: '#FF7A29', label: 'Read only' }
};

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function GameShelf({ selected, onSelect }: Props) {
  return (
    <Panel
      title="Game Titles"
      subtitle="Setup libraries by season"
      accent="#00E5FF"
      bodyClassName="p-3"
      actions={<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">5 titles</span>}>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {games.map((g, i) => {
          const on = g.id === selected;
          const meta = statusMeta[g.status];
          return (
            <motion.button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              aria-pressed={on}
              className="group relative overflow-hidden rounded-xl border p-3 text-left transition-colors"
              style={{
                borderColor: on ? `${g.accent}66` : 'rgba(255,255,255,0.07)',
                background: on ? `${g.accent}10` : 'rgba(0,0,0,0.28)'
              }}>
              
              <div
                className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-25 blur-[36px] transition-opacity group-hover:opacity-45"
                style={{ background: g.accent }} />
              
              <div className="relative flex items-start justify-between">
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg border"
                  style={{ borderColor: `${g.accent}44`, background: `${g.accent}14` }}>
                  
                  <Gamepad2 className="h-4 w-4" style={{ color: g.accent }} strokeWidth={1.6} />
                </div>
                <span className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ color: meta.color }}>
                  <span className={`h-1.5 w-1.5 rounded-full ${g.status === 'connected' ? 'animate-pulseGlow' : ''}`} style={{ background: meta.color }} />
                  {meta.label}
                </span>
              </div>

              <p className="relative mt-2.5 font-mono text-[13px] font-bold tracking-[0.04em] text-f1-white">{g.short}</p>
              <p className="relative truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/50">
                {g.name}
              </p>

              <div className="relative mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2">
                <span className="font-mono text-[9px] text-silver/55">{g.circuits} circuits</span>
                <span className="font-mono text-[9px]" style={{ color: g.accent }}>
                  {g.season}
                </span>
              </div>
              <p className="relative mt-1 truncate font-mono text-[8px] uppercase tracking-[0.1em] text-silver/35">
                {g.build}
              </p>
            </motion.button>);

        })}
      </div>
    </Panel>);

}