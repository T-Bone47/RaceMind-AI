import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DecisionBar } from '../components/strategy/DecisionBar';
import { SimulatorControls } from '../components/strategy/SimulatorControls';
import { OutcomeDistribution } from '../components/strategy/OutcomeDistribution';
import { PositionProjection } from '../components/strategy/PositionProjection';
import { UndercutLab } from '../components/strategy/UndercutLab';
import { PitCrewPlanner } from '../components/strategy/PitCrewPlanner';
import { OpponentGrid } from '../components/strategy/OpponentGrid';
import { RiskMatrix } from '../components/strategy/RiskMatrix';
import type { SimInputs } from '../data/strategy';
import { simulate } from '../utils/strategySim';
import { useSessionStore } from '../store/sessionStore';
import { useActiveStrategy, useRecomputeStrategy } from '../lib/api/strategy';

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

export function Strategy() {
  const sessionId = useSessionStore(s => s.activeSessionId);
  const currentLap = useSessionStore(s => s.currentLap);
  const { data: activeStrategy } = useActiveStrategy(sessionId || "");
  const { mutate: recompute } = useRecomputeStrategy();

  const [inputs, setInputs] = useState<SimInputs>({
    pitLap: 45,
    compound: 'SOFT',
    neutralisation: 'none',
    rain: 12,
    aggression: 64
  });

  // If backend strategy is available, override the default pit lap and compound
  useMemo(() => {
    if (activeStrategy?.recommended_pit_lap) {
      setInputs(prev => ({
        ...prev,
        pitLap: activeStrategy.recommended_pit_lap!,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        compound: (activeStrategy.recommended_compound as any) || prev.compound
      }));
    }
  }, [activeStrategy]);

  const result = useMemo(() => simulate(inputs), [inputs]);
  const patch = useCallback((p: Partial<SimInputs>) => {
    setInputs((prev) => ({ ...prev, ...p }));
    if (p.pitLap && sessionId) {
      recompute({ sessionId, payload: { current_lap: currentLap }});
    }
  }, [sessionId, currentLap, recompute]);

  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-2 p-2 xl:p-3">
      <Block index={0}>
        <DecisionBar inputs={inputs} result={result} />
      </Block>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
        <Block index={1} className="xl:col-span-3">
          <SimulatorControls inputs={inputs} onChange={patch} tyreMargin={result.tyreMargin} />
        </Block>

        <div className="space-y-2 xl:col-span-6">
          <Block index={2}>
            <PositionProjection inputs={inputs} result={result} />
          </Block>
          <Block index={3}>
            <OutcomeDistribution result={result} />
          </Block>
        </div>

        <Block index={4} className="xl:col-span-3">
          <UndercutLab inputs={inputs} onSelectLap={(lap) => patch({ pitLap: lap })} />
        </Block>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-12">
        <Block index={5} className="xl:col-span-4">
          <PitCrewPlanner inputs={inputs} />
        </Block>
        <Block index={6} className="xl:col-span-4">
          <OpponentGrid pitLap={inputs.pitLap} />
        </Block>
        <Block index={7} className="lg:col-span-2 xl:col-span-4">
          <RiskMatrix />
        </Block>
      </div>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Strategy room · simulations refreshed every 400 ms
      </p>
    </div>);

}