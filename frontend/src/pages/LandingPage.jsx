import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Inbox,
  Send,
  ShieldCheck,
  Bot,
  HelpCircle,
  FileCheck,
  Zap,
  Layers,
  Info,
  ArrowRight,
  CheckCircle,
  Lock,
  ExternalLink,
  RotateCcw,
  UserCheck,
  LogIn,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import Button from '../components/common/Button';
import ResolutionPipeline from '../components/common/ResolutionPipeline';
import { useApiConfig } from '../context/ApiConfigContext';

const TRUSTED_COMPANIES = [
  { name: 'Dagi Computer', logo: '/companies/dagi_trans.png', type: 'transparent' },
  { name: 'IDEEZA', logo: '/companies/ideeza_trans.png', type: 'transparent' },
  { name: 'Vision Vertex Solutions', logo: '/companies/vision_vertex_trans.png', type: 'transparent' },
  { name: 'Lomi Delivery', logo: null, type: 'name-only' },
  { name: 'IS Hub', logo: '/companies/is_hub.jpg', type: 'badge' },
];

const FAQ_ITEMS = [
  {
    id: 'ai-investigation',
    icon: Bot,
    tag: 'AI Agent Feature',
    question: 'How does the AI agent investigate tickets?',
    sentence1: 'The AI agent analyzes the customer problem and pulls account details automatically.',
    sentence2: 'It reads your store policies to find the correct solution without guessing.',
  },
  {
    id: 'ai-evidence',
    icon: ShieldCheck,
    tag: 'AI Agent Feature',
    question: 'Does the AI agent show exact policy evidence?',
    sentence1: 'Yes, the AI agent cites the exact warranty clause and rule number for every decision.',
    sentence2: 'You can read the original policy text directly on screen to verify the answer.',
  },
  {
    id: 'ai-drafting',
    icon: FileCheck,
    tag: 'AI Agent Feature',
    question: 'Can the AI agent write the customer reply?',
    sentence1: 'Yes, the AI agent prepares a polite, ready-to-send draft based on approved policy.',
    sentence2: 'You can freely edit words, adjust tone, or rewrite the draft before saving.',
  },
  {
    id: 'ai-clarification',
    icon: HelpCircle,
    tag: 'AI Agent Feature',
    question: 'How does the AI agent handle missing info?',
    sentence1: 'The AI agent spots missing details like an order ID or photo of transit damage.',
    sentence2: 'It asks you for the missing details in a simple form and resumes work immediately.',
  },
  {
    id: 'ai-categorization',
    icon: Layers,
    tag: 'AI Agent Feature',
    question: 'Does the AI agent suggest ticket categories and status?',
    sentence1: 'Yes, the AI agent tags the issue category and recommends the next ticket status.',
    sentence2: 'This removes manual data entry and keeps your support queue organized.',
  },
  {
    id: 'human-control',
    icon: UserCheck,
    tag: 'Human Review',
    question: 'Can the AI agent send replies without human review?',
    sentence1: 'No, the AI agent is strictly an assistant and can never close tickets alone.',
    sentence2: 'A real support officer must review the solution and click "Confirm & Save".',
  },
  {
    id: 'outbox',
    icon: Send,
    tag: 'Safe Records',
    question: 'Where are the AI agent\'s approved tickets stored?',
    sentence1: 'All finished tickets go into the secure Outbox archive with full audit history.',
    sentence2: 'You can reopen, review, or copy any approved answer whenever you need it.',
  },
  {
    id: 'reliability',
    icon: Zap,
    tag: 'Speed & Scale',
    question: 'How fast does the AI agent solve support tickets?',
    sentence1: 'The AI agent finishes its policy search and response draft in under 30 seconds.',
    sentence2: 'This cuts customer wait times down from 15 minutes of manual rulebook searches.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { status, baseUrl, setIsConfigModalOpen } = useApiConfig();
  const [activeNav, setActiveNav] = useState('hero');
  // By default, open the first 2 items so visitors immediately see the answers
  const [openFaqIds, setOpenFaqIds] = useState(['ai-investigation', 'ai-evidence']);

  const toggleFaq = (id) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAllFaqs = () => {
    setOpenFaqIds(FAQ_ITEMS.map((item) => item.id));
  };

  const collapseAllFaqs = () => {
    setOpenFaqIds([]);
  };

  const scrollTo = (id) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnterPlatform = () => {
    navigate('/dashboard');
  };

  return (
    <div className="landing-page">
      {/* --------------------------------------------------------------------
          1. Top Navigation Bar (Public SaaS Header)
          -------------------------------------------------------------------- */}
      <header className="landing-nav-header">
        <div className="landing-nav-brand" onClick={() => scrollTo('hero')}>
          <img
            src={logoImg}
            alt="LUCY CSR Fossil Headset Logo"
            className="landing-brand-logo"
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
          <div className="landing-brand-text">
            <div className="landing-brand-title">
              LUCY <span>CSR</span>
            </div>
            <div className="landing-brand-tagline">AI Support Resolution</div>
          </div>
        </div>

        <nav>
          <ul className="landing-nav-links">
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeNav === 'hero' ? 'active' : ''}`}
                onClick={() => scrollTo('hero')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeNav === 'features' ? 'active' : ''}`}
                onClick={() => scrollTo('features')}
              >
                FAQ
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeNav === 'how-it-works' ? 'active' : ''}`}
                onClick={() => scrollTo('how-it-works')}
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeNav === 'about' ? 'active' : ''}`}
                onClick={() => scrollTo('about')}
              >
                About
              </button>
            </li>
          </ul>
        </nav>

        {/* Action Button: Dedicated Gate for Operator to enter the Platform */}
        <div className="landing-nav-actions">
          <button
            type="button"
            className="api-status-pill"
            onClick={() => setIsConfigModalOpen(true)}
            title={`Backend: ${baseUrl} (${status})`}
          >
            <span className={`api-status-dot ${status}`} />
            <span>API: {status === 'online' ? 'Connected' : 'Configure'}</span>
          </button>

          <Button
            variant="primary"
            size="md"
            icon={<LogIn size={16} />}
            onClick={handleEnterPlatform}
            title="Launch internal Support Officer Workspace"
          >
            Enter Operator Platform
          </Button>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          2. Hero Section
          -------------------------------------------------------------------- */}
      <section id="hero" className="landing-hero">
        <div className="hero-flanking-layout">
          {/* Left: Lucy Logo Feature Card */}
          <div className="hero-left-logo-card">
            <img
              src="/lucy_emblem_clean.png"
              alt="Lucy CSR Australopithecus Headset Emblem"
              className="hero-large-logo-img"
              onError={(e) => {
                e.currentTarget.src = logoImg;
              }}
            />
            <div className="hero-logo-badge">
              <Sparkles size={12} color="var(--orange-500)" />
              <span>LUCY CSR Engine</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
              Intelligent grounding co-pilot for customer support representatives
            </p>
          </div>

          {/* Center: Main Headline, Subhead & Action Buttons */}
          <div className="hero-center-content">
            <div className="hero-pill">
              <Sparkles size={14} className="hero-pill-sparkle" />
              <span>Next-Generation AI Support Copilot Platform</span>
            </div>

            <h1 className="hero-headline">
              Intelligent Ticket Resolution{' '}
              <span className="hero-headline-highlight">Grounded in Policy</span>
            </h1>

            <p className="hero-subhead">
              LUCY CSR accelerates support investigations with autonomous AI reasoning, instant corporate policy clause citations, and mandatory human-in-the-loop verification before final resolution.
            </p>

            {/* Primary Operator Gate CTAs */}
            <div className="hero-cta-group">
              <Button
                variant="primary"
                size="lg"
                icon={<LogIn size={18} />}
                onClick={handleEnterPlatform}
              >
                Enter Operator Platform
              </Button>

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
                icon={<Layers size={18} />}
                onClick={() => scrollTo('how-it-works')}
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>

        {/* Animated Moving "Trusted by Leading Companies" Ticker — Transparent, Only Moving Elements */}
        <div className="trusted-by-section">
          <div className="trusted-by-header">
            <span className="trusted-by-kicker">
              Trusted by Innovative Companies & Support Teams
            </span>
          </div>

          <div className="trusted-by-marquee-wrapper">
            <div className="trusted-by-marquee-track">
              {/* Loop duplicated 4 times for a flawless seamless infinite continuous scroll */}
              {[...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES].map((company, index) => (
                <div key={`brand-${index}`} className="company-moving-element" title={company.name}>
                  {company.logo && (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className={`company-moving-img ${company.type === 'badge' ? 'company-badge-icon' : ''}`}
                    />
                  )}
                  <span className={`company-moving-label ${!company.logo ? 'company-standalone-name' : ''}`}>
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          3. Stats / Impact Strip
          -------------------------------------------------------------------- */}
      <section className="stats-strip">
        <div className="stats-grid-landing">
          <div className="stat-landing-card">
            <span className="stat-landing-value">30s</span>
            <span className="stat-landing-label">Average Investigation</span>
            <span className="stat-landing-desc">Down from 15 mins manual review</span>
          </div>

          <div className="stat-landing-card">
            <span className="stat-landing-value">100%</span>
            <span className="stat-landing-label">Policy Grounded</span>
            <span className="stat-landing-desc">Direct RAG citation verification</span>
          </div>

          <div className="stat-landing-card">
            <span className="stat-landing-value">Zero</span>
            <span className="stat-landing-label">AI Hallucinations</span>
            <span className="stat-landing-desc">No unverified policy promises</span>
          </div>

          <div className="stat-landing-card">
            <span className="stat-landing-value">100%</span>
            <span className="stat-landing-label">Human-in-the-Loop</span>
            <span className="stat-landing-desc">Mandatory CSR confirmation</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4. FAQ Section (Simple English, Exactly 2 Sentences Per Item)
          -------------------------------------------------------------------- */}
      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-tag">
            <HelpCircle size={13} color="var(--orange-500)" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="landing-section-title">Common Questions & Answers</h2>
          <p className="landing-section-desc">
            Simple answers to how Lucy CSR works, protects your rules, and helps your team.
          </p>

          <div className="faq-toggle-bar">
            <button
              type="button"
              className="faq-toggle-btn"
              onClick={expandAllFaqs}
            >
              Open All
            </button>
            <span className="faq-toggle-divider">•</span>
            <button
              type="button"
              className="faq-toggle-btn"
              onClick={collapseAllFaqs}
            >
              Close All
            </button>
          </div>
        </div>

        <div className="faq-accordion-list">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaqIds.includes(item.id);
            const IconComponent = item.icon;

            return (
              <div
                key={item.id}
                className={`faq-accordion-card ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-accordion-trigger"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                >
                  <div className="faq-trigger-left">
                    <span className="faq-icon-pill">
                      <IconComponent size={18} />
                    </span>
                    <div className="faq-title-wrap">
                      <span className="faq-tag-pill">{item.tag}</span>
                      <h3 className="faq-question-title">{item.question}</h3>
                    </div>
                  </div>

                  <span className={`faq-chevron ${isOpen ? 'rotate' : ''}`}>
                    <ChevronDown size={18} />
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-accordion-body">
                    <p className="faq-sentence-one">{item.sentence1}</p>
                    <p className="faq-sentence-two">{item.sentence2}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. Resolution Pipeline (How Lucy Resolves Tickets)
          -------------------------------------------------------------------- */}
      <section id="how-it-works" className="landing-section" style={{ backgroundColor: '#FFFFFF', maxWidth: '100%', padding: '1rem 0' }}>
        <ResolutionPipeline />
      </section>

      {/* --------------------------------------------------------------------
          6. About Section (Simple English, Attractive Layout)
          -------------------------------------------------------------------- */}
      <section id="about" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-tag">
            <Info size={12} color="var(--orange-500)" />
            <span>About Lucy CSR</span>
          </div>
          <h2 className="landing-section-title">Smart AI with Real Human Control</h2>
          <p className="landing-section-desc">
            We built Lucy to give support officers superhuman speed without ever losing the human touch.
          </p>
        </div>

        <div className="about-landing-box">
          <div className="about-landing-grid">
            {/* Left Story Card */}
            <div className="about-landing-story">
              <span className="about-story-kicker">OUR PROMISE</span>
              <h3>Built to help support officers, not replace them</h3>
              <p>
                Most customer support chatbots guess answers and make false promises. Lucy is different: it acts as your personal smart assistant, checking your company's actual rules and warranty terms in seconds.
              </p>
              <p>
                Best of all, you always stay in full control. Lucy writes the first draft, but only a real support officer can review, change words, and give final approval.
              </p>

              <div className="about-highlights-list">
                <div className="about-highlight-item">
                  <CheckCircle size={18} color="#166534" />
                  <span><strong>100% Policy Grounded:</strong> Matches exact store policies and warranty clauses.</span>
                </div>
                <div className="about-highlight-item">
                  <UserCheck size={18} color="var(--orange-500)" />
                  <span><strong>Human in Charge:</strong> No answer is ever sent without your sign-off.</span>
                </div>
                <div className="about-highlight-item">
                  <Zap size={18} color="var(--darkblue-900)" />
                  <span><strong>Under 60 Seconds:</strong> Down from 15 minutes of manual rulebook searches.</span>
                </div>
              </div>
            </div>

            {/* Right Pillars / Benefit Cards */}
            <div className="about-pillar-cards">
              <div className="about-pillar-card">
                <div className="about-pillar-icon-wrap">
                  <CheckCircle size={20} color="#166534" />
                </div>
                <div className="about-pillar-title">Zero Guesses</div>
                <div className="about-pillar-text">
                  Lucy never invents rules or gives fake refund promises.
                </div>
              </div>

              <div className="about-pillar-card">
                <div className="about-pillar-icon-wrap">
                  <ShieldCheck size={20} color="var(--orange-500)" />
                </div>
                <div className="about-pillar-title">Safe History Log</div>
                <div className="about-pillar-text">
                  Every approved answer is saved in your Outbox audit history.
                </div>
              </div>

              <div className="about-pillar-card">
                <div className="about-pillar-icon-wrap">
                  <RotateCcw size={20} color="var(--orange-500)" />
                </div>
                <div className="about-pillar-title">Easy Missing Info</div>
                <div className="about-pillar-text">
                  If a receipt or order ID is missing, Lucy prompts you to add it.
                </div>
              </div>

              <div className="about-pillar-card">
                <div className="about-pillar-icon-wrap">
                  <Zap size={20} color="var(--orange-500)" />
                </div>
                <div className="about-pillar-title">Fast Resolution</div>
                <div className="about-pillar-text">
                  Solve customer issues quickly with zero guesswork or stress.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          7. Landing Footer
          -------------------------------------------------------------------- */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={logoImg} alt="LUCY CSR Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              LUCY CSR
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="landing-nav-link" onClick={() => scrollTo('hero')}>
              Home
            </button>
            <button type="button" className="landing-nav-link" onClick={() => scrollTo('features')}>
              Features
            </button>
            <button type="button" className="landing-nav-link" onClick={() => scrollTo('how-it-works')}>
              How It Works
            </button>
            <button type="button" className="landing-nav-link" onClick={() => scrollTo('about')}>
              About
            </button>
            <button type="button" className="landing-nav-link" onClick={handleEnterPlatform} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              Operator Platform →
            </button>
          </div>
        </div>

        <div className="landing-footer-copy">
          <div>© {new Date().getFullYear()} LUCY CSR. All rights reserved. Built for Customer Support Representatives.</div>
          <div>React 19 • Standard CSS3 • Native Fetch</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
