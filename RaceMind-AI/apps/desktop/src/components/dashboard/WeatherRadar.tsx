import { useRaceData } from '../../hooks/useRaceData';
import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Navigation } from 'lucide-react';
import { Panel } from '../ui/Panel';

const forecast = [
{ t: '+10m', rain: 12, temp: 47.2 },
{ t: '+20m', rain: 21, temp: 46.8 },
{ t: '+30m', rain: 34, temp: 45.9 },
{ t: '+40m', rain: 58, temp: 44.1 },
{ t: '+50m', rain: 71, temp: 42.6 }];


export function WeatherRadar() {
  const { session } = useRaceData();

  return (
    <Panel
      title="Weather & Track"
      subtitle="Doppler · 6 km radius"
      accent="#3D8BFF"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-f1-blue">
          <Droplets className="h-3 w-3" /> {session.rainProbability}% / 30m
        </span>
      }>
      
      <div className="flex items-center gap-4">
        <div className="relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-black/40">
          {[0.33, 0.66, 1].map((r) =>
          <span
            key={r}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]"
            style={{ width: `${r * 100}%`, height: `${r * 100}%` }} />

          )}
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.06]" />
          <span className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-white/[0.06]" />

          <span
            className="absolute left-[58%] top-[26%] h-8 w-10 rounded-full opacity-70 blur-[6px]"
            style={{ background: '#3D8BFF' }} />
          
          <span
            className="absolute left-[70%] top-[54%] h-6 w-7 rounded-full opacity-50 blur-[6px]"
            style={{ background: '#00D68F' }} />
          

          <motion.span
            className="absolute inset-0 origin-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'conic-gradient(from 0deg, rgba(0,229,255,0.28), rgba(0,229,255,0) 55%)'
            }} />
          
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-f1-cyan shadow-[0_0_10px_#00E5FF]" />
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <Reading label="Air" value={`${session.airTemp}°C`} color="#F3F7FB" />
          <Reading label="Track" value={`${session.trackTemp}°C`} color="#FF7A29" />
          <Reading label="Humidity" value={`${session.humidity}%`} color="#3D8BFF" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">Wind</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-f1-white tabular">
              <Navigation
                className="h-3 w-3 text-f1-cyan"
                style={{ transform: `rotate(${session.windDir}deg)` }} />
              
              {session.windSpeed} kph · {session.windDir}°
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
          <span>Rain probability</span>
          <span className="text-f1-amber">Peak 71% @ +50m</span>
        </div>
        <div className="flex items-end gap-1.5">
          {forecast.map((f) =>
          <div key={f.t} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[9px] text-silver/60 tabular">{f.rain}%</span>
              <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, f.rain * 0.62)}px` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-t-sm"
              style={{
                background: f.rain > 50 ? '#3D8BFF' : f.rain > 25 ? '#00E5FF' : 'rgba(255,255,255,0.14)',
                boxShadow: f.rain > 50 ? '0 0 12px #3D8BFF66' : undefined
              }} />
            
              <span className="font-mono text-[8px] text-silver/40">{f.t}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">Track evolution</span>
        <span className="font-mono text-[11px] font-semibold text-f1-green tabular">
          +{session.trackEvolution.toFixed(2)}s · grip {session.gripIndex}
        </span>
      </div>
    </Panel>);

}

function Reading({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/55">{label}</span>
      <span className="font-mono text-[11px] tabular" style={{ color }}>
        {value}
      </span>
    </div>);

}