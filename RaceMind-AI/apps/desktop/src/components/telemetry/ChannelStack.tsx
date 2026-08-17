import { useMemo, useRef } from 'react';
import { Panel } from '../ui/Panel';
import { Trace } from '../ui/Trace';
import {
  brake,
  battery,
  delta,
  drs,
  ers,
  fuelFlow,
  gear,
  refSpeed,
  rpm,
  speed,
  steering,
  throttle } from
'../../data/telemetry';
import { trackCorners } from '../../data/track';

interface Channel {
  key: string;
  label: string;
  unit: string;
  color: string;
  values: number[];
  height: number;
  min?: number;
  max?: number;
  baseline?: number;
  ghost?: number[];
  decimals?: number;
}

const channels: Channel[] = [
{ key: 'speed', label: 'Speed', unit: 'kph', color: '#00E5FF', values: speed, ghost: refSpeed, height: 108, min: 40, max: 350 },
{ key: 'delta', label: 'Delta to ref', unit: 's', color: '#00D68F', values: delta, height: 62, baseline: 0, decimals: 3 },
{ key: 'pedals', label: 'Throttle', unit: '%', color: '#00D68F', values: throttle, height: 58, min: 0, max: 100 },
{ key: 'brake', label: 'Brake', unit: '%', color: '#E10600', values: brake, height: 58, min: 0, max: 100 },
{ key: 'gear', label: 'Gear', unit: '', color: '#B15CFF', values: gear, height: 48, min: 0, max: 8 },
{ key: 'rpm', label: 'RPM', unit: '', color: '#FFC531', values: rpm, height: 52, min: 5000, max: 12500 },
{ key: 'steering', label: 'Steering', unit: '°', color: '#F3F7FB', values: steering, height: 52, min: -130, max: 130, baseline: 0 },
{ key: 'ers', label: 'ERS deploy', unit: 'kW', color: '#00E5FF', values: ers, height: 52, min: 0, max: 170 },
{ key: 'battery', label: 'Battery', unit: '%', color: '#B15CFF', values: battery, height: 48, min: 0, max: 100 },
{ key: 'fuel', label: 'Fuel flow', unit: 'kg/h', color: '#FF7A29', values: fuelFlow, height: 48, min: 0, max: 100 }];


interface Props {
  cursor: number;
  onCursor: (c: number) => void;
  compare: string[];
}

const rivalTraces: Record<string, {color: string;values: number[];}> = {
  LEC: { color: '#E10600', values: speed.map((v, i) => v - Math.sin(i / 6) * 9 - 3) },
  VER: { color: '#3D8BFF', values: speed.map((v, i) => v + Math.cos(i / 7) * 8 - 1) },
  NOR: { color: '#FF7A29', values: speed.map((v, i) => v + Math.sin(i / 5) * 7 + 2) }
};

export function ChannelStack({ cursor, onCursor, compare }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const drsZones = useMemo(() => {
    const zones: {start: number;end: number;}[] = [];
    let start: number | null = null;
    drs.forEach((v, i) => {
      if (v === 1 && start === null) start = i;
      if (v === 0 && start !== null) {
        zones.push({ start: start / drs.length, end: i / drs.length });
        start = null;
      }
    });
    return zones;
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onCursor(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  };

  return (
    <Panel
      title="Channel Stack"
      subtitle="RUS L43 vs reference L34 · 280 Hz"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-0"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          Crosshair {(cursor * 100).toFixed(1)}%
        </span>
      }>
      
      <div
        ref={ref}
        onMouseMove={handleMove}
        className="relative cursor-crosshair select-none"
        role="presentation">
        
        {/* corner rails */}
        <div className="relative h-6 border-b border-white/[0.05]">
          {trackCorners.map((c) =>
          <span
            key={c.id}
            className="absolute top-1 -translate-x-1/2 font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45"
            style={{ left: `${c.t * 100}%` }}>
            
              {c.id}
            </span>
          )}
          {drsZones.map((z, i) =>
          <span
            key={i}
            className="absolute inset-y-0 bg-f1-green/10"
            style={{ left: `${z.start * 100}%`, width: `${(z.end - z.start) * 100}%` }} />

          )}
        </div>

        {channels.map((ch) => {
          const idx = Math.round(cursor * (ch.values.length - 1));
          const current = ch.values[idx]!;
          return (
            <div key={ch.key} className="relative border-b border-white/[0.04] last:border-b-0">
              <div className="absolute left-3 top-1.5 z-10 flex items-baseline gap-2">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{ch.label}</span>
                <span className="font-mono text-[13px] font-semibold tabular" style={{ color: ch.color }}>
                  {ch.decimals ? current.toFixed(ch.decimals) : Math.round(current)}
                  <span className="ml-0.5 text-[8.5px] text-silver/45">{ch.unit}</span>
                </span>
              </div>
              <div className="relative">
                {ch.key === 'speed' &&
                compare.map((code) => {
                  const rival = rivalTraces[code];
                  if (!rival) return null;
                  return (
                    <div key={code} className="absolute inset-0 opacity-70">
                        <Trace
                        values={rival.values}
                        color={rival.color}
                        height={ch.height}
                        width={900}
                        fill={false}
                        min={ch.min}
                        max={ch.max}
                        strokeWidth={1} />
                      
                      </div>);

                })}
                {ch.ghost &&
                <div className="absolute inset-0 opacity-40">
                    <Trace
                    values={ch.ghost}
                    color="#8E99A8"
                    height={ch.height}
                    width={900}
                    fill={false}
                    min={ch.min}
                    max={ch.max}
                    strokeWidth={1} />
                  
                  </div>
                }
                <Trace
                  values={ch.values}
                  color={ch.color}
                  height={ch.height}
                  width={900}
                  min={ch.min}
                  max={ch.max}
                  baseline={ch.baseline}
                  grid />
                
              </div>
            </div>);

        })}

        {/* corner grid lines */}
        {trackCorners.map((c) =>
        <span
          key={`line-${c.id}`}
          className="pointer-events-none absolute inset-y-0 w-px bg-white/[0.05]"
          style={{ left: `${c.t * 100}%` }} />

        )}

        {/* crosshair */}
        <div
          className="pointer-events-none absolute inset-y-0 z-20 w-px bg-f1-cyan/70"
          style={{ left: `${cursor * 100}%`, boxShadow: '0 0 10px #00E5FF' }}>
          
          <span className="absolute -top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-f1-cyan" />
        </div>
      </div>
    </Panel>);

}