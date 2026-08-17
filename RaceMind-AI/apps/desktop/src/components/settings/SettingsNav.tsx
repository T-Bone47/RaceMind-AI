import { Cpu, Database, Monitor, UserCog, type LucideIcon } from 'lucide-react';
import { sections, type SectionId } from '../../data/settings';
import { Panel } from '../ui/Panel';

const icons: Record<SectionId, LucideIcon> = {
  profile: UserCog,
  intelligence: Cpu,
  interface: Monitor,
  system: Database
};

interface Props {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

export function SettingsNav({ active, onSelect }: Props) {
  return (
    <Panel title="Configuration" subtitle="Workspace preferences" accent="#8E99A8" bodyClassName="p-2">
      <ul className="space-y-1">
        {sections.map((s) => {
          const Icon = icons[s.id];
          const on = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={on ? 'true' : undefined}
                className={`relative flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                on ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`
                }>
                
                {on &&
                <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-f1-cyan shadow-[0_0_10px_#00E5FF]" />
                }
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${on ? 'text-f1-cyan' : 'text-silver/60'}`}
                  strokeWidth={1.6} />
                
                <div className="min-w-0">
                  <p className={`text-[12.5px] font-medium ${on ? 'text-f1-white' : 'text-silver-light'}`}>
                    {s.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-silver/45">{s.hint}</p>
                </div>
              </button>
            </li>);

        })}
      </ul>
    </Panel>);

}