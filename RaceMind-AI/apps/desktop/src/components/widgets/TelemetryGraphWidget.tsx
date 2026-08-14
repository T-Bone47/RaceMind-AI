import { Card, CardTitle } from "@racemind/ui";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

import { useSessionStore } from "@/store/sessionStore";

export function TelemetryGraphWidget() {
  const speedHistory = useSessionStore((s) => s.speedHistory);
  const data = speedHistory.map((speed, i) => ({ i, speed }));
  const currentSpeed = speedHistory[speedHistory.length - 1] ?? 0;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Telemetry - Speed</CardTitle>
        <span className="font-mono text-sm tabular-nums text-ink-primary">
          {Math.round(currentSpeed)} <span className="text-ink-muted">km/h</span>
        </span>
      </div>
      <div className="mt-3 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <YAxis domain={[0, 340]} hide />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#2F7FFF"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
