import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useToast } from '../../context/ToastContext';
import { Server, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const ApiConfigModal = () => {
  const {
    baseUrl,
    status,
    errorMessage,
    lastChecked,
    checkConnectivity,
    updateBaseUrl,
    resetToDefault,
    isConfigModalOpen,
    setIsConfigModalOpen,
  } = useApiConfig();

  const toast = useToast();
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [testing, setTesting] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateBaseUrl(inputUrl);
    toast.success('API Base URL updated and tested.');
  };

  const handleTest = async () => {
    setTesting(true);
    await checkConnectivity();
    setTesting(false);
  };

  const handleReset = () => {
    resetToDefault();
    setInputUrl(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8787/api');
    toast.info('Reset API URL to default environment setting.');
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={() => setIsConfigModalOpen(false)}>
        Close
      </Button>
      <Button
        variant="secondary"
        icon={<RefreshCw size={14} className={testing ? 'spinner' : ''} />}
        onClick={handleTest}
        loading={testing}
      >
        Test Connection
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save & Apply
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isConfigModalOpen}
      onClose={() => setIsConfigModalOpen(false)}
      title="Backend API Configuration & Health"
      footer={footer}
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Status card */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: status === 'online' ? '#DCFCE7' : status === 'offline' ? '#FEE2E2' : 'var(--butter-100)',
            border: `1px solid ${status === 'online' ? '#BBF7D0' : status === 'offline' ? '#FECACA' : 'var(--butter-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {status === 'online' ? (
            <CheckCircle size={24} color="#166534" />
          ) : status === 'offline' ? (
            <AlertCircle size={24} color="#991B1B" />
          ) : (
            <RefreshCw size={24} className="spinner" color="#8C533C" />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Backend Status:{' '}
              {status === 'online' ? 'Connected & Healthy' : status === 'offline' ? 'Unreachable / Offline' : 'Checking connection...'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {status === 'online'
                ? `Successfully connected to ${baseUrl}`
                : errorMessage || 'Verify that the backend API server is started and accepting requests.'}
            </div>
            {lastChecked && (
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* URL Form */}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="api-base-url-input">
              <span>Backend API Base URL</span>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Reset to .env default
              </button>
            </label>
            <input
              id="api-base-url-input"
              type="text"
              className="form-input"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. http://localhost:8000/api"
            />
            <span className="form-hint">
              Loaded from <code>VITE_API_BASE_URL</code>. All tickets, AI investigation, clarification, and outbox calls use this prefix.
            </span>
          </div>
        </form>

        {/* Expected Endpoints Guide */}
        <div style={{ marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Expected Functional Backend Routes:
          </h4>
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div>
              <code style={{ color: 'var(--text-primary)', fontWeight: 700 }}>GET /tickets</code> — List inbox tickets
            </div>
            <div>
              <code style={{ color: 'var(--text-primary)', fontWeight: 700 }}>POST /tickets/:id/investigate</code> (or <code>/investigate</code>) — AI agent investigation
            </div>
            <div>
              <code style={{ color: 'var(--text-primary)', fontWeight: 700 }}>POST /tickets/:id/clarify</code> (or <code>/clarify</code>) — Submit missing details
            </div>
            <div>
              <code style={{ color: 'var(--text-primary)', fontWeight: 700 }}>POST /tickets/:id/approve</code> (or <code>/approve</code>) — Submit human approval
            </div>
            <div>
              <code style={{ color: 'var(--text-primary)', fontWeight: 700 }}>GET /outbox</code> — Saved resolved records
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApiConfigModal;
