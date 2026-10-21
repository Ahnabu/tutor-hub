# 🎓 TutorHub — Operations & Memory Platform for Private Tutors

> **High-Performance Operations & Transparency SaaS for Private Tutors and Guardians in Bangladesh.**  
> Built with Next.js 16 App Router, Express 5, TypeScript, MongoDB Replica Sets, and Tailwind CSS.

[![CI Tests](https://img.shields.io/badge/Vitest%20Tests-59%2F59%20Passing-emerald?style=flat-square)](file:///d:/Antigravity_Work/TutorHub/backend)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=flat-square&logo=next.js)](file:///d:/Antigravity_Work/TutorHub/frontend)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](file:///d:/Antigravity_Work/TutorHub)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](file:///d:/Antigravity_Work/TutorHub/frontend)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?style=flat-square&logo=node.js)](file:///d:/Antigravity_Work/TutorHub/backend)

---

## 📌 Phase Roadmap & Implementation Status

| Phase | Description | Status | Test Coverage |
| :--- | :--- | :---: | :---: |
| **Phase 1** | **Foundation & Security Matrix**<br>Argon2id auth, JWT refresh token rotation with reuse revocation, OTP verification, privacy DTOs, CSRF protection, and role guards. | **COMPLETED** ✅ | 25 Tests |
| **Phase 2** | **Tuition Engine & "Next-Day Memory" Logger**<br>Multi-student tuition contracts, transactional cycle counters, automated Next-Day memory prefill, payment ledger, and cycle rollover. | **COMPLETED** ✅ | 34 Tests |
| **Phase 3** | **Guardian Portal & Gated Profiles**<br>PIN-protected `/guardian/view/[token]`, multi-tutor `/guardian` dashboard, SEO `/teachers` directory, and privacy-gated `ContactAccessRequest` workflow. | **COMPLETED** ✅ | 45 Tests |
| **Phase 4** | **Dual-Sided Marketplace & Admin Command Center**<br>Guardian tuition posting, teacher applications, mutual contact grants, admin verification queue, audit viewer, system configuration, and GDPR compliance. | **COMPLETED** ✅ | 59 Tests |

> [!NOTE]
> **Continuous Documentation Protocol**: At the completion of each phase, `README.md`, `PROJECT_CONTEXT.md`, and `docs/DEFERRED.md` are immediately updated and synchronized to reflect newly implemented features, endpoint contracts, test counts, and schema evolutions.



---

## 🚀 Key Features

### 1. "Next-Day Memory" Session Logger
- Eliminates tutor cognitive load by automatically prefilling the last unfinished topics, assigned homework, and upcoming lesson plans for each student batch.
- Idempotent session logging prevents accidental double-counting using client request IDs.
- Automatic cycle day increments (`completedDays`) and completion triggers.

### 2. PIN-Protected Guardian Transparency Viewer (`/guardian/view/[token]`)
- One-click shareable links for parents and guardians with 4-to-6 digit numeric PIN protection.
- Brute-force protection: 15-minute lockout after 5 consecutive failed attempts.
- Real-time sanitized view of student attendance, covered topics, tutor remarks, and payment ledger.
- **Strict Privacy Guarantee:** Private tutor phone, email, and internal teacher notes are never exposed.

### 3. Claimed Guardian Multi-Tutor Dashboard (`/guardian`)
- Centralized portal for guardians to track multiple children and tutors under a single account.
- Integrated **"My Contact Requests"** tracking: reveals verified tutor mobile numbers, WhatsApp links, and direct emails upon approval.

### 4. Public SEO Teacher Directory & Profiles (`/teachers` & `/teachers/[slug]`)
- Search by tutor name, university (DU, BUET, NSU, etc.), or subject.
- Real-time subject and Dhaka area filter pills (Dhanmondi, Mirpur, Gulshan, Uttara, etc.).
- Background verification badges, experience counters, and expected rate ranges.
- **Privacy Gating:** Guardians request direct contact access with a requirement note.

### 5. Robust Security & Authentication
- Argon2id password hashing with brute-force lockout.
- Cryptographically secure JWT refresh token rotation with **family-wide reuse detection & instant revocation**.
- Mandatory Bangladeshi mobile numbers (`017XXXXXXXX`, `+88017XXXXXXXX`).
- Centralized error formatting with actionable, human-meaningful `sonner` dark-theme toast notifications.

### 6. Live Tuition Board & Dual-Sided Marketplace (`/marketplace` & `/marketplace/create`)
- Parents and guardians post verified tuition requirements with student class/grade, subjects, preferred days, area, and monthly budget.
- Verified tutors browse live openings with area and subject filter chips and submit direct pitches.
- Guardians review applicants, inspect university backgrounds, and click **"Accept Tutor"** to automatically generate mutual `ContactGrant`s and unlock direct mobile/WhatsApp communication.

### 7. Interactive Admin Command Center (`/admin`)
- High-level platform KPIs: total teachers, verified ratio, active tuitions, completed sessions, and open marketplace posts.
- **Teacher Verification Queue:** Inspect submitted university credentials, student IDs, and national IDs with one-click **Approve** or **Reject** (with direct tutor feedback).
- **Tuition Audits:** Live inspection of active contracts, cycle progress, and payment status.
- **System Controls:** Real-time platform maintenance mode toggle and guardian daily contact rate-limit configuration.

### 8. GDPR Compliance & Privacy Self-Service
- **Self-Service Data Export (`GET /api/v1/auth/export-data`):** Comprehensive JSON export of all personal profile records, tuitions, session logs, and marketplace activities.
- **Account Self-Deletion (`POST /api/v1/auth/delete-account`):** Irreversible profile anonymization, active token revocation, and tuition archival.

### 9. Modern UX & Form Ergonomics
- **Password Visibility Toggles:** Toggleable Lucide `Eye`/`EyeOff` buttons across all authentication and verification forms (`/login`, `/register`, `/reset-password`, `/claim-guardian`, and `/guardian/view/[token]`).
- **Ergonomic Marketplace Forms:** Free-text location inputs for accurate English addresses, custom SVG select carets, and generous input padding/spacing.

---


## 🏗️ Architecture & Decoupling

TutorHub is architected as two **completely standalone, decoupled repositories**:

```
TutorHub/
├── backend/                      # Standalone Express 5 & Mongoose API
│   ├── src/
│   │   ├── config/               # Environment & database configuration
│   │   ├── controllers/          # Express route controllers
│   │   ├── dtos/                 # Privacy-safe Data Transfer Objects
│   │   ├── enums/                # TypeScript domain enums
│   │   ├── middlewares/          # Auth, CSRF, rate limit, validation
│   │   ├── models/               # Mongoose schemas with strict indexes
│   │   ├── routes/               # Modular API endpoint routers
│   │   ├── schemas/              # Zod validation schemas
│   │   ├── services/             # Core business logic & transactions
│   │   ├── tests/                # Vitest integration & unit test suites
│   │   └── utils/                # Argon2id, JWT, crypto helpers
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Standalone Next.js 16 App Router UI
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages & layouts
│   │   │   ├── admin/            # Admin Command Center
│   │   │   ├── guardian/         # Claimed Guardian Portal & /view/[token]
│   │   │   ├── teacher/          # Teacher Control Plane
│   │   │   ├── teachers/         # Public Directory & /teachers/[slug]
│   │   │   ├── login/            # Role-aware login
│   │   │   ├── register/         # Teacher / Guardian registration
│   │   │   └── verify-email/     # OTP verification
│   │   ├── components/           # Reusable UI components & Navbar
│   │   ├── context/              # Auth & user session state
│   │   └── lib/                  # Axios API client & error handler
│   ├── package.json
│   └── next.config.ts
│
├── docs/                         # Architecture, Security & Decision Records
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── SECURITY.md
│   └── DEFERRED.md
│
├── docker-compose.yml            # Local MongoDB Replica Set + Mailpit
└── README.md
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for MongoDB Replica Set & Mailpit)

### 1. Clone the Repository
```bash
git clone https://github.com/Ahnabu/tutor-hub.git
cd tutor-hub
```

### 2. Start Database & Mailpit Services
```bash
docker compose up -d
```
- MongoDB Replica Set (`rs0`) runs on `mongodb://localhost:27017/tutorhub?replicaSet=rs0`.
- Mailpit Web UI runs on `http://localhost:8025` (SMTP on `1025`).

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env

# Run database admin seeder
npm run seed:admin

# Run test suite
npm test

# Start development server (Port 5000)
npm run dev
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local

# Run production build validation
npm run build

# Start development server (Port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Testing Matrix

Backend tests are powered by **Vitest** with in-memory MongoDB replica sets (`mongodb-memory-server`):

```bash
cd backend
npm test
```

### Verified Test Suites (59/59 Passing):
- **`src/tests/auth.test.ts`**: Happy-path register/login, OTP expiration, refresh rotation, family reuse revocation.
- **`src/tests/tuition.test.ts`**: Tuition creation, schedule subdocs, cycle initialization, session logging with memory prefill, payment ledger, and cycle rollover.
- **`src/tests/phase3.test.ts`**: Public teacher directory, PIN verification, 15-minute lockouts, sanitized guardian portal overview, and `ContactAccessRequest` approval grants.
- **`src/tests/phase4.test.ts`**: Marketplace tuition requirements, tutor applications, mutual contact grants, admin KPI stats, teacher credential verification review, system maintenance configuration, GDPR data export, and account self-deletion.
- **`src/tests/middleware.test.ts`**: Rate limiting, CSRF headers, Argon2id verification, and RBAC authorization matrix.
- **`src/tests/models.test.ts`**: Schema indexes, partial filter uniqueness, and sensitive field exclusion (`select: false`).
- **`src/tests/health.test.ts`**: Diagnostic `/healthz` and `/readyz` probes.


---

## 🌐 Production Deployment

- **Frontend:** Vercel-ready with zero rewrites required (`npm run build` static & dynamic prerendering).
- **Backend:** Node.js standalone service deployable to Render, Railway, Fly.io, or dedicated VPS.
- **Database:** MongoDB Atlas (M0+ with replica set enabled for multi-document ACID transactions).

---

## 📄 License
This project is licensed under the MIT License.
