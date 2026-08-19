import { Bell, CloudRain, Command, FlaskConical, Radio, Search, Thermometer, Wind } from 'lucide-react';
import { focusDriver, session } from '../../data/race';
import { useSessionStore } from '../../store/sessionStore';
import { formatClock } from '../../utils/format';
import { useLiveTick } from '../../hooks/useLiveTick';
import { Readout } from '../ui/Metric';
import { compoundOf } from '../ui/tokens';

interface TopBarProps {
  onOpenCommand: () => void;
}

export function TopBar({ onOpenCommand }: TopBarProps) {
  const tick = useLiveTick(1000);
  const elapsed = session.elapsed + tick;
  const store = useSessionStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tyre = compoundOf((store.tyres.compound || focusDriver.compound).toUpperCase() as any);

  return (
    <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-carbon-800/85 px-3 backdrop-blur-xl lg:gap-4 lg:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 rounded-md bg-f1-red px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white">
          {session.type}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold leading-none tracking-tight text-f1-white">
            {store.trackName || session.event}
          </p>
          <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-silver/60">
            {session.round} · {store.trackName || session.circuit}
          </p>
        </div>
      </div>

      <div className="mx-1 hidden h-7 w-px bg-white/[0.07] xl:block" />

      <div className="hidden items-center gap-4 xl:flex">
        <Readout label="Lap" value={`${store.currentLap}/${store.totalLaps}`} hint="Current lap of total race distance" />
        <Readout label="Elapsed" value={formatClock(elapsed)} hint="Time since lights out" />
        <div className="flex items-center gap-1.5" title={`Running the ${tyre.name} compound, ${store.tyres.ageLaps} laps old`}>
          <span
            className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 font-mono text-[8px] font-bold"
            style={{ borderColor: tyre.color, color: tyre.color }}>
            
            {tyre.short}
          </span>
          <div className="leading-none">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">Tyre</p>
            <p className="mt-1 font-mono text-[12px] font-semibold tabular" style={{ color: tyre.color }}>
              {store.tyres.ageLaps}L
            </p>
          </div>
        </div>
        <Readout label="Track" value={`${store.trackTempC}°`} color="#FF7A29" icon={Thermometer} hint="Track surface temperature" />
        <Readout label="Air" value={`${store.airTempC}°`} color="#8E99A8" icon={Wind} hint="Air temperature" />
        <Readout
          label="Rain 30m"
          value={`${session.rainProbability}%`}
          color="#3D8BFF"
          icon={CloudRain}
          hint="Probability of rain within the next 30 minutes" />
        
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span
          title="This build runs on a simulated Monaco race session — no live timing feed is connected."
          className="hidden items-center gap-1.5 rounded-md border border-f1-amber/30 bg-f1-amber/[0.08] px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-f1-amber lg:flex">
          
          <FlaskConical className="h-2.5 w-2.5" /> Demo session
        </span>

        <button
          type="button"
          onClick={onOpenCommand}
          title="Open the command palette"
          className="group hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] py-1.5 pl-2.5 pr-2 text-silver transition-colors hover:border-f1-cyan/40 hover:text-f1-white md:flex">
          
          <Search className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Command</span>
          <kbd className="flex items-center gap-0.5 rounded border border-white/[0.08] bg-white/[0.03] px-1 py-0.5 font-mono text-[9px] text-silver/70">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <button
          type="button"
          aria-label="Team radio — 1 unread transmission"
          title="Team radio — 1 unread transmission"
          className="relative grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-silver transition-colors hover:border-white/[0.14] hover:text-f1-white">
          
          <Radio className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-cyan" />
        </button>
        <button
          type="button"
          aria-label="Notifications — 3 unread"
          title="Notifications — 3 unread"
          className="relative grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-silver transition-colors hover:border-white/[0.14] hover:text-f1-white">
          
          <Bell className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span className="absolute -right-0.5 -top-0.5 grid h-3 w-3 place-items-center rounded-full bg-f1-red font-mono text-[7px] font-bold text-white">
            3
          </span>
        </button>

        <div className="ml-1 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] py-1 pl-1 pr-2.5">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-f1-cyan/15 font-mono text-[9.5px] font-bold text-f1-cyan ring-1 ring-f1-cyan/30">
            63
          </div>
          <div className="hidden leading-none sm:block">
            <p className="text-[11px] font-medium text-f1-white">A. Shovlin</p>
            <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/60">Race Engineer</p>
          </div>
        </div>
      </div>
    </header>);

}