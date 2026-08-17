import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Download, Trophy } from 'lucide-react';
import { comparisons, scoreCards } from '../../data/analytics';
import { focusDriver } from '../../data/race';

interface Props {
  compareTo: string;
  onCompare: (code: string) => void;
}

export function DriverHero({ compareTo, onCompare }: Props) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 brushed opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-[0.18] blur-[80px]"
        style={{ background: focusDriver.teamColor }}
        aria-hidden="true" />
      

      <div className="relative flex flex-col gap-5 p-5 2xl:flex-row 2xl:items-center">
        <div className="flex items-center gap-4">
          <div
            className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-xl border"
            style={{ borderColor: `${focusDriver.teamColor}55`, background: `${focusDriver.teamColor}12` }}>
            
            <span className="font-mono text-[26px] font-bold" style={{ color: focusDriver.teamColor }}>
              {focusDriver.number}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">Driver analytics · 2032</p>
            <h1 className="mt-1 text-[24px] font-semibold leading-none tracking-tight text-f1-white">
              {focusDriver.name}
            </h1>
            <p className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-silver">
              {focusDriver.team}
              <span className="text-silver/30">·</span>
              <span className="flex items-center gap-1 text-f1-amber">
                <Trophy className="h-3 w-3" /> WDC P{focusDriver.championshipPos}
              </span>
              <span className="text-silver/30">·</span>
              <span>8 rounds analysed</span>
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.05] sm:grid-cols-3 xl:grid-cols-5">
          {scoreCards.map((s, i) => {
            const positive = !s.delta.startsWith('−');
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-carbon-700/85 px-3 py-2.5 transition-colors hover:bg-carbon-600/85">
                
                <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">{s.label}</p>
                <p className="mt-1.5 font-mono text-[20px] font-semibold leading-none tabular" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p
                  className="mt-1.5 flex items-center gap-1 font-mono text-[9px]"
                  style={{ color: positive ? '#00D68F' : '#FF7A29' }}>
                  
                  {positive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {s.delta} vs season avg
                </p>
              </motion.div>);

          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-1">
            <span className="px-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/50">Compare</span>
            {comparisons.map((c) =>
            <button
              key={c.code}
              type="button"
              onClick={() => onCompare(c.code)}
              className="rounded-md px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors"
              style={{
                color: compareTo === c.code ? c.color : '#8E99A8',
                background: compareTo === c.code ? `${c.color}18` : 'transparent'
              }}>
              
                {c.code}
              </button>
            )}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver transition-colors hover:border-white/[0.18] hover:text-f1-white">
            
            <Download className="h-3.5 w-3.5" /> Export report
          </button>
        </div>
      </div>
    </section>);

}