import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { Activity, Bot, CheckCircle2, Search, Cpu } from 'lucide-react';

const AgentActivityFeed = ({ activities = [], isInvestigating = false }) => {
  if (!activities || activities.length === 0) {
    if (isInvestigating) {
      return (
        <Card variant="default">
          <CardHeader>
            <CardTitle icon={<Bot size={18} color="var(--clay-500)" />}>
              Agent Activity & Execution Log
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
              <span className="spinner" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                AI Agent is currently analyzing ticket context, extracting customer intent, and retrieving policy guidelines...
              </span>
            </div>
          </CardBody>
        </Card>
      );
    }
    return null;
  }

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle icon={<Bot size={18} color="var(--clay-500)" />}>
          Agent Activity & Execution Log
        </CardTitle>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {activities.length} {activities.length === 1 ? 'event' : 'events'} recorded
        </span>
      </CardHeader>
      <CardBody>
        <div className="agent-logs-list">
          {activities.map((item, index) => {
            const isObj = typeof item === 'object' && item !== null;
            const message = isObj ? item.message || item.action || item.description || JSON.stringify(item) : item;
            const timestamp = isObj && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : null;
            const stepName = isObj ? item.step || item.type || `Step ${index + 1}` : `Step ${index + 1}`;

            return (
              <div key={index} className="agent-log-item">
                <div className="agent-log-icon">
                  <Cpu size={16} />
                </div>
                <div className="agent-log-body">
                  <div className="agent-log-message">{message}</div>
                  <div className="agent-log-meta">
                    <span style={{ fontWeight: 600 }}>{stepName}</span>
                    {timestamp && <span> • {timestamp}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default AgentActivityFeed;
