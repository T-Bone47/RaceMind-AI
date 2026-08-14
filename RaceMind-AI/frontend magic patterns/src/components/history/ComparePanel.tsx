import React from 'react';
import { motion } from 'framer-motion';
import { GitCompare, X } from 'lucide-react';
import { typeColor, type SessionRecord } from '../../data/sessions';
import { formatLapTime } from '../../utils/format';
import { Panel } from '../ui/Panel';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  sessions: SessionRecord[];
  onRemove: (id: string) => void;
}

export function ComparePanel({ sessions, onRemove }: Props) {
  const fastest = sessions.length ? Math.min(...sessions.map((s) => s.bestLap)) : 0;
  const slowest = sessions.length ? Math.max(...sessions.map((s) => s.bestLap)) : 0;
  const span = slowest - fastest || 1;

  return (
    <Panel
      title="Session Comparison"
      subtitle="Select up to three from the archive"
      accent="#B15CFF"
      className="h-full"
      bodyClassName="p-3"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-purple">
          <GitCompare className="h-3 w-3" /> {sessions.length}/3
        </span>
      }>
      
      {sessions.length === 0 ?
      <EmptyState
        title="Nothing selected"
        body="Tick the box on any archive row to stage it here. Two or more sessions unlock the delta comparison."
        compact /> :


      <ul className="space-y-2">
          {sessions.map((s, i) => {
          const delta = s.bestLap - fastest;
          const width = 22 + (slowest - s.bestLap) / span * 74;
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-white/[0.06] bg-black/25 p-2.5">
              
                <div className="flex items-center gap-2">
                  <span
                  className="rounded px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.1em]"
                  style={{ background: `${typeColor[s.type]}1f`, color: typeColor[s.type] }}>
                  
                    {s.type}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[11.5px] text-f1-white">{s.event}</p>
                  <button
                  type="button"
                  onClick={() => onRemove(s.id)}
                  aria-label={`Remove ${s.event} from comparison`}
                  className="grid h-4 w-4 shrink-0 place-items-center rounded text-silver/50 transition-colors hover:text-f1-white">
                  
                    <X className="h-3 w-3" />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: delta === 0 ? '#B15CFF' : typeColor[s.type],
                      boxShadow: delta === 0 ? '0 0 10px #B15CFF88' : undefined
                    }} />
                  
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-[10.5px] tabular text-f1-white">
                    {formatLapTime(s.bestLap)}
                  </span>
                  <span
                  className="w-14 shrink-0 text-right font-mono text-[9.5px] tabular"
                  style={{ color: delta === 0 ? '#B15CFF' : '#FF7A29' }}>
                  
                    {delta === 0 ? 'FASTEST' : `+${delta.toFixed(3)}`}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-3 font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">
                  <span>{s.laps} laps</span>
                  <span>{s.distanceKm} km</span>
                  <span>{s.conditions}</span>
                  <span className="ml-auto">{s.date}</span>
                </div>
              </motion.li>);

        })}
        </ul>
      }

      {sessions.length >= 2 &&
      <button
        type="button"
        className="mt-2.5 w-full rounded-lg border border-f1-purple/35 bg-f1-purple/[0.08] py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-f1-purple transition-colors hover:bg-f1-purple/[0.16]">
        
          Open overlay in telemetry
        </button>
      }
    </Panel>);

}