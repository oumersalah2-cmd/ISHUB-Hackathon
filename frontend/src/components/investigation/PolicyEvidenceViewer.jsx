import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { ShieldCheck, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';
import Badge from '../common/Badge';

const PolicyEvidenceViewer = ({ evidence = [] }) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="evidence-card">
      <div className="evidence-header">
        <div className="evidence-title">
          <ShieldCheck size={18} color="var(--clay-500)" />
          <span>Grounding Policy Evidence ({evidence.length})</span>
        </div>
        <Badge variant="butter" dot={false}>
          Verified Grounding
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {evidence.map((item, index) => {
          const isObj = typeof item === 'object' && item !== null;
          const title = isObj
            ? item.title || item.policy_name || item.name || `Policy Clause #${index + 1}`
            : `Policy Reference #${index + 1}`;
          const text = isObj
            ? item.text || item.excerpt || item.content || item.clause_text || JSON.stringify(item)
            : item;
          const section = isObj ? item.section || item.clause || item.id : null;
          const confidence = isObj && item.confidence ? Math.round(item.confidence * 100) : null;

          return (
            <div key={index} className="evidence-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <div className="evidence-item-clause">
                  {section && <span style={{ color: 'var(--text-primary)', fontWeight: 700, marginRight: '0.35rem' }}>[{section}]</span>}
                  {title}
                </div>
                {confidence && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                    {confidence}% Match
                  </span>
                )}
              </div>
              <p className="evidence-item-text">{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PolicyEvidenceViewer;
