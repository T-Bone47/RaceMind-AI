import { useMemo } from 'react';
import { manifest } from './canvas.manifest';

export function useScreenInit<T extends Record<string, string> = Record<string, string>>() {
  return useMemo(() => {
    if (typeof window === 'undefined') return {} as Partial<T>;
    const screenId = new URLSearchParams(window.location.search).get('mp_screen');
    if (!screenId) return {} as Partial<T>;
    const screen = manifest?.screens?.[screenId as keyof typeof manifest.screens];
    return (screen && 'state' in screen ? screen.state : {}) as Partial<T>;
  }, []);
}