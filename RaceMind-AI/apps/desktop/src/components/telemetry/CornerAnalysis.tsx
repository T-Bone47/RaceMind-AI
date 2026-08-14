import React from 'react';
import { motion } from 'framer-motion';
import { cornerAnalysis, microSectors } from '../../data/telemetry';
import { Panel } from '../ui/Panel';

const stateColor = { purple: '#B15CFF', green: '#00D68F', yellow: '#FFC531', red: '#E10600' };

interface Props {
  cursor: number;
  onCursor: (c: number) => void;
}

export function CornerAnalysis({ cursor, onCursor }: Props) {
  const totalLoss = cornerAnalysis.reduce((a, c) => a + c.timeLoss, 0);

  return (
    <Panel
      title="Corner & Micro-Sector Analysis"
      subtitle="vs reference L34 · 24 micro sectors"
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-4 space-y-4"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-f1-amber">
          Loss {totalLoss.toFixed(3)}s
        </span>
      }>
      
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <span>Micro sectors</span>
          <span>Δ per segment</span>
        </div>
        <div className="flex gap-[3px]">
          {microSectors.map((m) =>
          <button
            key={m.id}
            type="button"
            onClick={() => onCursor((m.id - 0.5) / microSectors.length)}
            title={`MS${m.id} · ${m.delta > 0 ? '+' : ''}${m.delta.toFixed(3)}s`}
            className="group relative flex-1">
            
              <motion.span
              initial={{ scaleY: 0.3, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: m.id * 0.012 }}
              className="block h-6 rounded-sm transition-transform group-hover:scale-y-110"
              style={{ background: stateColor[m.state], opacity: 0.85, transformOrigin: 'bottom' }} />
            
            </button>
          )}
        </div>
        <div className="relative mt-1 h-3">
          <span
            className="absolute top-0 h-3 w-px bg-f1-cyan"
            style={{ left: `${cursor * 100}%`, boxShadow: '0 0 8px #00E5FF' }} />
          
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/[0.06]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {['Corner', 'Entry', 'Apex', 'Exit', 'Gear', 'Brake', 'Δ'].map((h) =>
              <th
                key={h}
                className="px-2.5 py-1.5 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-silver/45">
                
                  {h}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {cornerAnalysis.map((c, i) => {
              const gain = c.delta < 0;
              return (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/[0.035] transition-colors last:border-b-0 hover:bg-white/[0.03]">
                  
                  <td className="px-2.5 py-2">
                    <span className="font-mono text-[11px] font-semibold text-f1-white">{c.id}</span>
                    <span className="ml-1.5 text-[10px] text-silver/50">{c.name}</span>
                  </td>
                  <td className="px-2.5 py-2 font-mono text-[10.5px] text-silver-light tabular">{c.entry}</td>
                  <td className="px-2.5 py-2 font-mono text-[10.5px] tabular text-f1-cyan">{c.apex}</td>
                  <td className="px-2.5 py-2 font-mono text-[10.5px] text-silver-light tabular">{c.exit}</td>
                  <td className="px-2.5 py-2 font-mono text-[10.5px] text-silver tabular">{c.gear}</td>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-[3px] w-10 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-f1-red"
                          style={{ width: `${c.brakeBar / 140 * 100}%` }} />
                        
                      </div>
                      <span className="font-mono text-[9.5px] text-silver/60 tabular">{c.brakeBar}</span>
                    </div>
                  </td>
                  <td className="px-2.5 py-2">
                    <span
                      className="font-mono text-[10.5px] font-semibold tabular"
                      style={{ color: gain ? '#00D68F' : '#FF7A29' }}>
                      
                      {gain ? '' : '+'}
                      {c.delta.toFixed(3)}
                    </span>
                  </td>
                </motion.tr>);

            })}
          </tbody>
        </table>
      </div>
    </Panel>);

}