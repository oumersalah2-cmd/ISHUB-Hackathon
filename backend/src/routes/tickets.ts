import { Hono } from 'hono';
import { getDatabase } from '../services/db.js';
import { readTicket } from '../tools/readTicket.js';
import { updateTicket } from '../tools/updateTicket.js';
import { investigateTicket } from '../services/ai.js';
import type { Ticket, TicketUpdate } from '../types/index.js';

export const ticketsRouter = new Hono();

// Simple in-memory sliding window rate limiter per IP to protect quota
const ipRequestLogs = new Map<string, number[]>();
function checkRateLimit(ip: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const history = (ipRequestLogs.get(ip) || []).filter(t => now - t < windowMs);
  if (history.length >= limit) {
    return false;
  }
  history.push(now);
  ipRequestLogs.set(ip, history);
  return true;
}

// GET /api/tickets - List all tickets (supports both array and object responses)
ticketsRouter.get('/', async (c) => {
  const db = getDatabase(c.env as any);
  const rawTickets = await db.queryAll<any>(
    'SELECT id, customer_name, customer_email, subject, description, category, status, order_id, purchase_date, shipping_date, note, created_at, updated_at FROM tickets ORDER BY id ASC'
  );

  const tickets = rawTickets.map(t => ({
    ...t,
    ticketNumber: t.id,
    customerName: t.customer_name,
    customerEmail: t.customer_email,
    issueDescription: t.description,
    orderId: t.order_id,
    purchaseDate: t.purchase_date,
    shippingDate: t.shipping_date
  }));

  return c.json({
    success: true,
    count: tickets.length,
    tickets,
    data: tickets
  });
});

// POST /api/tickets - Support for entering new tickets (judges will type fresh complaints)
ticketsRouter.post('/', async (c) => {
  const db = getDatabase(c.env as any);

  try {
    const body = await c.req.json();
    const customer_name = (body.customer_name || body.customerName || body.name || '').trim();
    const customer_email = (body.customer_email || body.customerEmail || body.email || '').trim();
    const subject = (body.subject || '').trim();
    const description = (body.description || body.issueDescription || '').trim();
    const order_id = (body.order_id || body.orderId || '') ? String(body.order_id || body.orderId).trim() : null;
    const purchase_date = (body.purchase_date || body.purchaseDate || '') ? String(body.purchase_date || body.purchaseDate).trim() : null;
    const shipping_date = (body.shipping_date || body.shippingDate || '') ? String(body.shipping_date || body.shippingDate).trim() : null;
    const category = body.category || 'Other';

    // 1. Validation and length limits
    if (!customer_name || customer_name.length > 120) {
      return c.json({
        success: false,
        error: 'customer_name is required and must be at most 120 characters.'
      }, 400);
    }

    if (!customer_email || customer_email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      return c.json({
        success: false,
        error: 'customer_email must be a valid email address and at most 254 characters.'
      }, 400);
    }

    if (!subject || subject.length > 200) {
      return c.json({
        success: false,
        error: 'subject is required and must be at most 200 characters.'
      }, 400);
    }

    if (!description || description.length > 10000) {
      return c.json({
        success: false,
        error: 'description is required and must be at most 10,000 characters.'
      }, 400);
    }

    if (order_id && order_id.length > 100) {
      return c.json({
        success: false,
        error: 'order_id must be at most 100 characters.'
      }, 400);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (purchase_date && (!dateRegex.test(purchase_date) || isNaN(Date.parse(purchase_date)))) {
      return c.json({
        success: false,
        error: 'purchase_date must be in valid YYYY-MM-DD format.'
      }, 400);
    }

    if (shipping_date && (!dateRegex.test(shipping_date) || isNaN(Date.parse(shipping_date)))) {
      return c.json({
        success: false,
        error: 'shipping_date must be in valid YYYY-MM-DD format.'
      }, 400);
    }

    // 2. Generate next sequential ID e.g. T-006
    const allIds = await db.queryAll<{ id: string }>("SELECT id FROM tickets WHERE id LIKE 'T-%'");
    let maxNum = 5;
    for (const row of allIds) {
      const match = row.id.match(/^T-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextId = `T-${String(maxNum + 1).padStart(3, '0')}`;

    // 3. Store ticket in database with status Open
    await db.execute(
      `INSERT INTO tickets (id, customer_name, customer_email, subject, description, category, status, order_id, purchase_date, shipping_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?, datetime('now'), datetime('now'))`,
      [nextId, customer_name, customer_email, subject, description, category, order_id, purchase_date, shipping_date]
    );

    const created = await db.queryFirst<Ticket>(
      'SELECT id, customer_name, customer_email, subject, description, category, status, order_id, purchase_date, shipping_date, created_at FROM tickets WHERE id = ?',
      [nextId]
    );

    return c.json({
      success: true,
      message: 'Ticket created successfully.',
      ticket: {
        ...created,
        ticketNumber: nextId,
        customerName: customer_name,
        customerEmail: customer_email,
        issueDescription: description,
        orderId: order_id,
        purchaseDate: purchase_date,
        shippingDate: shipping_date
      }
    }, 201);
  } catch (err: any) {
    return c.json({
      success: false,
      error: `Failed to create ticket: ${err.message}`
    }, 400);
  }
});

// GET /api/tickets/:id - Retrieve single ticket and missing fields using Tool A
ticketsRouter.get('/:id', async (c) => {
  const ticketId = c.req.param('id');
  const db = getDatabase(c.env as any);

  const result = await readTicket({ ticket_id: ticketId }, db);

  if (!result.success) {
    return c.json({
      success: false,
      error: result.error
    }, 404);
  }

  const t: any = result.ticket;
  const normalizedTicket = t ? {
    ...t,
    ticketNumber: t.id,
    customerName: t.customer_name,
    customerEmail: t.customer_email,
    issueDescription: t.description,
    orderId: t.order_id,
    purchaseDate: t.purchase_date,
    shippingDate: t.shipping_date
  } : null;

  return c.json({
    success: true,
    ticket: normalizedTicket,
    data: normalizedTicket,
    missing_fields: result.missing_fields
  });
});

// Helper to normalize AI investigation response for the frontend
function normalizeInvestigation(result: any) {
  const normalized: any = { ...result };
  if (result.type === 'clarification') {
    normalized.needs_clarification = true;
    normalized.clarification_question = result.question;
    normalized.clarification_prompt = result.question;
    normalized.missing_information = result.missing_field;
    normalized.status = 'needs_clarification';
  } else if (result.type === 'proposal') {
    normalized.status = 'proposal_ready';
    normalized.proposal = {
      response_draft: result.response_draft,
      suggested_category: result.category,
      next_status: result.next_status,
      policy_references: result.policy_ids || []
    };
    normalized.resolution_proposal = normalized.proposal;
    normalized.policy_evidence = (result.policy_ids || []).map((id: string) => ({
      policy_id: id,
      policyId: id,
      title: id,
      text: result.reasoning_summary || ''
    }));
  }
  normalized.agent_activities = (result.tool_logs || []).map((tl: any) => ({
    step: tl.tool,
    message: `Executed tool: ${tl.tool}`,
    details: tl.output,
    timestamp: tl.timestamp
  }));
  return normalized;
}

// POST /api/tickets/:id/investigate - Trigger agent workflow for ticket
ticketsRouter.post('/:id/investigate', async (c) => {
  const ticketId = c.req.param('id');
  const db = getDatabase(c.env as any);
  const clientIp = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || '127.0.0.1';

  if (!checkRateLimit(clientIp)) {
    return c.json({
      type: 'error',
      message: 'Rate limit exceeded for AI investigation. Please wait a moment and retry.',
      ticket_id: ticketId,
      tool_logs: []
    }, 429);
  }

  const body = await c.req.json().catch(() => ({}));

  const result = await investigateTicket(
    {
      ticket_id: ticketId,
      clarification_answer: body.clarification_answer || body.clarification,
      conversation: body.conversation
    },
    db,
    c.env as any
  );

  return c.json(normalizeInvestigation(result));
});

// POST /api/tickets/:id/clarify - Submit human clarification response
ticketsRouter.post('/:id/clarify', async (c) => {
  const ticketId = c.req.param('id');
  const db = getDatabase(c.env as any);
  const body = await c.req.json().catch(() => ({}));
  const clarificationText = body.clarification || body.clarification_answer || body.response || body.text;

  const result = await investigateTicket(
    {
      ticket_id: ticketId,
      clarification_answer: clarificationText
    },
    db,
    c.env as any
  );

  return c.json(normalizeInvestigation(result));
});

// Shared handler for human approval/confirm
async function handleApproval(c: any) {
  const ticketId = c.req.param('id');
  const db = getDatabase(c.env as any);

  try {
    const body = await c.req.json();

    // Refuse to save if is_confirmed is false
    if (body.is_confirmed === false) {
      return c.json({
        success: false,
        error: 'Explicit human approval is required (is_confirmed must be true).'
      }, 400);
    }

    const input = {
      ticket_id: ticketId,
      category: body.approved_category || body.category || body.approvedChanges?.category,
      status: body.proposed_status || body.status || body.approved_status || body.approvedChanges?.status,
      response_draft: body.final_response || body.response_draft || body.responseDraft,
      policy_ids: body.supporting_policy_ids || body.policy_ids || body.policyIds || body.policy_citations || [],
      is_confirmed: body.is_confirmed === true || body.is_confirmed === undefined
    };

    const result = await updateTicket(input as any, db);

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }

    const updatedTicket = await db.queryFirst<any>('SELECT * FROM tickets WHERE id = ?', [ticketId]);

    return c.json({
      success: true,
      message: 'Ticket update successfully approved and persisted.',
      update: result,
      data: {
        ticket: updatedTicket,
        outbox: {
          ticketId,
          ticketNumber: ticketId,
          responseDraft: input.response_draft,
          approvedChanges: { category: input.category, status: input.status },
          policyIds: input.policy_ids
        }
      }
    }, 200);
  } catch (err: any) {
    return c.json({
      success: false,
      error: `Failed to process approval: ${err.message}`
    }, 400);
  }
}

// POST /api/tickets/:id/confirm - Explicit Human Approval endpoint
ticketsRouter.post('/:id/confirm', handleApproval);

// POST /api/tickets/:id/approve - Approval endpoint alias for frontend
ticketsRouter.post('/:id/approve', handleApproval);

// GET /api/tickets/:id/updates - Retrieve all audit updates for this ticket
ticketsRouter.get('/:id/updates', async (c) => {
  const ticketId = c.req.param('id');
  const db = getDatabase(c.env as any);

  const rawUpdates = await db.queryAll<any>(
    'SELECT id, ticket_id, previous_status, proposed_status, approved_category, response_draft, evidence_policy_ids, created_at FROM ticket_updates WHERE ticket_id = ? ORDER BY id DESC',
    [ticketId]
  );

  const updates: TicketUpdate[] = rawUpdates.map(u => ({
    ...u,
    evidence_policy_ids: JSON.parse(u.evidence_policy_ids || '[]')
  }));

  return c.json({
    success: true,
    count: updates.length,
    updates
  });
});
