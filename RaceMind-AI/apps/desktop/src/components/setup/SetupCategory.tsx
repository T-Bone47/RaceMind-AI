import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { ParamSpec, SetupValues } from '../../data/setups';
import { Panel } from '../ui/Panel';

interface Props {
  title: string;
  accent: string;
  hint: string;
  params: ParamSpec[];
  values: SetupValues;
  reference: SetupValues;
  onChange: (key: keyof SetupValues, value: number) => void;
  onResetGroup: () => void;
  children?: React.ReactNode;
}

export function SetupCategory({
  title,
  accent,
  hint,
  params,
  values,
  reference,
  onChange,
  onResetGroup,
  children
}: Props) {
  const changed = params.filter((p) => values[p.key] !== reference[p.key]).length;

  return (
    <Panel
      title={title}
      subtitle={hint}
      accent={accent}
      className="h-full"
      bodyClassName="p-4 space-y-3.5"
      actions={
      <div className="flex items-center gap-1.5">
          {changed > 0 &&
        <span className="rounded px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ background: `${accent}1a`, color: accent }}>
              {changed} changed
            </span>
        }
          <button
          type="button"
          onClick={onResetGroup}
          aria-label={`Reset ${title}`}
          className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] text-silver transition-colors hover:border-white/[0.2] hover:text-f1-white">
          
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      }>
      
      {children}

      {params.map((p) => {
        const value = values[p.key];
        const ref = reference[p.key];
        const delta = Number((value - ref).toFixed(2));
        const pct = (value - p.min) / (p.max - p.min) * 100;
        const refPct = (ref - p.min) / (p.max - p.min) * 100;
        const decimals = p.step < 1 ? p.step < 0.05 ? 2 : 1 : 0;

        return (
          <div key={p.key} className="group">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-silver/60">
                {p.label}
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                {delta !== 0 &&
                <span
                  className="font-mono text-[9px] tabular"
                  style={{ color: delta > 0 ? '#00D68F' : '#FF7A29' }}>
                  
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(decimals)}
                  </span>
                }
                <span className="font-mono text-[13px] font-semibold tabular" style={{ color: accent }}>
                  {value.toFixed(decimals)}
                  {p.unit && <span className="ml-0.5 text-[8.5px] text-silver/45">{p.unit}</span>}
                </span>
              </span>
            </div>

            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full transition-[width] duration-200"
                  style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 8px ${accent}66` }} />
                
              </div>
              <span
                className="pointer-events-none absolute top-1/2 h-2.5 w-[2px] -translate-y-1/2 rounded-full bg-white/45"
                style={{ left: `${refPct}%` }}
                title="Reference value" />
              
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={value}
                aria-label={p.label}
                onChange={(e) => onChange(p.key, Number(e.target.value))}
                className="relative h-4 w-full cursor-pointer appearance-none bg-transparent"
                style={{ accentColor: accent }} />
              
            </div>

            <p className="mt-0.5 font-mono text-[8.5px] leading-relaxed text-silver/40 opacity-0 transition-opacity group-hover:opacity-100">
              {p.hint}
            </p>
          </div>);

      })}
    </Panel>);

}