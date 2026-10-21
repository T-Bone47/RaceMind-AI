import { useEffect, useState } from 'react';

/** Shared heartbeat used across live widgets so the whole cockpit animates in sync. */
export function useLiveTick(intervalMs = 1000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return tick;
}

/** Eases a number toward a target for smooth "instrument needle" behaviour. */
export function useSmoothValue(target: number, factor = 0.18): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    let frame = 0;
    const step = () => {
      setValue((v) => {
        const next = v + (target - v) * factor;
        return Math.abs(next - target) < 0.01 ? target : next;
      });
      frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [target, factor]);
  return value;
}