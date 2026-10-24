import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { StatusBadge } from '../tickets/StatusBadge';
import { Copy, Check, ExternalLink, Calendar, User, ShieldCheck, Tag } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const OutboxDetailModal = ({ isOpen, onClose, record, onReopenInInbox }) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const ticketId = record.id || record.ticket_id || 'TICK-000';
  const customerName = record.customer_name || record.customer?.name || record.user || 'Customer';
  const customerEmail = record.customer_email || record.customer?.email || '';
  const status = record.status || record.approved_status || 'approved';
  const category = record.category || 'Customer Resolution';
  const responseText = record.final_response || record.response_draft || record.response || record.message || 'No response text stored.';
  const officerNotes = record.officer_notes || record.notes || 'None';
  const approvedAt = record.approved_at || record.updated_at || record.created_at;
  const formattedDate = approvedAt ? new Date(approvedAt).toLocaleString() : 'Recently';

  const handleCopy = () => {
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    toast.success('Response copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose}>
        Close
      </Button>
      <Button
        variant="secondary"
        icon={copied ? <Check size={14} /> : <Copy size={14} />}
        onClick={handleCopy}
      >
        {copied ? 'Copied' : 'Copy Response'}
      </Button>
      {onReopenInInbox && (
        <Button
          variant="primary"
          icon={<ExternalLink size={14} />}
          onClick={() => {
            onClose();
            onReopenInInbox(ticketId);
          }}
        >
          Open Ticket in Workspace
        </Button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Saved Outbox Record: ${ticketId}`}
      footer={footer}
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Meta summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--butter-50)',
            border: '1px solid var(--butter-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div>
            <span className="meta-label">Ticket Identifier</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {ticketId}
            </div>
          </div>

          <div>
            <span className="meta-label">Customer</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {customerName}
            </div>
            {customerEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customerEmail}</div>}
          </div>

          <div>
            <span className="meta-label">Final Status</span>
            <div style={{ marginTop: '0.2rem' }}>
              <StatusBadge status={status} />
            </div>
          </div>

          <div>
            <span className="meta-label">Finalized Timestamp</span>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <Calendar size={13} color="var(--text-muted)" />
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Approved Customer Response */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Approved Customer Communication:
            </span>
            <span className="code-pill">Category: {category}</span>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {responseText}
          </div>
        </div>

        {/* Internal Officer Notes */}
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
            Internal Officer Resolution Audit Notes:
          </span>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            {officerNotes}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OutboxDetailModal;
