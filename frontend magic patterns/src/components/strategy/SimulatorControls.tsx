import React from 'react';
import { CloudRain, Flag, Gauge, Timer } from 'lucide-react';
import { compoundSpec, type Compound, type Neutralisation, type SimInputs } from '../../data/strategy';
import { Panel } from '../ui/Panel';

interface Props {
  inputs: SimInputs;
  onChange: (patch: Partial<SimInputs>) => void;
  tyreMargin: number;
}

const neutralisations: {id: Neutralisation;label: string;color: string;}[] = [
{ id: 'none', label: 'Green', color: '#00D68F' },
{ id: 'vsc', label: 'VSC', color: '#FFC531' },
{ id: 'sc', label: 'Safety car', color: '#FF7A29' }];


export function SimulatorControls({ inputs, onChange, tyreMargin }: Props) {
  return (
    <Panel
      title="Scenario Simulator"
      subtitle="12,000 Monte Carlo runs per change"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="p-4 space-y-4"
      actions={
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-cyan">
          <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-cyan" /> Recomputing
        </span>
      }>
      
      <div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
            <Timer className="h-3 w-3" /> Pit lap
          </span>
          <span className="font-mono text-[15px] font-semibold text-f1-white tabular">L{inputs.pitLap}</span>
        </div>
        <input
          type="range"
          min={44}
          max={62}
          value={inputs.pitLap}
          onChange={(e) => onChange({ pitLap: Number(e.target.value) })}
          aria-label="Pit lap"
          className="mt-2.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/[0.09] accent-[#00E5FF]" />
        
        <div className="mt-1.5 flex justify-between font-mono text-[8.5px] text-silver/40">
          <span>L44 early</span>
          <span className="text-f1-cyan">L45 optimum</span>
          <span>L62 late</span>
        </div>
      </div>

      <div>
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <Gauge className="h-3 w-3" /> Compound to the flag
        </span>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {(Object.keys(compoundSpec) as Compound[]).map((c) => {
            const on = inputs.compound === c;
            const spec = compoundSpec[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ compound: c })}
                className="rounded-lg border px-2 py-2 text-left transition-colors"
                style={{
                  borderColor: on ? `${spec.color}66` : 'rgba(255,255,255,0.07)',
                  background: on ? `${spec.color}14` : 'rgba(0,0,0,0.25)'
                }}>
                
                <span
                  className="font-mono text-[10px] font-bold tracking-[0.1em]"
                  style={{ color: on ? spec.color : '#8E99A8' }}>
                  
                  {c}
                </span>
                <p className="mt-1 font-mono text-[8.5px] text-silver/50">{spec.life} lap life</p>
                <p className="font-mono text-[8.5px] text-silver/50">
                  {spec.pace > 0 ? '+' : ''}
                  {spec.pace.toFixed(2)} s/lap
                </p>
              </button>);

          })}
        </div>
        <p
          className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em]"
          style={{ color: tyreMargin < 0 ? '#E10600' : '#00D68F' }}>
          
          Tyre margin {tyreMargin >= 0 ? '+' : ''}
          {tyreMargin} laps
        </p>
      </div>

      <div>
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <Flag className="h-3 w-3" /> Neutralisation assumption
        </span>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {neutralisations.map((n) => {
            const on = inputs.neutralisation === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onChange({ neutralisation: n.id })}
                className="rounded-lg border py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors"
                style={{
                  borderColor: on ? `${n.color}66` : 'rgba(255,255,255,0.07)',
                  background: on ? `${n.color}14` : 'rgba(0,0,0,0.25)',
                  color: on ? n.color : '#8E99A8'
                }}>
                
                {n.label}
              </button>);

          })}
        </div>
      </div>

      <Slider
        label="Rain intensity"
        icon={CloudRain}
        value={inputs.rain}
        onChange={(v) => onChange({ rain: v })}
        color="#3D8BFF"
        suffix="%" />
      
      <Slider
        label="Driver aggression"
        icon={Gauge}
        value={inputs.aggression}
        onChange={(v) => onChange({ aggression: v })}
        color="#FF7A29"
        suffix="%" />
      
    </Panel>);

}

function Slider({
  label,
  value,
  onChange,
  color,
  suffix,
  icon: Icon







}: {label: string;value: number;onChange: (v: number) => void;color: string;suffix: string;icon: React.ComponentType<{className?: string;}>;}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <Icon className="h-3 w-3" /> {label}
        </span>
        <span className="font-mono text-[11px] tabular" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/[0.09]"
        style={{ accentColor: color }} />
      
    </div>);

}