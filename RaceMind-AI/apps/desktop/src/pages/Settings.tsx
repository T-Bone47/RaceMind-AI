// @ts-nocheck
import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SettingsNav } from '../components/settings/SettingsNav';
import { ProfileSection } from '../components/settings/ProfileSection';
import { IntelligenceSection } from '../components/settings/IntelligenceSection';
import { InterfaceSection } from '../components/settings/InterfaceSection';
import { SystemSection } from '../components/settings/SystemSection';
import { SaveBar } from '../components/settings/SaveBar';
import { defaultSettings, sections, type SectionId, type SettingsState } from '../data/settings';
import { useScreenInit } from '../useScreenInit.js';

export function Settings() {
  const screenInit = useScreenInit();
  const [active, setActive] = useState<SectionId>(screenInit.active as SectionId ?? 'profile');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [baseline, setBaseline] = useState<SettingsState>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const patch = useCallback((p: Partial<SettingsState>) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, ...p }));
  }, []);

  const changedCount = useMemo(
    () =>
    (Object.keys(settings) as (keyof SettingsState)[]).filter((k) => settings[k] !== baseline[k]).length,
    [settings, baseline]
  );

  const handleSave = () => {
    setBaseline(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  const currentSection = sections.find((s) => s.id === active);

  return (
    <div className="mx-auto w-full max-w-[1500px] p-3 xl:p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55">Workspace configuration</p>
          <h1 className="mt-1 text-[22px] font-semibold leading-none tracking-tight text-f1-white">Settings</h1>
        </div>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-silver/50">
          {currentSection?.hint} · changes apply to this workspace only
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-3">
          
          <div className="lg:sticky lg:top-3">
            <SettingsNav active={active} onSelect={setActive} />
          </div>
        </motion.div>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              
              {active === 'profile' && <ProfileSection settings={settings} onChange={patch} />}
              {active === 'intelligence' && <IntelligenceSection settings={settings} onChange={patch} />}
              {active === 'interface' && <InterfaceSection settings={settings} onChange={patch} />}
              {active === 'system' && <SystemSection settings={settings} onChange={patch} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SaveBar
        dirty={changedCount > 0}
        changedCount={changedCount}
        saved={saved}
        onSave={handleSave}
        onReset={() => setSettings(baseline)} />
      

      <p className="pb-2 pt-4 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Workspace configuration · synced across pit wall terminals
      </p>
    </div>);

}