# Hackathon Service Register

This register documents all cloud services, hosting platforms, and AI model providers utilized by the **AI Customer Support Resolution Agent**. Every service selected complies strictly with hackathon rules: **100% free-tier eligibility without trial credits, promotional balances, or credit-card requirements**.

---

## 1. Summary of Registered Services

| Service | Provider | Purpose | Free Tier Limits | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Workers** | Cloudflare | Hosted Serverless Backend REST API | 100,000 requests / day; 10ms CPU time / request | $0.00 / mo |
| **Cloudflare D1** | Cloudflare | Persistent Serverless SQL Database | 5,000,000 read rows / day; 100,000 write rows / day; 500 MB storage | $0.00 / mo |
| **Cloudflare Pages** | Cloudflare | Static Frontend Hosting (Vite + React) | Unlimited bandwidth; 500 builds / month; Free SSL | $0.00 / mo |
| **Google Gemini API** | Google AI Studio | Primary AI Model (`gemini-2.5-flash` / `gemini-2.0-flash`) | 15 Requests Per Minute (RPM); 1,500 Requests Per Day (RPD); 1,000,000 Tokens Per Minute | $0.00 / mo |
| **Groq Cloud API** | Groq Inc. | Alternate Free AI Model (`llama-3.3-70b-versatile`) | 30 Requests Per Minute (RPM); 14,400 Requests Per Day (RPD) | $0.00 / mo |

---

## 2. In-Depth Service Breakdown & Official Documentation

### 2.1 Cloudflare Workers (Backend API)
- **Role**: Hosts the TypeScript Hono API gateway, executing tool loops, input validation, and database operations.
- **Eligibility**: Open to any free Cloudflare account without credit card entry.
- **Quota & Constraints**:
  - Daily limit: 100,000 requests (resets daily at 00:00 UTC).
  - Burst rate: 1,000 requests/min.
- **Official Documentation**: [https://developers.cloudflare.com/workers/platform/pricing/](https://developers.cloudflare.com/workers/platform/pricing/)

### 2.2 Cloudflare D1 (SQL Database)
- **Role**: Remote persistent storage for `tickets`, `policies`, and `ticket_updates` tables with relational integrity and transactional guarantees.
- **Eligibility**: Native integration with Cloudflare Workers on the free tier.
- **Quota & Constraints**:
  - Read rows: 5 Million / day.
  - Write rows: 100,000 / day.
  - Storage: Up to 500 MB (project seed data requires < 1 MB).
- **Official Documentation**: [https://developers.cloudflare.com/d1/platform/pricing/](https://developers.cloudflare.com/d1/platform/pricing/)

### 2.3 Cloudflare Pages (Frontend Hosting)
- **Role**: Builds and serves the React 19 + TypeScript single-page application globally via Cloudflare edge network.
- **Eligibility**: Free forever for individuals and open-source projects.
- **Quota & Constraints**: Unlimited requests and bandwidth.
- **Official Documentation**: [https://developers.cloudflare.com/pages/platform/pricing/](https://developers.cloudflare.com/pages/platform/pricing/)

### 2.4 Google Gemini API (AI Agent Reasoning & Function Calling)
- **Role**: Powers the live decision-making agent, identifying required tools, inspecting policy constraints, asking clarification questions, and synthesizing customer responses.
- **Model Selected**: `gemini-2.5-flash` (or `gemini-2.0-flash`).
- **Eligibility**: Free tier available immediately via Google AI Studio API keys.
- **Quota & Constraints**:
  - 15 RPM (sufficient for hackathon demonstration with ~1-2 requests/minute).
  - 1,500 RPD.
- **Official Documentation**: [https://ai.google.dev/pricing](https://ai.google.dev/pricing)

### 2.5 Groq Cloud API (Backup / Secondary AI Provider)
- **Role**: Drop-in backup provider for ultra-fast Llama-3.3 inference if Gemini rate limits or network issues occur.
- **Model Selected**: `llama-3.3-70b-versatile`.
- **Eligibility**: Free developer plan with no credit card required.
- **Official Documentation**: [https://groq.com/pricing/](https://groq.com/pricing/)

---

## 3. Quota Management & Guardrails
1. **Bounded Tool Execution**: System prompt and agent loop strictly enforce at most 5 tool calls and 6 model turns per request.
2. **Deterministic Fallback**: In the event of network disruption or quota exhaustion, a user-readable error is displayed offering immediate manual retry without losing state.
