import { Hono } from 'hono';
import { getDatabase } from '../services/db.js';
import { investigateTicket } from '../services/ai.js';
import { investigateRequestSchema } from '../validation/schemas.js';

export const agentRouter = new Hono();

// POST /api/agent/investigate - Trigger agent workflow
agentRouter.post('/investigate', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = investigateRequestSchema.safeParse(body);

    if (!parsed.success) {
      const errorDetails = (parsed.error.issues || (parsed.error as any).errors || []).map((e: any) => e.message).join(', ');
      return c.json({
        type: 'error',
        message: `Validation error: ${errorDetails}`
      }, 400);
    }

    const { ticket_id, clarification_answer, conversation } = parsed.data;
    const db = getDatabase(c.env as any);

    const result = await investigateTicket(
      {
        ticket_id,
        clarification_answer,
        conversation
      },
      db,
      c.env as any
    );

    return c.json(result);
  } catch (error: any) {
    return c.json({
      type: 'error',
      message: error.message || 'An unexpected error occurred during agent investigation.'
    }, 500);
  }
});
