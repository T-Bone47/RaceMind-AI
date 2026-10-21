import React from 'react';
import { focusDriver, tyres } from '../../data/race';
import { Panel } from '../ui/Panel';
import { Trace } from '../ui/Trace';
import { StatusBadge } from '../ui/Badge';
import { TyreCompound } from '../ui/TyreCompound';
import { thermalBand, wearBand } from '../ui/tokens';
import { wave } from '../../utils/series';

const degradation = wave(60, 4, 1).map((v, i) => 100 - i * 1.05 + v * 3);

export function TyreThermal() {
  const worst = tyres.reduce((a, t) => t.wear > a.wear ? t : a, tyres[0]);
  const worstBand = wearBand(worst.wear);

  return (
    <Panel
      title="Tyre Thermal & Degradation"
      subtitle={`${focusDriver.compound} · ${focusDriver.tyreAge} laps · cliff projected L49`}
      accent="#FFC531"
      className="h-full"
      bodyClassName="p-4"
      actions={<StatusBadge color={worstBand.color}>{worstBand.label} {worst.label}</StatusBadge>}>
      
      <div className="mb-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5">
        <TyreCompound
          compound={focusDriver.compound}
          life={100 - focusDriver.tyreAge * 2.4}
          age={focusDriver.tyreAge}
          size={40} />
        
        <div className="text-right">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/50">Degradation</p>
          <p className="mt-1 font-mono text-[17px] font-semibold leading-none text-f1-amber tabular">0.090</p>
          <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/50">sec per lap</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {tyres.map((t) => {
          const thermal = thermalBand(t.surface);
          const wear = wearBand(t.wear);
          return (
            <div
              key={t.label}
              className="group relative overflow-hidden rounded-lg border border-white/[0.06] bg-black/25 p-2.5 transition-colors hover:border-white/[0.14]">
              
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-silver-light">
                  {t.label}
                </span>
                <span className="font-mono text-[9px] text-silver/50 tabular">{t.pressure} psi</span>
              </div>

              <div className="mt-2 flex items-center gap-2.5">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center" title={`Surface ${t.surface}°C — ${thermal.label}`}>
                  <span className="absolute inset-0 rounded-full opacity-20 blur-[6px]" style={{ background: thermal.color }} />
                  <span className="absolute inset-0 rounded-full border-[3px]" style={{ borderColor: `${thermal.color}bb` }} />
                  <span className="absolute inset-[7px] rounded-full border border-white/10 brushed" />
                  <span className="relative font-mono text-[10.5px] font-bold tabular" style={{ color: thermal.color }}>
                    {t.surface}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <Row label="Carcass" value={`${t.carcass}°`} pct={t.carcass / 130 * 100} color="#3D8BFF" />
                  <Row label="Wear" value={`${t.wear}%`} pct={t.wear} color={wear.color} />
                </div>
              </div>

              <p className="mt-2 border-t border-white/[0.05] pt-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/55">
                <span style={{ color: thermal.color }}>{thermal.label}</span> · wear {wear.label.toLowerCase()}
              </p>
            </div>);

        })}
      </div>

      <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/25 p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">Remaining life</span>
          <span className="font-mono text-[11px] font-semibold text-f1-amber tabular">38%</span>
        </div>
        <div className="mt-1.5 -mx-1">
          <Trace values={degradation} color="#FFC531" height={44} width={320} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[8.5px] text-silver/45">
          <span>L18</span>
          <span className="text-f1-red">CLIFF L49</span>
          <span>L60</span>
        </div>
      </div>
    </Panel>);

}

function Row({ label, value, pct, color }: {label: string;value: string;pct: number;color: string;}) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[8.5px] text-silver/50">
        <span className="uppercase tracking-[0.12em]">{label}</span>
        <span className="tabular" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="mt-0.5 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${Math.min(100, pct)}%`, background: color }} />
        
      </div>
    </div>);

}