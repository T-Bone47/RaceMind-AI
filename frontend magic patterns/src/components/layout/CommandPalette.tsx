import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Search } from 'lucide-react';
import { navItems } from './Sidebar';
import { EmptyState } from '../ui/EmptyState';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface Command {
  group: string;
  label: string;
  hint: string;
  to?: string;
}

const navCommands: Command[] = navItems.
filter((n) => n.ready).
map((n) => ({ group: 'Go to', label: n.label, hint: n.code, to: n.to }));

const commands: Command[] = [
...navCommands,
{ group: 'Setups', label: 'Generate an AI setup for this circuit', hint: 'Setup library', to: '/setups' },
{ group: 'Setups', label: 'Compare against the pro esports setup', hint: '21 parameters', to: '/setups' },
{ group: 'Reports', label: 'Compose a race debrief', hint: '14 pages · PDF', to: '/reports' },
{ group: 'Reports', label: 'Publish to the sporting director', hint: 'Secure link', to: '/reports' },
{ group: 'Strategy', label: 'Simulate undercut on NOR', hint: 'Monte Carlo · 12k runs' },
{ group: 'Strategy', label: 'Model safety car at lap 48', hint: 'SC / VSC branch' },
{ group: 'Strategy', label: 'Set pit window to lap 45', hint: 'Commit to crew' },
{ group: 'Telemetry', label: 'Overlay reference lap 34', hint: 'RUS · 1:14.983' },
{ group: 'Telemetry', label: 'Compare RUS vs LEC sector 2', hint: 'Delta trace' },
{ group: 'Telemetry', label: 'Open brake temperature heatmap', hint: 'All four corners' },
{ group: 'Radio', label: 'Message driver: box this lap', hint: 'Priority channel' },
{ group: 'Radio', label: 'Replay last driver transmission', hint: 'Lap 42' },
{ group: 'AI', label: 'Ask race engineer: tyre cliff risk', hint: 'Natural language' },
{ group: 'AI', label: 'Generate stint executive summary', hint: 'PDF export' }];


export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.group} ${c.label} ${c.hint}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        const target = results[index];
        if (target?.to) navigate(target.to);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, index, navigate, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}>
        
          <button
          type="button"
          aria-label="Close command palette"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm" />
        
          <motion.div
          role="dialog"
          aria-label="Command palette"
          initial={{ opacity: 0, y: -12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="relative w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/[0.1] bg-carbon-700/95 shadow-[0_40px_100px_-30px_rgba(0,0,0,1)] backdrop-blur-2xl">
          
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
              <Search className="h-4 w-4 text-f1-cyan" strokeWidth={1.7} />
              <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              placeholder="Jump to a module, run a simulation, compose a report…"
              className="flex-1 bg-transparent text-[13px] text-f1-white placeholder:text-silver/45 focus:outline-none" />
            
              <kbd className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[9px] text-silver/60">ESC</kbd>
            </div>

            <div className="max-h-[46vh] overflow-y-auto scrollbar-thin p-1.5">
              {results.length === 0 ?
            <EmptyState
              title="No matching command"
              body="Try “setup”, “report”, “undercut” or “brake temps”."
              compact /> :


            results.map((c, i) =>
            <button
              key={c.label}
              type="button"
              onMouseEnter={() => setIndex(i)}
              onClick={() => {
                if (c.to) navigate(c.to);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              i === index ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`
              }>
              
                    <span className="w-[62px] shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-f1-cyan/70">
                      {c.group}
                    </span>
                    <span className="flex-1 truncate text-[12.5px] text-f1-white">{c.label}</span>
                    <span className="hidden shrink-0 font-mono text-[9.5px] text-silver/50 sm:block">{c.hint}</span>
                    {i === index && <CornerDownLeft className="h-3 w-3 shrink-0 text-silver/60" />}
                  </button>
            )
            }
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}