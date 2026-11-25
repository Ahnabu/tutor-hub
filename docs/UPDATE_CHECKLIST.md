# TutorHub — Master Update Checklist

Tracked from `TutorHub-Audit-v2.md`. Updated as items are resolved.

---

## 🔴 P0 — Ship Blockers (Immediate)

- [x] **S1**: Restrict `isAllowedOrigin` in `backend/src/config/cors.ts` (remove wildcard `*.vercel.app`), remove `x-bypass-csrf` from `allowedHeaders` in `backend/src/index.ts`, and require `Origin`/`Referer` in `backend/src/middlewares/csrf.ts` for production mutative requests.
- [x] **S2**: Gate plaintext OTP and password-reset URL `console.log`s behind `env.NODE_ENV !== 'production'` in `backend/src/services/email.service.ts`.
- [x] **S4**: Add `otpAttempts >= 5` lockout check in `AuthService.claimGuardianVerify` (`backend/src/services/auth.service.ts`).
- [x] **S5**: Remove unverified `newPassword` overwrite from `verifyEmailSchema` (`backend/src/schemas/auth.schema.ts`), `AuthController.verifyEmail` (`backend/src/controllers/auth.controller.ts`), and `AuthService.verifyEmail` (`backend/src/services/auth.service.ts`).
- [x] **S7**: Add `/teachers` and `/marketplace` (or invert to protected-only routes) in `frontend/src/lib/api.ts` 401 redirect check so public visitors are never kicked to `/login`.
- [x] **B1**: Fix `isDeleted: false` → `deletedAt: { $exists: false }` in `GuardianService.getTuitionByShareToken` (`backend/src/services/guardian.service.ts`).

---

## 🟠 P1 — High Priority

### Security
- [x] **S3**: Escape user input before `new RegExp(...)` in `marketplace.service.ts` and `teacher.service.ts`, and add Zod query validation to `GET /api/v1/teachers`.
- [x] **S6**: Add `frontend/src/proxy.ts` to protect `/teacher`, `/guardian`, `/admin`, `/profile`, `/marketplace/create` at the edge, and fix `admin/page.tsx` loading flash.
- [x] **S8**: Add `type: 'authenticated'`, MIME allowlist, and production mock-URL guard to `UploadController.uploadDocument` (`backend/src/controllers/upload.controller.ts`).
- [x] **S9**: Add `authorizeRoles(UserRole.GUARDIAN)` to guardian marketplace routes (`backend/src/routes/marketplace.routes.ts`) and respect `SystemConfig.requireAdminApprovalForPosts`.
- [x] **S10**: Add `authLimiter` to `POST /guardian/view/:token/verify-pin` *(remaining: distributed rate-limit store for serverless)*.
- [x] **S11**: Handle Mongoose `CastError` in `errorHandler.ts` *(remaining: explicit `validateRequest({ params })` ObjectId schemas)*.
- [x] **S12**: Unify `Referrer-Policy` (`strict-origin-when-cross-origin`) and add `Content-Security-Policy` in `frontend/next.config.ts`.

### Data Integrity & Reliability
- [x] **B2**: Added `withOptionalTransaction` (`backend/src/utils/transaction.ts`) and wrapped `SessionService.logSession`, `TuitionService.recordPayment`, and `MarketplaceService.respondToApplication('ACCEPT')` in MongoDB transactions (with standalone fallback) + atomic `AuthService.refresh`.
- [x] **B3**: Replace `ContactGrant.create` with `ContactGrant.findOneAndUpdate(..., { upsert: true })` in `marketplace.service.ts`.
- [x] **B4**: Fix `AuditLog.details` → `metadata` in `contact.service.ts`, add `data` to `NotificationSchema`, and add `tuitionCode` to `TuitionSchema`.
- [x] **B5**: Add consistent `deletedAt: { $exists: false }` filtering in `tuition.service.ts` and `session.service.ts`.

### Efficiency & UX
- [x] **E1**: Move `EmailWorker.flushPendingOutbox` off per-request middleware in `backend/src/index.ts` to `/api/v1/cron/flush-outbox`.
- [x] **E2**: Add `.limit(100)` bounds to unbounded `.find()` queries in `tuition.service.ts`, `guardian.service.ts`, and `contact.service.ts` *(remaining: full cursor/page pagination)*.
- [x] **E10**: Debounce search inputs in `frontend/src/app/teachers/page.tsx` and `frontend/src/app/marketplace/page.tsx`.
- [x] **UX2**: Create `frontend/src/app/not-found.tsx`, `error.tsx`, and `loading.tsx`.
- [x] **UX3**: Fix misleading error/empty states in `teachers/page.tsx`, `admin/page.tsx`, and `guardian/page.tsx` (replaced silent catches with error toasts).

---

## 🟡 P2 — Cleanup, UI, Animations & Polish

### Security (Low)
- [ ] **S13**: Stop returning `accessToken` in JSON bodies where `httpOnly` cookies are used.
- [x] **S14**: Mask guardian `phone`/`email` in `ContactService.getTeacherIncomingRequests` until `APPROVED`.
- [x] **S15**: Remove hardcoded `ADMIN_PASSWORD` default in `backend/src/config/env.ts` (and require it in `seedAdmin.ts`).
- [x] **S16**: Add special-character rule to `claimVerifySchema.password` in `backend/src/schemas/auth.schema.ts`.
- [x] **B6**: Remove unused `backend/src/middlewares/ownership.ts`.

### UI & Animations
- [x] **U1**: Fixed light-mode white-text contrast on colored buttons, badges, and gradients in `frontend/src/app/globals.css` *(remaining: full migration from `!important` rules to `dark:` variants)*.
- [x] **U2**: Extracted `TeacherProfileModal` from `teacher/page.tsx` into `frontend/src/app/teacher/components/TeacherProfileModal.tsx` (~700 lines removed) *(remaining: extract remaining 5 modals)*.
- [x] **U3**: Extract shared `<ChangePasswordForm />` component (`frontend/src/components/ChangePasswordForm.tsx`).
- [x] **U4**: Define `.scrollbar-none` in `frontend/src/app/globals.css`.
- [x] **U5**: Replace hardcoded fake defaults in `TeacherProfileModal` with empty strings.
- [x] **U6**: Add `<BottomNav />` to `frontend/src/app/admin/page.tsx`.
- [x] **U7**: Change `h-screen max-h-screen overflow-hidden` to `min-h-screen` in `verify-email/page.tsx`.
- [ ] **A1**: Wire up `framer-motion` (`AnimatePresence`) for modals/tabs or remove unused dependency.
- [x] **A2**: Define `animate-fadeIn` in `frontend/src/app/globals.css` *(remaining: `tailwindcss-animate` for `animate-in` / `zoom-in-95`)*.
- [x] **A3**: Add `@media (prefers-reduced-motion: reduce)` to `frontend/src/app/globals.css`.
- [x] **A4**: Replaced `width` transitions on progress bars with GPU-composited `transform: scaleX(...)` in `guardian/page.tsx`, `guardian/view/[token]/page.tsx`, and `teacher/page.tsx`.

### Efficiency & UX (Remaining)
- [x] **E3–E7**: `.lean()` on `auth.ts`, `.select()` projections on `contact.service.ts` / `guardian.service.ts`, removed redundant `User.findById` in `marketplace.service.ts`, `$facet` in `getPlatformStats`, `SessionLog` `sessionDate` index + `User`/`Tuition` compound indexes, DB check in `/readyz`.
- [x] **E8–E9, E11–E12**: Revoke `URL.createObjectURL` previews in `teacher/page.tsx` *(remaining: convert `page.tsx` to Server Component + client islands, remove unused deps from `package.json`, migrate `useEffect` fetches to `useQuery`)*.
- [x] **UX1, UX5, UX6, UX7, UX8, UX9, UX10, UX11**: Delayed & accessible Tour Modal, early auth prompt in `marketplace/create`, removed all `tabIndex={-1}` on password toggles, created accessible `<Modal />` and wired into `marketplace`, `teachers/[slug]`, `admin`, keyboard-accessible dropzones in `teacher/page.tsx`, skeleton loaders in `teachers/page.tsx`, fixed logout redirect race, removed `autoComplete="off"` on `<form>` *(remaining: UX4 form-level react-hook-form)*.
