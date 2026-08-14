import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, ChevronDown, ChevronUp, FileStack, Layers, Table2 } from 'lucide-react';
import type { ReportSection } from '../../data/reports';
import { Panel } from '../ui/Panel';

const kindMeta = {
  summary: { color: '#00E5FF', icon: Layers },
  chart: { color: '#00D68F', icon: BarChart3 },
  table: { color: '#FFC531', icon: Table2 },
  narrative: { color: '#B15CFF', icon: BookOpen },
  appendix: { color: '#8E99A8', icon: FileStack }
};

interface Props {
  sections: ReportSection[];
  enabled: Record<string, boolean>;
  onToggle: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

export function SectionBuilder({ sections, enabled, onToggle, onMove }: Props) {
  const activeCount = sections.filter((s) => enabled[s.id]).length;
  const words = sections.filter((s) => enabled[s.id]).reduce((a, s) => a + s.words, 0);

  return (
    <Panel
      title="Section Builder"
      subtitle={`${activeCount} of ${sections.length} included · ~${words.toLocaleString()} words`}
      accent="#B15CFF"
      className="h-full"
      bodyClassName="p-2.5 space-y-1"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          ~{Math.max(1, Math.round(words / 320))} pages
        </span>
      }>
      
      {sections.map((s, i) => {
        const meta = kindMeta[s.kind];
        const Icon = meta.icon;
        const on = enabled[s.id];
        return (
          <motion.div
            key={s.id}
            layout
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="group flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors"
            style={{
              borderColor: on ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              background: on ? 'rgba(0,0,0,0.25)' : 'transparent',
              opacity: on ? 1 : 0.5
            }}>
            
            <span className="w-4 shrink-0 text-center font-mono text-[9px] tabular text-silver/35">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
              style={{ background: `${meta.color}1a`, color: meta.color }}>
              
              <Icon className="h-2.5 w-2.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] text-f1-white">{s.title}</p>
              <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/40">{s.detail}</p>
            </div>

            <div className="flex shrink-0 flex-col opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onMove(s.id, -1)}
                disabled={i === 0}
                aria-label={`Move ${s.title} up`}
                className="text-silver/50 transition-colors hover:text-f1-white disabled:opacity-25">
                
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onMove(s.id, 1)}
                disabled={i === sections.length - 1}
                aria-label={`Move ${s.title} down`}
                className="text-silver/50 transition-colors hover:text-f1-white disabled:opacity-25">
                
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={`Include ${s.title}`}
              onClick={() => onToggle(s.id)}
              className="relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors"
              style={{ background: on ? `${meta.color}55` : 'rgba(255,255,255,0.09)' }}>
              
              <motion.span
                className="absolute top-[2px] h-[14px] w-[14px] rounded-full"
                animate={{ left: on ? 16 : 2 }}
                transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                style={{ background: on ? meta.color : '#8E99A8' }} />
              
            </button>
          </motion.div>);

      })}
    </Panel>);

}