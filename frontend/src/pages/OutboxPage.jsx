import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OutboxTable from '../components/outbox/OutboxTable';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useApiConfig } from '../context/ApiConfigContext';
import { AlertCircle, Send } from 'lucide-react';
import Button from '../components/common/Button';

const OutboxPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { baseUrl } = useApiConfig();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOutbox = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOutbox();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load outbox records:', err);
      const msg = err.isNetworkError
        ? `Could not reach backend API at ${baseUrl}. Please ensure the server is online.`
        : err.message || 'Unable to load outbox records.';
      setError(msg);
      toast.error(msg, 'Outbox Fetch Error');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, toast]);

  useEffect(() => {
    fetchOutbox();
  }, [fetchOutbox]);

  const handleReopenInWorkspace = (ticketId) => {
    navigate(`/inbox/${ticketId}`);
  };

  return (
    <div>
      {/* Header Description */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Internal Outbox & Saved Records
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Archived records of all customer support resolutions, approved communication drafts, and finalized statuses.
        </p>
      </div>

      {/* Error alert if any */}
      {error && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} color="#991B1B" />
            <span style={{ fontSize: '0.875rem', color: '#991B1B', fontWeight: 600 }}>
              {error}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOutbox}>
            Retry Request
          </Button>
        </div>
      )}

      {/* Outbox Table & Details */}
      <OutboxTable
        records={records}
        loading={loading}
        onRefresh={fetchOutbox}
        onReopenTicket={handleReopenInWorkspace}
      />
    </div>
  );
};

export default OutboxPage;
