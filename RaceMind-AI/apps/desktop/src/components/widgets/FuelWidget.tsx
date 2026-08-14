import { Card, CardTitle, StatReadout } from "@racemind/ui";

import { useSessionStore } from "@/store/sessionStore";

export function FuelWidget() {
  const { fuelKg, fuelPerLapKg, totalLaps, currentLap } = useSessionStore((s) => s);
  const lapsRemaining = fuelPerLapKg > 0 ? fuelKg / fuelPerLapKg : Infinity;
  const lapsLeftInRace = totalLaps - currentLap;
  const isCritical = lapsRemaining < lapsLeftInRace + 1;

  return (
    <Card>
      <CardTitle>Fuel</CardTitle>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-3xl font-semibold tabular-nums text-ink-primary">
          {fuelKg.toFixed(1)}
        </span>
        <span className="font-mono text-sm text-ink-muted">kg</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatReadout label="Per lap" value={fuelPerLapKg.toFixed(2)} unit="kg" />
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Laps left
          </span>
          <span
            className={`font-mono text-lg font-medium tabular-nums ${isCritical ? "text-signal-red" : "text-ink-primary"}`}
          >
            {Number.isFinite(lapsRemaining) ? lapsRemaining.toFixed(1) : "-"}
          </span>
        </div>
      </div>
    </Card>
  );
}
