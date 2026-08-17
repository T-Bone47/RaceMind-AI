
import { Panel } from '../ui/Panel';
import { Trace } from '../ui/Trace';
import { gLat, gLon, rideHeightFront, rideHeightRear, wheelSlip } from '../../data/telemetry';

interface Props {
  cursor: number;
}

export function DynamicsPanel({ cursor }: Props) {
  const idx = Math.round(cursor * (gLat.length - 1));
  const lat = gLat[idx]!;
  const lon = gLon[idx]!;
  const total = Math.sqrt(lat * lat + lon * lon);
  const R = 62;

  return (
    <Panel
      title="Vehicle Dynamics"
      subtitle="Friction circle · ride height · slip"
      accent="#FF7A29"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-f1-orange">
          {total.toFixed(2)} G combined
        </span>
      }>
      
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="150" height="150" role="img" aria-label="G-force friction circle">
            <g transform="translate(75,75)">
              {[1, 2, 3, 4, 5].map((g) =>
              <circle
                key={g}
                r={R / 5 * g}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
                strokeDasharray={g === 5 ? '0' : '2 4'} />

              )}
              <line x1={-R} x2={R} y1="0" y2="0" stroke="rgba(255,255,255,0.09)" />
              <line x1="0" x2="0" y1={-R} y2={R} stroke="rgba(255,255,255,0.09)" />
              {gLat.map((l, i) =>
              <circle
                key={i}
                cx={l / 5 * R}
                cy={-gLon[i]! / 5 * R}
                r="1.1"
                fill="#FF7A29"
                opacity={0.16} />

              )}
              <line
                x1="0"
                y1="0"
                x2={lat / 5 * R}
                y2={-lon / 5 * R}
                stroke="#00E5FF"
                strokeWidth="1.4"
                opacity="0.6" />
              
              <circle
                cx={lat / 5 * R}
                cy={-lon / 5 * R}
                r="4"
                fill="#00E5FF"
                style={{ filter: 'drop-shadow(0 0 6px #00E5FF)' }} />
              
              <text y={-R - 6} textAnchor="middle" fontSize="8.5" fill="#8E99A8" className="font-mono">
                ACCEL
              </text>
              <text y={R + 12} textAnchor="middle" fontSize="8.5" fill="#8E99A8" className="font-mono">
                BRAKE
              </text>
            </g>
          </svg>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <Value label="Lateral" value={`${lat.toFixed(2)} G`} color="#FF7A29" />
          <Value label="Longitudinal" value={`${lon.toFixed(2)} G`} color="#00D68F" />
          <Value label="Peak lateral" value="4.62 G" color="#B15CFF" />
          <Value label="Peak braking" value="5.10 G" color="#E10600" />
          <Value label="Downforce est." value="1,842 kg" color="#00E5FF" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Channel label="Ride height · front" values={rideHeightFront} color="#00E5FF" value={`${rideHeightFront[idx]!.toFixed(1)} mm`} />
        <Channel label="Ride height · rear" values={rideHeightRear} color="#B15CFF" value={`${rideHeightRear[idx]!.toFixed(1)} mm`} />
        <Channel label="Wheel slip" values={wheelSlip} color="#FFC531" value={`${wheelSlip[idx]!.toFixed(2)} %`} />
      </div>
    </Panel>);

}

function Value({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">{label}</span>
      <span className="font-mono text-[12px] font-semibold tabular" style={{ color }}>
        {value}
      </span>
    </div>);

}

function Channel({
  label,
  values,
  color,
  value





}: {label: string;values: number[];color: string;value: string;}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25 px-2.5 pt-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{label}</span>
        <span className="font-mono text-[11px] tabular" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="-mx-2.5">
        <Trace values={values} color={color} height={34} width={320} strokeWidth={1.2} />
      </div>
    </div>);

}
