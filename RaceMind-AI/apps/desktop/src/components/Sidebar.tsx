import { Badge } from "@racemind/ui";
import { Gauge, LayoutDashboard, LineChart, Radio, Settings, Timer, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useSessionStore } from "@/store/sessionStore";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/session", label: "Session", icon: Timer },
  { to: "/telemetry", label: "Telemetry", icon: LineChart },
  { to: "/strategy", label: "Strategy", icon: Gauge },
  { to: "/setups", label: "Setups", icon: Wrench },
  { to: "/engineer", label: "AI Engineer", icon: Radio },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const connected = useSessionStore((s) => s.connected);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-graphite/40">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-electric text-[11px] font-semibold text-white">
          R
        </span>
        <span className="font-mono text-sm font-semibold">
          RaceMind<span className="text-electric">AI</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-electric/15 text-electric"
                  : "text-ink-secondary hover:bg-graphite-light hover:text-ink-primary",
              ].join(" ")
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Badge variant={connected ? "green" : "red"} pulse={connected} className="w-full justify-center">
          {connected ? "Connected" : "No session"}
        </Badge>
      </div>
    </aside>
  );
}
