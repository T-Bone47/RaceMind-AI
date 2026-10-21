import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';
import type { Circuit } from '../../data/setups';
import { Panel } from '../ui/Panel';

const zoneMeta = {
  speed: { color: '#B15CFF', label: 'High speed' },
  brake: { color: '#E10600', label: 'Heavy braking' },
  traction: { color: '#00D68F', label: 'Traction zone' },
  drs: { color: '#00E5FF', label: 'DRS zone' }
};

const advice: Record<string, string> = {
  speed: 'Hold rear wing and stiffen the front ARB one click to steady the platform through the fast direction changes.',
  brake: 'Move brake bias 0.5% forward and lift front ride height 1 mm to stop the car locking under load.',
  traction: 'Reduce on-throttle differential by 3% and soften the rear suspension to put the power down cleanly.',
  drs: 'Every point of rear wing costs roughly 3 kph here — trim it if you are defending on the straight.'
};

export function CircuitIntelligence({ circuit }: {circuit: Circuit;}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const [active, setActive] = useState(0);
  const [points, setPoints] = useState<{x: number;y: number;}[]>([]);

  useEffect(() => {
    if (!pathRef.current) return;
    const total = pathRef.current.getTotalLength();
    setLength(total);
    setPoints(
      circuit.zones.map((z) => {
        const p = pathRef.current!.getPointAtLength(total * z.t);
        return { x: p.x, y: p.y };
      })
    );
    setActive(0);
  }, [circuit.id]);

  const zone = circuit.zones[active];
  const meta = zoneMeta[zone?.kind ?? 'speed'];

  return (
    <Panel
      title="Circuit Intelligence"
      subtitle={`${circuit.name} · sector setup guidance`}
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-orange">
          <Thermometer className="h-3 w-3" /> Tyre peak {Math.round(96 + circuit.tyreStress * 0.28)}°C
        </span>
      }>
      
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-black/30">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
          <svg viewBox="0 0 210 124" className="relative w-full" style={{ height: 250 }} role="img" aria-label="Circuit intelligence map">
            <path d={circuit.path} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="13" strokeLinejoin="round" />
            <path
              ref={pathRef}
              d={circuit.path}
              fill="none"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth="2"
              strokeLinejoin="round" />
            
            {length > 0 &&
            <path
              d={circuit.path}
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2.2"
              strokeDasharray={`${length * 0.09} ${length}`}
              className="animate-dash"
              opacity="0.9" />

            }

            {points.map((p, i) => {
              const z = circuit.zones[i];
              const m = zoneMeta[z.kind];
              const on = i === active;
              return (
                <g key={z.label} onClick={() => setActive(i)} className="cursor-pointer">
                  <circle cx={p.x} cy={p.y} r={on ? 9 : 6} fill={m.color} opacity={on ? 0.22 : 0.12} />
                  <circle cx={p.x} cy={p.y} r={on ? 4 : 3} fill={m.color} stroke="#050607" strokeWidth="1" />
                  <text
                    x={p.x + 8}
                    y={p.y - 6}
                    fontSize="6.5"
                    fill={on ? m.color : '#8E99A8'}
                    className="font-mono"
                    letterSpacing="0.4">
                    
                    {z.label.split(' ')[0]}
                  </text>
                </g>);

            })}
          </svg>

          <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5">
            {Object.entries(zoneMeta).map(([k, m]) =>
            <span
              key={k}
              className="flex items-center gap-1 rounded-md border border-white/[0.07] bg-black/60 px-1.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-silver-light backdrop-blur">
              
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} /> {m.label}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {circuit.zones.map((z, i) => {
            const m = zoneMeta[z.kind];
            const on = i === active;
            return (
              <button
                key={z.label}
                type="button"
                onClick={() => setActive(i)}
                className="w-full rounded-lg border px-2.5 py-2 text-left transition-colors"
                style={{
                  borderColor: on ? `${m.color}55` : 'rgba(255,255,255,0.06)',
                  background: on ? `${m.color}0f` : 'rgba(0,0,0,0.25)'
                }}>
                
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                  <span className="truncate text-[11.5px] font-medium text-f1-white">{z.label}</span>
                  <span className="ml-auto font-mono text-[8.5px] uppercase tracking-[0.1em]" style={{ color: m.color }}>
                    {m.label}
                  </span>
                </div>
              </button>);

          })}

          <motion.div
            key={zone?.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border p-3"
            style={{ borderColor: `${meta.color}33`, background: `${meta.color}0d` }}>
            
            <p className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: meta.color }}>
              Recommended adjustment
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-silver-light">{advice[zone?.kind ?? 'speed']}</p>
          </motion.div>
        </div>
      </div>
    </Panel>);

}