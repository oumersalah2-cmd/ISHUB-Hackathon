// Core TypeScript Domain Types

export type TicketCategory = 'Refund' | 'Delivery' | 'Account' | 'Account Access' | 'Other';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending Customer' | 'Resolved' | 'Escalated';

export interface Ticket {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  order_id?: string | null;
  purchase_date?: string | null;
  shipping_date?: string | null;
  note?: string;
  created_at: string;
  updated_at: string;
  // Computed values per spec (TODAY = 2026-10-24)
  days_since_purchase?: number | null;
  business_days_since_shipping?: number | null;
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
  evidence_policy_ids: string[]; // parsed from JSON
  created_at: string;
}

// AI Agent Types (conforming to SRS Section 7 and Reasoning Core Specification)
export type AgentResponseType = 'proposal' | 'clarification' | 'error';

export interface AgentClarificationResponse {
  type: 'clarification';
  question: string;
  missing_field: string;
  policy_ids: string[];
  category?: TicketCategory;
  ticket_id?: string;
  tool_calls_count?: number;
}

export interface AgentProposalResponse {
  type: 'proposal';
  category: TicketCategory;
  next_status: TicketStatus;
  response_draft: string;
  policy_ids: string[];
  reasoning_summary: string;
  ticket_id?: string;
  tool_calls_count?: number;
}

export interface AgentErrorResponse {
  type: 'error';
  message: string;
  ticket_id?: string;
  details?: unknown;
}

export type AgentResponse =
  | AgentClarificationResponse
  | AgentProposalResponse
  | AgentErrorResponse;

// Conversation turn for multi-round clarification
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Tool Call Audit Record (for transparent demonstration / judge inspection)
export interface ToolCallLog {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  timestamp: string;
}
