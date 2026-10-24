import { Hono } from 'hono';
import { getDatabase } from '../services/db.js';
import { searchPolicies } from '../tools/searchPolicies.js';
import type { Policy } from '../types/index.js';

export const policiesRouter = new Hono();

// GET /api/policies - List or search policies using Tool B
policiesRouter.get('/', async (c) => {
  const db = getDatabase(c.env as any);
  const query = c.req.query('query');
  const category = c.req.query('category') as any;

  const result = await searchPolicies({ query, category }, db);

  return c.json({
    success: true,
    count: result.count,
    policies: result.policies,
    message: result.message
  });
});

// GET /api/policies/:id - Retrieve single policy by ID or policy_code
policiesRouter.get('/:id', async (c) => {
  const policyId = c.req.param('id');
  const db = getDatabase(c.env as any);

  const policy = await db.queryFirst<Policy>(
    'SELECT id, policy_code, title, category, policy_text, applicable_conditions, created_at FROM policies WHERE id = ? OR policy_code = ?',
    [policyId, policyId]
  );

  if (!policy) {
    return c.json({
      success: false,
      error: `Policy not found: ${policyId}`
    }, 404);
  }

  return c.json({
    success: true,
    policy
  });
});
