# ResolvAI - AI Customer Support Resolution Agent

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

## 2. The Three Golden Rules

1. **Never commit keys, `.env`, or `.dev.vars`**: Keep all secrets out of git. Use `.env.example` as a template.
2. **Pull before you push; never force push**: Protect git history. Open Pull Requests into `main`.
3. **Stay in your own folder unless you agree with the owner**: Avoid cross-module collisions.

---

## 3. Quick Start

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Installation
```bash
# Clone the repository
git clone https://github.com/oumersalah2-cmd/ISHUB-Hackathon.git
cd ISHUB-Hackathon

# Install all workspace dependencies
npm install
```

### Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
# Set your free Google Gemini API key if executing live model calls:
# GEMINI_API_KEY=your_key_here
```

### Running Locally
```bash
# Start both backend (http://localhost:8787) and frontend (http://localhost:5173)
npm run dev

# Or run separately:
npm run dev:backend     # Terminal 1: Hono REST API server
npm run dev:frontend    # Terminal 2: React Vite development server
```

### Running Tests & Seed
```bash
# Run the 20-test automated suite (Mock Tests + Invariants + Exact Date Math)
npm test

# Run live Gemini reasoning across tickets T-001..T-005
npm run live-run

# Reseed database with official seed-data.json
npm run seed
```

---

## 4. Repository Folder Map

```
.
├── .env.example              # Environment variables template (placeholders only)
├── .gitignore                # Workspace git ignore rules
├── package.json              # Monorepo npm workspaces configuration
├── CONTRIBUTING.md           # Branching rules, merge windows & commit guide
├── README.md                 # Project guide & quick start
├── live_run.ts               # Runner for live Gemini model execution
├── frontend/                 # React 19 + TypeScript + Vite Dashboard
│   ├── src/
│   │   ├── components/       # Stepper, Evidence Viewer, Response Editor, Modal
│   │   ├── App.tsx           # Main Support Officer Dashboard
│   │   └── services/api.ts   # Typed API client
│   └── package.json
├── backend/                  # Cloudflare Workers / Hono REST API
│   ├── .dev.vars.example     # Cloudflare Workers secrets template
│   ├── .gitignore            # Backend-specific ignore rules
│   ├── live_run.ts           # Script executing real model against T-001..T-005
│   ├── migrations/           # D1 SQL schema migrations (0001_initial_schema.sql)
│   ├── seed/                 # Official seed-data.json and seed script
│   ├── src/
│   │   ├── routes/           # REST endpoints (/tickets, /policies, /agent, /confirm)
│   │   ├── services/         # SQLite/D1 database service & AI reasoning core
│   │   ├── tools/            # Tool A (read_ticket), Tool B (search_policies), Tool C (update_ticket)
│   │   └── utils/dateUtils.ts # Deterministic UTC date math
│   ├── tests/                # Vitest suites (system, 5-cases, business days)
│   └── package.json
└── docs/                     # Hackathon Documentation & Reports
    ├── ARCHITECTURE.md       # Architectural diagrams & component specs
    ├── DEMO_SCRIPT.md        # 10-minute presentation guide & Q&A defense
    ├── SERVICE_REGISTER.md   # Cloud service register & free-tier limits
    ├── TEAM_ROLES.md         # 5 student responsibilities & deliverables
    └── TEST_REPORT.md        # Complete 20-test validation matrix
```

---

## 5. Free-Services Rule

This application strictly operates within 100% free tiers:
- **No paid cloud services**: No AWS, GCP billing, or paid subscriptions.
- **No credit card required**: Cloudflare Workers free plan & Google AI Studio free tier.
- **No hardcoded secrets**: All API keys are loaded via runtime environment variables.

---

## 6. Known Issues Before First Demo

1. **Demo Data Synchronization**: Local SQLite database is 100% synchronized with `seed-data.json` (`POL-REFUND-01`, `POL-DELIVERY-01`, `POL-ACCOUNT-01` and `T-001`..`T-005`). One must ensure remote Cloudflare D1 applies `0001_initial_schema.sql` and `seed.sql` via Wrangler before remote deployment.
2. **Live Gemini API Key**: In local offline evaluation, the reasoning engine uses a grounded deterministic fallback engine. For the live evaluation stage, teammates must provide their free `GEMINI_API_KEY` in `.env` to execute `npm run live-run`.
3. **Draft Grounding**: Response drafts are strictly grounded in policy text and ticket facts. Ensure future prompt changes do not introduce prohibited terms like OTP or prepaid labels.
