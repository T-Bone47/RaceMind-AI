
import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SetupContextBar } from '../components/setup/SetupContextBar';
import { SessionTypeBar } from '../components/setup/SessionTypeBar';
import { GameShelf } from '../components/setup/GameShelf';
import { CircuitBrowser } from '../components/setup/CircuitBrowser';
import { SetupCategory } from '../components/setup/SetupCategory';
import { SuspensionVisual } from '../components/setup/SuspensionVisual';
import { AIRecommendation } from '../components/setup/AIRecommendation';
import { SetupComparison } from '../components/setup/SetupComparison';
import { PerformanceAnalysis } from '../components/setup/PerformanceAnalysis';
import { CircuitIntelligence } from '../components/setup/CircuitIntelligence';
import { DocumentLibrary } from '../components/setup/DocumentLibrary';
import { AIAssistantPanel } from '../components/setup/AIAssistantPanel';
import {
  baseSetup,
  circuits,
  documents,
  games,
  paramGroups,
  setupSources,
  type SessionKind,
  type SetupSource,
  type SetupValues,
  type WeatherKind
} from '../data/setups';
import { SetupNotes } from '../components/setup/SetupNotes';
import { useCircuitSetups, mapBackendToSetupValues } from '../lib/api/setups';
import { aiSetupFor, scoreSetup } from '../utils/setupScore';
import { useScreenInit } from '../useScreenInit';

export function SetupLibrary() {
  const screenInit = useScreenInit<{ tab: string }>();
  const [gameId, setGameId] = useState(games[0]!.id);
  const [circuitId, setCircuitId] = useState(circuits[0]!.id);
  const [session, setSession] = useState<SessionKind>('Race');
  const [weather, setWeather] = useState<WeatherKind>('Dry');
  const [tab, setTab] = useState(screenInit.tab ?? 'setup');
  const [values, setValues] = useState<SetupValues>(baseSetup);
  const [savedValues, setSavedValues] = useState<SetupValues>(baseSetup);
  const [favourite, setFavourite] = useState(true);
  const [docId, setDocId] = useState(documents[0]!.id);

  const game = games.find((g) => g.id === gameId) ?? games[0]!;
  const circuit = circuits.find((c) => c.id === circuitId) ?? circuits[0]!;

  const recommended = useMemo(() => aiSetupFor(baseSetup, circuit), [circuit]);
  const score = useMemo(() => scoreSetup(values, circuit), [values, circuit]);
  const baselineScore = useMemo(() => scoreSetup(savedValues, circuit), [savedValues, circuit]);

  const { data: apiSetups } = useCircuitSetups(circuit.country);

  const combinedSources = useMemo(() => {
    const dbSources: SetupSource[] = (apiSetups || []).map(setup => ({
      id: `db-${setup.id}`,
      label: setup.session_type || 'Saved Setup',
      author: 'Database',
      tag: 'Imported',
      color: '#FF7A29',
      values: mapBackendToSetupValues(setup),
    }));
    return [...setupSources, ...dbSources];
  }, [apiSetups]);

  const dirty = useMemo(
    () => (Object.keys(values) as (keyof SetupValues)[]).some((k) => values[k] !== savedValues[k]),
    [values, savedValues]
  );

  const setParam = useCallback((key: keyof SetupValues, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetGroup = useCallback(
    (keys: (keyof SetupValues)[]) => {
      setValues((prev) => {
        const next = { ...prev };
        keys.forEach((k) => {
          (next[k] as never) = savedValues[k] as never;
        });
        return next;
      });
    },
    [savedValues]
  );

  return (
    <div className="mx-auto w-full max-w-[2100px] space-y-2 p-2 xl:p-3">
      <SetupContextBar
        game={game}
        circuit={circuit}
        weather={weather}
        onGame={setGameId}
        onCircuit={setCircuitId}
        onWeather={setWeather}
        dirty={dirty}
        onSave={() => setSavedValues(values)}
        onApplyAI={() => setValues(recommended)}
        favourite={favourite}
        onToggleFavourite={() => setFavourite((f) => !f)} />
      

      <SessionTypeBar value={session} onChange={setSession} tab={tab} onTab={setTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2">
          
          {tab === 'library' &&
          <>
              <GameShelf selected={gameId} onSelect={setGameId} />
              <CircuitBrowser selected={circuitId} onSelect={setCircuitId} />
            </>
          }

          {tab === 'setup' &&
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
              <div className="grid gap-2 md:grid-cols-2 xl:col-span-8">
                {paramGroups.map((g) =>
              <SetupCategory
                key={g.id}
                title={g.title}
                accent={g.accent}
                hint={g.hint}
                params={g.params}
                values={values}
                reference={recommended}
                onChange={setParam}
                onResetGroup={() => resetGroup(g.params.map((p) => p.key))}>
                
                    {g.id === 'suspension' && <SuspensionVisual values={values} />}
                  </SetupCategory>
              )}
                <div className="md:col-span-2">
                  <SetupComparison current={values} circuit={circuit} sources={combinedSources} onLoad={setValues} />
                </div>
              </div>

              <div className="xl:col-span-4">
                <div className="xl:sticky xl:top-3">
                  <AIRecommendation
                    score={score}
                    circuit={circuit}
                    session={session}
                    weather={weather}
                    onApply={() => setValues(recommended)} />
                  <SetupNotes values={values} />
                </div>
              </div>
            </div>
          }

          {tab === 'analysis' &&
          <>
              <PerformanceAnalysis score={score} reference={baselineScore} />
              <CircuitIntelligence circuit={circuit} />
            </>
          }

          {tab === 'documents' &&
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <DocumentLibrary selectedId={docId} onSelect={setDocId} />
              </div>
              <div className="xl:col-span-4">
                <div className="h-[720px] xl:sticky xl:top-3">
                  <AIAssistantPanel documentId={docId} />
                </div>
              </div>
            </div>
          }
        </motion.div>
      </AnimatePresence>

      <p className="pb-2 pt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-silver/25">
        RaceMind AI · Car setup library · {game.name} · {circuit.code} · {session}
      </p>
    </div>);

}
