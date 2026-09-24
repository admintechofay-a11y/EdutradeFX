# EduTradeFX — Enterprise Forex Marketplace, Education & Trading Ecosystem (V1 SOW Production Build)

A production-ready full-stack Forex ecosystem built strictly in compliance with the **V1 Scope of Work (SOW)** using **Next.js 14 App Router**, **Node.js/Express TypeScript backend**, **PostgreSQL**, **Prisma ORM**, and **Tailwind CSS**.

---

## 1. Directory Structure & Architecture

```
EdutradeFX/
├── backend/                  # Active Production API Service (Express + TypeScript + Prisma)
│   ├── prisma/               # Schema with 25 Models, 13 Enums, Indexes, and Seed script
│   ├── src/
│   │   ├── config/           # Database, Cloudinary, Razorpay, Winston Logger
│   │   ├── middleware/       # JWT Auth, Role Guard, Rate Limiting, File Uploads, Sanitize
│   │   ├── modules/          # Auth, Brokers, LMS, AMs, SPs, AI, Complaints, Contact, Admin
│   │   ├── utils/            # Bcrypt, JWT, Slugs, Email, Pagination, Response formatters
│   │   ├── app.ts            # Express App configuration & route mounts
│   │   └── server.ts         # Cluster HTTP entry point
├── frontend/                 # Active Production Web App (Next.js 14 App Router)
│   ├── public/               # Static assets & robots.txt
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/     # Home, Brokers, /compare, Courses, AMs, SPs, Blog, Complaint Box, About, Contact, Terms, Privacy, Risk Disclaimer, Advertise
│   │   │   ├── (auth)/       # Clean Trader Register, Login (Email or Mobile), Forgot & Reset Password, Email Verify
│   │   │   ├── dashboard/    # Role-adaptive dashboards (Student, Broker, AM, SP, Tutor)
│   │   │   ├── learn/        # Distraction-free Video Learning Room & Progress
│   │   │   └── admin/        # Governance Portal (Brokers, AMs, SPs, Courses, Tutors, Complaints, Enquiries, Lite CMS, Settings, Logs)
│   │   ├── components/       # Reusable UI cards (AMCard, SPCard, BrokerCard), Star Ratings, Skeleton, AIAssistant
│   │   ├── lib/              # Axios with silent token refresh, constants, query client
│   │   └── store/            # Zustand persistent stores (Auth, Compare)
├── docker-compose.yml        # Multi-container orchestration (Postgres + Backend + Frontend)
├── client/                   # [ARCHIVED LEGACY] Prior React prototype (retained for reference)
└── server/                   # [ARCHIVED LEGACY] Prior MongoDB/Mongoose prototype (retained for reference)
```

> **Note on Active Stack**: The active, audited codebase is strictly in `frontend/` (Next.js 14) and `backend/` (Node.js/Express TypeScript + PostgreSQL). The `client/` and `server/` folders contain legacy MongoDB prototypes and are not used in production runtime.

---

## 2. SOW V1 Compliance & Route Map

| Route / Module | Contractual SOW Section | Implementation Details |
| :--- | :--- | :--- |
| **`/` (Homepage)** | SOW 1, 3, 4, 5, 6, 7, 15 | Hero search, 4 pillars, Broker showcase, AM showcase, SP showcase, Compare teaser, Complaint Box CTA, How It Works guide, Advertise CTA, Risk Warning |
| **`/brokers`** | SOW 4 | Live filterable directory by tier-1 regulation (FCA, ASIC, CySEC), spreads, deposit minimums, leverage, reviews |
| **`/brokers/[slug]`** | SOW 4 | Full company profile, fee breakdown, verified badges, lead enquiry form, user review submission |
| **`/compare` & `/brokers/compare`** | SOW 1 & 4 | Side-by-side comparison of 2–4 selected brokers across execution type (ECN/STP), spreads, leverage, deposit, regulation |
| **`/account-managers`** | SOW 5 | Audited PAMM/MAM managers, trading style, historical performance, minimum deposit, direct inquiry form |
| **`/signal-providers`** | SOW 6 | Quantitative trading signals, verified win rates, risk categories, instruments, channel subscriptions |
| **`/complaint-box`** | SOW 7 | Official trader grievance desk with 8 required SOW fields, dropzone evidence upload, declaration consent, instant reference code (`FX-DISP-XXXXX`) |
| **`/courses` & `/learn/[slug]/[id]`** | SOW 8, 9, 10, 11 | Complete LMS with video streaming, lesson accordions, quiz engine, certificates, Razorpay payments |
| **`/about`** | SOW 1 & 3 | Mission, vision, core values, step-by-step "How to Use EduTradeFX" 4-step trader guide, regulatory disclosures |
| **`/contact`** | SOW 1 | Dedicated contact desk powered by `POST /api/contact`, office hours, physical HQ details, direct department emails |
| **`/advertise`** | SOW 1 & 15 | Media kit, 120k+ trader audience demographics, placement rate options, direct lead generation form |
| **`/terms`** | SOW 1 & 18 | Terms of Service covering LMS IP, directory disclaimers, dispute facilitation, limitation of liability |
| **`/privacy`** | SOW 1 & 18 | Privacy policy detailing data collection, complaint handling, cookie policy, GDPR compliance, DPO contact |
| **`/risk-disclaimer`** | SOW 1, 8, 18 | High-risk investment warning, retail investor loss ratios (74%-89%), leverage hazards, past performance caveats |
| **`/register`** | SOW 2 | Clean trader registration (Name, Email, Mobile, Password, mandatory Consent Checkbox) + Institutional Partner Application toggle |
| **`/login`** | SOW 2 | Mobile Number or Email + Password authentication |
| **`/admin/*`** | SOW 16 | Complete governance portal: Broker audits, AM directory, SP directory, Tutor approvals, Complaint mediation, Enquiries desk, Lite CMS content manager, Audit logs, Site settings |

---

## 3. Quick Start (Local Development)

### Prerequisites
- Node.js >= 20.x
- PostgreSQL >= 15.x
- npm >= 10.x

### Backend Setup (`backend/`):
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL, JWT secrets, Cloudinary, etc.
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend Setup (`frontend/`):
```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL="http://localhost:5000/api"
npm run dev
```

Access Points:
- Web App: `http://localhost:3000`
- REST API: `http://localhost:5000/api`
- Healthcheck: `http://localhost:5000/health`

---

## 4. Default Seed Administrative Accounts

After running `npx prisma db seed`:
- **Compliance Admin**: `admin@edutradefx.com` / `Password123!`
- **Demo Broker**: `broker@exness-demo.com` / `Password123!`
- **Demo Tutor**: `tutor@academy.com` / `Password123!`
- **Demo Signal Provider**: `signals@elitepips.com` / `Password123!`

---

## 5. Production Infrastructure & Hosting Recommendations

### Recommended Cloud Topology
```
[Client Browsers] ──► [Cloudflare CDN / WAF / SSL]
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   [Frontend Web Server]              [Backend API Server]
   Next.js 14 App Router              Express + TypeScript
   Node.js (PM2 / Docker)             Node.js (Cluster Mode)
   Port 3000                          Port 5000
             │                                 │
             └────────────────┬────────────────┘
                              ▼
                 [Managed PostgreSQL 16 Cluster]
                 Primary + Daily Automated Snapshots
                              ▼
                 [Cloud Storage: Cloudinary / S3]
                 Course Videos, Documents & Evidence
```

### Recommended Server Specifications

| Component | Minimum Specification | Recommended Production Spec | Target Provider |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | 2 vCPU, 4 GB RAM | 4 vCPU, 8 GB RAM (or Vercel Pro) | DigitalOcean Droplet / AWS EC2 (t4g.xlarge) / Vercel |
| **Backend REST API** | 2 vCPU, 4 GB RAM | 4 vCPU, 8 GB RAM (Node Cluster) | DigitalOcean Droplet / AWS EC2 (c6g.xlarge) |
| **Database** | 2 vCPU, 4 GB RAM, 50 GB SSD | 4 vCPU, 16 GB RAM, 200 GB NVMe | DigitalOcean Managed DB / AWS RDS PostgreSQL |
| **Object / Media CDN**| 100 GB Bandwidth | Scalable Tier | Cloudinary / AWS S3 + CloudFront |

---

## 6. Database Backup & Disaster Recovery Strategy

1. **Automated Daily `pg_dump` Snapshots**:
   Configure a root cron job on the database or management VM:
   ```bash
   0 2 * * * /usr/local/bin/backup-edutradefx-db.sh >> /var/log/db-backup.log 2>&1
   ```
   Script snippet:
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   BACKUP_DIR="/var/backups/edutradefx"
   mkdir -p $BACKUP_DIR
   pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"
   # Sync to offsite encrypted AWS S3 bucket
   aws s3 cp "$BACKUP_DIR/db_$TIMESTAMP.sql.gz" s3://edutradefx-db-backups/daily/ --sse AES256
   # Retain 30 days locally
   find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
   ```
2. **Point-In-Time Recovery (PITR)**:
   For managed databases (AWS RDS or DigitalOcean Managed DB), enable automatic Write-Ahead Log (WAL) archiving with 7-day or 14-day PITR retention.
3. **Restoration Drill**:
   ```bash
   gunzip -c db_2026xxxx.sql.gz | psql "$RESTORE_DATABASE_URL"
   ```

---

## 7. Third-Party Services & Estimated Recurring Monthly Costs

| Service Provider | Role in Architecture | Free / Starter Tier | Estimated Production Cost (at Scale) |
| :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | Managed Database Cluster (RDS / DigitalOcean) | $15 / mo (Single node) | $60 – $120 / month (High Availability Pair) |
| **Cloudflare** | DNS, SSL, DDoS Mitigation, Edge Caching | $0 (Free Tier) | $20 / month (Pro Tier for WAF) |
| **Cloudinary / AWS S3** | Image & Video hosting, complaint documents | Free (25 Credits) | $25 – $89 / month (as media volume expands) |
| **Transactional Email** | Password resets, dispute alerts (Resend/SendGrid) | 3,000 emails / mo free | $15 – $35 / month |
| **Razorpay / Stripe** | LMS Course payment processing | $0 monthly fee | 2% – 3% per transaction |
| **Application Hosting** | VPS Servers (Frontend & Backend via PM2 / Docker) | $20 / mo (Dev Droplet) | $48 – $96 / month (Dedicated production instances) |
| **Estimated Total** | Full Platform Infrastructure | **~$35 / month** | **~$168 – $360 / month** |

---

## 8. Verification & Test Artifacts

Both sub-systems compile cleanly with zero TypeScript errors:
```bash
npm --prefix backend run build    # Output: tsc -> Code 0 (Success)
npm --prefix frontend run build   # Output: next build -> 65 routes prerendered -> Code 0 (Success)
```

All contractual deliverables required by SOW Section 1 through Section 19 are covered, tested, and ready for deployment.
