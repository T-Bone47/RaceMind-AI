import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Telemetry } from './pages/Telemetry';
import { Voice } from './pages/Voice';
import { Strategy } from './pages/Strategy';
import { Analytics } from './pages/Analytics';
import { Insights } from './pages/Insights';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { SetupLibrary } from './pages/SetupLibrary';
import { Reports } from './pages/Reports';

export function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>);

}