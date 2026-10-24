import React, { useState } from 'react';
import { Search, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import type { Ticket } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  isLoading,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filtered = tickets.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open': return 'badge-open';
      case 'Pending Customer': return 'badge-pending';
      case 'Resolved': return 'badge-resolved';
      case 'Escalated': return 'badge-escalated';
      default: return 'badge-open';
    }
  };

  return (
    <div className="glass-panel" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="panel-header">
        <span className="panel-title">
          <Filter size={16} /> Demo Tickets ({tickets.length})
        </span>
        <button
          onClick={onRefresh}
          className="nav-btn"
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          title="Reload tickets"
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-dim)' }} />
        <input
          type="text"
          placeholder="Filter by ID, customer, subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-text"
          style={{ paddingLeft: '2rem', width: '100%' }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', marginBottom: '0.75rem', paddingBottom: '0.25rem' }}>
        {['ALL', 'Refund', 'Delivery', 'Account Access', 'Other'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              background: categoryFilter === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: categoryFilter === cat ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ticket Cards */}
      <div className="ticket-list">
        {filtered.map(ticket => {
          const isSelected = selectedTicket?.id === ticket.id;
          const isMissingDate = (ticket.category === 'Refund' || ticket.subject.toLowerCase().includes('refund')) && !ticket.purchase_date;

          return (
            <div
              key={ticket.id}
              className={`ticket-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectTicket(ticket)}
            >
              <div className="ticket-card-header">
                <span className="ticket-id">{ticket.id}</span>
                <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>

              <div className="ticket-customer">{ticket.customer_name}</div>
              <div className="ticket-subject">{ticket.subject}</div>

              <div className="ticket-card-footer">
                <span className="badge badge-category">{ticket.category}</span>
                {isMissingDate && (
                  <span className="badge badge-missing" title="Missing purchase date required by refund policy">
                    <AlertCircle size={10} /> Missing Date
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            No tickets match your query.
          </div>
        )}
      </div>
    </div>
  );
};
