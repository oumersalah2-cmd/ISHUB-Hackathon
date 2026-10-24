import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Send,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useApiConfig } from '../../context/ApiConfigContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { setIsConfigModalOpen, status } = useApiConfig();
  const navigate = useNavigate();

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <img
          src={logoImg}
          alt="LUCY CSR Fossil Headset Logo"
          className="brand-logo-img"
          onError={(e) => {
            e.currentTarget.src = '/logo.png';
          }}
        />
        <div className="brand-info">
          <div className="brand-title">
            LUCY <span>CSR</span>
          </div>
          <div className="brand-subtitle">Operator Platform</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">CSR Workspace</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard className="nav-icon" />
          <span>Operator Dashboard</span>
        </NavLink>

        <NavLink
          to="/inbox"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Inbox className="nav-icon" />
          <span>Ticket Inbox</span>
        </NavLink>

        <NavLink
          to="/outbox"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Send className="nav-icon" />
          <span>Internal Outbox</span>
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>
          System & Settings
        </div>

        <button
          type="button"
          className="nav-link"
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => {
            setIsConfigModalOpen(true);
            if (onClose) onClose();
          }}
        >
          <Settings className="nav-icon" />
          <span>API Connection</span>
          <span
            style={{
              marginLeft: 'auto',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: status === 'online' ? '#16A34A' : status === 'offline' ? '#DC2626' : '#D97706',
            }}
          />
        </button>

        <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>
          Portal Navigation
        </div>

        <button
          type="button"
          className="nav-link"
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          onClick={() => {
            if (onClose) onClose();
            navigate('/');
          }}
          title="Return to the public marketing landing page"
        >
          <ExternalLink className="nav-icon" size={16} />
          <span>Exit to Public Site</span>
        </button>
      </nav>

      {/* Support Officer Profile Pill */}
      <div className="sidebar-footer">
        <div className="officer-profile">
          <div className="officer-avatar">CS</div>
          <div className="officer-meta">
            <span className="officer-name">Support Officer</span>
            <span className="officer-role">Online • Active Session</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
