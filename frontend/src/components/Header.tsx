import React from 'react';
import { Sparkles, BookOpen, History, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: 'console' | 'policies' | 'audit';
  setActiveTab: (tab: 'console' | 'policies' | 'audit') => void;
  systemHealth: {
    connected: boolean;
    provider: string;
    model: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, systemHealth }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-wrapper">
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 className="brand-title">ResolvAI</h1>
              <span className="brand-badge">Vision Vertex Hackathon</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              AI Customer Support Resolution Agent • Internal Officer Copilot
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div className="health-pill" title={`Connected to ${systemHealth.provider} (${systemHealth.model})`}>
            <span className="health-dot" style={{ backgroundColor: systemHealth.connected ? '#10b981' : '#ef4444' }} />
            <span>{systemHealth.connected ? 'API Online' : 'API Offline'}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>• {systemHealth.provider}</span>
          </div>

          <nav className="nav-tabs">
            <button
              className={`nav-btn ${activeTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveTab('console')}
            >
              <Cpu size={15} />
              <span>Investigation Console</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'policies' ? 'active' : ''}`}
              onClick={() => setActiveTab('policies')}
            >
              <BookOpen size={15} />
              <span>Policies Explorer</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <History size={15} />
              <span>Saved Updates</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
