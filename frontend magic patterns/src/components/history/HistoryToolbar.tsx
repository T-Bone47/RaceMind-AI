import React from 'react';
import { Archive, Calendar, Database, Search, SlidersHorizontal, X } from 'lucide-react';
import { archive, typeColor, type SessionType } from '../../data/sessions';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  types: SessionType[];
  onToggleType: (t: SessionType) => void;
  onClear: () => void;
  resultCount: number;
  bookmarksOnly: boolean;
  onToggleBookmarks: () => void;
}

const allTypes: SessionType[] = ['RACE', 'QUALI', 'SPRINT', 'FP', 'TEST', 'SIM'];

export function HistoryToolbar({
  query,
  onQuery,
  types,
  onToggleType,
  onClear,
  resultCount,
  bookmarksOnly,
  onToggleBookmarks
}: Props) {
  const filtering = query.length > 0 || types.length > 0 || bookmarksOnly;
  const storagePct = archive.storageUsedTb / archive.storageCapTb * 100;

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 brushed opacity-60" aria-hidden="true" />

      <div className="relative flex flex-col gap-4 p-4 2xl:flex-row 2xl:items-center">
        <div className="flex items-center gap-3.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.09] bg-black/35">
            <Archive className="h-4.5 w-4.5 text-silver-light" strokeWidth={1.6} />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">Session archive · 2032</p>
            <h1 className="mt-1 text-[22px] font-semibold leading-none tracking-tight text-f1-white">
              Session History
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver">
              <span>{archive.totalSessions} sessions</span>
              <span className="text-silver/30">·</span>
              <span>{archive.totalHours} h logged</span>
              <span className="text-silver/30">·</span>
              <span className="flex items-center gap-1 text-f1-cyan">
                <Database className="h-3 w-3" /> {archive.storageUsedTb} / {archive.storageCapTb} TB
              </span>
            </p>
          </div>
        </div>

        <div className="hidden w-[132px] 2xl:block">
          <div className="h-[4px] overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-f1-cyan"
              style={{ width: `${storagePct}%`, boxShadow: '0 0 8px #00E5FF88' }} />
            
          </div>
          <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/40">
            {archive.retentionDays} day retention
          </p>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 2xl:justify-end">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-black/35 px-3 py-2 transition-colors focus-within:border-f1-cyan/45 2xl:max-w-[300px]">
            <Search className="h-3.5 w-3.5 shrink-0 text-silver/50" strokeWidth={1.7} />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search events, circuits, notes…"
              aria-label="Search sessions"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-f1-white placeholder:text-silver/45 focus:outline-none" />
            
            {query &&
            <button
              type="button"
              onClick={() => onQuery('')}
              aria-label="Clear search"
              className="grid h-4 w-4 shrink-0 place-items-center rounded text-silver/60 hover:text-f1-white">
              
                <X className="h-3 w-3" />
              </button>
            }
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-1">
            <SlidersHorizontal className="mx-1 h-3 w-3 text-silver/45" />
            {allTypes.map((t) => {
              const on = types.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onToggleType(t)}
                  className="rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors"
                  style={{
                    color: on ? typeColor[t] : '#8E99A8',
                    background: on ? `${typeColor[t]}18` : 'transparent'
                  }}>
                  
                  {t}
                </button>);

            })}
          </div>

          <button
            type="button"
            onClick={onToggleBookmarks}
            className={`rounded-lg border px-2.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-colors ${
            bookmarksOnly ?
            'border-f1-amber/50 bg-f1-amber/10 text-f1-amber' :
            'border-white/[0.07] bg-black/25 text-silver/60 hover:text-f1-white'}`
            }>
            
            Bookmarked
          </button>

          <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver/55">
            <Calendar className="h-3 w-3" /> {resultCount} results
          </span>

          {filtering &&
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-white/[0.07] px-2.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver/60 transition-colors hover:text-f1-white">
            
              Reset
            </button>
          }
        </div>
      </div>
    </section>);

}