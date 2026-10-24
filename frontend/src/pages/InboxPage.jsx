import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketFilterBar from '../components/tickets/TicketFilterBar';
import TicketTable from '../components/tickets/TicketTable';
import NewTicketModal from '../components/tickets/NewTicketModal';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useApiConfig } from '../context/ApiConfigContext';
import { AlertCircle, RefreshCw, PlusCircle, Bot, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';

const InboxPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { status: apiStatus, baseUrl, setIsConfigModalOpen } = useApiConfig();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch AI configuration status for judges
  useEffect(() => {
    api.checkHealth().then((res) => {
      if (res.ok && res.data?.ai) {
        setAiStatus(res.data.ai);
      }
    }).catch(() => {});
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTickets({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
      });

      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tickets from API:', err);
      const msg = err.isNetworkError
        ? `Could not reach backend at ${baseUrl}. Click "Configure Backend URL" to connect to your live API.`
        : err.message || 'Failed to retrieve tickets from the backend.';
      setError(msg);
      toast.error(msg, 'Ticket Fetch Error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery, baseUrl, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleInvestigate = (ticketId) => {
    navigate(`/inbox/${ticketId}`);
  };

  // Client-side filtering fallback if backend doesn't filter search
  const displayedTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const id = (t.id || t.ticket_id || '').toLowerCase();
    const subject = (t.subject || t.title || '').toLowerCase();
    const customer = (t.customer_name || t.customer?.name || t.user || '').toLowerCase();
    return id.includes(q) || subject.includes(q) || customer.includes(q);
  });

  return (
    <div>
      {/* Header bar / Title description */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Support Ticket Inbox
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Select any customer ticket below to trigger an AI agent investigation, clarify requirements, or review response proposals.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {aiStatus && (
            <div
              id="ai-status-indicator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
              }}
              title={`Agent provider: ${aiStatus.provider}, model: ${aiStatus.model}`}
            >
              <Bot size={14} color="#2563EB" />
              <span>AI: {aiStatus.provider} ({aiStatus.model})</span>
            </div>
          )}
          <Button
            id="btn-new-ticket"
            variant="primary"
            onClick={() => setIsNewTicketOpen(true)}
            icon={<PlusCircle size={16} />}
          >
            New Ticket
          </Button>
        </div>
      </div>

      {/* Backend connection warning if error */}
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
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '240px' }}>
            <AlertCircle size={20} color="#991B1B" />
            <span style={{ fontSize: '0.875rem', color: '#991B1B', fontWeight: 600 }}>
              {error}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => setIsConfigModalOpen(true)}>
              Configure Backend URL
            </Button>
            <Button variant="outline" size="sm" onClick={fetchTickets}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <TicketFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        onRefresh={fetchTickets}
        loading={loading}
        totalCount={displayedTickets.length}
      />

      {/* Ticket Table */}
      <TicketTable
        tickets={displayedTickets}
        loading={loading}
        onInvestigate={handleInvestigate}
        onRefresh={fetchTickets}
      />

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onTicketCreated={fetchTickets}
      />
    </div>
  );
};

export default InboxPage;
