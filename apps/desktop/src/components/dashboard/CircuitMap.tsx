import { useState } from 'react';
import { Maximize2, MapPin } from 'lucide-react';
import { Panel, PanelChip } from '../ui/Panel';

const TRACK =
'M120 300 C 90 240, 110 170, 170 140 C 220 115, 280 130, 320 165 C 350 192, 372 210, 410 205 C 455 199, 470 160, 512 150 C 560 139, 610 160, 640 195 C 672 233, 690 262, 730 268 C 780 276, 820 250, 852 214 C 880 182, 900 150, 880 118 C 862 90, 820 92, 800 118 C 782 142, 800 176, 836 186 C 880 198, 920 230, 918 280 C 916 330, 872 356, 820 352 C 760 347, 720 320, 660 322 C 590 324, 545 360, 480 372 C 400 387, 330 372, 250 366 C 180 361, 140 348, 120 300 Z';

const corners = [
{ id: 'T1', x: 168, y: 141, apex: 92 },
{ id: 'T4', x: 411, y: 205, apex: 128 },
{ id: 'T7', x: 641, y: 196, apex: 74 },
{ id: 'T10', x: 866, y: 112, apex: 61 },
{ id: 'T13', x: 916, y: 284, apex: 145 },
{ id: 'T16', x: 480, y: 372, apex: 108 }];


const cars = [
{ code: 'VER', color: '#3D8BFF', offset: '0s', dur: '9s' },
{ code: 'LEC', color: '#E10600', offset: '-0.5s', dur: '9s' },
{ code: 'RUS', color: '#00E5FF', offset: '-0.85s', dur: '9s' },
{ code: 'NOR', color: '#FF7A29', offset: '-1.25s', dur: '9s' }];


export function CircuitMap() {
  const [layer, setLayer] = useState<'positions' | 'grip' | 'speed'>('positions');

  return (
    <Panel
      title="Circuit Map"
      subtitle="Monte Carlo · 3.337 km · 19 turns"
      accent="#00E5FF"
      className="h-full"
      bodyClassName="h-[calc(100%-45px)]"
      actions={
      <>
          <div className="flex overflow-hidden rounded border border-white/[0.08]">
            {(['positions', 'grip', 'speed'] as const).map((l) =>
          <button
            key={l}
            type="button"
            onClick={() => setLayer(l)}
            className={`px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
            layer === l ? 'bg-white/[0.09] text-f1-white' : 'text-silver/60 hover:text-f1-white'}`
            }>
            
                {l}
              </button>
          )}
          </div>
          <button
          type="button"
          aria-label="Expand circuit map"
          className="grid h-6 w-6 place-items-center rounded border border-white/[0.08] text-silver transition-colors hover:text-f1-white">
          
            <Maximize2 className="h-3 w-3" />
          </button>
        </>
      }>
      
      <div className="relative h-full min-h-[300px] w-full">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
        <svg viewBox="0 0 1000 480" className="h-full w-full" role="img" aria-label="Live circuit map">
          <defs>
            <linearGradient id="gripGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00D68F" />
              <stop offset="45%" stopColor="#FFC531" />
              <stop offset="100%" stopColor="#E10600" />
            </linearGradient>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3D8BFF" />
              <stop offset="50%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#B15CFF" />
            </linearGradient>
            <path id="trackPath" d={TRACK} />
          </defs>

          <path d={TRACK} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="26" strokeLinejoin="round" />
          <path
            d={TRACK}
            fill="none"
            stroke={layer === 'grip' ? 'url(#gripGrad)' : layer === 'speed' ? 'url(#speedGrad)' : 'rgba(255,255,255,0.34)'}
            strokeWidth={layer === 'positions' ? 2.5 : 6}
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.25))' }} />
          
          <path
            d={TRACK}
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2"
            strokeDasharray="34 966"
            className="animate-dash"
            opacity="0.85" />
          

          {/* Start / finish */}
          <g transform="translate(120,300)">
            <rect x="-9" y="-3" width="18" height="6" fill="#F3F7FB" opacity="0.85" transform="rotate(72)" />
            <text x="-46" y="-16" className="font-mono" fontSize="11" fill="#8E99A8" letterSpacing="2">
              S/F
            </text>
          </g>

          {corners.map((c) =>
          <g key={c.id}>
              <circle cx={c.x} cy={c.y} r="3" fill="#0A0C10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
              <text
              x={c.x + 10}
              y={c.y - 8}
              className="font-mono"
              fontSize="10.5"
              fill="#8E99A8"
              letterSpacing="1.4">
              
                {c.id}
              </text>
              <text x={c.x + 10} y={c.y + 5} className="font-mono" fontSize="9.5" fill="#00E5FF" opacity="0.8">
                {c.apex} kph
              </text>
            </g>
          )}

          {cars.map((car) =>
          <g key={car.code}>
              <circle r="7" fill={car.color} opacity="0.22">
                <animateMotion dur={car.dur} begin={car.offset} repeatCount="indefinite">
                  <mpath href="#trackPath" />
                </animateMotion>
              </circle>
              <circle r="3.6" fill={car.color} stroke="#050607" strokeWidth="1.2">
                <animateMotion dur={car.dur} begin={car.offset} repeatCount="indefinite">
                  <mpath href="#trackPath" />
                </animateMotion>
              </circle>
            </g>
          )}
        </svg>

        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
          {cars.map((c) =>
          <span
            key={c.code}
            className="flex items-center gap-1.5 rounded border border-white/[0.07] bg-black/50 px-1.5 py-1 font-mono text-[9px] tracking-[0.12em] text-silver-light backdrop-blur">
            
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
              {c.code}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          <PanelChip color="#00D68F" active>
            Track clear
          </PanelChip>
          <span className="flex items-center gap-1 rounded border border-white/[0.07] bg-black/50 px-1.5 py-1 font-mono text-[9px] text-silver backdrop-blur">
            <MapPin className="h-2.5 w-2.5 text-f1-cyan" /> Sector 2 · fastest RUS
          </span>
        </div>
      </div>
    </Panel>);

}