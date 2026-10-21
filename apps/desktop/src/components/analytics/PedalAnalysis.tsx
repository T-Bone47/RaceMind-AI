import { motion } from 'framer-motion';
import { pedalMetrics } from '../../data/analytics';
import { Panel } from '../ui/Panel';

export function PedalAnalysis({ compareTo }: {compareTo: string;}) {
  return (
    <Panel
      title="Input Technique"
      subtitle={`Driver inputs vs ${compareTo === 'FIELD' ? 'field median' : 'Antonelli'}`}
      accent="#FF7A29"
      className="h-full"
      bodyClassName="p-4 space-y-3"
      actions={<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">6 channels</span>}>
      
      {pedalMetrics.map((m, i) => {
        const scale = Math.max(m.value, m.benchmark) * 1.18;
        const better = m.label === 'Coasting time' ? m.value < m.benchmark : m.value >= m.benchmark;
        const color = better ? '#00D68F' : '#FF7A29';
        return (
          <div key={m.label}>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-silver/60">{m.label}</span>
              <span className="font-mono text-[11.5px] font-semibold tabular" style={{ color }}>
                {m.value}
                <span className="ml-0.5 text-[8.5px] text-silver/45">{m.unit}</span>
              </span>
            </div>
            <div className="relative mt-1.5 h-[6px] overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${m.value / scale * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: color, boxShadow: `0 0 8px ${color}77` }} />
              
              <span
                className="absolute inset-y-0 w-[2px] bg-white/70"
                style={{ left: `${m.benchmark / scale * 100}%` }}
                title={`Benchmark ${m.benchmark}${m.unit}`} />
              
            </div>
            <p className="mt-1 font-mono text-[8.5px] text-silver/45">{m.note}</p>
          </div>);

      })}

      <div className="!mt-4 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Reference marker</p>
        <p className="mt-1 text-[11px] leading-relaxed text-silver">
          The white tick on each bar is the comparison benchmark. Trail braking and peak pressure are the two channels
          where the reference model still holds an advantage.
        </p>
      </div>
    </Panel>);

}