import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { InsightsHeader } from '../components/insights/InsightsHeader';
import { InsightFeed } from '../components/insights/InsightFeed';
import { InsightDetail } from '../components/insights/InsightDetail';
import { ExecutiveSummary } from '../components/insights/ExecutiveSummary';
import { PredictionBoard } from '../components/insights/PredictionBoard';
import { ModelTelemetry } from '../components/insights/ModelTelemetry';
import { type Severity, type Insight } from '../data/insights';
import { useSessionStore } from '../store/sessionStore';
import { useCoachingReport, type CoachingReportRead } from '../lib/api/coaching';

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  })
};

function Block({ index, className, children }: {index: number;className?: string;children: React.ReactNode;}) {
  return (
    <motion.div variants={fade} initial="hidden" animate="show" custom={index} className={className}>
      {children}
    </motion.div>);

}

export function Insights() {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  
  const sessionId = useSessionStore(s => s.activeSessionId);
  const { data: report } = useCoachingReport(sessionId || "");

  const activeInsights: Insight[] = useMemo(() => {
    if (!report) return []; // Empty or fallback to mock

    const mapped: Insight[] = [];

    // Map Corner Tips
    report.corner_tips.forEach((tip, idx) => {
      mapped.push({
        id: `c-${idx}`,
        title: `Corner ${tip.corner.index} Optimization`,
        summary: tip.steering_smoothness_note,
        detail: `Entry: ${tip.entry.message} | Mid: ${tip.mid.message} | Exit: ${tip.exit.message}`,
        domain: 'Driver',
        severity: tip.potential_gain_kph && tip.potential_gain_kph > 5 ? 'opportunity' : 'informational',
        confidence: Math.round((tip.entry.confidence.value + tip.mid.confidence.value + tip.exit.confidence.value) / 3 * 100),
        horizon: 'Next lap',
        impact: tip.potential_gain_kph ? `+${tip.potential_gain_kph.toFixed(1)} kph` : 'Consistency',
        impactTone: '#00D68F',
        evidence: {
          label: 'Speed Profile',
          unit: 'kph',
          color: '#00D68F',
          values: [tip.corner.entry_speed_kph, tip.corner.min_speed_kph, tip.corner.exit_speed_kph, tip.corner.exit_speed_kph * 1.1],
          annotation: 'Analyzed from telemetry'
        },
        contributions: [{ label: 'Steering Corrections', weight: tip.steering_corrections * 10 }],
        actions: [{ label: 'Apply smoother steering input', detail: 'Improves minimum apex speed', primary: true }],
        counterfactual: 'Current steering is causing scrubbing and loss of exit speed'
      });
    });

    // Map Consistency
    if (report.consistency) {
      mapped.push({
        id: 'cons',
        title: 'Driver Rhythm',
        summary: `Consistency Score: ${report.consistency.score_0_100.toFixed(0)}`,
        detail: report.consistency.confidence.reason,
        domain: 'Performance',
        severity: report.consistency.score_0_100 < 50 ? 'watch' : 'informational',
        confidence: Math.round(report.consistency.confidence.value * 100),
        horizon: 'Current stint',
        impact: `σ ${report.consistency.lap_time_stdev_ms.toFixed(0)} ms`,
        impactTone: report.consistency.score_0_100 < 50 ? '#FFC531' : '#00E5FF',
        evidence: { label: 'Lap deviation', unit: 's', color: '#00E5FF', values: [0, 0, 0], annotation: `${report.consistency.lap_count} laps`},
        contributions: [], actions: [], counterfactual: ''
      });
    }

    // Map Tyre Preservation
    report.tyre_preservation.forEach((tip, idx) => {
      mapped.push({
        id: `t-${idx}`,
        title: 'Tyre Preservation Alert',
        summary: tip.message,
        detail: tip.reasoning,
        domain: 'Strategy',
        severity: 'critical',
        confidence: Math.round(tip.confidence.value * 100),
        horizon: 'Immediate',
        impact: 'High wear',
        impactTone: '#E10600',
        evidence: { label: 'Tyre wear model', unit: '%', color: '#E10600', values: [0,0,0], annotation: tip.reasoning },
        contributions: [], actions: [], counterfactual: ''
      });
    });

    return mapped;
  }, [report]);

  const defaultId = activeInsights.length > 0 ? activeInsights[0].id : "";
  const [selectedId, setSelectedId] = useState(defaultId);

  const selected = useMemo(
    () => activeInsights.find((i) => i.id === selectedId) ?? activeInsights[0],
    [selectedId, activeInsights]
  );

  const handleFilter = (f: Severity | 'all') => {
    setFilter(f);
    const first = activeInsights.find((i) => f === 'all' || i.severity === f);
    if (first) setSelectedId(first.id);
  };

  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-3 p-3 xl:p-4">
      <Block index={0}>
        <InsightsHeader filter={filter} onFilter={handleFilter} />
      </Block>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Block index={1} className="xl:col-span-3">
          <div className="h-[640px]">
            {activeInsights.length > 0 ? (
              <InsightFeed filter={filter} selectedId={selectedId} onSelect={setSelectedId} insights={activeInsights} />
            ) : (
              <div className="flex h-full items-center justify-center border border-white/5 bg-carbon-900/40 p-4 text-center font-mono text-sm text-silver/40">
                Awaiting telemetry for coaching report...
              </div>
            )}
          </div>
        </Block>

        <Block index={2} className="xl:col-span-6">
          {selected ? <InsightDetail insight={selected} /> : null}
        </Block>

        <div className="space-y-3 xl:col-span-3">
          <Block index={3}>
            <ModelTelemetry />
          </Block>
          <Block index={4}>
            <PredictionBoard />
          </Block>
        </div>
      </div>

      <Block index={5}>
        <ExecutiveSummary />
      </Block>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Intelligence briefing · advisory output, strategist retains final call
      </p>
    </div>);

}
