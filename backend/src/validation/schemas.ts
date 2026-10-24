import { z } from 'zod';

export const allowedCategories = ['Refund', 'Delivery', 'Account', 'Account Access', 'Other'] as const;
export const allowedStatuses = ['Open', 'In Progress', 'Pending Customer', 'Resolved', 'Escalated'] as const;

export const categorySchema = z.enum(allowedCategories);
export const statusSchema = z.enum(allowedStatuses);

// Validation schema for Tool A (read_ticket)
export const readTicketInputSchema = z.object({
  ticket_id: z.string().trim().min(1, 'ticket_id is required').max(50)
});

// Validation schema for Tool B (search_policies)
export const searchPoliciesInputSchema = z.object({
  query: z.string().trim().optional(),
  keywords: z.string().trim().optional(),
  category: categorySchema.optional()
});

// Validation schema for Tool C (update_ticket)
export const updateTicketInputSchema = z.object({
  ticket_id: z.string().trim().min(1, 'ticket_id is required'),
  approved_category: categorySchema,
  proposed_status: statusSchema,
  response_draft: z.string().trim().min(5, 'Response draft must be at least 5 characters long').max(4000),
  supporting_policy_ids: z.array(z.string().trim().min(1)).min(1, 'At least one supporting policy ID must be provided'),
  is_confirmed: z.literal(true, {
    errorMap: () => ({ message: 'Explicit human approval is required (is_confirmed must be true)' })
  })
});

// Validation schema for investigate request
export const investigateRequestSchema = z.object({
  ticket_id: z.string().trim().min(1, 'ticket_id is required'),
  clarification_answer: z.string().trim().max(1000).optional(),
  conversation: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(2000)
  })).optional()
});

export type ReadTicketInput = z.infer<typeof readTicketInputSchema>;
export type SearchPoliciesInput = z.infer<typeof searchPoliciesInputSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketInputSchema>;
export type InvestigateRequest = z.infer<typeof investigateRequestSchema>;
