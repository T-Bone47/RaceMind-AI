
import { Panel } from '../ui/Panel';
import { brakeTemps, tyreLoads } from '../../data/telemetry';

function tempColor(t: number): string {
  if (t > 680) return '#E10600';
  if (t > 560) return '#FF7A29';
  if (t > 420) return '#FFC531';
  return '#3D8BFF';
}

export function LoadsPanel() {
  return (
    <Panel
      title="Loads & Thermals"
      subtitle="Brake discs · vertical tyre load"
      accent="#E10600"
      className="h-full"
      bodyClassName="p-4"
      actions={<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">Live</span>}>
      
      <div className="relative mx-auto w-full max-w-[280px]">
        <div className="relative grid grid-cols-2 gap-x-14 gap-y-6 py-2">
          <span className="pointer-events-none absolute left-1/2 top-6 bottom-6 w-[2px] -translate-x-1/2 rounded-full bg-white/[0.07]" />
          <span className="pointer-events-none absolute left-1/2 top-[38%] h-[2px] w-[86px] -translate-x-1/2 rounded-full bg-white/[0.07]" />

          {brakeTemps.map((b) => {
            const load = tyreLoads.find((t) => t.label === b.label);
            const color = tempColor(b.value);
            return (
              <div key={b.label} className="flex flex-col items-center">
                <div className="relative grid h-16 w-11 place-items-center">
                  <span
                    className="absolute inset-0 rounded-md opacity-25 blur-[8px]"
                    style={{ background: color }} />
                  
                  <span
                    className="absolute inset-0 rounded-md border-2"
                    style={{ borderColor: `${color}cc`, background: 'rgba(0,0,0,0.45)' }} />
                  
                  <span className="absolute inset-[7px] rounded-sm border border-white/10 carbon-weave" />
                  <span className="relative font-mono text-[11px] font-bold" style={{ color }}>
                    {b.value}
                  </span>
                  <span className="absolute -bottom-0.5 font-mono text-[7.5px] text-silver/50">°C</span>
                </div>
                <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
                  {b.label}
                </span>
                <span className="mt-1 font-mono text-[10px] tabular text-f1-cyan">{load?.value} kN</span>
                <div className="mt-1 h-[3px] w-11 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-f1-cyan"
                    style={{ width: `${(load?.value ?? 0) / 5 * 100}%` }} />
                  
                </div>
              </div>);

          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Summary label="Brake bias" value="56.5%" sub="front" color="#F3F7FB" />
        <Summary label="Diff entry" value="POS 4" sub="mid 6 · exit 5" color="#00D68F" />
        <Summary label="Front wing" value="+0.25°" sub="flap adjust" color="#00E5FF" />
        <Summary label="Aero balance" value="45.2%" sub="front" color="#B15CFF" />
      </div>
    </Panel>);

}

function Summary({ label, value, sub, color }: {label: string;value: string;sub: string;color: string;}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[14px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
      <p className="mt-1 font-mono text-[8.5px] text-silver/40">{sub}</p>
    </div>);

}
