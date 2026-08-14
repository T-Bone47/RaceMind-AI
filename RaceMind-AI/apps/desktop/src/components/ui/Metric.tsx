import React from 'react';

type Scale = 'hero' | 'lg' | 'md' | 'sm';

const scales: Record<Scale, {value: string;label: string;sub: string;}> = {
  hero: { value: 'text-[34px]', label: 'text-[9px]', sub: 'text-[9.5px]' },
  lg: { value: 'text-[22px]', label: 'text-[8.5px]', sub: 'text-[9px]' },
  md: { value: 'text-[16px]', label: 'text-[8.5px]', sub: 'text-[9px]' },
  sm: { value: 'text-[12px]', label: 'text-[8px]', sub: 'text-[8.5px]' }
};

/**
 * The standard telemetry read-out. Value is monospace and visually dominant,
 * label and supporting text are quiet — hierarchy over size.
 */
export function Metric({
  label,
  value,
  sub,
  color = '#F3F7FB',
  scale = 'md',
  icon: Icon,
  align = 'left',
  className = '',
  children










}: {label: string;value: React.ReactNode;sub?: React.ReactNode;color?: string;scale?: Scale;icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;align?: 'left' | 'right';className?: string;children?: React.ReactNode;}) {
  const s = scales[scale];
  return (
    <div className={`${align === 'right' ? 'text-right' : ''} ${className}`}>
      <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
        {Icon && <Icon className="h-2.5 w-2.5 shrink-0 text-silver/50" strokeWidth={1.8} />}
        <span className={`font-mono ${s.label} uppercase tracking-[0.18em] text-silver/55`}>{label}</span>
      </div>
      <p className={`mt-1.5 font-mono ${s.value} font-semibold leading-none tabular`} style={{ color }}>
        {value}
      </p>
      {children ?
      <div className="mt-1.5">{children}</div> :
      sub &&
      <p className={`mt-1.5 font-mono ${s.sub} uppercase tracking-[0.14em] text-silver/50`}>{sub}</p>
      }
    </div>);

}

/** Compact label/value pair for dense read-out strips. */
export function Readout({
  label,
  value,
  color = '#F3F7FB',
  icon: Icon,
  hint






}: {label: string;value: React.ReactNode;color?: string;icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;hint?: string;}) {
  return (
    <div className="flex items-center gap-1.5" title={hint}>
      {Icon && <Icon className="h-3 w-3 shrink-0 text-silver/50" strokeWidth={1.7} />}
      <div className="leading-none">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{label}</p>
        <p className="mt-1 font-mono text-[12px] font-semibold tabular" style={{ color }}>
          {value}
        </p>
      </div>
    </div>);

}