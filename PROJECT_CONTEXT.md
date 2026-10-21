# TutorHub (Teacher Hub) — Project Context & Living Knowledge Base

> **Last Updated:** October 2026  
> **Status:** Phase 1 Setup & Scaffolding Completed, Validated & Pushed  
> **Repository:** [https://github.com/Ahnabu/tutor-hub](https://github.com/Ahnabu/tutor-hub) (Branch: `main`)  
> **Frontend Validation:** Next.js 16 App Router + Tailwind v4 + React 19 (`npm run lint` & `tsc --noEmit`: 0 errors)  
> **Backend Validation:** Node.js + Express 5 + Mongoose 8 + TypeScript (`npm run build`: 0 errors)  
> **Target Audience:** Private tutors, guardians, and students in Bangladesh (BDT currency, `Asia/Dhaka` timezone, week starts Saturday).

---

## 1. Project Architecture & Decoupling Strategy

The backend and frontend are **completely decoupled, independent standalone projects** designed for separate hosting and deployments:

```
TutorHub/
├── backend/                      # Standalone Express 5 & Mongoose API
│   ├── package.json              # Independent scripts & dependencies
│   ├── tsconfig.json             # Independent NodeNext TypeScript config
│   ├── .env.example              # Backend environment template
│   ├── .env                      # Local environment configuration
│   ├── dist/                     # Compiled JavaScript output
│   └── src/                      # API source code (routes, controllers, models, DTOs)
│
├── frontend/                     # Standalone Next.js 16 App Router UI
│   ├── package.json              # Independent scripts & UI dependencies
│   ├── tsconfig.json             # Independent Next.js TypeScript config
│   ├── next.config.ts            # Proxy rewrites & config
│   ├── .env.example              # Frontend environment template
│   ├── .env.local                # Local environment configuration
│   └── src/                      # Client & server components, pages, styles
│
├── docs/                         # Centralized Project Documentation
│   ├── ARCHITECTURE.md           # System topology & service layout
│   ├── DECISIONS.md              # Architecture Decision Records (ADRs)
│   ├── API.md                    # Endpoints & route specifications
│   ├── SECURITY.md               # Security, RBAC & media isolation rules
│   └── DEFERRED.md               # Backlog for Phases 2, 3, and 4
│
├── docker-compose.yml            # MongoDB single-node Replica Set (rs0) + Mailpit
├── PROJECT_CONTEXT.md            # Living knowledge base and context tracker
└── package.json                  # Root orchestrator with convenience scripts
```

### Hosting Strategy:
- **Frontend:** Standalone deployment to Vercel (or Cloudflare Pages).
- **Backend:** Standalone deployment to Render, Railway, Fly.io, or dedicated VPS.
- **Database:** MongoDB Atlas with replica set support (required for multi-document ACID transactions).

---

## 2. Installed Packages & Environment Verification

### 2.1 Backend (`backend/package.json`)
- **Runtime & Framework:** `express` (v5.0.1), `mongoose` (v8.7.2), `typescript` (v5.6.3), `tsx` (v4.19.1)
- **Security & Auth:** `argon2` (v0.41.1), `jsonwebtoken` (v9.0.2), `helmet` (v8.0.0), `cors` (v2.8.5), `cookie-parser` (v1.4.7), `express-rate-limit` (v7.4.1)
- **Validation & Utility:** `zod` (v3.23.8), `dotenv` (v16.4.5), `pino` (v9.5.0), `pino-pretty` (v13.0.0)
- **Integrations:** `nodemailer` (v6.9.16), `cloudinary` (v2.5.1)
- **Testing Suite:** `vitest` (v2.1.3), `supertest` (v7.0.0), `mongodb-memory-server` (v10.1.0)
- **Validation Status:** `npm run build` succeeds with 0 errors.

### 2.2 Frontend (`frontend/package.json`)
- **Framework & Core:** `next` (v16.4.2), `react` (v19.3.0), `react-dom` (v19.3.0), `typescript` (v5)
- **Styling & UI:** `tailwindcss` (v4), `lucide-react` (v1.60.0), `framer-motion` (v14.4.0), `next-themes` (v0.4.6), `clsx`, `tailwind-merge`
- **Data & Client State:** `@tanstack/react-query` (v5.104.5), `axios` (v1.20.0)
- **Forms & Validation:** `react-hook-form` (v7.90.0), `@hookform/resolvers` (v3.10.0), `zod` (v4.6.7)
- **Validation Status:** `npm run lint` & `npx tsc --noEmit` pass with 0 errors.

---

## 3. UI Responsiveness & Design System

- **Glassmorphic Atmosphere:**
  - Dark Mode: Obsidian `#090D16`, Slate glass `rgba(17,24,39,0.65)`, Text `#F8FAFC`, Muted `#94A3B8`.
  - Light Mode: Alabaster `#F8FAFC`, Frosted white `rgba(255,255,255,0.75)`, Text `#0F172A`.
  - Accents: Emerald (`#10B981`), Amber (`#F59E0B`), Coral (`#F43F5E`), Indigo (`#6366F1`).
- **Responsive Guarantee:**
  - Mobile (< 640px): Floating bottom navigation, touch targets ≥ 44px, compact drawer sheets.
  - Tablet (640px - 1024px): Adaptive multi-column grid, responsive cards.
  - Desktop (> 1024px): Spacious dashboard, collapsible sidebar, wide-screen data tables.

---

## 4. How to Run Locally

### Start Infrastructure (MongoDB Replica Set + Mailpit)
```bash
docker compose up -d
```
- MongoDB Replica Set: `mongodb://localhost:27017/tutorhub?replicaSet=rs0`
- Mailpit Web UI: `http://localhost:8025` (SMTP port `1025`)

### Run Backend
```bash
cd backend
npm run dev
# Starts Express API on http://localhost:5000
```

### Run Frontend
```bash
cd frontend
npm run dev
# Starts Next.js on http://localhost:3000
```

---

## 5. Next Steps Plan (Phase 1 Implementation)

### Step 1: Backend Schemas & Data Layer (Separated Collections) — COMPLETED
- [x] Implement Mongoose models in `backend/src/models/`:
  - [x] `User.ts` (public-safe fields, `passwordHash` select:false, `tokenVersion`)
  - [x] `TeacherPrivateProfile.ts` (1:1 with User, WhatsApp, alternate phone, encrypted docs)
  - [x] `RefreshSession.ts` (token family tracking, reuse detection, TTL index)
  - [x] `Tuition.ts` (tuition agreement, cycle counter status, payment ledger, guardian share token hash)
  - [x] `SessionLog.ts` (daily entries, idempotency key `clientRequestId`, attendance, local date)
  - [x] `CycleHistory.ts` (archived billing cycles)
  - [x] `ContactAccessRequest.ts` & `ContactGrant.ts`
  - [x] `MarketplacePost.ts` & `MarketplaceApplication.ts`
  - [x] `EmailOutbox.ts` (asynchronous email queue)
  - [x] `AuditLog.ts` (append-only audit trail)
  - [x] `Notification.ts` (in-app notifications)
  - [x] `SystemConfig.ts` (system-wide tunables)
- [x] Unit test verification in `backend/src/tests/models.test.ts` (8/8 tests passing)

### Step 2: Backend Core Security Middleware & Utility Layer — COMPLETED
- [x] Strict Zod request validator (`validateRequest`) with `.strict()` schemas.
- [x] Recursive NoSQL injection key sanitizer (`sanitizeInput` dropping `$` and `.`).
- [x] JWT & Cookie helper (access token 15m, refresh token 7d with SHA-256 hash, HTTP-only cookies).
- [x] Authentication middleware (`authenticate`), role-based access control (`authorizeRoles`), and user status check (`tokenVersion`).
- [x] CSRF protection middleware (`csrfProtection` enforcing `X-Requested-With: tutorhub`).
- [x] Centralized error handler (`errorHandler`) with consistent error envelopes.
- [x] Role-specific DTO mappers (`toUserDTO`, `toPublicTeacherDTO`) guaranteeing zero PII leaks.
- [x] Email service with Mailpit worker and responsive HTML templates (OTP, reset, claim).
- [x] Resource ownership middleware pattern (`loadOwnedTuition`).
- [x] Comprehensive unit & integration tests (`backend/src/tests/middleware.test.ts` - 18/18 tests passing).

### Step 3: Auth Endpoints & Admin Seeder — COMPLETED
- [x] Auth endpoints: Register (Teacher/Guardian), Verify Email (OTP), Resend OTP, Login, Refresh (with family reuse detection), Logout, Logout-All, Forgot/Reset Password, `/auth/me`.
- [x] Guardian Claim flow: `/auth/claim-guardian/start`, `/auth/claim-guardian/verify` (activates shadow account and links tuitions).
- [x] Cloudinary signature endpoint (`/uploads/signature`) enforcing server-dictated paths and 60s lifetime.
- [x] Admin seed script (`npm run seed:admin` / `src/scripts/seedAdmin.ts`) with `--force` override option.
- [x] Comprehensive integration tests (`backend/src/tests/auth.test.ts` - 25/25 tests passing across entire suite).

### Step 4: Frontend Responsive Shell & Auth Workflows — COMPLETED
- [x] Tailwind CSS v4 configured with `@tailwindcss/postcss` and PostCSS config.
- [x] Global Theme Provider (`next-themes`) & React Query Client Provider (`providers.tsx`).
- [x] Axios client with mutex single-flight 401 refresh interceptor (`frontend/src/lib/api.ts`).
- [x] Responsive navigation shell:
  - Mobile: Floating glass bottom navigation bar (`BottomNav.tsx`).
  - Desktop: Sticky top header with brand logo, user pill, logout, and theme toggle (`Navbar.tsx`).
- [x] Auth pages with glassmorphism dark/light design system:
  - Landing page (`/`) with features and CTA
  - Register (`/register` with role picker: Teacher vs Guardian, validation)
  - Email OTP verification (`/verify-email` with 6-digit pin code & resend countdown)
  - Login page (`/login`)
  - Forgot Password (`/forgot-password`)
  - Password Reset (`/reset-password?token=...`)
  - Guardian Claim screen (`/claim-guardian?token=...` with start & OTP verification steps)
  - Role-based dashboard shells (`/teacher`, `/guardian`, `/admin`)
- [x] Zero ESLint warnings/errors, TypeScript compiled, 13/13 routes statically prerendered with Next.js Turbopack.

---

## 6. Phase 1 Verification Matrix (Definition of Done)
| Check | Status | Evidence |
|---|---|---|
| Decoupled Repos | PASS | `backend/` and `frontend/` have standalone `package.json`, isolated lockfiles |
| Production Vulnerabilities | 0 | `npm audit --omit=dev` produces 0 vulnerabilities in both apps |
| Test Coverage | PASS | 25/25 passing tests in `backend/` (middleware, models, auth, health) |
| Strict Config | PASS | Zod boot validator in backend (`env.ts`), validated Next.js envs |
| Security Middlewares | PASS | Recursive NoSQL sanitizer, strict Zod schemas, CSRF header checks, rate limiting |
| Auth Security | PASS | Argon2id, SHA-256 tokens, JWT access/refresh rotation, family revocation on theft |
| Responsive UI | PASS | Next.js 16 + Tailwind CSS v4, mobile-first floating dock, desktop navbar, theme toggle |
| Build & Lint | PASS | 0 lint warnings/errors across backend & frontend; Next.js 13/13 routes built |

---

## 7. Phase 2: Teacher Workspace & Tuition Management — COMPLETED
- [x] **Branding & Logo Update:**
  - Removed default Next.js favicon and unused SVGs.
  - Deployed custom TutorHub emerald gradient squircle graduation cap icon (`/icon.svg`).
- [x] **Tuition Management Engine:**
  - `POST /tuitions` (contract creation with student subdocs, schedule config, shadow guardian linking).
  - `GET /tuitions` & `GET /tuitions/:id` (teacher-scoped tuition retrieval with cycle progress calculations).
  - `PATCH /tuitions/:id` (update schedule, fees, and notes).
  - `POST /tuitions/:id/share-token` (cryptographically secure 64-char guardian share token with Argon2id PIN protection).
  - `POST /tuitions/:id/record-payment` (payment ledger tracking, PARTIAL/PAID status, cycle reset, and archival to `CycleHistory`).
  - `POST /tuitions/:id/archive` (tuition archival).
- [x] **Next-Day Memory Prefill & Idempotent Session Logging:**
  - `GET /tuitions/:id/sessions/prefill` (queries last completed class, automatically extracting unfinished topics, homework, and next class plan).
  - `POST /tuitions/:id/sessions` (idempotent logging with `clientRequestId`, automatic cycle day increment, and cycle completion detection).
  - `GET /tuitions/:id/sessions` & `PATCH /tuitions/:id/sessions/:sessionId` (history with audit log tracking).
- [x] **Teacher Dashboard UI:**
  - Responsive cards with cycle progress bars (`X / 12 Days Completed`), billing status pills, and revenue statistics.
  - Interactive **Create Tuition Modal** with multi-subject tags.
  - Interactive **Log Session Modal** featuring real-time **Next-Day Memory Prefill** banner.
  - Interactive **Record Payment Modal** (Cash, bKash, Nagad, Bank) with optional cycle advancement.
  - Interactive **Guardian Share Modal** with 1-click clipboard copy and direct WhatsApp sharing.
- [x] **Automated Test Suite:**
  - 34/34 passing unit & integration tests in `backend/` (including 9 new tuition & session tests).
  - 0 lint errors, 0 lint warnings in `frontend/`.
  - Clean Next.js 16 production build.

## 8. Phase 3: Guardian Portal & Gated Teacher Profiles — COMPLETED
- [x] **PIN-Protected Guardian Viewer (`/guardian/view/[token]`):**
  - Verification endpoint `POST /guardian/view/:token/verify-pin` with Argon2id PIN verification and 15-minute brute-force lockout.
  - Generates 7-day signed JWT view-session cookie.
  - Sanitized read-only tuition data: student names, cycle day counter, session history with teacher remarks, and payment ledger.
  - Zero private contact leak guarantee (tutor phone & email excluded).
- [x] **Claimed Guardian Multi-Tutor Dashboard (`/guardian`):**
  - Aggregates all active tuitions linked to the guardian's verified mobile number or email.
  - Real-time cycle progress bars, payment status pills, and tutor information.
  - "My Contact Requests" tracking section: reveals tutor phone, WhatsApp, and email once approved.
- [x] **Public SEO Teacher Directory (`/teachers`):**
  - Search by tutor name, university, or subjects.
  - Subject and Dhaka area filter pills.
  - Verified badges, experience counters, and expected rate ranges.
- [x] **Privacy-Gated Teacher Profile Page (`/teachers/[slug]`):**
  - Full bio, credentials, subjects offered, and preferred areas.
  - "Request Direct Contact Information" workflow with requirement note modal.
  - Automatic reveal of phone & WhatsApp once granted by teacher.
- [x] **Teacher Control Plane Upgrades (`/teacher`):**
  - "Incoming Contact Requests" drawer with Approve / Decline actions and audit log creation.
  - "Profile & Verification" settings modal for directory toggle, bio, subjects, rate range, and NID/University ID submission.
- [x] **Phase 3 Test Suite:**
  - 45/45 passing unit & integration tests in `backend/` (all 6 test files passing).
  - Clean Next.js 16 production build with 14 static and dynamic routes.

## 9. Phase 4: Dual-Sided Marketplace, Admin Command Center & Compliance — COMPLETED
- [x] **Marketplace Models & Endpoints (`/api/v1/marketplace`):**
  - `POST /marketplace/posts`: Guardian creates tuition requirements with student class/grade, subjects, area, budget, and days/week.
  - `GET /marketplace/posts`: Public feed with search (title/subject/area), Dhaka area filter chips, teaching mode, and budget ranges.
  - `GET /marketplace/my-posts`: Guardian views their own tuition postings and applicant counts.
  - `PATCH /marketplace/posts/:id/close`: Guardian closes post.
  - `POST /marketplace/posts/:id/apply`: Teacher submits application pitch (enforcing 1 application per teacher per post).
  - `GET /marketplace/my-applications`: Teacher tracks all submitted applications and statuses.
  - `GET /marketplace/posts/:id/applications`: Guardian reviews applicants with university, bio, and experience credentials.
  - `POST /marketplace/applications/:id/respond`: Guardian accepts/rejects applicants. Accepting creates a mutual `ContactGrant`, sets post to `HIRED`, and auto-rejects other pending applicants.
- [x] **Admin Command Center (`/api/v1/admin` & `/admin`):**
  - `GET /admin/stats`: Real-time KPI counters (total users, teachers, verified ratio, tuitions, sessions, marketplace posts).
  - `GET /admin/verifications`: Teacher credential inspection queue with uploaded NID/student ID documents.
  - `POST /admin/verifications/:teacherId/review`: One-click Approve or Reject (with feedback note) with immutable audit log recording.
  - `GET /admin/tuitions`: Full tuition audit log with cycle progress, fee, and payment status.
  - `GET /admin/config` & `PATCH /admin/config`: System maintenance mode toggle and guardian daily contact rate limits.
  - `GET /admin/audit-logs`: Comprehensive system activity viewer.
- [x] **GDPR Compliance & Account Lifecycle:**
  - `GET /api/v1/auth/export-data`: Complete JSON data export of user profile, tuitions, sessions, and marketplace activity.
  - `POST /api/v1/auth/delete-account`: Irreversible profile anonymization, active token revocation, and tuition archival.
- [x] **Frontend Marketplace & Admin UI:**
  - `/marketplace`: Public responsive tuition feed with area filters, search, and apply modal.
  - `/marketplace/create`: Intuitive guardian requirement creation form.
  - `/guardian`: Added "My Tuition Board Postings" section with applicant review drawer.
  - `/admin`: Full administrator cockpit with metrics, verification approvals, tuition audits, and config.
  - Navbar updated with "Tuition Board" link and dynamic Admin Hub badge.
- [x] **Test & Build Status:**
  - 59/59 passing unit and integration tests across 7 test files in `backend/` (`phase4.test.ts` added with 14 passing tests).
  - Clean Next.js 16 production build (`npm run build`) with 16 static and dynamic routes.


