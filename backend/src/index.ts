import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';

import { healthRouter } from './routes/health.js';
import { ticketsRouter } from './routes/tickets.js';
import { policiesRouter } from './routes/policies.js';
import { updatesRouter } from './routes/updates.js';
import { agentRouter } from './routes/agent.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = new Hono();

// Middleware: Request logging
app.use('*', logger());

// Middleware: CORS restricted to allowed origins
app.use('*', async (c, next) => {
  const rawAllowed = (process.env.ALLOWED_ORIGIN || '*').trim();
  const corsMiddleware = cors({
    origin: (incomingOrigin) => {
      if (!incomingOrigin) return '*';

      const cleanIncoming = incomingOrigin.trim().replace(/\/+$/, '');
      const cleanAllowed = rawAllowed.replace(/\/+$/, '');

      // If allowedOrigin is '*', reflect the incoming origin so credentials work
      if (cleanAllowed === '*' || cleanAllowed === '') {
        return incomingOrigin;
      }

      // If allowed origin matches (with or without trailing slash)
      if (cleanAllowed === cleanIncoming) {
        return incomingOrigin;
      }

      // If allowed origin contains comma-separated origins
      const allowedList = cleanAllowed.split(',').map(s => s.trim().replace(/\/+$/, ''));
      if (allowedList.includes(cleanIncoming)) {
        return incomingOrigin;
      }

      // Automatically allow Vercel deployments and localhost
      if (
        cleanIncoming.endsWith('.vercel.app') ||
        cleanIncoming.includes('localhost') ||
        cleanIncoming.includes('127.0.0.1')
      ) {
        return incomingOrigin;
      }

      return cleanAllowed;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Central Error Handler
app.onError(errorHandler);

// Mount API routes with aliases for frontend compatibility
app.route('/health', healthRouter);
app.route('/api/health', healthRouter);
app.route('/tickets', ticketsRouter);
app.route('/api/tickets', ticketsRouter);
app.route('/policies', policiesRouter);
app.route('/api/policies', policiesRouter);
app.route('/updates', updatesRouter);
app.route('/api/updates', updatesRouter);
app.route('/outbox', updatesRouter);
app.route('/api/outbox', updatesRouter);
app.route('/api/agent', agentRouter);

// Root route
app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'AI Customer Support Resolution Agent API is online.',
    docs: '/api/health',
    version: '1.0.0'
  });
});

// Start Node server when not in Cloudflare Workers environment and not in test mode
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production_worker' && process.env.NODE_ENV !== 'test') {
  const port = parseInt(process.env.PORT || '8787', 10);
  serve({
    fetch: app.fetch,
    port
  }, (info) => {
    console.log(`🚀 API Server running at http://localhost:${info.port}`);
  });
}

export default app;
