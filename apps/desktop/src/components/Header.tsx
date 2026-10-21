import { useSessionStore } from "@/store/sessionStore";

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(3);
  return `${minutes}:${seconds.padStart(6, "0")}`;
}

export function Header() {
  const { trackName, currentLap, totalLaps, position, lastLapMs, deltaMs } = useSessionStore((s) => s);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-carbon/80 px-6 backdrop-blur">
      <div className="flex items-center gap-6">
        <span className="text-sm font-medium text-ink-primary">{trackName}</span>
        <span className="font-mono text-xs tabular-nums text-ink-muted">
          LAP {String(currentLap).padStart(2, "0")}/{totalLaps}
        </span>
        <span className="font-mono text-xs tabular-nums text-ink-muted">P{position}</span>
      </div>

      <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
        <span className="text-ink-secondary">LAST {formatLapTime(lastLapMs)}</span>
        <span className={deltaMs < 0 ? "text-signal-green" : "text-signal-red"}>
          {deltaMs >= 0 ? "+" : ""}
          {deltaMs.toFixed(3)}
        </span>
      </div>
    </header>
  );
}
