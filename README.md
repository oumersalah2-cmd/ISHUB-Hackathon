# Lucy CSR - AI Customer Support Resolution Agent

> An internal AI customer support resolution copilot that retrieves policy evidence, detects missing complaint facts, proposes grounded resolutions, and requires explicit human approval before persisting updates.

Built for the university hackathon on a 100% genuine free-tier architecture.

---

## 1. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS design system (responsive layouts, dark/light accents)
- **Backend**: Hono on Cloudflare Workers, TypeScript, server-side Zod validation
- **Database**: Cloudflare D1 (serverless SQL database) / local SQLite adapter
- **AI Engine**: Google Gemini API free tier (`gemini-2.5-flash`) with bounded function-calling loop
- **Testing**: Vitest v2.1.9 (20 automated unit and integration tests)

---

---

## 2. Judges Quick Start (Live Demonstration)

- **Live Deployed Dashboard**: `[OWNER_TO_FILL: https://resolvai-dashboard.pages.dev]`
- **Live Deployed API Base**: `[OWNER_TO_FILL: https://ai-customer-support-agent-backend.<subdomain>.workers.dev/api]`
- **Health Endpoint**: `GET /api/health` returns status, database connectivity, and AI provider/model.
- **Reference Date**: `2026-10-24` (applies to all refund windows, shipping delays, and day counts).
- **Official Seed Data**: 3 corporate policies (`POL-REFUND-01`, `POL-DELIVERY-01`, `POL-ACCOUNT-01`) and 5 initial tickets (`T-001` .. `T-005`).

### Quick Judge Verification Steps:
1. Open the live dashboard.
2. Select **T-001** and click **Investigate Ticket** $\to$ observe live tool log and grounded refund draft citing `POL-REFUND-01` (4 days elapsed $\le$ 14).
3. Select **T-002** and click **Investigate Ticket** $\to$ observe missing `purchase_date` detection and clarification dialog.
4. Click **+ New Ticket** $\to$ submit a fresh complaint to verify input validation and sequential ID generation (`T-006`).
5. Open `/outbox` on a second device $\to$ confirm approved records reopen with complete audit trails.

---

## 3. The Golden Rules

1. **Never commit keys, `.env`, or `.dev.vars`**: Keep all secrets out of git. Use `.env.example` as a template.
2. **Never fake AI outputs**: Rule-based answers are never presented as model outputs. Errors produce transparent `{ "type": "error", "message": "..." }` banners.
3. **Pull before you push; never force push**: Protect git history. Open Pull Requests into `main`.
4. **Stay in your own folder unless agreed with the owner**: Avoid cross-module collisions.

---

## 4. Quick Start (Local Development)

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Installation
```bash
# Clone the repository
git clone https://github.com/oumersalah2-cmd/ISHUB-Hackathon.git
cd ISHUB-Hackathon

# Checkout active final branch
git checkout integration/final

# Install all workspace dependencies
npm install
```

### Environment Configuration
```bash
# Copy template environment file (do not commit .env)
cp .env.example .env
# Set your free Google AI Studio key (starts with AIzaSy...):
# GEMINI_API_KEY=AIzaSy...
```

### Running Locally
```bash
# Start backend (http://localhost:8787) and frontend (http://localhost:5173)
npm run dev

# Or run separately:
npm run dev:backend     # Terminal 1: Hono API server with local SQLite
npm run dev:frontend    # Terminal 2: React Vite development server
```

### Running Tests & Diagnostics
```bash
# Run the 25-test automated Vitest suite (Mock Tests + Validation + Business Days + Grounding)
npm test

# Check Gemini API key validity and model connectivity (prints status only, no keys)
npx tsx backend/scripts/check_gemini.ts

# Run model reasoning across tickets T-001..T-005 (reports LIVE MODEL or ERROR per ticket)
npm run live-run
```

---

## 5. Repository Folder Map

```
.
├── .env.example              # Environment variables template (placeholders only)
├── .gitignore                # Workspace git ignore rules
├── package.json              # Monorepo npm workspaces configuration
├── CONTRIBUTING.md           # Branching rules, merge windows & commit guide
├── README.md                 # Project guide & quick start
├── frontend/                 # Member 1's "LUCY CSR" React 19 + Vite Dashboard
│   ├── src/
│   │   ├── components/       # Stepper, Evidence Viewer, Response Editor, Modal
│   │   ├── pages/            # InboxPage, InvestigationPage, OutboxPage
│   │   └── services/api.js   # Dynamic API client with Vite proxy & health check
│   └── package.json
├── backend/                  # Cloudflare Workers / Hono REST API
│   ├── .dev.vars.example     # Cloudflare Workers secrets template
│   ├── wrangler.toml         # Cloudflare Worker & D1 configuration
│   ├── live_run.ts           # Script executing real model against T-001..T-005
│   ├── scripts/
│   │   └── check_gemini.ts   # Safe API key diagnostics script
│   ├── migrations/           # D1 SQL schema migrations (0001_initial_schema.sql)
│   ├── seed/                 # Official seed-data.json and seed script
│   ├── src/
│   │   ├── routes/           # REST endpoints (/tickets, /policies, /health, /outbox)
│   │   ├── services/         # SQLite/D1 database service & AI reasoning core
│   │   ├── tools/            # read_ticket, search_policies, update_ticket
│   │   └── utils/dateUtils.ts # Deterministic UTC business day arithmetic
│   ├── tests/                # 25 Vitest tests (system, 5-cases, business days)
│   └── package.json
└── docs/                     # Submission Documentation
    ├── Documentation.md       # System Design, Team Responsibilities & Git Branch Mapping, Known Limitations, Demo Script.

```

---

## 6. Free-Services Rule

This application strictly operates within 100% free tiers:
- **No paid cloud services**: No AWS, GCP billing, or paid subscriptions.
- **No credit card required**: Cloudflare Workers free plan & Google AI Studio free tier.
- **No hardcoded secrets**: All API keys are loaded via runtime environment variables.
