# EdutradeFX — Change Map & Reconnaissance

## 1. Overview & Touchpoints

### Auth Flow (Register, Login, Forgot, Reset, Verify)
- `backend/src/modules/auth/auth.routes.ts`: Auth endpoints (`/register`, `/register-partner`, `/login`, `/refresh-token`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email/:token`, `/check-email`, `/resend-verification`).
- `backend/src/modules/auth/auth.controller.ts`: Controllers orchestrating pending registration, email dispatch, verification token confirmation, reset password.
- `backend/src/modules/auth/auth.service.ts`: Auth business logic, password strength validation, `PendingRegistration` handling, E.164 phone normalization, token verification, forgot-password email dispatch (safe logging, removing swallowed `.catch(() => {})`).
- `backend/src/modules/auth/auth.schemas.ts`: Zod schemas for register, login, forgot password, reset password, email check.
- `backend/src/utils/email.utils.ts`: Nodemailer email templates and dispatch functions (`sendVerificationEmail`, `sendPasswordResetEmail`, `sendWelcomeEmail`, `sendMailSafely`, `FRONTEND_URL` fallback check).
- `backend/src/config/email.ts`: Nodemailer SMTP transporter and connection verifier.
- `backend/src/middleware/rateLimit.middleware.ts`: Rate limiters (`authLimiter`, `resetPasswordLimiter`, etc.).
- `frontend/src/app/(auth)/login/page.tsx`: Trader & partner login, phone/email input normalization.
- `frontend/src/app/(auth)/register/page.tsx`: Role selector, PhoneInput, live duplicate email check, password strength meter, T&C mandatory modal scroll and consent, "Check your email" pending screen.
- `frontend/src/app/(auth)/forgot-password/page.tsx`: Password reset request page, rate limit / error display.
- `frontend/src/app/(auth)/reset-password/page.tsx`: Password reset confirmation, strength meter, `<Suspense>` wrapper.
- `frontend/src/app/(auth)/verify-email/[token]/page.tsx`: Email verification token redemption page, idempotency handling, redirect to login.
- `frontend/src/store/authStore.ts`: Client authentication state, cookies (`edutrade_token`, `edutrade_role`), session hydration.
- `frontend/src/lib/api.ts`: Axios client, request interceptor attaching JWT token, response interceptor refresh logic (ensure 403 does not trigger false logout).
- `frontend/src/middleware.ts`: Next.js edge route protection for dashboard and admin routes based on cookies and JWT claims.

### User Profile
- `backend/src/modules/users/user.routes.ts`: User profile endpoints (`GET /users/me`, `PATCH /users/me`, `POST /users/me/avatar`).
- `backend/src/modules/users/user.controller.ts`: Profile controllers and avatar upload handler.
- `backend/src/modules/users/user.service.ts`: User profile updates (WhatsApp, city, country, bio, socialLinks), Cloudinary avatar upload and deletion.
- `backend/src/modules/users/user.schemas.ts`: Zod validation for user profile update (E.164 phones, URL allow-lists).
- `frontend/src/app/dashboard/profile/page.tsx`: Role-adaptive profile switcher routing to settings or role-specific profile.
- `frontend/src/app/dashboard/settings/page.tsx`: Trader profile management: Avatar upload with crop/preview, WhatsApp, mobile, city, country, bio, social links, sticky action bar.
- `frontend/src/components/layout/Navbar.tsx`: Navbar displaying user avatar and name.
- `frontend/src/components/layout/Sidebar.tsx` / `DashboardSidebar.tsx`: Sidebar displaying user profile and navigation.

### Broker Onboarding & Management
- `backend/src/modules/brokers/broker.routes.ts`: Broker endpoints (`/my/onboarding/:section`, `/my/leads`, `/my/upload/logo`, `/my/upload/promo-video`, `/admin/broker-leads`, etc.).
- `backend/src/modules/brokers/broker.controller.ts`: Onboarding section controllers, logo and video upload endpoints.
- `backend/src/modules/brokers/broker.service.ts`: Step validations, completeness calculations, sanitization, saving sections, omitting deprecated fields.
- `backend/src/modules/brokers/broker.schemas.ts`: Zod schemas for all onboarding steps (mandatory logo/legal name, ISO currencies, updated platforms/devices, LP tags, boolean GTC, spread list, numeric commissions).
- `backend/src/modules/options/*`: Dynamic broker option groups and validators.
- `backend/prisma/data/broker-options.ts` & `backend/prisma/seed-options.ts`: Seed data for option groups.
- `frontend/src/app/dashboard/broker/onboarding/page.tsx`: Full onboarding wizard, renumbered sections, new inputs (PhoneInput, MultiSelect, Locate us map link, LP tags, video dropzone, GTC radio, Spreads dropdown), removed deprecated sections (§11 symbol specs, §14 annual funding, MetaQuotes, charting timeframes, IB notes/tiers).
- `frontend/src/lib/brokerOptions.ts`: Frontend option lists, section definitions, and constants.
- `frontend/src/components/broker/OptionSelect.tsx` & `frontend/src/components/common/MultiSelect.tsx`: Dropdown and multi-select components.
- `frontend/src/app/admin/settings/BrokerOptionsManager.tsx`: Admin interface for editing dynamic options.

### Broker Leads & Enquiries
- `backend/src/modules/brokers/broker.service.ts`: `submitLead` (notify admins only, strip broker notifications/emails), `getMyLeads` (aggregate stats only, zero PII returned).
- `backend/src/modules/brokers/broker.controller.ts`: Public lead creation, click tracking (`POST /brokers/:id/click`), broker leads stats.
- `backend/src/modules/enquiries/enquiry.routes.ts`, `enquiry.controller.ts`, `enquiry.service.ts`: General enquiries module.
- `backend/src/modules/admin/admin.routes.ts`, `admin.controller.ts`, `admin.service.ts`: New `GET /admin/broker-leads` and `PATCH /admin/broker-leads/:id/read`.
- `frontend/src/app/dashboard/broker/leads/page.tsx` & `frontend/src/app/dashboard/leads/page.tsx`: Broker leads page converted to non-PII aggregate stats dashboard.
- `frontend/src/app/admin/enquiries/page.tsx`: Admin enquiries management with new "Broker Inquiries" tab, search, pagination, CSV export.

### Broker Public & Comparison Pages
- `frontend/src/app/(public)/brokers/[slug]/page.tsx`: Broker public profile: "Open Account" direct to `broker.ibLink`, "Send Inquiry" routed to Admin, display map link ("Locate us"), format instrument count as `N+`, updated platforms and devices, removed legacy fields.
- `frontend/src/app/(public)/brokers/compare/page.tsx`: Broker comparison matrix with removed deprecated fields.
- `frontend/src/components/broker/BrokerCard.tsx`: Broker listing card with updated platform tags and instruments count.
- `frontend/src/components/broker/BrokerFilters.tsx`: Platform filters (removed TradingView).
- `frontend/src/app/dashboard/broker/profile/page.tsx`: Broker profile review page.

---

## 2. String Search Occurrences (`grep -rn`)

1. **`Brokerage Firm`**:
   - `frontend/src/app/(auth)/register/page.tsx:47`: Partner role card label.
   - `frontend/src/lib/constants.ts:22`: `ROLE_LABELS.BROKER = 'Brokerage Firm'`.
   - `frontend/src/app/dashboard/broker/page.tsx:58`: Description copy.
   - `frontend/src/app/dashboard/broker/onboarding/page.tsx`: Wizard title and headings.

2. **`TradingView`**:
   - `frontend/src/lib/brokerOptions.ts:216`: Platform option.
   - `frontend/src/components/broker/BrokerFilters.tsx:85`: Filter option.
   - `frontend/src/app/dashboard/broker/profile/page.tsx:338`: Platform placeholder.
   - `server/src/seed.js:112, 140`: Seed scripts.
   - `backend/src/tests/golden/*.json`: `get_brokers.json`, `get_broker_slug.json`, `get_broker_my_profile.json`, `get_broker_compare.json`, `get_admin_brokers.json`.

3. **`NinjaTrader`**:
   - `frontend/src/lib/brokerOptions.ts:221`: Platform option list.

4. **`IRESS`**:
   - `frontend/src/lib/brokerOptions.ts:219`: Platform option list.

5. **`MetaQuotes`**:
   - `frontend/src/app/dashboard/broker/onboarding/page.tsx:802`: "MetaQuotes / Tech Server Jurisdiction".
   - `backend/prisma/schema.prisma:310`: `mtRegisteredCountryRegion`.
   - `backend/src/tests/golden/*.json`: Mentions in description and properties.

6. **`Tech Server`**:
   - `frontend/src/app/dashboard/broker/onboarding/page.tsx:802`: Label "MetaQuotes / Tech Server Jurisdiction".

7. **`Charting Timeframes`** / **`availableTimeframes`**:
   - `backend/prisma/schema.prisma:318`: `availableTimeframes String[]`.
   - `backend/src/modules/brokers/broker.schemas.ts`: Validation for `availableTimeframes`.
   - `backend/src/tests/broker-v2-suite.ts:120, 212, 220, 221`: Assertions for `availableTimeframes`.
   - `frontend/src/app/dashboard/broker/onboarding/page.tsx:1675, 1792, 1794`: Charting timeframes state and input.
   - `frontend/src/app/(public)/brokers/compare/page.tsx:397, 398`: Comparison column for timeframes.
   - `frontend/src/types/index.ts:279`: `availableTimeframes?: string[]`.

8. **`Tier Structure`** / **`Notes & Tier Structure`**:
   - `frontend/src/app/dashboard/broker/onboarding/page.tsx:2491`: Label "Notes & Tier Structure" on IB plans.

9. **`Symbol Spec`** / **`BrokerSymbolSpec`**:
   - `backend/prisma/schema.prisma:373, 509, 563-588`: Model `BrokerSymbolSpec`.
   - `backend/src/modules/brokers/broker.service.ts`: Handlers for symbol specs in section saves.
   - `frontend/src/lib/brokerOptions.ts:103`: Section definition "Tradable Symbol Specs".
   - `frontend/src/app/dashboard/broker/onboarding/page.tsx:2881`: Section 11 wizard component.
   - `frontend/src/app/(public)/brokers/[slug]/page.tsx:750`: "Benchmark Symbol Specifications".

10. **`Annual Funding`** / **`BrokerFundingYear`**:
    - `backend/prisma/schema.prisma:374, 590-604`: Model `BrokerFundingYear`.
    - `frontend/src/lib/brokerOptions.ts:127`: Section definition "Annual Funding & Volume".
    - `frontend/src/app/dashboard/broker/onboarding/page.tsx:3187`: Section 14 wizard component.

11. **`Regional Footprint`**:
    - `frontend/src/app/dashboard/broker/onboarding/page.tsx:3108`: Section header "Primary Regional Footprint".
    - `backend/prisma/schema.prisma:620-631`: Model `BrokerBusinessArea` and `% active accounts`.

12. **`HOLD_WEEKEND`** / **`GtcMode`**:
    - `backend/prisma/schema.prisma:77-80, 486`: `enum GtcMode`, `gtcMode GtcMode`.
    - `frontend/src/lib/brokerOptions.ts:4, 246, 247`: `GTC_MODES` option array.
    - `frontend/src/types/index.ts:21, 112`: Type `GtcMode`.
    - `frontend/src/app/dashboard/broker/onboarding/page.tsx:2010, 2050, 2258`: GTC dropdown input.

13. **`liquidityProvider`**:
    - `backend/prisma/schema.prisma:337`: `liquidityProvider String?`.
    - `frontend/src/app/dashboard/broker/onboarding/page.tsx:2997, 3014, 3015`: Text input for liquidity provider.
    - `backend/src/tests/golden/*.json`: Golden JSON responses.

14. **`promoVideo`** / **`promoVideoUrl`**:
    - `backend/prisma/schema.prisma:343`: `promoVideoUrl String?`.
    - `frontend/src/app/dashboard/broker/onboarding/page.tsx:3788, 3849, 3859`: Promo video input and upload button.
    - `backend/src/tests/golden/*.json`: Golden responses containing `promoVideoUrl`.

---

## 3. Test Suites & Golden Response Impact

- `backend/src/tests/golden/*.json`:
  - `get_brokers.json`
  - `get_broker_slug.json`
  - `get_broker_compare.json`
  - `get_broker_my_profile.json`
  - `get_admin_brokers.json`
  - *Impact:* Fields removed (`mtRegisteredCountryRegion`, `availableTimeframes`, symbol specs, funding years) and added (`ibLink`, `mapLink`, `operatingCountries`, `liquidityProviders`, `regionalFootprint`, `baseCurrencies`, `gtcEnabled`, updated platforms without TradingView/NinjaTrader/IRESS). Will regenerate golden files using `capture-golden.ts`.
- `backend/src/tests/broker-v2-suite.ts`:
  - Remove assertions for `availableTimeframes` (B16).
  - Add assertions for new broker fields, GTC boolean, base currencies multi-select, and validation rules.
- `backend/src/tests/security-suite.ts`:
  - Extend to verify password strength rules, disposable email blocking, duplicate email prevention, E.164 phone formats, and RBAC isolation for broker leads.
