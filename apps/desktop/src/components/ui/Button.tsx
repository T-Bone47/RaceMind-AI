
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  iconRight?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  accent?: string;
  full?: boolean;
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[9px] gap-1.5',
  md: 'h-[34px] px-3 text-[9.5px] gap-2'
};

/** The single button in the product. Every call to action uses this. */
export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  accent,
  full,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
  'inline-flex items-center justify-center rounded-lg font-mono font-semibold uppercase tracking-[0.14em] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.97]';

  const variants: Record<Variant, string> = {
    primary: 'text-carbon-900 hover:brightness-110',
    secondary:
    'border border-white/[0.08] bg-white/[0.02] text-silver-light hover:border-white/[0.18] hover:bg-white/[0.05] hover:text-f1-white',
    ghost: 'text-silver hover:bg-white/[0.05] hover:text-f1-white',
    danger: 'border border-f1-red/40 bg-f1-red/[0.08] text-f1-red hover:bg-f1-red/[0.16]'
  };

  const tone = accent ?? '#00E5FF';
  const style =
  variant === 'primary' ?
  { background: tone } :
  accent && variant === 'secondary' ?
  { borderColor: `${tone}55`, background: `${tone}12`, color: tone } :
  undefined;

  const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <button
      type="button"
      {...rest}
      style={{ ...style, ...rest.style }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}>
      
      {Icon && <Icon className={iconClass} strokeWidth={1.8} />}
      {children}
      {IconRight && <IconRight className={iconClass} strokeWidth={1.8} />}
    </button>);

}

/** Square icon-only action. Always requires a label for screen readers and a tooltip. */
export function IconButton({
  icon: Icon,
  label,
  size = 'md',
  active,
  accent,
  className = '',
  ...rest






}: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;size?: Size;active?: boolean;accent?: string;} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-[34px] w-[34px]';
  const tone = accent ?? '#00E5FF';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={`grid ${dim} place-items-center rounded-lg border transition-colors ${
      active ?
      '' :
      'border-white/[0.08] bg-white/[0.02] text-silver hover:border-white/[0.18] hover:text-f1-white'} ${
      className}`}
      style={active ? { borderColor: `${tone}55`, background: `${tone}14`, color: tone, ...rest.style } : rest.style}>
      
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={1.7} />
    </button>);

}