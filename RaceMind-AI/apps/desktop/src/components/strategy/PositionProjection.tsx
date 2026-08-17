import { Panel } from '../ui/Panel';
import type { SimInputs } from '../../data/strategy';
import { projectTrace, type SimResult } from '../../utils/strategySim';

const W = 900;
const H = 240;
const PAD_L = 28;
const PAD_B = 22;

export function PositionProjection({ inputs, result }: {inputs: SimInputs;result: SimResult;}) {
  const { laps, series } = projectTrace(inputs, result);
  const xFor = (i: number) => PAD_L + i / (laps.length - 1) * (W - PAD_L - 8);
  const yFor = (pos: number) => (pos - 1) / 7 * (H - PAD_B) + 8;

  return (
    <Panel
      title="Position Projection"
      subtitle={`Lap ${laps[0]} → ${laps[laps.length - 1]} · reacting to box lap ${inputs.pitLap}`}
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-3"
      actions={
      <div className="flex items-center gap-2">
          {series.map((s) =>
        <span key={s.code} className="flex items-center gap-1 font-mono text-[9px] text-silver">
              <span className="h-[2px] w-3 rounded-full" style={{ background: s.color }} />
              {s.code}
            </span>
        )}
        </div>
      }>
      
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 240 }} role="img" aria-label="Projected race trace">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((p) =>
        <g key={p}>
            <line x1={PAD_L} x2={W - 8} y1={yFor(p)} y2={yFor(p)} stroke="rgba(255,255,255,0.05)" />
            <text x={4} y={yFor(p) + 4} fontSize="10" fill="#8E99A8" className="font-mono">
              P{p}
            </text>
          </g>
        )}

        {laps.map((lap, i) =>
        lap % 5 === 0 ?
        <g key={lap}>
              <line x1={xFor(i)} x2={xFor(i)} y1={8} y2={H - PAD_B} stroke="rgba(255,255,255,0.04)" />
              <text x={xFor(i)} y={H - 6} fontSize="9.5" fill="#8E99A8" textAnchor="middle" className="font-mono">
                L{lap}
              </text>
            </g> :
        null
        )}

        {/* pit window band */}
        <rect
          x={xFor(inputs.pitLap - laps[0]!)}
          y={8}
          width={Math.max(4, xFor(2) - xFor(0))}
          height={H - PAD_B - 8}
          fill="#00E5FF"
          opacity="0.08" />
        
        <line
          x1={xFor(inputs.pitLap - laps[0]!)}
          x2={xFor(inputs.pitLap - laps[0]!)}
          y1={8}
          y2={H - PAD_B}
          stroke="#00E5FF"
          strokeWidth="1.4"
          strokeDasharray="4 4" />
        
        <text
          x={xFor(inputs.pitLap - laps[0]!) + 6}
          y={20}
          fontSize="9.5"
          fill="#00E5FF"
          className="font-mono"
          letterSpacing="1">
          
          BOX L{inputs.pitLap}
        </text>

        {series.map((s) => {
          const d = s.values.
          map((v, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).
          join(' ');
          return (
            <g key={s.code}>
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={s.code === 'RUS' ? 1 : 0.62}
                style={{ filter: s.code === 'RUS' ? `drop-shadow(0 0 6px ${s.color}88)` : undefined }} />
              
              <circle
                cx={xFor(s.values.length - 1)}
                cy={yFor(s.values[s.values.length - 1]!)}
                r={s.code === 'RUS' ? 4 : 2.6}
                fill={s.color} />
              
              <text
                x={xFor(s.values.length - 1) - 10}
                y={yFor(s.values[s.values.length - 1]!) - 8}
                fontSize="10"
                fill={s.color}
                textAnchor="end"
                className="font-mono">
                
                {s.code}
              </text>
            </g>);

        })}
      </svg>
    </Panel>);

}