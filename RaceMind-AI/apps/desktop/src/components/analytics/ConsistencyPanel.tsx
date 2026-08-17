import { motion } from 'framer-motion';
import { lapDistribution } from '../../data/analytics';
import { Panel } from '../ui/Panel';
import { Trace } from '../ui/Trace';
import { wave } from '../../utils/series';

const rollingSigma = wave(48, 21, 1).map((v) => 0.19 + v * 0.035);

export function ConsistencyPanel() {
  const peak = Math.max(...lapDistribution.map((d) => d.count));
  const total = lapDistribution.reduce((a, d) => a + d.count, 0);

  return (
    <Panel
      title="Consistency"
      subtitle="Race stint lap distribution · 43 laps"
      accent="#B15CFF"
      className="h-full"
      bodyClassName="p-4"
      actions={<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-f1-purple">σ 0.184s</span>}>
      
      <div className="flex h-[132px] items-end gap-1.5">
        {lapDistribution.map((d, i) => {
          const isMode = d.count === peak;
          return (
            <div key={d.bucket} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[9px] text-silver/45 tabular">{d.count}</span>
              <motion.div
                className="w-full rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${d.count / peak * 92}px` }}
                transition={{ duration: 0.6, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: isMode ? '#B15CFF' : 'rgba(177,92,255,0.35)',
                  boxShadow: isMode ? '0 0 14px #B15CFF88' : undefined
                }} />
              
              <span className="font-mono text-[8px] text-silver/40">{d.bucket}</span>
            </div>);

        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Metric label="Median" value="75.24s" color="#F3F7FB" />
        <Metric label="Within ±0.2s" value={`${Math.round((12 + 9 + 7) / total * 100)}%`} color="#00D68F" />
        <Metric label="Outliers" value="2 laps" color="#FF7A29" />
      </div>

      <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/25 px-2.5 pt-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">
            Rolling σ · last 48 laps
          </span>
          <span className="font-mono text-[11px] tabular text-f1-purple">improving</span>
        </div>
        <div className="-mx-2.5">
          <Trace values={rollingSigma} color="#B15CFF" height={48} width={320} />
        </div>
      </div>
    </Panel>);

}

function Metric({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[14px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}