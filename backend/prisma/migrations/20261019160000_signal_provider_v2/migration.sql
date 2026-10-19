-- ==============================================================================
-- Migration: 20261019160000_signal_provider_v2
-- Description: Full Signal Provider Registration, Verification, Profile, Agreements,
--              Plans, and Partner Agreements Generalization.
-- ==============================================================================

-- 1. Enums
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AmOnboardingStatus') THEN
    ALTER TYPE "AmOnboardingStatus" RENAME TO "OnboardingStatus";
  ELSIF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OnboardingStatus') THEN
    CREATE TYPE "OnboardingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUESTED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SpUpdateFrequency') THEN
    CREATE TYPE "SpUpdateFrequency" AS ENUM ('PER_SIGNAL', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SpSubscriptionModel') THEN
    CREATE TYPE "SpSubscriptionModel" AS ENUM ('FREE', 'PAID');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SpPlanPeriod') THEN
    CREATE TYPE "SpPlanPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatementAccountType') THEN
    CREATE TYPE "StatementAccountType" AS ENUM ('LIVE', 'DEMO');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AgreementAudience') THEN
    CREATE TYPE "AgreementAudience" AS ENUM ('ACCOUNT_MANAGER', 'SIGNAL_PROVIDER', 'BROKER', 'ALL');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AgreementKind') THEN
    CREATE TYPE "AgreementKind" AS ENUM ('AGREEMENT', 'COMMITMENT', 'DECLARATION');
  END IF;
END $$;

-- Add new values to BrokerOptionGroup enum if not already present
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'SP_TRADING_STYLE';
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'SP_UPDATE_FREQUENCY';
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'SP_PLAN_PERIOD';

-- 2. PartnerAgreement Table
CREATE TABLE IF NOT EXISTS "PartnerAgreement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "audience" "AgreementAudience" NOT NULL DEFAULT 'ACCOUNT_MANAGER',
    "kind" "AgreementKind" NOT NULL DEFAULT 'AGREEMENT',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerAgreement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PartnerAgreement_audience_key_key" ON "PartnerAgreement"("audience", "key");
CREATE INDEX IF NOT EXISTS "PartnerAgreement_audience_isActive_idx" ON "PartnerAgreement"("audience", "isActive");

-- Copy existing AM agreements if AccountManagerAgreement exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AccountManagerAgreement') THEN
    INSERT INTO "PartnerAgreement" ("id", "key", "audience", "kind", "title", "body", "version", "isActive", "updatedById", "createdAt", "updatedAt")
    SELECT "id", "key", 'ACCOUNT_MANAGER'::"AgreementAudience", 'AGREEMENT'::"AgreementKind", "title", "body", "version", "isActive", "updatedById", "createdAt", "updatedAt"
    FROM "AccountManagerAgreement"
    ON CONFLICT ("audience", "key") DO NOTHING;
  END IF;
END $$;

-- 3. PartnerAgreementAcceptance Table
CREATE TABLE IF NOT EXISTS "PartnerAgreementAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "partnerType" "AgreementAudience" NOT NULL DEFAULT 'ACCOUNT_MANAGER',
    "partnerId" TEXT NOT NULL,
    "agreementKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "agreementId" TEXT,
    "accountManagerId" TEXT,
    "signalProviderId" TEXT,

    CONSTRAINT "PartnerAgreementAcceptance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PartnerAgreementAcceptance_partnerId_agreementKey_version_key" ON "PartnerAgreementAcceptance"("partnerId", "agreementKey", "version");
CREATE INDEX IF NOT EXISTS "PartnerAgreementAcceptance_partnerId_idx" ON "PartnerAgreementAcceptance"("partnerId");
CREATE INDEX IF NOT EXISTS "PartnerAgreementAcceptance_agreementKey_idx" ON "PartnerAgreementAcceptance"("agreementKey");
CREATE INDEX IF NOT EXISTS "PartnerAgreementAcceptance_partnerType_idx" ON "PartnerAgreementAcceptance"("partnerType");

-- Copy existing AM acceptances if AccountManagerAgreementAcceptance exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AccountManagerAgreementAcceptance') THEN
    INSERT INTO "PartnerAgreementAcceptance" ("id", "partnerType", "partnerId", "agreementKey", "version", "acceptedAt", "ipAddress", "userAgent", "accountManagerId")
    SELECT "id", 'ACCOUNT_MANAGER'::"AgreementAudience", "accountManagerId", "agreementKey", "version", "acceptedAt", "ipAddress", "userAgent", "accountManagerId"
    FROM "AccountManagerAgreementAcceptance"
    ON CONFLICT ("partnerId", "agreementKey", "version") DO NOTHING;
  END IF;
END $$;

-- Foreign keys for PartnerAgreementAcceptance
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PartnerAgreementAcceptance_accountManagerId_fkey') THEN
    ALTER TABLE "PartnerAgreementAcceptance"
    ADD CONSTRAINT "PartnerAgreementAcceptance_accountManagerId_fkey"
    FOREIGN KEY ("accountManagerId") REFERENCES "AccountManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Alter SignalProvider
ALTER TABLE "SignalProvider"
ADD COLUMN IF NOT EXISTS "legalFullName" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "residenceCountryCode" TEXT,
ADD COLUMN IF NOT EXISTS "residenceCountry" TEXT,
ADD COLUMN IF NOT EXISTS "yearsTrading" INTEGER,
ADD COLUMN IF NOT EXISTS "tradingStyles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "tradingStyleDescription" TEXT,
ADD COLUMN IF NOT EXISTS "previouslySignalProvider" BOOLEAN,
ADD COLUMN IF NOT EXISTS "previousProviderDetails" TEXT,
ADD COLUMN IF NOT EXISTS "declaredAvgMonthlyReturn" DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS "declaredMaxDrawdown" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "declaredWinRate" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "preferredTimeframes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "maxConsecutiveLosses" INTEGER,
ADD COLUMN IF NOT EXISTS "performancePeriodNote" TEXT,
ADD COLUMN IF NOT EXISTS "maxLeverageUsed" INTEGER,
ADD COLUMN IF NOT EXISTS "riskRewardPreference" TEXT,
ADD COLUMN IF NOT EXISTS "riskRewardValue" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "riskPhilosophy" TEXT,
ADD COLUMN IF NOT EXISTS "usesHedgingOrMartingale" BOOLEAN,
ADD COLUMN IF NOT EXISTS "usesHedging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "usesMartingale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "hedgingMartingaleNotes" TEXT,
ADD COLUMN IF NOT EXISTS "performanceLink" TEXT,
ADD COLUMN IF NOT EXISTS "performanceLinkPlatform" TEXT,
ADD COLUMN IF NOT EXISTS "performanceLinkVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "statementPeriodFrom" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "statementPeriodTo" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "statementAccountType" "StatementAccountType",
ADD COLUMN IF NOT EXISTS "idVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "statementVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "strategyDetail" TEXT,
ADD COLUMN IF NOT EXISTS "specializedExpertise" TEXT,
ADD COLUMN IF NOT EXISTS "marketAdaptation" TEXT,
ADD COLUMN IF NOT EXISTS "uniqueValue" TEXT,
ADD COLUMN IF NOT EXISTS "updateFrequency" "SpUpdateFrequency",
ADD COLUMN IF NOT EXISTS "inquiryHandlingApproach" TEXT,
ADD COLUMN IF NOT EXISTS "offersLiveQA" BOOLEAN,
ADD COLUMN IF NOT EXISTS "liveQAFrequency" TEXT,
ADD COLUMN IF NOT EXISTS "telegramChannelUrl" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionModel" "SpSubscriptionModel",
ADD COLUMN IF NOT EXISTS "declarationAcceptedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reviewedById" TEXT,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "changesRequestedNote" TEXT,
ADD COLUMN IF NOT EXISTS "completionPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "reviewFlags" JSONB,
ADD COLUMN IF NOT EXISTS "publicSnapshot" JSONB,
ADD COLUMN IF NOT EXISTS "profileUpdateRequiredBy" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "SignalProvider_onboardingStatus_idx" ON "SignalProvider"("onboardingStatus");
CREATE INDEX IF NOT EXISTS "SignalProvider_verificationStatus_idx" ON "SignalProvider"("verificationStatus");
CREATE INDEX IF NOT EXISTS "SignalProvider_residenceCountryCode_idx" ON "SignalProvider"("residenceCountryCode");

-- Foreign key for PartnerAgreementAcceptance -> SignalProvider
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PartnerAgreementAcceptance_signalProviderId_fkey') THEN
    ALTER TABLE "PartnerAgreementAcceptance"
    ADD CONSTRAINT "PartnerAgreementAcceptance_signalProviderId_fkey"
    FOREIGN KEY ("signalProviderId") REFERENCES "SignalProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 5. Alter SignalProviderDocument
ALTER TABLE "SignalProviderDocument"
ADD COLUMN IF NOT EXISTS "publicId" TEXT,
ADD COLUMN IF NOT EXISTS "isSensitive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "reviewStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "reviewNote" TEXT,
ADD COLUMN IF NOT EXISTS "periodFrom" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "periodTo" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "SignalProviderDocument_docType_idx" ON "SignalProviderDocument"("docType");
CREATE INDEX IF NOT EXISTS "SignalProviderDocument_reviewStatus_idx" ON "SignalProviderDocument"("reviewStatus");

-- 6. SignalProviderPlan Table
CREATE TABLE IF NOT EXISTS "SignalProviderPlan" (
    "id" TEXT NOT NULL,
    "signalProviderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "period" "SpPlanPeriod" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalProviderPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SignalProviderPlan_signalProviderId_idx" ON "SignalProviderPlan"("signalProviderId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SignalProviderPlan_signalProviderId_fkey') THEN
    ALTER TABLE "SignalProviderPlan"
    ADD CONSTRAINT "SignalProviderPlan_signalProviderId_fkey"
    FOREIGN KEY ("signalProviderId") REFERENCES "SignalProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 7. Backfill & Data Integrity for Existing Signal Providers
-- Set status to SUBMITTED and profileUpdateRequiredBy to +30 days
UPDATE "SignalProvider"
SET
  "onboardingStatus" = 'SUBMITTED',
  "profileUpdateRequiredBy" = NOW() + INTERVAL '30 days',
  "completionPercent" = 30
WHERE "onboardingStatus" = 'DRAFT' AND "displayName" IS NOT NULL;

-- Backfill subscriptionPrice into SignalProviderPlan
INSERT INTO "SignalProviderPlan" ("id", "signalProviderId", "name", "period", "price", "currency", "sortOrder", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  sp.id,
  'Monthly Membership',
  'MONTHLY'::"SpPlanPeriod",
  sp."subscriptionPrice"::numeric(10,2),
  'USD',
  0,
  true,
  NOW(),
  NOW()
FROM "SignalProvider" sp
WHERE sp."subscriptionPrice" IS NOT NULL AND sp."subscriptionPrice" > 0
  AND NOT EXISTS (SELECT 1 FROM "SignalProviderPlan" spp WHERE spp."signalProviderId" = sp.id);

UPDATE "SignalProvider"
SET "subscriptionModel" = CASE
  WHEN "subscriptionPrice" IS NOT NULL AND "subscriptionPrice" > 0 THEN 'PAID'::"SpSubscriptionModel"
  ELSE 'FREE'::"SpSubscriptionModel"
END
WHERE "subscriptionModel" IS NULL;

-- Bug S1 remediation: Revoke verificationStatus from existing providers lacking verified ID and live statements
UPDATE "SignalProvider"
SET "verificationStatus" = false
WHERE "verificationStatus" = true
  AND NOT (
    "idVerified" = true
    AND "statementVerified" = true
    AND "statementAccountType" = 'LIVE'::"StatementAccountType"
  );
