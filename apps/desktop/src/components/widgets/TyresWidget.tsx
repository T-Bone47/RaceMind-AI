import { Card, CardTitle, WearBar } from "@racemind/ui";
import { TYRE_COMPOUND_LABELS } from "@racemind/types";

import { useSessionStore } from "@/store/sessionStore";

export function TyresWidget() {
  const tyres = useSessionStore((s) => s.tyres);

  return (
    <Card>
      <CardTitle>Tyres</CardTitle>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-lg font-medium text-ink-primary">
          {TYRE_COMPOUND_LABELS[tyres.compound]}
        </span>
        <span className="font-mono text-xs tabular-nums text-ink-muted">{tyres.ageLaps} laps</span>
      </div>
      <div className="mt-4 space-y-2.5">
        <WearBar label="FL" percent={tyres.fl} />
        <WearBar label="FR" percent={tyres.fr} />
        <WearBar label="RL" percent={tyres.rl} />
        <WearBar label="RR" percent={tyres.rr} />
      </div>
    </Card>
  );
}
