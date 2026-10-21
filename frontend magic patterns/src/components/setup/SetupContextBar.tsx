import React from 'react';
import { CloudRain, Download, GitCompare, Save, Search, Sparkles, Star } from 'lucide-react';
import { circuits, games, weatherOptions, type Circuit, type GameTitle, type WeatherKind } from '../../data/setups';

interface Props {
  game: GameTitle;
  circuit: Circuit;
  weather: WeatherKind;
  onGame: (id: string) => void;
  onCircuit: (id: string) => void;
  onWeather: (w: WeatherKind) => void;
  dirty: boolean;
  onSave: () => void;
  onApplyAI: () => void;
  favourite: boolean;
  onToggleFavourite: () => void;
}

export function SetupContextBar({
  game,
  circuit,
  weather,
  onGame,
  onCircuit,
  onWeather,
  dirty,
  onSave,
  onApplyAI,
  favourite,
  onToggleFavourite
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 brushed opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
        style={{ background: game.accent, boxShadow: `0 0 20px ${game.accent}` }}
        aria-hidden="true" />
      

      <div className="relative flex flex-col gap-3 p-4 2xl:flex-row 2xl:items-center">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">
            Car setup library · {game.name} · season {game.season}
          </p>
          <h1 className="mt-1 flex items-center gap-2.5 text-[22px] font-semibold leading-none tracking-tight text-f1-white">
            {circuit.name}
            <button
              type="button"
              onClick={onToggleFavourite}
              aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
              className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] transition-colors hover:border-white/[0.2]">
              
              <Star
                className="h-3 w-3"
                style={{ color: favourite ? '#FFC531' : '#8E99A8' }}
                fill={favourite ? '#FFC531' : 'none'} />
              
            </button>
          </h1>
          <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver">
            {circuit.country} · {circuit.lengthKm} km · {circuit.laps} laps · {circuit.drsZones} DRS zones
          </p>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 2xl:justify-end">
          <div className="flex min-w-[190px] items-center gap-2 rounded-lg border border-white/[0.07] bg-black/35 px-2.5 py-2 transition-colors focus-within:border-f1-cyan/45">
            <Search className="h-3.5 w-3.5 shrink-0 text-silver/50" strokeWidth={1.7} />
            <input
              placeholder="Search setups, circuits, docs…"
              aria-label="Global setup search"
              className="min-w-0 flex-1 bg-transparent text-[11.5px] text-f1-white placeholder:text-silver/45 focus:outline-none" />
            
          </div>

          <Select label="Game" value={game.id} onChange={onGame} options={games.map((g) => ({ value: g.id, label: g.short }))} />
          <Select
            label="Circuit"
            value={circuit.id}
            onChange={onCircuit}
            options={circuits.map((c) => ({ value: c.id, label: c.code }))} />
          

          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-1">
            <CloudRain className="mx-1 h-3 w-3 text-silver/45" />
            {weatherOptions.map((w) =>
            <button
              key={w}
              type="button"
              onClick={() => onWeather(w)}
              className={`rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
              weather === w ? 'bg-white/[0.09] text-f1-white' : 'text-silver/55 hover:text-f1-white'}`
              }>
              
                {w}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onApplyAI}
            className="flex items-center gap-1.5 rounded-lg border border-f1-cyan/35 bg-f1-cyan/[0.08] px-2.5 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-f1-cyan transition-colors hover:bg-f1-cyan/[0.16]">
            
            <Sparkles className="h-3.5 w-3.5" /> AI setup
          </button>
          <IconAction label="Compare setups">
            <GitCompare className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction label="Export setup">
            <Download className="h-3.5 w-3.5" />
          </IconAction>
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] transition-all ${
            dirty ?
            'bg-f1-cyan text-carbon-900 hover:scale-[1.03] active:scale-95' :
            'cursor-not-allowed border border-white/[0.07] bg-white/[0.02] text-silver/40'}`
            }>
            
            <Save className="h-3.5 w-3.5" /> {dirty ? 'Save setup' : 'Saved'}
          </button>

          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/30 py-1 pl-1 pr-2.5">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-f1-cyan/15 font-mono text-[9.5px] font-bold text-f1-cyan ring-1 ring-f1-cyan/30">
              63
            </div>
            <div className="hidden leading-none lg:block">
              <p className="text-[11px] font-medium text-f1-white">G. Russell</p>
              <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/55">Mercedes</p>
            </div>
          </div>
        </div>
      </div>
    </section>);

}

function Select({
  label,
  value,
  options,
  onChange





}: {label: string;value: string;options: {value: string;label: string;}[];onChange: (v: string) => void;}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/30 px-2.5 py-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/45">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent font-mono text-[10.5px] uppercase tracking-[0.1em] text-f1-white focus:outline-none">
        
        {options.map((o) =>
        <option key={o.value} value={o.value} className="bg-carbon-600 text-f1-white">
            {o.label}
          </option>
        )}
      </select>
    </label>);

}

function IconAction({ children, label }: {children: React.ReactNode;label: string;}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-silver transition-colors hover:border-white/[0.18] hover:text-f1-white">
      
      {children}
    </button>);

}