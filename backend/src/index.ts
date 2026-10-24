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
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const corsMiddleware = cors({
    origin: (origin) => {
      // Allow localhost frontend during development and testing
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin || '*';
      }
      return allowedOrigin === '*' ? origin : allowedOrigin;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Central Error Handler
app.onError(errorHandler);

// Mount API routes
app.route('/api/health', healthRouter);
app.route('/api/tickets', ticketsRouter);
app.route('/api/policies', policiesRouter);
app.route('/api/updates', updatesRouter);
app.route('/api/agent', agentRouter);

// Root route
app.get('/', (c) => {
  return c.json({
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
