import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  GitCompare,
  Loader2,
  ScanLine,
  Sparkles,
  Table2,
  UploadCloud,
  Wand2,
  type LucideIcon } from
'lucide-react';
import { documents, type SetupDoc } from '../../data/setups';
import { Panel } from '../ui/Panel';

const kindMeta: Record<SetupDoc['kind'], {color: string;icon: LucideIcon;}> = {
  PDF: { color: '#E10600', icon: FileText },
  XLSX: { color: '#00D68F', icon: FileSpreadsheet },
  DOCX: { color: '#3D8BFF', icon: FileText },
  CSV: { color: '#FFC531', icon: Table2 },
  IMG: { color: '#B15CFF', icon: FileImage },
  TELEMETRY: { color: '#00E5FF', icon: Table2 }
};

const statusMeta = {
  parsed: { color: '#00D68F', label: 'Parsed' },
  analysing: { color: '#00E5FF', label: 'Analysing' },
  queued: { color: '#FFC531', label: 'Queued' },
  failed: { color: '#E10600', label: 'Failed' }
};

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DocumentLibrary({ selectedId, onSelect }: Props) {
  const [dragging, setDragging] = useState(false);

  return (
    <Panel
      title="Setup Documents"
      subtitle="Guides, spreadsheets, telemetry exports and screenshots"
      accent="#FFC531"
      className="h-full"
      bodyClassName="p-3"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          {documents.length} documents · 26 MB
        </span>
      }>
      
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        className="mb-3 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors"
        style={{
          borderColor: dragging ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.12)',
          background: dragging ? 'rgba(0,229,255,0.06)' : 'rgba(0,0,0,0.25)'
        }}>
        
        <motion.div animate={{ y: dragging ? -3 : 0 }} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.03]">
          <UploadCloud className="h-[18px] w-[18px] text-f1-cyan" strokeWidth={1.6} />
        </motion.div>
        <p className="mt-2.5 text-[12.5px] font-medium text-f1-white">Drop setup documents to analyse</p>
        <p className="mt-1 max-w-[420px] font-mono text-[9px] uppercase tracking-[0.12em] text-silver/50">
          PDF · DOCX · XLSX · CSV · PNG · MoTeC telemetry — values are extracted automatically
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver-light transition-colors hover:border-f1-cyan/40 hover:text-f1-white">
          
          Browse files
        </button>
      </div>

      <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
        {documents.map((d, i) => {
          const meta = kindMeta[d.kind];
          const status = statusMeta[d.aiStatus];
          const Icon = meta.icon;
          const on = d.id === selectedId;
          return (
            <motion.article
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="group overflow-hidden rounded-xl border transition-colors"
              style={{
                borderColor: on ? `${meta.color}55` : 'rgba(255,255,255,0.07)',
                background: on ? `${meta.color}0a` : 'rgba(0,0,0,0.26)'
              }}>
              
              <button type="button" onClick={() => onSelect(d.id)} className="w-full text-left">
                <div className="relative flex h-[74px] items-center gap-3 overflow-hidden border-b border-white/[0.06] bg-carbon-800 px-3">
                  <div className="pointer-events-none absolute inset-0 carbon-weave opacity-40" />
                  <div
                    className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border"
                    style={{ borderColor: `${meta.color}44`, background: `${meta.color}14` }}>
                    
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-f1-white">{d.name}</p>
                    <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/45">
                      {d.author} · {d.uploaded} · {d.version} · {d.size}
                    </p>
                  </div>
                  <span
                    className="relative flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
                    style={{ background: `${status.color}18`, color: status.color }}>
                    
                    {d.aiStatus === 'analysing' ?
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> :

                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
                    }
                    {status.label}
                  </span>
                </div>

                <div className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Tag>{d.game}</Tag>
                    <Tag>{d.circuit}</Tag>
                    <Tag>{d.session}</Tag>
                    <Tag>{d.weather}</Tag>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-silver/75">{d.summary}</p>
                  <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ color: meta.color }}>
                    {d.extracted} / 21 setup values extracted
                  </p>
                  <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${d.extracted / 21 * 100}%`, background: meta.color }} />
                    
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-3 gap-px border-t border-white/[0.06] bg-white/[0.05]">
                <DocAction icon={Eye} label="View" />
                <DocAction icon={ScanLine} label="Extract" />
                <DocAction icon={GitCompare} label="Compare" />
                <DocAction icon={Wand2} label="Generate" />
                <DocAction icon={Sparkles} label="Summarise" />
                <DocAction icon={FileText} label="Analyse" />
              </div>
            </motion.article>);

        })}
      </div>
    </Panel>);

}

function Tag({ children }: {children: React.ReactNode;}) {
  return (
    <span className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-silver/60">
      {children}
    </span>);

}

function DocAction({
  icon: Icon,
  label



}: {icon: React.ComponentType<{className?: string;}>;label: string;}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-1.5 bg-carbon-700/85 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/70 transition-colors hover:bg-carbon-600 hover:text-f1-white">
      
      <Icon className="h-2.5 w-2.5" /> {label}
    </button>);

}