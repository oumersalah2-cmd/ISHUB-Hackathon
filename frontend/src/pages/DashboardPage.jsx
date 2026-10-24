import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Send,
  Sparkles,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Server,
  Zap,
  Activity,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Button from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/common/Card';
import { StatusBadge, PriorityBadge } from '../components/tickets/StatusBadge';
import api from '../services/api';
import { useApiConfig } from '../context/ApiConfigContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { status, baseUrl, setIsConfigModalOpen } = useApiConfig();

  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    investigating: 0,
    clarification: 0,
    approvedOutbox: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [ticketsRes, outboxRes] = await Promise.allSettled([
          api.getTickets({ limit: 10 }),
          api.getOutbox({ limit: 10 }),
        ]);

        const tickets = ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value) ? ticketsRes.value : [];
        const outbox = outboxRes.status === 'fulfilled' && Array.isArray(outboxRes.value) ? outboxRes.value : [];

        if (isMounted) {
          const investigatingCount = tickets.filter(
            (t) => (t.status || '').toLowerCase() === 'investigating' || (t.status || '').toLowerCase() === 'in_progress'
          ).length;

          const clarificationCount = tickets.filter(
            (t) =>
              (t.status || '').toLowerCase().includes('clarif') ||
              t.needs_clarification ||
              t.clarification_question
          ).length;

          setMetrics({
            totalTickets: tickets.length,
            investigating: investigatingCount,
            clarification: clarificationCount,
            approvedOutbox: outbox.length,
          });

          setRecentTickets(tickets.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {/* Operator Welcome Banner utilizing Brand Colors (Soft Butter container, Clay Brown accents, Dark Gray text) */}
      <div className="dashboard-welcome-banner">
        <div className="banner-content">
          <div className="banner-tag">
            <UserCheck size={12} />
            <span>Operator Console • Authenticated Session</span>
          </div>
          <h1 className="banner-title">Welcome back, Support Officer</h1>
          <p className="banner-description">
            Your AI-assisted CSR workspace is active. Investigate incoming customer tickets, verify policy evidence against company guidelines, and review generated response drafts for human sign-off.
          </p>
          <div className="banner-actions">
            <Button
              variant="primary"
              size="lg"
              icon={<Inbox size={18} />}
              onClick={() => navigate('/inbox')}
            >
              Open Ticket Inbox
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<Send size={18} />}
              onClick={() => navigate('/outbox')}
            >
              View Internal Outbox
            </Button>
          </div>
        </div>
      </div>

      {/* Live Metrics Overview Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Active Tickets</span>
            <span className="metric-value">{loading ? '—' : metrics.totalTickets}</span>
          </div>
          <div className="metric-icon-wrap metric-icon-clay">
            <Inbox size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">In AI Investigation</span>
            <span className="metric-value">{loading ? '—' : metrics.investigating}</span>
          </div>
          <div className="metric-icon-wrap metric-icon-butter">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Clarifications Needed</span>
            <span className="metric-value">{loading ? '—' : metrics.clarification}</span>
          </div>
          <div className="metric-icon-wrap metric-icon-warning">
            <HelpCircle size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Saved to Outbox</span>
            <span className="metric-value">{loading ? '—' : metrics.approvedOutbox}</span>
          </div>
          <div className="metric-icon-wrap metric-icon-success">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Split Section: Recent Queue & System Grounding */}
      <div className="home-split-grid">
        {/* Left: Recent Tickets Queue */}
        <Card>
          <CardHeader>
            <CardTitle icon={<Inbox size={18} color="var(--clay-500)" />}>
              Active Queue Preview
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inbox')}>
              View All ({metrics.totalTickets})
            </Button>
          </CardHeader>
          <CardBody style={{ padding: 0 }}>
            {recentTickets.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {loading ? 'Connecting to queue...' : 'No active tickets in queue.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentTickets.map((t) => {
                  const id = t.id || t.ticket_id || 'TICK-000';
                  const subject = t.subject || t.title || 'Support Request';
                  const customer = t.customer_name || t.customer?.name || t.user || 'Customer';
                  const status = t.status || 'open';
                  const priority = t.priority || 'medium';

                  return (
                    <div
                      key={id}
                      style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <span className="ticket-id-tag">{id}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {subject}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Customer: {customer}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <PriorityBadge priority={priority} />
                        <StatusBadge status={status} />
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<ArrowRight size={14} />}
                          onClick={() => navigate(`/inbox/${id}`)}
                        >
                          Investigate
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Right: API & Agent Engine Status */}
        <Card variant="butter">
          <CardHeader>
            <CardTitle icon={<Server size={18} color="var(--clay-500)" />}>
              Agent Engine & API
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="meta-label">Backend Connection</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className={`api-status-dot ${status}`} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {status === 'online' ? 'API Online & Reachable' : status === 'offline' ? 'API Offline / Unreachable' : 'Verifying...'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Target: <code>{baseUrl}</code>
                </div>
              </div>

              <div>
                <span className="meta-label">Resolution Protocol</span>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                  All agent proposals require explicit human confirmation. Response drafts can be edited and verified against corporate policies before submission.
                </p>
              </div>

              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--butter-border)' }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => setIsConfigModalOpen(true)}
                >
                  Configure API & Diagnostics
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
