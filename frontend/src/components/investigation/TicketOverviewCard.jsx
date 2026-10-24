import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { StatusBadge, PriorityBadge } from '../tickets/StatusBadge';
import { User, Mail, Calendar, Tag, FileText, Hash } from 'lucide-react';

const TicketOverviewCard = ({ ticket }) => {
  if (!ticket) return null;

  const ticketId = ticket.id || ticket.ticket_id || 'TICK-000';
  const subject = ticket.subject || ticket.title || 'Support Request';
  const customerName = ticket.customer_name || ticket.customer?.name || ticket.user || 'Unknown Customer';
  const customerEmail = ticket.customer_email || ticket.customer?.email || 'N/A';
  const status = ticket.status || 'open';
  const priority = ticket.priority || 'medium';
  const category = ticket.category || 'General Support';
  const channel = ticket.channel || 'Web Portal';
  const messageBody = ticket.description || ticket.message || ticket.body || ticket.content || 'No description provided.';
  const createdAt = ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Recent';

  return (
    <Card variant="default" className="ticket-detail-panel">
      <CardHeader>
        <CardTitle icon={<FileText size={18} color="var(--clay-500)" />}>
          Ticket Overview
        </CardTitle>
        <span className="ticket-id-tag">{ticketId}</span>
      </CardHeader>
      <CardBody>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {subject}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
            <span className="code-pill">{category}</span>
          </div>
        </div>

        <div>
          <label className="meta-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
            Customer Message:
          </label>
          <div className="ticket-body-box">
            {messageBody}
          </div>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <span className="meta-label">Customer Name</span>
            <span className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={13} color="var(--text-muted)" />
              {customerName}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Email Address</span>
            <span className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={13} color="var(--text-muted)" />
              {customerEmail}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Origin Channel</span>
            <span className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={13} color="var(--text-muted)" />
              {channel}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Received At</span>
            <span className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={13} color="var(--text-muted)" />
              {createdAt}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TicketOverviewCard;
