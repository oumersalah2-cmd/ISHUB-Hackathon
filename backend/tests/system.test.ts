/**
 * NOTE: These are mocked-model unit and integration tests verifying the agent reasoning core,
 * API contracts, tool execution, and database state transitions.
 * The live Gemini model evaluation results come from live_run.ts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../src/services/db.js';
import { readTicket } from '../src/tools/readTicket.js';
import { searchPolicies } from '../src/tools/searchPolicies.js';
import { updateTicket } from '../src/tools/updateTicket.js';
import { investigateTicket } from '../src/services/ai.js';
import app from '../src/index.js';

describe('Mock Tests: AI Customer Support Resolution Agent - 10 Core Test Cases (seed-data.json)', () => {
  const db = getDatabase();

  beforeEach(async () => {
    // Reset database to pristine seed-data.json state before each test
    await db.resetAndSeed();
  });

  // Test 1: Retrieving an existing ticket
  it('1. Retrieving an existing ticket (Mock Test): readTicket retrieves valid ticket details for T-001', async () => {
    const result = await readTicket({ ticket_id: 'T-001' }, db);
    expect(result.success).toBe(true);
    expect(result.ticket).toBeDefined();
    expect(result.ticket?.customer_name).toBe('Abel Tesfaye');
    expect(result.ticket?.category).toBe('Refund');
    expect(result.ticket?.purchase_date).toBe('2026-10-20');
    expect(result.ticket?.order_id).toBe('ORD-1001');
    expect(result.ticket?.days_since_purchase).toBe(4);
    expect(result.missing_fields).toHaveLength(0);
  });

  // Test 2: Handling a nonexistent ticket
  it('2. Handling a nonexistent ticket (Mock Test): readTicket returns structured error without inventing data', async () => {
    const result = await readTicket({ ticket_id: 'T-9999' }, db);
    expect(result.success).toBe(false);
    expect(result.ticket).toBeUndefined();
    expect(result.error).toContain('Ticket not found: T-9999');
  });

  // Test 3: Searching policies
  it('3. Searching policies (Mock Test): searchPolicies returns matching policy with rules and conditions', async () => {
    const result = await searchPolicies({ query: 'refund return', category: 'Refund' }, db);
    expect(result.success).toBe(true);
    expect(result.count).toBeGreaterThan(0);
    expect(result.policies[0].policy_code).toBe('POL-REFUND-01');
    expect(result.policies[0].policy_text).toContain('14 days');
  });

  // Test 4: Asking for missing information
  it('4. Asking for missing information (Mock Test): T-002 with null purchase date returns clarification question', async () => {
    const result = await investigateTicket({ ticket_id: 'T-002' }, db);
    expect(result.type).toBe('clarification');
    if (result.type === 'clarification') {
      expect(result.question.toLowerCase()).toContain('purchase date');
      expect(result.category).toBe('Refund');
      expect(result.missing_field).toBe('purchase_date');
      expect(result.policy_ids).toContain('POL-REFUND-01');
    }
  });

  // Test 5: Preventing updates before confirmation
  it('5. Preventing updates before confirmation (Mock Test): updateTicket strictly rejects updates without is_confirmed', async () => {
    const unconfirmedInput: any = {
      ticket_id: 'T-001',
      approved_category: 'Refund',
      proposed_status: 'Pending Customer',
      response_draft: 'We will process your refund shortly.',
      supporting_policy_ids: ['POL-REFUND-01'],
      is_confirmed: false // Explicit confirmation omitted
    };

    const result = await updateTicket(unconfirmedInput, db);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Explicit human approval');

    // Verify ticket in database remains unchanged
    const ticketInDb = await db.queryFirst<any>('SELECT status FROM tickets WHERE id = ?', ['T-001']);
    expect(ticketInDb.status).toBe('Open');
  });

  // Test 6: Saving a confirmed update
  it('6. Saving a confirmed update (Mock Test): updateTicket persists changes and records audit entry', async () => {
    const confirmedInput = {
      ticket_id: 'T-001',
      approved_category: 'Refund' as const,
      proposed_status: 'Pending Customer' as const,
      response_draft: 'Dear Abel, your refund has been prepared under POL-REFUND-01.',
      supporting_policy_ids: ['POL-REFUND-01'],
      is_confirmed: true as const
    };

    const result = await updateTicket(confirmedInput, db);
    expect(result.success).toBe(true);
    expect(result.update_id).toBeDefined();
    expect(result.previous_status).toBe('Open');
    expect(result.proposed_status).toBe('Pending Customer');

    // Verify ticket status in database was updated
    const updatedTicket = await db.queryFirst<any>('SELECT status, category FROM tickets WHERE id = ?', ['T-001']);
    expect(updatedTicket.status).toBe('Pending Customer');
    expect(updatedTicket.category).toBe('Refund');

    // Verify audit record exists in ticket_updates
    const updateRecord = await db.queryFirst<any>('SELECT * FROM ticket_updates WHERE id = ?', [result.update_id]);
    expect(updateRecord).toBeDefined();
    expect(updateRecord.ticket_id).toBe('T-001');
    expect(updateRecord.response_draft).toContain('Dear Abel');
  });

  // Test 7: Reopening a saved update
  it('7. Reopening a saved update (Mock Test): GET /api/updates/:id returns complete historical details', async () => {
    // First save an update for T-003
    const confirmedInput = {
      ticket_id: 'T-003',
      approved_category: 'Delivery' as const,
      proposed_status: 'Pending Customer' as const,
      response_draft: 'Dear Dawit, your replacement shipment has been processed.',
      supporting_policy_ids: ['POL-DELIVERY-01'],
      is_confirmed: true as const
    };
    const updateResult = await updateTicket(confirmedInput, db);

    // Call REST endpoint to reopen the saved update
    const response = await app.request(`/api/updates/${updateResult.update_id}`);
    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.success).toBe(true);
    expect(body.update.ticket_id).toBe('T-003');
    expect(body.update.customer_name).toBe('Dawit Alemu');
    expect(body.update.evidence_policy_ids).toContain('POL-DELIVERY-01');
    expect(body.update.response_draft).toContain('Dear Dawit');
  });

  // Test 8: Handling a model API failure
  it('8. Handling a model API failure (Mock Test): Simulated failure returns clear error without data mutation', async () => {
    const result = await investigateTicket({ ticket_id: 'T-001', force_failure: true }, db);
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.message).toContain('SIMULATED_FAILURE');
    }

    // Verify no updates were saved in database
    const updates = await db.queryAll('SELECT * FROM ticket_updates WHERE ticket_id = ?', ['T-001']);
    expect(updates).toHaveLength(0);
  });

  // Test 9: Handling a database failure / error path
  it('9. Handling a database failure (Mock Test): Nonexistent policy ID in update causes clean rollback and rejection', async () => {
    const invalidPolicyInput = {
      ticket_id: 'T-001',
      approved_category: 'Refund' as const,
      proposed_status: 'Pending Customer' as const,
      response_draft: 'Valid response text here.',
      supporting_policy_ids: ['POL-FABRICATED-999'], // Fabricated ID
      is_confirmed: true as const
    };

    const result = await updateTicket(invalidPolicyInput, db);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Policy verification failure');

    // Confirm no ticket updates were persisted
    const updates = await db.queryAll('SELECT * FROM ticket_updates');
    expect(updates).toHaveLength(0);
  });

  // Test 10: Validating invalid input
  it('10. Validating invalid input (Mock Test): Rejects malformed status, empty draft, and empty ticket ID', async () => {
    // 10a: Empty ticket ID
    const emptyIdResult = await readTicket({ ticket_id: '' }, db);
    expect(emptyIdResult.success).toBe(false);
    expect(emptyIdResult.error).toContain('Validation error');

    // 10b: Malformed status in update
    const invalidStatusInput: any = {
      ticket_id: 'T-001',
      approved_category: 'Refund',
      proposed_status: 'TotallyInvalidStatus',
      response_draft: 'Some valid draft.',
      supporting_policy_ids: ['POL-REFUND-01'],
      is_confirmed: true
    };
    const invalidStatusResult = await updateTicket(invalidStatusInput, db);
    expect(invalidStatusResult.success).toBe(false);
    expect(invalidStatusResult.error).toContain('Validation error');

    // 10c: Empty response draft
    const emptyDraftInput: any = {
      ticket_id: 'T-001',
      approved_category: 'Refund',
      proposed_status: 'Resolved',
      response_draft: '',
      supporting_policy_ids: ['POL-REFUND-01'],
      is_confirmed: true
    };
    const emptyDraftResult = await updateTicket(emptyDraftInput, db);
    expect(emptyDraftResult.success).toBe(false);
    expect(emptyDraftResult.error).toContain('Validation error');
  });
});
