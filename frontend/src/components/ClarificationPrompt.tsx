import React, { useState } from 'react';
import { HelpCircle, Send } from 'lucide-react';

interface ClarificationPromptProps {
  question: string;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export const ClarificationPrompt: React.FC<ClarificationPromptProps> = ({
  question,
  onSubmit,
  isLoading
}) => {
  const [answer, setAnswer] = useState('');

  const quickPills = [
    'Purchased on 2026-10-18 (Within 30 Days)',
    'Customer confirmed receipt of order yesterday',
    'Customer confirmed primary email matches records'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  return (
    <div className="clarification-box">
      <div className="clarification-title">
        <HelpCircle size={18} />
        <span>Agent Clarification Needed • Missing Information</span>
      </div>

      <p className="clarification-question">
        <strong>Agent Question:</strong> {question}
      </p>

      {/* Quick Suggestion Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Quick options:</span>
        {quickPills.map((pill, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setAnswer(pill)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fef3c7',
              fontSize: '0.7rem',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            {pill}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="clarification-input-group">
        <input
          type="text"
          className="input-text"
          placeholder="Type the customer's clarification (e.g. 2026-10-18)..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !answer.trim()}
          className="btn-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          <Send size={14} />
          <span>Resume Investigation</span>
        </button>
      </form>
    </div>
  );
};
