# Team Roles & Git Collaboration Guide

**Project**: AI Customer Support Resolution Agent  
**Event**: Vision Vertex AI Agent Hackathon  
**Team Composition**: 5 University Students  

---

## 1. Team Responsibilities Matrix

| Member | Role | Primary Responsibilities | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Frontend Engineer** | User interface & UX, responsive dashboard, ticket list, real-time investigation stepper, policy evidence display, clarification dialog, draft response editor, approval modal, and audit history. | `frontend/src/*`, responsive CSS design system, user interaction flows |
| **Member 2** | **Backend & Database Engineer** | REST API endpoints, D1/SQLite database schema, SQL migrations, seed scripts, transactional updates, input validation middleware, CORS setup. | `backend/src/routes/*`, `backend/migrations/*`, `backend/seed/*`, database abstraction |
| **Member 3** | **AI Agent Engineer** | Model integration (Gemini / Groq / Workers AI), tool declarations, bounded tool-calling loop, prompt design, clarification handling, evidence grounding, fallback handlers. | `backend/src/tools/*`, `backend/src/services/ai.ts`, SRS implementation |
| **Member 4** | **Data, Validation & Testing** | Synthetic demo dataset generation, input/output validation schemas, unit and integration test suite, 5-case test report, simulated failure handling. | `tests/*`, `docs/TEST_REPORT.md`, validation schemas (`backend/src/validation/*`) |
| **Member 5** | **Integration, Deployment & Docs** | Cloudflare Workers / Pages deployment, environment variable configuration, service register, architecture documentation, README, and live demo script. | `wrangler.toml`, `docs/SERVICE_REGISTER.md`, `docs/DEMO_SCRIPT.md`, `README.md` |

---

## 2. Git Collaboration Workflow

To ensure smooth, parallel development without merge conflicts or lost code, our team follows a structured Git feature branch model.

### 2.1 Branching Convention
All work takes place on dedicated feature branches branched from `main`:
- `feature/frontend-dashboard`: Member 1 (UI components, styling, API client)
- `feature/backend-database`: Member 2 (REST API, D1 schema, migrations)
- `feature/ai-agent`: Member 3 (Function calling, bounded loops, prompt engineering)
- `feature/test-data`: Member 4 (Synthetic datasets, Vitest integration tests)
- `feature/deployment-docs`: Member 5 (Wrangler configuration, documentation, scripts)

### 2.2 Contribution Rules
1. **Never commit secrets**: Files like `.env`, `.dev.vars`, and API keys must never be staged (`git status` must be clean of credentials before committing).
2. **Atomic, Descriptive Commits**: Use conventional commits:
   - `feat(agent): implement bounded tool loop with turn limit`
   - `fix(backend): validate ticket_id existence prior to confirmation`
   - `docs(demo): add step-by-step 10-minute presentation script`
3. **Pull Request Protocol**:
   - Push feature branches to GitHub: `git push origin feature/<name>`
   - Open a PR into `main`.
   - Require at least one peer review from another team member.
   - Run the test suite (`npm test`) before approving and merging.
4. **Merge Conflict Resolution**: Rebase or merge `main` into your feature branch locally, test thoroughly, and then push.

### 2.3 Manual Actions for Repository Owner
- Ensure repository visibility is configured according to hackathon rules (Public for judging).
- Set repository branch protection rules on `main` to require PR reviews and passing status checks.
- Add team members as collaborators under repository settings.
