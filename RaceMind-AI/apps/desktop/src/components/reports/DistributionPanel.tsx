import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Check, FileDown, Send } from 'lucide-react';
import { recipients } from '../../data/reports';
import { Panel } from '../ui/Panel';

const formats = ['PDF', 'DOCX', 'Slide deck', 'Web link'] as const;
const schedules = ['Manual', 'On session end', 'Every Monday 09:00'] as const;

export function DistributionPanel() {
  const [selected, setSelected] = useState<string[]>(['r1', 'r2', 'r3']);
  const [format, setFormat] = useState<(typeof formats)[number]>('PDF');
  const [schedule, setSchedule] = useState<(typeof schedules)[number]>('On session end');
  const [sent, setSent] = useState(false);

  const toggle = (id: string) =>
  setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const send = () => {
    setSent(true);
    window.setTimeout(() => setSent(false), 2400);
  };

  return (
    <Panel
      title="Distribution"
      subtitle="Who receives this report and how"
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-3 space-y-3"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">
          {selected.length} recipients
        </span>
      }>
      
      <ul className="space-y-1">
        {recipients.map((r) => {
          const on = selected.includes(r.id);
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => toggle(r.id)}
                aria-pressed={on}
                className="flex w-full items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left transition-colors"
                style={{
                  borderColor: on ? `${r.color}44` : 'rgba(255,255,255,0.06)',
                  background: on ? `${r.color}0d` : 'rgba(0,0,0,0.22)'
                }}>
                
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-[9px] font-bold"
                  style={{ background: `${r.color}1f`, color: r.color }}>
                  
                  {r.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] text-f1-white">{r.name}</p>
                  <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/45">
                    {r.role} · {r.channel}
                  </p>
                </div>
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors"
                  style={{
                    borderColor: on ? r.color : 'rgba(255,255,255,0.18)',
                    background: on ? r.color : 'transparent'
                  }}>
                  
                  {on && <Check className="h-2.5 w-2.5 text-carbon-900" strokeWidth={3} />}
                </span>
              </button>
            </li>);

        })}
      </ul>

      <div>
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Export format</p>
        <div className="grid grid-cols-4 gap-1">
          {formats.map((f) =>
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={`rounded-md border py-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] transition-colors ${
            format === f ?
            'border-f1-green/45 bg-f1-green/[0.1] text-f1-green' :
            'border-white/[0.07] bg-black/25 text-silver/60 hover:text-f1-white'}`
            }>
            
              {f}
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <CalendarClock className="h-3 w-3" /> Delivery schedule
        </p>
        <div className="space-y-1">
          {schedules.map((s) =>
          <button
            key={s}
            type="button"
            onClick={() => setSchedule(s)}
            className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
            schedule === s ?
            'border-f1-cyan/45 bg-f1-cyan/[0.08] text-f1-cyan' :
            'border-white/[0.06] bg-black/22 text-silver/60 hover:text-f1-white'}`
            }>
            
              <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: schedule === s ? '#00E5FF' : 'rgba(255,255,255,0.2)' }} />
            
              {s}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          type="button"
          onClick={send}
          whileTap={{ scale: 0.96 }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] transition-colors ${
          sent ? 'bg-f1-green text-carbon-900' : 'bg-f1-cyan text-carbon-900 hover:brightness-110'}`
          }>
          
          {sent ?
          <>
              <Check className="h-3.5 w-3.5" /> Sent to {selected.length}
            </> :

          <>
              <Send className="h-3.5 w-3.5" /> Publish {format}
            </>
          }
        </motion.button>
        <button
          type="button"
          aria-label="Download draft"
          className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg border border-white/[0.08] text-silver transition-colors hover:border-white/[0.2] hover:text-f1-white">
          
          <FileDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </Panel>);

}