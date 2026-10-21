import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { Trace } from '../ui/Trace';
import { brakeTrace, gearTrace, speedTrace, throttleTrace } from '../../utils/series';

const speed = speedTrace(200, 7);
const throttle = throttleTrace(speed);
const brake = brakeTrace(speed);
const gear = gearTrace(speed);

const channels = [
{ key: 'speed', label: 'Speed', unit: 'kph', color: '#00E5FF', values: speed, peak: 336 },
{ key: 'throttle', label: 'Throttle', unit: '%', color: '#00D68F', values: throttle, peak: 100 },
{ key: 'brake', label: 'Brake', unit: '%', color: '#E10600', values: brake, peak: 100 },
{ key: 'gear', label: 'Gear', unit: '', color: '#B15CFF', values: gear, peak: 8 }];


export function TelemetryStrip() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <Panel
      title="Telemetry Channels"
      subtitle="Lap 43 · RUS vs reference L34"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-3"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          {hover !== null ? `${(hover / 100 * 3.337).toFixed(3)} km` : 'hover to scrub'}
        </span>
      }>
      
      <div
        className="relative grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        onMouseLeave={() => setHover(null)}>
        
        {channels.map((ch) => {
          const current = hover === null ? ch.values[ch.values.length - 1] : ch.values[Math.round(hover / 100 * (ch.values.length - 1))];
          return (
            <div
              key={ch.key}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHover((e.clientX - rect.left) / rect.width * 100);
              }}
              className="group relative overflow-hidden rounded-lg border border-white/[0.06] bg-black/25 p-2.5 transition-colors hover:border-white/[0.14]">
              
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/55">{ch.label}</span>
                <span className="font-mono text-[14px] font-semibold tabular" style={{ color: ch.color }}>
                  {Math.round(current)}
                  <span className="ml-0.5 text-[8.5px] text-silver/50">{ch.unit}</span>
                </span>
              </div>
              <div className="relative mt-1.5">
                <Trace values={ch.values} color={ch.color} height={62} width={300} min={0} max={ch.peak} grid />
                {hover !== null &&
                <span
                  className="pointer-events-none absolute inset-y-0 w-px bg-white/45"
                  style={{ left: `${hover}%` }} />

                }
              </div>
              <div className="mt-1 flex justify-between font-mono text-[8px] text-silver/40">
                <span>S1</span>
                <span>S2</span>
                <span>S3</span>
              </div>
            </div>);

        })}
      </div>
    </Panel>);

}