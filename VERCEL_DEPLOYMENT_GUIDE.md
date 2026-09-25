x# EdutradeFX - Vercel Deployment & Environment Configuration Guide

This guide explains how to properly deploy and configure the **EdutradeFX Frontend on Vercel** and eliminate "Network Error" issues.

---

## 1. Why Did "Network Error" Happen on Vercel?

When the frontend was deployed to Vercel without environment variables:
1. In `constants.ts`, the API URL defaulted to `http://localhost:5000/api`.
2. When users visited `https://your-app.vercel.app/register`, their browser tried to make a request to `http://localhost:5000/api/auth/register`.
3. Browsers block requests from `https://` to `http://` as **Mixed Content**, or cannot connect to `localhost:5000` on the visitor's device.
4. Axios then reported a generic **`Network Error`**.

---

## 2. The Solution Implemented

1. **Automatic Remote Detection & Same-Origin `/api` Proxying**:
   - `frontend/src/lib/constants.ts` automatically detects if the app is running on a non-localhost domain (like Vercel).
   - If `NEXT_PUBLIC_API_URL` is not provided, it falls back to relative `/api`.
   - `frontend/next.config.mjs` proxies `/api/:path*` requests server-to-server to your deployed backend, avoiding browser Mixed Content blocks and CORS issues.

2. **Actionable Error Messages**:
   - If the backend is unreachable or unconfigured, the app now shows a clear, informative message rather than a blank "Network Error".

---

## 3. Configuring Environment Variables in Vercel

To connect your Vercel frontend to your live backend:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your **EdutradeFX Frontend** project.
3. Navigate to **Settings** > **Environment Variables**.
4. Add the following environment variable:

| Variable Name | Value Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.onrender.com/api` (or railway/fly.io) | Direct API URL used by the browser |
| `BACKEND_URL` | `https://your-backend-api.onrender.com` | Used by Next.js server-side rewrites |
| `NEXT_PUBLIC_SITE_NAME` | `EdutradeFX` | Site brand name |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` | Razorpay Key ID for course payments |

5. After saving the variables, trigger a **Redeploy** (Deployments > click `...` on latest deployment > Redeploy) so Next.js embeds the updated configuration.

---

## 4. Deploying the Backend API

Your backend can be hosted on any cloud provider that supports Node.js (e.g., Render, Railway, Fly.io, DigitalOcean, or AWS EC2).

Make sure the backend environment has:
- `DATABASE_URL`: `postgresql://neondb_owner:npg_bznjGvary8A7@ep-round-water-b4clbg9k.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`
- `FRONTEND_URL`: `https://your-edutrade-frontend.vercel.app` (for CORS allowlist)
- `PORT`: `5000` (or assigned by host)
- `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`
