import React from 'react';
import { motion } from 'framer-motion';

export function SettingRow({
  label,
  hint,
  children




}: {label: string;hint?: string;children: React.ReactNode;}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3 last:border-b-0">
      <div className="min-w-0 max-w-[420px]">
        <p className="text-[12.5px] font-medium text-f1-white">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] leading-relaxed text-silver/60">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>);

}

export function Toggle({
  checked,
  onChange,
  label




}: {checked: boolean;onChange: (v: boolean) => void;label: string;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-[22px] w-[40px] rounded-full border transition-colors"
      style={{
        background: checked ? 'rgba(0,229,255,0.22)' : 'rgba(255,255,255,0.06)',
        borderColor: checked ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.1)'
      }}>
      
      <motion.span
        className="absolute top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full"
        animate={{ left: checked ? 21 : 3 }}
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        style={{
          background: checked ? '#00E5FF' : '#8E99A8',
          boxShadow: checked ? '0 0 10px #00E5FF' : 'none'
        }} />
      
    </button>);

}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label





}: {value: T;options: {value: T;label: string;}[];onChange: (v: T) => void;label: string;}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex overflow-hidden rounded-lg border border-white/[0.08] bg-black/30">
      
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors ${
            on ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
            }>
            
            {o.label}
          </button>);

      })}
    </div>);

}

export function SliderControl({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  suffix = '',
  color = '#00E5FF'









}: {value: number;min?: number;max?: number;step?: number;onChange: (v: number) => void;label: string;suffix?: string;color?: string;}) {
  return (
    <div className="flex w-[220px] items-center gap-2.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/[0.09]"
        style={{ accentColor: color }} />
      
      <span className="w-11 shrink-0 text-right font-mono text-[11px] tabular" style={{ color }}>
        {value}
        {suffix}
      </span>
    </div>);

}

export function TextField({
  value,
  onChange,
  label




}: {value: string;onChange: (v: string) => void;label: string;}) {
  return (
    <input
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className="w-[240px] rounded-lg border border-white/[0.08] bg-black/35 px-3 py-1.5 text-[12px] text-f1-white transition-colors placeholder:text-silver/40 focus:border-f1-cyan/50 focus:outline-none" />);


}

export function SwatchPicker({
  value,
  options,
  onChange




}: {value: string;options: {value: string;label: string;}[];onChange: (v: string) => void;}) {
  return (
    <div className="flex items-center gap-1.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-label={o.label}
            title={o.label}
            onClick={() => onChange(o.value)}
            className="grid h-6 w-6 place-items-center rounded-lg border transition-transform hover:scale-110"
            style={{
              borderColor: on ? o.value : 'rgba(255,255,255,0.1)',
              background: `${o.value}22`
            }}>
            
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.value }} />
          </button>);

      })}
    </div>);

}