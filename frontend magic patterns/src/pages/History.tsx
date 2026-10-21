import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HistoryToolbar } from '../components/history/HistoryToolbar';
import { SessionTable, type SortKey } from '../components/history/SessionTable';
import { SessionDetail } from '../components/history/SessionDetail';
import { ComparePanel } from '../components/history/ComparePanel';
import { sessions, type SessionType } from '../data/sessions';

const initialBookmarks = sessions.reduce<Record<string, boolean>>((acc, s) => {
  acc[s.id] = s.bookmarked;
  return acc;
}, {});

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  })
};

function Block({ index, className, children }: {index: number;className?: string;children: React.ReactNode;}) {
  return (
    <motion.div variants={fade} initial="hidden" animate="show" custom={index} className={className}>
      {children}
    </motion.div>);

}

export function History() {
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<SessionType[]>([]);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [selectedId, setSelectedId] = useState(sessions[0].id);
  const [compareIds, setCompareIds] = useState<string[]>(['s01', 's10']);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = sessions.filter((s) => {
      if (types.length && !types.includes(s.type)) return false;
      if (bookmarksOnly && !bookmarks[s.id]) return false;
      if (!q) return true;
      return `${s.event} ${s.circuit} ${s.country} ${s.note} ${s.type}`.toLowerCase().includes(q);
    });

    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [query, types, bookmarksOnly, bookmarks, sortKey, sortDir]);

  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[0];
  const compared = compareIds.
  map((id) => sessions.find((s) => s.id === id)).
  filter((s): s is (typeof sessions)[number] => Boolean(s));

  const toggleType = (t: SessionType) =>
  setTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const toggleCompare = (id: string) =>
  setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]);

  const toggleBookmark = (id: string) => setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));

  const sort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');else
    {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-3 p-3 xl:p-4">
      <Block index={0}>
        <HistoryToolbar
          query={query}
          onQuery={setQuery}
          types={types}
          onToggleType={toggleType}
          onClear={() => {
            setQuery('');
            setTypes([]);
            setBookmarksOnly(false);
          }}
          resultCount={rows.length}
          bookmarksOnly={bookmarksOnly}
          onToggleBookmarks={() => setBookmarksOnly((b) => !b)} />
        
      </Block>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Block index={1} className="xl:col-span-7">
          <div className="h-[560px]">
            <SessionTable
              rows={rows}
              selectedId={selectedId}
              onSelect={setSelectedId}
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={sort} />
            
          </div>
        </Block>

        <Block index={2} className="xl:col-span-5">
          <ComparePanel sessions={compared} onRemove={toggleCompare} />
        </Block>
      </div>

      <Block index={3}>
        <SessionDetail session={selected} starred={bookmarks[selected.id]} onToggleBookmark={toggleBookmark} />
      </Block>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Session archive · 730 day retention · FIA compliant storage
      </p>
    </div>);

}