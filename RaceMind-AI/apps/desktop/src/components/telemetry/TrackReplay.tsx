
import { useEffect, useRef, useState } from 'react';
import { Panel } from '../ui/Panel';
import { TRACK_PATH, TRACK_VIEWBOX, trackCorners } from '../../data/track';
import { brake, gear, speed, throttle } from '../../data/telemetry';

interface Props {
  cursor: number;
}

export function TrackReplay({ cursor }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const [point, setPoint] = useState({ x: 120, y: 300 });
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) setLength(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    if (!pathRef.current || !length) return;
    const p = pathRef.current.getPointAtLength(length * cursor);
    setPoint({ x: p.x, y: p.y });
  }, [cursor, length]);

  const idx = Math.round(cursor * (speed.length - 1));
  const v = speed[idx]!;
  const heatColor = v > 280 ? '#B15CFF' : v > 200 ? '#00E5FF' : v > 130 ? '#00D68F' : '#E10600';

  return (
    <Panel
      title="Track Replay"
      subtitle="GPS · speed heatmap"
      accent="#B15CFF"
      className="h-full"
      bodyClassName="h-[calc(100%-45px)] flex flex-col"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: heatColor }}>
          {Math.round(v)} kph
        </span>
      }>
      
      <div className="relative flex-1">
        <svg viewBox={TRACK_VIEWBOX} className="h-full w-full" role="img" aria-label="Track replay position">
          <defs>
            <linearGradient id="heatGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E10600" />
              <stop offset="35%" stopColor="#FFC531" />
              <stop offset="65%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#B15CFF" />
            </linearGradient>
          </defs>
          <path d={TRACK_PATH} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="24" />
          <path ref={pathRef} d={TRACK_PATH} fill="none" stroke="url(#heatGrad)" strokeWidth="6" opacity="0.85" />
          {trackCorners.map((c) =>
          <g key={c.id} opacity={Math.abs(c.t - cursor) < 0.04 ? 1 : 0.45}>
              <circle cx={c.x} cy={c.y} r="3" fill="#0A0C10" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
              <text x={c.x + 10} y={c.y - 7} fontSize="11" fill="#8E99A8" className="font-mono" letterSpacing="1.2">
                {c.id}
              </text>
            </g>
          )}
          <g transform={`translate(${point.x}, ${point.y})`}>
            <circle r="14" fill={heatColor} opacity="0.18" />
            <circle r="6" fill={heatColor} stroke="#050607" strokeWidth="1.6" />
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-white/[0.06] bg-white/[0.05]">
        <Readout label="Gear" value={`${gear[idx]!}`} color="#B15CFF" />
        <Readout label="Throttle" value={`${Math.round(throttle[idx]!)}%`} color="#00D68F" />
        <Readout label="Brake" value={`${Math.round(brake[idx]!)}%`} color="#E10600" />
      </div>
    </Panel>);

}

function Readout({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="bg-carbon-700/80 px-3 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[15px] font-semibold tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}
