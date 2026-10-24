# ResolvAI - Cloudflare Deployment Runbook

This runbook provides step-by-step, copy-paste instructions for deploying the ResolvAI backend (Cloudflare Workers + D1 Database) and frontend (Cloudflare Pages) on genuinely free tiers.

---

## Prerequisites
- A Cloudflare account (Free Plan).
- Node.js 18+ and npm installed.
- A valid Google AI Studio Gemini API key (`AIzaSy...`) or Groq API key (`gsk_...`).
- Git repository checked out on `integration/final`.

---

## Part 1: Backend Deployment (Cloudflare Workers + D1)

### 1. Authenticate with Cloudflare
From your local terminal, log in to your Cloudflare account:
```bash
npx wrangler login
```
*A browser window will open. Click 'Allow' to authorize Wrangler.*

### 2. Create the Remote D1 Database
Create the production D1 database on Cloudflare's serverless infrastructure:
```bash
npx wrangler d1 create customer-support-db
```
*Output will display a `database_id` UUID, for example:*
```
[[d1_databases]]
binding = "DB"
database_name = "customer-support-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. Update `backend/wrangler.toml` with your Database ID
Open [`backend/wrangler.toml`](file:///home/ab/ISHUB-Hackathon/backend/wrangler.toml) and replace `"your-d1-database-uuid"` with the UUID output in step 2:
```toml
[[d1_databases]]
binding = "DB"
database_name = "customer-support-db"
database_id = "<YOUR_D1_DATABASE_UUID_HERE>"
migrations_dir = "migrations"
```

### 4. Apply Database Migrations on Remote D1
Run the schema migrations against the remote Cloudflare D1 database:
```bash
npx wrangler d1 migrations apply customer-support-db --remote
```

### 5. Seed Remote Database from `seed.sql`
Populate the remote database with the 3 corporate policies and 5 customer support tickets:
```bash
npx wrangler d1 execute customer-support-db --remote --file=backend/seed/seed.sql
```

### 6. Set Production Secrets (Never in Files)
Set your AI inference key securely via Cloudflare Worker secrets:
```bash
# Set Gemini API Key
npx wrangler secret put GEMINI_API_KEY
# Enter your valid AI Studio key (starts with AIzaSy...) when prompted

# (Optional) If using Groq backup provider:
npx wrangler secret put GROQ_API_KEY
```

### 7. Deploy the Worker Backend
Deploy the Hono API Worker:
```bash
cd backend
npx wrangler deploy
```
*Note the deployed Worker URL, e.g. `https://ai-customer-support-agent-backend.<your-subdomain>.workers.dev`.*

---

## Part 2: Frontend Deployment (Cloudflare Pages)

### 1. Build the Frontend with Production API Base URL
Set `VITE_API_BASE_URL` to your live Worker endpoint and build:
```bash
cd ../frontend
VITE_API_BASE_URL="https://ai-customer-support-agent-backend.<your-subdomain>.workers.dev/api" npm run build
```
*This compiles production assets into `frontend/dist` in ~1 second.*

### 2. Deploy to Cloudflare Pages
Deploy the `dist` directory to Cloudflare Pages:
```bash
npx wrangler pages deploy dist --project-name=resolvai-dashboard
```
*Note the deployed Pages URL, e.g. `https://resolvai-dashboard.pages.dev`.*

### 3. Update Worker CORS Origin
In [`backend/wrangler.toml`](file:///home/ab/ISHUB-Hackathon/backend/wrangler.toml), update `ALLOWED_ORIGIN` to your Pages URL:
```toml
[vars]
ENVIRONMENT = "production"
ALLOWED_ORIGIN = "https://resolvai-dashboard.pages.dev"
AI_PROVIDER = "gemini"
MODEL_NAME = "gemini-2.5-flash"
```
Re-deploy the Worker to apply CORS:
```bash
cd ../backend
npx wrangler deploy
```

---

## Part 3: 10-Step Verification Protocol

Conduct this verification from a **private/incognito browser window** and a **second device** (e.g. mobile phone):

1. **Open Link**: Navigate to `https://resolvai-dashboard.pages.dev`. Confirm the LUCY CSR dashboard loads cleanly with zero styling glitches.
2. **Health Check**: Open developer tools Network tab and check `GET /api/health`. Confirm `ok: true`, database connected, and `ai.provider: "gemini"`.
3. **List Tickets**: Confirm Inbox renders tickets `T-001` through `T-005` with correct statuses (`Open`).
4. **Investigate T-001**: Click T-001 -> "Investigate Ticket". Observe live activity feed, policy citation `POL-REFUND-01`, and refund proposal draft addressed to Abel.
5. **Clarify T-002**: Click T-002 -> "Investigate Ticket". Observe clarification prompt asking for `purchase_date`. Submit answer `"2026-10-18"`. Confirm agent resumes and yields proposal.
6. **Human Approval Gate**: On T-001 proposal, edit response draft and click "Approve Resolution". Confirm status transitions to `approved`.
7. **Reopen Record**: Navigate to `/outbox`. Reopen the archived T-001 record. Verify all saved fields match.
8. **Simulated Failure / Error Path**: If an invalid key is supplied, confirm the UI displays the prominent red error notice with retry button, without crashing or faking AI output.
9. **Fresh Input / New Ticket**: Click "+ New Ticket" in the header. Enter a fresh judge complaint. Verify validation rules enforce length limits and date formats, and ticket `T-006` is created in database.
10. **Network Audit (Zero Secrets)**: In the browser Network tab, inspect all request headers, query parameters, and response bodies. Confirm **zero API keys, tokens, or credentials** appear anywhere.

---

## Cold Starts and Free Tier Quota Conservation
- **Worker Cold Starts**: Cloudflare Workers start in 0-5ms globally. There is negligible cold-start delay.
- **D1 Latency**: SQLite-based D1 reads are cached edge-side and execute in <10ms.
- **Free Quota Conservation**:
  - Cloudflare Workers: 100,000 requests/day (free tier).
  - Cloudflare D1: 5,000,000 reads/day, 100,000 writes/day (free tier).
  - Gemini Free Tier: 15 requests per minute (RPM), 1,500 requests per day (RPD).
  - The built-in rate limiter protects against accidental quota exhaustion by limiting rapid repeat requests to 30 requests per minute per IP.
