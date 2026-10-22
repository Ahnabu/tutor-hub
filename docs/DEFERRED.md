# Deferred Features & Backlog

The following features are purposefully deferred to future phases per the project plan:

### Phase 1 — COMPLETED:
- Argon2id password hashing & JWT refresh token rotation with family reuse revocation.
- OTP verification with email dispatch via Mailpit.
- Role-based authorization matrix (TEACHER, GUARDIAN, ADMIN).
- Centralized error handling & rate limiting.

### Phase 2 — COMPLETED:
- Tuition CRUD, multi-student management, and share link generation.
- Daily session logging with "Next-Day Memory" prefill.
- Transactional cycle counters, extra/makeup logic, and rollover to `CycleHistory`.
- Manual payment ledger.

### Phase 3 — COMPLETED:
- Guardian PIN-protected read-only viewer (`/guardian/view/[token]`).
- Claimed guardian multi-tutor portal (`/guardian`).
- Public SEO-optimized teacher directory (`/teachers`).
- Public gated teacher profile page (`/teachers/[slug]`).
- Teacher verification document submission interface.
- ContactAccessRequest workflow and audit entries.

### Phase 4 — COMPLETED:
- Anonymized marketplace feed & application shortlisting (`/marketplace`).
- Guardian requirement posting (`/marketplace/create`) & application acceptance workflow.
- Admin verification queue and tuition inspection viewer (`/admin`).
- Global system configuration and maintenance mode toggles.
- Account self-deletion & data export (GDPR-style compliance).

### Phase 5 — COMPLETED:
- **Unified Profile Section for Everyone (`/profile`):**
  - Dedicated `/profile` route supporting all user roles (Teacher, Guardian, Admin) and guests.
  - Profile information, role badges, bio, and credentials overview.
  - Security, password change, remote session management, and GDPR self-service.
  - Prominent in-profile Logout button with confirmation safeguard.
- **Mobile UI Navigation Refinement & Dynamic Breadcrumbs:**
  - Moved logout, login, and register buttons from top mobile navbar (`sm:hidden`) into `/profile`.
  - Added dynamic hierarchical breadcrumbs navigation to `Navbar.tsx`.
  - Connected mobile `BottomNav.tsx` directly to `/profile`.
- **Guided Learning & Explanatory Home Page (`/`):**
  - Interactive onboarding tour modal (first-visit trigger + manual replay).
  - Problem vs. Solution matrix for Bangladeshi tuition pain points.
  - 4-step tabbed interactive workflow for Tutors and Guardians.
  - Comprehensive feature showcase grid and 6-item FAQ accordion.

### Future Roadmap / V2 Backlog:
- TOTP 2FA for administrative accounts.
- Automated SMS gateway integration (e.g. SSL Wireless / BulkSMS BD).
- PWA offline session queue and background sync.

