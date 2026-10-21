import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { narrative, reportKpis, stintSeries, type ReportSection, type ReportTemplate } from '../../data/reports';
import { toPath } from '../../utils/series';

interface Props {
  template: ReportTemplate;
  sections: ReportSection[];
  enabled: Record<string, boolean>;
  zoom: number;
  paper: 'dark' | 'light';
}

const W = 720;
const H = 190;

export function ReportCanvas({ template, sections, enabled, zoom, paper }: Props) {
  const live = sections.filter((s) => enabled[s.id]);
  const light = paper === 'light';

  const ink = light ? '#111418' : '#F3F7FB';
  const muted = light ? '#5A6472' : '#8E99A8';
  const rule = light ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.08)';
  const surface = light ? '#FFFFFF' : '#0B0E13';
  const inset = light ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';

  const all = stintSeries.flatMap((s) => s.values);
  const lo = Math.min(...all) - 0.3;
  const hi = Math.max(...all) + 0.3;

  return (
    <div className="flex justify-center overflow-auto scrollbar-thin p-4">
      <motion.article
        key={`${template.id}-${paper}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        aria-label={`${template.name} preview`}
        className="origin-top rounded-lg shadow-[0_40px_90px_-30px_rgba(0,0,0,1)]"
        style={{
          width: 780,
          background: surface,
          transform: `scale(${zoom})`,
          border: `1px solid ${rule}`
        }}>
        
        {/* cover band */}
        <header className="relative overflow-hidden px-8 pb-6 pt-7" style={{ borderBottom: `1px solid ${rule}` }}>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
            style={{ background: template.accent }} />
          
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em]" style={{ color: template.accent }}>
                RaceMind AI · {template.name}
              </p>
              <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight" style={{ color: ink }}>
                Monaco Grand Prix
              </h1>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: muted }}>
                Round 8 of 24 · 23 May 2032 · Car 63 G. Russell
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div
                className="grid h-12 w-12 place-items-center rounded-lg"
                style={{ background: `${template.accent}18`, color: template.accent }}>
                
                <span className="font-mono text-[16px] font-bold">63</span>
              </div>
              <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: muted }}>
                Confidential
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6 px-8 py-6">
          {live.length === 0 &&
          <p className="py-16 text-center text-[13px]" style={{ color: muted }}>
              Every section is switched off. Enable at least one section in the builder to compose the report.
            </p>
          }

          {enabled.exec &&
          <Block label="01 · Executive summary" ink={ink} muted={muted} rule={rule}>
              <p className="text-[15px] font-medium leading-snug" style={{ color: ink }}>
                {narrative.headline}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed" style={{ color: muted }}>
                {narrative.body}
              </p>
              <div
              className="mt-3 flex items-start gap-2 rounded-md p-2.5"
              style={{ background: `${template.accent}12` }}>
              
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0" style={{ color: template.accent }} />
                <p className="text-[11.5px] leading-relaxed" style={{ color: ink }}>
                  <span className="font-semibold">Decisive moment · </span>
                  {narrative.decisive}
                </p>
              </div>
            </Block>
          }

          {enabled.result &&
          <Block label="02 · Result & championship impact" ink={ink} muted={muted} rule={rule}>
              <div className="grid grid-cols-4 gap-3">
                {reportKpis.map((k) =>
              <div key={k.label} className="rounded-md p-2.5" style={{ background: inset }}>
                    <p className="font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: muted }}>
                      {k.label}
                    </p>
                    <p className="mt-1.5 font-mono text-[19px] font-semibold leading-none tabular" style={{ color: k.color }}>
                      {k.value}
                    </p>
                    <p className="mt-1.5 font-mono text-[8.5px]" style={{ color: muted }}>
                      {k.delta}
                    </p>
                  </div>
              )}
              </div>
            </Block>
          }

          {enabled.pace &&
          <Block label="03 · Stint pace analysis" ink={ink} muted={muted} rule={rule}>
              <div className="rounded-md p-3" style={{ background: inset }}>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 190 }} role="img" aria-label="Stint pace chart">
                  {[0.2, 0.4, 0.6, 0.8].map((g) =>
                <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke={rule} strokeWidth="1" />
                )}
                  {stintSeries.map((s) =>
                <path
                  key={s.label}
                  d={toPath(s.values, W, H, lo, hi)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={light && s.color === '#F3F7FB' ? 0.35 : 1} />

                )}
                  {stintSeries.map((s) =>
                s.values.map((v, i) =>
                <circle
                  key={`${s.label}-${i}`}
                  cx={i / (s.values.length - 1) * W}
                  cy={H - (v - lo) / (hi - lo) * H}
                  r="2"
                  fill={s.color}
                  opacity={light && s.color === '#F3F7FB' ? 0.35 : 0.85} />

                )
                )}
                </svg>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  {stintSeries.map((s) =>
                <span key={s.label} className="flex items-center gap-1.5 font-mono text-[9px]" style={{ color: muted }}>
                      <span className="h-[2px] w-4 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </span>
                )}
                  <span className="ml-auto font-mono text-[9px]" style={{ color: muted }}>
                    Lap 1 → 78
                  </span>
                </div>
              </div>
            </Block>
          }

          {enabled.strategy &&
          <Block label="04 · Strategy execution" ink={ink} muted={muted} rule={rule}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    {['Event', 'Planned', 'Actual', 'Delta', 'Outcome'].map((h) =>
                  <th
                    key={h}
                    className="border-b py-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em]"
                    style={{ borderColor: rule, color: muted }}>
                    
                        {h}
                      </th>
                  )}
                  </tr>
                </thead>
                <tbody>
                  {[
                ['First stop', 'Lap 47', 'Lap 45', '−2', 'Undercut Norris · +3.1s'],
                ['Compound', 'HARD', 'HARD', '—', 'Held to the flag'],
                ['Engine mode', 'Push lap 60', 'Push lap 58', '−2', 'Covered VER threat'],
                ['Final stint length', '31 laps', '33 laps', '+2', 'Cliff arrived lap 71']].
                map((row) =>
                <tr key={row[0]}>
                      {row.map((cell, i) =>
                  <td
                    key={i}
                    className="border-b py-1.5 font-mono text-[10.5px] tabular"
                    style={{ borderColor: rule, color: i === 0 ? ink : i === 4 ? template.accent : muted }}>
                    
                          {cell}
                        </td>
                  )}
                    </tr>
                )}
                </tbody>
              </table>
            </Block>
          }

          {enabled.tyre &&
          <Block label="05 · Tyre management" ink={ink} muted={muted} rule={rule}>
              <div className="grid grid-cols-3 gap-3">
                {[
              { c: 'MEDIUM', color: '#FFC531', deg: 0.082, laps: 45, note: 'Cliff at lap 42' },
              { c: 'HARD', color: '#F3F7FB', deg: 0.041, laps: 33, note: 'Stable to the flag' },
              { c: 'SOFT', color: '#E10600', deg: 0.126, laps: 0, note: 'Unused in race' }].
              map((t) =>
              <div key={t.c} className="rounded-md p-2.5" style={{ background: inset }}>
                    <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: muted }}>
                      <span className="h-2 w-2 rounded-full" style={{ background: t.color }} /> {t.c}
                    </p>
                    <p className="mt-1.5 font-mono text-[17px] font-semibold leading-none tabular" style={{ color: ink }}>
                      {t.deg.toFixed(3)}
                      <span className="ml-1 text-[8.5px]" style={{ color: muted }}>s/lap</span>
                    </p>
                    <p className="mt-1.5 font-mono text-[9px]" style={{ color: muted }}>
                      {t.laps} laps · {t.note}
                    </p>
                  </div>
              )}
              </div>
            </Block>
          }

          {enabled.driver &&
          <Block label="06 · Driver performance" ink={ink} muted={muted} rule={rule}>
              <div className="space-y-2">
                {[
              { l: 'Sector 1', v: 82 },
              { l: 'Sector 2', v: 94 },
              { l: 'Sector 3', v: 71 },
              { l: 'Consistency (σ 0.184s)', v: 88 }].
              map((r) =>
              <div key={r.l} className="flex items-center gap-3">
                    <span className="w-[168px] shrink-0 font-mono text-[10px]" style={{ color: muted }}>
                      {r.l}
                    </span>
                    <div className="h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: inset }}>
                      <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: template.accent }} />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-[10px] tabular" style={{ color: ink }}>
                      {r.v}
                    </span>
                  </div>
              )}
              </div>
            </Block>
          }

          {enabled.reliability &&
          <Block label="07 · Reliability & component life" ink={ink} muted={muted} rule={rule}>
              <div className="grid grid-cols-4 gap-3">
                {[
              { l: 'ICE', v: '4 of 8 races', p: 52 },
              { l: 'Turbo', v: '5 of 8', p: 63 },
              { l: 'MGU-K', v: '3 of 8', p: 38 },
              { l: 'Gearbox', v: '2 of 6', p: 34 }].
              map((c) =>
              <div key={c.l} className="rounded-md p-2.5" style={{ background: inset }}>
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: muted }}>
                      {c.l}
                    </p>
                    <p className="mt-1 font-mono text-[11px] tabular" style={{ color: ink }}>
                      {c.v}
                    </p>
                    <div className="mt-1.5 h-[4px] overflow-hidden rounded-full" style={{ background: light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full" style={{ width: `${c.p}%`, background: c.p > 55 ? '#FF7A29' : '#00D68F' }} />
                    </div>
                  </div>
              )}
              </div>
            </Block>
          }

          {enabled.decisions &&
          <Block label="08 · Decision review" ink={ink} muted={muted} rule={rule}>
              <ul className="space-y-2">
                {[
              { t: 'Lap 45 undercut', taken: true, out: 'Gained 3.1s and one position' },
              { t: 'Lap 52 engine mode lift', taken: true, out: 'Protected MGU-K temperature' },
              { t: 'Lap 61 second stop', taken: false, out: 'Correctly declined — would have lost 8.4s' },
              { t: 'Lap 70 push to the flag', taken: true, out: 'Held Norris by 1.8s' }].
              map((d) =>
              <li key={d.t} className="flex items-center gap-3 rounded-md px-2.5 py-2" style={{ background: inset }}>
                    <span
                  className="rounded px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
                  style={{
                    background: d.taken ? 'rgba(0,214,143,0.16)' : 'rgba(255,197,49,0.16)',
                    color: d.taken ? '#00D68F' : '#FFC531'
                  }}>
                  
                      {d.taken ? 'Taken' : 'Declined'}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px]" style={{ color: ink }}>
                      {d.t}
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px]" style={{ color: muted }}>
                      {d.out}
                    </span>
                  </li>
              )}
              </ul>
            </Block>
          }

          {enabled.next &&
          <Block label="09 · Actions for the next round" ink={ink} muted={muted} rule={rule}>
              <ol className="space-y-1.5">
                {[
              'Re-run the rear thermal model at 34°C ambient before Montréal — Vehicle Dynamics, by Tuesday.',
              'Simulator block on turn 10 traction with the softer rear platform — Driver, Wednesday.',
              'Review MGU-K derate threshold with Brixworth — Power Unit, by Thursday.'].
              map((a, i) =>
              <li key={a} className="flex gap-2.5 text-[11.5px] leading-relaxed" style={{ color: muted }}>
                    <span className="font-mono text-[10px]" style={{ color: template.accent }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {a}
                  </li>
              )}
              </ol>
            </Block>
          }

          {enabled.appendix &&
          <Block label="10 · Telemetry appendix" ink={ink} muted={muted} rule={rule}>
              <p className="text-[11.5px] leading-relaxed" style={{ color: muted }}>
                Attached: 280 Hz channel export (18.4 MB), lap-by-lap timing table, radio transcript and the full Monte
                Carlo distribution from the lap 45 decision point.
              </p>
            </Block>
          }
        </div>

        <footer
          className="flex items-center justify-between px-8 py-4 font-mono text-[8.5px] uppercase tracking-[0.16em]"
          style={{ borderTop: `1px solid ${rule}`, color: muted }}>
          
          <span>RaceMind AI · generated automatically</span>
          <span>
            {live.length} sections · ~{Math.max(1, Math.round(live.reduce((a, s) => a + s.words, 0) / 320))} pages
          </span>
        </footer>
      </motion.article>
    </div>);

}

function Block({
  label,
  ink,
  muted,
  rule,
  children






}: {label: string;ink: string;muted: string;rule: string;children: React.ReactNode;}) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2
        className="mb-2.5 border-b pb-1.5 font-mono text-[9px] uppercase tracking-[0.2em]"
        style={{ borderColor: rule, color: muted }}>
        
        {label}
      </h2>
      <div style={{ color: ink }}>{children}</div>
    </motion.section>);

}