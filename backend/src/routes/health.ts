import { Hono } from 'hono';
import { getDatabase } from '../services/db.js';

export const healthRouter = new Hono();

healthRouter.get('/', async (c) => {
  try {
    const db = getDatabase(c.env as any);
    const dbCheck = await db.queryFirst<{ alive: number }>('SELECT 1 as alive');
    const ticketCount = await db.queryFirst<{ count: number }>('SELECT count(*) as count FROM tickets');
    const policyCount = await db.queryFirst<{ count: number }>('SELECT count(*) as count FROM policies');

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AI Customer Support Resolution Agent API',
      database: {
        connected: dbCheck?.alive === 1,
        tickets_count: ticketCount?.count ?? 0,
        policies_count: policyCount?.count ?? 0
      },
      ai: {
        provider: process.env.AI_PROVIDER || (c.env as any)?.AI_PROVIDER || 'gemini',
        model: process.env.MODEL_NAME || (c.env as any)?.MODEL_NAME || 'gemini-2.5-flash'
      }
    });
  } catch (error: any) {
    return c.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    }, 503);
  }
});
