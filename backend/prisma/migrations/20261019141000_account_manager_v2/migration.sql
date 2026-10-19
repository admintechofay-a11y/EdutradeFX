-- CreateEnum
CREATE TYPE "AmEntityType" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- CreateEnum
CREATE TYPE "AmOnboardingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "SettlementCycle" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RiskTolerance" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- AlterEnum
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'INSTRUMENT';
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'AM_TRADING_STYLE';
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'AM_PLATFORM';
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'AM_BROKER_TYPE';
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'AM_RISK_TOLERANCE';
ALTER TYPE "BrokerOptionGroup" ADD VALUE IF NOT EXISTS 'AM_SETTLEMENT_CYCLE';

-- AlterTable
ALTER TABLE "AccountManager" 
ADD COLUMN IF NOT EXISTS "entityType" "AmEntityType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN IF NOT EXISTS "companyLegalName" TEXT,
ADD COLUMN IF NOT EXISTS "companyRegistrationNumber" TEXT,
ADD COLUMN IF NOT EXISTS "incorporationCountry" TEXT,
ADD COLUMN IF NOT EXISTS "companyWebsite" TEXT,
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "stateRegion" TEXT,
ADD COLUMN IF NOT EXISTS "stateCode" TEXT,
ADD COLUMN IF NOT EXISTS "countryCode" TEXT,
ADD COLUMN IF NOT EXISTS "zipCode" TEXT,
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "socialLinks" JSONB,
ADD COLUMN IF NOT EXISTS "socialLinksPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isRegulated" BOOLEAN,
ADD COLUMN IF NOT EXISTS "regulatorName" TEXT,
ADD COLUMN IF NOT EXISTS "regulatorRegistrationNumber" TEXT,
ADD COLUMN IF NOT EXISTS "regulatorCountry" TEXT,
ADD COLUMN IF NOT EXISTS "regulatoryVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "speciality" TEXT,
ADD COLUMN IF NOT EXISTS "marketEventExperience" TEXT,
ADD COLUMN IF NOT EXISTS "preferredInstruments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "tradingStyles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "accuracyLevel" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "accuracyPeriodNote" TEXT,
ADD COLUMN IF NOT EXISTS "preferredPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "otherPlatformName" TEXT,
ADD COLUMN IF NOT EXISTS "preferredBrokerTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "indicators" TEXT,
ADD COLUMN IF NOT EXISTS "signals" TEXT,
ADD COLUMN IF NOT EXISTS "fundamentals" TEXT,
ADD COLUMN IF NOT EXISTS "technical" TEXT,
ADD COLUMN IF NOT EXISTS "newsTrade" TEXT,
ADD COLUMN IF NOT EXISTS "riskRewardRatio" TEXT,
ADD COLUMN IF NOT EXISTS "riskRewardValue" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "riskTolerance" "RiskTolerance",
ADD COLUMN IF NOT EXISTS "lossPerTradePercent" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "dailyTrades" INTEGER,
ADD COLUMN IF NOT EXISTS "dailyLots" DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS "dailyStopLossPoints" INTEGER,
ADD COLUMN IF NOT EXISTS "dailyTakeProfitPoints" INTEGER,
ADD COLUMN IF NOT EXISTS "favouriteTimeframe" TEXT,
ADD COLUMN IF NOT EXISTS "tradingTimeFrom" TEXT,
ADD COLUMN IF NOT EXISTS "tradingTimeTo" TEXT,
ADD COLUMN IF NOT EXISTS "lossRecoveryStrategy" TEXT,
ADD COLUMN IF NOT EXISTS "settlementCycle" "SettlementCycle",
ADD COLUMN IF NOT EXISTS "clientFundSecurity" TEXT,
ADD COLUMN IF NOT EXISTS "recommendsBroker" BOOLEAN,
ADD COLUMN IF NOT EXISTS "recommendedBrokerId" TEXT,
ADD COLUMN IF NOT EXISTS "recommendedBrokerName" TEXT,
ADD COLUMN IF NOT EXISTS "recommendedBrokerPlatform" TEXT,
ADD COLUMN IF NOT EXISTS "profitSharingPercent" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "lossSharingPercent" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "onboardingStatus" "AmOnboardingStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reviewedById" TEXT,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "changesRequestedNote" TEXT,
ADD COLUMN IF NOT EXISTS "completionPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "profileUpdateRequiredBy" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "publicSnapshot" JSONB;

-- AlterTable AccountManagerDocument
ALTER TABLE "AccountManagerDocument"
ADD COLUMN IF NOT EXISTS "publicId" TEXT,
ADD COLUMN IF NOT EXISTS "caption" TEXT,
ADD COLUMN IF NOT EXISTS "periodNote" TEXT,
ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "reviewStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable AccountManagerAgreement
CREATE TABLE IF NOT EXISTS "AccountManagerAgreement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountManagerAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable AccountManagerAgreementAcceptance
CREATE TABLE IF NOT EXISTS "AccountManagerAgreementAcceptance" (
    "id" TEXT NOT NULL,
    "accountManagerId" TEXT NOT NULL,
    "agreementKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AccountManagerAgreementAcceptance_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "AccountManagerAgreement_key_key" ON "AccountManagerAgreement"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountManagerAgreementAcceptance_accountManagerId_agreementKey_version_key" 
ON "AccountManagerAgreementAcceptance"("accountManagerId", "agreementKey", "version");

-- Indexes
CREATE INDEX IF NOT EXISTS "AccountManager_onboardingStatus_idx" ON "AccountManager"("onboardingStatus");
CREATE INDEX IF NOT EXISTS "AccountManager_countryCode_idx" ON "AccountManager"("countryCode");
CREATE INDEX IF NOT EXISTS "AccountManager_riskTolerance_idx" ON "AccountManager"("riskTolerance");
CREATE INDEX IF NOT EXISTS "AccountManager_settlementCycle_idx" ON "AccountManager"("settlementCycle");
CREATE INDEX IF NOT EXISTS "AccountManager_recommendedBrokerId_idx" ON "AccountManager"("recommendedBrokerId");

CREATE INDEX IF NOT EXISTS "AccountManagerDocument_accountManagerId_idx" ON "AccountManagerDocument"("accountManagerId");
CREATE INDEX IF NOT EXISTS "AccountManagerDocument_docType_idx" ON "AccountManagerDocument"("docType");
CREATE INDEX IF NOT EXISTS "AccountManagerDocument_reviewStatus_idx" ON "AccountManagerDocument"("reviewStatus");

CREATE INDEX IF NOT EXISTS "AccountManagerAgreementAcceptance_accountManagerId_idx" ON "AccountManagerAgreementAcceptance"("accountManagerId");
CREATE INDEX IF NOT EXISTS "AccountManagerAgreementAcceptance_agreementKey_idx" ON "AccountManagerAgreementAcceptance"("agreementKey");

-- Foreign Keys
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AccountManager_recommendedBrokerId_fkey'
    ) THEN
        ALTER TABLE "AccountManager" ADD CONSTRAINT "AccountManager_recommendedBrokerId_fkey" 
        FOREIGN KEY ("recommendedBrokerId") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AccountManagerAgreementAcceptance_accountManagerId_fkey'
    ) THEN
        ALTER TABLE "AccountManagerAgreementAcceptance" ADD CONSTRAINT "AccountManagerAgreementAcceptance_accountManagerId_fkey" 
        FOREIGN KEY ("accountManagerId") REFERENCES "AccountManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AccountManagerAgreementAcceptance_agreementKey_fkey'
    ) THEN
        ALTER TABLE "AccountManagerAgreementAcceptance" ADD CONSTRAINT "AccountManagerAgreementAcceptance_agreementKey_fkey" 
        FOREIGN KEY ("agreementKey") REFERENCES "AccountManagerAgreement"("key") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
