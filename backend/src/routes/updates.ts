import { Hono } from 'hono';
import { getDatabase } from '../services/db.js';
import type { TicketUpdate } from '../types/index.js';

export const updatesRouter = new Hono();

// GET /api/updates - List all updates across all tickets
updatesRouter.get('/', async (c) => {
  const db = getDatabase(c.env as any);

  const rawUpdates = await db.queryAll<any>(
    `SELECT u.id, u.ticket_id, u.previous_status, u.proposed_status, u.approved_category, 
            u.response_draft, u.evidence_policy_ids, u.created_at, t.subject, t.customer_name
     FROM ticket_updates u
     LEFT JOIN tickets t ON u.ticket_id = t.id
     ORDER BY u.id DESC`
  );

  const updates = rawUpdates.map(u => ({
    ...u,
    evidence_policy_ids: JSON.parse(u.evidence_policy_ids || '[]')
  }));

  return c.json({
    success: true,
    count: updates.length,
    updates
  });
});

// GET /api/updates/:id - Retrieve single update by ID (reopen a saved update)
updatesRouter.get('/:id', async (c) => {
  const updateId = parseInt(c.req.param('id'), 10);
  if (isNaN(updateId)) {
    return c.json({ success: false, error: 'Invalid update ID' }, 400);
  }

  const db = getDatabase(c.env as any);

  const raw = await db.queryFirst<any>(
    `SELECT u.id, u.ticket_id, u.previous_status, u.proposed_status, u.approved_category, 
            u.response_draft, u.evidence_policy_ids, u.created_at, t.subject, t.customer_name, t.customer_email
     FROM ticket_updates u
     LEFT JOIN tickets t ON u.ticket_id = t.id
     WHERE u.id = ?`,
    [updateId]
  );

  if (!raw) {
    return c.json({
      success: false,
      error: `Update record not found: ${updateId}`
    }, 404);
  }

  const update: TicketUpdate & { subject?: string; customer_name?: string; customer_email?: string } = {
    ...raw,
    evidence_policy_ids: JSON.parse(raw.evidence_policy_ids || '[]')
  };

  return c.json({
    success: true,
    update
  });
});
