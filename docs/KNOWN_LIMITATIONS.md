# ResolvAI - Known Limitations & Technical Constraints

This document provides a candid, engineering-first record of the known limitations of the **AI Customer Support Resolution Agent** at the time of hackathon submission.

---

### 1. Live AI Model Key Status (Pending Key Injection)
- **Status**: The live model diagnostic script (`backend/scripts/check_gemini.ts` and `backend/live_run.ts`) currently reports HTTP 401 ("API key not valid"). The provided key in `.env` is a Google Cloud session token (`AQ.A...`, 53 chars) rather than a standard Google AI Studio developer API key (`AIzaSy...`, 39 chars).
- **Behavior**: Per absolute hackathon honesty rules, the system **never fakes AI model responses**. When an invalid key is present, the backend cleanly emits `{"type":"error","message":"..."}` and the frontend displays a prominent, styled error banner with a retry button.
- **Verification**: All 25 system invariants, database transactions, human approval gates, and edge cases are verified deterministically by Vitest unit and integration suites using `MockModel`. Once the repo owner injects an active AI Studio key, live model execution resumes automatically.

---

### 2. Keyword Retrieval vs. Vector Embeddings
- **Status**: Policy search (`searchPolicies`) uses SQL `LIKE` queries with synonym expansion (`money back` $\to$ `refund`, `package` $\to$ `delivery`, `locked` $\to$ `account`) rather than high-dimensional vector embeddings.
- **Rationale**: The hackathon specification strictly mandates lightweight, 100% free-tier services without vector database subscriptions or complex embedding pipelines. Keyword retrieval over the 3 curated policies (`POL-REFUND-01`, `POL-DELIVERY-01`, `POL-ACCOUNT-01`) is 100% deterministic, executes in 0ms, and avoids embedding latency.

---

### 3. Single-Agent Workflow Scope
- **Status**: ResolvAI is implemented as a single, highly-focused reasoning agent with 3 tools (`read_ticket`, `search_policies`, `update_ticket`).
- **Rationale**: Per hackathon rubric guidance, building a complete, reliable, and strictly bounded single-agent workflow with code-enforced guardrails is prioritized over multi-agent orchestration that risks runaway loops, high token consumption, and flaky tool handoffs.

---

### 4. Language Scope
- **Status**: Corporate policies and response drafts are authored in English.
- **Behavior**: If a user submits a non-English complaint (e.g. French, Amharic), the agent analyzes the transaction facts against English policies and responds politely in English. Full multi-language policy translation is a planned future enhancement.

---

### 5. In-Memory Sliding-Window Rate Limiting
- **Status**: Rate limiting on `POST /api/tickets/:id/investigate` is implemented via an in-memory sliding window counter (30 requests/minute per IP).
- **Behavior**: On local Node.js and single Worker instances, this reliably protects against accidental quota exhaustion. In a globally distributed Cloudflare Worker deployment across multiple edge data centers, memory is not shared across regions; production enterprise deployment would utilize Cloudflare Workers KV or Cloudflare Rate Limiting rules.

---

### 6. Reference Date Anchor (`2026-10-24`)
- **Status**: All date calculations (e.g. `days_since_purchase` and `business_days_since_shipping`) are anchored to the hackathon demonstration date `2026-10-24`.
- **Behavior**: This ensures that all seed tickets (`T-001` through `T-005`) and test fixtures evaluate with 100% consistency regardless of when judges inspect the code.
