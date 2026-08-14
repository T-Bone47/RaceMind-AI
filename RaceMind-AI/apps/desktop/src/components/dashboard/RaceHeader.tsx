import { useRaceData } from '../../hooks/useRaceData';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, BatteryCharging, Flag, Fuel, Trophy, Wind } from 'lucide-react';
import { formatLapTime } from '../../utils/format';
import { deltaTrace } from '../../utils/series';
import { Trace } from '../ui/Trace';
import { StatusBadge } from '../ui/Badge';
import { TyreCompound } from '../ui/TyreCompound';
import { useLiveTick } from '../../hooks/useLiveTick';

const delta = deltaTrace(90, 11);

export function RaceHeader() {
  const { focusDriver, session } = useRaceData();

  const tick = useLiveTick(1400);
  const jitter = (tick % 7 - 3) * 0.004;
  const progress = session.lap / session.totalLaps * 100;
  const liveDelta = delta[delta.length - 1];
  const tyreLife = 100 - focusDriver.tyreAge * 2.4;

  return (
    <section
      aria-label="Race situation"
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      
      <div className="pointer-events-none absolute inset-0 carbon-weave opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
        style={{ background: focusDriver.teamColor, boxShadow: `0 0 22px ${focusDriver.teamColor}` }}
        aria-hidden="true" />
      

      {/* PRIMARY BAND — position, lap time, gaps. Readable in under two seconds. */}
      <div className="relative flex flex-col gap-4 p-4 xl:flex-row xl:items-stretch xl:gap-5 xl:p-5">
        <div className="flex items-center gap-4 xl:gap-5">
          <div className="grid h-[104px] w-[92px] shrink-0 place-items-center rounded-lg border border-white/[0.1] bg-black/45">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">Position</span>
            <motion.span
              key={focusDriver.position}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[54px] font-bold leading-none text-f1-white"
              style={{ textShadow: `0 0 30px ${focusDriver.teamColor}77` }}>
              
              P{focusDriver.position}
            </motion.span>
            <span className="mt-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-f1-green">
              <ArrowUp className="h-2.5 w-2.5" /> Up 1 from grid
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em]"
                style={{ background: `${focusDriver.teamColor}1f`, color: focusDriver.teamColor }}>
                
                #{focusDriver.number}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/60">
                {focusDriver.team}
              </span>
              <StatusBadge tone="optimal" pulse>
                On track
              </StatusBadge>
            </div>

            <h1 className="mt-1.5 text-[24px] font-semibold leading-none tracking-tight text-f1-white">
              {focusDriver.name}
            </h1>

            <div className="mt-3 flex items-end gap-5">
              <div>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/55">Last lap</p>
                <p className="mt-1 font-mono text-[30px] font-semibold leading-none tabular text-f1-white">
                  {formatLapTime(focusDriver.lastLap)}
                </p>
              </div>
              <div className="pb-1">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/55">Personal best</p>
                <p className="mt-1 font-mono text-[15px] font-semibold leading-none tabular text-f1-purple">
                  {formatLapTime(focusDriver.bestLap)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.05] sm:grid-cols-4">
          <Cell
            label="Gap ahead"
            value={`−${(focusDriver.gapAhead + jitter).toFixed(3)}`}
            sub="LEC · DRS armed"
            tone="#00E5FF"
            icon={ArrowUp} />
          
          <Cell
            label="Gap behind"
            value={`+${(focusDriver.gapBehind - jitter).toFixed(3)}`}
            sub="NOR · closing"
            tone="#FF7A29"
            icon={ArrowDown} />
          
          <Cell
            label="Live delta"
            value={`${liveDelta >= 0 ? '+' : '−'}${Math.abs(liveDelta).toFixed(3)}`}
            sub="Vs reference lap"
            tone={liveDelta <= 0 ? '#00D68F' : '#FF7A29'}>
            
            <Trace values={delta} color={liveDelta <= 0 ? '#00D68F' : '#FF7A29'} height={26} width={140} fill={false} strokeWidth={1.2} baseline={0} />
          </Cell>
          <Cell
            label="Championship"
            value={`P${focusDriver.championshipPos}`}
            sub={`${focusDriver.championshipPts} points`}
            tone="#FFC531"
            icon={Trophy} />
          
        </div>
      </div>

      {/* SECONDARY BAND — car state. Quieter than the primary band by design. */}
      <div className="relative grid grid-cols-2 gap-px border-t border-white/[0.06] bg-white/[0.04] md:grid-cols-4">
        <div className="flex items-center gap-3 bg-carbon-700/85 px-4 py-2.5">
          <TyreCompound compound={focusDriver.compound} life={tyreLife} age={focusDriver.tyreAge} size={38} />
        </div>

        <State
          icon={Fuel}
          label="Fuel"
          value={`${focusDriver.fuelRemaining} kg`}
          detail={`${focusDriver.fuelDelta > 0 ? '+' : ''}${focusDriver.fuelDelta} laps to target`}
          tone={focusDriver.fuelDelta < 0 ? '#FFC531' : '#00D68F'}
          state={focusDriver.fuelDelta < 0 ? 'Lean target' : 'On target'} />
        
        <State
          icon={BatteryCharging}
          label="ERS charge"
          value={`${focusDriver.ersCharge}%`}
          detail={`${focusDriver.ersDeployed} MJ deployed · ${focusDriver.engineMode}`}
          tone="#00E5FF"
          state="Deploying" />
        
        <State
          icon={Wind}
          label="DRS"
          value="Available"
          detail="Zone 1 · within 1.0s"
          tone="#00D68F"
          state="Armed" />
        
      </div>

      {/* RACE PROGRESS */}
      <div className="relative border-t border-white/[0.06] px-4 py-3 xl:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-silver/60">
            <Flag className="h-3 w-3" /> Race progress
          </span>
          <span className="font-mono text-[10px] text-silver">
            LAP <span className="text-[13px] font-semibold text-f1-white">{session.lap}</span> / {session.totalLaps} ·{' '}
            <span className="text-f1-cyan">{session.totalLaps - session.lap} remaining</span>
          </span>
        </div>
        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-f1-red"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
          
          <span
            className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_#fff]"
            style={{ left: `${progress}%` }} />
          
          <span
            className="absolute top-1/2 h-2 w-[2px] -translate-y-1/2 rounded-full bg-f1-cyan/70"
            style={{ left: `${45 / session.totalLaps * 100}%` }}
            title="Pit window opens lap 45" />
          
        </div>
      </div>
    </section>);

}

function Cell({
  label,
  value,
  sub,
  tone,
  icon: Icon,
  children







}: {label: string;value: string;sub: string;tone: string;icon?: React.ComponentType<{className?: string;}>;children?: React.ReactNode;}) {
  return (
    <div className="flex flex-col justify-center bg-carbon-700/80 px-4 py-3 transition-colors hover:bg-carbon-600/80">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-2.5 w-2.5 text-silver/50" />}
        <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-silver/55">{label}</span>
      </div>
      <p className="mt-1.5 font-mono text-[24px] font-semibold leading-none tabular" style={{ color: tone }}>
        {value}
      </p>
      {children ?
      <div className="mt-1.5 -mb-1 opacity-80">{children}</div> :

      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/50">{sub}</p>
      }
    </div>);

}

function State({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  state







}: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;value: string;detail: string;tone: string;state: string;}) {
  return (
    <div className="flex items-center gap-2.5 bg-carbon-700/85 px-4 py-2.5">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border"
        style={{ borderColor: `${tone}33`, background: `${tone}12`, color: tone }}>
        
        <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-silver/45">{label}</p>
        <p className="mt-0.5 font-mono text-[15px] font-semibold leading-none tabular" style={{ color: tone }}>
          {value}
        </p>
        <p className="mt-1 truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/50">
          {state} · {detail}
        </p>
      </div>
    </div>);

}