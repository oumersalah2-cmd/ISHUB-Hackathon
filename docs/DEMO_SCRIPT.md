# Hackathon Demonstration Script

**Project**: AI Customer Support Resolution Agent  
**Presentation Duration**: 10 Minutes + 2 Minutes Q&A  
**Audience**: Hackathon Judges & Evaluation Panel  

---

## 1. Demo Schedule (10-Minute Walkthrough)

| Time | Section | Actions & Visual Cue | Key Speaking Points |
| :--- | :--- | :--- | :--- |
| **0:00 - 1:00** | **Introduction & Problem Framing** | Open the live dashboard. Point out the title, university hackathon context, and synthetic data disclaimer. | *"Welcome judges. Customer support officers often struggle with policy compliance and hallucinated AI resolutions. We built an AI Resolution Agent that grounds every decision in persistent SQL policies, strictly checks for missing required details, and enforces explicit human approval before any database write."* |
| **1:00 - 3:00** | **Complete Case 1: Standard Refund (T-1002)** | Click Ticket **T-1002** ("Defective Espresso Maker"). Click **Investigate Complaint**. Watch workflow stepper. | *"Notice the live tool execution. The agent first invokes `read_ticket(T-1002)`. It extracts the purchase date (12 days ago) and category. Next, it calls `search_policies('refund defect')`. It retrieves `POL-REF-01` (30-day return policy). Because 12 < 30 days, it formulates a proposal: Next status 'Pending Customer', category 'Refund', citing `POL-REF-01`."* |
| **3:00 - 5:00** | **Interactive Clarification: Missing Purchase Date (T-1001)** | Switch to Ticket **T-1001** ("Smart Wireless Headphones - Return Request"). Click **Investigate**. | *"Here, the customer wants a refund, but omitted their purchase date. Watch how the agent detects the policy prerequisite in `POL-REF-01`. Instead of inventing a date or guessing, it returns type `clarification` asking: 'Please provide the customer purchase date'. We input '2026-10-18'. The agent resumes, verifies the date is within 30 days, and produces the grounded proposal."* |
| **5:00 - 6:30** | **Review, Response Editing & Explicit Approval** | Inspect the draft customer response in the editor. Modify one sentence. Click **Approve & Apply Update**. | *"The agent never updates business data autonomously. The officer has full control to edit the draft. When clicking 'Approve', an explicit modal confirms the transaction. Backend executes `update_ticket` atomically in D1, recording previous status, new status, and policy references in `ticket_updates`."* |
| **6:30 - 7:30** | **Audit Trail & Reopening Saved Updates** | Click on **Saved Updates / Audit History**. Select the update record just created. | *"Every resolution is permanently auditable. We can reopen historical updates, inspect the exact draft sent, the evidence policies cited, and the timestamp of officer confirmation."* |
| **7:30 - 9:00** | **Controlled Failure & Boundary Cases** | Select **T-1005** (Bespoke Software Customization - Uncovered Issue) or trigger simulated AI failure mode. | *"What happens when policies don't cover the issue? Watch how the agent refuses to fabricate policies. It identifies that no policy matches, explains why, and safely recommends escalating the ticket to senior management. In simulated failure tests, errors are caught gracefully with manual retry."* |
| **9:00 - 10:00** | **Architecture & Free-Tier Compliance** | Briefly highlight the architecture diagram and Service Register. | *"Our entire stack—React 19, Cloudflare Workers, Cloudflare D1, and Google Gemini 2.5 Flash—operates on 100% genuine free tiers with zero paid or student credits. Code is modular, typesafe, and fully covered by automated tests."* |

---

## 2. Prepared Q&A Answers (2-Minute Defense)

### Q1: "How do you guarantee the AI doesn't hallucinate company policies?"
**Answer**:
> *"We enforce strict retrieval grounding. The model has no access to policies in its prompt. It must call `search_policies` on the database. The backend validates that all cited `policy_ids` exist in the database before accepting the proposal. If a policy ID is fabricated, the backend rejects it."*

### Q2: "Can an adversarial user inject instructions in a ticket to force an automatic refund?"
**Answer**:
> *"No. First, prompt isolation treats customer tickets strictly as data payloads with explicit delimiters. Second, and most importantly, the AI agent is architecturally incapable of committing updates: the `update_ticket` endpoint requires a separate, explicit user confirmation payload."*

### Q3: "What happens if Gemini or Groq API experiences downtime or quota exhaustion?"
**Answer**:
> *"The backend wraps the model calls in defensive try-catch handlers that return a standardized structured error `{ type: 'error', message: 'AI service temporarily unavailable' }`. The frontend retains all user inputs and offers an instant manual retry button."*
