import type { SettingsState } from '../../data/settings';
import { accentOptions } from '../../data/settings';
import { Panel } from '../ui/Panel';
import { Segmented, SettingRow, SliderControl, SwatchPicker, Toggle } from './controls';

interface Props {
  settings: SettingsState;
  onChange: (patch: Partial<SettingsState>) => void;
}

export function InterfaceSection({ settings, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Panel title="Appearance" subtitle="Accent, density and surface treatment" accent={settings.accent} bodyClassName="p-0">
        <div className="border-b border-white/[0.05] p-4">
          <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Live preview</p>
          <div
            className="relative overflow-hidden rounded-lg border p-3"
            style={{ borderColor: `${settings.accent}33`, background: 'rgba(0,0,0,0.3)' }}>
            
            {settings.gridOverlay &&
            <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
            }
            <div className="relative flex items-center gap-3">
              <span className="h-8 w-[3px] rounded-full" style={{ background: settings.accent }} />
              <div>
                <p
                  className="font-mono uppercase tracking-[0.16em]"
                  style={{ fontSize: `${9 * (settings.fontScale / 100)}px`, color: settings.accent }}>
                  
                  Gap ahead
                </p>
                <p
                  className="font-mono font-semibold text-f1-white tabular"
                  style={{ fontSize: `${22 * (settings.fontScale / 100)}px` }}>
                  
                  −1.842
                </p>
              </div>
              <div
                className="ml-auto rounded-lg px-3"
                style={{
                  background: `${settings.accent}18`,
                  paddingBlock: settings.density === 'dense' ? 4 : settings.density === 'compact' ? 6 : 9
                }}>
                
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: settings.accent }}>
                  {settings.density}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SettingRow label="Accent colour" hint="Applied to focus states, live indicators and primary actions.">
          <SwatchPicker value={settings.accent} options={accentOptions} onChange={(v) => onChange({ accent: v })} />
        </SettingRow>
        <SettingRow label="Layout density" hint="Dense fits more channels on ultra-wide pit wall displays.">
          <Segmented
            label="Layout density"
            value={settings.density}
            onChange={(v) => onChange({ density: v })}
            options={[
            { value: 'comfortable' as const, label: 'Comfortable' },
            { value: 'compact' as const, label: 'Compact' },
            { value: 'dense' as const, label: 'Dense' }]
            } />
          
        </SettingRow>
        <SettingRow label="Glass surfaces" hint="Translucent panels with background blur. Disable on low-power displays.">
          <Toggle label="Glass surfaces" checked={settings.glass} onChange={(v) => onChange({ glass: v })} />
        </SettingRow>
        <SettingRow label="Grid overlay" hint="Engineering grid behind panels for spatial reference.">
          <Toggle label="Grid overlay" checked={settings.gridOverlay} onChange={(v) => onChange({ gridOverlay: v })} />
        </SettingRow>
      </Panel>

      <Panel title="Accessibility" subtitle="Motion, contrast and legibility" accent="#B15CFF" bodyClassName="p-0">
        <SettingRow label="Interface motion" hint="Turning this off removes all non-essential animation immediately.">
          <Toggle label="Interface motion" checked={settings.motion} onChange={(v) => onChange({ motion: v })} />
        </SettingRow>
        <SettingRow label="High contrast" hint="Raises text and border contrast for bright garage conditions.">
          <Toggle label="High contrast" checked={settings.highContrast} onChange={(v) => onChange({ highContrast: v })} />
        </SettingRow>
        <SettingRow label="Colour vision" hint="Re-maps the sector and compound palette to a safe alternative.">
          <Segmented
            label="Colour vision"
            value={settings.colourBlind}
            onChange={(v) => onChange({ colourBlind: v })}
            options={[
            { value: 'off' as const, label: 'Standard' },
            { value: 'deuteranopia' as const, label: 'Deut' },
            { value: 'protanopia' as const, label: 'Prot' },
            { value: 'tritanopia' as const, label: 'Trit' }]
            } />
          
        </SettingRow>
        <SettingRow label="Text scale" hint="Scales every label and metric across the platform.">
          <SliderControl
            label="Text scale"
            value={settings.fontScale}
            min={85}
            max={130}
            step={5}
            onChange={(v) => onChange({ fontScale: v })}
            suffix="%"
            color="#B15CFF" />
          
        </SettingRow>
      </Panel>
    </div>);

}