// @ts-nocheck
import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ReportsToolbar } from '../components/reports/ReportsToolbar';
import { TemplateRail } from '../components/reports/TemplateRail';
import { ReportCanvas } from '../components/reports/ReportCanvas';
import { SectionBuilder } from '../components/reports/SectionBuilder';
import { DistributionPanel } from '../components/reports/DistributionPanel';
import { ReportArchive } from '../components/reports/ReportArchive';
import { defaultSections, templates, type ReportSection } from '../data/reports';

const initialEnabled = defaultSections.reduce<Record<string, boolean>>((acc, s) => {
  acc[s.id] = s.id !== 'appendix';
  return acc;
}, {});

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }
  })
};

function Block({ children, index, className = '' }: {children: React.ReactNode;index: number;className?: string;}) {
  return (
    <motion.div variants={fade} initial="hidden" animate="show" custom={index} className={className}>
      {children}
    </motion.div>);

}

export function Reports() {
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [sections, setSections] = useState<ReportSection[]>(defaultSections);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [zoom, setZoom] = useState(0.9);
  const [paper, setPaper] = useState<'dark' | 'light'>('dark');
  const [regenerating, setRegenerating] = useState(false);

  const template = useMemo(() => templates.find((t) => t.id === templateId) ?? templates[0], [templateId]);

  const toggle = useCallback((id: string) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] })), []);

  const move = useCallback((id: string, dir: -1 | 1) => {
    setSections((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const regenerate = () => {
    setRegenerating(true);
    window.setTimeout(() => setRegenerating(false), 1600);
  };

  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-3 p-3 xl:p-4">
      <Block index={0}>
        <ReportsToolbar
          template={template}
          zoom={zoom}
          onZoom={setZoom}
          paper={paper}
          onPaper={setPaper}
          regenerating={regenerating}
          onRegenerate={regenerate} />
        
      </Block>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Block index={1} className="xl:col-span-3">
          <div className="space-y-3 xl:sticky xl:top-3">
            <TemplateRail selected={templateId} onSelect={setTemplateId} />
          </div>
        </Block>

        <Block index={2} className="xl:col-span-6">
          <section
            aria-label="Report preview"
            className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-carbon-800/80 shadow-panel">
            
            <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" aria-hidden="true" />
            <div className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-silver-light">
                Live preview
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-cyan">
                <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-cyan" />
                {regenerating ? 'Composing' : 'Synced'}
              </span>
            </div>
            <div className="relative max-h-[1040px] overflow-auto scrollbar-thin">
              <ReportCanvas
                template={template}
                sections={sections}
                enabled={enabled}
                zoom={zoom}
                paper={paper} />
              
            </div>
          </section>
        </Block>

        <div className="space-y-3 xl:col-span-3">
          <Block index={3}>
            <SectionBuilder sections={sections} enabled={enabled} onToggle={toggle} onMove={move} />
          </Block>
          <Block index={4}>
            <DistributionPanel />
          </Block>
        </div>
      </div>

      <Block index={5}>
        <ReportArchive />
      </Block>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Reporting studio · drafts are AI-composed and require sign-off before distribution
      </p>
    </div>);

}