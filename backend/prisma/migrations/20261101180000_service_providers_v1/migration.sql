-- ==============================================================================
-- Migration: 20261101180000_service_providers_v1
-- Description: Full Solutions Providers Registration, Onboarding, Multi-category Forms,
--              Product Catalogue, Publication Layer, and Admin Governance System.
-- ==============================================================================

CREATE TYPE "ProviderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'SUSPENDED');

CREATE TYPE "ProviderCategoryStatus" AS ENUM ('NOT_STARTED', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED');

CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ARCHIVED');

CREATE TYPE "ProviderVerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING_REVIEW', 'UNDER_VERIFICATION', 'VERIFIED', 'PARTIALLY_VERIFIED', 'REJECTED', 'EXPIRED', 'SUSPENDED');

CREATE TYPE "ProductAvailability" AS ENUM ('AVAILABLE', 'LIMITED_AVAILABILITY', 'BETA', 'UNDER_DEVELOPMENT', 'DISCONTINUED');

CREATE TYPE "ProviderAccountType" AS ENUM ('REGISTERED_COMPANY', 'INDIVIDUAL_PROVIDER', 'TECHNOLOGY_DEVELOPER', 'CONSULTANCY', 'FINANCIAL_INSTITUTION', 'OTHER');

CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'RICH_TEXT', 'NUMBER', 'NUMBER_UNIT', 'PERCENT', 'MONEY', 'SINGLE_SELECT', 'MULTI_SELECT', 'YES_NO', 'YES_NO_DETAILS', 'TRI_STATE', 'URL', 'DATE', 'DATE_RANGE', 'COUNTRY_SINGLE', 'COUNTRY_MULTI', 'LOCATION', 'SCHEDULE', 'FILE', 'FILE_MULTI', 'REPEATABLE_GROUP', 'STATUS_OR_VALUE');

CREATE TYPE "FieldVisibility" AS ENUM ('PUBLIC', 'ADMIN_ONLY');

CREATE TYPE "ClaimLevel" AS ENUM ('DECLARED', 'VERIFIABLE');

CREATE TYPE "FormScope" AS ENUM ('PROVIDER', 'PRODUCT');

CREATE TYPE "PricingVisibility" AS ENUM ('PUBLIC', 'STARTING_PRICE', 'INDICATIVE', 'CUSTOM_QUOTE', 'CONFIDENTIAL', 'FREE');

CREATE TYPE "ProviderEnquiryType" AS ENUM ('QUOTE', 'DEMO', 'GENERAL');

CREATE TYPE "ProviderEnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "AddressType" AS ENUM ('HEADQUARTERS', 'REGISTERED', 'OFFICE');

CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'X', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TELEGRAM', 'DISCORD', 'GITHUB', 'TRADINGVIEW', 'MQL5', 'OTHER');

CREATE TYPE "ProductMediaKind" AS ENUM ('IMAGE', 'VIDEO');

CREATE TYPE "DocumentVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

CREATE TYPE "ProviderDocGroup" AS ENUM ('DOCUMENT', 'EVIDENCE');

CREATE TYPE "ProviderDocKind" AS ENUM ('FILE', 'LINK');

CREATE TYPE "TeamFounderRole" AS ENUM ('FOUNDER', 'CO_FOUNDER', 'CURRENT_OWNER', 'DIRECTOR', 'OTHER');

CREATE TYPE "TeamOwnershipDisclosure" AS ENUM ('PUBLIC', 'PRIVATE', 'NOT_DISCLOSED');

CREATE TYPE "TeamProfileVisibility" AS ENUM ('PUBLIC_SEARCHABLE', 'COMPANY_PROFILE_ONLY', 'PRIVATE_ADMIN');

CREATE TYPE "FeaturedPlacementType" AS ENUM ('HOME', 'CATEGORY');

CREATE TYPE "ProviderReviewEntityType" AS ENUM ('COMPANY', 'CATEGORY', 'PRODUCT', 'DOCUMENT', 'TEAM', 'MEDIA');

ALTER TYPE "AgreementAudience" ADD VALUE IF NOT EXISTS 'SERVICE_PROVIDER';

ALTER TYPE "ComplaintTargetType" ADD VALUE IF NOT EXISTS 'SERVICE_PROVIDER';

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SERVICE_PROVIDER';

ALTER TABLE "PartnerAgreement" ALTER COLUMN "audience" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "SignalProvider" ALTER COLUMN "tradingStyles" DROP DEFAULT,
ALTER COLUMN "preferredTimeframes" DROP DEFAULT;

ALTER TABLE "SignalProviderDocument" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "SignalProviderPlan" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerCode" TEXT,
    "applicationRef" TEXT,
    "slug" TEXT NOT NULL,
    "accountType" "ProviderAccountType" NOT NULL DEFAULT 'REGISTERED_COMPANY',
    "accountTypeOther" TEXT,
    "status" "ProviderStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "ProviderVerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "legalName" TEXT,
    "brandName" TEXT,
    "registrationNumber" TEXT,
    "registrationAuthority" TEXT,
    "registrationAuthorityOther" TEXT,
    "yearEstablished" INTEGER,
    "website" TEXT,
    "companyEmail" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "tagline" TEXT,
    "overview" TEXT,
    "presentationUrl" TEXT,
    "presentationPublicId" TEXT,
    "headquartersCountryCode" TEXT,
    "operatingRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "companySize" TEXT,
    "customerTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportAvailability" TEXT,
    "supportChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publicContactPreference" TEXT,
    "supportDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timezone" TEXT,
    "pricingApproach" TEXT,
    "preferredContractType" TEXT,
    "acceptedCurrencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minimumEngagement" TEXT,
    "enterpriseProposals" TEXT,
    "negotiablePricing" TEXT,
    "implementationCharges" TEXT,
    "supportCharges" TEXT,
    "renewalTerms" TEXT,
    "cancellationTerms" TEXT,
    "taxTreatment" TEXT,
    "commercialContact" TEXT,
    "pricingBrochureUrl" TEXT,
    "commercialTermsUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "changesRequestedNote" TEXT,
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "reviewFlags" JSONB,
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_contacts" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_contacts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_addresses" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'OFFICE',
    "label" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "countryCode" TEXT NOT NULL,
    "stateCode" TEXT,
    "stateName" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_social_links" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_social_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "category_definitions" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "mainServices" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasProductForm" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_definitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_subcategories" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_subcategories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "category_form_sections" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scope" "FormScope" NOT NULL DEFAULT 'PROVIDER',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_form_sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "category_form_fields" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "helpText" TEXT,
    "type" "FormFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "scope" "FormScope" NOT NULL DEFAULT 'PROVIDER',
    "options" JSONB,
    "optionSource" TEXT,
    "allowOther" BOOLEAN NOT NULL DEFAULT false,
    "unitOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "statuses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "validation" JSONB,
    "visibleWhen" JSONB,
    "disjointWith" TEXT,
    "repeatableFields" JSONB,
    "visibility" "FieldVisibility" NOT NULL DEFAULT 'PUBLIC',
    "claim" "ClaimLevel" NOT NULL DEFAULT 'DECLARED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_form_fields_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_option_lists" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_option_lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_category_selections" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT true,
    "deselectedAt" TIMESTAMP(3),
    "status" "ProviderCategoryStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "verifiedClaims" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "markedCompleteAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "changesRequestedNote" TEXT,
    "approvedSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_category_selections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "thumbnail" TEXT,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT,
    "productType" TEXT NOT NULL,
    "version" TEXT,
    "initialReleaseDate" TIMESTAMP(3),
    "latestUpdateDate" TIMESTAMP(3),
    "availability" "ProductAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "officialUrl" TEXT,
    "brochureUrl" TEXT,
    "brochurePublicId" TEXT,
    "userGuideUrl" TEXT,
    "demoUrl" TEXT,
    "mainPurposes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits" TEXT,
    "targetCustomers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "limitations" TEXT,
    "useCases" TEXT,
    "supportHours" TEXT,
    "supportChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maintenance" TEXT,
    "technicalSupportIncluded" BOOLEAN,
    "softwareUpdates" BOOLEAN,
    "warranty" TEXT,
    "responseTime" JSONB,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "changesRequestedNote" TEXT,
    "verifiedClaims" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "archivedAt" TIMESTAMP(3),
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryKey" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_category_details" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_category_details_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_technical_specs" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "architecture" TEXT,
    "deploymentModel" TEXT,
    "hostingRequirement" TEXT,
    "operatingSystems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hardwareRequirements" TEXT,
    "supportedVersions" TEXT,
    "technicalDocUrl" TEXT,
    "securityFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dataRetention" TEXT,
    "implementationTime" TEXT,
    "prerequisites" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_technical_specs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_integrations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supportedPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "methods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" TEXT,
    "partnerName" TEXT,
    "documentationUrl" TEXT,
    "integrationFee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_integrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_media" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "kind" "ProductMediaKind" NOT NULL DEFAULT 'IMAGE',
    "mediaType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "videoUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT,
    "timeframe" TEXT,
    "symbol" TEXT,
    "screenshotType" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "rightsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_documents" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "reviewStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_pricing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "visibility" "PricingVisibility" NOT NULL DEFAULT 'CUSTOM_QUOTE',
    "models" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "price" DECIMAL(14,2),
    "setupFee" JSONB,
    "monthlyFee" JSONB,
    "annualFee" JSONB,
    "perAccountFee" JSONB,
    "perUserFee" JSONB,
    "perTransactionFee" JSONB,
    "minimumCommitment" JSONB,
    "contractDuration" TEXT,
    "implementationFee" JSONB,
    "supportFee" JSONB,
    "additionalModules" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "freeTrial" BOOLEAN DEFAULT false,
    "trialDays" INTEGER,
    "enterpriseDiscount" TEXT,
    "taxTreatment" TEXT,
    "pricingValidUntil" TIMESTAMP(3),
    "pricingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pricing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_team" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "linkedinUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "founderRole" "TeamFounderRole",
    "currentDesignation" TEXT,
    "ownershipDisclosure" "TeamOwnershipDisclosure" NOT NULL DEFAULT 'NOT_DISCLOSED',
    "ownershipPercentage" DECIMAL(5,2),
    "ownershipPublicConsentAt" TIMESTAMP(3),
    "evidenceDocId" TEXT,
    "profileVisibility" "TeamProfileVisibility" NOT NULL DEFAULT 'COMPANY_PROFILE_ONLY',
    "reviewStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "team_member_products" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "team_member_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_documents" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "kind" "ProviderDocKind" NOT NULL DEFAULT 'FILE',
    "group" "ProviderDocGroup" NOT NULL DEFAULT 'DOCUMENT',
    "docType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingAuthority" TEXT,
    "registrationNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "verificationUrl" TEXT,
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "publicId" TEXT,
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PRIVATE',
    "requiredForVerification" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "expiryNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_verifications" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "ProviderVerificationStatus" NOT NULL,
    "note" TEXT,
    "actorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_enquiries" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "productId" TEXT,
    "categoryId" TEXT,
    "type" "ProviderEnquiryType" NOT NULL DEFAULT 'GENERAL',
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT,
    "roleTitle" TEXT,
    "country" TEXT,
    "message" TEXT NOT NULL,
    "budgetRange" TEXT,
    "timeline" TEXT,
    "consentToShare" BOOLEAN NOT NULL DEFAULT true,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProviderEnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_enquiries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_reviews" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "productId" TEXT,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedById" TEXT,
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_review_events" (
    "id" TEXT NOT NULL,
    "entityType" "ProviderReviewEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "note" TEXT,
    "actorId" TEXT,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_review_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "published_providers" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headquartersCountryCode" TEXT,
    "operatingRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categoryNumbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customerTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "companySize" TEXT,
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "featuredRank" INTEGER,
    "snapshot" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "published_providers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "published_products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "categoryNumbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "subcategoryKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pricingVisibility" "PricingVisibility" NOT NULL,
    "priceFrom" DECIMAL(14,2),
    "currency" TEXT,
    "availability" "ProductAvailability" NOT NULL,
    "snapshot" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "published_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_featured_placements" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "placement" "FeaturedPlacementType" NOT NULL DEFAULT 'HOME',
    "categoryId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_featured_placements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_daily_stats" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "productId" TEXT,
    "date" DATE NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "productViews" INTEGER NOT NULL DEFAULT 0,
    "enquiries" INTEGER NOT NULL DEFAULT 0,
    "websiteClicks" INTEGER NOT NULL DEFAULT 0,
    "brochureDownloads" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "provider_daily_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "counters" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "counters_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX "providers_userId_key" ON "providers"("userId");

CREATE UNIQUE INDEX "providers_providerCode_key" ON "providers"("providerCode");

CREATE UNIQUE INDEX "providers_applicationRef_key" ON "providers"("applicationRef");

CREATE UNIQUE INDEX "providers_slug_key" ON "providers"("slug");

CREATE INDEX "providers_status_idx" ON "providers"("status");

CREATE INDEX "providers_verificationStatus_idx" ON "providers"("verificationStatus");

CREATE INDEX "providers_slug_idx" ON "providers"("slug");

CREATE INDEX "providers_providerCode_idx" ON "providers"("providerCode");

CREATE INDEX "providers_applicationRef_idx" ON "providers"("applicationRef");

CREATE INDEX "providers_isFeatured_idx" ON "providers"("isFeatured");

CREATE INDEX "providers_createdAt_idx" ON "providers"("createdAt");

CREATE INDEX "provider_contacts_providerId_idx" ON "provider_contacts"("providerId");

CREATE INDEX "provider_addresses_providerId_idx" ON "provider_addresses"("providerId");

CREATE INDEX "provider_social_links_providerId_idx" ON "provider_social_links"("providerId");

CREATE UNIQUE INDEX "category_definitions_number_key" ON "category_definitions"("number");

CREATE UNIQUE INDEX "category_definitions_slug_key" ON "category_definitions"("slug");

CREATE INDEX "category_definitions_number_idx" ON "category_definitions"("number");

CREATE INDEX "category_definitions_slug_idx" ON "category_definitions"("slug");

CREATE INDEX "category_definitions_isActive_idx" ON "category_definitions"("isActive");

CREATE INDEX "provider_subcategories_categoryId_isActive_idx" ON "provider_subcategories"("categoryId", "isActive");

CREATE UNIQUE INDEX "provider_subcategories_categoryId_key_key" ON "provider_subcategories"("categoryId", "key");

CREATE INDEX "category_form_sections_categoryId_scope_isActive_idx" ON "category_form_sections"("categoryId", "scope", "isActive");

CREATE UNIQUE INDEX "category_form_sections_categoryId_key_scope_key" ON "category_form_sections"("categoryId", "key", "scope");

CREATE INDEX "category_form_fields_sectionId_isActive_idx" ON "category_form_fields"("sectionId", "isActive");

CREATE UNIQUE INDEX "category_form_fields_sectionId_key_key" ON "category_form_fields"("sectionId", "key");

CREATE UNIQUE INDEX "provider_option_lists_key_key" ON "provider_option_lists"("key");

CREATE INDEX "provider_option_lists_key_idx" ON "provider_option_lists"("key");

CREATE INDEX "provider_category_selections_providerId_isSelected_idx" ON "provider_category_selections"("providerId", "isSelected");

CREATE INDEX "provider_category_selections_status_idx" ON "provider_category_selections"("status");

CREATE UNIQUE INDEX "provider_category_selections_providerId_categoryId_key" ON "provider_category_selections"("providerId", "categoryId");

CREATE INDEX "products_providerId_status_idx" ON "products"("providerId", "status");

CREATE INDEX "products_status_idx" ON "products"("status");

CREATE UNIQUE INDEX "products_providerId_slug_key" ON "products"("providerId", "slug");

CREATE INDEX "product_categories_productId_isPrimary_idx" ON "product_categories"("productId", "isPrimary");

CREATE INDEX "product_categories_categoryId_idx" ON "product_categories"("categoryId");

CREATE UNIQUE INDEX "product_categories_productId_categoryId_subcategoryKey_key" ON "product_categories"("productId", "categoryId", "subcategoryKey");

CREATE INDEX "product_category_details_productId_idx" ON "product_category_details"("productId");

CREATE UNIQUE INDEX "product_category_details_productId_categoryId_key" ON "product_category_details"("productId", "categoryId");

CREATE UNIQUE INDEX "product_technical_specs_productId_key" ON "product_technical_specs"("productId");

CREATE UNIQUE INDEX "product_integrations_productId_key" ON "product_integrations"("productId");

CREATE INDEX "product_media_productId_reviewStatus_idx" ON "product_media"("productId", "reviewStatus");

CREATE INDEX "product_documents_productId_reviewStatus_idx" ON "product_documents"("productId", "reviewStatus");

CREATE UNIQUE INDEX "product_pricing_productId_key" ON "product_pricing"("productId");

CREATE INDEX "provider_team_providerId_reviewStatus_idx" ON "provider_team"("providerId", "reviewStatus");

CREATE INDEX "team_member_products_productId_idx" ON "team_member_products"("productId");

CREATE UNIQUE INDEX "team_member_products_teamMemberId_productId_key" ON "team_member_products"("teamMemberId", "productId");

CREATE INDEX "provider_documents_providerId_reviewStatus_idx" ON "provider_documents"("providerId", "reviewStatus");

CREATE INDEX "provider_documents_expiryDate_idx" ON "provider_documents"("expiryDate");

CREATE INDEX "provider_verifications_providerId_createdAt_idx" ON "provider_verifications"("providerId", "createdAt");

CREATE INDEX "provider_enquiries_providerId_status_createdAt_idx" ON "provider_enquiries"("providerId", "status", "createdAt");

CREATE INDEX "provider_enquiries_userId_idx" ON "provider_enquiries"("userId");

CREATE INDEX "provider_reviews_providerId_status_idx" ON "provider_reviews"("providerId", "status");

CREATE UNIQUE INDEX "provider_reviews_providerId_userId_productId_key" ON "provider_reviews"("providerId", "userId", "productId");

CREATE INDEX "provider_review_events_providerId_createdAt_idx" ON "provider_review_events"("providerId", "createdAt");

CREATE INDEX "provider_review_events_entityType_entityId_idx" ON "provider_review_events"("entityType", "entityId");

CREATE UNIQUE INDEX "published_providers_providerId_key" ON "published_providers"("providerId");

CREATE UNIQUE INDEX "published_providers_slug_key" ON "published_providers"("slug");

CREATE INDEX "published_providers_verified_idx" ON "published_providers"("verified");

CREATE INDEX "published_providers_ratingAvg_idx" ON "published_providers"("ratingAvg");

CREATE INDEX "published_providers_publishedAt_idx" ON "published_providers"("publishedAt");

CREATE UNIQUE INDEX "published_products_productId_key" ON "published_products"("productId");

CREATE INDEX "published_products_providerId_idx" ON "published_products"("providerId");

CREATE INDEX "published_products_pricingVisibility_idx" ON "published_products"("pricingVisibility");

CREATE INDEX "published_products_publishedAt_idx" ON "published_products"("publishedAt");

CREATE INDEX "provider_featured_placements_placement_endsAt_idx" ON "provider_featured_placements"("placement", "endsAt");

CREATE INDEX "provider_daily_stats_providerId_date_idx" ON "provider_daily_stats"("providerId", "date");

CREATE UNIQUE INDEX "provider_daily_stats_providerId_productId_date_key" ON "provider_daily_stats"("providerId", "productId", "date");

CREATE INDEX "SignalProviderDocument_signalProviderId_idx" ON "SignalProviderDocument"("signalProviderId");

ALTER TABLE "PartnerAgreementAcceptance" ADD CONSTRAINT "PartnerAgreementAcceptance_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "PartnerAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "providers" ADD CONSTRAINT "providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_contacts" ADD CONSTRAINT "provider_contacts_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_addresses" ADD CONSTRAINT "provider_addresses_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_social_links" ADD CONSTRAINT "provider_social_links_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_subcategories" ADD CONSTRAINT "provider_subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category_form_sections" ADD CONSTRAINT "category_form_sections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category_form_fields" ADD CONSTRAINT "category_form_fields_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "category_form_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_category_selections" ADD CONSTRAINT "provider_category_selections_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_category_selections" ADD CONSTRAINT "provider_category_selections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_category_details" ADD CONSTRAINT "product_category_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_category_details" ADD CONSTRAINT "product_category_details_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_technical_specs" ADD CONSTRAINT "product_technical_specs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_integrations" ADD CONSTRAINT "product_integrations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_media" ADD CONSTRAINT "product_media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_pricing" ADD CONSTRAINT "product_pricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_team" ADD CONSTRAINT "provider_team_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "team_member_products" ADD CONSTRAINT "team_member_products_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "provider_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "team_member_products" ADD CONSTRAINT "team_member_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_documents" ADD CONSTRAINT "provider_documents_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_verifications" ADD CONSTRAINT "provider_verifications_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_enquiries" ADD CONSTRAINT "provider_enquiries_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_enquiries" ADD CONSTRAINT "provider_enquiries_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "provider_enquiries" ADD CONSTRAINT "provider_enquiries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "provider_enquiries" ADD CONSTRAINT "provider_enquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_review_events" ADD CONSTRAINT "provider_review_events_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "published_providers" ADD CONSTRAINT "published_providers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "published_products" ADD CONSTRAINT "published_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_featured_placements" ADD CONSTRAINT "provider_featured_placements_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_featured_placements" ADD CONSTRAINT "provider_featured_placements_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_daily_stats" ADD CONSTRAINT "provider_daily_stats_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_daily_stats" ADD CONSTRAINT "provider_daily_stats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
