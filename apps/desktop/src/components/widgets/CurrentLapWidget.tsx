import { Card, CardTitle, StatReadout } from "@racemind/ui";

import { useSessionStore } from "@/store/sessionStore";

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(3);
  return `${minutes}:${seconds.padStart(6, "0")}`;
}

export function CurrentLapWidget() {
  const { currentLap, totalLaps, lastLapMs, bestLapMs, deltaMs } = useSessionStore((s) => s);

  return (
    <Card>
      <CardTitle>Current Lap</CardTitle>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums text-ink-primary">
          {currentLap}
        </span>
        <span className="font-mono text-sm text-ink-muted">/ {totalLaps}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatReadout label="Last lap" value={formatLapTime(lastLapMs)} />
        <StatReadout
          label="vs. Best"
          value={formatLapTime(bestLapMs)}
          delta={deltaMs}
          deltaFormat={(d) => `${d >= 0 ? "+" : ""}${d.toFixed(3)}`}
        />
      </div>
    </Card>
  );
}
