import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

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
