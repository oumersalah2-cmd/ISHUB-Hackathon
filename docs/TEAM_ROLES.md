# ResolvAI - Team Roles & Responsibilities

**Project**: ResolvAI - AI Customer Support Resolution Agent  
**Event**: Vision Vertex AI Agent Hackathon  
**Team Composition**: 5 University Students  

---

## 1. Team Responsibilities Matrix

Taken directly from the Hackathon Participant Guide:

| Member | Role | Dedicated Branch | Primary Responsibilities | Key Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **Frontend Engineer** | `feature/frontend-dashboard` | UI & UX implementation, responsive dashboard, ticket list, real-time investigation stepper, policy evidence display, clarification dialog, draft response editor, human approval modal, and audit history view. | `frontend/src/*`, Vanilla CSS design system, user interaction flows |
| **Member 2** | **Backend & Database Engineer** | `feature/backend-database` | REST API endpoints, D1/SQLite schema migrations, seed scripts, transactional updates, input validation middleware, CORS setup. | `backend/src/routes/*`, `backend/migrations/*`, `backend/seed/*`, database abstraction |
| **Member 3** | **AI Agent Engineer** | `feature/ai-agent` | Gemini model integration, tool declarations (`read_ticket`, `search_policies`, `update_ticket`), bounded tool-calling loop (max 5 calls, 6 turns), prompt engineering, grounding rules, clarification handling, and error recovery. | `backend/src/services/ai.ts`, `backend/src/tools/*`, `backend/live_run.ts` |
| **Member 4** | **Data, Validation & Testing** | `feature/test-data` | Synthetic demo dataset verification (`seed-data.json`), input/output validation schemas, unit and integration test suite, exact date math unit tests, 5-case test report. | `backend/tests/*`, `docs/TEST_REPORT.md`, `backend/src/validation/*` |
| **Member 5** | **Integration, Deployment & Documentation** | `feature/deployment-docs` | Cloudflare Workers & Pages deployment, environment variable configuration, cloud service register, architecture documentation, README, and live 10-minute demo script. | `wrangler.toml`, `docs/SERVICE_REGISTER.md`, `docs/DEMO_SCRIPT.md`, `README.md`, `CONTRIBUTING.md` |

---

## 2. Collaboration Protocol

1. **Feature Branches**: All active feature development takes place on the designated branch above. Never commit directly to `main`.
2. **Merge Windows**: PRs into `main` are reviewed and merged at **12:00** and **16:00 (4:00 PM)**.
3. **Branch Protection**: `main` remains deployable and passing tests at all times.
