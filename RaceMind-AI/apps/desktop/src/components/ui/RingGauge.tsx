

interface RingGaugeProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
  label?: string;
  unit?: string;
  display?: string;
  sublabel?: string;
}

export function RingGauge({
  value,
  max = 100,
  size = 92,
  thickness = 6,
  color = '#00E5FF',
  track = 'rgba(255,255,255,0.07)',
  label,
  unit,
  display,
  sublabel
}: RingGaugeProps) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const gapAngle = 0.22;
  const arc = c * (1 - gapAngle);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[130deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${c}`} />
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${arc * pct} ${c}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${color}66)` }} />
        
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[17px] font-semibold leading-none text-f1-white tabular">
          {display ?? Math.round(value)}
          {unit && <span className="ml-0.5 text-[9px] text-silver">{unit}</span>}
        </span>
        {label &&
        <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/70">{label}</span>
        }
        {sublabel && <span className="font-mono text-[8.5px] text-silver/50">{sublabel}</span>}
      </div>
    </div>);

}
