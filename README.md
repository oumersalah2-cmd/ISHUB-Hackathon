# AI Customer Support Resolution Agent

> **Vision Vertex AI Agent Hackathon — Project 3**  
> Built by an undergraduate team of 5 students.  
> 100% Free-Tier Architecture: Cloudflare Workers + Cloudflare D1 + React + Vite + Gemini 2.5 Flash / Groq.

---

## 1. Project Overview

The **AI Customer Support Resolution Agent** is an internal support-officer copilot designed to investigate customer complaints. Using fictitious tickets and a team-curated policy database:
1. The agent inspects the ticket and queries applicable company policies.
2. If required details (such as purchase dates) are missing, it asks the support officer a focused clarification question instead of guessing.
3. It formulates a policy-grounded resolution proposal with an editable customer response draft.
4. **Human-in-the-Loop Principle**: It **never** updates business data autonomously. An update is committed to the database **only after explicit human approval**.
5. All approved updates are recorded in an audit trail with evidence citations and can be reopened at any time.

---

## 2. Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS design system with responsive layouts and dark/light accents.
- **Backend**: Cloudflare Workers / Hono, TypeScript, server-side Zod validation, bounded tool-calling loop (max 5 tool calls, max 6 model turns).
- **Database**: Cloudflare D1 (SQL-based serverless database) with relational constraints and atomic transactions.
- **AI Model**: Google Gemini API (`gemini-2.5-flash` / `gemini-2.0-flash`) or Groq (`llama-3.3-70b-versatile`) via function calling on genuine free tiers.
- **Zero Cost Compliance**: No paid API credits, trial cards, or pay-as-you-go dependencies.

---

## 3. Repository Structure

```
.
├── .env.example              # Template environment variables (Never commit secrets)
├── .gitignore                # Comprehensive Git ignore rules
├── package.json              # Monorepo workspace configuration
├── README.md                 # Project guide & setup instructions
├── docs/                     # Hackathon project documentation
│   ├── ARCHITECTURE.md       # Complete system architecture and data flows
│   ├── DEMO_SCRIPT.md        # 10-minute presentation & Q&A guide
│   ├── SERVICE_REGISTER.md   # Cloud service register & free-tier limits
│   ├── TEAM_ROLES.md         # 5 student responsibilities & Git standards
│   └── TEST_REPORT.md        # Execution logs of the 5-case test report
├── frontend/                 # Vite + React + TypeScript Dashboard
│   ├── package.json
│   ├── src/
│   │   ├── components/       # Stepper, Evidence Viewer, Response Editor, Modal
│   │   ├── pages/            # Main Support Dashboard
│   │   ├── services/         # API Client for Backend
│   │   └── types/            # Shared TypeScript contracts
├── backend/                  # Cloudflare Workers / Hono REST API
│   ├── package.json
│   ├── wrangler.toml         # Cloudflare Workers & D1 configuration
│   ├── migrations/           # SQL migration files
│   ├── seed/                 # Reproducible synthetic dataset & seed script
│   └── src/
│       ├── index.ts          # API gateway entry point
│       ├── routes/           # REST endpoints (/tickets, /agent, /confirm, etc.)
│       ├── services/         # Database and AI reasoning engine
│       ├── tools/            # Tool A (read_ticket), Tool B (search_policies), Tool C (update_ticket)
│       ├── validation/       # Zod schemas for request/response payloads
│       └── types/            # TypeScript interfaces
└── tests/                    # Vitest integration & unit tests
```

---

## 4. Quick Start (Local Development)

### 4.1 Prerequisites
- Node.js (v18 or higher; recommended v20+)
- npm (v9 or higher)

### 4.2 Clone & Install
```bash
git clone https://github.com/oumersalah2-cmd/ISHUB-Hackathon.git
cd ISHUB-Hackathon
npm install
```

### 4.3 Configure Environment Variables
Copy the template file:
```bash
cp .env.example .env
```
Provide your free Gemini API Key (or Groq Key) inside `.env`:
```ini
AI_PROVIDER=gemini
GEMINI_API_KEY=your_free_gemini_api_key
```

### 4.4 Seed Database & Run Migrations
```bash
npm run seed
```

### 4.5 Start Development Servers
```bash
npm run dev
```
- Frontend will be accessible at: `http://localhost:5173`
- Backend API will be accessible at: `http://localhost:8787`

---

## 5. Running Automated Tests

Run the full test suite (covering ticket retrieval, policy search, missing detail clarification, approval guardrails, and simulated failures):
```bash
npm test
```

---

## 6. Deployment Guide

See [docs/SERVICE_REGISTER.md](file:///home/ab/ISHUB-Hackathon/docs/SERVICE_REGISTER.md) and [docs/ARCHITECTURE.md](file:///home/ab/ISHUB-Hackathon/docs/ARCHITECTURE.md) for full deployment instructions to Cloudflare Workers and Cloudflare Pages.
