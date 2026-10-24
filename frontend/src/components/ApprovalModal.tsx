import React, { useState } from 'react';
import { ShieldCheck, X, Database, Loader2 } from 'lucide-react';
import type { Ticket, TicketCategory, TicketStatus } from '../types';

interface ApprovalModalProps {
  ticket: Ticket;
  proposal: {
    category: TicketCategory;
    next_status: TicketStatus;
    response_draft: string;
    policy_ids: string[];
  };
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  ticket,
  proposal,
  onConfirm,
  onClose,
  isLoading
}) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                Explicit Human Approval
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Commit resolution to persistent Cloudflare D1 database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Audit Details Card */}
        <div style={{
          background: 'rgba(11, 15, 25, 0.75)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1rem',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Target Ticket:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>
              {ticket.id} — {ticket.customer_name}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status Transition:</span>
            <span>
              <span className="badge badge-open">{ticket.status}</span>
              <span style={{ margin: '0 0.5rem', color: 'var(--text-dim)' }}>➔</span>
              <span className="badge badge-resolved" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
                {proposal.next_status}
              </span>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Category:</span>
            <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{proposal.category}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Evidence Policies:</span>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {proposal.policy_ids.length > 0 ? (
                proposal.policy_ids.map(p => (
                  <span key={p} className="badge badge-category" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {p}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>None (Escalated case)</span>
              )}
            </div>
          </div>
        </div>

        {/* Draft Snippet */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderLeft: '3px solid var(--primary)',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          maxHeight: '90px',
          overflowY: 'auto',
          fontStyle: 'italic'
        }}>
          "{proposal.response_draft.slice(0, 240)}..."
        </div>

        {/* Explicit Checkbox Confirmation */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          <input
            type="checkbox"
            id="officer_confirmation"
            checked={hasConfirmed}
            onChange={(e) => setHasConfirmed(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--primary)', marginTop: 2, cursor: 'pointer' }}
          />
          <label htmlFor="officer_confirmation" style={{ fontSize: '0.8rem', color: '#f3f4f6', cursor: 'pointer', lineHeight: 1.4 }}>
            I confirm that I am an authorized support officer. I have reviewed the customer's request and verify this resolution complies with policy.
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="nav-btn"
            style={{ border: '1px solid var(--border-color)', padding: '0.55rem 1rem' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasConfirmed || isLoading}
            className="btn-primary"
            style={{ padding: '0.55rem 1.25rem' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Committing to D1...</span>
              </>
            ) : (
              <>
                <Database size={15} />
                <span>Authorize & Commit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
