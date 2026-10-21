import { Panel } from '../ui/Panel';

export function CornerAnalysis() {
  return (
    <Panel
      title="Corner & Micro-Sector Analysis"
      subtitle="Waiting for completed lap..."
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-4 flex flex-col items-center justify-center text-center">
      
      <div className="rounded-full bg-white/[0.03] p-4 mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D68F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
          <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M2 15h10" />
          <path d="m9 18 3-3-3-3" />
        </svg>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-silver/70 mb-1">
        Corner Analysis Unavailable
      </p>
      <p className="font-mono text-[9.5px] tracking-[0.05em] text-silver/40 max-w-[250px]">
        Micro-sector generation and corner performance deltas require at least one fully completed flying lap.
      </p>
    </Panel>
  );
}