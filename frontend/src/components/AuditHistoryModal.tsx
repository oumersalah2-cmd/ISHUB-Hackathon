import React, { useState } from 'react';
import { History, Eye, X, ArrowRight } from 'lucide-react';
import type { TicketUpdate } from '../types';

interface AuditHistoryModalProps {
  updates: TicketUpdate[];
  onClose: () => void;
  onSelectTicket?: (ticketId: string) => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  updates,
  onClose,
  onSelectTicket
}) => {
  const [selectedUpdate, setSelectedUpdate] = useState<TicketUpdate | null>(updates[0] || null);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
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
              <History size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                Saved Updates Audit Trail
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Persistent history of approved customer support resolutions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
          {/* Left: Updates List */}
          <div style={{ overflowY: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '0.75rem' }}>
            {updates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                No updates saved in this session yet. Approve a resolution to create an audit record.
              </div>
            ) : (
              updates.map(update => {
                const isSelected = selectedUpdate?.id === update.id;

                return (
                  <div
                    key={update.id}
                    onClick={() => setSelectedUpdate(update)}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(26, 34, 52, 0.4)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc' }}>
                        Update #{update.id} • {update.ticket_id}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>
                      {update.customer_name || 'Customer'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
                      <span className="badge badge-open">{update.previous_status}</span>
                      <ArrowRight size={11} color="var(--text-dim)" />
                      <span className="badge badge-resolved">{update.proposed_status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Reopened Update Inspection */}
          <div style={{ overflowY: 'auto', paddingLeft: '0.5rem' }}>
            {selectedUpdate ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      RECORD ID: #{selectedUpdate.id} • TICKET {selectedUpdate.ticket_id}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                      {selectedUpdate.subject || 'Customer Support Resolution'}
                    </h3>
                  </div>

                  {onSelectTicket && (
                    <button
                      onClick={() => {
                        onSelectTicket(selectedUpdate.ticket_id);
                        onClose();
                      }}
                      className="nav-btn"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', border: '1px solid var(--border-color)' }}
                    >
                      <Eye size={13} /> Open Ticket
                    </button>
                  )}
                </div>

                <div style={{
                  background: 'rgba(11, 15, 25, 0.6)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                    <span style={{ color: '#fff' }}>{selectedUpdate.customer_name || 'N/A'} ({selectedUpdate.customer_email || 'N/A'})</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Approved Category:</span>
                    <span style={{ color: '#e5e7eb' }}>{selectedUpdate.approved_category}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Transition:</span>
                    <span>{selectedUpdate.previous_status} ➔ {selectedUpdate.proposed_status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Policy Evidence:</span>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {selectedUpdate.evidence_policy_ids.map(p => (
                        <span key={p} className="badge badge-category" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Approved Customer Response Draft:
                  </h4>
                  <div style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: '#f9fafb',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedUpdate.response_draft}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                Select an update on the left to reopen and inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
