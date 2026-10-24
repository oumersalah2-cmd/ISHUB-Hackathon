import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, FileEdit, Bookmark } from 'lucide-react';
import type { AgentProposal, TicketCategory, TicketStatus } from '../types';

interface ResolutionEditorProps {
  proposal: AgentProposal;
  onOpenApprovalModal: (finalProposal: {
    category: TicketCategory;
    next_status: TicketStatus;
    response_draft: string;
    policy_ids: string[];
  }) => void;
  isLoading: boolean;
}

export const ResolutionEditor: React.FC<ResolutionEditorProps> = ({
  proposal,
  onOpenApprovalModal,
  isLoading
}) => {
  const [category, setCategory] = useState<TicketCategory>(proposal.category);
  const [nextStatus, setNextStatus] = useState<TicketStatus>(proposal.next_status);
  const [responseDraft, setResponseDraft] = useState<string>(proposal.response_draft);

  useEffect(() => {
    setCategory(proposal.category);
    setNextStatus(proposal.next_status);
    setResponseDraft(proposal.response_draft);
  }, [proposal]);

  const handleReviewClick = () => {
    onOpenApprovalModal({
      category,
      next_status: nextStatus,
      response_draft: responseDraft,
      policy_ids: proposal.policy_ids
    });
  };

  return (
    <div className="proposal-panel">
      <div className="proposal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} color="#818cf8" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            Policy-Grounded Resolution Proposal
          </h3>
        </div>
        <span className="proposal-tag">Human Review Required</span>
      </div>

      {/* Rationale & Policy Grounding */}
      <div className="reasoning-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: 600, color: '#a5b4fc' }}>
          <Bookmark size={14} />
          <span>Grounding & Policy Evidence</span>
        </div>
        <p style={{ lineHeight: 1.5 }}>{proposal.reasoning_summary}</p>
        
        {proposal.policy_ids.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Cited Policies:</span>
            {proposal.policy_ids.map(id => (
              <span key={id} className="badge badge-category" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {id}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Category and Status Inputs */}
      <div className="proposal-form-grid">
        <div className="form-group">
          <label htmlFor="approved_category">Approved Category</label>
          <select
            id="approved_category"
            className="select-input"
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
          >
            <option value="Refund">Refund</option>
            <option value="Delivery">Delivery</option>
            <option value="Account Access">Account Access</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="proposed_status">Proposed Next Status</label>
          <select
            id="proposed_status"
            className="select-input"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as TicketStatus)}
          >
            <option value="Open">Open</option>
            <option value="Pending Customer">Pending Customer</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>
      </div>

      {/* Editable Response Draft */}
      <div className="draft-editor-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label htmlFor="response_draft" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FileEdit size={13} />
            <span>Customer Response Draft (Editable)</span>
          </label>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            {responseDraft.length} characters
          </span>
        </div>
        <textarea
          id="response_draft"
          className="textarea-draft"
          value={responseDraft}
          onChange={(e) => setResponseDraft(e.target.value)}
          placeholder="Customer response message..."
        />
      </div>

      {/* Review & Approve Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleReviewClick}
          disabled={isLoading || !responseDraft.trim()}
          className="btn-primary"
        >
          <ShieldCheck size={16} />
          <span>Approve & Apply Resolution</span>
        </button>
      </div>
    </div>
  );
};
