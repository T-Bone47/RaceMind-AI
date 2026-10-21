import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';

interface Props {
  dirty: boolean;
  changedCount: number;
  saved: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function SaveBar({ dirty, changedCount, saved, onSave, onReset }: Props) {
  return (
    <AnimatePresence>
      {(dirty || saved) &&
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="pointer-events-none sticky bottom-3 z-30 flex justify-center">
        
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/[0.12] bg-carbon-600/95 px-3 py-2.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,1)] backdrop-blur-xl">
            {saved ?
          <span className="flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-f1-green">
                <Check className="h-3.5 w-3.5" /> Configuration saved to the pit wall
              </span> :

          <>
                <span className="flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-silver">
                  <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-amber" />
                  {changedCount} unsaved change{changedCount === 1 ? '' : 's'}
                </span>
                <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver transition-colors hover:border-white/[0.2] hover:text-f1-white">
              
                  <RotateCcw className="h-3 w-3" /> Discard
                </button>
                <button
              type="button"
              onClick={onSave}
              className="rounded-lg bg-f1-cyan px-3.5 py-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-carbon-900 transition-transform hover:scale-[1.03] active:scale-95">
              
                  Save changes
                </button>
              </>
          }
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}