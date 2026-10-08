# EdutradeFX Responsive Baseline Audit (Batch 0)

Audit Date: 2026-10-08T11:01:10.000Z
Total Routes Analyzed: 19
Total Viewports Evaluated: 14 (from 320x568 to 2560x1440)

## 1. Route x Viewport Matrix (Pass / Fail / Overflow px)

| Route | Group | 320x568 | 360x800 | 375x667 | 390x844 | 412x915 | 430x932 | 844x390 | 768x1024 | 820x1180 | 1024x768 | 1280x800 | 1440x900 | 1920x1080 | 2560x1440 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Home | Public | ❌ (248px) | ❌ (208px) | ❌ (193px) | ❌ (178px) | ❌ (156px) | ❌ (138px) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| About | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Brokers Directory | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Compare Engine | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Courses Academy | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Complaint Box | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login | Auth | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register | Auth | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Forgot Password | Auth | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Student Dashboard | Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enrollments | Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Broker Overview | Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Broker Onboarding v2 | Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tutor Overview | Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Signal Provider Overview | Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin Dashboard | Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin Brokers List | Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lesson Classroom | Learn | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 2. Top Offenders & Root Causes Identified

1. **Double Sidebars on Dashboard Sub-routes** (`/dashboard/broker`, `/dashboard/tutor`, `/dashboard/signal-provider`):
   - Inner `aside.w-64` inside `<main>` causes massive horizontal overflow on mobile viewports (< 768px).

2. **Admin Portal Lack of Mobile Drawer** (`/admin/*`):
   - `AdminSidebar` is statically fixed at `w-64` on every viewport without a responsive mobile drawer.

3. **Classroom Player Dual-Column Trap** (`/learn/*`):
   - `aside.w-80` rendered horizontally alongside video crushes player area on screens < 1024px.

4. **AI Assistant Panel Dimension Overflow** (`AIAssistant`):
   - Hardcoded `w-[360px]` overflows 320px screens by 40px.

5. **Tables Without Card Layout Fallback** (18 table files across Admin & Dashboard):
   - Squeeze table columns and cause horizontal clipping without responsive stacking.

6. **Tall Stepper on Mobile Broker Onboarding** (`/dashboard/broker/onboarding`):
   - 19-step vertical stepper consumes entire viewport height on mobile before form fields are reached.
