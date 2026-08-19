import { Panel } from '../ui/Panel';

export function LoadsPanel() {
  return (
    <Panel
      title="Loads & Thermals"
      subtitle="Brake discs · vertical tyre load"
      accent="#E10600"
      className="h-full"
      bodyClassName="p-4 flex flex-col items-center justify-center text-center">
      
      <div className="rounded-full bg-white/[0.03] p-4 mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
          <path d="M12 9a4 4 0 0 0-2 7.5" />
          <path d="M12 3v2" />
          <path d="m6.6 18.4-1.4 1.4" />
          <path d="M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
        </svg>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-silver/70 mb-1">
        Thermal Data Unavailable
      </p>
      <p className="font-mono text-[9.5px] tracking-[0.05em] text-silver/40 max-w-[200px]">
        Waiting for brake temperatures and tyre load channels from the telemetry stream.
      </p>
    </Panel>
  );
}
