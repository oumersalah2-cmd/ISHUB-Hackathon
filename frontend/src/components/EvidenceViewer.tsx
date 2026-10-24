import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, CheckCircle, Shield } from 'lucide-react';
import type { Policy, ToolCallLog } from '../types';

interface EvidenceViewerProps {
  policies: Policy[];
  citedPolicyIds: string[];
  toolLogs: ToolCallLog[];
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  policies,
  citedPolicyIds,
  toolLogs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'policies' | 'tools'>('policies');
  const [expandedLogIndex, setExpandedLogIndex] = useState<number | null>(null);

  return (
    <div className="glass-panel evidence-sidebar" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="panel-header">
        <span className="panel-title">
          <Shield size={16} /> Evidence & Audit
        </span>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => setActiveSubTab('policies')}
            style={{
              background: activeSubTab === 'policies' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeSubTab === 'policies' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Policies ({policies.length})
          </button>
          <button
            onClick={() => setActiveSubTab('tools')}
            style={{
              background: activeSubTab === 'tools' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeSubTab === 'tools' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tool Logs ({toolLogs.length})
          </button>
        </div>
      </div>

      {/* Subtab 1: Policy Records */}
      {activeSubTab === 'policies' && (
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {policies.map(policy => {
            const isCited = citedPolicyIds.includes(policy.policy_code) || citedPolicyIds.includes(policy.id);

            return (
              <div
                key={policy.id}
                className="policy-card"
                style={{
                  border: isCited ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isCited ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 23, 42, 0.65)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="policy-code-pill">{policy.policy_code}</span>
                  {isCited && (
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#818cf8', fontSize: '0.65rem' }}>
                      <CheckCircle size={10} /> Cited
                    </span>
                  )}
                </div>

                <div className="policy-title">{policy.title}</div>
                <div className="policy-text" style={{ marginBottom: '0.4rem' }}>
                  {policy.policy_text}
                </div>

                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-dim)',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Conditions:</strong> {policy.applicable_conditions}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab 2: Tool Execution Logs */}
      {activeSubTab === 'tools' && (
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {toolLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              No tool calls yet. Click "Investigate Complaint" to observe live agent tool execution.
            </div>
          ) : (
            toolLogs.map((log, idx) => {
              const isExpanded = expandedLogIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.65rem'
                  }}
                >
                  <div
                    onClick={() => setExpandedLogIndex(isExpanded ? null : idx)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Terminal size={14} color="var(--primary)" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: '#e5e7eb' }}>
                        {log.tool}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>INPUT:</div>
                      <pre style={{
                        background: '#090d16',
                        padding: '0.4rem',
                        borderRadius: 4,
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#a5b4fc',
                        overflowX: 'auto',
                        marginBottom: '0.4rem'
                      }}>
                        {JSON.stringify(log.input, null, 2)}
                      </pre>

                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>OUTPUT:</div>
                      <pre style={{
                        background: '#090d16',
                        padding: '0.4rem',
                        borderRadius: 4,
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#6ee7b7',
                        overflowX: 'auto'
                      }}>
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
