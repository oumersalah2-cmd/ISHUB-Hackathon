import type { IDatabaseService } from '../services/db.js';
import type { Ticket } from '../types/index.js';
import { readTicketInputSchema } from '../validation/schemas.js';
import {
  calculateDaysSincePurchase,
  calculateBusinessDaysSinceShipping
} from '../utils/dateUtils.js';

export interface ReadTicketResult {
  success: boolean;
  ticket?: Ticket;
  missing_fields: string[];
  error?: string;
  error_code?: string;
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
    'SELECT id, customer_name, customer_email, subject, description, category, status, order_id, purchase_date, shipping_date, note, created_at, updated_at FROM tickets WHERE id = ?',
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
  const days_since_purchase = ticket.purchase_date
    ? calculateDaysSincePurchase(ticket.purchase_date)
    : null;

  const business_days_since_shipping = ticket.shipping_date
    ? calculateBusinessDaysSinceShipping(ticket.shipping_date)
    : null;

  const enrichedTicket: Ticket = {
    ...ticket,
    days_since_purchase,
    business_days_since_shipping
  };

  // Detect missing fields required by company policy
  const missingFields: string[] = [];
  const lowerText = `${ticket.description} ${ticket.subject}`.toLowerCase();

  // POL-REFUND-01: A refund request must include the order number and the purchase date.
  const isRefund = ticket.category === 'Refund' || lowerText.includes('refund') || lowerText.includes('return');
  if (isRefund) {
    if (!ticket.purchase_date) {
      missingFields.push('purchase_date');
    }
    if (!ticket.order_id && !lowerText.includes('ord-')) {
      missingFields.push('order_id');
    }
  }

  // POL-DELIVERY-01: The order number and shipping date are required to apply this policy.
  const isDelivery = ticket.category === 'Delivery' || lowerText.includes('ship') || lowerText.includes('deliver') || lowerText.includes('courier');
  if (isDelivery) {
    if (!ticket.shipping_date) {
      missingFields.push('shipping_date');
    }
    if (!ticket.order_id && !lowerText.includes('ord-')) {
      missingFields.push('order_id');
    }
  }

  return {
    success: true,
    ticket: enrichedTicket,
    missing_fields: missingFields
  };
}
