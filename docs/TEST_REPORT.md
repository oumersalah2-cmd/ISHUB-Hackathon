# Comprehensive Test Report

**Project**: AI Customer Support Resolution Agent  
**Event**: Vision Vertex AI Agent Hackathon  
**Target Architecture**: Cloudflare Workers + D1 + React + Gemini API  
**Test Framework**: Vitest v2.1.9 (Node.js v24.21.0, TypeScript v5.7.3)  
**Total Tests Executed**: 20  
**Passed**: 20 (100%)  
**Failed**: 0 (0%)  
**Reference Anchor Date**: `2026-10-24`  
**Dataset**: Official `seed-data.json` (`T-001`..`T-005`, `POL-REFUND-01`, `POL-DELIVERY-01`, `POL-ACCOUNT-01`)  

> **Note on Test Methodology**:
> The test suite below runs mocked-model unit and integration tests verifying code-enforced invariants, database state transitions, and deterministic grounding.
> Live execution against the real Gemini model is performed via the dedicated script [`live_run.ts`](file:///home/ab/ISHUB-Hackathon/live_run.ts).

---

## 1. Required Five-Case Hackathon Evaluation Report (Mock Tests)

The following test scenarios represent the mandatory hackathon validation suite defined in **Section 13 of the Project Specification** using official `seed-data.json`:

| Case # | Category | Target Ticket | Input & Scenario | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Case 1** | **Ordinary Successful (Refund)** | `T-001` | Abel Tesfaye: Unopened wireless headphones (ORD-1001), purchased `2026-10-20` (4 days ago <= 14). | Retrieve ticket; query refund policy; cite `POL-REFUND-01`; propose category `Refund`, status `Pending Customer`, grounded draft (strictly no prepaid-label wording). | `read_ticket` executed; `POL-REFUND-01` retrieved; verified 4 days <= 14 days limit; returned type `proposal` with citations; no prepaid label wording. | **PASS** |
| **Case 2** | **Ordinary Successful (Delivery)** | `T-003` | Dawit Alemu: Shipped on `2026-10-08` (11 business days as of `2026-10-24`, > 10). | Retrieve ticket; compute business days; cite `POL-DELIVERY-01`; propose status `Pending Customer` offering choice of free re-shipment or full refund. | 11 business days (> 10) detected; cited `POL-DELIVERY-01`; customer response draft offers re-shipment or refund choice; no prepaid label or OTP wording. | **PASS** |
| **Case 3** | **Ordinary Successful (Account)** | `T-004` | Hana Girma: Account locked after failed logins; customer has registered email access. | Retrieve ticket; query account policies; cite `POL-ACCOUNT-01`; propose status `Resolved` with reset link to registered email (`hana@example.com`); no OTP wording. | Verified registered email; cited `POL-ACCOUNT-01`; generated reset link draft without OTP wording; proposed status `Resolved`. | **PASS** |
| **Case 4** | **Ambiguous / Incomplete** | `T-002` | Selam Bekele: Blender refund (ORD-1002), purchase date `NULL`. | Detect missing purchase date required by `POL-REFUND-01`; halt loop; return `clarification` question; upon officer answer ("2026-10-18"), generate grounded proposal. | Turn 1 returned `{ type: 'clarification', question: '...purchase date...', missing_field: 'purchase_date', policy_ids: ['POL-REFUND-01'] }`; Turn 2 generated proposal. | **PASS** |
| **Case 5** | **Simulated Failure Mode** | `T-001` | Model connection forced to abort (`force_failure: true`). | Catch network/model fault; return user-readable error; prevent all database writes; allow immediate manual retry. | Returned `{ type: 'error', message: 'SIMULATED_FAILURE...' }`; zero database updates persisted; subsequent retry succeeded. | **PASS** |
| **Case 6** | **Out-of-Policy Request** | `T-005` | Yonas Haile: Price match request for keyboard (ORD-1005). | Verify no policy covers price matching; propose `status: Escalated`, category `Other`, empty `policy_ids: []`. | Safely proposed `Escalated` without inventing policies; draft explains price matching is uncovered. | **PASS** |

---

## 2. Core Functional & Safety Test Matrix

| # | Test Scenario | Verified Guardrail / Invariant | Execution Result |
| :--- | :--- | :--- | :--- |
| **T-01** | Retrieving an existing ticket | Reads `T-001` from database; parses customer, status, category, order_id, purchase_date, and verifies `days_since_purchase` = 4. | **PASS** |
| **T-02** | Handling a nonexistent ticket | Rejects invalid `T-9999` with `success: false` and `Ticket not found: T-9999` without hallucinating records. | **PASS** |
| **T-03** | Searching policies | `searchPolicies` executes parameterized SQL queries against `policies` table; retrieves `POL-REFUND-01` text. | **PASS** |
| **T-04** | Asking for missing information | Identifies missing `purchase_date` on `T-002`; halts loop and emits single focused clarification prompt. | **PASS** |
| **T-05** | Preventing updates before approval | Calling `updateTicket` with `is_confirmed: false` or omitted strictly aborts with security rejection. | **PASS** |
| **T-06** | Saving a confirmed update | Calling `updateTicket` with `is_confirmed: true` atomically mutates ticket and writes audit record to `ticket_updates`. | **PASS** |
| **T-07** | Reopening a saved update | Calling `GET /api/updates/:id` successfully retrieves the exact historical draft, citations, and previous/new status. | **PASS** |
| **T-08** | Handling model API failure | Aborts loop safely upon model disruption, writes zero database changes, and preserves user state for retry. | **PASS** |
| **T-09** | Handling database failure | Rejects updates referencing non-existent or fabricated policy IDs (`POL-FABRICATED-999`) with clean rollback. | **PASS** |
| **T-10** | Validating invalid inputs | Server-side Zod validation rejects empty ticket IDs, invalid status values, and blank response drafts. | **PASS** |

---

## 3. Exact Date Math Unit Tests (`business_days_since_shipping`)

Anchor Date: **`2026-10-24`**

| Test | Shipping Date | Anchor Date | Expected Business Days | Actual Result | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **D-01** | `2026-10-08` (Thursday) | `2026-10-24` (Saturday) | **11** business days | **11** | **PASS** (> 10 days triggers refund/re-ship choice per POL-DELIVERY-01) |
| **D-02** | `2026-10-14` (Wednesday) | `2026-10-24` (Saturday) | **7** business days | **7** | **PASS** (= 7 days triggers carrier investigation & In Progress per POL-DELIVERY-01) |
| **D-03** | `2026-10-20` (Tuesday) | `2026-10-24` (Saturday) | **4** calendar days | **4** | **PASS** (days_since_purchase <= 14 days per POL-REFUND-01) |

---

## 4. Live Model Script (`live_run.ts`)

Live model validation is performed using:
```bash
npm run live-run
# or
npx tsx live_run.ts
```
The script runs the model through the complete function-calling loop against tickets `T-001` through `T-005` and prints the raw JSON outputs.
