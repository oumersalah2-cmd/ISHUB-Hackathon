# Contributing to ResolvAI

Welcome team! Follow these guidelines to keep our collaboration fast, conflict-free, and safe.

---

## 1. Feature Branches

Each team member works on their dedicated feature branch:

| Member | Dedicated Branch | Scope / Files |
| :--- | :--- | :--- |
| **Member 1** | `feature/frontend-dashboard` | `frontend/` (UI components, styling, dashboard) |
| **Member 2** | `feature/backend-database` | `backend/src/routes/`, `backend/migrations/`, `backend/seed/`, db layer |
| **Member 3** | `feature/ai-agent` | `backend/src/services/ai.ts`, `backend/src/tools/` |
| **Member 4** | `feature/test-data` | `backend/tests/`, `backend/src/validation/`, test scripts |
| **Member 5** | `feature/deployment-docs` | `docs/`, `wrangler.toml`, deployment scripts, `README.md` |

---

## 2. Core Collaboration Rules

1. **Commit small and often**: Write focused, incremental commits so code is easy to review.
2. **Pull before you push**: Always run `git pull origin main` to synchronize before pushing your work.
3. **Stay in your own folder**: Edit only your assigned module unless explicitly agreed with the repository owner.
4. **Never commit secrets**: Do not commit `.env`, `.dev.vars`, or API keys. Always use `.env.example` as a template.
5. **Open a Pull Request into `main`**: Never commit directly to `main`. Open a PR and request review.
6. **Scheduled Merges**: We merge PRs into `main` at **12:00** and **16:00 (4:00 PM)**.
7. **Never force push**: `git push --force` is strictly forbidden.

---

## 3. Commit Message Style

Use standard conventional commit prefixes:

- `feat:` New features or functionality (e.g., `feat: add ticket approval modal`)
- `fix:` Bug fixes (e.g., `fix: correct business days date difference calculation`)
- `docs:` Documentation updates (e.g., `docs: update hackathon presentation script`)
- `test:` Unit or integration test additions (e.g., `test: add date math unit tests`)
- `chore:` Repository maintenance, configs, tooling (e.g., `chore: update gitignore rules`)

---

## 4. Pull Request Checklist

Before submitting a PR, ensure:
- [ ] Code works locally (`npm run dev`)
- [ ] Automated tests pass (`npm test`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No `.env`, secrets, or build artifacts are staged
- [ ] You are ready to briefly explain your changes to the team
