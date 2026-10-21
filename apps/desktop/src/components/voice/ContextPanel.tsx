import { ChevronRight, Gauge, MessageSquare, Settings2 } from 'lucide-react';
import { contextSignals, recentSessions, voiceProfile } from '../../data/voice';
import { Panel } from '../ui/Panel';

export function ContextPanel() {
  return (
    <div className="flex h-full flex-col gap-3">
      <Panel title="Context Awareness" subtitle="Signals fused into every answer" accent="#00D68F" bodyClassName="p-3">
        <ul className="space-y-1.5">
          {contextSignals.map((s) =>
          <li
            key={s.label}
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
            
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">{s.label}</span>
              <span className="font-mono text-[10.5px] tabular" style={{ color: s.tone }}>
                {s.value}
              </span>
            </li>
          )}
        </ul>
      </Panel>

      <Panel
        title="Voice Profile"
        subtitle={voiceProfile.model}
        accent="#00E5FF"
        bodyClassName="p-3 space-y-2.5"
        actions={
        <button
          type="button"
          aria-label="Voice settings"
          className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] text-silver transition-colors hover:text-f1-white">
          
            <Settings2 className="h-3 w-3" />
          </button>
        }>
        
        <Row icon={Gauge} label="Response latency" value={`${voiceProfile.latency} ms`} color="#00D68F" />
        <Row icon={MessageSquare} label="Persona" value={voiceProfile.persona} color="#F3F7FB" />
        <Row icon={MessageSquare} label="Wake word" value={`“${voiceProfile.wakeWord}”`} color="#00E5FF" />
        <div>
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em]">
            <span className="text-silver/55">Verbosity</span>
            <span className="text-silver-light">Concise ← → Detailed</span>
          </div>
          <div className="mt-1.5 h-[4px] overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-f1-cyan"
              style={{ width: `${voiceProfile.verbosity}%`, boxShadow: '0 0 8px #00E5FF88' }} />
            
          </div>
        </div>
      </Panel>

      <Panel
        title="Recent Conversations"
        subtitle="Archived voice sessions"
        accent="#B15CFF"
        className="min-h-0 flex-1"
        bodyClassName="p-2">
        
        <ul className="space-y-1">
          {recentSessions.map((s) =>
          <li key={s.id}>
              <button
              type="button"
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]">
              
                <span className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-silver/60">
                  {s.tag}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] text-f1-white">{s.title}</p>
                  <p className="font-mono text-[9px] text-silver/45">
                    {s.time} · {s.turns} turns
                  </p>
                </div>
                <ChevronRight className="h-3 w-3 shrink-0 text-silver/40 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          )}
        </ul>
      </Panel>
    </div>);

}

function Row({
  icon: Icon,
  label,
  value,
  color





}: {icon: React.ComponentType<{className?: string;}>;label: string;value: string;color: string;}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-silver/45" />
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-silver/55">{label}</span>
      <span className="ml-auto font-mono text-[10.5px] tabular" style={{ color }}>
        {value}
      </span>
    </div>);

}