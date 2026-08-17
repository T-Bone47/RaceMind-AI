
import { ChevronLeft, ChevronRight, Layers, Pause, Play, RotateCcw, ZoomIn } from 'lucide-react';
import { comparisonDrivers, laps } from '../../data/telemetry';
import { formatLapTime } from '../../utils/format';

const statusColor: Record<string, string> = {
  current: '#00E5FF',
  best: '#B15CFF',
  clean: '#00D68F',
  traffic: '#FFC531',
  outlap: '#8E99A8'
};

interface Props {
  selectedLap: number;
  onSelectLap: (id: number) => void;
  compare: string[];
  onToggleCompare: (code: string) => void;
  playing: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  cursor: number;
}

export function TelemetryToolbar({
  selectedLap,
  onSelectLap,
  compare,
  onToggleCompare,
  playing,
  onTogglePlay,
  onReset,
  cursor
}: Props) {
  const lap = laps.find((l) => l.id === selectedLap) ?? laps[0]!;

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 brushed opacity-60" aria-hidden="true" />
      <div className="relative flex flex-col gap-4 p-4 2xl:flex-row 2xl:items-center">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">Analysing lap</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-[30px] font-bold leading-none text-f1-white">{lap.id}</span>
              <span className="font-mono text-[18px] font-semibold text-f1-cyan tabular">
                {formatLapTime(lap.time)}
              </span>
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em]"
                style={{ background: `${statusColor[lap.status]}1f`, color: statusColor[lap.status] }}>
                
                {lap.status}
              </span>
            </div>
          </div>

          <div className="hidden h-10 w-px bg-white/[0.08] sm:block" />

          <div className="hidden gap-3 sm:flex">
            {lap.sectors.map((s, i) =>
            <div key={i}>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/45">S{i + 1}</p>
                <p
                className="mt-1 font-mono text-[13px] font-semibold tabular"
                style={{ color: i === 0 ? '#B15CFF' : '#00D68F' }}>
                
                  {s.toFixed(3)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 2xl:ml-auto">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-1">
            {laps.map((l) =>
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectLap(l.id)}
              className={`rounded-md px-2 py-1 font-mono text-[10px] tabular transition-colors ${
              l.id === selectedLap ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
              }>
              
                L{l.id}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-black/30 px-2 py-1.5">
            <Layers className="h-3 w-3 text-silver/50" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/50">Overlay</span>
            {comparisonDrivers.map((d) => {
              const on = compare.includes(d.code);
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => onToggleCompare(d.code)}
                  title={d.label}
                  className="rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.08em] transition-colors"
                  style={{
                    color: on ? d.color : '#8E99A8',
                    borderColor: on ? `${d.color}66` : 'rgba(255,255,255,0.08)',
                    background: on ? `${d.color}14` : 'transparent'
                  }}>
                  
                  {d.code}
                </button>);

            })}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-1">
            <IconBtn label="Step back" onClick={onReset}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </IconBtn>
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={playing ? 'Pause replay' : 'Play replay'}
              className="grid h-7 w-7 place-items-center rounded-md bg-f1-cyan text-carbon-900 transition-transform hover:scale-105 active:scale-95">
              
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <IconBtn label="Step forward">
              <ChevronRight className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label="Reset playhead" onClick={onReset}>
              <RotateCcw className="h-3 w-3" />
            </IconBtn>
            <IconBtn label="Zoom">
              <ZoomIn className="h-3 w-3" />
            </IconBtn>
            <span className="ml-1 w-[64px] font-mono text-[10px] text-silver tabular">
              {(cursor * 3.337).toFixed(3)} km
            </span>
          </div>
        </div>
      </div>
    </section>);

}

function IconBtn({
  children,
  label,
  onClick




}: {children: React.ReactNode;label: string;onClick?: () => void;}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md text-silver transition-colors hover:bg-white/[0.06] hover:text-f1-white">
      
      {children}
    </button>);

}
