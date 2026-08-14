import type { HTMLAttributes } from "react";

import { cn } from "./utils/cn";

export interface StatReadoutProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  unit?: string;
  /** Signed delta shown next to the value, colored green (faster/better)
   * or red (slower/worse) by sign - mirrors real timing-screen sector
   * deltas. Omit for values with no "better/worse" direction. */
  delta?: number;
  deltaFormat?: (delta: number) => string;
}

const defaultDeltaFormat = (delta: number) => `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`;

export function StatReadout({
  label,
  value,
  unit,
  delta,
  deltaFormat = defaultDeltaFormat,
  className,
  ...props
}: StatReadoutProps) {
  const hasDelta = typeof delta === "number";
  const deltaIsFaster = hasDelta && delta < 0; // lower time = faster, matches real timing convention

  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <span className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-lg font-medium tabular-nums text-[#F5F6F7]">
          {value}
          {unit && <span className="ml-1 text-sm text-[#9CA3AF]">{unit}</span>}
        </span>
        {hasDelta && (
          <span
            className={cn(
              "font-mono text-xs font-medium tabular-nums",
              deltaIsFaster ? "text-[#22D67A]" : "text-[#FF4D4D]",
            )}
          >
            {deltaFormat(delta)}
          </span>
        )}
      </div>
    </div>
  );
}
