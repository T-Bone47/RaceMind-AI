import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Minus } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import type { DriverEntry, SectorState } from '../../types/race';
import { formatLapTime } from '../../utils/format';
import { Panel, PanelChip } from '../ui/Panel';

const sectorColor: Record<SectorState, string> = {
  purple: '#B15CFF',
  green: '#00D68F',
  yellow: '#FFC531',
  idle: 'rgba(255,255,255,0.12)'
};

const compoundColor: Record<string, string> = {
  SOFT: '#E10600',
  MEDIUM: '#FFC531',
  HARD: '#F3F7FB',
  INTER: '#00D68F',
  WET: '#3D8BFF'
};

export function TimingTower() {
  const [mode, setMode] = useState<'gap' | 'interval'>('interval');
  const session = useSessionStore();
  
  // Create a minimal driver entry for ourselves based on real telemetry
  const me: DriverEntry = {
    pos: session.position,
    code: 'RUS',
    name: 'George Russell',
    number: 63,
    team: 'Mercedes',
    teamColor: '#00E5FF',
    gap: null,
    interval: session.deltaMs,
    lastLap: session.lastLapMs / 1000,
    bestLap: session.bestLapMs / 1000,
    compound: session.tyres.compound.toUpperCase() as 'SOFT'|'MEDIUM'|'HARD'|'INTER'|'WET',
    tyreAge: session.tyres.ageLaps,
    stops: 1,
    sectors: ['green', 'purple', 'green'],
    drs: session.driverInputs.drsActive,
    pit: false,
    trend: 'hold'
  };

  const currentDrivers = [me];

  return (
    <Panel
      title="Live Timing Tower"
      subtitle={`Lap ${session.currentLap} · 20 classified`}
      accent="#E10600"
      className="flex h-full flex-col"
      bodyClassName="flex-1 min-h-0"
      actions={
      <div className="flex overflow-hidden rounded-md border border-white/[0.08]">
          {(['interval', 'gap'] as const).map((m) =>
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          className={`px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
          mode === m ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
          }>
          
              {m}
            </button>
        )}
        </div>
      }>
      
      <div className="grid grid-cols-[22px_1fr_58px_46px_40px] gap-2 border-b border-white/[0.05] px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/45">
        <span>P</span>
        <span>Driver</span>
        <span className="text-right">Last</span>
        <span className="text-right">{mode}</span>
        <span className="text-right">Tyre</span>
      </div>

      <ul className="h-[calc(100%-26px)] overflow-y-auto scrollbar-thin">
        {currentDrivers.map((d, i) =>
        <TimingRow key={d.code} driver={d} mode={mode} index={i} />
        )}
      </ul>
    </Panel>);

}

function TimingRow({ driver, mode, index }: {driver: DriverEntry;mode: 'gap' | 'interval';index: number;}) {
  const isFocus = driver.code === 'RUS';
  const TrendIcon = driver.trend === 'up' ? ChevronUp : driver.trend === 'down' ? ChevronDown : Minus;
  const trendColor = driver.trend === 'up' ? '#00D68F' : driver.trend === 'down' ? '#E10600' : '#8E99A8';
  const value = mode === 'gap' ? driver.gap : driver.interval;

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.022, duration: 0.32 }}
      className={`relative grid grid-cols-[22px_1fr_58px_46px_40px] items-center gap-2 border-b border-white/[0.035] px-3 py-1 transition-colors ${
      isFocus ? 'bg-f1-cyan/[0.04]' : 'hover:bg-white/[0.03]'}`
      }>
      
      {isFocus && <span className="absolute inset-y-0 left-0 w-[1.5px] bg-f1-cyan shadow-[0_0_4px_rgba(0,229,255,0.4)]" />}
      <span className="font-mono text-[11px] font-semibold text-f1-white tabular">{driver.pos}</span>

      <div className="flex min-w-0 items-center gap-2">
        <span className="h-3.5 w-[3px] shrink-0 rounded-full" style={{ background: driver.teamColor }} />
        <span className="font-mono text-[11.5px] font-semibold tracking-wide text-f1-white">{driver.code}</span>
        <div className="flex gap-[3px]">
          {driver.sectors.map((s, si) =>
          <span key={si} className="h-[3px] w-[9px] rounded-sm" style={{ background: sectorColor[s] }} />
          )}
        </div>
        {driver.drs && <PanelChip color="#00D68F" active>DRS</PanelChip>}
        {driver.pit && <PanelChip color="#3D8BFF" active>PIT</PanelChip>}
        <TrendIcon className="ml-auto h-3 w-3 shrink-0" style={{ color: trendColor }} />
      </div>

      <span className="text-right font-mono text-[10.5px] text-silver-light tabular">
        {formatLapTime(driver.lastLap)}
      </span>
      <span
        className="text-right font-mono text-[10.5px] tabular"
        style={{ color: value === null ? '#B15CFF' : '#8E99A8' }}>
        
        {value === null ? 'LEADER' : `+${value.toFixed(3)}`}
      </span>
      <span className="flex items-center justify-end gap-1">
        <span
          className="grid h-4 w-4 place-items-center rounded-full border font-mono text-[7.5px] font-bold"
          style={{ borderColor: compoundColor[driver.compound], color: compoundColor[driver.compound] }}>
          
          {driver.compound[0]}
        </span>
        <span className="font-mono text-[9.5px] text-silver/60 tabular">{driver.tyreAge}</span>
      </span>
    </motion.li>);

}