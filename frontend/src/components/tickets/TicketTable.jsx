import React from 'react';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { Sparkles, ArrowRight, Clock, User, Inbox } from 'lucide-react';

const TicketTable = ({
  tickets = [],
  loading = false,
  onInvestigate,
  onRefresh,
}) => {
  if (loading) {
    return (
      <div className="table-container">
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Skeleton width="100px" height="24px" />
              <Skeleton width="220px" height="20px" />
              <Skeleton width="160px" height="20px" />
              <Skeleton width="90px" height="24px" />
              <Skeleton width="120px" height="34px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <EmptyState
        icon={<Inbox size={32} />}
        title="No support tickets found"
        description="There are currently no tickets matching your filter criteria in the queue."
        actionLabel="Refresh Tickets"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Subject / Query</th>
            <th>Customer</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Received</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const ticketId = t.id || t.ticket_id || 'TICK-000';
            const subject = t.subject || t.title || 'Untitled Support Request';
            const customerName = t.customer_name || t.customer?.name || t.user || 'Unknown Customer';
            const customerEmail = t.customer_email || t.customer?.email || '';
            const status = t.status || 'open';
            const priority = t.priority || 'medium';
            const createdAt = t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent';

            return (
              <tr key={ticketId}>
                <td>
                  <span className="ticket-id-tag">{ticketId}</span>
                </td>
                <td>
                  <div className="ticket-subject-cell" title={subject}>
                    {subject}
                  </div>
                </td>
                <td>
                  <div className="customer-cell">
                    <span className="customer-name">{customerName}</span>
                    {customerEmail && <span className="customer-email">{customerEmail}</span>}
                  </div>
                </td>
                <td>
                  <PriorityBadge priority={priority} />
                </td>
                <td>
                  <StatusBadge status={status} />
                </td>
                <td>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    {createdAt}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Sparkles size={14} />}
                    onClick={() => onInvestigate(ticketId)}
                  >
                    Investigate
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
