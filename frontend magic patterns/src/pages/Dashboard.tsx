import React from 'react';
import { motion } from 'framer-motion';
import { RaceHeader } from '../components/dashboard/RaceHeader';
import { TimingTower } from '../components/dashboard/TimingTower';
import { CircuitMap } from '../components/dashboard/CircuitMap';
import { AIEngineer } from '../components/dashboard/AIEngineer';
import { StrategyPanel } from '../components/dashboard/StrategyPanel';
import { TyreThermal } from '../components/dashboard/TyreThermal';
import { PowerUnit } from '../components/dashboard/PowerUnit';
import { TelemetryStrip } from '../components/dashboard/TelemetryStrip';
import { WeatherRadar } from '../components/dashboard/WeatherRadar';
import { CommsFeed } from '../components/dashboard/CommsFeed';
import { RaceIntel } from '../components/dashboard/RaceIntel';

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

export function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-3 p-3 xl:p-4">
      <Block index={0}>
        <RaceHeader />
      </Block>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Block index={1} className="xl:col-span-3">
          <div className="h-[520px]">
            <TimingTower />
          </div>
        </Block>

        <Block index={2} className="xl:col-span-6">
          <div className="h-[520px]">
            <CircuitMap />
          </div>
        </Block>

        <Block index={3} className="xl:col-span-3">
          <div className="h-[520px]">
            <AIEngineer />
          </div>
        </Block>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12">
        <Block index={4} className="xl:col-span-4">
          <StrategyPanel />
        </Block>
        <Block index={5} className="xl:col-span-4">
          <TyreThermal />
        </Block>
        <Block index={6} className="xl:col-span-4">
          <PowerUnit />
        </Block>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Block index={7} className="xl:col-span-8">
          <TelemetryStrip />
        </Block>
        <Block index={8} className="xl:col-span-4">
          <div className="h-full min-h-[340px]">
            <CommsFeed />
          </div>
        </Block>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Block index={9} className="xl:col-span-7">
          <RaceIntel />
        </Block>
        <Block index={10} className="xl:col-span-5">
          <WeatherRadar />
        </Block>
      </div>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Telemetry uplink secured · FIA sporting regulations 2032
      </p>
    </div>);

}