import { status, type StatusKey } from './tokens';

/**
 * Status is always communicated with a dot AND a word — never colour alone.
 */
export function StatusBadge({
  tone = 'neutral',
  color,
  children,
  pulse = false,
  className = ''






}: {tone?: StatusKey;color?: string;children: React.ReactNode;pulse?: boolean;className?: string;}) {
  const c = color ?? status[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] ${className}`}
      style={{ color: c, borderColor: `${c}44`, background: `${c}12` }}>
      
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${pulse ? 'animate-pulseGlow' : ''}`}
        style={{ background: c }} />
      
      {children}
    </span>);

}

/** Quiet metadata chip with no status meaning. */
export function Chip({ children, className = '' }: {children: React.ReactNode;className?: string;}) {
  return (
    <span
      className={`inline-flex items-center rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/65 ${className}`}>
      
      {children}
    </span>);

}

/** Signed delta value. Direction is carried by the sign and an arrow glyph, not colour alone. */
export function Delta({
  value,
  unit = '',
  decimals = 3,
  invert = false,
  className = ''






}: {value: number;unit?: string;decimals?: number;invert?: boolean;className?: string;}) {
  const good = invert ? value < 0 : value > 0;
  const color = value === 0 ? status.neutral : good ? status.optimal : '#FF7A29';
  return (
    <span className={`font-mono tabular ${className}`} style={{ color }}>
      {value > 0 ? '+' : value < 0 ? '−' : ''}
      {Math.abs(value).toFixed(decimals)}
      {unit}
    </span>);

}