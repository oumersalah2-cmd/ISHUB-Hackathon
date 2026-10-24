import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Sparkles, Edit3, RotateCcw, CheckCircle, ShieldCheck, Tag } from 'lucide-react';

const ProposalReviewSection = ({
  proposal,
  onApprove,
  isApproving = false,
  ticketId,
  customerName,
}) => {
  if (!proposal) return null;

  const initialDraft =
    proposal.response_draft ||
    proposal.customer_response ||
    proposal.draft ||
    proposal.suggested_solution ||
    '';

  const [draft, setDraft] = useState(initialDraft);
  const [selectedStatus, setSelectedStatus] = useState(proposal.next_status || 'approved');
  const [selectedCategory, setSelectedCategory] = useState(proposal.suggested_category || proposal.category || 'General Resolution');
  const [officerNotes, setOfficerNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Sync if proposal updates
  useEffect(() => {
    if (initialDraft) {
      setDraft(initialDraft);
    }
    if (proposal.next_status) {
      setSelectedStatus(proposal.next_status);
    }
    if (proposal.suggested_category || proposal.category) {
      setSelectedCategory(proposal.suggested_category || proposal.category);
    }
  }, [proposal]);

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const charCount = draft.length;

  const handleResetDraft = () => {
    setDraft(initialDraft);
  };

  const handleOpenConfirm = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    onApprove({
      response_draft: draft,
      final_response: draft,
      approved_status: selectedStatus,
      category: selectedCategory,
      officer_notes: officerNotes,
      policy_citations: proposal.policy_references || proposal.citations || [],
    });
  };

  return (
    <Card variant="butter" className="proposal-box">
      <CardHeader>
        <CardTitle icon={<Sparkles size={18} color="var(--clay-500)" />}>
          AI Proposed Resolution & Response Draft
        </CardTitle>
        <Badge variant="clay" dot={false}>
          Human-in-the-Loop Required
        </Badge>
      </CardHeader>

      <CardBody>
        {/* Proposal Meta Tags */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--butter-border)',
          }}
        >
          <div>
            <span className="meta-label">Suggested Category</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Tag size={14} color="var(--clay-500)" />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {selectedCategory}
              </span>
            </div>
          </div>

          <div>
            <span className="meta-label">Next Target Status</span>
            <select
              className="form-select"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', marginTop: '0.2rem', width: 'auto' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isApproving}
            >
              <option value="approved">Approved & Finalized</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed with Response</option>
            </select>
          </div>

          {proposal.policy_references && proposal.policy_references.length > 0 && (
            <div>
              <span className="meta-label">Referenced Policies</span>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                {proposal.policy_references.map((p, idx) => (
                  <span key={idx} className="code-pill">
                    {typeof p === 'string' ? p : p.title || p.clause || `Policy ${idx + 1}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Response Draft Editor */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label className="form-label" htmlFor="response-draft-editor">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={14} />
                Customer Response Draft (Editable)
              </span>
            </label>
            <button
              type="button"
              onClick={handleResetDraft}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Reset draft back to original AI generated text"
            >
              <RotateCcw size={12} />
              Reset to AI Original
            </button>
          </div>

          <textarea
            id="response-draft-editor"
            className="form-textarea"
            rows={7}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isApproving}
            style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
          />

          <div className="draft-editor-footer">
            <span>Edit the message before sending to ensure brand voice and compliance.</span>
            <span>
              {wordCount} words • {charCount} chars
            </span>
          </div>
        </div>

        {/* Officer Internal Notes */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="resolution-officer-notes">
            Officer Final Audit Notes (Internal Only)
          </label>
          <input
            id="resolution-officer-notes"
            type="text"
            className="form-input"
            placeholder="e.g. Verified warranty clause 4.2; approved replacement voucher."
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            disabled={isApproving}
          />
        </div>
      </CardBody>

      <CardFooter style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Review required prior to dispatch.
        </span>
        <Button
          variant="primary"
          icon={<CheckCircle size={16} />}
          onClick={handleOpenConfirm}
          disabled={isApproving || !draft.trim()}
          loading={isApproving}
        >
          Confirm & Save Resolution
        </Button>
      </CardFooter>

      {/* Confirmation Modal */}
      <ApprovalConfirmModalWrapper
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          handleConfirmSubmit();
        }}
        loading={isApproving}
        ticketId={ticketId}
        customerName={customerName}
        status={selectedStatus}
        category={selectedCategory}
        responseDraft={draft}
      />
    </Card>
  );
};

// Internal wrapper to dynamically import or use ApprovalConfirmModal
import ApprovalConfirmModal from './ApprovalConfirmModal';
const ApprovalConfirmModalWrapper = (props) => <ApprovalConfirmModal {...props} />;

export default ProposalReviewSection;
