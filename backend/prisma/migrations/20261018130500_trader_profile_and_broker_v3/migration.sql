-- AlterEnum
ALTER TYPE "BrokerBusinessType" ADD VALUE 'HYBRID';
ALTER TYPE "BrokerBusinessType" ADD VALUE 'DMA';

-- AlterEnum
ALTER TYPE "BrokerOptionGroup" ADD VALUE 'COUNTRY';
ALTER TYPE "BrokerOptionGroup" ADD VALUE 'CITY';
ALTER TYPE "BrokerOptionGroup" ADD VALUE 'BUSINESS_MODEL';
ALTER TYPE "BrokerOptionGroup" ADD VALUE 'REGIONAL_FOOTPRINT';
ALTER TYPE "BrokerOptionGroup" ADD VALUE 'SPREAD_FROM';
ALTER TYPE "BrokerOptionGroup" ADD VALUE 'PLATFORM';
ALTER TYPE "BrokerOptionGroup" ADD VALUE 'DEVICE';

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "whatsapp" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "socialLinks" JSONB,
ADD COLUMN "bio" TEXT,
ADD COLUMN "consentAt" TIMESTAMP(3),
ADD COLUMN "consentVersion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_lower_idx" ON "User" (LOWER("email"));

-- CreateTable PendingRegistration
CREATE TABLE "PendingRegistration" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "payload" JSONB,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingRegistration_email_key" ON "PendingRegistration"("email");
CREATE UNIQUE INDEX "PendingRegistration_tokenHash_key" ON "PendingRegistration"("tokenHash");
CREATE INDEX "PendingRegistration_email_idx" ON "PendingRegistration"("email");
CREATE INDEX "PendingRegistration_tokenHash_idx" ON "PendingRegistration"("tokenHash");
CREATE INDEX "PendingRegistration_expiresAt_idx" ON "PendingRegistration"("expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "PendingRegistration_email_lower_idx" ON "PendingRegistration" (LOWER("email"));

-- AlterTable Broker
ALTER TABLE "Broker" ADD COLUMN "ibLink" TEXT,
ADD COLUMN "mapLink" TEXT,
ADD COLUMN "operatingCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "businessModel" "BrokerBusinessType",
ADD COLUMN "liquidityProviders" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "regionalFootprint" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "openAccountClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "promoVideoPublicId" TEXT;

-- Data-migration backfills for Broker
UPDATE "Broker"
SET "businessModel" = "businessType"
WHERE "businessType" IS NOT NULL AND "businessModel" IS NULL;

UPDATE "Broker"
SET "liquidityProviders" = string_to_array("liquidityProvider", ',')
WHERE "liquidityProvider" IS NOT NULL AND ("liquidityProviders" IS NULL OR "liquidityProviders" = ARRAY[]::TEXT[]);

-- Clean TradingView, NinjaTrader, IRESS from availablePlatforms array
UPDATE "Broker"
SET "availablePlatforms" = ARRAY(
  SELECT unnest("availablePlatforms")
  EXCEPT
  SELECT unnest(ARRAY['TradingView', 'NinjaTrader', 'IRESS'])
)
WHERE "availablePlatforms" IS NOT NULL AND "availablePlatforms" != ARRAY[]::TEXT[];

-- Remove removed platform keys from platformLinks JSONB
UPDATE "Broker"
SET "platformLinks" = "platformLinks" - 'TradingView' - 'NinjaTrader' - 'IRESS'
WHERE "platformLinks" IS NOT NULL;

-- AlterTable BrokerAccountGroup
ALTER TABLE "BrokerAccountGroup" ADD COLUMN "gtcEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "baseCurrencies" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill gtcEnabled from gtcMode
UPDATE "BrokerAccountGroup"
SET "gtcEnabled" = true
WHERE "gtcMode" = 'AVAILABLE';

-- Backfill baseCurrencies from currency
UPDATE "BrokerAccountGroup"
SET "baseCurrencies" = ARRAY["currency"]
WHERE "currency" IS NOT NULL AND ("baseCurrencies" IS NULL OR "baseCurrencies" = ARRAY[]::TEXT[]);

-- AlterTable BrokerLead
ALTER TABLE "BrokerLead" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "BrokerLead_brokerId_idx" ON "BrokerLead"("brokerId");
CREATE INDEX "BrokerLead_isRead_idx" ON "BrokerLead"("isRead");
CREATE INDEX "BrokerLead_createdAt_idx" ON "BrokerLead"("createdAt");
