import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ShieldAlert, CheckCircle, Send, ArrowRight } from 'lucide-react';

const ApprovalConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  ticketId,
  customerName,
  status,
  category,
  responseDraft,
}) => {
  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={loading}>
        Cancel & Edit
      </Button>
      <Button
        variant="primary"
        icon={<CheckCircle size={16} />}
        onClick={onConfirm}
        loading={loading}
        title="Confirm and send final approval to backend"
      >
        Confirm & Save
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Final Resolution & Approval"
      footer={footer}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--butter-100)',
            border: '1px solid var(--butter-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <ShieldAlert size={20} color="var(--clay-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <strong>Human Officer Verification:</strong> You are about to finalize this support record and dispatch the approved customer communication. This update will be recorded in the Internal Outbox.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-app)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Ticket Identifier
            </span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {ticketId}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Customer
            </span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {customerName}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Target Status
            </span>
            <div style={{ fontWeight: 600, color: '#166534' }}>
              {status || 'Approved / Resolved'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Resolution Category
            </span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {category || 'Customer Resolution'}
            </div>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
            Finalized Response Draft (Preview):
          </span>
          <div
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              maxHeight: '160px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {responseDraft}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalConfirmModal;
