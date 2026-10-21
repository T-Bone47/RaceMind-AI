import { sessionTypes, type SessionKind } from '../../data/setups';
import { PillGroup, Tabs } from '../ui/Tabs';

interface Props {
  value: SessionKind;
  onChange: (s: SessionKind) => void;
  tab: string;
  onTab: (t: string) => void;
}

const tabs = [
{ id: 'library', label: 'Library' },
{ id: 'setup', label: 'Setup Sheet' },
{ id: 'analysis', label: 'Analysis' },
{ id: 'documents', label: 'Documents' }];


export function SessionTypeBar({ value, onChange, tab, onTab }: Props) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-white/[0.07] bg-carbon-700/60 glass p-2.5 xl:flex-row xl:items-center">
      <Tabs items={tabs} value={tab} onChange={onTab} />

      <div className="h-px w-full bg-white/[0.06] xl:h-6 xl:w-px" />

      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/45">Session</span>
        <PillGroup
          items={sessionTypes.map((s) => ({ id: s, label: s }))}
          value={value}
          onChange={(id) => onChange(id as SessionKind)} />
        
      </div>
    </div>);

}