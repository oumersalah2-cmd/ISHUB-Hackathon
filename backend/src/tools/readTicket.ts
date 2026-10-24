import type { IDatabaseService } from '../services/db.js';
import type { Ticket } from '../types/index.js';
import { readTicketInputSchema } from '../validation/schemas.js';

export interface ReadTicketResult {
  success: boolean;
  ticket?: Ticket;
  missing_fields: string[];
  error?: string;
  error_code?: string;
}

const TODAY_STR = '2026-10-24';

function calculateDaysDifference(dateStr: string, baseDateStr = TODAY_STR): number {
  const d1 = new Date(dateStr);
  const d2 = new Date(baseDateStr);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function calculateBusinessDays(startDateStr: string, endDateStr = TODAY_STR): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  let businessDays = 0;
  const cur = new Date(start);

  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }

  return businessDays;
}

export async function readTicket(
  input: { ticket_id: string },
  db: IDatabaseService
): Promise<ReadTicketResult> {
  const parsed = readTicketInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      missing_fields: [],
      error_code: 'INVALID_ARGUMENT',
      error: `Validation error: ${parsed.error.errors.map(e => e.message).join(', ')}`
    };
  }

  const { ticket_id } = parsed.data;

  const ticket = await db.queryFirst<Ticket>(
    'SELECT id, customer_name, customer_email, subject, description, category, status, purchase_date, created_at, updated_at FROM tickets WHERE id = ?',
    [ticket_id]
  );

  if (!ticket) {
    return {
      success: false,
      missing_fields: [],
      error_code: 'TICKET_NOT_FOUND',
      error: `Ticket not found: ${ticket_id}`
    };
  }

  // Compute values required by specification (TODAY: 2026-10-24)
  const days_since_purchase = ticket.purchase_date ? calculateDaysDifference(ticket.purchase_date) : null;
  const business_days_since_shipping = ticket.purchase_date ? calculateBusinessDays(ticket.purchase_date) : null;

  const enrichedTicket: Ticket = {
    ...ticket,
    days_since_purchase,
    business_days_since_shipping
  };

  // Detect missing fields required by company policy
  const missingFields: string[] = [];
  const lowerDesc = (ticket.description + ' ' + ticket.subject).toLowerCase();

  // If refund request and no purchase date provided in database
  if ((ticket.category === 'Refund' || lowerDesc.includes('refund') || lowerDesc.includes('return')) && !ticket.purchase_date) {
    missingFields.push('purchase_date');
  }

  return {
    success: true,
    ticket: enrichedTicket,
    missing_fields: missingFields
  };
}
