import type { IDatabaseService } from '../services/db.js';
import type { Ticket, TicketCategory, TicketStatus } from '../types/index.js';

export interface UpdateTicketInput {
  ticket_id: string;
  category?: TicketCategory;
  status?: TicketStatus;
  approved_category?: TicketCategory;
  proposed_status?: TicketStatus;
  response_draft: string;
  policy_ids?: string[];
  supporting_policy_ids?: string[];
  is_confirmed?: boolean; // True only when submitted by human support officer
}

export interface SessionPrerequisites {
  hasReadTicket: boolean;
  hasSearchedPolicies: boolean;
  allowedPolicyIds?: string[];
}

export interface UpdateTicketResult {
  success: boolean;
  status?: string; // "PENDING_APPROVAL" | "COMMITTED"
  update_id?: number;
  ticket_id?: string;
  previous_status?: string;
  proposed_status?: string;
  approved_category?: string;
  response_draft?: string;
  evidence_policy_ids?: string[];
  saved_at?: string;
  error?: string;
  error_code?: string;
}

const VALID_CATEGORIES = ['Refund', 'Delivery', 'Account', 'Account Access', 'Other'];
const VALID_STATUSES = ['Open', 'In Progress', 'Pending Customer', 'Resolved', 'Escalated'];

export async function updateTicket(
  input: UpdateTicketInput,
  db: IDatabaseService,
  session?: SessionPrerequisites
): Promise<UpdateTicketResult> {
  const ticket_id = input.ticket_id;
  const category = input.category || (input as any).approved_category;
  const status = input.status || (input as any).proposed_status;
  const response_draft = input.response_draft;
  const policy_ids = input.policy_ids || (input as any).supporting_policy_ids || [];
  const is_confirmed = input.is_confirmed;

  // 1. Validate basic argument existence
  if (!ticket_id || typeof ticket_id !== 'string') {
    return {
      success: false,
      error_code: 'INVALID_ARGUMENT',
      error: 'Validation error: INVALID_ARGUMENT: ticket_id is required'
    };
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return {
      success: false,
      error_code: 'INVALID_ARGUMENT',
      error: `Validation error: INVALID_ARGUMENT: category must be one of: ${VALID_CATEGORIES.join(', ')}`
    };
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return {
      success: false,
      error_code: 'INVALID_ARGUMENT',
      error: `Validation error: INVALID_ARGUMENT: status must be one of: ${VALID_STATUSES.join(', ')}`
    };
  }

  if (!response_draft || response_draft.trim().length === 0) {
    return {
      success: false,
      error_code: 'INVALID_ARGUMENT',
      error: 'Validation error: INVALID_ARGUMENT: response_draft cannot be empty'
    };
  }

  // 2. Human approval check when called outside AI agent loop
  if (!session && !is_confirmed) {
    return {
      success: false,
      error_code: 'INVALID_ARGUMENT',
      error: 'SECURITY REJECTION: Explicit human approval (is_confirmed: true) is strictly required to persist ticket updates.'
    };
  }

  // 3. Code-Enforced Prerequisites Check (when called by AI agent loop)
  if (session) {
    if (!session.hasReadTicket) {
      return {
        success: false,
        error_code: 'PREREQUISITE_NOT_MET',
        error: 'PREREQUISITE_NOT_MET: read_ticket must succeed before update_ticket can be called.'
      };
    }

    if (!session.hasSearchedPolicies) {
      return {
        success: false,
        error_code: 'PREREQUISITE_NOT_MET',
        error: 'PREREQUISITE_NOT_MET: search_policies must succeed before update_ticket can be called.'
      };
    }

    if (session.allowedPolicyIds && Array.isArray(policy_ids)) {
      for (const pid of policy_ids) {
        if (!session.allowedPolicyIds.includes(pid)) {
          return {
            success: false,
            error_code: 'INVALID_ARGUMENT',
            error: `INVALID_ARGUMENT: policy_id "${pid}" does not exist in policy search results.`
          };
        }
      }
    }
  }

  // 4. Verify ticket existence in database
  const existingTicket = await db.queryFirst<Ticket>(
    'SELECT id, status, category FROM tickets WHERE id = ?',
    [ticket_id]
  );

  if (!existingTicket) {
    return {
      success: false,
      error_code: 'TICKET_NOT_FOUND',
      error: `TICKET_NOT_FOUND: Ticket ${ticket_id} does not exist.`
    };
  }

  // 5. Verify supporting policy IDs exist in database
  const policyIdsArray = policy_ids || [];
  if (policyIdsArray.length > 0) {
    const placeholders = policyIdsArray.map(() => '?').join(', ');
    const foundPolicies = await db.queryAll<{ id: string; policy_code: string }>(
      `SELECT id, policy_code FROM policies WHERE id IN (${placeholders}) OR policy_code IN (${placeholders})`,
      [...policyIdsArray, ...policyIdsArray]
    );

    const foundSet = new Set(foundPolicies.flatMap(p => [p.id, p.policy_code]));
    const missing = policyIdsArray.filter((pid: string) => !foundSet.has(pid));

    if (missing.length > 0) {
      return {
        success: false,
        error_code: 'INVALID_ARGUMENT',
        error: `Policy verification failure: INVALID_ARGUMENT: Policy ID(s) do not exist in database: ${missing.join(', ')}`
      };
    }
  }

  // 6. If called in AI agent loop without explicit human confirmation:
  // Return PENDING_APPROVAL per spec:
  if (!is_confirmed) {
    return {
      success: true,
      status: 'PENDING_APPROVAL',
      ticket_id,
      previous_status: existingTicket.status,
      proposed_status: status,
      approved_category: category,
      response_draft,
      evidence_policy_ids: policyIdsArray
    };
  }

  // 7. Explicit Human Confirmation: commit transaction to database
  const previous_status = existingTicket.status;

  await db.execute(
    `UPDATE tickets SET status = ?, category = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, category, ticket_id]
  );

  const insertResult = await db.execute(
    `INSERT INTO ticket_updates (ticket_id, previous_status, proposed_status, approved_category, response_draft, evidence_policy_ids, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      ticket_id,
      previous_status,
      status,
      category,
      response_draft,
      JSON.stringify(policyIdsArray)
    ]
  );

  return {
    success: true,
    status: 'COMMITTED',
    update_id: Number(insertResult.lastInsertRowid),
    ticket_id,
    previous_status,
    proposed_status: status,
    approved_category: category,
    response_draft,
    evidence_policy_ids: policyIdsArray,
    saved_at: new Date().toISOString()
  };
}
