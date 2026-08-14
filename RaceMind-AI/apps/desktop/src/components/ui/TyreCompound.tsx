// @ts-nocheck
import React from 'react';
import { compoundOf, wearBand } from './tokens';

interface Props {
  compound: string;
  /** 0-100 remaining life. Omit to render a plain compound marker. */
  life?: number;
  age?: number;
  size?: number;
  showLabel?: boolean;
  corner?: string;
}

/**
 * Professional tyre marker: an F1-style compound band ring with an optional
 * remaining-life arc. Compound name is always rendered as text alongside the colour.
 */
export function TyreCompound({ compound, life, age, size = 44, showLabel = true, corner }: Props) {
  const c = compoundOf(compound);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = life === undefined ? 1 : Math.max(0, Math.min(1, life / 100));
  const band = life === undefined ? null : wearBand(100 - life);

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${circ * pct} ${circ}`}
            style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.22,1,0.36,1)' }} />
          
        </svg>
        <span
          className="absolute inset-[7px] rounded-full border border-white/[0.08] brushed"
          style={{ background: 'rgba(0,0,0,0.55)' }} />
        
        <span
          className="absolute inset-0 grid place-items-center font-mono font-bold leading-none"
          style={{ color: c.color, fontSize: size * 0.34 }}>
          
          {c.short}
        </span>
      </div>

      {showLabel &&
      <div className="min-w-0 leading-none">
          {corner &&
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-silver/45">{corner}</p>
        }
          <p className="mt-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: c.color }}>
            {c.name}
          </p>
          {life !== undefined && band &&
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-silver/60">
              {Math.round(life)}% left · {band.label}
              {age !== undefined && ` · ${age} laps`}
            </p>
        }
          {life === undefined && age !== undefined &&
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-silver/60">{age} laps</p>
        }
        </div>
      }
    </div>);

}