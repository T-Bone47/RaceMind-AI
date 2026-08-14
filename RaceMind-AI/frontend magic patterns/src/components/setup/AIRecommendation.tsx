import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2 } from 'lucide-react';
import type { Circuit, SessionKind, WeatherKind } from '../../data/setups';
import { balanceLabel, type SetupScore } from '../../utils/setupScore';
import { formatLapTime } from '../../utils/format';
import { Panel } from '../ui/Panel';
import { RingGauge } from '../ui/RingGauge';

interface Props {
  score: SetupScore;
  circuit: Circuit;
  session: SessionKind;
  weather: WeatherKind;
  onApply: () => void;
}

export function AIRecommendation({ score, circuit, session, weather, onApply }: Props) {
  const balance = balanceLabel(score.balance);

  const explanation = `Based on ${circuit.name} ${session.toLowerCase()} conditions in ${weather.toLowerCase()} weather, this configuration ${
  score.traction > 66 ? 'improves traction out of the slow-corner exits' : 'prioritises entry stability over exit traction'} while ${

  score.tyreDeg > 62 ? 'keeping rear degradation inside the target window over a long stint' : 'accepting higher tyre wear for single-lap performance'}. ${
  circuit.note}`;

  return (
    <Panel
      title="AI Recommendation"
      subtitle="RaceMind setup engine v7.2"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-4 space-y-3.5"
      actions={
      <span className="flex items-center gap-1.5 rounded-md border border-f1-cyan/30 bg-f1-cyan/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-cyan">
          <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-cyan" /> Live
        </span>
      }>
      
      <div className="flex items-center gap-4">
        <RingGauge
          value={score.overall}
          label="Overall"
          color={score.overall > 78 ? '#00D68F' : score.overall > 60 ? '#00E5FF' : '#FFC531'}
          size={94} />
        
        <div className="min-w-0 flex-1 space-y-2">
          <Line label="Track confidence" value={`${score.confidence}%`} color="#00E5FF" bar={score.confidence} />
          <Line label="Driver confidence" value={`${score.driverConfidence}%`} color="#00D68F" bar={score.driverConfidence} />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">Expected lap</span>
            <span className="font-mono text-[15px] font-semibold tabular text-f1-white">
              {formatLapTime(score.lapTime)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.05]">
        <Metric label="Top speed" value={`${Math.round(280 + score.topSpeed * 0.6)} kph`} color="#3D8BFF" />
        <Metric label="Cornering" value={`${score.cornering}`} color="#00E5FF" />
        <Metric label="Traction" value={`${score.traction}`} color="#00D68F" />
        <Metric label="Stability" value={`${score.highSpeedStability}`} color="#B15CFF" />
        <Metric label="Tyre wear" value={`${100 - score.tyreDeg}% / stint`} color="#FF7A29" />
        <Metric label="Fuel use" value={`${(2.4 - score.fuelUse / 180).toFixed(2)} kg/lap`} color="#FFC531" />
      </div>

      <div className="rounded-lg border border-white/[0.07] bg-black/30 p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
            Oversteer / understeer balance
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: balance.color }}>
            {balance.text}
          </span>
        </div>
        <div className="relative mt-2.5 h-[6px] rounded-full bg-white/[0.07]">
          <span className="absolute inset-y-0 left-1/2 w-px bg-white/25" />
          <motion.span
            className="absolute top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-full"
            animate={{ left: `${score.balance}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{ background: balance.color, boxShadow: `0 0 10px ${balance.color}` }} />
          
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[8.5px] uppercase tracking-[0.1em] text-silver/40">
          <span>Understeer</span>
          <span>Neutral</span>
          <span>Oversteer</span>
        </div>
      </div>

      <div className="rounded-lg border border-f1-cyan/25 bg-f1-cyan/[0.06] p-3">
        <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-f1-cyan">
          <Sparkles className="h-3 w-3" /> Engineer explanation
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-silver-light">{explanation}</p>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-f1-cyan py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-carbon-900 transition-transform hover:scale-[1.02] active:scale-95">
        
        <Wand2 className="h-3.5 w-3.5" /> Apply recommended setup
      </button>
    </Panel>);

}

function Line({ label, value, color, bar }: {label: string;value: string;color: string;bar: number;}) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[9px]">
        <span className="uppercase tracking-[0.14em] text-silver/55">{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${bar}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          style={{ background: color }} />
        
      </div>
    </div>);

}

function Metric({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="bg-carbon-700/85 px-2.5 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-silver/50">{label}</p>
      <p className="mt-1 font-mono text-[13px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}