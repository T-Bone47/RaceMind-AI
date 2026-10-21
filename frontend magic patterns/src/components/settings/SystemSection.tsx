import React from 'react';
import { Plug, RefreshCw } from 'lucide-react';
import { integrations, shortcuts, type SettingsState } from '../../data/settings';
import { Panel } from '../ui/Panel';
import { Segmented, SettingRow, SliderControl, Toggle } from './controls';

interface Props {
  settings: SettingsState;
  onChange: (patch: Partial<SettingsState>) => void;
}

const statusMeta = {
  connected: { color: '#00D68F', label: 'Connected' },
  syncing: { color: '#FFC531', label: 'Syncing' },
  disconnected: { color: '#8E99A8', label: 'Offline' }
};

export function SystemSection({ settings, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Panel title="Telemetry" subtitle="Acquisition and channel processing" accent="#00E5FF" bodyClassName="p-0">
        <SettingRow label="Sample rate" hint="Higher rates capture transient events but increase archive size.">
          <Segmented
            label="Sample rate"
            value={settings.sampleRate}
            onChange={(v) => onChange({ sampleRate: v })}
            options={[
            { value: 100 as const, label: '100 Hz' },
            { value: 280 as const, label: '280 Hz' },
            { value: 500 as const, label: '500 Hz' }]
            } />
          
        </SettingRow>
        <SettingRow label="Channel smoothing" hint="Applied to displayed traces only. Raw data is always archived unfiltered.">
          <SliderControl
            label="Channel smoothing"
            value={settings.channelSmoothing}
            onChange={(v) => onChange({ channelSmoothing: v })}
            suffix="%" />
          
        </SettingRow>
        <SettingRow label="Auto-scrub on new lap" hint="Jumps the playhead to the freshest completed lap automatically.">
          <Toggle label="Auto-scrub on new lap" checked={settings.autoScrub} onChange={(v) => onChange({ autoScrub: v })} />
        </SettingRow>
      </Panel>

      <Panel title="Notifications" subtitle="What is allowed to interrupt you" accent="#FFC531" bodyClassName="p-0">
        <SettingRow label="Strategy opportunities" hint="Pit windows, undercut alerts and rival reactions.">
          <Toggle
            label="Strategy opportunities"
            checked={settings.notifyStrategy}
            onChange={(v) => onChange({ notifyStrategy: v })} />
          
        </SettingRow>
        <SettingRow label="Reliability warnings" hint="Component temperatures, pressures and failure probability shifts.">
          <Toggle
            label="Reliability warnings"
            checked={settings.notifyReliability}
            onChange={(v) => onChange({ notifyReliability: v })} />
          
        </SettingRow>
        <SettingRow label="Weather changes" hint="Rain probability crossing 40% or a wind shift beyond 30°.">
          <Toggle
            label="Weather changes"
            checked={settings.notifyWeather}
            onChange={(v) => onChange({ notifyWeather: v })} />
          
        </SettingRow>
        <SettingRow label="Rival radio transcripts" hint="Broadcast radio from other teams, transcribed and summarised.">
          <Toggle label="Rival radio transcripts" checked={settings.notifyRadio} onChange={(v) => onChange({ notifyRadio: v })} />
        </SettingRow>
        <SettingRow label="Quiet during practice" hint="Suppresses everything except critical alerts in FP sessions.">
          <Toggle label="Quiet during practice" checked={settings.quietPractice} onChange={(v) => onChange({ quietPractice: v })} />
        </SettingRow>
      </Panel>

      <Panel
        title="Integrations"
        subtitle="Upstream data sources"
        accent="#00D68F"
        bodyClassName="p-3"
        actions={
        <button
          type="button"
          aria-label="Re-sync all integrations"
          className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] text-silver transition-colors hover:text-f1-white">
          
            <RefreshCw className="h-3 w-3" />
          </button>
        }>
        
        <ul className="grid gap-1.5 lg:grid-cols-2">
          {integrations.map((it) => {
            const meta = statusMeta[it.status];
            return (
              <li
                key={it.name}
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
                
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                  style={{ background: `${meta.color}1a`, color: meta.color }}>
                  
                  <Plug className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] text-f1-white">{it.name}</p>
                  <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">
                    {it.detail}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                  <p className="font-mono text-[9px] text-silver/45 tabular">{it.latency}</p>
                </div>
              </li>);

          })}
        </ul>
      </Panel>

      <Panel title="Keyboard Shortcuts" subtitle="Pit wall speed keys" accent="#B15CFF" bodyClassName="p-3">
        <ul className="grid gap-1 lg:grid-cols-2">
          {shortcuts.map((s) =>
          <li
            key={s.action}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03]">
            
              <span className="min-w-0 truncate text-[11.5px] text-silver-light">{s.action}</span>
              <span className="flex shrink-0 items-center gap-1">
                {s.keys.map((k) =>
              <kbd
                key={k}
                className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-silver-light">
                
                    {k}
                  </kbd>
              )}
              </span>
            </li>
          )}
        </ul>
      </Panel>
    </div>);

}