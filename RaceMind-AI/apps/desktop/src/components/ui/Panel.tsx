import React from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  accent?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function Panel({
  title,
  subtitle,
  accent = '#00E5FF',
  actions,
  className = '',
  bodyClassName = '',
  children
}: PanelProps) {
  return (
    <section
      className={`group relative overflow-hidden rounded-xl border border-white/[0.07] bg-carbon-700/70 glass shadow-panel transition-colors duration-300 hover:border-white/[0.12] ${className}`}>
      
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }} />
      
      {(title || actions) &&
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="h-3 w-[2px] rounded-full" style={{ background: accent }} />
            <div className="min-w-0">
              <h2 className="truncate font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-silver-light">
                {title}
              </h2>
              {subtitle &&
            <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver/60">{subtitle}</p>
            }
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      }
      <div className={`relative ${bodyClassName}`}>{children}</div>
    </section>);

}

export function PanelChip({
  children,
  color = '#8E99A8',
  active = false




}: {children: React.ReactNode;color?: string;active?: boolean;}) {
  return (
    <span
      className="rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.14em]"
      style={{
        color,
        borderColor: active ? `${color}55` : 'rgba(255,255,255,0.08)',
        background: active ? `${color}14` : 'transparent'
      }}>
      
      {children}
    </span>);

}

export function Label({ children }: {children: React.ReactNode;}) {
  return (
    <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-silver/60">{children}</span>);

}