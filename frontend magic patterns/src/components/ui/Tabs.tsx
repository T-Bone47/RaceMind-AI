import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

/** Underlined workspace tabs — the primary in-page view switcher. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  accent = '#00E5FF',
  className = ''






}: {items: TabItem<T>[];value: T;onChange: (id: T) => void;accent?: string;className?: string;}) {
  return (
    <div
      role="tablist"
      className={`flex shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/30 ${className}`}>
      
      {items.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={`relative px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
            on ? 'bg-white/[0.08] text-f1-white' : 'text-silver/60 hover:bg-white/[0.03] hover:text-f1-white'}`
            }>
            
            {on &&
            <span
              className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />

            }
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-silver/45 tabular">{t.count}</span>}
          </button>);

      })}
    </div>);

}

/** Compact pill filter group for secondary filtering. */
export function PillGroup<T extends string>({
  items,
  value,
  onChange,
  accent = '#00E5FF',
  multiple = false,
  selected = []







}: {items: {id: T;label: string;}[];value?: T;onChange: (id: T) => void;accent?: string;multiple?: boolean;selected?: T[];}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map((i) => {
        const on = multiple ? selected.includes(i.id) : i.id === value;
        return (
          <button
            key={i.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(i.id)}
            className={`rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
            on ? '' : 'border-white/[0.07] bg-black/25 text-silver/60 hover:border-white/[0.16] hover:text-f1-white'}`
            }
            style={on ? { borderColor: `${accent}55`, background: `${accent}12`, color: accent } : undefined}>
            
            {i.label}
          </button>);

      })}
    </div>);

}