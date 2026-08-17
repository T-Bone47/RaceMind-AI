
import { useState } from 'react';
import { motion } from 'framer-motion';
import { VoiceStage } from '../components/voice/VoiceStage';
import { ConversationLog } from '../components/voice/ConversationLog';
import { ReasoningPanel } from '../components/voice/ReasoningPanel';
import { ContextPanel } from '../components/voice/ContextPanel';
import type { VoiceState } from '../data/voice';


export function Voice() {
  const [state, setState] = useState<VoiceState>('idle');
  const [muted, setMuted] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[2100px] p-3 xl:p-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="xl:col-span-3">
          
          <div className="h-full min-h-[640px]">
            <ContextPanel />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="xl:col-span-6">
          
          <div className="h-full min-h-[640px]">
            <VoiceStage
              state={state}
              onStateChange={setState}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)} />
            
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 xl:col-span-3">
          
          <div className="min-h-[340px] flex-1">
            <ConversationLog />
          </div>
          <ReasoningPanel />
        </motion.div>
      </div>

      <p className="pb-2 pt-4 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Voice engineer v7.2 · transcripts retained for 90 days
      </p>
    </div>);

}
