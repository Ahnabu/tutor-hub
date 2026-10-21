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

### Future Roadmap / V2 Backlog:
- TOTP 2FA for administrative accounts.
- Automated SMS gateway integration (e.g. SSL Wireless / BulkSMS BD).
- PWA offline session queue and background sync.

