import { Plug, Wifi, Server, RefreshCw } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { Panel } from '../ui/Panel';
import { useEffect, useState } from 'react';
import { SettingsState } from '../../data/settings';

interface Props {
  settings: SettingsState;
  onChange: (p: Partial<SettingsState>) => void;
}

export function ConnectionsSection({ settings, onChange }: Props) {
  const connected = useSessionStore((s) => s.connected);
  const lastTelemetryAt = useSessionStore((s) => s.lastTelemetryAt);
  const [now, setNow] = useState(Date.now());

  // Force re-render every second to update the "Waiting for data" / "Connected" status
  // since lastTelemetryAt might not change if data stops, we need current time to compare.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const agentStatus = useSessionStore((s) => s.agentStatus);
  const agentUdpPort = useSessionStore((s) => s.agentUdpPort) || 20777;

  const gameConnected = now - lastTelemetryAt < 2000;
  // Fallback to time-based if we don't have agentStatus, otherwise prefer agentStatus
  const isReceiving = agentStatus === "RECEIVING" || gameConnected;

  const backendMeta = connected
    ? { color: '#00D68F', label: 'Connected' }
    : { color: '#FF3B30', label: 'Offline' };

  let gameMeta = { color: '#FFC531', label: 'Waiting for UDP' };
  
  if (agentStatus === "PORT_CONFLICT") {
      gameMeta = { color: '#FF3B30', label: 'Port Conflict' };
  } else if (agentStatus === "FAILED") {
      gameMeta = { color: '#FF3B30', label: 'Failed' };
  } else if (isReceiving) {
      gameMeta = { color: '#00D68F', label: 'Receiving' };
  } else if (agentStatus === "CONNECTED") {
      gameMeta = { color: '#FFC531', label: 'Waiting for F1 Data' };
  }

  return (
    <div className="space-y-3">
      <Panel
        title="Live Connections"
        subtitle="Game and Cloud Uplink status"
        accent="#00E5FF"
        bodyClassName="p-3">
        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver/60">
            Backend URL
          </label>
          <input
            type="text"
            value={settings.backendUrl}
            onChange={(e) => onChange({ backendUrl: e.target.value })}
            placeholder="https://racemind-ai-backend.up.railway.app"
            className="w-full rounded-md border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-f1-white placeholder-silver/30 outline-none focus:border-f1-cyan/50 focus:bg-black/60"
          />
          <p className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/40">
            Configure this to your local testing URL (e.g. http://localhost:8000) if the cloud uplink is offline.
          </p>
        </div>
        <ul className="grid gap-1.5 lg:grid-cols-2">
          {/* Cloud Uplink */}
          <li className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
              style={{ background: `${backendMeta.color}1a`, color: backendMeta.color }}>
              <Server className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] text-f1-white">RaceMind Cloud Uplink</p>
              <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">
                Authentication & AI Backend
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: backendMeta.color }}>
                {backendMeta.label}
              </p>
            </div>
          </li>

          {/* F1 Game Telemetry */}
          <li className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
              style={{ background: `${gameMeta.color}1a`, color: gameMeta.color }}>
              <Wifi className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] text-f1-white">F1 Game Telemetry</p>
              <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">
                UDP Port {agentUdpPort}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: gameMeta.color }}>
                {gameMeta.label}
              </p>
            </div>
          </li>
        </ul>
      </Panel>
    </div>
  );
}
