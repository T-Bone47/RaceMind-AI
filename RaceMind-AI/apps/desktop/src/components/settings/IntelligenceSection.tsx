import { AlertTriangle } from 'lucide-react';
import type { SettingsState } from '../../data/settings';
import { Panel } from '../ui/Panel';
import { Segmented, SettingRow, SliderControl, Toggle } from './controls';

interface Props {
  settings: SettingsState;
  onChange: (patch: Partial<SettingsState>) => void;
}

const autonomyCopy = {
  advisory: 'RaceMind surfaces recommendations only. Every action requires a human to execute it.',
  assisted: 'RaceMind pre-arms the crew and drafts radio calls, but a strategist must confirm before anything is sent.',
  autonomous:
  'RaceMind may execute pre-approved actions — pit window arming and engine mode changes — without confirmation when confidence exceeds the gate.'
};

export function IntelligenceSection({ settings, onChange }: Props) {
  const risky = settings.autonomy === 'autonomous' && settings.confidenceGate < 85;

  return (
    <div className="space-y-3">
      <Panel title="AI Autonomy" subtitle="How much the system may act on its own" accent="#00E5FF" bodyClassName="p-0">
        <SettingRow label="Operating mode" hint={autonomyCopy[settings.autonomy]}>
          <Segmented
            label="Operating mode"
            value={settings.autonomy}
            onChange={(v) => onChange({ autonomy: v })}
            options={[
            { value: 'advisory' as const, label: 'Advisory' },
            { value: 'assisted' as const, label: 'Assisted' },
            { value: 'autonomous' as const, label: 'Autonomous' }]
            } />
          
        </SettingRow>
        <SettingRow
          label="Confidence gate"
          hint="Recommendations below this threshold are held back rather than surfaced to the pit wall.">
          
          <SliderControl
            label="Confidence gate"
            value={settings.confidenceGate}
            min={50}
            max={99}
            onChange={(v) => onChange({ confidenceGate: v })}
            suffix="%" />
          
        </SettingRow>
        <SettingRow label="Reasoning depth" hint="Deeper reasoning is more thorough but adds latency to every answer.">
          <SliderControl
            label="Reasoning depth"
            value={settings.reasoningDepth}
            min={1}
            max={5}
            onChange={(v) => onChange({ reasoningDepth: v })}
            color="#B15CFF" />
          
        </SettingRow>
        <SettingRow label="Monte Carlo runs" hint="More runs sharpen the outcome distribution at the cost of refresh rate.">
          <Segmented
            label="Monte Carlo runs"
            value={settings.monteCarloRuns}
            onChange={(v) => onChange({ monteCarloRuns: v })}
            options={[
            { value: 6000 as const, label: '6k' },
            { value: 12000 as const, label: '12k' },
            { value: 24000 as const, label: '24k' }]
            } />
          
        </SettingRow>
        <SettingRow label="Proactive alerts" hint="Let the engineer interrupt you when it detects a time-critical opportunity.">
          <Toggle
            label="Proactive alerts"
            checked={settings.proactiveAlerts}
            onChange={(v) => onChange({ proactiveAlerts: v })} />
          
        </SettingRow>

        {risky &&
        <div className="m-4 mt-0 flex items-start gap-2.5 rounded-lg border border-f1-amber/30 bg-f1-amber/[0.07] p-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-f1-amber" />
            <p className="text-[11.5px] leading-relaxed text-silver-light">
              Autonomous mode with a gate below 85% permits the system to act on calls it is not certain about. Most
              teams keep the gate at 90% or higher when autonomy is enabled.
            </p>
          </div>
        }
      </Panel>

      <Panel title="Ollie · Voice" subtitle="Persona, wake word and speech behaviour" accent="#00D68F" bodyClassName="p-0">
        <SettingRow label="Persona" hint="Sets the tone of spoken responses during a session.">
          <Segmented
            label="Persona"
            value={settings.voicePersona}
            onChange={(v) => onChange({ voicePersona: v })}
            options={[
            { value: 'Calm' as const, label: 'Calm' },
            { value: 'Direct' as const, label: 'Direct' },
            { value: 'Analytical' as const, label: 'Analytical' }]
            } />
          
        </SettingRow>
        <SettingRow label="Wake word" hint="Say “Engineer” to open the channel without touching a control.">
          <Toggle label="Wake word" checked={settings.wakeWord} onChange={(v) => onChange({ wakeWord: v })} />
        </SettingRow>
        <SettingRow label="Verbosity" hint="Lower is terse and radio-ready. Higher includes supporting reasoning.">
          <SliderControl
            label="Verbosity"
            value={settings.verbosity}
            onChange={(v) => onChange({ verbosity: v })}
            suffix="%"
            color="#00D68F" />
          
        </SettingRow>
      </Panel>
    </div>);

}