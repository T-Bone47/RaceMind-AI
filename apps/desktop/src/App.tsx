import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { useSessionStore } from './store/sessionStore';
import { apiClient } from './lib/api/client';
import { defaultSettings } from './data/settings';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Telemetry = lazy(() => import('./pages/Telemetry').then(m => ({ default: m.Telemetry })));
const Voice = lazy(() => import('./pages/Voice').then(m => ({ default: m.Voice })));
const Strategy = lazy(() => import('./pages/Strategy').then(m => ({ default: m.Strategy })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Insights = lazy(() => import('./pages/Insights').then(m => ({ default: m.Insights })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const SetupLibrary = lazy(() => import('./pages/SetupLibrary').then(m => ({ default: m.SetupLibrary })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-electric border-t-transparent" />
    </div>
  );
}

export function App() {
  useEffect(() => {
    // Connect to the generic live UDP session broadcasted by the backend
    useSessionStore.getState().connectWebSocket('00000000-0000-0000-0000-000000000000');
    
    // Push the locally stored Gemini API key to the backend
    const saved = localStorage.getItem('racemind_settings');
    const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    if (settings.geminiApiKey) {
        apiClient.post('/api/v1/settings/gemini-key', { api_key: settings.geminiApiKey })
          .catch(e => console.error("Failed to push gemini key", e));
    }

    return () => {
      useSessionStore.getState().disconnectWebSocket();
    };
  }, []);

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/history" element={<History />} />
          <Route path="/setups" element={<SetupLibrary />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
