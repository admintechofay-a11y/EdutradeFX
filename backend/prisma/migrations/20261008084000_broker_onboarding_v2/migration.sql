-- CreateEnum
CREATE TYPE "BrokerBusinessType" AS ENUM ('RETAIL', 'ECN', 'STP', 'NDD', 'MARKET_MAKER', 'INSTITUTIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "BrokerOnboardingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUESTED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "BrokerDocType" AS ENUM ('REGULATORY_LICENSE', 'LICENSE_PROOF', 'OFFICE_IMAGE', 'COMMISSION_STRUCTURE', 'SWAP_STRUCTURE', 'PROMO_VIDEO', 'POLICY_CLIENT', 'POLICY_AML', 'POLICY_RISK_DISCLOSURE', 'POLICY_DEPOSIT', 'POLICY_WITHDRAWAL', 'POLICY_TERMS', 'POLICY_IB_REBATE', 'POLICY_SCALPING', 'POLICY_SLIPPAGE_MARKUP', 'POLICY_SERVICE', 'POLICY_SERVER', 'POLICY_OTHER');

-- CreateEnum
CREATE TYPE "SpreadType" AS ENUM ('FLOATING', 'FIXED');

-- CreateEnum
CREATE TYPE "OrderExecution" AS ENUM ('INSTANT', 'REQUEST');

-- CreateEnum
CREATE TYPE "GtcMode" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "IbSettlement" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "accountCurrencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "address" TEXT,
ADD COLUMN     "availablePlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "businessType" "BrokerBusinessType",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "clientLossPercentage" DECIMAL(5,2),
ADD COLUMN     "completenessPct" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "consList" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "country" TEXT,
ADD COLUMN     "countryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deviceSupport" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fundsSecurity" TEXT,
ADD COLUMN     "isRegulated" BOOLEAN,
ADD COLUMN     "languagesSupported" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "liquidityProvider" TEXT,
ADD COLUMN     "mtRegisteredCountryRegion" TEXT,
ADD COLUMN     "negativeBalanceProtection" BOOLEAN,
ADD COLUMN     "officeContactEmail" TEXT,
ADD COLUMN     "officeContactNumber" TEXT,
ADD COLUMN     "onboardingStatus" "BrokerOnboardingStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "personalBookSize" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "platformDescription" TEXT,
ADD COLUMN     "platformLinks" JSONB,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "promoVideoUrl" TEXT,
ADD COLUMN     "prosList" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "registeredName" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "supportAvailability" TEXT,
ADD COLUMN     "supportEmail" TEXT,
ADD COLUMN     "supportPhone" TEXT,
ADD COLUMN     "supportWhatsapp" TEXT,
ADD COLUMN     "totalTradableSymbols" INTEGER;

-- AlterTable
ALTER TABLE "BrokerDocument" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "BrokerDocument" ALTER COLUMN "docType" TYPE "BrokerDocType" USING (
  CASE 
    WHEN "docType" = 'REGULATORY_LICENSE' THEN 'REGULATORY_LICENSE'::"BrokerDocType"
    WHEN "docType" = 'LICENSE_PROOF' THEN 'LICENSE_PROOF'::"BrokerDocType"
    WHEN "docType" = 'OFFICE_IMAGE' THEN 'OFFICE_IMAGE'::"BrokerDocType"
    ELSE 'POLICY_OTHER'::"BrokerDocType"
  END
);
ALTER TABLE "BrokerDocument" ALTER COLUMN "docType" SET DEFAULT 'REGULATORY_LICENSE';

-- CreateTable
CREATE TABLE "BrokerServer" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT,
    "location" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerLicense" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "regulatoryBody" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseStatus" TEXT NOT NULL DEFAULT 'Active',
    "companyAddress" TEXT,
    "licensePdfUrl" TEXT,
    "proofUrl" TEXT,
    "proofLink" TEXT,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerBoardMember" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "experience" TEXT,
    "photoUrl" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerBoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerAccountGroup" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "demoAvailable" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "spreadTypesLabel" TEXT,
    "spreadFrom" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "minDeposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "depositBonusPctUpTo" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "leverageUpTo" TEXT NOT NULL DEFAULT '1:500',
    "leverageNum" INTEGER,
    "minTradeVolume" DECIMAL(8,2) NOT NULL DEFAULT 0.01,
    "hasCommissionPerLot" BOOLEAN NOT NULL DEFAULT false,
    "feesPerLot" DECIMAL(8,2),
    "commissionStructureUrl" TEXT,
    "spreadType" "SpreadType" NOT NULL DEFAULT 'FLOATING',
    "orderTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "swapFree" BOOLEAN NOT NULL DEFAULT false,
    "swapLong" TEXT,
    "swapShort" TEXT,
    "orderExecution" "OrderExecution" NOT NULL DEFAULT 'INSTANT',
    "gtcMode" "GtcMode" NOT NULL DEFAULT 'AVAILABLE',
    "eaAllowed" BOOLEAN NOT NULL DEFAULT true,
    "hedgingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "nettingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "scalpingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "hasSwapCharges" BOOLEAN NOT NULL DEFAULT true,
    "swapStructureUrl" TEXT,
    "slippage" BOOLEAN NOT NULL DEFAULT false,
    "slippagePoints" TEXT,
    "markups" TEXT,
    "forexCommission" JSONB,
    "cryptoCommission" TEXT,
    "commoditiesCommission" TEXT,
    "metalsCommission" TEXT,
    "indexCommission" TEXT,
    "stocksCommission" TEXT,
    "testLogin" TEXT,
    "testPasswordEnc" TEXT,
    "testServer" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerAccountGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerIbPlan" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "accountGroupName" TEXT NOT NULL,
    "settlement" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rebatePerLot" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "levelsUpTo" INTEGER NOT NULL DEFAULT 1,
    "customizable" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerIbPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerDepositMethod" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "charges" TEXT,
    "exchangeRate" TEXT,
    "timeTaken" TEXT,
    "extraFacilities" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerDepositMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerWithdrawalMethod" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "charges" TEXT,
    "exchangeRate" TEXT,
    "timeTaken" TEXT,
    "extraFacilities" TEXT,
    "delayCompensation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerWithdrawalMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerSymbolSpec" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "accountGroupId" TEXT,
    "symbol" TEXT NOT NULL,
    "contractSize" TEXT,
    "digits" INTEGER NOT NULL DEFAULT 5,
    "stopLevel" TEXT,
    "stopOutPct" TEXT,
    "commission" TEXT,
    "spreadType" TEXT,
    "spreadFrom" TEXT,
    "minVolume" DECIMAL(8,2) NOT NULL DEFAULT 0.01,
    "maxVolume" DECIMAL(8,2) NOT NULL DEFAULT 100.00,
    "swapLong" TEXT,
    "swapShort" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerSymbolSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerFundingYear" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "netDepositUsd" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "netWithdrawUsd" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "netLots" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerFundingYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerClientActivity" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "avgNewClientDeposit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgExistingClientDeposit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgNewClientWithdrawal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgExistingClientWithdrawal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerClientActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerBusinessArea" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "countryOrRegion" TEXT NOT NULL,
    "clientsNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerBusinessArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerAward" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "awardFor" TEXT NOT NULL,
    "expo" TEXT,
    "expoLocation" TEXT,
    "expoDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerAward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrokerServer_brokerId_idx" ON "BrokerServer"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerLicense_brokerId_idx" ON "BrokerLicense"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerLicense_regulatoryBody_idx" ON "BrokerLicense"("regulatoryBody");

-- CreateIndex
CREATE INDEX "BrokerLicense_licenseStatus_idx" ON "BrokerLicense"("licenseStatus");

-- CreateIndex
CREATE INDEX "BrokerBoardMember_brokerId_idx" ON "BrokerBoardMember"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerAccountGroup_brokerId_idx" ON "BrokerAccountGroup"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerIbPlan_brokerId_idx" ON "BrokerIbPlan"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerDepositMethod_brokerId_idx" ON "BrokerDepositMethod"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerWithdrawalMethod_brokerId_idx" ON "BrokerWithdrawalMethod"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerSymbolSpec_brokerId_idx" ON "BrokerSymbolSpec"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerSymbolSpec_accountGroupId_idx" ON "BrokerSymbolSpec"("accountGroupId");

-- CreateIndex
CREATE INDEX "BrokerSymbolSpec_symbol_idx" ON "BrokerSymbolSpec"("symbol");

-- CreateIndex
CREATE INDEX "BrokerFundingYear_brokerId_idx" ON "BrokerFundingYear"("brokerId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerFundingYear_brokerId_year_key" ON "BrokerFundingYear"("brokerId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerClientActivity_brokerId_key" ON "BrokerClientActivity"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerClientActivity_brokerId_idx" ON "BrokerClientActivity"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerBusinessArea_brokerId_idx" ON "BrokerBusinessArea"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerAward_brokerId_idx" ON "BrokerAward"("brokerId");

-- CreateIndex
CREATE INDEX "Broker_isRegulated_idx" ON "Broker"("isRegulated");

-- CreateIndex
CREATE INDEX "Broker_businessType_idx" ON "Broker"("businessType");

-- CreateIndex
CREATE INDEX "Broker_country_idx" ON "Broker"("country");

-- CreateIndex
CREATE INDEX "Broker_onboardingStatus_idx" ON "Broker"("onboardingStatus");

-- CreateIndex
CREATE INDEX "BrokerDocument_brokerId_idx" ON "BrokerDocument"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerDocument_docType_idx" ON "BrokerDocument"("docType");

-- AddForeignKey
ALTER TABLE "BrokerServer" ADD CONSTRAINT "BrokerServer_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerLicense" ADD CONSTRAINT "BrokerLicense_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerBoardMember" ADD CONSTRAINT "BrokerBoardMember_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerAccountGroup" ADD CONSTRAINT "BrokerAccountGroup_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerIbPlan" ADD CONSTRAINT "BrokerIbPlan_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerDepositMethod" ADD CONSTRAINT "BrokerDepositMethod_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerWithdrawalMethod" ADD CONSTRAINT "BrokerWithdrawalMethod_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerSymbolSpec" ADD CONSTRAINT "BrokerSymbolSpec_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerSymbolSpec" ADD CONSTRAINT "BrokerSymbolSpec_accountGroupId_fkey" FOREIGN KEY ("accountGroupId") REFERENCES "BrokerAccountGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerFundingYear" ADD CONSTRAINT "BrokerFundingYear_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerClientActivity" ADD CONSTRAINT "BrokerClientActivity_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerBusinessArea" ADD CONSTRAINT "BrokerBusinessArea_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerAward" ADD CONSTRAINT "BrokerAward_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

