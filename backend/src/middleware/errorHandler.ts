import type { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('API Error:', err);
  
  const status = (err as any).status || 500;
  return c.json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status
    }
  }, status);
};
