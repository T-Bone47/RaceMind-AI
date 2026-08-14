import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, Radio, Send, Square, Volume2 } from 'lucide-react';
import { VoiceOrb, stateColor } from './VoiceOrb';
import { suggestedCommands, type VoiceState } from '../../data/voice';
import { useAskOllie } from '@/lib/api/ai';
import { useSessionStore } from '@/store/sessionStore';

const stateCopy: Record<VoiceState, {label: string;caption: string;}> = {
  idle: { label: 'Standby', caption: 'Say “Engineer” or hold the button to talk.' },
  listening: { label: 'Listening', caption: 'Should we cover Norris if he boxes on lap forty-four…' },
  thinking: { label: 'Reasoning', caption: 'Simulating 12,000 race outcomes across the undercut branch…' },
  speaking: { label: 'Responding', caption: 'Covering Norris costs 1.2 seconds of track position but secures P3 in 74% of outcomes.' }
};

const spectrum = Array.from({ length: 56 }, (_, i) => i);

interface Props {
  state: VoiceState;
  onStateChange: (s: VoiceState) => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function VoiceStage({ state, onStateChange, muted, onToggleMute }: Props) {
  const [question, setQuestion] = useState("");
  const askOllie = useAskOllie();
  const sessionState = useSessionStore();
  const color = stateColor[state];
  const active = state !== 'idle';
  const copy = stateCopy[state];

  const handleAsk = async (text: string) => {
    if (!text.trim() || !sessionState.activeSessionId) return;
    
    onStateChange('thinking');
    setQuestion("");
    sessionState.addMessage({ from: "driver", text });

    try {
      const res = await askOllie.mutateAsync({
        session_id: sessionState.activeSessionId,
        question: text,
        context: {
          track_name: sessionState.trackName,
          weather: sessionState.weather,
          track_temp_c: sessionState.trackTempC,
          current_lap: sessionState.currentLap,
        }
      });
      sessionState.addMessage({ from: "engineer", text: res.answer });
      onStateChange('speaking');
    } catch (err) {
      console.error(err);
      onStateChange('idle');
    }
  };

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-carbon-700/70 glass shadow-panel">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}88, transparent)` }}
        aria-hidden="true" />
      

      <header className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-[2px] rounded-full" style={{ background: color }} />
          <div>
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-f1-white">Ollie</h2>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
              Race engineer · channel 63 · encrypted · 12 ms
            </p>
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em]"
          style={{ color, borderColor: `${color}55`, background: `${color}12` }}>
          
          <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full" style={{ background: color }} />
          {copy.label}
        </span>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-8">
        <VoiceOrb state={state} />

        <AnimatePresence mode="wait">
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="mt-7 max-w-[560px] text-balance text-center text-[16px] leading-relaxed text-f1-white">
            
            {copy.caption}
          </motion.p>
        </AnimatePresence>

        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-silver/45">
          {state === 'idle' ? 'Wake word armed' : `Live transcription · ${state === 'thinking' ? 'model v7.2' : '98% accuracy'}`}
        </p>

        <div className="mt-7 flex h-12 w-full max-w-[640px] items-center justify-center gap-[3px]">
          {spectrum.map((b) => {
            const base = 4 + Math.abs(Math.sin(b * 0.42)) * 26;
            return (
              <motion.span
                key={b}
                className="w-[3px] rounded-full"
                style={{ background: color, opacity: active ? 0.75 : 0.22 }}
                animate={{ height: active ? [base * 0.3, base, base * 0.4] : [3, 5, 3] }}
                transition={{
                  duration: state === 'speaking' ? 0.6 : state === 'thinking' ? 1.4 : 0.9,
                  repeat: Infinity,
                  delay: b * 0.018,
                  ease: 'easeInOut'
                }} />);


          })}
        </div>
      </div>

      <div className="relative border-t border-white/[0.06] px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onStateChange(state === 'listening' ? 'thinking' : 'listening')}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-transform hover:scale-[1.03] active:scale-95"
            style={{ background: color, color: '#050607', boxShadow: `0 0 26px -8px ${color}` }}>
            
            <Mic className="h-3.5 w-3.5" />
            {state === 'listening' ? 'Send' : 'Hold to talk'}
          </button>

          <Control label={muted ? 'Unmute channel' : 'Mute channel'} onClick={onToggleMute} active={muted}>
            {muted ? <MicOff className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Control>
          <Control label="Stop response" onClick={() => onStateChange('idle')}>
            <Square className="h-3 w-3" />
          </Control>
          <Control label="Open driver radio">
            <Radio className="h-3.5 w-3.5" />
          </Control>

          <div className="ml-1 flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-white/[0.07] bg-black/35 px-3 py-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(question) }}
              className="flex-1 bg-transparent font-mono text-[11px] text-f1-white placeholder:text-silver/45 focus:outline-none"
              placeholder="Type instead of speaking…"
              aria-label="Type a message to Ollie, your AI race engineer" />
            
            <button
              type="button"
              onClick={() => handleAsk(question)}
              aria-label="Send message"
              className="grid h-6 w-6 place-items-center rounded-lg bg-white/[0.06] text-silver transition-colors hover:text-f1-white">
              
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {suggestedCommands.map((c) =>
          <button
            key={c}
            type="button"
            onClick={() => handleAsk(c)}
            className="rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 text-[11px] text-silver transition-colors hover:border-f1-cyan/40 hover:text-f1-white">
            
              {c}
            </button>
          )}
        </div>
      </div>
    </section>);

}

function Control({
  children,
  label,
  onClick,
  active





}: {children: React.ReactNode;label: string;onClick?: () => void;active?: boolean;}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-xl border transition-colors ${
      active ?
      'border-f1-red/50 bg-f1-red/10 text-f1-red' :
      'border-white/[0.07] bg-white/[0.02] text-silver hover:border-white/[0.16] hover:text-f1-white'}`
      }>
      
      {children}
    </button>);

}