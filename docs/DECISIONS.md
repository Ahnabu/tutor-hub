# Architecture Decision Records (ADR)

## ADR-001: Independent Standalone Repositories / Folders
- **Status:** Accepted
- **Context:** User requested that frontend and backend must be completely separated without a shared monorepo package so they can be hosted and deployed independently (e.g. Frontend on Vercel, Backend on Render/Railway).
- **Decision:** Remove `shared/` workspace and npm workspaces configuration. `backend/` and `frontend/` each contain their own `package.json`, dependencies, build processes, and TypeScript configurations. Types and validation schemas are maintained cleanly within each project.

## ADR-002: Separated MongoDB Collections for Sensitive Data
- **Status:** Accepted
- **Context:** Teacher private contact info and identity verification documents must never be leaked through inadvertent `.lean()` or `.populate()` queries on User.
- **Decision:** Dedicated `TeacherPrivateProfile` collection (1:1 with User) accessed solely by contact and admin verification services.

## ADR-003: Refresh Token Rotation with Family Invalidation
- **Status:** Accepted
- **Context:** Stolen refresh tokens can be used maliciously if not actively rotated and monitored.
- **Decision:** Store hashed refresh tokens in `RefreshSession` with `familyId`. When a previously revoked refresh token is presented, the entire family is immediately invalidated, terminating all active sessions for that login lineage.

## ADR-004: In-Process Asynchronous Email Outbox
- **Status:** Accepted
- **Context:** Inline SMTP during HTTP requests increases latency and fails without recovery if the mail server is unreachable. BullMQ + Redis introduces unnecessary infrastructure costs.
- **Decision:** Implement a MongoDB-backed `EmailOutbox` collection with an in-process worker that polls for pending messages and executes exponential backoff retries.
