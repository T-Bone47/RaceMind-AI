import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BrainCircuit,
  ChevronLeft,
  FileBarChart,
  Gauge,
  History,
  LineChart,
  Radio,
  Settings,
  Target,
  Wrench } from
'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  code: string;
  icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  ready: boolean;
  group: string;
  hint: string;
}

export const navItems: NavItem[] = [
{ to: '/', label: 'Dashboard', code: 'DSH', icon: Gauge, ready: true, group: 'Race', hint: 'Live race situation at a glance' },
{ to: '/telemetry', label: 'Live Telemetry', code: 'TLM', icon: Activity, ready: true, group: 'Race', hint: 'Channel traces, track replay and corner analysis' },
{ to: '/strategy', label: 'Race Strategy', code: 'STR', icon: Target, ready: true, group: 'Race', hint: 'Pit simulation, undercut lab and contingencies' },
{ to: '/voice', label: 'Ollie', code: 'OLI', icon: Radio, ready: true, group: 'Race', hint: 'Your AI race engineer on the radio channel' },

{ to: '/analytics', label: 'Driver Analytics', code: 'ANA', icon: LineChart, ready: true, group: 'Analysis', hint: 'Driver benchmarking and coaching' },
{ to: '/insights', label: 'AI Insights', code: 'AIX', icon: BrainCircuit, ready: true, group: 'Analysis', hint: 'Ranked predictions and model telemetry' },
{ to: '/history', label: 'Session History', code: 'HST', icon: History, ready: true, group: 'Analysis', hint: 'Archive of every recorded session' },

{ to: '/setups', label: 'Setup Library', code: 'SET', icon: Wrench, ready: true, group: 'Garage', hint: 'Car setups by game, circuit and session' },
{ to: '/reports', label: 'Reports', code: 'RPT', icon: FileBarChart, ready: true, group: 'Garage', hint: 'Compose and distribute engineering reports' },
{ to: '/settings', label: 'Settings', code: 'CFG', icon: Settings, ready: true, group: 'Garage', hint: 'Workspace, AI autonomy and interface options' }];


const groups = ['Race', 'Analysis', 'Garage'];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className={`relative z-20 hidden shrink-0 flex-col border-r border-white/[0.06] bg-[#080A0D] transition-[width] duration-300 ease-out md:flex ${
      collapsed ? 'w-[68px]' : 'w-[222px]'}`
      }>
      
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-4">
        <div className="relative grid h-7 w-7 shrink-0 place-items-center rounded-md bg-f1-red shadow-[0_0_18px_-4px_#E10600]">
          <span className="font-mono text-[11px] font-bold text-white">R</span>
          <span className="absolute inset-0 rounded-md ring-1 ring-white/20" />
        </div>
        {!collapsed &&
        <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-none tracking-tight text-f1-white">
              RaceMind <span className="text-f1-cyan">AI</span>
            </p>
            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/60">Race Engineer OS</p>
          </div>
        }
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3">
        {groups.map((group, gi) =>
        <div key={group} className={gi > 0 ? 'mt-4' : ''}>
            {!collapsed ?
          <p className="px-2 pb-2 font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/40">{group}</p> :

          gi > 0 && <div className="mx-2 mb-2 h-px bg-white/[0.06]" />
          }
            <ul className="space-y-0.5">
              {navItems.
            filter((n) => n.group === group).
            map((item) => {
              const Icon = item.icon;
              if (!item.ready) {
                return (
                  <li key={item.to}>
                        <div
                      className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 opacity-40"
                      title={`${item.label} — module queued for deployment`}>
                      
                          <Icon className="h-[15px] w-[15px] shrink-0 text-silver" strokeWidth={1.6} />
                          {!collapsed &&
                      <>
                              <span className="flex-1 truncate text-[12.5px] text-silver">{item.label}</span>
                              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-silver/70">soon</span>
                            </>
                      }
                        </div>
                      </li>);

              }
              return (
                <li key={item.to}>
                      <NavLink
                    to={item.to}
                    title={collapsed ? `${item.label} — ${item.hint}` : item.hint}
                    className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                    isActive ?
                    'bg-white/[0.06] text-f1-white' :
                    'text-silver hover:bg-white/[0.035] hover:text-f1-white'}`

                    }>
                    
                        {({ isActive }) =>
                    <>
                            {isActive &&
                      <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-f1-red shadow-[0_0_10px_#E10600]" />
                      }
                            <Icon
                        className={`h-[15px] w-[15px] shrink-0 ${isActive ? 'text-f1-cyan' : ''}`}
                        strokeWidth={1.6} />
                      
                            {!collapsed &&
                      <>
                                <span className="flex-1 truncate text-[12.5px] font-medium">{item.label}</span>
                                <span className="font-mono text-[8px] tracking-[0.14em] text-silver/40">{item.code}</span>
                              </>
                      }
                          </>
                    }
                      </NavLink>
                    </li>);

            })}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] p-2.5">
        {!collapsed &&
        <div className="mb-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/60">Uplink</span>
              <span className="flex items-center gap-1 font-mono text-[8.5px] text-f1-green">
                <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-f1-green" />
                LIVE
              </span>
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <span className="font-mono text-[15px] font-semibold text-f1-white tabular">
                12<span className="text-[9px] text-silver">ms</span>
              </span>
              <div className="flex h-4 items-end gap-[2px]">
                {[3, 6, 4, 9, 7, 11, 8].map((h, i) =>
              <span key={i} className="w-[2px] rounded-sm bg-f1-cyan/70" style={{ height: h }} />
              )}
              </div>
            </div>
          </div>
        }
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] py-1.5 text-silver transition-colors hover:border-white/[0.12] hover:text-f1-white">
          
          <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="font-mono text-[9.5px] uppercase tracking-[0.16em]">Collapse</span>}
        </button>
      </div>
    </nav>);

}

/** Mobile bottom navigation — the sidebar is hidden below the md breakpoint. */
export function MobileNav() {
  const primary = navItems.filter((n) => n.ready).slice(0, 5);
  return (
    <nav
      aria-label="Primary mobile"
      className="flex shrink-0 items-stretch justify-between border-t border-white/[0.07] bg-[#080A0D] px-1 md:hidden">
      
      {primary.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 transition-colors ${
            isActive ? 'text-f1-cyan' : 'text-silver/70'}`

            }>
            
            <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
            <span className="font-mono text-[8px] uppercase tracking-[0.12em]">{item.code}</span>
          </NavLink>);

      })}
    </nav>);

}