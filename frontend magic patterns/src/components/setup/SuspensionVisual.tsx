import React from 'react';
import { motion } from 'framer-motion';
import type { SetupValues } from '../../data/setups';

/** Live side/top view of the car platform reacting to ride height, rake, camber and roll bars. */
export function SuspensionVisual({ values }: {values: SetupValues;}) {
  const frontY = 74 - (50 - values.frontRideHeight) * 0.35;
  const rearY = 74 - (50 - values.rearRideHeight) * 0.35;
  const rake = values.rearRideHeight - values.frontRideHeight;
  const frontStiff = (values.frontSuspension - 1) / 40;
  const rearStiff = (values.rearSuspension - 1) / 40;

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/30">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
        <svg viewBox="0 0 320 110" className="relative w-full" style={{ height: 128 }} role="img" aria-label="Suspension platform visualisation">
          {/* road */}
          <line x1="10" x2="310" y1="92" y2="92" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          {Array.from({ length: 24 }, (_, i) =>
          <line key={i} x1={12 + i * 12.6} x2={18 + i * 12.6} y1="96" y2="96" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
          )}

          {/* chassis */}
          <motion.g animate={{ y: 0 }}>
            <motion.path
              d={`M60 ${frontY} L118 ${frontY - 8} L206 ${(frontY + rearY) / 2 - 10} L250 ${rearY - 6} L262 ${rearY} L58 ${frontY + 4} Z`}
              fill="rgba(255,255,255,0.05)"
              stroke="#00E5FF"
              strokeWidth="1.4"
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.28))' }} />
            
            {/* front wing */}
            <path d={`M28 ${frontY + 12} L62 ${frontY + 10} L62 ${frontY + 14} L28 ${frontY + 16} Z`} fill="#00E5FF" opacity="0.55" />
            {/* rear wing */}
            <path d={`M256 ${rearY - 26} L292 ${rearY - 28} L292 ${rearY - 22} L256 ${rearY - 20} Z`} fill="#00E5FF" opacity="0.55" />
            <line x1="270" y1={rearY - 24} x2="268" y2={rearY} stroke="#00E5FF" strokeWidth="1.4" opacity="0.5" />
          </motion.g>

          {/* springs */}
          <Spring x={92} top={frontY + 4} bottom={86} stiffness={frontStiff} color="#FFC531" />
          <Spring x={236} top={rearY + 2} bottom={86} stiffness={rearStiff} color="#FF7A29" />

          {/* wheels */}
          <g>
            <ellipse cx="92" cy="86" rx="20" ry="7" fill="rgba(0,0,0,0.5)" />
            <motion.rect
              x="74"
              y={68}
              width="36"
              height="24"
              rx="6"
              fill="#141820"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.2"
              animate={{ rotate: values.frontCamber * 2.2 }}
              style={{ transformOrigin: '92px 92px' }} />
            
            <ellipse cx="236" cy="86" rx="22" ry="7" fill="rgba(0,0,0,0.5)" />
            <motion.rect
              x="216"
              y={66}
              width="40"
              height="26"
              rx="6"
              fill="#141820"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.2"
              animate={{ rotate: values.rearCamber * 2.2 }}
              style={{ transformOrigin: '236px 92px' }} />
            
          </g>

          {/* ride height callouts */}
          <g className="font-mono">
            <line x1="60" x2="60" y1={frontY + 6} y2="92" stroke="#00E5FF" strokeWidth="1" strokeDasharray="2 3" />
            <text x="34" y={frontY + 2} fontSize="8.5" fill="#00E5FF">
              F {values.frontRideHeight}mm
            </text>
            <line x1="264" x2="264" y1={rearY + 2} y2="92" stroke="#B15CFF" strokeWidth="1" strokeDasharray="2 3" />
            <text x="270" y={rearY - 2} fontSize="8.5" fill="#B15CFF">
              R {values.rearRideHeight}mm
            </text>
            <text x="150" y="16" fontSize="8.5" fill="#8E99A8" textAnchor="middle" letterSpacing="1.2">
              RAKE {rake > 0 ? '+' : ''}
              {rake} MM
            </text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-px border-t border-white/[0.06] bg-white/[0.05]">
        <Cell label="Front ARB" value={`${values.frontARB}`} color="#FFC531" />
        <Cell label="Rear ARB" value={`${values.rearARB}`} color="#FF7A29" />
        <Cell label="F camber" value={`${values.frontCamber.toFixed(1)}°`} color="#00E5FF" />
        <Cell label="R camber" value={`${values.rearCamber.toFixed(1)}°`} color="#B15CFF" />
      </div>
    </div>);

}

function Spring({
  x,
  top,
  bottom,
  stiffness,
  color






}: {x: number;top: number;bottom: number;stiffness: number;color: string;}) {
  const coils = Math.round(4 + stiffness * 6);
  const height = bottom - top;
  const step = height / coils;
  const width = 9 - stiffness * 3;
  let d = `M${x} ${top}`;
  for (let i = 0; i < coils; i++) {
    d += ` L${x + (i % 2 === 0 ? width : -width)} ${top + step * (i + 0.5)}`;
  }
  d += ` L${x} ${bottom}`;
  return <path d={d} fill="none" stroke={color} strokeWidth="1.4" opacity="0.85" />;
}

function Cell({ label, value, color }: {label: string;value: string;color: string;}) {
  return (
    <div className="bg-carbon-700/85 px-2.5 py-1.5">
      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-silver/45">{label}</p>
      <p className="mt-0.5 font-mono text-[12px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
    </div>);

}