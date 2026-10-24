import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../src/services/db.js';
import { investigateTicket } from '../src/services/ai.js';
import { updateTicket } from '../src/tools/updateTicket.js';

describe('Hackathon Five-Case Evaluation Suite (SRS Section 11 & Spec Section 13)', () => {
  const db = getDatabase();

  beforeEach(async () => {
    await db.resetAndSeed();
  });

  // Case 1: Ordinary Successful - Refund (T-1002)
  it('Case 1 (Ordinary): T-1002 complete refund -> Cites POL-REF-01, proposes Refund, draft, and Pending Customer status', async () => {
    const res = await investigateTicket({ ticket_id: 'T-1002' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(res.category).toBe('Refund');
      expect(res.next_status).toBe('Pending Customer');
      expect(res.policy_ids).toContain('POL-REF-01');
      expect(res.response_draft).toContain('Sophia');
      expect(res.response_draft).toContain('POL-REF-01');
      expect(res.reasoning_summary).toContain('30 calendar days');
      expect(res.tool_logs.length).toBeGreaterThanOrEqual(2); // read_ticket + search_policies + update_ticket
    }
  });

  // Case 2: Ordinary Successful - Delivery Delay (T-1003)
  it('Case 2 (Ordinary): T-1003 late delivery -> Cites POL-DEL-01, proposes Delivery category and replacement/refund draft', async () => {
    const res = await investigateTicket({ ticket_id: 'T-1003' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(res.category).toBe('Delivery');
      expect(res.next_status).toBe('Pending Customer');
      expect(res.policy_ids).toContain('POL-DEL-01');
      expect(res.response_draft).toContain('Marcus');
      expect(res.response_draft).toContain('POL-DEL-01');
      expect(res.reasoning_summary).toContain('5 business days');
    }
  });

  // Case 3: Ordinary Successful - Account Access (T-1004)
  it('Case 3 (Ordinary): T-1004 account access -> Cites POL-ACC-01, proposes Account Access and secure OTP reset guidance', async () => {
    const res = await investigateTicket({ ticket_id: 'T-1004' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(['Account', 'Account Access']).toContain(res.category);
      expect(res.policy_ids.some((id: string) => id.includes('ACC') || id.includes('ACCOUNT'))).toBe(true);
      expect(res.response_draft).toContain('Amara');
      expect(res.response_draft.includes('POL-ACC-01') || res.response_draft.includes('POL-ACCOUNT-01')).toBe(true);
      expect(res.response_draft.toLowerCase()).toContain('otp');
    }
  });

  // Case 4: Ambiguous / Incomplete - Missing Purchase Date (T-1001)
  it('Case 4 (Incomplete): T-1001 missing purchase date -> Asks clarification; when answered, resumes and produces proposal', async () => {
    // Step 4a: First turn without purchase date
    const turn1 = await investigateTicket({ ticket_id: 'T-1001' }, db);
    expect(turn1.type).toBe('clarification');
    if (turn1.type === 'clarification') {
      expect(turn1.question.toLowerCase()).toContain('purchase date');
    }

    // Step 4b: Support officer answers clarification with purchase date
    const turn2 = await investigateTicket({
      ticket_id: 'T-1001',
      clarification_answer: 'Customer stated purchase date was 2026-10-18'
    }, db);

    expect(turn2.type).toBe('proposal');
    if (turn2.type === 'proposal') {
      expect(turn2.category).toBe('Refund');
      expect(turn2.policy_ids).toContain('POL-REF-01');
      expect(turn2.response_draft).toContain('Liam');
      expect(turn2.response_draft).toContain('2026-10-18');
    }
  });

  // Case 5: Simulated Model / Tool Failure
  it('Case 5 (Simulated Failure): Model call failure aborts loop cleanly, saves nothing, enables retry', async () => {
    const res = await investigateTicket({ ticket_id: 'T-1002', force_failure: true }, db);
    expect(res.type).toBe('error');
    if (res.type === 'error') {
      expect(res.message).toContain('SIMULATED_FAILURE');
    }

    // Confirm database has 0 updates recorded
    const updates = await db.queryAll('SELECT * FROM ticket_updates');
    expect(updates).toHaveLength(0);

    // Confirm immediate manual retry succeeds
    const retryRes = await investigateTicket({ ticket_id: 'T-1002', force_failure: false }, db);
    expect(retryRes.type).toBe('proposal');
  });

  // Extra Check: Uncovered Issue (T-1005)
  it('Extra Check (Uncovered): T-1005 bespoke corporate SLA -> Cites no matching policy and proposes Escalated status', async () => {
    const res = await investigateTicket({ ticket_id: 'T-1005' }, db);
    expect(res.type).toBe('proposal');
    if (res.type === 'proposal') {
      expect(res.category).toBe('Other');
      expect(res.next_status).toBe('Escalated');
      expect(res.policy_ids).toHaveLength(0);
      expect(res.reasoning_summary.toLowerCase()).toContain('no matching policy');
    }
  });
});
