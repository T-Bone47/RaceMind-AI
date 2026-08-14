import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { opponents } from '../../data/strategy';
import { Panel } from '../ui/Panel';

export function OpponentGrid({ pitLap }: {pitLap: number;}) {
  return (
    <Panel
      title="Opponent Strategy"
      subtitle="Predicted box laps · intent model"
      accent="#FF7A29"
      className="h-full"
      bodyClassName="p-3 space-y-2"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-orange">
          <Crosshair className="h-3 w-3" /> 4 tracked
        </span>
      }>
      
      {opponents.map((o, i) => {
        const conflict = Math.abs(o.predictedBox - pitLap) <= 2;
        return (
          <motion.div
            key={o.code}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-lg border p-2.5 transition-colors ${
            conflict ? 'border-f1-orange/40 bg-f1-orange/[0.06]' : 'border-white/[0.06] bg-black/25'}`
            }>
            
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-[3px] rounded-full" style={{ background: o.color }} />
              <span className="font-mono text-[11px] font-semibold text-f1-white">{o.code}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-silver/50">P{o.pos}</span>
              <span className="ml-auto font-mono text-[9.5px] text-silver/60">{o.current}</span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">
                  <span>Threat level</span>
                  <span style={{ color: o.threat > 70 ? '#E10600' : o.threat > 45 ? '#FFC531' : '#00D68F' }}>
                    {o.threat}%
                  </span>
                </div>
                <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${o.threat}%`,
                      background: o.threat > 70 ? '#E10600' : o.threat > 45 ? '#FFC531' : '#00D68F'
                    }} />
                  
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">Predicted box</p>
                <p
                  className="font-mono text-[13px] font-semibold tabular"
                  style={{ color: conflict ? '#FF7A29' : '#F3F7FB' }}>
                  
                  L{o.predictedBox}
                </p>
              </div>
            </div>

            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-silver/50">{o.intent}</p>
            {conflict &&
            <p className="mt-1.5 rounded-md bg-f1-orange/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-f1-orange">
                Pit window clash — expect double stack pressure
              </p>
            }
          </motion.div>);

      })}
    </Panel>);

}