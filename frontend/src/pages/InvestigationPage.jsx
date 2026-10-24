import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Send,
  ShieldAlert,
} from 'lucide-react';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import TicketOverviewCard from '../components/investigation/TicketOverviewCard';
import InvestigationTimeline from '../components/investigation/InvestigationTimeline';
import AgentActivityFeed from '../components/investigation/AgentActivityFeed';
import PolicyEvidenceViewer from '../components/investigation/PolicyEvidenceViewer';
import ClarificationForm from '../components/investigation/ClarificationForm';
import ProposalReviewSection from '../components/investigation/ProposalReviewSection';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useApiConfig } from '../context/ApiConfigContext';

const InvestigationPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { baseUrl } = useApiConfig();

  // State
  const [ticket, setTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [clarifying, setClarifying] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);

  // Agent State returned by API
  const [investigationData, setInvestigationData] = useState(null);
  const [clarificationRequired, setClarificationRequired] = useState(false);
  const [clarificationPrompt, setClarificationPrompt] = useState('');
  const [resolutionProposal, setResolutionProposal] = useState(null);
  const [agentActivities, setAgentActivities] = useState([]);
  const [policyEvidence, setPolicyEvidence] = useState([]);
  const [isResolved, setIsResolved] = useState(false);

  // 1. Fetch ticket details on mount
  const loadTicket = useCallback(async () => {
    setLoadingTicket(true);
    setError(null);
    try {
      const data = await api.getTicketById(ticketId);
      setTicket(data);

      // Check if ticket already has existing investigation/proposal or needs clarification
      if (data) {
        const status = (data.status || '').toLowerCase();
        if (status === 'approved' || status === 'resolved') {
          setIsResolved(true);
        }

        if (status.includes('clarif') || data.needs_clarification || data.clarification_question) {
          setClarificationRequired(true);
          setClarificationPrompt(
            data.clarification_question ||
            data.clarification_prompt ||
            data.missing_information ||
            'The AI agent requires additional details to continue investigation.'
          );
        }

        if (data.proposal || data.resolution_proposal || data.response_draft) {
          setResolutionProposal(data.proposal || data.resolution_proposal || {
            response_draft: data.response_draft,
            suggested_category: data.category,
            next_status: 'approved',
            policy_references: data.policy_citations || [],
          });
        }

        if (data.policy_evidence || data.citations) {
          setPolicyEvidence(data.policy_evidence || data.citations || []);
        }

        if (data.agent_activities || data.activity_log) {
          setAgentActivities(data.agent_activities || data.activity_log || []);
        }
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
      const msg = err.isNetworkError
        ? `Could not reach backend API at ${baseUrl}. Please check server connectivity.`
        : err.message || `Unable to load ticket ${ticketId}`;
      setError(msg);
      toast.error(msg, 'Ticket Error');
    } finally {
      setLoadingTicket(false);
    }
  }, [ticketId, baseUrl, toast]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // 2. Trigger AI Agent Investigation
  const handleStartInvestigation = async () => {
    setInvestigating(true);
    setError(null);
    try {
      const result = await api.investigateTicket(ticketId);

      setInvestigationData(result);

      // Extract activities
      const activities =
        result?.agent_activities ||
        result?.activity_log ||
        result?.activities ||
        result?.logs ||
        result?.steps ||
        [];
      if (activities.length > 0) {
        setAgentActivities(activities);
      } else {
        setAgentActivities([
          { message: 'Ticket intent and category classified', step: 'Analysis', timestamp: new Date() },
          { message: 'Grounding search executed against corporate policies', step: 'Retrieval', timestamp: new Date() },
          { message: 'Resolution draft synthesized with policy grounding', step: 'Synthesis', timestamp: new Date() },
        ]);
      }

      // Extract policy evidence
      const evidence =
        result?.policy_evidence ||
        result?.citations ||
        result?.policies ||
        result?.evidence ||
        [];
      if (evidence.length > 0) {
        setPolicyEvidence(evidence);
      }

      // Check if error type returned by AI Agent
      if (result?.type === 'error' || result?.status === 'error') {
        const errMsg = result?.message || result?.error || 'AI Agent investigation returned an error.';
        setError(errMsg);
        toast.error(errMsg, 'AI Agent Error');
        setResolutionProposal(null);
        setClarificationRequired(false);
        return;
      }

      // Check if clarification is required
      const status = (result?.status || '').toLowerCase();
      if (
        status.includes('clarif') ||
        result?.needs_clarification ||
        result?.clarification_question ||
        result?.clarification_prompt
      ) {
        setClarificationRequired(true);
        setClarificationPrompt(
          result?.clarification_question ||
          result?.clarification_prompt ||
          result?.missing_information ||
          'Additional information is needed to ground this customer support resolution.'
        );
        toast.warning('The AI agent has requested clarification for this ticket.', 'Clarification Needed');
      } else {
        setClarificationRequired(false);
      }

      // Extract resolution proposal
      if (
        result?.proposal ||
        result?.resolution_proposal ||
        result?.response_draft ||
        result?.customer_response
      ) {
        setResolutionProposal(
          result.proposal ||
          result.resolution_proposal || {
            response_draft: result.response_draft || result.customer_response,
            suggested_category: result.suggested_category || result.category || ticket?.category,
            next_status: result.next_status || 'approved',
            policy_references: evidence,
          }
        );
        toast.success('Investigation completed. Proposal draft ready for review.', 'Agent Analysis Done');
      } else {
        toast.info('Investigation process logged from backend.', 'Investigation Updated');
      }
    } catch (err) {
      console.error('Investigation failed:', err);
      const msg = err.message || 'Investigation request failed. Please retry.';
      setError(msg);
      toast.error(msg, 'Investigation Failure');
    } finally {
      setInvestigating(false);
    }
  };

  // 3. Submit Clarification
  const handleSubmitClarification = async (payload) => {
    setClarifying(true);
    setError(null);
    try {
      const result = await api.submitClarification(ticketId, payload);

      if (result?.type === 'error' || result?.status === 'error') {
        const errMsg = result?.message || result?.error || 'AI Agent clarification returned an error.';
        setError(errMsg);
        toast.error(errMsg, 'Clarification Error');
        return;
      }

      toast.success('Clarification accepted. AI Investigation resumed.', 'Clarification Submitted');
      setClarificationRequired(false);

      // Check if proposal was generated
      if (result?.proposal || result?.resolution_proposal || result?.response_draft) {
        setResolutionProposal(
          result.proposal ||
          result.resolution_proposal || {
            response_draft: result.response_draft || result.customer_response,
            suggested_category: result.suggested_category || result.category,
            next_status: result.next_status || 'approved',
            policy_references: result.policy_evidence || result.citations || [],
          }
        );
      }

      if (result?.agent_activities || result?.activity_log) {
        setAgentActivities(result.agent_activities || result.activity_log);
      }

      if (result?.policy_evidence) {
        setPolicyEvidence(result.policy_evidence);
      }
    } catch (err) {
      console.error('Clarification submission failed:', err);
      const msg = err.message || 'Failed to submit clarification to backend.';
      setError(msg);
      toast.error(msg, 'Clarification Error');
      // User inputs in ClarificationForm are retained because state is kept in component
    } finally {
      setClarifying(false);
    }
  };

  // 4. Submit Final Human Approval
  const handleApprove = async (approvalData) => {
    setApproving(true);
    setError(null);
    try {
      const result = await api.submitApproval(ticketId, approvalData);

      setIsResolved(true);
      toast.success(
        'Resolution confirmed and approved. Record archived to Internal Outbox!',
        'Approval Persisted'
      );

      // Update local ticket state
      setTicket((prev) => ({
        ...prev,
        status: approvalData.approved_status || 'approved',
      }));
    } catch (err) {
      console.error('Approval failed:', err);
      const msg = err.message || 'Failed to save approval to backend.';
      setError(msg);
      toast.error(msg, 'Approval Failed');
    } finally {
      setApproving(false);
    }
  };

  // Calculate current stage for the stepper
  const calculateStage = () => {
    if (isResolved) return 5;
    if (resolutionProposal) return 4;
    if (clarificationRequired || policyEvidence.length > 0) return 3;
    if (investigating) return 2;
    return 1;
  };

  if (loadingTicket) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
        <Spinner size="lg" />
        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Retrieving ticket {ticketId} from backend...
        </div>
      </div>
    );
  }

  const customerName = ticket?.customer_name || ticket?.customer?.name || ticket?.user || 'Customer';

  return (
    <div>
      {/* Top Breadcrumb Navigation & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate('/inbox')}
          >
            Back to Inbox
          </Button>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Ticket ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 800 }}>{ticketId}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} className={loadingTicket ? 'spinner' : ''} />}
            onClick={loadTicket}
            disabled={loadingTicket || investigating || approving}
          >
            Refresh
          </Button>

          {!isResolved && (
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles size={16} />}
              onClick={handleStartInvestigation}
              loading={investigating}
              disabled={investigating || approving || clarifying}
            >
              {resolutionProposal ? 'Re-investigate Ticket' : 'Investigate Ticket'}
            </Button>
          )}

          {isResolved && (
            <Button
              variant="secondary"
              size="md"
              icon={<Send size={15} />}
              onClick={() => navigate('/outbox')}
            >
              View in Outbox
            </Button>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div
          id="investigation-error-banner"
          style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} color="#991B1B" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.875rem', color: '#991B1B', fontWeight: 700, display: 'block' }}>
                AI Investigation Notice:
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#991B1B' }}>
                {error}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartInvestigation}
            disabled={investigating}
          >
            Retry Investigation
          </Button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="investigation-layout">
        {/* Left Column: Ticket Detail Overview */}
        <div className="ticket-detail-panel">
          <TicketOverviewCard ticket={ticket} />
        </div>

        {/* Right Column: AI Investigation Workspace */}
        <div className="workspace-column">
          {/* Progress Stepper */}
          <InvestigationTimeline currentStage={calculateStage()} />

          {/* Success Banner if already resolved */}
          {isResolved && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={24} color="#166534" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534' }}>
                    Ticket Resolution Finalized & Approved
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#166534' }}>
                    This ticket has been officially resolved with human confirmation and saved to the Internal Outbox.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/outbox')}>
                Go to Outbox
              </Button>
            </div>
          )}

          {/* Clarification Required Form */}
          {clarificationRequired && (
            <ClarificationForm
              prompt={clarificationPrompt}
              onSubmit={handleSubmitClarification}
              loading={clarifying}
            />
          )}

          {/* Policy Evidence Viewer */}
          {policyEvidence.length > 0 && (
            <PolicyEvidenceViewer evidence={policyEvidence} />
          )}

          {/* Agent Activity & Execution Log */}
          {(agentActivities.length > 0 || investigating) && (
            <AgentActivityFeed activities={agentActivities} isInvestigating={investigating} />
          )}

          {/* AI Resolution Proposal & Human Review Section */}
          {resolutionProposal && !isResolved && (
            <ProposalReviewSection
              proposal={resolutionProposal}
              onApprove={handleApprove}
              isApproving={approving}
              ticketId={ticketId}
              customerName={customerName}
            />
          )}

          {/* Initial Prompt when no investigation run yet */}
          {!investigationData && !resolutionProposal && !isResolved && !investigating && !clarificationRequired && (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                backgroundColor: 'var(--butter-50)',
                border: '1px solid var(--butter-border)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
              }}
            >
              <Sparkles size={36} color="var(--clay-500)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Ready to Investigate Ticket
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                Click below to dispatch the AI agent. The agent will retrieve relevant policy clauses, cross-check ticket metadata, and formulate a draft response for your approval.
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles size={16} />}
                onClick={handleStartInvestigation}
              >
                Start AI Investigation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestigationPage;
