import { motion } from 'framer-motion';
import { insights, severityMeta, type Insight, type Severity } from '../../data/insights';
import { Panel } from '../ui/Panel';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  filter: Severity | 'all';
  selectedId: string;
  onSelect: (id: string) => void;
}

export function InsightFeed({ filter, selectedId, onSelect }: Props) {
  const visible = insights.filter((i) => filter === 'all' || i.severity === filter);

  return (
    <Panel
      title="Insight Feed"
      subtitle={`${visible.length} ranked by expected value`}
      accent="#E10600"
      className="flex h-full flex-col"
      bodyClassName="flex-1 min-h-0"
      actions={<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">Live</span>}>
      
      {visible.length === 0 ?
      <EmptyState
        title="No insights in this band"
        body="The models found nothing at this severity. Switch to “All” to see the full briefing." /> :


      <ul className="h-full space-y-2 overflow-y-auto scrollbar-thin p-3">
          {visible.map((insight, i) =>
        <FeedRow
          key={insight.id}
          insight={insight}
          index={i}
          selected={insight.id === selectedId}
          onSelect={onSelect} />

        )}
        </ul>
      }
    </Panel>);

}

function FeedRow({
  insight,
  index,
  selected,
  onSelect





}: {insight: Insight;index: number;selected: boolean;onSelect: (id: string) => void;}) {
  const meta = severityMeta[insight.severity];

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}>
      
      <button
        type="button"
        onClick={() => onSelect(insight.id)}
        aria-pressed={selected}
        className={`relative w-full overflow-hidden rounded-lg border p-3 text-left transition-all duration-200 ${
        selected ? 'bg-white/[0.05]' : 'border-white/[0.06] bg-black/25 hover:border-white/[0.14]'}`
        }
        style={selected ? { borderColor: `${meta.color}55` } : undefined}>
        
        {selected &&
        <span
          className="absolute inset-y-0 left-0 w-[2px]"
          style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />

        }

        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.14em]"
            style={{ background: `${meta.color}1f`, color: meta.color }}>
            
            {meta.label}
          </span>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/45">{insight.domain}</span>
          <span className="ml-auto font-mono text-[9px] text-silver/40">{insight.horizon}</span>
        </div>

        <h3 className="mt-2 text-[12.5px] font-medium leading-snug text-f1-white">{insight.title}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-silver/75">{insight.summary}</p>

        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-semibold tabular" style={{ color: insight.impactTone }}>
            {insight.impact}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">conf</span>
            <div className="h-[3px] w-14 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full"
                style={{ width: `${insight.confidence}%`, background: meta.color }} />
              
            </div>
            <span className="font-mono text-[9.5px] tabular" style={{ color: meta.color }}>
              {insight.confidence}%
            </span>
          </div>
        </div>
      </button>
    </motion.li>);

}