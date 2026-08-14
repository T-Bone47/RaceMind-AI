import { useEffect } from "react";

import { useSessionStore } from "@/store/sessionStore";

/** Ticks the mock session store on an interval so the dashboard feels
 * alive. This is the seam that gets replaced by the real WebSocket
 * subscription to backend/api/websocket/routes.py once the desktop app
 * talks to a live backend session. */
export function useMockTelemetry(intervalMs = 400): void {
  const tick = useSessionStore((s: any) => s.tick);

  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);
}
