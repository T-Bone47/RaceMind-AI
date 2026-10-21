import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { templates } from '../../data/reports';
import { Panel } from '../ui/Panel';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function TemplateRail({ selected, onSelect }: Props) {
  return (
    <Panel
      title="Report Templates"
      subtitle="Pick a starting structure"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-2.5 space-y-1.5"
      actions={<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">{templates.length}</span>}>
      
      {templates.map((t, i) => {
        const on = t.id === selected;
        return (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            aria-pressed={on}
            className="group relative w-full overflow-hidden rounded-lg border p-2.5 text-left transition-colors"
            style={{
              borderColor: on ? `${t.accent}55` : 'rgba(255,255,255,0.06)',
              background: on ? `${t.accent}0d` : 'rgba(0,0,0,0.25)'
            }}>
            
            {on &&
            <motion.span
              layoutId="template-marker"
              className="absolute inset-y-2 left-0 w-[2px] rounded-full"
              style={{ background: t.accent, boxShadow: `0 0 10px ${t.accent}` }} />

            }
            <div className="flex items-center gap-2">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                style={{ background: `${t.accent}1a`, color: t.accent }}>
                
                <FileText className="h-3 w-3" />
              </span>
              <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-f1-white">{t.name}</p>
              <span className="shrink-0 font-mono text-[9px] tabular text-silver/45">{t.pages}p</span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-relaxed text-silver/65">{t.description}</p>
            <p className="mt-1.5 truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/40">
              {t.cadence}
            </p>
          </motion.button>);

      })}
    </Panel>);

}