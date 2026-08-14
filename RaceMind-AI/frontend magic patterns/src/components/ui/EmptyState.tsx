import React from 'react';
import { AlertTriangle, Inbox, Loader2, WifiOff } from 'lucide-react';
import { status } from './tokens';

type Kind = 'empty' | 'loading' | 'error' | 'offline';

const kindMeta: Record<Kind, {icon: React.ComponentType<{className?: string;}>;color: string;}> = {
  empty: { icon: Inbox, color: status.neutral },
  loading: { icon: Loader2, color: status.ai },
  error: { icon: AlertTriangle, color: status.critical },
  offline: { icon: WifiOff, color: status.warning }
};

/**
 * The one empty / loading / error surface in the product.
 * Every panel that can be dataless renders this instead of a blank box.
 */
export function EmptyState({
  kind = 'empty',
  title,
  body,
  action,
  compact = false






}: {kind?: Kind;title: string;body?: string;action?: React.ReactNode;compact?: boolean;}) {
  const meta = kindMeta[kind];
  const Icon = meta.icon;

  return (
    <div
      role={kind === 'error' ? 'alert' : undefined}
      aria-live={kind === 'loading' ? 'polite' : undefined}
      className={`grid place-items-center text-center ${compact ? 'px-4 py-8' : 'px-6 py-14'}`}>
      
      <div className="max-w-[300px]">
        <span
          className="mx-auto grid h-9 w-9 place-items-center rounded-lg border"
          style={{ borderColor: `${meta.color}33`, background: `${meta.color}0f`, color: meta.color }}>
          
          <Icon className={`h-4 w-4 ${kind === 'loading' ? 'animate-spin' : ''}`} />
        </span>
        <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-silver-light">
          {title}
        </p>
        {body && <p className="mt-2 text-[11.5px] leading-relaxed text-silver/70">{body}</p>}
        {action && <div className="mt-3 flex justify-center">{action}</div>}
      </div>
    </div>);

}

/** Shimmering placeholder bar for in-flight panels. */
export function Skeleton({ className = '' }: {className?: string;}) {
  return <div className={`animate-pulseGlow rounded bg-white/[0.06] ${className}`} />;
}