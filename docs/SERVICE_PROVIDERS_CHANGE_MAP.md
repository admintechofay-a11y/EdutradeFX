# EdutradeFX — Solutions Providers (New Partner Category) Change Map

> Reconnaissance specification for the complete Solutions Providers onboarding, category forms, dynamic form builder, multi-product management, publication layer, and admin governance system.
> Source document: `docs/Solutions_Providers_NEW.docx`
> Scanned at commit: `15467e4`

---

## 1. Executive Summary & Architectural Decisions

1. **User-Facing vs Code Naming**:
   - User-Facing: **Solutions Providers**
   - Role: `Role.SERVICE_PROVIDER`
   - Master Model: `ServiceProvider` (`providers`)
   - Dashboard: `/dashboard/service-provider`
   - Public Routes: `/solutions-providers`
   - API Prefix: `/api/v1/service-providers` (and `/api/v1/provider-forms`)

2. **Core Architectural Principles**:
   - `ONE COMPANY → MULTIPLE CATEGORIES → SEPARATE CATEGORY FORMS → MULTIPLE PRODUCTS → ONE COMPANY PROFILE`
   - **Independent Approval**: Company master profile, each category selection, and each product are approved/rejected/changed independently.
   - **Publication Layer**: Draft data is stored separately from public data. The public directory and profile endpoints read exclusively from `PublishedProvider` and `PublishedProduct`.
   - **Rebuild Mechanism**: `rebuildPublishedProvider(providerId)` recomposes the public snapshot from approved entities only upon any approval, rejection, suspension, claim verification, or team moderation.
   - **Admin-Managed Dynamic Form Builder**: Category technical forms (Categories 01–09 provider-level, Category 10 tool sections C–N product-level) are fully dynamic. Form sections, fields, types, options, validations, and conditional visibility are stored in the database (`ProviderCategory`, `ProviderSubcategory`, `CategoryFormSection`, `CategoryFormField`, `ProviderOptionList`) and seeded verbatim from the docx.
   - **Claims Governance**: Fields marked `claim: VERIFIABLE` are suppressed from the public snapshot until explicitly verified by an administrator (`verifiedClaims: string[]`). Other claims are labeled `"Provider-declared. Not verified by EdutradeFX."`
   - **Strict Privacy Boundaries**: Registered addresses, account/login credentials, private contacts, ownership percentages (unless consented), private evidence documents, and review flags/rejection notes are strictly sealed from public serializers.

---

## 2. Touchpoint Matrix & Files Touched

### 2.1 Auth & Registration Flow
- `backend/prisma/schema.prisma`:
  - Add `SERVICE_PROVIDER` to `enum Role`
  - Add `SERVICE_PROVIDER` to `enum AgreementAudience`
  - Add `SERVICE_PROVIDER` to `enum ComplaintTargetType`
  - Add all Service Provider models (see Database Schema below)
- `backend/src/modules/auth/auth.schemas.ts`:
  - Extend partner registration validation schema to permit `Role.SERVICE_PROVIDER`
  - Add fields for Solutions Provider registration: `accountType` (`ProviderAccountType`), `accountTypeOther`, `contactFullName`, `jobTitle`, `businessEmail`, `phone` (E.164), `acceptTerms`, `acceptPrivacy`.
- `backend/src/modules/auth/auth.service.ts`:
  - Handle `pending.role === Role.SERVICE_PROVIDER` in `verifyEmail` transaction:
    - Create `User` (role `SERVICE_PROVIDER`)
    - Create `ServiceProvider` stub (`status: DRAFT`, slug generated from company name / contact name)
    - Create primary `ProviderContact` from registration payload
  - Check business email domain and set review flag on free-mail domains (warning, non-blocking)
- `backend/src/middlewares/role.middleware.ts`:
  - Ensure `requireRole([Role.SERVICE_PROVIDER, Role.ADMIN])` is permitted
- `frontend/src/app/(auth)/register/page.tsx`:
  - Add "Solutions Provider" role selection card with icon, badge, and description
  - Role-specific form fields: Account Type dropdown (6 options + Other text field), Contact Person Full Name, Job Title, Business Email with real-time availability check, PhoneInput with country code, Password with strength meter, Confirm Password
  - Dual mandatory checkboxes: Terms & Conditions and Privacy Policy with scroll-gated modals
  - Primary button: "Create Provider Account"
  - Transitions to "Verify Your Email" screen upon successful registration initiation

### 2.2 Navigation, Middleware & Global Layouts
- `frontend/src/middleware.ts`:
  - Protect `/dashboard/service-provider/:path*` for `SERVICE_PROVIDER` and `ADMIN`
- `frontend/src/lib/constants.ts`:
  - Add `Role.SERVICE_PROVIDER` display labels, badges, and dashboard route mappings
- `frontend/src/types/index.ts`:
  - Add `SERVICE_PROVIDER` to `UserRole` union and export all provider domain types
- `frontend/src/components/layout/Navbar.tsx`:
  - Update `getDashboardHref` to route `SERVICE_PROVIDER` to `/dashboard/service-provider`
  - Add public navigation link "Solutions Providers" in header navigation
- `frontend/src/components/layout/Footer.tsx`:
  - Add directory link to `/solutions-providers` under platform resources
- `frontend/src/components/layout/DashboardSidebar.tsx`:
  - Add the 12 doc-mandated navigation items for Solutions Providers:
    1. Company Overview (`/dashboard/service-provider`)
    2. Company Profile (`/dashboard/service-provider/profile`)
    3. My Categories (`/dashboard/service-provider/categories`)
    4. Products & Services (`/dashboard/service-provider/products`)
    5. Pricing (`/dashboard/service-provider/pricing`)
    6. Integrations (`/dashboard/service-provider/integrations`)
    7. Company & Team (`/dashboard/service-provider/team`)
    8. Documents & Verification (`/dashboard/service-provider/documents`)
    9. Enquiries / Leads (`/dashboard/service-provider/enquiries`)
    10. Reviews (`/dashboard/service-provider/reviews`)
    11. Analytics (`/dashboard/service-provider/analytics`)
    12. Account Settings (`/dashboard/service-provider/settings`)
    - Preview & Submit shortcut (`/dashboard/service-provider/preview`)
- `frontend/src/components/layout/AdminSidebar.tsx`:
  - Add "Solutions Providers" admin module (`/admin/service-providers`)
  - Add "Category Form Builder" admin module (`/admin/provider-forms`)
- `frontend/src/app/sitemap.ts`:
  - Include `/solutions-providers`, category routes, approved provider profile slugs, and approved product slugs
- `frontend/src/app/dashboard/page.tsx`:
  - Redirect `SERVICE_PROVIDER` to `/dashboard/service-provider`
- `frontend/src/app/dashboard/profile/page.tsx`:
  - Route `SERVICE_PROVIDER` to `/dashboard/service-provider/profile`
- `frontend/src/app/dashboard/enquiries/page.tsx`:
  - Route `SERVICE_PROVIDER` to `/dashboard/service-provider/enquiries`
- `frontend/src/app/admin/users/page.tsx`:
  - Support `SERVICE_PROVIDER` filter and badge
- `frontend/src/app/admin/audit-logs/page.tsx`:
  - Map provider audit events and entity links
- `frontend/src/app/complaints/page.tsx`:
  - Allow filing complaints against `SERVICE_PROVIDER` target

---

## 3. Existing Shared Components to Reuse

- `components/ui/Button.tsx`: Primary, secondary, outline, ghost, destructive buttons
- `components/ui/Modal.tsx`: Accessible dialogs for confirmation, remove warnings, and previews
- `components/ui/ResponsiveTable.tsx`: Mobile card view / desktop table wrapper
- `components/ui/StickyActionBar.tsx`: Fixed mobile/desktop bottom action bar for draft and save workflows
- `components/ui/PageContainer.tsx`: Standard responsive max-width page wrapper
- `components/ui/FormGrid.tsx`: Responsive 1-col / 2-col / 3-col form layout grids
- `components/ui/SectionHeading.tsx`: Section titles with subtitles and action slots
- `components/ui/StatBar.tsx`: Metric summary cards
- `components/ui/IconTile.tsx`: Feature and category icon tiles
- `components/ui/EmptyState.tsx`: Empty state placeholders with CTA buttons
- `components/ui/Pagination.tsx`: Paginated list controls
- `components/ui/Skeleton.tsx`: Content loading skeletons
- `components/common/PhoneInput.tsx`: International E.164 phone number input
- `components/common/MultiSelect.tsx`: Multi-select dropdown with search
- `components/common/NumericInput.tsx`: Formatted numeric input
- `components/common/PasswordStrengthMeter.tsx`: Real-time password complexity evaluator
- `components/broker/OptionSelect.tsx`: Single select dropdown component
- `components/admin/AMAgreementsManager.tsx` & `SPAgreementsManager.tsx`: Reusable agreement manager pattern

---

## 4. Generic Reusable Form Kit to Build (`frontend/src/components/forms/`)

1. `WizardShell.tsx`:
   - Step navigation chips, progress bar, dirty-state guard, back/forward buttons, sticky action bar
2. `DynamicForm.tsx` & `FieldRenderer.tsx`:
   - Renders fields dynamically from backend schema definitions
   - Supports 22 field types: `TEXT`, `TEXTAREA`, `RICH_TEXT`, `NUMBER`, `NUMBER_UNIT`, `PERCENT`, `MONEY`, `SINGLE_SELECT`, `MULTI_SELECT`, `YES_NO`, `YES_NO_DETAILS`, `TRI_STATE`, `URL`, `DATE`, `DATE_RANGE`, `COUNTRY_SINGLE`, `COUNTRY_MULTI`, `LOCATION`, `SCHEDULE`, `FILE`, `FILE_MULTI`, `REPEATABLE_GROUP`, `STATUS_OR_VALUE`
   - Handles conditional visibility (`visibleWhen`), "Other" text expander, disjoint constraints, and claim badges
3. `FileDropzone.tsx`:
   - Tap-to-upload + drag-drop, mobile camera capture for images, progress indicator, preview thumbnail, file type and size limits
4. `RichTextEditor.tsx`:
   - Powered by TipTap (`@tiptap/react`, `@tiptap/starter-kit`)
   - Clean toolbar collapsing gracefully on mobile; outputs sanitized HTML
5. `RepeatableGroup.tsx`:
   - Add/remove/reorder dynamic sub-records (e.g. offices, LP names, data sources)
6. `LocationSelect.tsx`:
   - Dependent country → state → city selection with manual entry fallback (`country-state-city`)
7. `CountryMultiSelect.tsx`:
   - Searchable country multi-select with regional quick-select shortcuts
8. `TimezoneSelect.tsx`:
   - Searchable IANA timezone picker with local UTC offset display
9. `ScheduleInput.tsx`:
   - Business hours and day-of-week schedule selector
10. `MoneyInput.tsx`:
    - Amount + currency selector supporting flexible pricing modes (`AMOUNT`, `CUSTOM`, `INCLUDED`, `NONE`)
11. `StatusOrValueInput.tsx`:
    - Numeric value or status string ("Not published", "Not disclosed") selector
12. `ClaimBadge.tsx`:
    - Visual indicator distinguishing `VERIFIABLE` vs `DECLARED` claims

---

## 5. Domain Components to Build (`frontend/src/components/provider/`)

- `ProviderCard.tsx`: Directory card showing logo, name, verified badge, rating, categories, and quick actions
- `CategoryCard.tsx`: Category selector card with service descriptions and completion status
- `ProductCard.tsx`: Product catalogue card with status, pricing model, and category badges
- `PricingBlock.tsx`: Responsive pricing card handling tiers, setup fees, and validity dates
- `VerificationBadge.tsx`: Tiered verification status indicator (Verified, Pending, Unverified)
- `StatusBadge.tsx`: Consistent badge for review statuses across company, category, and product
- `ClaimLabel.tsx`: "Provider-declared. Not verified by EdutradeFX." disclaimer tag
- `DisclaimerBlock.tsx`: Regulatory and consumer disclaimers (e.g. Cat 09 consulting, Cat 10 indicator risk)
- `EnquiryForm.tsx`: Modal / embedded B2B quote and demo request form with required consent checkbox
- `ReviewList.tsx`: Moderated review list with rating breakdown
- `TeamGrid.tsx`: Team member cards with role and product associations
- `MediaGallery.tsx`: Swipeable screenshot and video preview gallery
- `CompareTable.tsx`: Side-by-side comparison table for solutions providers

---

## 6. Backend Modules to Build (`backend/src/modules/`)

### 6.1 `modules/service-providers/`
- `provider.routes.ts`: Private provider dashboard endpoints & public directory/profile routes
- `provider.controller.ts`: Request parsing, status codes, delegation to services
- `provider.schemas.ts`: Zod schemas for all company sections, product tabs, team, documents, submit
- `provider.serializer.ts`: Strict allow-list public serializer + forbidden key leak detector
- `provider.utils.ts`: Provider code generation (`ETP-XXXXXX`), application ref (`APP-YYYY-XXXXXX`), review flags engine, completion calculator
- `provider.company.service.ts`: Company profile sections (Identity, Address, Size, Customers, Languages, Support, Commercial)
- `provider.category.service.ts`: Category selection, deselection, draft save, completion, submission
- `provider.product.service.ts`: Product CRUD, category links, technical specs, integrations, pricing, media, duplicate product
- `provider.team.service.ts`: Team member management, founder/owner governance, moderation
- `provider.docs.service.ts`: Document uploads, private Cloudinary storage, signed URL generation, expiry tracking
- `provider.publish.service.ts`: Public snapshot compilation (`rebuildPublishedProvider`), denormalized search columns
- `provider.review.service.ts`: User review submission, moderation queue, minimum review threshold
- `provider.enquiry.service.ts`: B2B quote/demo request submission, notifications, provider dashboard lead management
- `provider.analytics.service.ts`: Profile views, product views, click-throughs, and brochure download tracking

### 6.2 `modules/provider-forms/`
- `form.routes.ts`: Form definitions API (public-authenticated) and admin form builder CRUD
- `form.controller.ts`: Dynamic form endpoints
- `form.service.ts`: Category definitions, sections, fields, option lists, and schema versioning
- `form.schemas.ts`: Validation for admin form builder updates
- `form.engine.ts`: Runtime Zod schema generator based on active database field configurations

---

## 7. Database Migration & 21-Table Architecture

1. `providers` (`ServiceProvider`): Master company record, identity, support, commercial, workflow status, cached rating
2. `provider_contacts` (`ProviderContact`): Primary & public contact persons
3. `provider_addresses` (`ProviderAddress`): Headquarters, registered address, branch offices
4. `provider_social_links` (`ProviderSocialLink`): Social channels (LinkedIn, X, MQL5, TradingView, etc.)
5. `category_definitions` (`ProviderCategory`): 10 core categories from docx §1
6. `provider_subcategories` (`ProviderSubcategory`): Subcategories for each category from Form 5 B
7. `category_form_sections` (`CategoryFormSection`): 79 sections across the 10 categories
8. `category_form_fields` (`CategoryFormField`): Configurable questions, types, options, validations
9. `provider_option_lists` (`ProviderOptionList`): Shared option lists (registration authorities, regions, sizes, etc.)
10. `provider_category_selections` (`ProviderCategorySelection`): Category selections, answers JSON, completion, review status, verified claims
11. `products` (`ServiceProviderProduct`): Individual product records, availability, specifications
12. `product_categories` (`ProductCategoryLink`): Many-to-many product-to-category mappings with exactly one primary
13. `product_category_details` (`ProductCategoryDetail`): Category-specific tool specifications (Cat 10 C–N)
14. `product_technical_specs` (`ProductTechnicalSpec`): Architecture, hosting, OS, hardware, security
15. `product_integrations` (`ProductIntegration`): Platforms, APIs, capabilities, partner info
16. `product_media` (`ProductMedia`): Screenshots, platform/timeframe metadata, videos, cover flags
17. `product_documents` (`ProductDocument`): User guides, brochures, technical docs (public/private)
18. `product_pricing` (`ProductPricing`): Structured commercial models, fees, free trials, validity
19. `provider_team` (`ProviderTeamMember`): Founders, directors, key staff, ownership disclosure
20. `provider_documents` (`ProviderDocument`): Company verification documents, evidence links, expiry
21. `provider_verifications` (`ProviderVerification`): Audit history of verification status transitions
22. `provider_enquiries` (`ProviderEnquiry`): B2B quote and demo lead records
23. `provider_reviews` (`ProviderReview`): Moderated community reviews
24. `provider_review_events` (`ProviderReviewEvent`): Detailed change history and correction requests
25. `published_providers` (`PublishedProvider`): Denormalized, approved-only public snapshot
26. `published_products` (`PublishedProduct`): Denormalized, approved-only public product snapshot
27. `provider_featured_placements` (`ProviderFeaturedPlacement`): Homepage and category featured slots
28. `provider_daily_stats` (`ProviderDailyStat`): Privacy-safe aggregate analytics
29. `counters` (`Counter`): Race-safe atomic sequence generator for Provider ID and Application Ref

---

## 8. Dependencies Added

- **Backend**:
  - `sanitize-html`: High-security HTML sanitizer for rich text fields
  - `@types/sanitize-html`: TypeScript definitions for sanitize-html
- **Frontend**:
  - `@tiptap/react`: Headless rich-text editor framework for React
  - `@tiptap/starter-kit`: Core TipTap extensions (headings, lists, bold, italic, blockquote)
