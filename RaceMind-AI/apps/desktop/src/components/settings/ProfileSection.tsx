import { Camera } from 'lucide-react';
import type { SettingsState } from '../../data/settings';
import { focusDriver } from '../../data/race';
import { Panel } from '../ui/Panel';
import { Segmented, SettingRow, TextField } from './controls';

interface Props {
  settings: SettingsState;
  onChange: (patch: Partial<SettingsState>) => void;
}

export function ProfileSection({ settings, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Panel title="Identity" subtitle="Who this workspace belongs to" accent="#00E5FF" bodyClassName="p-0">
        <div className="flex items-center gap-4 border-b border-white/[0.05] p-4">
          <div className="relative">
            <div
              className="grid h-16 w-16 place-items-center rounded-xl border"
              style={{ borderColor: `${focusDriver.teamColor}55`, background: `${focusDriver.teamColor}14` }}>
              
              <span className="font-mono text-[22px] font-bold" style={{ color: focusDriver.teamColor }}>
                {focusDriver.number}
              </span>
            </div>
            <button
              type="button"
              aria-label="Change avatar"
              className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-lg border border-white/[0.12] bg-carbon-600 text-silver transition-colors hover:text-f1-white">
              
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-f1-white">{settings.engineer}</p>
            <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver/55">
              Race engineer · car {focusDriver.number} · clearance level 4
            </p>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-f1-green">
              Session access · full command authority
            </p>
          </div>
        </div>

        <SettingRow label="Engineer name" hint="Displayed on radio transcripts and committed strategy calls.">
          <TextField value={settings.engineer} onChange={(v) => onChange({ engineer: v })} label="Engineer name" />
        </SettingRow>
        <SettingRow label="Assigned driver" hint="All analytics and telemetry default to this car.">
          <TextField value={settings.driver} onChange={(v) => onChange({ driver: v })} label="Assigned driver" />
        </SettingRow>
        <SettingRow label="Team" hint="Used for branding, permissions and data residency.">
          <TextField value={settings.team} onChange={(v) => onChange({ team: v })} label="Team" />
        </SettingRow>
      </Panel>

      <Panel title="Session Defaults" subtitle="How data is presented everywhere" accent="#00D68F" bodyClassName="p-0">
        <SettingRow label="Units" hint="Metric uses °C, kph and kilograms throughout the platform.">
          <Segmented
            label="Units"
            value={settings.units}
            onChange={(v) => onChange({ units: v })}
            options={[
            { value: 'Metric' as const, label: 'Metric' },
            { value: 'Imperial' as const, label: 'Imperial' }]
            } />
          
        </SettingRow>
        <SettingRow label="Time format" hint="Affects race control timestamps and the session clock.">
          <Segmented
            label="Time format"
            value={settings.timeFormat}
            onChange={(v) => onChange({ timeFormat: v })}
            options={[
            { value: '24h' as const, label: '24 hour' },
            { value: '12h' as const, label: '12 hour' }]
            } />
          
        </SettingRow>
        <SettingRow label="Reference lap" hint="The benchmark every delta trace is measured against.">
          <Segmented
            label="Reference lap"
            value={settings.referenceLap}
            onChange={(v) => onChange({ referenceLap: v })}
            options={[
            { value: 'best' as const, label: 'Session best' },
            { value: 'previous' as const, label: 'Previous' },
            { value: 'teammate' as const, label: 'Teammate' }]
            } />
          
        </SettingRow>
      </Panel>
    </div>);

}