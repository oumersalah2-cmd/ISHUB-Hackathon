import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import type { Policy } from '../types';

interface PolicyExplorerProps {
  policies: Policy[];
}

export const PolicyExplorer: React.FC<PolicyExplorerProps> = ({ policies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = policies.filter(p => {
    const matchesSearch =
      p.policy_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.policy_text.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass-panel" style={{ maxWidth: 1200, margin: '1.5rem auto', width: '100%' }}>
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <BookOpen size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Company Policy Knowledge Base
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Official rules, requirements, and conditions retrieved by the AI Resolution Agent
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="input-text"
            style={{ paddingLeft: '2rem', width: '100%' }}
            placeholder="Search policies by code, title, or terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['ALL', 'Refund', 'Delivery', 'Account Access'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '1rem' }}>
        {filtered.map(policy => (
          <div
            key={policy.id}
            style={{
              background: 'rgba(26, 34, 52, 0.5)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="policy-code-pill" style={{ fontSize: '0.8rem' }}>{policy.policy_code}</span>
              <span className="badge badge-category">{policy.category}</span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {policy.title}
            </h3>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              {policy.policy_text}
            </p>

            <div style={{
              background: 'rgba(11, 15, 25, 0.6)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <strong style={{ color: '#a5b4fc' }}>Prerequisites & Conditions:</strong> {policy.applicable_conditions}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
