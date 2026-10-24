import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Home, ExternalLink } from 'lucide-react';
import { useApiConfig } from '../../context/ApiConfigContext';

const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { status, baseUrl, setIsConfigModalOpen } = useApiConfig();

  // Determine current page title
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Operator Dashboard', breadcrumb: 'Platform / Overview' };
    if (path === '/inbox') return { title: 'Ticket Inbox Queue', breadcrumb: 'Platform / Support Queue' };
    if (path.startsWith('/inbox/')) return { title: 'Investigation & Approval', breadcrumb: 'Platform / Workspace' };
    if (path === '/outbox') return { title: 'Internal Outbox Archive', breadcrumb: 'Platform / Approved Records' };
    return { title: 'Operator Platform', breadcrumb: 'Platform' };
  };

  const { title, breadcrumb } = getPageInfo();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="header-title-container">
          <div className="header-breadcrumb">{breadcrumb}</div>
          <h1 className="header-page-title">{title}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Quick link back to landing page */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '0.8125rem' }}
          onClick={() => navigate('/')}
          title="Return to the public marketing landing page"
        >
          <Home size={14} />
          <span>Public Website</span>
        </button>

        {/* API Status Pill */}
        <button
          type="button"
          className="api-status-pill"
          onClick={() => setIsConfigModalOpen(true)}
          title={`Backend: ${baseUrl} (${status})`}
        >
          <span className={`api-status-dot ${status}`} />
          <span>API: {status === 'online' ? 'Connected' : status === 'offline' ? 'Offline' : 'Connecting'}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
