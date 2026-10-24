import React, { useState } from 'react';
import { HelpCircle, Send, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const ClarificationForm = ({
  prompt = 'Additional information is required from the customer or support officer to continue resolution.',
  onSubmit,
  loading = false,
}) => {
  const [clarificationText, setClarificationText] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clarificationText.trim()) {
      setValidationError('Please provide the requested clarification or details before submitting.');
      return;
    }
    setValidationError('');
    onSubmit({
      clarification: clarificationText.trim(),
      officer_notes: officerNotes.trim(),
    });
  };

  return (
    <div className="clarification-box">
      <div className="clarification-title">
        <HelpCircle size={20} />
        <span>Clarification Required by AI Agent</span>
      </div>

      <p className="clarification-prompt">{prompt}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="clarification-input">
            Officer Input / Clarification Details *
          </label>
          <textarea
            id="clarification-input"
            className="form-textarea"
            rows={4}
            placeholder="Type the customer's clarification, verified order/account information, or policy exemption details..."
            value={clarificationText}
            onChange={(e) => {
              setClarificationText(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={loading}
          />
          {validationError && <span className="form-error">{validationError}</span>}
          <span className="form-hint">
            Submitting this information will resume the AI investigation with the new context.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="officer-notes-input">
            Internal Resolution Notes (Optional)
          </label>
          <input
            id="officer-notes-input"
            type="text"
            className="form-input"
            placeholder="e.g. Verified customer identity via phone on 10/24"
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button
            type="submit"
            variant="primary"
            icon={<Send size={15} />}
            loading={loading}
          >
            Submit Clarification & Resume
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClarificationForm;
