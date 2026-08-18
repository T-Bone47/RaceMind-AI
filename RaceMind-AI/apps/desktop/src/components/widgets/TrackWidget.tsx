import { Card, CardTitle } from "@racemind/ui";

import { useSessionStore } from "@/store/sessionStore";

/** Simplified Silverstone-esque outline - a real track map per circuit is
 * a future data source (SVG per track), this establishes the widget's
 * shape and position-marker behavior against mock progress. */
const TRACK_PATH =
  "M20,70 L20,40 Q20,25 35,25 L60,25 Q75,25 75,10 L90,10 Q100,10 100,20 L100,45 Q100,55 90,55 L55,55 Q45,55 45,65 L45,75 Q45,85 35,85 L20,85 Q10,85 10,75 Z";

export function TrackWidget() {
  const { trackName, currentLap, totalLaps, lapDistance, trackLength } = useSessionStore((s) => s);
  const progress = trackLength > 0 ? (lapDistance / trackLength) : 0; // use real lap position

  return (
    <Card>
      <CardTitle>Track</CardTitle>
      <p className="mt-1 text-sm font-medium text-ink-primary">{trackName}</p>
      <div className="mt-3 flex items-center justify-center rounded-md bg-carbon/60 p-3">
        <svg viewBox="0 0 110 95" className="h-28 w-full">
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="#2A2D33"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="#2F7FFF"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeDasharray="260"
            strokeDashoffset={260 * (1 - progress)}
          />
        </svg>
      </div>
      <p className="mt-2 text-center font-mono text-xs tabular-nums text-ink-muted">
        Lap {currentLap} of {totalLaps}
      </p>
    </Card>
  );
}
