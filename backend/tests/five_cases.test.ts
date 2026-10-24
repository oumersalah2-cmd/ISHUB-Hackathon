/**
 * NOTE: These are mocked-model unit and integration tests verifying the agent reasoning core,
 * deterministic grounding, and database state transitions.
 * The live Gemini model evaluation results come from live_run.ts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../src/services/db.js';
import { investigateTicket } from '../src/services/ai.js';

describe('Mock Tests: Hackathon Five-Case Evaluation Suite (seed-data.json)', () => {
  const db = getDatabase();

  beforeEach(async () => {
    await db.resetAndSeed();
  });

  // Case 1: Ordinary Successful - Refund (T-001)
  it('Case 1 (Mock Test - Ordinary): T-001 complete refund -> Cites POL-REFUND-01, proposes Refund, draft without prepaid-label, and Pending Customer status', async () => {
    const res = await investigateTicket({ ticket_id: 'T-001' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(res.category).toBe('Refund');
      expect(res.next_status).toBe('Pending Customer');
      expect(res.policy_ids).toContain('POL-REFUND-01');
      expect(res.response_draft).toContain('Abel');
      expect(res.response_draft).toContain('ORD-1001');
      expect(res.response_draft).toContain('POL-REFUND-01');
      expect(res.reasoning_summary).toContain('14');

      // Requirement 2: Strictly NO prepaid-label wording
      expect(res.response_draft.toLowerCase()).not.toContain('prepaid');
      expect(res.response_draft.toLowerCase()).not.toContain('label');

      expect(res.tool_logs.length).toBeGreaterThanOrEqual(2); // read_ticket + search_policies + update_ticket
    }
  });

  // Case 2: Ordinary Successful - Delivery Delay (T-003)
  it('Case 2 (Mock Test - Ordinary): T-003 late delivery (11 business days) -> Cites POL-DELIVERY-01, proposes Delivery category and free re-shipment / refund choice', async () => {
    const res = await investigateTicket({ ticket_id: 'T-003' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(res.category).toBe('Delivery');
      expect(res.next_status).toBe('Pending Customer');
      expect(res.policy_ids).toContain('POL-DELIVERY-01');
      expect(res.response_draft).toContain('Dawit');
      expect(res.response_draft).toContain('ORD-1003');
      expect(res.response_draft).toContain('POL-DELIVERY-01');
      expect(res.response_draft).toContain('11 business days');
      expect(res.reasoning_summary).toContain('11 business days');

      // Requirement 2: Strictly NO prepaid-label or OTP wording
      expect(res.response_draft.toLowerCase()).not.toContain('prepaid');
      expect(res.response_draft.toLowerCase()).not.toContain('otp');
    }
  });

  // Case 3: Ordinary Successful - Account Access (T-004)
  it('Case 3 (Mock Test - Ordinary): T-004 account access -> Cites POL-ACCOUNT-01, proposes Account and reset link to registered email, without OTP wording', async () => {
    const res = await investigateTicket({ ticket_id: 'T-004' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(['Account', 'Account Access']).toContain(res.category);
      expect(res.policy_ids).toContain('POL-ACCOUNT-01');
      expect(res.response_draft).toContain('Hana');
      expect(res.response_draft).toContain('hana@example.com');
      expect(res.response_draft).toContain('POL-ACCOUNT-01');

      // Requirement 2: Strictly NO OTP wording
      expect(res.response_draft.toLowerCase()).not.toContain('otp');
      expect(res.response_draft.toLowerCase()).not.toContain('one-time password');
    }
  });

  // Case 4: Ambiguous / Incomplete - Missing Purchase Date (T-002)
  it('Case 4 (Mock Test - Incomplete): T-002 missing purchase date -> Asks clarification; when answered, produces proposal citing POL-REFUND-01', async () => {
    // Step 4a: First turn without purchase date
    const turn1 = await investigateTicket({ ticket_id: 'T-002' }, db);
    expect(turn1.type).toBe('clarification');
    if (turn1.type === 'clarification') {
      expect(turn1.question.toLowerCase()).toContain('purchase date');
      expect(turn1.missing_field).toBe('purchase_date');
      expect(turn1.policy_ids).toContain('POL-REFUND-01');
    }

    // Step 4b: Support officer answers clarification with purchase date
    const turn2 = await investigateTicket({
      ticket_id: 'T-002',
      clarification_answer: 'Customer stated purchase date was 2026-10-18'
    }, db);

    expect(turn2.type).toBe('proposal');
    if (turn2.type === 'proposal') {
      expect(turn2.category).toBe('Refund');
      expect(turn2.policy_ids).toContain('POL-REFUND-01');
      expect(turn2.response_draft).toContain('Selam');
      expect(turn2.response_draft).toContain('2026-10-18');
      expect(turn2.response_draft.toLowerCase()).not.toContain('prepaid');
      expect(turn2.response_draft.toLowerCase()).not.toContain('otp');
    }
  });

  // Case 5: Simulated Model / Tool Failure
  it('Case 5 (Mock Test - Simulated Failure): Model call failure aborts loop cleanly, saves nothing, enables retry', async () => {
    const res = await investigateTicket({ ticket_id: 'T-001', force_failure: true }, db);
    expect(res.type).toBe('error');
    if (res.type === 'error') {
      expect(res.message).toContain('SIMULATED_FAILURE');
    }

    // Confirm database has 0 updates recorded
    const updates = await db.queryAll('SELECT * FROM ticket_updates');
    expect(updates).toHaveLength(0);

    // Confirm immediate manual retry succeeds
    const retryRes = await investigateTicket({ ticket_id: 'T-001', force_failure: false }, db);
    expect(retryRes.type).toBe('proposal');
  });

  // Case 6: Out-of-Policy Request - Price Match (T-005)
  it('Case 6 (Mock Test - Out-of-Policy): T-005 price match request -> Cites no matching policy and proposes Escalated status with empty policy_ids', async () => {
    const res = await investigateTicket({ ticket_id: 'T-005' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(res.category).toBe('Other');
      expect(res.next_status).toBe('Escalated');
      expect(res.policy_ids).toHaveLength(0);
      expect(res.response_draft).toContain('Yonas');
      expect(res.response_draft).toContain('ORD-1005');
      expect(res.reasoning_summary.toLowerCase()).toContain('no matching policy');
    }
  });
});
