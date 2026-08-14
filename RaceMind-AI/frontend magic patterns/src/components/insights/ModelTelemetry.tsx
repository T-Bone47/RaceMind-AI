import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { accuracyHistory, models } from '../../data/insights';
import { Panel } from '../ui/Panel';
import { RingGauge } from '../ui/RingGauge';

export function ModelTelemetry() {
  const peak = Math.max(...accuracyHistory.map((a) => a.value));
  const latest = accuracyHistory[accuracyHistory.length - 1];

  return (
    <Panel
      title="Model Telemetry"
      subtitle="Ensemble health & calibration"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-4 space-y-4"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-cyan">
          <Cpu className="h-3 w-3" /> {models.length} models
        </span>
      }>
      
      <div className="flex items-center gap-4">
        <RingGauge value={latest.value} label="Accuracy" unit="%" color="#00E5FF" size={86} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
            Prediction accuracy by round
          </p>
          <div className="mt-2 flex h-[62px] items-end gap-1.5">
            {accuracyHistory.map((a, i) =>
            <div key={a.round} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                className="w-full rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${a.value / peak * 44}px` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                style={{
                  background: i === accuracyHistory.length - 1 ? '#00E5FF' : 'rgba(0,229,255,0.28)',
                  boxShadow: i === accuracyHistory.length - 1 ? '0 0 12px #00E5FF88' : undefined
                }} />
              
                <span className="font-mono text-[7.5px] uppercase tracking-[0.08em] text-silver/40">{a.round}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ul className="space-y-1.5">
        {models.map((m) => {
          const degraded = m.status === 'degraded';
          const color = degraded ? '#FFC531' : '#00D68F';
          return (
            <li
              key={m.name}
              className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
              
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${degraded ? 'animate-pulseGlow' : ''}`}
                style={{ background: color }} />
              
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] text-f1-white">{m.name}</p>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">
                  {m.version} · {m.latency} ms
                </p>
              </div>
              <div className="flex w-[76px] shrink-0 items-center gap-1.5">
                <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full" style={{ width: `${m.accuracy}%`, background: color }} />
                </div>
                <span className="w-8 text-right font-mono text-[9.5px] tabular" style={{ color }}>
                  {m.accuracy}
                </span>
              </div>
            </li>);

        })}
      </ul>

      <div className="rounded-lg border border-f1-amber/25 bg-f1-amber/[0.06] px-3 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-f1-amber">Calibration notice</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-silver-light">
          The rival intent model is running 4.8 points below its season baseline at Monaco, where pit-lane sightlines
          are restricted. Treat opponent box-lap predictions as directional rather than precise.
        </p>
      </div>
    </Panel>);

}