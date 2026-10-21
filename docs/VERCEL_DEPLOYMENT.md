# Vercel Deployment Guide for TutorHub Frontend

This guide covers deploying the **TutorHub Frontend** to Vercel with zero friction, complete environment variable configuration, custom domain setup, and production backend connectivity.

---

## 1. Quick Deploy Steps (Vercel Dashboard)

1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Select your Git provider (GitHub) and import `Ahnabu/tutor-hub`.
3. In the **"Configure Project"** screen:
   - **Project Name:** `tutor-hub` (or your choice)
   - **Framework Preset:** `Next.js` (Automatically detected)
   - **Root Directory:** Click **"Edit"** and select **`frontend`** *(Critical!)*
   - **Build Command:** `next build` (Default)
   - **Output Directory:** `.next` (Default)
   - **Install Command:** `npm install` (Default)

---

## 2. Environment Variables Configuration

In the Vercel Project Settings under **Environment Variables**, add the following:

| Variable Name | Required | Example Production Value | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://api.yourdomain.com/api/v1` or `https://tutorhub-api.onrender.com/api/v1` | Public API endpoint for browser-side Axios calls |
| `BACKEND_INTERNAL_URL` | **Yes** | `https://api.yourdomain.com` or `https://tutorhub-api.onrender.com` | Used by Next.js server rewrites (`/api/*` reverse proxy) |

> [!NOTE]
> Ensure there is **NO trailing slash** at the end of the URLs.

---

## 3. Backend CORS & Cookie Configuration for Vercel

When your frontend is hosted on Vercel (e.g. `https://tutorhub.vercel.app` or `https://yourdomain.com`):

1. **Update Backend `.env` on Render/Railway:**
   ```env
   CORS_ORIGIN="https://tutorhub.vercel.app,https://yourdomain.com"
   COOKIE_DOMAIN="" # Leave empty for cross-domain HTTPS or set to ".yourdomain.com" if using subdomains
   COOKIE_SECURE="true" # Always true in production HTTPS
   COOKIE_SAME_SITE="none" # Required if frontend and backend are on different domains
   ```
2. **CSRF Protection:**
   The frontend Axios client automatically sends `X-Requested-With: tutorhub` on all state-changing requests (POST, PUT, DELETE, PATCH).

---

## 4. Built-in Security Features on Vercel

The included [frontend/vercel.json](file:///d:/Antigravity_Work/TutorHub/frontend/vercel.json) automatically applies production HTTP security headers:
- `X-Content-Type-Options: nosniff` (Prevents MIME sniffing)
- `X-Frame-Options: DENY` (Clickjacking defense)
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 5. Local Vercel Preview (Optional)

To test the Vercel build locally using Vercel CLI:
```bash
npm install -g vercel
cd frontend
vercel dev
```
