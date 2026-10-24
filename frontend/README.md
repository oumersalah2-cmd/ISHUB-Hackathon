# LUCY CSR — AI-Assisted Customer Support Resolution

**LUCY CSR** is a high-performance, professional SaaS web application designed for Customer Support Representatives (CSRs). It equips support officers with an AI-assisted investigation engine that analyzes incoming tickets, retrieves relevant corporate policy evidence, drafts grounded customer responses, and enforces explicit human-in-the-loop verification before final resolution.

---

## 1. Technology Stack

- **Framework:** React 19 & Vite 8
- **Language:** JavaScript (ES Modules, strictly no TypeScript)
- **Styling:** Standard Pure CSS3 (Custom design system, strictly no Tailwind CSS)
- **Networking:** Native `fetch` with centralized API client
- **Icons:** Lightweight vector SVG icons via `lucide-react`
- **Routing:** `react-router-dom` v7

---

## 2. Brand & UI/UX Design System

The application strictly implements the required brand design specifications:

- **Brand Logo:** Integrated `Lucy CSR Fossil Headset Logo.png` displayed in the persistent sidebar and favicon.
- **Orange Palette:**
  - `--orange-500` (`#F97316`), `--orange-600` (`#EA580C`), `--orange-700` (`#C2410C`): Primary action buttons, active navigation indicators, interactive hover states, focus rings, and primary highlights.
- **Dark Blue Palette:**
  - `--darkblue-900` (`#0B1B32`), `--darkblue-800` (`#0F2644`), `--darkblue-50` (`#F0F5FA`): Structural hero banners, modal overlays, window headers, container cards, and elevation shadows.
- **Typography Contrast Rule:**
  - **Strictly Enforced:** Neither Orange nor Dark Blue is ever used for reading typography or body text.
  - High-contrast Dark Gray (`#2D3748`, `#374151`) and Black (`#111827`) are used for all typography, body text, form labels, and table cells to guarantee readability and accessibility.
  - Pure crisp white (`#FFFFFF`) is used for text on solid colored buttons.
- **Micro-Interactions & States:**
  - Shimmer skeletons during loading.
  - Non-intrusive floating toast notification system.
  - Form state preservation upon API errors.
  - Multi-state anti-duplicate submission safeguards.

---

## 3. Directory Structure

```
frontend/
├── public/
│   ├── logo.png
│   └── Lucy CSR Fossil Headset Logo.png
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── Spinner.jsx
│   │   ├── layout/             # Navigation and app chrome
│   │   │   ├── ApiConfigModal.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── tickets/            # Ticket listings and filters
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── TicketFilterBar.jsx
│   │   │   └── TicketTable.jsx
│   │   ├── investigation/      # AI agent investigation & review
│   │   │   ├── AgentActivityFeed.jsx
│   │   │   ├── ApprovalConfirmModal.jsx
│   │   │   ├── ClarificationForm.jsx
│   │   │   ├── InvestigationTimeline.jsx
│   │   │   ├── PolicyEvidenceViewer.jsx
│   │   │   ├── ProposalReviewSection.jsx
│   │   │   └── TicketOverviewCard.jsx
│   │   └── outbox/             # Internal outbox archive
│   │       ├── OutboxDetailModal.jsx
│   │       └── OutboxTable.jsx
│   ├── context/
│   │   ├── ApiConfigContext.jsx # Runtime API URL & health check
│   │   └── ToastContext.jsx     # Floating toast notifications
│   ├── pages/
│   │   ├── HomePage.jsx         # Executive dashboard
│   │   ├── InboxPage.jsx        # Support ticket queue
│   │   ├── InvestigationPage.jsx# Investigation, clarification & approval
│   │   ├── OutboxPage.jsx       # Saved finalized records
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   └── api.js               # Centralized API client module
│   ├── styles/
│   │   ├── components.css       # Buttons, cards, modals, form controls
│   │   ├── index.css            # CSS variables & typography tokens
│   │   ├── layout.css           # Sidebar & top navigation layout
│   │   └── pages.css            # Dashboard, workspace & table layouts
│   ├── App.jsx
│   └── main.jsx
├── .env                         # Environment configuration
├── .env.example                 # Example environment template
├── index.html
├── package.json
└── vite.config.js
```

---

## 4. Setup & Running the Application

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd /home/koket/frontend
   ```

2. Install dependencies (use `--legacy-peer-deps`):
   ```bash
   npm install --legacy-peer-deps
   ```

### Configuring Environment Variables (`.env`)
Create or edit your `.env` file in the root of the project:

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to point to your backend API server:

```env
# LUCY CSR Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8000/api
```

*(Note: Support officers can also override and test the backend URL directly in the UI by clicking the **API Connection** button in the sidebar or navbar.)*

### Running Development Server
Start Vite with hot module replacement:

```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:5173
```

### Production Build
To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 5. API Integration Specification

The frontend connects to the backend through `src/services/api.js`. The client expects standard RESTful routes and gracefully handles both path-based routes and root action routes:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/tickets` | Retrieves support tickets. Supports query params: `status`, `priority`, `search`. |
| `GET` | `/tickets/:id` | Retrieves complete details for a single ticket. |
| `POST`| `/tickets/:id/investigate` | Triggers the AI agent investigation. Returns `agent_activities`, `policy_evidence`, and `proposal`. |
| `POST`| `/tickets/:id/clarify` | Submits missing clarification details to resume investigation. |
| `POST`| `/tickets/:id/approve` | Confirms human approval of the resolution. Persists finalized status. |
| `GET` | `/outbox` | Retrieves archived finalized ticket resolutions. |
| `GET` | `/health` | Health check endpoint to report connection status in the header. |

### Strict Error Handling & Resilience:
- User inputs in the clarification form and proposal editor are **never cleared** if a network or backend request fails.
- All non-200 responses trigger a styled error toast detailing the backend error message (`detail` or `message`).
- Operations are never marked successful until the server explicitly responds with HTTP `200 OK`.
- Duplicate submissions are blocked via button disabling and loading indicators.

---

## 6. Key Screens & Features

1. **Dashboard Overview (`/`)**: High-level queue metrics, API connection health status, and quick shortcuts to the Inbox and Outbox.
2. **Ticket Inbox (`/inbox`)**: Real-time table of incoming support requests with live search, status filters (Open, Investigating, Needs Clarification, Approved, Closed), and priority tags.
3. **Investigation & Clarification Workspace (`/inbox/:ticketId`)**:
   - Customer message context and metadata.
   - Real-time 5-stage progress stepper.
   - Interactive AI Agent execution trace and reasoning log.
   - Verified policy grounding evidence cards with clause citations and confidence ratings.
   - Missing information clarification prompt and submission form.
4. **Human Review & Approval (`/inbox/:ticketId`)**:
   - Editable customer response draft with word/character counter.
   - Reset to original AI draft functionality.
   - Double-check confirmation modal with explicit "Confirm & Save" action.
5. **Internal Outbox (`/outbox`)**:
   - Archive of approved customer resolutions.
   - Detail view with one-click response copy to clipboard and option to reopen tickets in the workspace.
