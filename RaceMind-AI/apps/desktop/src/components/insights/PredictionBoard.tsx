import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, X } from 'lucide-react';
import { predictions } from '../../data/insights';
import { Panel } from '../ui/Panel';

const statusMeta = {
  hit: { color: '#00D68F', icon: Check, label: 'Hit' },
  missed: { color: '#E10600', icon: X, label: 'Missed' },
  pending: { color: '#8E99A8', icon: Clock, label: 'Open' }
};

export function PredictionBoard() {
  const hits = predictions.filter((p) => p.status === 'hit').length;
  const resolved = predictions.filter((p) => p.status !== 'pending').length;

  return (
    <Panel
      title="Prediction Board"
      subtitle="Open calls and their resolution"
      accent="#B15CFF"
      className="h-full"
      bodyClassName="p-3 space-y-1.5"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-f1-purple">
          {hits}/{resolved} resolved correct
        </span>
      }>
      
      {predictions.map((p, i) => {
        const meta = statusMeta[p.status];
        const Icon = meta.icon;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2 transition-colors hover:border-white/[0.14]">
            
            <span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
              style={{ background: `${meta.color}1f`, color: meta.color }}>
              
              <Icon className="h-2.5 w-2.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] text-f1-white">{p.label}</p>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">{p.window}</p>
            </div>
            <div className="flex w-[86px] shrink-0 items-center gap-1.5">
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${p.probability}%`,
                    background: p.probability > 65 ? '#00D68F' : p.probability > 40 ? '#FFC531' : '#8E99A8'
                  }} />
                
              </div>
              <span className="w-7 text-right font-mono text-[9.5px] tabular text-silver-light">{p.probability}%</span>
            </div>
          </motion.div>);

      })}
    </Panel>);

}