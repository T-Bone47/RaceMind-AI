import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';
import { typeColor, type SessionRecord } from '../../data/sessions';
import { formatLapTime } from '../../utils/format';
import { Panel } from '../ui/Panel';
import { EmptyState } from '../ui/EmptyState';

export type SortKey = 'date' | 'event' | 'bestLap' | 'laps' | 'position' | 'sizeGb';

interface Props {
  rows: SessionRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  bookmarks: Record<string, boolean>;
  onToggleBookmark: (id: string) => void;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
}

const columns: {key: SortKey | 'compare' | 'type' | 'star';label: string;align?: string;}[] = [
{ key: 'compare', label: '' },
{ key: 'event', label: 'Session' },
{ key: 'type', label: 'Type' },
{ key: 'date', label: 'Date' },
{ key: 'laps', label: 'Laps', align: 'text-right' },
{ key: 'bestLap', label: 'Best lap', align: 'text-right' },
{ key: 'position', label: 'Pos', align: 'text-right' },
{ key: 'sizeGb', label: 'Data', align: 'text-right' },
{ key: 'star', label: '' }];


export function SessionTable({
  rows,
  selectedId,
  onSelect,
  compareIds,
  onToggleCompare,
  bookmarks,
  onToggleBookmark,
  sortKey,
  sortDir,
  onSort
}: Props) {
  return (
    <Panel
      title="Archive"
      subtitle={`${rows.length} sessions · click a row to inspect`}
      accent="#00E5FF"
      className="flex h-full flex-col"
      bodyClassName="flex-1 min-h-0 flex flex-col"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          {compareIds.length}/3 selected to compare
        </span>
      }>
      
      <div className="grid grid-cols-[28px_1fr_62px_84px_50px_74px_42px_58px_28px] gap-2 border-b border-white/[0.06] px-3 py-1.5">
        {columns.map((c) => {
          const sortable = ['event', 'date', 'laps', 'bestLap', 'position', 'sizeGb'].includes(c.key);
          const active = sortKey === c.key;
          return (
            <button
              key={c.key}
              type="button"
              disabled={!sortable}
              onClick={() => sortable && onSort(c.key as SortKey)}
              className={`flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.14em] transition-colors ${
              c.align === 'text-right' ? 'justify-end' : ''} ${
              active ? 'text-f1-cyan' : 'text-silver/45'} ${sortable ? 'hover:text-f1-white' : 'cursor-default'}`}>
              
              {c.label}
              {active && (
              sortDir === 'asc' ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />)}
            </button>);

        })}
      </div>

      {rows.length === 0 ?
      <div className="flex-1">
          <EmptyState
          title="No sessions found"
          body="Nothing in the archive matches these filters. Try clearing the type filters or searching a circuit name." />
        
        </div> :

      <ul className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {rows.map((s, i) => {
          const selected = s.id === selectedId;
          const inCompare = compareIds.includes(s.id);
          const starred = bookmarks[s.id];
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.3 }}
              className={`relative grid grid-cols-[28px_1fr_62px_84px_50px_74px_42px_58px_28px] items-center gap-2 border-b border-white/[0.035] px-3 py-2 transition-colors ${
              selected ? 'bg-f1-cyan/[0.07]' : 'hover:bg-white/[0.03]'}`
              }>
              
                {selected && <span className="absolute inset-y-0 left-0 w-[2px] bg-f1-cyan shadow-[0_0_10px_#00E5FF]" />}

                <button
                type="button"
                onClick={() => onToggleCompare(s.id)}
                aria-label={`${inCompare ? 'Remove from' : 'Add to'} comparison`}
                className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                inCompare ? 'border-f1-cyan bg-f1-cyan/20' : 'border-white/15 hover:border-white/40'}`
                }>
                
                  {inCompare && <span className="h-1.5 w-1.5 rounded-sm bg-f1-cyan" />}
                </button>

                <button type="button" onClick={() => onSelect(s.id)} className="min-w-0 text-left">
                  <p className="truncate text-[12px] font-medium text-f1-white">{s.event}</p>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-silver/45">
                    {s.circuit} · {s.country} · {s.conditions}
                  </p>
                </button>

                <span
                className="justify-self-start rounded px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.1em]"
                style={{ background: `${typeColor[s.type]}1f`, color: typeColor[s.type] }}>
                
                  {s.type}
                </span>

                <span className="font-mono text-[10px] text-silver tabular">{s.date}</span>
                <span className="text-right font-mono text-[10.5px] text-silver-light tabular">{s.laps}</span>
                <span className="text-right font-mono text-[10.5px] text-f1-cyan tabular">
                  {formatLapTime(s.bestLap)}
                </span>
                <span
                className="text-right font-mono text-[10.5px] font-semibold tabular"
                style={{ color: s.position === 1 ? '#B15CFF' : s.position === 0 ? '#8E99A8' : '#F3F7FB' }}>
                
                  {s.position === 0 ? '—' : `P${s.position}`}
                </span>
                <span className="text-right font-mono text-[10px] text-silver/60 tabular">{s.sizeGb} GB</span>

                <button
                type="button"
                onClick={() => onToggleBookmark(s.id)}
                aria-label={starred ? 'Remove bookmark' : 'Bookmark session'}
                className="grid h-5 w-5 place-items-center rounded-md transition-colors">
                
                  <Star
                  className="h-3 w-3"
                  style={{ color: starred ? '#FFC531' : 'rgba(255,255,255,0.22)' }}
                  fill={starred ? '#FFC531' : 'none'} />
                
                </button>
              </motion.li>);

        })}
        </ul>
      }
    </Panel>);

}