import { useState } from 'react';
import { motion } from 'framer-motion';
import { cornerPerformance } from '../../data/analytics';
import { Panel } from '../ui/Panel';

function color(delta: number): string {
  if (delta <= -0.045) return '#B15CFF';
  if (delta < 0) return '#00D68F';
  if (delta < 0.02) return '#FFC531';
  return '#E10600';
}

const types = ['Slow', 'Medium', 'Fast'] as const;

export function CornerHeatmap() {
  const [filter, setFilter] = useState<'All' | (typeof types)[number]>('All');
  const visible = cornerPerformance.filter((c) => filter === 'All' || c.type === filter);

  const byType = types.map((t) => {
    const set = cornerPerformance.filter((c) => c.type === t);
    return { type: t, avg: set.reduce((a, c) => a + c.delta, 0) / set.length };
  });

  const totalGain = cornerPerformance.filter((c) => c.delta < 0).reduce((a, c) => a + c.delta, 0);
  const totalLoss = cornerPerformance.filter((c) => c.delta > 0).reduce((a, c) => a + c.delta, 0);

  return (
    <Panel
      title="Corner Performance Map"
      subtitle="Delta to field median · every turn"
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <div className="flex overflow-hidden rounded-md border border-white/[0.08]">
          {(['All', ...types] as const).map((t) =>
        <button
          key={t}
          type="button"
          onClick={() => setFilter(t)}
          className={`px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
          filter === t ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
          }>
          
              {t}
            </button>
        )}
        </div>
      }>
      
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7 xl:grid-cols-10">
        {visible.map((c, i) => {
          const tone = color(c.delta);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              title={`${c.id} · ${c.type} · ${c.delta > 0 ? '+' : ''}${c.delta.toFixed(3)}s`}
              className="group relative overflow-hidden rounded-lg border p-2 transition-transform hover:scale-[1.05]"
              style={{ borderColor: `${tone}44`, background: `${tone}14` }}>
              
              <p className="font-mono text-[10px] font-semibold text-f1-white">{c.id}</p>
              <p className="mt-0.5 font-mono text-[9px] tabular" style={{ color: tone }}>
                {c.delta > 0 ? '+' : ''}
                {c.delta.toFixed(3)}
              </p>
              <span
                className="mt-1.5 block h-[3px] rounded-full"
                style={{ background: tone, width: `${Math.min(100, Math.abs(c.delta) / 0.065 * 100)}%` }} />
              
            </motion.div>);

        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {byType.map((t) =>
        <div key={t.type} className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{t.type} corners</p>
            <p
            className="mt-1 font-mono text-[16px] font-semibold leading-none tabular"
            style={{ color: t.avg < 0 ? '#00D68F' : '#FF7A29' }}>
            
              {t.avg > 0 ? '+' : ''}
              {t.avg.toFixed(3)}s
            </p>
            <p className="mt-1 font-mono text-[8.5px] text-silver/40">avg per corner</p>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">Lap balance</span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full bg-f1-green"
            style={{ width: `${Math.abs(totalGain) / (Math.abs(totalGain) + totalLoss) * 100}%` }} />
          
          <div className="h-full bg-f1-red" style={{ flex: 1 }} />
        </div>
        <span className="font-mono text-[10px] tabular text-f1-green">{totalGain.toFixed(3)}s</span>
        <span className="font-mono text-[10px] tabular text-f1-red">+{totalLoss.toFixed(3)}s</span>
      </div>
    </Panel>);

}