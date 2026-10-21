import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileText, MoreHorizontal } from 'lucide-react';
import { archive, type ArchivedReport } from '../../data/reports';
import { Panel } from '../ui/Panel';
import { EmptyState } from '../ui/EmptyState';

const statusMeta = {
  published: { color: '#00D68F', label: 'Published' },
  draft: { color: '#FFC531', label: 'Draft' },
  scheduled: { color: '#00E5FF', label: 'Scheduled' }
};

const filters = ['All', 'published', 'draft', 'scheduled'] as const;

export function ReportArchive() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const rows: ArchivedReport[] = archive.filter((a) => filter === 'All' || a.status === filter);

  return (
    <Panel
      title="Report Archive"
      subtitle={`${rows.length} of ${archive.length} reports`}
      accent="#FFC531"
      bodyClassName="p-3"
      actions={
      <div className="flex overflow-hidden rounded-md border border-white/[0.08]">
          {filters.map((f) =>
        <button
          key={f}
          type="button"
          onClick={() => setFilter(f)}
          className={`px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
          filter === f ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
          }>
          
              {f === 'All' ? 'All' : statusMeta[f].label}
            </button>
        )}
        </div>
      }>
      
      {rows.length === 0 ?
      <EmptyState
        title="No reports in this state"
        body="Publish a draft, or switch the filter back to All to see the full archive."
        compact /> :


      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r, i) => {
          const meta = statusMeta[r.status];
          return (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              whileHover={{ y: -2 }}
              className="group overflow-hidden rounded-xl border border-white/[0.07] bg-black/25 transition-colors hover:border-white/[0.16]">
              
                <div className="relative flex items-start gap-2.5 border-b border-white/[0.06] p-3">
                  <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                  style={{ borderColor: `${meta.color}3d`, background: `${meta.color}12` }}>
                  
                    <FileText className="h-4 w-4" style={{ color: meta.color }} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-f1-white">{r.title}</p>
                    <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">
                      {r.event}
                    </p>
                  </div>
                  <button
                  type="button"
                  aria-label={`More actions for ${r.title}`}
                  className="grid h-5 w-5 shrink-0 place-items-center rounded text-silver/40 opacity-0 transition-opacity hover:text-f1-white group-hover:opacity-100">
                  
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between px-3 py-2 font-mono text-[9px]">
                  <span
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 uppercase tracking-[0.12em]"
                  style={{ background: `${meta.color}18`, color: meta.color }}>
                  
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                  <span className="text-silver/50">
                    {r.format} · {r.pages}p · {r.size}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.05] px-3 py-2">
                  <span className="flex items-center gap-1.5 font-mono text-[9px] text-silver/50">
                    <Eye className="h-2.5 w-2.5" /> {r.opens} opens
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-silver/40">{r.generated}</span>
                </div>
              </motion.article>);

        })}
        </div>
      }
    </Panel>);

}