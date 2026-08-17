import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { crew, stopBreakdown, type SimInputs } from '../../data/strategy';
import { Panel } from '../ui/Panel';

export function PitCrewPlanner({ inputs }: {inputs: SimInputs;}) {
  const total = stopBreakdown.reduce((a, s) => a + s.seconds, 0);
  const ready = crew.filter((c) => c.status === 'ready').length;

  return (
    <Panel
      title="Pit Stop Planner"
      subtitle={`Armed for lap ${inputs.pitLap} · ${inputs.compound} set 4`}
      accent="#3D8BFF"
      className="h-full"
      bodyClassName="p-4 space-y-4"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-green">
          <Users className="h-3 w-3" /> {ready}/{crew.length} ready
        </span>
      }>
      
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <span>Total pit loss</span>
          <span className="font-mono text-[13px] font-semibold text-f1-white tabular">{total.toFixed(1)}s</span>
        </div>
        <div className="flex h-8 overflow-hidden rounded-lg border border-white/[0.07]">
          {stopBreakdown.map((s) =>
          <motion.div
            key={s.label}
            initial={{ flexGrow: 0 }}
            animate={{ flexGrow: s.seconds }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid place-items-center overflow-hidden"
            style={{ background: `${s.color}26`, borderRight: '1px solid rgba(255,255,255,0.06)' }}
            title={`${s.label} · ${s.seconds}s`}>
            
              <span className="truncate px-1 font-mono text-[8.5px] uppercase tracking-[0.1em]" style={{ color: s.color }}>
                {s.seconds}s
              </span>
            </motion.div>
          )}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">
          {stopBreakdown.map((s) =>
          <span key={s.label}>{s.label}</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Crew readiness</p>
        <ul className="grid grid-cols-2 gap-1.5">
          {crew.map((c) => {
            const ok = c.status === 'ready';
            return (
              <li
                key={c.role}
                className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-black/25 px-2 py-1.5">
                
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${ok ? '' : 'animate-pulseGlow'}`}
                  style={{ background: ok ? '#00D68F' : '#FFC531' }} />
                
                <div className="min-w-0">
                  <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-silver-light">
                    {c.role}
                  </p>
                  <p className="truncate font-mono text-[8.5px] text-silver/40">{c.name}</p>
                </div>
              </li>);

          })}
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Mini label="Best stop" value="2.14s" color="#B15CFF" />
        <Mini label="Season avg" value="2.41s" color="#F3F7FB" />
        <Mini label="Pit lane Δ" value="18.9s" color="#3D8BFF" />
      </div>
    </Panel>);

}

function Mini({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[14px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}