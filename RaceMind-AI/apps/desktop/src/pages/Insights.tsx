// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { InsightsHeader } from '../components/insights/InsightsHeader';
import { InsightFeed } from '../components/insights/InsightFeed';
import { InsightDetail } from '../components/insights/InsightDetail';
import { ExecutiveSummary } from '../components/insights/ExecutiveSummary';
import { PredictionBoard } from '../components/insights/PredictionBoard';
import { ModelTelemetry } from '../components/insights/ModelTelemetry';
import { insights, type Severity } from '../data/insights';

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
  const [selectedId, setSelectedId] = useState(insights[0].id);

  const selected = useMemo(
    () => insights.find((i) => i.id === selectedId) ?? insights[0],
    [selectedId]
  );

  const handleFilter = (f: Severity | 'all') => {
    setFilter(f);
    const first = insights.find((i) => f === 'all' || i.severity === f);
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
            <InsightFeed filter={filter} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </Block>

        <Block index={2} className="xl:col-span-6">
          <InsightDetail insight={selected} />
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