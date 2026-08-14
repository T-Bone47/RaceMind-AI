import React from 'react';
import { Minus, Moon, Plus, Printer, RefreshCw, Sun } from 'lucide-react';
import type { ReportTemplate } from '../../data/reports';

interface Props {
  template: ReportTemplate;
  zoom: number;
  onZoom: (z: number) => void;
  paper: 'dark' | 'light';
  onPaper: (p: 'dark' | 'light') => void;
  regenerating: boolean;
  onRegenerate: () => void;
}

export function ReportsToolbar({ template, zoom, onZoom, paper, onPaper, regenerating, onRegenerate }: Props) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 brushed opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
        style={{ background: template.accent, boxShadow: `0 0 20px ${template.accent}` }} />
      
      <div className="relative flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">
            Reporting studio · {template.cadence.toLowerCase()}
          </p>
          <h1 className="mt-1 text-[22px] font-semibold leading-none tracking-tight text-f1-white">{template.name}</h1>
          <p className="mt-1.5 truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver">
            {template.audience}
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-1">
            <button
              type="button"
              onClick={() => onPaper('dark')}
              aria-label="Dark paper"
              className={`grid h-6 w-6 place-items-center rounded-md transition-colors ${
              paper === 'dark' ? 'bg-white/[0.09] text-f1-white' : 'text-silver/55 hover:text-f1-white'}`
              }>
              
              <Moon className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onPaper('light')}
              aria-label="Print paper"
              className={`grid h-6 w-6 place-items-center rounded-md transition-colors ${
              paper === 'light' ? 'bg-white/[0.09] text-f1-white' : 'text-silver/55 hover:text-f1-white'}`
              }>
              
              <Sun className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-1">
            <button
              type="button"
              onClick={() => onZoom(Math.max(0.6, Number((zoom - 0.1).toFixed(2))))}
              aria-label="Zoom out"
              className="grid h-6 w-6 place-items-center rounded-md text-silver/60 transition-colors hover:text-f1-white">
              
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-9 text-center font-mono text-[9.5px] tabular text-silver-light">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onZoom(Math.min(1.2, Number((zoom + 0.1).toFixed(2))))}
              aria-label="Zoom in"
              className="grid h-6 w-6 place-items-center rounded-md text-silver/60 transition-colors hover:text-f1-white">
              
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 rounded-lg border border-f1-cyan/35 bg-f1-cyan/[0.08] px-2.5 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-f1-cyan transition-colors hover:bg-f1-cyan/[0.16] disabled:opacity-60">
            
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Writing…' : 'Regenerate'}
          </button>

          <button
            type="button"
            aria-label="Print preview"
            className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-silver transition-colors hover:border-white/[0.18] hover:text-f1-white">
            
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>);

}