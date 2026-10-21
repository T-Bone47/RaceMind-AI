import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TelemetryToolbar } from '../components/telemetry/TelemetryToolbar';
import { ChannelStack } from '../components/telemetry/ChannelStack';
import { TrackReplay } from '../components/telemetry/TrackReplay';
import { CornerAnalysis } from '../components/telemetry/CornerAnalysis';
import { DynamicsPanel } from '../components/telemetry/DynamicsPanel';
import { LoadsPanel } from '../components/telemetry/LoadsPanel';

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

export function Telemetry() {
  const [cursor, setCursor] = useState(0.42);
  const [playing, setPlaying] = useState(true);
  const frame = useRef<number>();

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setCursor((c) => (c + dt / 12) % 1);
      frame.current = window.requestAnimationFrame(step);
    };
    frame.current = window.requestAnimationFrame(step);
    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [playing]);

  const handleCursor = useCallback((c: number) => {
    setPlaying(false);
    setCursor(c);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-2 p-2 xl:p-3">
      <Block index={0}>
        <TelemetryToolbar
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
          onReset={() => {
            setPlaying(false);
            setCursor(0);
          }}
          cursor={cursor} />
        
      </Block>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
        <Block index={1} className="xl:col-span-8">
          <ChannelStack cursor={cursor} onCursor={handleCursor} />
        </Block>

        <div className="space-y-2 xl:col-span-4">
          <Block index={2}>
            <div className="h-[330px]">
              <TrackReplay cursor={cursor} />
            </div>
          </Block>
          <Block index={3}>
            <DynamicsPanel />
          </Block>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
        <Block index={4} className="xl:col-span-8">
          <CornerAnalysis />
        </Block>
        <Block index={5} className="xl:col-span-4">
          <LoadsPanel />
        </Block>
      </div>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Telemetry archive 2032.08 · 280 Hz acquisition
      </p>
    </div>);

}