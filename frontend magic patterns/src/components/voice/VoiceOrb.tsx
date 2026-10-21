import React from 'react';
import { motion } from 'framer-motion';
import type { VoiceState } from '../../data/voice';

const stateColor: Record<VoiceState, string> = {
  idle: '#8E99A8',
  listening: '#00E5FF',
  thinking: '#B15CFF',
  speaking: '#00D68F'
};

const particles = Array.from({ length: 18 }, (_, i) => i);

export function VoiceOrb({ state, size = 232 }: {state: VoiceState;size?: number;}) {
  const color = stateColor[state];
  const active = state !== 'idle';

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <span
        className="absolute rounded-full blur-[46px]"
        style={{ width: size * 0.86, height: size * 0.86, background: color, opacity: active ? 0.28 : 0.12 }} />
      

      {[0, 1, 2].map((i) =>
      <motion.span
        key={i}
        className="absolute rounded-full border"
        style={{ borderColor: `${color}44`, width: size * 0.62, height: size * 0.62 }}
        animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: active ? 3 : 5, repeat: Infinity, delay: i * (active ? 1 : 1.6), ease: 'easeOut' }} />

      )}

      <motion.span
        className="absolute rounded-full border-2"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderColor: `${color}66`,
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: state === 'thinking' ? 2.2 : 9, repeat: Infinity, ease: 'linear' }} />
      
      <motion.span
        className="absolute rounded-full border"
        style={{
          width: size * 0.84,
          height: size * 0.84,
          borderColor: `${color}33`,
          borderBottomColor: 'transparent'
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: state === 'thinking' ? 3.4 : 14, repeat: Infinity, ease: 'linear' }} />
      

      {particles.map((p) => {
        const angle = p / particles.length * Math.PI * 2;
        const radius = size * 0.44;
        return (
          <motion.span
            key={p}
            className="absolute h-1 w-1 rounded-full"
            style={{
              background: color,
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            }}
            animate={{
              opacity: active ? [0.15, 0.9, 0.15] : [0.08, 0.3, 0.08],
              scale: active ? [0.6, 1.5, 0.6] : [0.6, 1, 0.6]
            }}
            transition={{ duration: 2.4, repeat: Infinity, delay: p * 0.11, ease: 'easeInOut' }} />);


      })}

      <motion.div
        className="relative grid place-items-center rounded-full"
        style={{
          width: size * 0.46,
          height: size * 0.46,
          background: `radial-gradient(circle at 34% 28%, ${color}55, rgba(5,6,7,0.94) 68%)`,
          boxShadow: `0 0 60px -12px ${color}, inset 0 0 32px -8px ${color}88`
        }}
        animate={{ scale: active ? [1, 1.045, 1] : [1, 1.015, 1] }}
        transition={{ duration: state === 'speaking' ? 0.9 : 2.6, repeat: Infinity, ease: 'easeInOut' }}>
        
        <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
        <div className="flex h-8 items-center gap-[3px]">
          {[0, 1, 2, 3, 4, 5, 6].map((b) =>
          <motion.span
            key={b}
            className="w-[3px] rounded-full"
            style={{ background: color }}
            animate={{
              height: active ? [6, 8 + b * 7 % 22, 6] : [4, 6, 4],
              opacity: active ? 0.95 : 0.4
            }}
            transition={{
              duration: state === 'speaking' ? 0.55 : 1.3,
              repeat: Infinity,
              delay: b * 0.07,
              ease: 'easeInOut'
            }} />

          )}
        </div>
      </motion.div>
    </div>);

}

export { stateColor };