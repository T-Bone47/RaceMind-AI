import { cn } from "./utils/cn";

export interface WearBarProps {
  /** 0-100. Colors shift green -> amber -> red as it climbs, matching
   * the same semantic convention used everywhere else (green = fine,
   * amber = watch it, red = act now). */
  percent: number;
  label?: string;
  className?: string;
}

function colorFor(percent: number): string {
  if (percent >= 80) return "#FF4D4D";
  if (percent >= 55) return "#FFB020";
  return "#22D67A";
}

export function WearBar({ percent, label, className }: WearBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const color = colorFor(clamped);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="w-8 shrink-0 font-mono text-[11px] font-medium uppercase text-[#6B7280]">
          {label}
        </span>
      )}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#212429]">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-[11px] tabular-nums text-[#9CA3AF]">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
