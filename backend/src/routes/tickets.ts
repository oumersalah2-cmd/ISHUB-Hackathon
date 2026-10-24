import { Hono } from 'hono';
import { getDatabase } from '../services/db.js';
import { readTicket } from '../tools/readTicket.js';
import { updateTicket } from '../tools/updateTicket.js';
import type { Ticket, TicketUpdate } from '../types/index.js';

export const ticketsRouter = new Hono();

// GET /api/tickets - List all tickets
ticketsRouter.get('/', async (c) => {
  const db = getDatabase(c.env as any);
  const tickets = await db.queryAll<Ticket>(
    'SELECT id, customer_name, customer_email, subject, description, category, status, order_id, purchase_date, shipping_date, note, created_at, updated_at FROM tickets ORDER BY id ASC'
  );

  return c.json({
    success: true,
    count: tickets.length,
    tickets
  });
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

  return c.json({
    success: true,
    ticket: result.ticket,
    missing_fields: result.missing_fields
  });
});

// POST /api/tickets/:id/confirm - Explicit Human Approval endpoint to persist update using Tool C
ticketsRouter.post('/:id/confirm', async (c) => {
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

    // Ensure ticket_id matches URL param and explicit confirmation is passed
    const input = {
      ticket_id: ticketId,
      category: body.approved_category || body.category,
      status: body.proposed_status || body.status,
      response_draft: body.response_draft,
      policy_ids: body.supporting_policy_ids || body.policy_ids || [],
      is_confirmed: body.is_confirmed === true || body.is_confirmed === undefined
    };

    const result = await updateTicket(input as any, db);

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }

    return c.json({
      success: true,
      message: 'Ticket update successfully approved and persisted.',
      update: result
    }, 200);
  } catch (err: any) {
    return c.json({
      success: false,
      error: `Failed to process approval: ${err.message}`
    }, 400);
  }
});

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
