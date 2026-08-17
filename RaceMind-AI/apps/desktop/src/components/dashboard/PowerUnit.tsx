import { useRaceData } from '../../hooks/useRaceData';
import { Panel } from '../ui/Panel';
import { RingGauge } from '../ui/RingGauge';
import { Trace } from '../ui/Trace';
import { wave } from '../../utils/series';
import { useLiveTick } from '../../hooks/useLiveTick';

const ersTrace = wave(64, 9, 1).map((v) => 55 + v * 26);
const fuelTrace = Array.from({ length: 64 }, (_, i) => 96 - i * 0.82);

export function PowerUnit() {
  const { focusDriver } = useRaceData();

  const tick = useLiveTick(1200);
  const charge = Math.round(focusDriver.ersCharge + Math.sin(tick / 2) * 6);

  return (
    <Panel
      title="Power Unit & Energy"
      subtitle="PU4 · 14 races · deployment map D3"
      accent="#00D68F"
      className="h-full"
      bodyClassName="p-4"
      actions={<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-f1-green">Nominal</span>}>
      
      <div className="flex items-center justify-between gap-2">
        <RingGauge value={charge} label="ERS" unit="%" color="#00E5FF" size={86} />
        <RingGauge value={focusDriver.fuelRemaining} max={110} display={focusDriver.fuelRemaining.toFixed(1)} unit="kg" label="Fuel" color="#00D68F" size={86} />
        <RingGauge value={87} label="Battery" unit="%" color="#B15CFF" size={86} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Cell label="Deploy" value={`${focusDriver.ersDeployed} MJ`} sub="of 4.0 MJ per lap" color="#00E5FF" trace={ersTrace} />
        <Cell label="Fuel delta" value={`${focusDriver.fuelDelta}`} sub="laps in hand: 1.4" color="#00D68F" trace={fuelTrace} />
      </div>

      <div className="mt-3 space-y-2">
        <Meter label="MGU-K harvest" value={82} color="#00E5FF" detail="2.0 MJ / lap" />
        <Meter label="MGU-H harvest" value={64} color="#B15CFF" detail="unlimited" />
        <Meter label="Oil temp" value={57} color="#FF7A29" detail="112 °C" />
        <Meter label="Water temp" value={49} color="#3D8BFF" detail="98 °C" />
      </div>
    </Panel>);

}

function Cell({
  label,
  value,
  sub,
  color,
  trace






}: {label: string;value: string;sub: string;color: string;trace: number[];}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25 p-2.5">
      <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/55">{label}</span>
      <p className="mt-1 font-mono text-[16px] font-semibold leading-none tabular" style={{ color }}>
        {value}
      </p>
      <p className="mt-1 font-mono text-[8.5px] text-silver/45">{sub}</p>
      <div className="-mx-2.5 -mb-2.5 mt-1.5">
        <Trace values={trace} color={color} height={30} width={160} strokeWidth={1.2} />
      </div>
    </div>);

}

function Meter({ label, value, color, detail }: {label: string;value: number;color: string;detail: string;}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-silver/55">{label}</span>
      <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}88` }} />
        
      </div>
      <span className="w-[58px] shrink-0 text-right font-mono text-[9px] tabular text-silver">{detail}</span>
    </div>);

}