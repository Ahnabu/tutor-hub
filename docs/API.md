# API Specification & Route Registry

All endpoints are prefixed with `/api/v1`.

### 1. Authentication (`/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user (Teacher or Guardian) and send email OTP |
| POST | `/auth/verify-email` | Public | Verify email OTP and activate account |
| POST | `/auth/resend-otp` | Public | Resend email verification OTP (rate limited) |
| POST | `/auth/login` | Public | Login with email/phone & password, issue cookies |
| POST | `/auth/refresh` | Public | Rotate refresh token, issue new access & refresh tokens |
| POST | `/auth/logout` | Authenticated | Revoke current refresh token session and clear cookies |
| POST | `/auth/logout-all` | Authenticated | Revoke all active sessions for current user |
| POST | `/auth/forgot-password` | Public | Request password reset token via email |
| POST | `/auth/reset-password` | Public | Reset password with token |
| POST | `/auth/change-password` | Authenticated | Change password for logged in user |
| GET | `/auth/me` | Authenticated | Get current authenticated user profile DTO |
| POST | `/auth/claim-guardian/start` | Public | Initiate guardian shadow claim via token |
| POST | `/auth/claim-guardian/verify` | Public | Verify OTP and set password to activate guardian account |

### 2. Media Uploads (`/uploads`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/uploads/signature` | Authenticated | Generate strict one-time Cloudinary upload signature |

### 3. System & Diagnostics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/healthz` | Public | Liveness probe |
| GET | `/readyz` | Public | Readiness probe (MongoDB connection check) |
