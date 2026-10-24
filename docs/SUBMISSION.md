# Vision Vertex AI Agent Hackathon — Submission Package

**Project Title**: ResolvAI / LUCY CSR — AI Customer Support Resolution Agent (Project 3)  
**Team Name**: ISHUB Hackathon Team  
**Reference Anchor Date**: `2026-10-24`  
**Repository**: [https://github.com/oumersalah2-cmd/ISHUB-Hackathon](https://github.com/oumersalah2-cmd/ISHUB-Hackathon)  
**Active Production Branch**: `main` (and `integration/final`)  

---

## 1. Live Deployment & Demo Access

* **Live Frontend Web Application**: [https://ishub-hackathon.vercel.app](https://ishub-hackathon.vercel.app)
* **Live Backend REST API**: [https://ishub-hackathon-1.onrender.com/api](https://ishub-hackathon-1.onrender.com/api)
* **Live Health & Diagnostics Endpoint**: [https://ishub-hackathon-1.onrender.com/api/health](https://ishub-hackathon-1.onrender.com/api/health)

### Demo Access Instructions
1. **Zero Login / Authentication Friction**: The operator console is immediately accessible upon opening the frontend URL. No user accounts, passwords, or registration required.
2. **Initial-Load Delay Notice (Free Tier Sleep)**:
   > **Note on Render Free Tier**: Render's free tier automatically spins down (sleeps) backend web services after 15 minutes of inactivity. When loading the site for the first time or after a pause, the very first request may experience a **30 to 50 second cold-start delay** while the container wakes up. Subsequent requests execute instantly in under 150ms.
3. **Step-by-Step Judge Walkthrough**:
   - **Step 1 (Landing Page)**: Review the public SaaS presentation and the 4-step circular resolution pipeline (`#how-it-works`).
   - **Step 2 (Operator Platform)**: Click **"Enter Operator Platform"** or **"Open Ticket Inbox"** to view tickets `T-001` through `T-005`.
   - **Step 3 (Ordinary Refund — T-001)**: Click **"Investigate"** on `T-001`. Observe the AI agent execute `read_ticket`, cite `POL-REFUND-01`, confirm purchase was 4 days ago ($\le$ 14-day limit), and draft a refund response.
   - **Step 4 (Clarification Path — T-002)**: Click **"Investigate"** on `T-002`. The agent detects missing `purchase_date`, halts execution, and presents a clarification question. Provide date `2026-10-18` and watch the agent resume to propose a valid draft.
   - **Step 5 (Human Confirmation & Outbox)**: Edit the response draft and click **"Approve & Save"**. Navigate to the **Internal Outbox Archive** (`/outbox`) to verify the immutable audit trail with full policy citations.
   - **Step 6 (Fresh Judge Ticket)**: Click **"+ New Ticket"** in the top navigation bar to submit any custom ticket. Verify validation catches missing fields and generates sequential ID `T-006`.

---

## 2. Source Repository & Setup Instructions

* **GitHub Repository**: `https://github.com/oumersalah2-cmd/ISHUB-Hackathon`
* **Default Branch**: `main`

### Local Setup in 4 Steps
```bash
# 1. Clone the repository
git clone https://github.com/oumersalah2-cmd/ISHUB-Hackathon.git
cd ISHUB-Hackathon

# 2. Install workspace dependencies
npm install

# 3. Configure environment variables (uses template placeholders, zero hardcoded secrets)
cp .env.example .env
# Edit .env and supply your free Google AI Studio key:
# GEMINI_API_KEY=AIzaSy...

# 4. Start local development servers
npm run dev
# Backend starts at: http://localhost:8787
# Frontend starts at: http://localhost:5173
```

### Automated Testing
```bash
# Run all 25 Vitest automated test cases (100% pass rate)
npm test
```

### Synthetic Seed Data (`backend/seed/seed-data.json`)
* **3 Corporate Policies**:
  * `POL-REFUND-01`: Standard Return & Refund Policy (14 calendar days from purchase, unopened/defective, original payment method).
  * `POL-DELIVERY-01`: Delayed Shipment & Transit Policy (10 business days threshold from shipping date for free replacement or refund).
  * `POL-ACCOUNT-01`: Customer Account Access & Security (email password reset link; strictly forbids OTP or temporary passwords in chat).
* **5 Initial Tickets**:
  * `T-001`: Abel Tesfaye — Unopened wireless headphones refund request (4 days elapsed $\le$ 14).
  * `T-002`: Selam Bekele — Blender defective, purchase date missing (`NULL`).
  * `T-003`: Dawit Alemu — Ergonomic keyboard delayed in transit (11 business days elapsed > 10).
  * `T-004`: Hana Girma — Account locked out; has access to registered email.
  * `T-005`: Yonas Haile — Price-match request for mechanical keyboard (uncovered by policies).

---

## 3. Final Design Note: Architecture & Workflow

### 3.1 System Workflow
```
Customer Ticket ---> [Tool A: read_ticket] ---> Extract metadata & dates
                              |
                     [Tool B: search_policies] ---> Match policy clauses
                              |
                  Missing facts detected?
                     /                \
                 YES                    NO
                  |                      |
          Clarification Modal    Generate Grounded Draft
         (Wait for Human Input)          |
                                 Proposal Review Section
                                         |
                               [Tool C: update_ticket]
                         (Requires explicit is_confirmed: true)
                                         |
                               Database & Outbox Commit
```

### 3.2 High-Level Architecture
* **Frontend**: React 19 single-page application built with Vite, deployed to **Vercel** with client-side SPA rewrites (`vercel.json`) and responsive Vanilla CSS.
* **Backend API**: Modular TypeScript application running on **Hono**, deployed to **Render** (`Node 22 LTS`), with built-in SQLite persistence (`node:sqlite` in WAL mode) and Cloudflare D1 compatibility.
* **AI Model Engine**: Google Gemini API (`gemini-2.5-flash`) via official SDK, with Groq Cloud (`llama-3.3-70b-versatile`) as an automatic secondary fallback.
* **Storage**: Self-contained SQLite relational database storing `tickets`, `policies`, and `ticket_updates` (audit logs) with zero external database subscriptions.

### 3.3 The Three Core Agent Tools
1. **Tool A (`read_ticket`)**: Retrieves ticket facts by ID, computes elapsed calendar and business days relative to `2026-10-24`, and validates input IDs.
2. **Tool B (`search_policies`)**: Queries corporate policies by category or keyword using parameterized SQL; prevents prompt-injection bypasses.
3. **Tool C (`update_ticket`)**: Applies status changes, records policy citations, and appends to the outbox archive. **Security Invariant**: Strictly rejects execution unless `is_confirmed: true` is explicitly passed by a human operator.

### 3.4 Team Responsibilities Matrix
* **Member 1 (Frontend & UI/UX)**: Implemented the approved "LUCY CSR" dashboard, responsive navigation, 4-step circular resolution pipeline, policy evidence inspector, and approval modals.
* **Member 2 (Backend & Database)**: Structured Hono REST endpoints, SQLite/D1 schemas, database migrations, seed scripts, and transaction rollback protection.
* **Member 3 (AI Agent & Tools)**: Implemented Gemini 2.5 Flash function-calling loop (bounded to 5 calls max), grounding checks, clarification detection, and error recovery.
* **Member 4 (Data, Validation & Testing)**: Built the 25-test Vitest suite, deterministic UTC date arithmetic utilities, Zod schema validation, and 5-case test suite.
* **Member 5 (Integration, Deployment & Docs)**: Managed Vercel & Render cloud deployments, CORS configurations, security audit (Zod upgrade), service register, and submission documentation.

---

## 4. Five-Case Test Report & Known Limitations

### 4.1 Five-Case Test Results
All cases tested against reference anchor date **`2026-10-24`**:

| Case | Scenario | Target Ticket | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Case 1: Standard Refund** | 4 days elapsed ($\le$ 14) | `T-001` (Abel Tesfaye) | Cite `POL-REFUND-01`, propose `Refund`, status `Pending Customer` | Successfully cited `POL-REFUND-01`; no prepaid label text; status `Pending Customer`. | **PASS** |
| **Case 2: Delayed Transit** | 11 business days (> 10) | `T-003` (Dawit Alemu) | Cite `POL-DELIVERY-01`, offer replacement or refund choice | Correctly calculated 11 business days; cited `POL-DELIVERY-01`; offered re-shipment or refund. | **PASS** |
| **Case 3: Account Recovery** | Account locked out | `T-004` (Hana Girma) | Cite `POL-ACCOUNT-01`, send reset link to registered email | Proposed status `Resolved`; strictly omitted OTP; verified registered email. | **PASS** |
| **Case 4: Clarification Path**| Missing purchase date | `T-002` (Selam Bekele) | Halt loop; ask clarification; resume upon response | Turn 1 halted with clarification; Turn 2 after date input produced valid refund proposal. | **PASS** |
| **Case 5: Simulated Fault** | AI model fails / timeouts | `T-001` | Graceful error banner; 0 database writes; allow retry | Caught exception; displayed retry notice; zero database corruption. | **PASS** |

### 4.2 Known Limitations
1. **Cold Starts**: Render's free tier suspends containers after 15 minutes of inactivity; the first request takes ~30–50s to wake up.
2. **Language Coverage**: The policy grounding engine is currently optimized for English policies; multilingual queries are supported by the LLM but policies are in English.
3. **Database Concurrency**: The deployed backend uses embedded SQLite with WAL mode. For enterprise production with multiple geo-distributed replicas, Cloudflare D1 or PostgreSQL would be utilized.
4. **Rate Limits**: Free tier Gemini allows 15 Requests Per Minute (RPM), which is protected by our client-side debounce and server-side rate-limiting middleware.

---

## 5. Official Service Register (100% Free Tiers)

| Service | Provider | Purpose | Free Plan Limits | Pricing Documentation Link | Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vercel** | Vercel Inc. | Frontend Web Hosting (Vite React SPA) | 100 GB bandwidth / mo; Unlimited previews; HTTPS SSL included | [https://vercel.com/pricing](https://vercel.com/pricing) | **$0.00** |
| **Render** | Render Services Inc. | Backend Web Service API (Node.js) | 750 free instance hours / mo; 512 MB RAM; 0.1 CPU; Free SSL | [https://render.com/pricing](https://render.com/pricing) | **$0.00** |
| **Google Gemini API** | Google AI Studio | AI Agent Reasoning & Function Calling (`gemini-2.5-flash`) | 15 RPM; 1,500 RPD; 1,000,000 Tokens / min; Free Tier | [https://ai.google.dev/pricing](https://ai.google.dev/pricing) | **$0.00** |
| **Groq Cloud API** | Groq Inc. | Backup Secondary AI Provider (`llama-3.3-70b-versatile`) | 30 RPM; 14,400 RPD; Developer Plan | [https://groq.com/pricing](https://groq.com/pricing) | **$0.00** |
| **SQLite (Embedded)** | Self-hosted (in Node) | Relational Database Storage (`node:sqlite`) | Unlimited local storage up to disk limits; In-process zero-cost | [https://www.sqlite.org/copyright.html](https://www.sqlite.org/copyright.html) | **$0.00** |

* **Zero-Secret Compliance**: No API keys, passwords, or credentials are hardcoded or tracked in git. All secrets are injected through cloud environment variables (`GEMINI_API_KEY`).

---

## 6. Contribution Note & AI Coding Tools

### 6.1 Use of AI Coding Assistants
In accordance with hackathon guidelines, AI coding assistants (specifically Google Antigravity / Gemini code tools) were utilized collaboratively as pair-programming copilots:
* **Scaffolding & Boilerplate**: Generated TypeScript interface declarations, Zod schema boilerplate, and repetitive test case fixtures.
* **Component Styling**: Accelerated responsive Vanilla CSS styling (e.g. SVG orbital ring mathematics for the 4-step pipeline and mobile flex layouts).
* **Security & Vulnerability Remediation**: Diagnosed and resolved the npm Zod v4 memory-exhaustion vulnerability, making error mappings backwards- and forwards-compatible.
* **Human Engineering & Governance**: All architectural decisions, business logic rules, policy clause drafting, human-in-the-loop safeguards, and verification protocols were designed, reviewed, and tested by team members.

### 6.2 Team Member Contributions
* **Member 1**: Created the complete frontend design system, interactive ticket table, live investigation timeline, and approval flow.
* **Member 2**: Designed the database schema, migration logic, SQLite initialization adapter, and REST API routing layer.
* **Member 3**: Engineered the agent prompts, grounding validator, forbidden phrase filters, and Gemini tool calling loop.
* **Member 4**: Wrote the Vitest test suite covering 25 system cases, exact business-day arithmetic, and synthetic seed datasets.
* **Member 5**: Configured Vercel and Render deployments, wrote the deployment runbook, performed security audits, and compiled the documentation package.
