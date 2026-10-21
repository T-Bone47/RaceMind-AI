import { Panel } from '../ui/Panel';

export function DynamicsPanel() {
  return (
    <Panel
      title="Vehicle Dynamics"
      subtitle="Friction circle · ride height · slip"
      accent="#FF7A29"
      className="h-full"
      bodyClassName="p-4 flex flex-col items-center justify-center text-center">
      
      <div className="rounded-full bg-white/[0.03] p-4 mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF7A29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-silver/70 mb-1">
        Advanced Telemetry Unavailable
      </p>
      <p className="font-mono text-[9.5px] tracking-[0.05em] text-silver/40 max-w-[200px]">
        Waiting for high-resolution physics channels (G-force, ride height, wheel slip) from the telemetry stream.
      </p>
    </Panel>
  );
}
