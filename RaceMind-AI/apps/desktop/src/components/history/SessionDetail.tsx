import { AnimatePresence, motion } from 'framer-motion';
import { CloudRain, Download, FileDown, MapPin, Play, Star, Sun } from 'lucide-react';
import { artifacts, typeColor, type SessionRecord } from '../../data/sessions';
import { formatLapTime, seeded } from '../../utils/format';
import { Panel } from '../ui/Panel';
import { Trace } from '../ui/Trace';

const compoundColor: Record<string, string> = {
  SOFT: '#E10600',
  MEDIUM: '#FFC531',
  HARD: '#F3F7FB'
};

function lapSeries(session: SessionRecord): number[] {
  const n = Math.min(session.laps, 70);
  return Array.from({ length: n }, (_, i) => {
    const fuelEffect = -0.03 * i;
    const stintNoise = (seeded(i * 3.1 + session.laps) - 0.5) * 0.9;
    const pit = i > 0 && i % Math.max(12, Math.floor(n / 3)) === 0 ? 21 : 0;
    return session.avgLap + fuelEffect + stintNoise + pit;
  });
}

interface Props {
  session: SessionRecord;
  starred: boolean;
  onToggleBookmark: (id: string) => void;
}

export function SessionDetail({ session, starred, onToggleBookmark }: Props) {
  const series = lapSeries(session);
  const Weather = session.conditions === 'Dry' ? Sun : CloudRain;

  return (
    <Panel
      title="Session Detail"
      subtitle={`${session.circuit} · ${session.date}`}
      accent={typeColor[session.type]}
      className="h-full"
      bodyClassName="p-0"
      actions={
      <button
        type="button"
        onClick={() => onToggleBookmark(session.id)}
        aria-label={starred ? 'Remove bookmark' : 'Bookmark session'}
        className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] transition-colors hover:border-white/[0.18]">
        
          <Star
          className="h-3 w-3"
          style={{ color: starred ? '#FFC531' : '#8E99A8' }}
          fill={starred ? '#FFC531' : 'none'} />
        
        </button>
      }>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}>
          
          <header className="border-b border-white/[0.06] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em]"
                    style={{ background: `${typeColor[session.type]}1f`, color: typeColor[session.type] }}>
                    
                    {session.type}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
                    <MapPin className="h-2.5 w-2.5" /> {session.country}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
                    <Weather className="h-2.5 w-2.5" /> {session.conditions}
                  </span>
                  <span className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((r) =>
                    <span
                      key={r}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: r <= session.rating ? '#FFC531' : 'rgba(255,255,255,0.14)' }} />

                    )}
                  </span>
                </div>
                <h2 className="mt-2 text-[20px] font-semibold leading-tight tracking-tight text-f1-white">
                  {session.event}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-f1-cyan px-3 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-carbon-900 transition-transform hover:scale-[1.03] active:scale-95">
                  
                  <Play className="h-3 w-3" /> Replay
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver transition-colors hover:border-white/[0.18] hover:text-f1-white">
                  
                  <FileDown className="h-3 w-3" /> Report
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.05] sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Best lap" value={formatLapTime(session.bestLap)} color="#00E5FF" />
              <Stat label="Average" value={formatLapTime(session.avgLap)} color="#F3F7FB" />
              <Stat label="Laps" value={`${session.laps}`} color="#F3F7FB" />
              <Stat label="Distance" value={`${session.distanceKm} km`} color="#8E99A8" />
              <Stat
                label="Result"
                value={session.position === 0 ? '—' : `P${session.position}`}
                color={session.position === 1 ? '#B15CFF' : '#F3F7FB'} />
              
              <Stat label="Data" value={`${session.sizeGb} GB`} color="#00D68F" />
            </div>
          </header>

          <div className="border-b border-white/[0.06] p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
                Lap time evolution
              </span>
              <span className="flex items-center gap-2">
                {session.compoundsUsed.map((c) =>
                <span key={c} className="flex items-center gap-1 font-mono text-[9px]" style={{ color: compoundColor[c] ?? '#8E99A8' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: compoundColor[c] ?? '#8E99A8' }} />
                    {c}
                  </span>
                )}
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/30 px-1 pt-1">
              <Trace values={series} color={typeColor[session.type]} height={104} width={780} grid />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/40">
              <span>Lap 1</span>
              <span>Spikes are pit stops</span>
              <span>Lap {Math.min(session.laps, 70)}</span>
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Engineer note</p>
              <p className="rounded-lg border border-white/[0.06] bg-black/25 p-3 text-[12px] leading-relaxed text-silver-light">
                {session.note}
              </p>
            </div>

            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
                Archived artifacts
              </p>
              <ul className="space-y-1">
                {artifacts.map((a) =>
                <li key={a.label}>
                    <button
                    type="button"
                    className="group flex w-full items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-1.5 text-left transition-colors hover:border-white/[0.16]">
                    
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] text-f1-white">{a.label}</p>
                        <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">{a.format}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[9.5px] text-silver/55 tabular">{a.size}</span>
                      <Download className="h-3 w-3 shrink-0 text-silver/40 transition-colors group-hover:text-f1-cyan" />
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Panel>);

}

function Stat({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="bg-carbon-700/85 px-3 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[14px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}