# EdutradeFX — Enterprise Forex Marketplace, Education & Trading Ecosystem

A production-ready full-stack Forex ecosystem built with **Next.js 14 App Router**, **Node.js/Express TypeScript backend**, **PostgreSQL**, **Prisma ORM**, and **Tailwind CSS**.

---

## Architecture Overview

```
EdutradeFX/
├── backend/                  # RESTful API Service (Express + TypeScript + Prisma)
│   ├── prisma/               # 24 Models, 12 Enums, and Seed scripts
│   ├── src/
│   │   ├── config/           # Database, Cloudinary, Razorpay, Winston Logger
│   │   ├── middleware/       # JWT Auth, Role Guard, Rate Limiting, File Uploads, Sanitize
│   │   ├── modules/          # Auth, Brokers, LMS, AMs, SPs, AI Assistant, Complaints, Admin
│   │   ├── utils/            # Bcrypt, JWT, Slugs, Email, Pagination
│   │   ├── app.ts            # Express App configuration
│   │   └── server.ts         # Cluster HTTP entry point
├── frontend/                 # Next.js 14 Web Application (App Router, Tailwind)
│   ├── public/               # Static assets & robots.txt
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/     # Homepage, Brokers Directory & Compare, Courses, AMs, SPs, Blog
│   │   │   ├── (auth)/       # Multi-role Register, Login, Forgot & Reset Password, Email Verify
│   │   │   ├── dashboard/    # Role-adaptive dashboards (Student, Broker, AM, SP, Tutor)
│   │   │   ├── learn/        # Distraction-free Video Learning Room & Progress
│   │   │   └── admin/        # Platform Governance Portal & Regulatory Audits
│   │   ├── components/       # Reusable UI cards, filters, star ratings, AIAssistant
│   │   ├── lib/              # Axios with silent token refresh, constants, query client
│   │   └── store/            # Zustand persistent stores (Auth, Compare)
├── docker-compose.yml        # Multi-container orchestration (Postgres + Backend + Frontend)
└── package.json              # Monorepo scripts
```

---

## Core Features & Modules

1. **Broker Marketplace**:
   - Regulatory license verification (FCA, CySEC, ASIC, FSCA).
   - Side-by-side comparison matrix (Spreads, Commissions, Leverage, Platforms).
   - High-intent VIP lead capture and verified reviews system.

2. **Forex Academy (LMS)**:
   - Institutional masterclasses (Price Action, Smart Money Concepts, Risk).
   - Video lectures, curriculum accordions, and downloadable resources.
   - Distraction-free video classroom with automated progress tracking and certificates.
   - Razorpay payment order and webhook signature verification.

3. **Account Managers & Signal Providers**:
   - PAMM / MAM portfolio manager directory with investment budget enquiries.
   - Real-time trading signal terminal (BUY/SELL, Entry, SL, TP, Pips gained).
   - Win-rate auditing and VIP channel subscriptions.

4. **AI Forex Mentor**:
   - 24/7 financial assistant explaining margin, leverage, technical indicators, and lot sizing.
   - Fallback educational intelligence if Anthropic API key is not configured.

5. **Trader Complaints & Dispute Mediation**:
   - Formal dispute resolution board for broker slippage and withdrawal inquiries.

6. **Admin Command Center**:
   - Regulatory broker approvals and license checks.
   - Course quality inspection and 1-click publishing.
   - User directory and role governance.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 20.x
- PostgreSQL instance running locally or via Docker
- npm >= 10.x

### 2. Environment Configuration

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/edutradefx_db?schema=public"
JWT_ACCESS_SECRET="your_jwt_access_secret_min_32_chars"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_min_32_chars"
CORS_ORIGIN="http://localhost:3000"
ANTHROPIC_API_KEY=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

#### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup & Seeding
```bash
# In backend/
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Running the Monorepo
From root:
```bash
# Run both Backend and Frontend concurrently
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- API Health: `http://localhost:5000/health`

---

## Default Seed Credentials

After running `npx prisma db seed`:
- **Admin**: `admin@edutradefx.com` / `Password123!`
- **Demo Broker**: `broker@exness-demo.com` / `Password123!`
- **Demo Tutor**: `tutor@academy.com` / `Password123!`
- **Demo Signal Provider**: `signals@elitepips.com` / `Password123!`

---

## Docker Production Deployment

To launch the full ecosystem with PostgreSQL, Backend, and Frontend:
```bash
docker-compose up --build -d
```
All containers will start with healthchecks and automatic restarts.
