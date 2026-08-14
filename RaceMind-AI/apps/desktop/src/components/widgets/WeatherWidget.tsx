import { Card, CardTitle } from "@racemind/ui";
import { Cloud, CloudRain, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useSessionStore } from "@/store/sessionStore";

const WEATHER_ICON: Record<string, LucideIcon> = {
  clear: Sun,
  light_cloud: Cloud,
  overcast: Cloud,
  light_rain: CloudRain,
  heavy_rain: CloudRain,
  storm: CloudRain,
};

const WEATHER_LABEL: Record<string, string> = {
  clear: "Clear",
  light_cloud: "Light cloud",
  overcast: "Overcast",
  light_rain: "Light rain",
  heavy_rain: "Heavy rain",
  storm: "Storm",
};

export function WeatherWidget() {
  const { weather, airTempC, trackTempC } = useSessionStore((s) => s);
  const Icon = WEATHER_ICON[weather] ?? Cloud;

  return (
    <Card>
      <CardTitle>Weather</CardTitle>
      <div className="mt-2 flex items-center gap-3">
        <Icon className="h-8 w-8 text-electric" strokeWidth={1.5} />
        <span className="text-lg font-medium text-ink-primary">{WEATHER_LABEL[weather]}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Air</span>
          <span className="font-mono text-lg font-medium tabular-nums text-ink-primary">
            {airTempC}°C
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Track</span>
          <span className="font-mono text-lg font-medium tabular-nums text-ink-primary">
            {trackTempC}°C
          </span>
        </div>
      </div>
    </Card>
  );
}
