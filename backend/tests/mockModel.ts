/**
 * MockModel - Deterministic Stub for Unit Testing
 *
 * NOTE: Per the Hackathon specification, this stub is strictly confined to test suites
 * (such as verifying offline database state transitions and simulated-failure recovery).
 * It is never invoked during live application runtime.
 */

import type { IDatabaseService } from '../src/services/db.js';
import { readTicket } from '../src/tools/readTicket.js';
import { searchPolicies } from '../src/tools/searchPolicies.js';
import { updateTicket } from '../src/tools/updateTicket.js';
import type {
  AgentResponse,
  ToolCallLog,
  TicketCategory,
  TicketStatus
} from '../src/types/index.js';
import type { InvestigateOptions } from '../src/services/ai.js';

export class MockModel {
  static async investigateTicket(
    options: InvestigateOptions,
    db: IDatabaseService,
    toolLogs: ToolCallLog[] = []
  ): Promise<AgentResponse & { tool_logs: ToolCallLog[] }> {
    const { ticket_id, clarification_answer, force_failure } = options;

    if (!ticket_id) {
      return {
        type: 'error',
        message: 'No ticket ID provided.',
        tool_logs: toolLogs
      };
    }

    if (force_failure) {
      return {
        type: 'error',
        message: 'SIMULATED_FAILURE: Model service connection aborted intentionally for test evaluation.',
        ticket_id,
        tool_logs: toolLogs
      };
    }

    let toolCallsCount = 0;
    let hasReadTicket = false;
    let hasSearchedPolicies = false;
    let allowedPolicyIds: string[] = [];

    // Step 1: Call read_ticket
    const ticketResult = await readTicket({ ticket_id }, db);
    toolCallsCount++;
    hasReadTicket = ticketResult.success;
    toolLogs.push({
      tool: 'read_ticket',
      input: { ticket_id },
      output: ticketResult as any,
      timestamp: new Date().toISOString()
    });

    if (!ticketResult.success || !ticketResult.ticket) {
      return {
        type: 'error',
        message: ticketResult.error || `Ticket ${ticket_id} not found.`,
        ticket_id,
        tool_logs: toolLogs
      };
    }

    const ticket = ticketResult.ticket;
    let effectivePurchaseDate = ticket.purchase_date;

    // Step 2: Call search_policies
    let searchCategory = ticket.category as any;
    let searchKeywords = ticket.subject;

    if (ticket.category === 'Refund' || ticket.subject.toLowerCase().includes('refund')) {
      searchCategory = 'Refund';
      searchKeywords = 'refund return 14-day';
    } else if (ticket.category === 'Delivery' || ticket.subject.toLowerCase().includes('ship') || ticket.subject.toLowerCase().includes('arrived')) {
      searchCategory = 'Delivery';
      searchKeywords = 'delivery delay 7 business days 10 business days';
    } else if (ticket.category === 'Account' || ticket.category === 'Account Access' || ticket.subject.toLowerCase().includes('password') || ticket.subject.toLowerCase().includes('lock')) {
      searchCategory = 'Account';
      searchKeywords = 'account access locked reset link';
    } else if (ticket.subject.toLowerCase().includes('price') || ticket.description.toLowerCase().includes('price')) {
      searchCategory = 'Other';
      searchKeywords = 'price match';
    }

    const policyResult = await searchPolicies({ query: searchKeywords, category: searchCategory === 'Other' ? undefined : searchCategory }, db);
    toolCallsCount++;
    hasSearchedPolicies = policyResult.success;
    allowedPolicyIds = (policyResult.policies || []).map((p: any) => p.policy_id || p.policy_code || p.id);
    toolLogs.push({
      tool: 'search_policies',
      input: { query: searchKeywords, category: searchCategory },
      output: policyResult as any,
      timestamp: new Date().toISOString()
    });

    // Step 3: Compare ticket to policy text
    if (!effectivePurchaseDate && clarification_answer) {
      const dateMatch = clarification_answer.match(/\d{4}-\d{2}-\d{2}/) || clarification_answer.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
      effectivePurchaseDate = dateMatch ? dateMatch[0] : clarification_answer;
    }

    const isRefundIssue = ticket.category === 'Refund' || ticket.subject.toLowerCase().includes('refund') || ticket.subject.toLowerCase().includes('return');
    if (isRefundIssue && !effectivePurchaseDate) {
      const refundPolicyId = allowedPolicyIds.find(id => id.includes('REFUND') || id.includes('REF')) || 'POL-REFUND-01';
      return {
        type: 'clarification',
        question: 'What was the purchase date of the order? Under our Refund Policy (POL-REFUND-01), the purchase date is required to verify eligibility for a full refund within 14 days of purchase.',
        missing_field: 'purchase_date',
        policy_ids: [refundPolicyId],
        category: 'Refund',
        ticket_id,
        tool_calls_count: toolCallsCount,
        tool_logs: toolLogs
      };
    }

    // Out of policy / Escalation
    const isEscalationCase =
      ticket.id === 'T-005' ||
      ticket.description.toLowerCase().includes('price') ||
      ticket.subject.toLowerCase().includes('price') ||
      policyResult.policies.length === 0;

    if (isEscalationCase) {
      const sessionPrereqs = { hasReadTicket, hasSearchedPolicies, allowedPolicyIds };
      const draft = `Dear ${ticket.customer_name},\n\nThank you for contacting customer support regarding "${ticket.subject}"${ticket.order_id ? ` for order ${ticket.order_id}` : ''}.\n\nOur company policies do not cover price matching or refunding price differences. We are escalating your request to a specialist for further review.\n\nSincerely,\nCustomer Support Team`;

      await updateTicket(
        {
          ticket_id,
          category: 'Other',
          status: 'Escalated',
          response_draft: draft,
          policy_ids: []
        },
        db,
        sessionPrereqs
      );

      toolLogs.push({
        tool: 'update_ticket',
        input: { ticket_id, category: 'Other', status: 'Escalated', response_draft: draft, policy_ids: [] },
        output: { status: 'PENDING_APPROVAL' },
        timestamp: new Date().toISOString()
      });

      return {
        type: 'proposal',
        category: 'Other',
        next_status: 'Escalated',
        response_draft: draft,
        policy_ids: [],
        reasoning_summary: 'No matching policy found to cover price matching requests, so escalating to specialist with empty policy_ids.',
        ticket_id,
        tool_calls_count: toolCallsCount,
        tool_logs: toolLogs
      };
    }

    // Policy applied
    const matchedPolicy = policyResult.policies[0];
    const matchedPolicyId = (matchedPolicy as any).policy_id || matchedPolicy.policy_code || matchedPolicy.id;
    const daysSincePurchase = ticket.days_since_purchase ?? (effectivePurchaseDate ? 4 : null);

    let category: TicketCategory = 'Other';
    let nextStatus: TicketStatus = 'Pending Customer';
    let draft = '';
    let reasoning = '';

    if (matchedPolicy.category === 'Refund') {
      category = 'Refund';
      nextStatus = 'Pending Customer';
      draft = `Dear ${ticket.customer_name},\n\nThank you for contacting customer support regarding your ${ticket.subject} (order ${ticket.order_id || 'ORD-1001'}).\n\nUnder our ${matchedPolicy.title} (${matchedPolicyId}), customers may request a full refund within 14 days of the purchase date for physical items that are unused and in original packaging. Your purchase on ${effectivePurchaseDate} was made ${daysSincePurchase ?? 4} days ago, which is within the 14-day eligibility window.\n\nWe have prepared your request for a full refund for order ${ticket.order_id || 'ORD-1001'}.\n\nSincerely,\nCustomer Support Team`;
      reasoning = `Facts used: order_id is ${ticket.order_id || 'ORD-1001'}, purchase_date is ${effectivePurchaseDate} (${daysSincePurchase ?? 4} days since purchase <= 14). Policy applied: ${matchedPolicyId} (full refund within 14 days for unused physical items). Proposed status 'Pending Customer'.`;
    } else if (matchedPolicy.category === 'Delivery') {
      category = 'Delivery';
      nextStatus = 'Pending Customer';
      const bizDays = ticket.business_days_since_shipping ?? 11;
      draft = `Dear ${ticket.customer_name},\n\nThank you for contacting customer support regarding order ${ticket.order_id || 'ORD-1003'}.\n\nAccording to our ${matchedPolicy.title} (${matchedPolicyId}), if an order has not arrived 10 business days after shipping, the customer may choose a free re-shipment or a full refund. Your order was shipped on ${ticket.shipping_date || '2026-10-08'}, which is ${bizDays} business days ago.\n\nPlease reply to let us know whether you prefer a free re-shipment or a full refund.\n\nSincerely,\nCustomer Support Team`;
      reasoning = `Facts used: order ${ticket.order_id || 'ORD-1003'} shipped on ${ticket.shipping_date || '2026-10-08'} (${bizDays} business days elapsed > 10). Policy applied: ${matchedPolicyId} (authorizes customer choice of free re-shipment or full refund after 10 business days). Proposed status 'Pending Customer'.`;
    } else if (matchedPolicy.category === 'Account' || matchedPolicy.category === 'Account Access') {
      category = 'Account';
      nextStatus = 'Resolved';
      draft = `Dear ${ticket.customer_name},\n\nThank you for contacting customer support regarding your locked account.\n\nIn accordance with our ${matchedPolicy.title} (${matchedPolicyId}), an account locked after failed login attempts can be unlocked sooner by requesting a password reset link sent only to your registered email address (${ticket.customer_email}). Support staff must never ask for or accept your password.\n\nPlease use the password reset link sent to your registered email (${ticket.customer_email}) to reset your password and restore access.\n\nSincerely,\nCustomer Support Team`;
      reasoning = `Facts used: customer email matches registered profile (${ticket.customer_email}) and customer has access to registered email. Policy applied: ${matchedPolicyId} (unlock via password reset link sent only to registered email, support staff never ask for/accept password). Security rules satisfied. Proposed status 'Resolved'.`;
    }

    const sessionPrereqs = { hasReadTicket, hasSearchedPolicies, allowedPolicyIds };
    const updateResult = await updateTicket(
      {
        ticket_id,
        category,
        status: nextStatus,
        response_draft: draft,
        policy_ids: [matchedPolicyId]
      },
      db,
      sessionPrereqs
    );

    toolCallsCount++;
    toolLogs.push({
      tool: 'update_ticket',
      input: { ticket_id, category, status: nextStatus, response_draft: draft, policy_ids: [matchedPolicyId] },
      output: updateResult as any,
      timestamp: new Date().toISOString()
    });

    return {
      type: 'proposal',
      category,
      next_status: nextStatus,
      response_draft: draft,
      policy_ids: [matchedPolicyId],
      reasoning_summary: reasoning,
      ticket_id,
      tool_calls_count: toolCallsCount,
      tool_logs: toolLogs
    };
  }
}
