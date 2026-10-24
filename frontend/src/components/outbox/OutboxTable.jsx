import React, { useState } from 'react';
import { StatusBadge } from '../tickets/StatusBadge';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { Send, Eye, Clock, Search, RefreshCw } from 'lucide-react';
import OutboxDetailModal from './OutboxDetailModal';

const OutboxTable = ({
  records = [],
  loading = false,
  onRefresh,
  onReopenTicket,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredRecords = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const id = (r.id || r.ticket_id || '').toLowerCase();
    const customer = (r.customer_name || r.customer?.name || r.user || '').toLowerCase();
    const response = (r.final_response || r.response_draft || r.response || '').toLowerCase();
    return id.includes(q) || customer.includes(q) || response.includes(q);
  });

  if (loading) {
    return (
      <div className="table-container">
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Skeleton width="100px" height="24px" />
              <Skeleton width="140px" height="20px" />
              <Skeleton width="300px" height="20px" />
              <Skeleton width="90px" height="24px" />
              <Skeleton width="100px" height="34px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <EmptyState
        icon={<Send size={32} />}
        title="No saved outbox records yet"
        description="When you investigate and approve resolutions for customer tickets, finalized records will be archived here."
        actionLabel="Refresh Outbox"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div>
      {/* Search Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group-left">
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Filter outbox by ticket ID, customer, or response..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group-right">
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
          </span>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} className={loading ? 'spinner' : ''} />}
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Approved Response Preview</th>
              <th>Status</th>
              <th>Saved Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No outbox records match "<strong>{search}</strong>"
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const ticketId = r.id || r.ticket_id || 'TICK-000';
                const customer = r.customer_name || r.customer?.name || r.user || 'Customer';
                const response = r.final_response || r.response_draft || r.response || r.message || '—';
                const status = r.status || r.approved_status || 'approved';
                const date = r.approved_at || r.updated_at || r.created_at;
                const formattedDate = date ? new Date(date).toLocaleDateString() : 'Recent';

                return (
                  <tr key={ticketId}>
                    <td>
                      <span className="ticket-id-tag">{ticketId}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer}</span>
                    </td>
                    <td>
                      <div className="outbox-response-preview" title={response}>
                        {response}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {formattedDate}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => setSelectedRecord(r)}
                      >
                        View Record
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <OutboxDetailModal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        onReopenInInbox={onReopenTicket}
      />
    </div>
  );
};

export default OutboxTable;
