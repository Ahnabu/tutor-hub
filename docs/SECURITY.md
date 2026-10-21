# Security & Privacy Protocol

## 1. Zero-Trust Guardian Privacy
- Guardian phone, email, and exact physical address are never exposed in any public marketplace endpoint or teacher directory.
- Public posts show only: `"Verified Guardian • [Area], [City]"`.
- Real contact details are accessible exclusively upon an explicit `ContactGrant` created when an application is accepted or an invitation is sent.

## 2. Authentication & Session Security
- **Access Tokens:** Signed with JWT (`HS256`), 15-minute lifetime, stored in `HttpOnly; Secure; SameSite=Lax` cookie. Contains `sub`, `roles`, and `tokenVersion`.
- **Token Version Invalidation:** User suspension, password change, or role revocation immediately increments `tokenVersion`, rejecting stale tokens on the next request.
- **Refresh Tokens:** Hashed via SHA-256 before storage in `RefreshSession`. Rotated on every use. Re-use triggers automatic cascade revocation of all tokens in that `familyId`.
- **CSRF Protection:** Origin allow-list validation and mandatory custom header `X-Requested-With: tutorhub` on state-changing requests.

## 3. Media & Document Isolation (Cloudinary)
- Direct client uploads without backend credentials.
- Backend signs one-time upload params specifying strict target folders (`tutorhub/{purpose}/{userId}`) with 60-second expiration.
- Verification documents (IDs) are marked as `authenticated` assets on Cloudinary, only accessible via temporary signed URLs issued to the document owner and authorized Admins.

## 4. Input Sanitization & Rate Limiting
- Zod schemas enforced with `.strict()` on all request payloads.
- Custom recursive key stripper preventing MongoDB operator injection (`$`, `.`).
- Tiered rate limits:
  - Auth/Login/OTP: 5 requests per 15 minutes per IP.
  - Guardian PIN verification: 5 failed attempts locks token + IP for 15 minutes.
  - Global API: 100 requests per 15 minutes per IP.
