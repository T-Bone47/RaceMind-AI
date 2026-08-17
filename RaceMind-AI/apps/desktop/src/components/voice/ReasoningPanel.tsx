
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { reasoning } from '../../data/voice';
import { Panel } from '../ui/Panel';
import { RingGauge } from '../ui/RingGauge';

export function ReasoningPanel() {
  return (
    <Panel
      title="AI Reasoning"
      subtitle="Chain of thought · streaming"
      accent="#B15CFF"
      className="h-full"
      bodyClassName="p-4"
      actions={
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-f1-purple">415 ms</span>
      }>
      
      <ol className="relative space-y-3 pl-1">
        <span className="absolute bottom-3 left-[7px] top-3 w-px bg-white/[0.08]" aria-hidden="true" />
        {reasoning.map((step, i) => {
          const color = step.status === 'done' ? '#00D68F' : step.status === 'active' ? '#B15CFF' : '#8E99A8';
          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex gap-3 pl-6">
              
              <span
                className="absolute left-0 top-0.5 grid h-[15px] w-[15px] place-items-center rounded-full border"
                style={{ borderColor: `${color}77`, background: '#0A0C10' }}>
                
                {step.status === 'done' ?
                <Check className="h-2.5 w-2.5" style={{ color }} /> :
                step.status === 'active' ?
                <Loader2 className="h-2.5 w-2.5 animate-spin" style={{ color }} /> :

                <span className="h-1 w-1 rounded-full bg-silver/50" />
                }
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p
                    className="truncate text-[12px] font-medium"
                    style={{ color: step.status === 'pending' ? '#8E99A8' : '#F3F7FB' }}>
                    
                    {step.label}
                  </p>
                  {step.ms > 0 &&
                  <span className="ml-auto shrink-0 font-mono text-[9px] text-silver/40">{step.ms} ms</span>
                  }
                </div>
                <p className="mt-0.5 font-mono text-[9.5px] leading-relaxed text-silver/60">{step.detail}</p>
              </div>
            </motion.li>);

        })}
      </ol>

      <div className="mt-4 flex items-center gap-4 rounded-lg border border-white/[0.06] bg-black/25 p-3">
        <RingGauge value={84} label="Decision" unit="%" color="#B15CFF" size={80} />
        <div className="min-w-0 flex-1 space-y-2">
          <Bar label="Telemetry evidence" value={92} color="#00E5FF" />
          <Bar label="Model agreement" value={78} color="#00D68F" />
          <Bar label="Rival uncertainty" value={41} color="#FF7A29" />
          <p className="pt-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-silver/40">
            Gate 0.80 · recommendation released
          </p>
        </div>
      </div>
    </Panel>);

}

function Bar({ label, value, color }: {label: string;value: number;color: string;}) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[9px]">
        <span className="uppercase tracking-[0.12em] text-silver/55">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        
      </div>
    </div>);

}
