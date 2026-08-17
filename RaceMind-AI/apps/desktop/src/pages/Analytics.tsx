import { useState } from 'react';
import { motion } from 'framer-motion';
import { DriverHero } from '../components/analytics/DriverHero';
import { SkillRadar } from '../components/analytics/SkillRadar';
import { SeasonEvolution } from '../components/analytics/SeasonEvolution';
import { ConsistencyPanel } from '../components/analytics/ConsistencyPanel';
import { CornerHeatmap } from '../components/analytics/CornerHeatmap';
import { PedalAnalysis } from '../components/analytics/PedalAnalysis';
import { CoachingInsights } from '../components/analytics/CoachingInsights';

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

export function Analytics() {
  const [compareTo, setCompareTo] = useState('ANT');

  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-3 p-3 xl:p-4">
      <Block index={0}>
        <DriverHero compareTo={compareTo} onCompare={setCompareTo} />
      </Block>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Block index={1} className="xl:col-span-4">
          <SkillRadar compareTo={compareTo} />
        </Block>

        <div className="space-y-3 xl:col-span-8">
          <Block index={2}>
            <SeasonEvolution />
          </Block>
          <Block index={3}>
            <CornerHeatmap />
          </Block>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12">
        <Block index={4} className="xl:col-span-4">
          <ConsistencyPanel />
        </Block>
        <Block index={5} className="xl:col-span-4">
          <PedalAnalysis compareTo={compareTo} />
        </Block>
        <Block index={6} className="lg:col-span-2 xl:col-span-4">
          <CoachingInsights />
        </Block>
      </div>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Driver analytics · 8 rounds · 412 laps modelled
      </p>
    </div>);

}