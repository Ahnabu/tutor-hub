# Architecture & System Topology

## 1. System Overview

TutorHub operates as two independent systems communicating over a REST API with strict security controls:

```
[ Next.js Frontend (Vercel) ]
        |
        |  HTTPS / JSON / HttpOnly Cookies
        v
[ Express 5 Backend (Render / Railway / VPS) ]
        |
   +----+--------------------------+
   |                               |
   v                               v
[ MongoDB Atlas (Replica Set) ]   [ Mailpit / SMTP ]
```

## 2. Decoupled Service Layout

### Backend (`/backend`)
- **Runtime:** Node.js 20+ with TypeScript.
- **Framework:** Express 5.
- **Data Layer:** Mongoose 8 connecting to MongoDB Replica Set (enabling multi-document ACID transactions for session count increments and cycle rollover).
- **Security:** Helmet, CORS with strict origin validation and credentials, custom recursive NoSQL injection sanitizer, rate limiters per route category, CSRF validation via custom `X-Requested-With: tutorhub` header.
- **Authentication:** Dual-token strategy with short-lived access tokens (15m) and rotating refresh tokens (7d) stored in `HttpOnly; Secure; SameSite=Lax` cookies with family reuse detection.

### Frontend (`/frontend`)
- **Framework:** Next.js (App Router, React 19).
- **Styling:** Tailwind CSS with custom glassmorphism design tokens, CSS variables, and light/dark theme switching.
- **State & Data Fetching:** TanStack React Query v5 with optimistic mutations for zero-latency mobile interactions.
- **HTTP Client:** Custom Axios client with a single-flight mutex refresh interceptor preventing token race conditions.
- **Responsive Layout:** Mobile-first architecture with sticky header, bottom navigation bar on mobile viewports, and adaptive sidebars on desktop.

## 3. Communication Contract
- Base API URL: `/api/v1`
- Standard Response Envelope for Success: `{ data: T }`
- Standard Response Envelope for Errors: `{ error: { code: string, message: string, details?: unknown } }`
- Timestamp representations: UTC ISO-8601 strings, alongside explicit `YYYY-MM-DD` strings for local Bangladesh calendar dates to prevent timezone drift.
