import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import InvestigationPage from './pages/InvestigationPage';
import OutboxPage from './pages/OutboxPage';
import NotFoundPage from './pages/NotFoundPage';
import { ToastProvider } from './context/ToastContext';
import { ApiConfigProvider } from './context/ApiConfigContext';

function App() {
  return (
    <ToastProvider>
      <ApiConfigProvider>
        <Routes>
          {/* Public Platform Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Internal Operator CSR Platform (with Persistent Sidebar) */}
          <Route element={<Layout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="app" element={<Navigate to="/dashboard" replace />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="inbox/:ticketId" element={<InvestigationPage />} />
            <Route path="outbox" element={<OutboxPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ApiConfigProvider>
    </ToastProvider>
  );
}

export default App;
