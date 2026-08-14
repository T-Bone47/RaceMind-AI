import { useRaceData } from '../../hooks/useRaceData';
import React from 'react';
import { motion } from 'framer-motion';
import { Siren, TrendingUp } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { RingGauge } from '../ui/RingGauge';

const eventColor: Record<string, string> = {
  start: '#F3F7FB',
  vsc: '#FFC531',
  pit: '#3D8BFF',
  gain: '#00D68F',
  purple: '#B15CFF',
  now: '#E10600',
  window: '#00E5FF',
  end: '#8E99A8'
};

const championship = [
{ pos: 1, code: 'VER', pts: 189, delta: 0 },
{ pos: 2, code: 'NOR', pts: 162, delta: 0 },
{ pos: 3, code: 'LEC', pts: 148, delta: 0 },
{ pos: 4, code: 'RUS', pts: 137, delta: 15 }];


export function RaceIntel() {
  const { raceEvents, session } = useRaceData();

  return (
    <Panel
      title="Race Intelligence"
      subtitle="Neutralisation risk · championship impact"
      accent="#E10600"
      className="h-full"
      bodyClassName="p-4 space-y-4">
      
      <div className="flex items-center gap-4">
        <RingGauge value={31} label="SC risk" unit="%" color="#FFC531" size={88} />
        <div className="min-w-0 flex-1 space-y-2">
          <Risk label="Safety Car" value={31} color="#FFC531" note="Monaco base rate 46%" />
          <Risk label="Virtual SC" value={22} color="#FF7A29" note="Debris probability rising" />
          <Risk label="Red Flag" value={7} color="#E10600" note="Barrier contact model" />
          <p className="flex items-center gap-1.5 pt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-silver/50">
            <Siren className="h-3 w-3 text-f1-amber" /> Boxing under SC saves 11.4s
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <span>Session timeline</span>
          <span>L1 — L{session.totalLaps}</span>
        </div>
        <div className="relative h-[46px]">
          <span className="absolute left-0 right-0 top-[9px] h-px bg-white/[0.09]" />
          {raceEvents.map((e, i) => {
            const left = e.lap / session.totalLaps * 100;
            return (
              <motion.div
                key={e.lap}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${Math.min(97, Math.max(3, left))}%` }}>
                
                <span
                  className="mx-auto block h-[18px] w-[2px] rounded-full"
                  style={{ background: eventColor[e.kind], boxShadow: `0 0 8px ${eventColor[e.kind]}` }} />
                
                <span
                  className="mt-1 block whitespace-nowrap font-mono text-[7.5px] uppercase tracking-[0.1em]"
                  style={{ color: eventColor[e.kind] }}>
                  
                  L{e.lap}
                </span>
                <span className="mt-0.5 block whitespace-nowrap font-mono text-[7px] uppercase tracking-[0.08em] text-silver/40">
                  {e.label}
                </span>
              </motion.div>);

          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <span>Championship impact</span>
          <span className="flex items-center gap-1 text-f1-green">
            <TrendingUp className="h-3 w-3" /> +15 pts projected
          </span>
        </div>
        <ul className="space-y-1">
          {championship.map((c) => {
            const focus = c.code === 'RUS';
            return (
              <li
                key={c.code}
                className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 ${focus ? 'bg-f1-cyan/[0.07]' : ''}`}>
                
                <span className="w-4 font-mono text-[10px] text-silver/50 tabular">{c.pos}</span>
                <span className="w-9 font-mono text-[11px] font-semibold text-f1-white">{c.code}</span>
                <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.pts / 189 * 100}%`,
                      background: focus ? '#00E5FF' : 'rgba(255,255,255,0.22)'
                    }} />
                  
                </div>
                <span className="w-9 text-right font-mono text-[10.5px] text-silver-light tabular">{c.pts}</span>
                {c.delta > 0 &&
                <span className="w-8 text-right font-mono text-[9.5px] text-f1-green tabular">+{c.delta}</span>
                }
              </li>);

          })}
        </ul>
      </div>
    </Panel>);

}

function Risk({ label, value, color, note }: {label: string;value: number;color: string;note: string;}) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[9px]">
        <span className="uppercase tracking-[0.12em] text-silver/55">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}88` }} />
        
      </div>
      <p className="mt-0.5 font-mono text-[8px] text-silver/35">{note}</p>
    </div>);

}