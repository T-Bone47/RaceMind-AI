"use client";

import { Badge, StatReadout, WearBar } from "@racemind/ui";
import { useEffect, useState } from "react";

interface Frame {
  lap: number;
  totalLaps: number;
  s1: number;
  s2: number;
  s3: number;
  tyreWear: number;
  fuelKg: number;
  fuelLaps: number;
  message: string;
}

const SCRIPT: Frame[] = [
  { lap: 12, totalLaps: 58, s1: 0.14, s2: -0.22, s3: 0.05, tyreWear: 58, fuelKg: 43.1, fuelLaps: 24, message: "Gap ahead is 1.8. Keep building the tyre delta." },
  { lap: 13, totalLaps: 58, s1: -0.08, s2: -0.31, s3: -0.02, tyreWear: 61, fuelKg: 41.3, fuelLaps: 23, message: "That's the lap. Purple sector two." },
  { lap: 14, totalLaps: 58, s1: 0.22, s2: 0.18, s3: 0.34, tyreWear: 64, fuelKg: 39.5, fuelLaps: 22, message: "Box this lap. Undercut window is live." },
  { lap: 15, totalLaps: 58, s1: -0.05, s2: 0.02, s3: -0.11, tyreWear: 12, fuelKg: 37.8, fuelLaps: 21, message: "Copy, new tyres on. Push out lap." },
];

/** A real runtime guarantee, not just a type-checker workaround - `??
 * SCRIPT[0]` alone doesn't satisfy `noUncheckedIndexedAccess` because
 * TypeScript can't know SCRIPT is non-empty from a plain array type, so
 * the fallback is *also* typed as possibly-undefined. Throwing here
 * gives control-flow analysis something to actually narrow on. */
function getFrame(index: number): Frame {
  const frame = SCRIPT[index % SCRIPT.length];
  if (!frame) {
    throw new Error("TelemetryHeroPanel: SCRIPT must not be empty");
  }
  return frame;
}

export function TelemetryHeroPanel() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % SCRIPT.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const frame = getFrame(frameIndex);

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-graphite/90 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Badge variant="green" pulse>
          LIVE
        </Badge>
        <span className="font-mono text-xs tabular-nums text-ink-muted">
          LAP {String(frame.lap).padStart(2, "0")}/{frame.totalLaps}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatReadout label="S1" value={frame.s1 >= 0 ? `+${frame.s1.toFixed(2)}` : frame.s1.toFixed(2)} delta={frame.s1} />
        <StatReadout label="S2" value={frame.s2 >= 0 ? `+${frame.s2.toFixed(2)}` : frame.s2.toFixed(2)} delta={frame.s2} />
        <StatReadout label="S3" value={frame.s3 >= 0 ? `+${frame.s3.toFixed(2)}` : frame.s3.toFixed(2)} delta={frame.s3} />
      </div>

      <div className="mt-5 space-y-2">
        <WearBar label="TYRE" percent={frame.tyreWear} />
        <div className="flex items-center gap-2 pl-10">
          <span className="font-mono text-[11px] tabular-nums text-ink-secondary">
            {frame.fuelKg.toFixed(1)}kg fuel - ~{frame.fuelLaps} laps
          </span>
        </div>
      </div>

      <div
        key={frameIndex}
        className="mt-4 animate-flicker-in rounded-md border border-electric/25 bg-electric/[0.07] px-3 py-2"
      >
        <p className="font-mono text-[13px] leading-relaxed text-ink-primary">&ldquo;{frame.message}&rdquo;</p>
        <span className="mt-1 block text-[10px] uppercase tracking-wider text-ink-muted">AI Engineer</span>
      </div>
    </div>
  );
}
