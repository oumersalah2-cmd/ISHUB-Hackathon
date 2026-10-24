import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TicketList } from './components/TicketList';
import { WorkflowStepper } from './components/WorkflowStepper';
import { ClarificationPrompt } from './components/ClarificationPrompt';
import { ResolutionEditor } from './components/ResolutionEditor';
import { ApprovalModal } from './components/ApprovalModal';
import { EvidenceViewer } from './components/EvidenceViewer';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { PolicyExplorer } from './components/PolicyExplorer';
import { api } from './services/api';
import type {
  Ticket,
  Policy,
  TicketUpdate,
  AgentStage,
  AgentProposal,
  ToolCallLog,
  TicketCategory,
  TicketStatus
} from './types';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'console' | 'policies' | 'audit'>('console');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [savedUpdates, setSavedUpdates] = useState<TicketUpdate[]>([]);
  
  // Agent Workflow State
  const [agentStage, setAgentStage] = useState<AgentStage>('idle');
  const [currentProposal, setCurrentProposal] = useState<AgentProposal | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [toolLogs, setToolLogs] = useState<ToolCallLog[]>([]);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Approval & Modals
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [pendingApprovalData, setPendingApprovalData] = useState<{
    category: TicketCategory;
    next_status: TicketStatus;
    response_draft: string;
    policy_ids: string[];
  } | null>(null);

  // Feedback notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // System Health
  const [systemHealth, setSystemHealth] = useState({
    connected: false,
    provider: 'Gemini',
    model: 'gemini-2.5-flash'
  });

  // Initial Data Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingTickets(true);
    try {
      // 1. Health check
      try {
        const health = await api.checkHealth();
        setSystemHealth({
          connected: health.database.connected,
          provider: health.ai.provider,
          model: health.ai.model
        });
      } catch {
        setSystemHealth({ connected: false, provider: 'Local Engine', model: 'Deterministic' });
      }

      // 2. Load tickets
      const ticketRes = await api.getTickets();
      if (ticketRes.success) {
        setTickets(ticketRes.tickets);
        if (ticketRes.tickets.length > 0 && !selectedTicket) {
          setSelectedTicket(ticketRes.tickets[0]);
        }
      }

      // 3. Load policies
      const policyRes = await api.getPolicies();
      if (policyRes.success) {
        setPolicies(policyRes.policies);
      }

      // 4. Load updates
      const updatesRes = await api.getAllUpdates();
      if (updatesRes.success) {
        setSavedUpdates(updatesRes.updates);
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      showNotification('error', `Initialization notice: ${err.message}`);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Reset investigation state for fresh ticket
    setAgentStage('idle');
    setCurrentProposal(null);
    setClarificationQuestion(null);
    setToolLogs([]);
  };

  // Start Agent Investigation
  const handleInvestigate = async () => {
    if (!selectedTicket) return;

    setIsInvestigating(true);
    setAgentStage('reading_ticket');
    setCurrentProposal(null);
    setClarificationQuestion(null);

    try {
      // Simulated intermediate visual transitions
      setTimeout(() => setAgentStage('searching_policies'), 400);
      setTimeout(() => setAgentStage('checking_completeness'), 800);

      const result = await api.investigate({
        ticket_id: selectedTicket.id
      });

      if (result.tool_logs) {
        setToolLogs(result.tool_logs);
      }

      if (result.type === 'clarification') {
        setAgentStage('clarification_needed');
        setClarificationQuestion(result.question);
        showNotification('success', 'Agent identified missing details required by policy.');
      } else if (result.type === 'proposal') {
        setAgentStage('proposal_ready');
        setCurrentProposal(result);
        showNotification('success', 'Policy-grounded resolution proposal formulated successfully.');
      } else if (result.type === 'error') {
        setAgentStage('error');
        showNotification('error', result.message || 'Agent investigation encountered an error.');
      }
    } catch (err: any) {
      setAgentStage('error');
      showNotification('error', `Failed to investigate ticket: ${err.message}`);
    } finally {
      setIsInvestigating(false);
    }
  };

  // Resume Agent with Clarification Answer
  const handleSubmitClarification = async (answer: string) => {
    if (!selectedTicket) return;

    setIsInvestigating(true);
    setAgentStage('searching_policies');

    try {
      const result = await api.investigate({
        ticket_id: selectedTicket.id,
        clarification_answer: answer
      });

      if (result.tool_logs) {
        setToolLogs(result.tool_logs);
      }

      if (result.type === 'clarification') {
        setAgentStage('clarification_needed');
        setClarificationQuestion(result.question);
      } else if (result.type === 'proposal') {
        setAgentStage('proposal_ready');
        setCurrentProposal(result);
        setClarificationQuestion(null);
        showNotification('success', 'Clarification processed. Proposal updated with policy evidence.');
      } else if (result.type === 'error') {
        setAgentStage('error');
        showNotification('error', result.message);
      }
    } catch (err: any) {
      setAgentStage('error');
      showNotification('error', `Clarification submission failed: ${err.message}`);
    } finally {
      setIsInvestigating(false);
    }
  };

  // Trigger Human Approval Modal
  const handleOpenApprovalModal = (data: {
    category: TicketCategory;
    next_status: TicketStatus;
    response_draft: string;
    policy_ids: string[];
  }) => {
    setPendingApprovalData(data);
    setApprovalModalOpen(true);
    setAgentStage('awaiting_approval');
  };

  // Execute Explicit Confirmation
  const handleConfirmUpdate = async () => {
    if (!selectedTicket || !pendingApprovalData) return;

    setIsSaving(true);
    setAgentStage('saving');

    try {
      const result = await api.confirmUpdate(selectedTicket.id, {
        approved_category: pendingApprovalData.category,
        proposed_status: pendingApprovalData.next_status,
        response_draft: pendingApprovalData.response_draft,
        supporting_policy_ids: pendingApprovalData.policy_ids
      });

      if (result.success) {
        setAgentStage('saved');
        setApprovalModalOpen(false);
        showNotification('success', `Update #${result.update.update_id} successfully persisted to Cloudflare D1!`);

        // Refresh tickets and updates
        await loadInitialData();

        // Update local selected ticket
        setSelectedTicket(prev => prev ? {
          ...prev,
          status: pendingApprovalData.next_status,
          category: pendingApprovalData.category
        } : null);
      } else {
        showNotification('error', result.message || 'Failed to persist update.');
      }
    } catch (err: any) {
      showNotification('error', `Database commit error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reopen an update from audit trail
  const handleReopenTicket = (ticketId: string) => {
    const found = tickets.find(t => t.id === ticketId);
    if (found) {
      setSelectedTicket(found);
      setActiveTab('console');
    }
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
      />

      {/* Floating Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '24px',
          zIndex: 100,
          background: notification.type === 'success' ? '#065f46' : '#7f1d1d',
          border: `1px solid ${notification.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          animation: 'fadeIn 0.2s ease',
          fontSize: '0.85rem'
        }}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TAB 1: Main Investigation Console */}
      {activeTab === 'console' && (
        <main className="dashboard-grid">
          {/* Column 1: Ticket Selector */}
          <TicketList
            tickets={tickets}
            selectedTicket={selectedTicket}
            onSelectTicket={handleSelectTicket}
            isLoading={isLoadingTickets}
            onRefresh={loadInitialData}
          />

          {/* Column 2: Investigation Central Workspace */}
          <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            {selectedTicket ? (
              <>
                {/* Visual Workflow Stepper */}
                <WorkflowStepper currentStage={agentStage} />

                {/* Ticket Details Banner */}
                <div className="ticket-detail-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span className="ticket-id" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                        {selectedTicket.id}
                      </span>
                      <h2 className="ticket-detail-title">{selectedTicket.subject}</h2>
                    </div>
                    <span className="badge badge-open" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                      Status: {selectedTicket.status}
                    </span>
                  </div>

                  <div className="ticket-meta-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <strong style={{ color: '#fff' }}>Customer:</strong> {selectedTicket.customer_name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={13} /> {selectedTicket.customer_email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      <strong style={{ color: '#fff' }}>Purchase Date:</strong> {selectedTicket.purchase_date || <span style={{ color: '#f87171' }}>Missing / Null</span>}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Layers size={13} /> Category: {selectedTicket.category}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                      Customer Complaint & Request:
                    </span>
                    <div className="ticket-description-box">
                      {selectedTicket.description}
                    </div>
                  </div>
                </div>

                {/* Investigation Trigger Bar */}
                <div className="investigation-box">
                  <button
                    onClick={handleInvestigate}
                    disabled={isInvestigating}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Sparkles size={16} />
                    <span>{isInvestigating ? 'Agent Investigating Complaint...' : 'Investigate Complaint with AI Agent'}</span>
                  </button>

                  {agentStage !== 'idle' && (
                    <button
                      onClick={() => handleSelectTicket(selectedTicket)}
                      className="nav-btn"
                      style={{ border: '1px solid var(--border-color)', padding: '0.65rem 1rem' }}
                      title="Reset workflow"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>

                {/* Clarification Box (Turn 4 - Missing Info) */}
                {agentStage === 'clarification_needed' && clarificationQuestion && (
                  <ClarificationPrompt
                    question={clarificationQuestion}
                    onSubmit={handleSubmitClarification}
                    isLoading={isInvestigating}
                  />
                )}

                {/* Proposed Resolution (Turn 5 - Policy Grounded) */}
                {currentProposal && (
                  <ResolutionEditor
                    proposal={currentProposal}
                    onOpenApprovalModal={handleOpenApprovalModal}
                    isLoading={isSaving}
                  />
                )}

                {/* Persisted Success Banner */}
                {agentStage === 'saved' && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <CheckCircle size={32} color="#34d399" style={{ margin: '0 auto 0.5rem' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                      Resolution Successfully Committed
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                      The ticket update and response draft have been persisted to the remote database audit log.
                    </p>
                    <button
                      onClick={() => setAuditModalOpen(true)}
                      className="btn-primary"
                      style={{ margin: '0 auto', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                    >
                      View Audit Log
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                Select a ticket from the left column to begin investigation.
              </div>
            )}
          </div>

          {/* Column 3: Evidence & Tool Logs Inspector */}
          <EvidenceViewer
            policies={policies}
            citedPolicyIds={currentProposal?.policy_ids || []}
            toolLogs={toolLogs}
          />
        </main>
      )}

      {/* TAB 2: Policies Explorer */}
      {activeTab === 'policies' && (
        <main style={{ padding: '0 1.5rem', flex: 1 }}>
          <PolicyExplorer policies={policies} />
        </main>
      )}

      {/* TAB 3: Saved Updates Audit Trail */}
      {activeTab === 'audit' && (
        <main style={{ padding: '0 1.5rem', flex: 1, maxWidth: 1200, margin: '1.5rem auto', width: '100%' }}>
          <div className="glass-panel">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              All Saved Ticket Updates
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {savedUpdates.map(u => (
                <div
                  key={u.id}
                  style={{
                    background: 'rgba(26, 34, 52, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      Update #{u.id} • {u.ticket_id} ({u.customer_name})
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>
                      {u.subject}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', alignItems: 'center' }}>
                      <span className="badge badge-open">{u.previous_status}</span>
                      <ArrowRight size={12} color="var(--text-dim)" />
                      <span className="badge badge-resolved">{u.proposed_status}</span>
                      <span className="badge badge-category">{u.approved_category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReopenTicket(u.ticket_id)}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                  >
                    Open Ticket
                  </button>
                </div>
              ))}
              {savedUpdates.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                  No saved updates yet. Approve a resolution to record an audit entry.
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Human Approval Modal */}
      {approvalModalOpen && selectedTicket && pendingApprovalData && (
        <ApprovalModal
          ticket={selectedTicket}
          proposal={pendingApprovalData}
          onConfirm={handleConfirmUpdate}
          onClose={() => setApprovalModalOpen(false)}
          isLoading={isSaving}
        />
      )}

      {/* Audit History Drawer Modal */}
      {auditModalOpen && (
        <AuditHistoryModal
          updates={savedUpdates}
          onClose={() => setAuditModalOpen(false)}
          onSelectTicket={handleReopenTicket}
        />
      )}
    </div>
  );
};

export default App;
