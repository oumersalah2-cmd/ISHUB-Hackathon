# ResolvAI - Individual Contribution Notes

This document provides an honest, transparent record of each team member's contributions to the **AI Customer Support Resolution Agent** for the Vision Vertex AI Agent Hackathon.

---

## Member 1 (Frontend Developer - "LUCY CSR" Dashboard)
- **Role**: Frontend Developer
- **Design Ownership**: Member 1 created the approved "LUCY CSR" React 19 + Vite dashboard design. The design features a modern aesthetic with custom tokens, butter/indigo accents, crisp typography, and responsive layouts across desktop and mobile.
- **Key Contributions**:
  - Implemented the complete user interface: `InboxPage`, `InvestigationPage`, `OutboxPage`, `NewTicketModal`, and interactive forms.
  - Built the `InvestigationTimeline` stepper, `PolicyEvidenceViewer`, `ClarificationForm`, and `ProposalReviewSection`.
  - Added robust UI error handling, loading spinners, toast notifications, and AI status indicators.
- **Member's Own Words**:
  > *`[MEMBER_1_TO_FILL: Add your personal thoughts and reflections on the frontend implementation here]`*

---

## Member 2 (Backend & Database Exploration)
- **Role**: Backend & Database Developer
- **Architecture Evaluation**: Member 2 explored an Express + MongoDB Atlas backend architecture in `ISHUB-Hackathon-backend/`. During testing, external DNS SRV and MongoDB port 27017 connections experienced network timeouts in restricted university sandbox environments. Following a technical review, the team consolidated onto the Cloudflare-compatible Hono + TypeScript backend (`backend/`), which uses local SQLite (`node:sqlite`) and remote Cloudflare D1. This architecture guarantees 0ms cold-start local runs with zero external network database dependencies and complies with Cloudflare's serverless edge deployment model.
- **Key Contributions**:
  - Evaluated data schemas and MongoDB document models for tickets and audit updates.
  - Prototyped REST routes for ticket retrieval and policy queries.
  - Collaborated on database migration strategies and seed data alignment.
- **Member's Own Words**:
  > *`[MEMBER_2_TO_FILL: Add your personal thoughts and reflections on the backend exploration here]`*

---

## Member 3 (AI Agent & Prompt Integration)
- **Role**: AI Agent Developer
- **Key Contributions**:
  - Developed the agent reasoning loop in `backend/src/services/ai.ts` using Google Gemini function calling (`read_ticket`, `search_policies`, `update_ticket`).
  - Drafted comprehensive system prompts enforcing corporate role, anchor date `2026-10-24`, grounding rules, clarification limits, and prompt-injection defense.
  - Added OpenAI-compatible tool calling support for Groq (`llama-3.3-70b-versatile`) as an optional secondary provider.
  - Created connection check and live diagnostic scripts (`check_gemini.ts`, `live_run.ts`).
- **Member's Own Words**:
  > *`[MEMBER_3_TO_FILL: Add your personal thoughts and reflections on the AI agent integration here]`*

---

## Member 4 (Data, Validation & Testing)
- **Role**: QA & Testing Engineer
- **Key Contributions**:
  - Built the automated test suite in `backend/tests/system.test.ts` (25 tests across 3 files, 100% passing).
  - Implemented server-side input validation schemas using Zod for tickets, clarifications, and approval payloads.
  - Validated exact business day counting logic (`calculateBusinessDaysSinceShipping`) against test cases (shipped 2026-10-08 $\to$ 11 days; 2026-10-14 $\to$ 7 days).
  - Built offline deterministic stubs (`MockModel`) to verify database state transitions and error recovery.
- **Member's Own Words**:
  > *`[MEMBER_4_TO_FILL: Add your personal thoughts and reflections on testing and validation here]`*

---

## Member 5 & Lead Engineer (Integration, Deployment & Documentation)
- **Role**: Integration & Deployment Lead
- **Key Contributions**:
  - Consolidated end-to-end repository architecture and unified REST route contracts between the LUCY frontend and Hono backend.
  - Configured Cloudflare Workers and Cloudflare D1 configuration (`wrangler.toml`), verifying dry-run builds (`419 KiB bundle`).
  - Implemented rate limiting and deterministic environment variable loaders.
  - Authored submission documentation: `ARCHITECTURE.md`, `SERVICE_REGISTER.md`, `DEPLOYMENT.md`, `DEMO_SCRIPT.md`, and `KNOWN_LIMITATIONS.md`.
- **Member's Own Words**:
  > *`[MEMBER_5_TO_FILL: Add your personal thoughts and reflections on deployment and documentation here]`*
