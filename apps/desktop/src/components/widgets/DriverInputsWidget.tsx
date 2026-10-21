import { Card, CardTitle } from "@racemind/ui";

import { useSessionStore } from "@/store/sessionStore";

export function DriverInputsWidget() {
  const inputs = useSessionStore((s) => s.driverInputs);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Driver Inputs</CardTitle>
        <div className="flex items-center gap-2">
          {inputs.drsActive && (
            <span className="rounded bg-signal-green/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-signal-green">
              DRS
            </span>
          )}
          <span className="font-mono text-lg font-semibold tabular-nums text-ink-primary">
            {inputs.gear}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <InputBar label="Throttle" percent={inputs.throttlePct} color="#22D67A" />
        <InputBar label="Brake" percent={inputs.brakePct} color="#FF4D4D" />

        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 font-mono text-[11px] uppercase text-ink-muted">Steer</span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-graphite-light">
            <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
            <div
              className="absolute top-0 h-full w-1.5 rounded-full bg-electric transition-[left] duration-100"
              style={{ left: `calc(${((inputs.steering + 1) / 2) * 100}% - 3px)` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Speed</span>
          <span className="font-mono text-lg font-medium tabular-nums text-ink-primary">
            {Math.round(inputs.speedKph)}
            <span className="ml-1 text-xs text-ink-muted">km/h</span>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">RPM</span>
          <span className="font-mono text-lg font-medium tabular-nums text-ink-primary">
            {Math.round(inputs.engineRpm)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function InputBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 font-mono text-[11px] uppercase text-ink-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-graphite-light">
        <div
          className="h-full rounded-full transition-[width] duration-100"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink-secondary">
        {Math.round(percent)}%
      </span>
    </div>
  );
}
