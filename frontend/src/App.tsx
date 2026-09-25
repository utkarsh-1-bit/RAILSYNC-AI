import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TrainsPage from './pages/TrainsPage';
import StationsPage from './pages/StationsPage';
import SchedulesPage from './pages/SchedulesPage';
import OptimizationPage from './pages/OptimizationPage';
import BlockPlanningPage from './pages/BlockPlanningPage';
import BlockRequestsPage from './pages/BlockRequestsPage';
import WhatIfPage from './pages/WhatIfPage';
import ApprovalsPage from './pages/ApprovalsPage';
import MapPage from './pages/MapPage';
import { BlockProvider } from './context/BlockContext';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/trains': 'Train Fleet',
  '/stations': 'Stations',
  '/schedules': 'Timetable',
  '/optimize': 'Optimization Engine',
  '/block-planning': 'Block Planning Analyzer',
  '/requests': 'Block Requests',
  '/what-if': 'What-If Simulation',
  '/approvals': 'Approvals',
  '/map': 'Railway Map',
};

function AppShell() {
  const path = window.location.pathname;
  const pageTitle = pageTitles[path] || 'RAILSYNC AI';
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-header">
          <div className="top-header-title">{pageTitle}</div>
          <div className="top-header-actions">
            <button onClick={toggleTheme} className="btn btn-ghost" style={{ fontSize: '1.2rem', padding: '0.2rem 0.5rem'}}>
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            <input
              type="text"
              className="header-search"
              placeholder="Search trains, stations…"
            />
          </div>
        </header>
        <main className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trains" element={<TrainsPage />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/optimize" element={<OptimizationPage />} />
            <Route path="/block-planning" element={<BlockPlanningPage />} />
            <Route path="/requests" element={<BlockRequestsPage />} />
            <Route path="/what-if" element={<WhatIfPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BlockProvider>
        <AppShell />
      </BlockProvider>
    </BrowserRouter>
  );
}
}
