export type TicketCategory = 'Refund' | 'Delivery' | 'Account Access' | 'Other';
export type TicketStatus = 'Open' | 'Pending Customer' | 'Resolved' | 'Escalated';

export interface Ticket {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  purchase_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Policy {
  id: string;
  policy_code: string;
  title: string;
  category: TicketCategory;
  policy_text: string;
  applicable_conditions: string;
  created_at: string;
}

export interface TicketUpdate {
  id: number;
  ticket_id: string;
  previous_status: TicketStatus;
  proposed_status: TicketStatus;
  approved_category: TicketCategory;
  response_draft: string;
  evidence_policy_ids: string[];
  created_at: string;
  subject?: string;
  customer_name?: string;
  customer_email?: string;
}

export interface ToolCallLog {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  timestamp: string;
}

export type AgentStage =
  | 'idle'
  | 'reading_ticket'
  | 'searching_policies'
  | 'checking_completeness'
  | 'clarification_needed'
  | 'proposal_ready'
  | 'awaiting_approval'
  | 'saving'
  | 'saved'
  | 'error';

export interface AgentClarification {
  type: 'clarification';
  question: string;
  category?: TicketCategory;
  ticket_id: string;
  tool_logs?: ToolCallLog[];
}

export interface AgentProposal {
  type: 'proposal';
  category: TicketCategory;
  next_status: TicketStatus;
  response_draft: string;
  policy_ids: string[];
  reasoning_summary: string;
  ticket_id: string;
  tool_logs?: ToolCallLog[];
}

export interface AgentError {
  type: 'error';
  message: string;
  ticket_id?: string;
  tool_logs?: ToolCallLog[];
}

export type AgentResult = AgentClarification | AgentProposal | AgentError;
