import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Send,
  Sparkles,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
  BookOpen,
  Bot,
  Layers,
  FileCheck,
  RotateCcw,
  Cpu,
  Lock,
  Compass,
  Info,
} from 'lucide-react';
import Button from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/common/Card';
import { StatusBadge, PriorityBadge } from '../components/tickets/StatusBadge';
import api from '../services/api';
import { useApiConfig } from '../context/ApiConfigContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { status, baseUrl, setIsConfigModalOpen } = useApiConfig();

  const [activeTab, setActiveTab] = useState('home');
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

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Sub-Navigation Bar: Home, Features, How It Works, About */}
      <nav className="home-nav-bar" aria-label="Page Sections">
        <div className="home-nav-tabs">
          <button
            type="button"
            className={`home-nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => scrollToSection('home')}
          >
            <Compass size={15} className="tab-icon" />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`home-nav-tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => scrollToSection('features')}
          >
            <Sparkles size={15} className="tab-icon" />
            <span>Features</span>
          </button>

          <button
            type="button"
            className={`home-nav-tab ${activeTab === 'how-it-works' ? 'active' : ''}`}
            onClick={() => scrollToSection('how-it-works')}
          >
            <Layers size={15} className="tab-icon" />
            <span>How It Works</span>
          </button>

          <button
            type="button"
            className={`home-nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => scrollToSection('about')}
          >
            <Info size={15} className="tab-icon" />
            <span>About</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="primary"
            size="sm"
            icon={<Inbox size={14} />}
            onClick={() => navigate('/inbox')}
          >
            Launch Inbox
          </Button>
        </div>
      </nav>

      {/* ====================================================================
          1. SECTION: HOME (DASHBOARD & OVERVIEW)
          ==================================================================== */}
      <section id="home" className="home-section">
        {/* Welcome Banner utilizing Brand Colors (Soft Butter container, Clay Brown accents, Dark Gray text) */}
        <div className="dashboard-welcome-banner">
          <div className="banner-content">
            <div className="banner-tag">
              <Sparkles size={12} />
              <span>AI-Assisted CSR Intelligence</span>
            </div>
            <h1 className="banner-title">Welcome back, Support Officer</h1>
            <p className="banner-description">
              LUCY CSR accelerates resolution workflows by investigating complex support inquiries, cross-referencing policy guidelines, and generating grounded responses for your review and final approval.
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

        {/* Active Queue Preview */}
        <div>
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
                            Open
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ====================================================================
          2. SECTION: FEATURES
          ==================================================================== */}
      <section id="features" className="home-section">
        <div className="home-section-header">
          <div className="section-tag">
            <Sparkles size={12} />
            <span>Core Capabilities</span>
          </div>
          <h2 className="section-title">Engineered for High-Accuracy Support</h2>
          <p className="section-subtitle">
            LUCY CSR combines agentic AI orchestration with strict human verification to eliminate support bottlenecks without compromising quality or compliance.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Bot size={24} />
            </div>
            <h3 className="feature-title">Autonomous Ticket Investigation</h3>
            <p className="feature-desc">
              Extracts customer intent, identifies relevant warranty or refund clauses, and logs transparent reasoning steps in real time.
            </p>
            <span className="feature-pill">Live Reasoning Logs</span>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">Policy Grounding & Citations</h3>
            <p className="feature-desc">
              Every suggested response is tethered to official corporate policy clauses with confidence scores, preventing hallucinated concessions.
            </p>
            <span className="feature-pill">Verified Grounding</span>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <HelpCircle size={24} />
            </div>
            <h3 className="feature-title">Interactive Clarification Loop</h3>
            <p className="feature-desc">
              When essential information is missing, the agent prompts the officer to supply missing data and seamlessly resumes the investigation.
            </p>
            <span className="feature-pill">Context Retention</span>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FileCheck size={24} />
            </div>
            <h3 className="feature-title">Human-in-the-Loop Sign-Off</h3>
            <p className="feature-desc">
              Officers retain absolute control. Review suggested categories, edit drafts with live counters, and confirm with explicit two-step modal approval.
            </p>
            <span className="feature-pill">Anti-Duplicate Protection</span>
          </div>

          {/* Feature 5 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Send size={24} />
            </div>
            <h3 className="feature-title">Internal Outbox & Audit Archive</h3>
            <p className="feature-desc">
              All finalized resolutions are saved to an immutable outbox for supervisor audit, quick clipboard copying, and ticket history reopening.
            </p>
            <span className="feature-pill">Audit Trail</span>
          </div>

          {/* Feature 6 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Modular & Resilient Architecture</h3>
            <p className="feature-desc">
              Built on standard CSS and native fetch with live connection indicators, runtime URL switches, and zero third-party framework overhead.
            </p>
            <span className="feature-pill">Zero Bloat</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. SECTION: HOW IT WORKS
          ==================================================================== */}
      <section id="how-it-works" className="home-section">
        <div className="home-section-header">
          <div className="section-tag">
            <Layers size={12} />
            <span>Resolution Workflow</span>
          </div>
          <h2 className="section-title">From Ingestion to Sign-Off in Four Steps</h2>
          <p className="section-subtitle">
            A seamless bridge between artificial intelligence and human discretion designed for speed, safety, and accountability.
          </p>
        </div>

        <div className="workflow-steps-grid">
          {/* Step 1 */}
          <div className="workflow-card">
            <div className="workflow-number">1</div>
            <h3 className="workflow-card-title">Ingest & Select Ticket</h3>
            <p className="workflow-card-desc">
              Tickets arrive via the API into the central Ticket Inbox. Support officers prioritize inquiries by urgency, customer tier, and topic.
            </p>
            <div className="workflow-badge-row">
              <span className="code-pill">GET /tickets</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="workflow-card workflow-card-butter">
            <div className="workflow-number">2</div>
            <h3 className="workflow-card-title">AI Agent Investigation</h3>
            <p className="workflow-card-desc">
              The officer clicks "Investigate Ticket". The AI agent analyzes the message, retrieves matched policy clauses, and synthesizes a proposed resolution.
            </p>
            <div className="workflow-badge-row">
              <span className="code-pill">POST /investigate</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="workflow-card">
            <div className="workflow-number">3</div>
            <h3 className="workflow-card-title">Clarify & Edit Draft</h3>
            <p className="workflow-card-desc">
              If customer details are missing, the officer inputs clarification. The officer reviews the generated response draft and polishes the wording.
            </p>
            <div className="workflow-badge-row">
              <span className="code-pill">POST /clarify</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="workflow-card workflow-card-butter">
            <div className="workflow-number">4</div>
            <h3 className="workflow-card-title">Explicit Confirmation & Outbox</h3>
            <p className="workflow-card-desc">
              The officer clicks "Confirm & Save". Once verified, the finalized record is archived into the Internal Outbox for audit and tracking.
            </p>
            <div className="workflow-badge-row">
              <span className="code-pill">POST /approve</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. SECTION: ABOUT
          ==================================================================== */}
      <section id="about" className="home-section">
        <div className="home-section-header">
          <div className="section-tag">
            <Info size={12} />
            <span>Platform Overview</span>
          </div>
          <h2 className="section-title">About LUCY CSR</h2>
          <p className="section-subtitle">
            Built to empower support teams with the precision of AI without relinquishing human oversight.
          </p>
        </div>

        <div className="about-card">
          <div className="about-intro-grid">
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Human-Centric Customer Service Automation
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                LUCY CSR was engineered to tackle the fundamental challenge facing modern customer support: balancing rapid response times with uncompromising accuracy. Rather than automating away human officers, LUCY acts as an intelligent co-pilot that digests hundreds of policy rules in seconds, grounding every answer in verifiable evidence.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Every single communication is subject to explicit human verification. Officers retain the full liberty to adjust tone, add personalized context, or override AI recommendations whenever exceptional customer circumstances demand it.
              </p>
            </div>

            <div className="about-brand-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--butter-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--clay-500)',
                  }}
                >
                  <Lock size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Enterprise Compliance
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Strict Zero Hallucination Standard
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Responses are not dispatched unless grounded in verified corporate guidelines and signed off by an authorized CSR officer.
              </p>
              <div style={{ borderTop: '1px solid var(--butter-border)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered by React 19 • Pure CSS3 Design System • Native Fetch
              </div>
            </div>
          </div>

          <div className="pillars-grid">
            <div className="pillar-item">
              <div className="pillar-title">
                <CheckCircle size={16} color="#166534" />
                <span>Zero Hallucinations</span>
              </div>
              <p className="pillar-desc">
                Policy citations accompany every recommendation, ensuring factual adherence to terms of service.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-title">
                <ShieldCheck size={16} color="var(--clay-500)" />
                <span>Accountable Auditing</span>
              </div>
              <p className="pillar-desc">
                The Internal Outbox maintains complete timestamps, officer identities, and final approved texts.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-title">
                <RotateCcw size={16} color="#9A3412" />
                <span>Continuous Clarification</span>
              </div>
              <p className="pillar-desc">
                Incomplete cases prompt interactive follow-ups rather than failing silently or assuming facts.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-title">
                <Zap size={16} color="var(--clay-500)" />
                <span>Speed & Scalability</span>
              </div>
              <p className="pillar-desc">
                Cut ticket investigation time from 15 minutes to under 30 seconds with intelligent pre-drafting.
              </p>
            </div>
          </div>
        </div>

        {/* Call-to-Action Bottom Banner */}
        <div className="cta-banner">
          <div>
            <h3>Ready to resolve customer tickets?</h3>
            <p>
              Jump straight into your active support queue or configure your backend API connection.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="lg"
              icon={<Inbox size={18} />}
              onClick={() => navigate('/inbox')}
            >
              Go to Ticket Inbox
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => setIsConfigModalOpen(true)}
            >
              API Diagnostics
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
