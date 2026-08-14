import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNav, Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-carbon-900 text-foreground">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: '#00E5FF' }}
        aria-hidden="true" />
      
      <div
        className="pointer-events-none absolute -bottom-52 right-[-10%] h-[560px] w-[560px] rounded-full opacity-[0.12] blur-[130px]"
        style={{ background: '#E10600' }}
        aria-hidden="true" />
      

      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar onOpenCommand={() => setPaletteOpen(true)} />
        <main className="relative flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
        <MobileNav />
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>);

}