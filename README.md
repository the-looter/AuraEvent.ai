# AuraEvent AI — Intelligent Event Planner & Collaborative Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/Google_GenAI-Gemini_Flash-8E75B2?style=flat-square&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](LICENSE)

> A modern, full-stack event intelligence platform powered by Google Gemini AI. Plan, budget, coordinate, and execute turnkey celebrations — from weddings and milestone birthdays to community galas and corporate summits — with real-time multi-agent copilots and multi-role collaborative editing.

---

## 🌟 Key Features

### 1. Turnkey AI Masterplan Generator
- Generates end-to-end event production plans from high-level parameters (type, headcount, target budget, aesthetic vibe, venue).
- Synthesizes balanced budget line items, chronological milestones across sprint phases, minute-by-minute day-of schedules, and vetted vendor scopes.
- Standardized with `application/json` schema constraints and resilient code-fence parsers.

### 2. Multi-Persona AI Copilot & Real-Time Chat
- Grounded in active event state (budgets, schedules, notes).
- Four specialized agent personas:
  - **Lead Producer (`lead_planner`)**: Master run-of-show timing, transitions, and contingency management.
  - **Financial Strategist (`budget_strategist`)**: Cost-per-guest analysis, margin leverage, and contract terms.
  - **Creative Director (`creative_director`)**: Sensory design, color architectures, and immersive guest journeys.
  - **Rapid Dispatcher (`fast_assistant`)**: Operational checklists and quick load-in confirmations.

### 3. Bespoke Creative Ideas & Sensory Studio
- Context-aware experiential concept engine for:
  - *Signature Menu & Mixology*
  - *Atmospheric Theme & Decor*
  - *Entertainment & Acoustic Flow*
  - *Interactive Guest Keepsakes*
  - *Zero-Waste & Plantable Favors*
- Categorized with cost tiers (`$`, `$$`, `$$$`), searchable tags, and instant pinning to master plans.

### 4. Financial & Budget Optimizer
- Live financial health scoring (`Balanced`, `Needs Adjustment`, `Over Budget`).
- Computes estimated savings potential and surfaces actionable line-item rebalance levers.
- Tactical vendor negotiation playbooks (e.g., direct ACH courtesy discounts, floral repurposing).

### 5. Vendor Hub & Automated Email Drafter
- Full lifecycle status tracking (`researching` ➔ `contacted` ➔ `proposal_received` ➔ `contract_signed` ➔ `paid`).
- Generates polished, high-leverage vendor inquiry, discount negotiation, and call-sheet confirmation emails with one click.

### 6. Real-Time Multi-Planner Collaboration
- Multi-role simulation (`Lead Planner`, `Budget Manager`, `Spatial Stylist`, `Event Host`).
- Inline commenting, task ownership assignment, and audit activity logging.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    React 19 SPA (Client)                    │
│   EventOverview · BudgetPlanner · Timeline · VendorHub      │
│   CreativeIdeas · GeminiChatbot · AICopilot · ExportModal   │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API (/api/ai/*)
┌──────────────────────────────▼──────────────────────────────┐
│                    Express Backend Server                   │
│   • Helmet HTTP Security Headers                            │
│   • Payload Limitation & Input Sanitization                 │
│   • Resilient Codeblock JSON Parsing (parseJsonSafely)      │
│   • Timeout Protection & Dynamic Local Fallbacks            │
└──────────────────────────────┬──────────────────────────────┘
                               │  Google GenAI TypeScript SDK
┌──────────────────────────────▼──────────────────────────────┐
│               Google Gemini AI (Cloud Backend)              │
│               Model: gemini-3.1-flash-lite                  │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express, tsx, dotenv, Helmet.
- **AI Engine**: `@google/genai` TypeScript SDK via `gemini-3.1-flash-lite`.
- **Testing**: Vitest with `jsdom`, automated endpoint integration harness.
- **Packaging & Bundling**: Vite 6+.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/auraevent-ai.git
   cd auraevent-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   PORT=3000
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

The project includes unit tests, domain model validations, accessibility checks, and live endpoint verification:

```bash
# Run unit & domain test suites with Vitest
npm test

# Run all test suites including live backend AI endpoint validation
npm run test:all

# Type-check TypeScript codebase
npm run lint

# Build for production
npm run build
```

### Test Coverage Highlights
- **Domain Models**: Validates event initialization, status transitions, and budget rollups.
- **Gemini Service**: Tests AI synthesis, cost tier assignments, and edge-case handling ($0 budget, 0 guests).
- **Security & Parsing**: Verifies input sanitization and code-fence stripping (`parseJsonSafely`).
- **Accessibility**: Validates ARIA attributes, modal roles, and WCAG contrast rules.
- **Endpoints**: Verifies HTTP 200, valid contracts, and JSON schema compliance for all 6 API routes.

---

## 🛡️ Security & Privacy

- **Header Hardening**: `helmet` enforces secure headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
- **DoS Prevention**: Express request body limits restricted to 2MB.
- **Server-Side API Keys**: The `GEMINI_API_KEY` is securely accessed on the backend server only; it is never exposed in client bundles.
- **Sanitized Error Logs**: Internal error stacks are hidden from public client responses.

---

## ♿ Accessibility (WCAG 2.1 AAA Compliant)

- **Keyboard Navigation**: Skip-to-content anchor (`#main-content`) allows immediate bypass of headers.
- **ARIA Landmark Semantics**: Semantic `<header>`, `<main>`, `<nav>`, `<section>` roles with proper `tablist`, `tab`, and `tabpanel` associations.
- **Screen Reader Readiness**: Every input contains corresponding `<label htmlFor="...">` and every icon button includes an explicit `aria-label`.
- **Accessible Modals**: All dialogs implement `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.

---

## 📄 License

Distributed under the Apache 2.0 License. See `LICENSE` for details.
