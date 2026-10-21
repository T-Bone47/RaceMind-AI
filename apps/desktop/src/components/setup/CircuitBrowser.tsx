import { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Flame, Moon, Sun, Wind } from 'lucide-react';
import { circuits, type Circuit } from '../../data/setups';
import { Panel } from '../ui/Panel';

const downforceColor: Record<Circuit['downforce'], string> = {
  Low: '#3D8BFF',
  Medium: '#00E5FF',
  High: '#00D68F',
  Maximum: '#B15CFF'
};

const weatherIcon: Record<Circuit['weather'], React.ComponentType<{className?: string;}>> = {
  Clear: Sun,
  Hot: Flame,
  Overcast: Wind,
  Night: Moon,
  Humid: Wind,
  'Rain risk': CloudRain
};

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function CircuitBrowser({ selected, onSelect }: Props) {
  const [filter, setFilter] = useState<'All' | Circuit['downforce']>('All');
  const visible = circuits.filter((c) => filter === 'All' || c.downforce === filter);

  return (
    <Panel
      title="Circuit Browser"
      subtitle={`${visible.length} official circuits`}
      accent="#B15CFF"
      bodyClassName="p-3"
      actions={
      <div className="flex overflow-hidden rounded-md border border-white/[0.08]">
          {(['All', 'Low', 'Medium', 'High', 'Maximum'] as const).map((f) =>
        <button
          key={f}
          type="button"
          onClick={() => setFilter(f)}
          className={`px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
          filter === f ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
          }>
          
              {f}
            </button>
        )}
        </div>
      }>
      
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visible.map((c, i) => {
          const on = c.id === selected;
          const Weather = weatherIcon[c.weather];
          const tone = downforceColor[c.downforce];
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              whileHover={{ y: -3 }}
              aria-pressed={on}
              className="group relative overflow-hidden rounded-xl border text-left transition-colors"
              style={{
                borderColor: on ? `${tone}66` : 'rgba(255,255,255,0.07)',
                background: on ? `${tone}0d` : 'rgba(0,0,0,0.28)'
              }}>
              
              <div className="relative h-[84px] overflow-hidden border-b border-white/[0.06] bg-carbon-800">
                <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
                <div
                  className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full opacity-20 blur-[40px] transition-opacity group-hover:opacity-40"
                  style={{ background: tone }} />
                
                <svg viewBox="0 0 210 124" className="relative h-full w-full" aria-hidden="true">
                  <path d={c.path} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" strokeLinejoin="round" />
                  <path
                    d={c.path}
                    fill="none"
                    stroke={tone}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0 0 6px ${tone}88)` }} />
                  
                </svg>
                <span className="absolute left-2.5 top-2.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-f1-white backdrop-blur">
                  {c.code}
                </span>
                <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver-light backdrop-blur">
                  <Weather className="h-2.5 w-2.5" /> {c.weather}
                </span>
              </div>

              <div className="p-2.5">
                <p className="truncate text-[12px] font-medium text-f1-white">{c.name}</p>
                <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">
                  {c.country} · {c.lengthKm} km
                </p>

                <div className="mt-2 space-y-1.5">
                  <Bar label="Downforce" value={{ Low: 28, Medium: 52, High: 76, Maximum: 96 }[c.downforce]} color={tone} note={c.downforce} />
                  <Bar label="Brakes" value={c.brakeDemand} color="#E10600" note={`${c.brakeDemand}`} />
                  <Bar label="Tyre stress" value={c.tyreStress} color="#FFC531" note={`${c.tyreStress}`} />
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2 font-mono text-[9px]">
                  <span className="text-silver/50">Avg speed</span>
                  <span className="tabular text-f1-white">{c.avgSpeed} kph</span>
                </div>
              </div>
            </motion.button>);

        })}
      </div>
    </Panel>);

}

function Bar({ label, value, color, note }: {label: string;value: number;color: string;note: string;}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[58px] shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-silver/45">{label}</span>
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-[46px] shrink-0 text-right font-mono text-[8px] uppercase tracking-[0.08em] text-silver/55">
        {note}
      </span>
    </div>);

}