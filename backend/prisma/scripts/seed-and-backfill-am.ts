import { PrismaClient, AmEntityType, AmOnboardingStatus, ApprovalStatus } from '@prisma/client';
import { seedBrokerOptions } from '../seed-options';
import { ALL_AGREEMENT_KEYS, MASTER_TERMS_KEY, calculateAMCompletion, mapLegacyTradingStyle } from '../../src/modules/account-managers/am.utils';

const prisma = new PrismaClient();

const AGREEMENT_DEFINITIONS: Array<{ key: string; title: string; body: string }> = [
  {
    key: 'CLIENT_FUND_PROTECTION',
    title: 'Client Fund Protection Agreement',
    body: `[DRAFT — replace with legal-approved text before launch]
This agreement establishes that client funds must remain strictly under the client's direct custody in segregated accounts with regulated brokerages. The Account Manager holds limited power of attorney strictly for executing trading orders and possesses no authority or technical capability to withdraw, transfer, or encumber client funds.`,
  },
  {
    key: 'TRADER_PROFIT_PROTECTION',
    title: 'Trader Profit Fund Protection Agreement',
    body: `[DRAFT — replace with legal-approved text before launch]
This agreement stipulates the rights and mechanisms protecting the Account Manager's contractual profit share remuneration. It sets forth invoiced payment timelines, settlement cycles, escrow provisions where applicable, and platform mediation protocols in the event of client non-payment of agreed management or performance fees.`,
  },
  {
    key: 'NO_PERSONAL_CONTACT_SHARING',
    title: 'No Personal Contact Sharing Agreement',
    body: `[DRAFT — replace with legal-approved text before launch]
Account Managers and clients agree to conduct all preliminary consultations, performance disclosures, and initial onboarding exclusively through EdutradeFX verified platform messaging. Direct exchange or solicitation of personal emails, private phone numbers, or off-platform payment methods is strictly prohibited and constitutes grounds for immediate delisting.`,
  },
  {
    key: 'CLIENT_FUND_INSURANCE_PROTECTION',
    title: 'Client Fund Insurance Protection Agreement',
    body: `[DRAFT — replace with legal-approved text before launch]
This document clarifies the nature, limits, and statutory backing of any regulatory compensation schemes or brokerage indemnity insurance applicable to client accounts. EdutradeFX does not underwrite trading losses, and Account Managers shall not misrepresent discretionary trading as principal-protected or zero-risk.`,
  },
  {
    key: 'LOSS_RECOVERING',
    title: 'Loss Recovering Agreement',
    body: `[DRAFT — replace with legal-approved text before launch]
This agreement defines the maximum drawdown limits, circuit-breaker rules, and high-water mark recovery mechanisms governing trading operations. In periods of drawdown, performance fees are suspended until the account balance exceeds the high-water mark, adhering to professional fiduciary risk standards.`,
  },
  {
    key: 'PROFIT_SHARING',
    title: 'Profit Sharing Agreement',
    body: `[DRAFT — replace with legal-approved text before launch]
This agreement details the agreed percentage split between client and Account Manager on net realized trading profits during each agreed settlement cycle (Daily, Weekly, or Monthly). Calculation methodology, hurdle rates, and high-water mark computations are specified herein.`,
  },
  {
    key: 'NDA',
    title: 'Non-Disclosure Agreement (NDA) between Client, Trader and EdutradeFX',
    body: `[DRAFT — replace with legal-approved text before launch]
A mutual non-disclosure covenant obligating EdutradeFX, the client, and the Account Manager to preserve the strict confidentiality of trading algorithms, proprietary strategy parameters, account statements, financial balances, and identity data.`,
  },
  {
    key: MASTER_TERMS_KEY,
    title: 'EdutradeFX Platform Terms and Conditions',
    body: `[DRAFT — replace with legal-approved text before launch]
Master Terms and Conditions governing all activities, representations, profile listings, and professional conduct of Account Managers operating on the EdutradeFX directory and marketplace platform.`,
  },
];

async function main() {
  console.log('🚀 Starting Account Manager v2 Seed & Backfill...');

  // 1. Seed Options
  console.log('--- 1. Seeding Options ---');
  await seedBrokerOptions(prisma);
  console.log('✅ Broker & AM Options verified.');

  // 2. Seed Agreements
  console.log('--- 2. Seeding Agreements ---');
  for (const item of AGREEMENT_DEFINITIONS) {
    const existing = await prisma.accountManagerAgreement.findUnique({
      where: { key: item.key },
    });
    if (!existing) {
      await prisma.accountManagerAgreement.create({
        data: {
          key: item.key,
          title: item.title,
          body: item.body,
          version: 1,
          isActive: true,
        },
      });
      console.log(`  + Seeded agreement: ${item.key} (v1)`);
    } else {
      console.log(`  = Agreement already exists: ${item.key} (v${existing.version})`);
    }
  }

  // 3. Backfill Existing Account Managers
  console.log('--- 3. Backfilling Existing Account Managers ---');
  const existingAMs = await prisma.accountManager.findMany({
    include: {
      documents: true,
      agreementAcceptances: true,
    },
  });

  console.log(`Found ${existingAMs.length} existing Account Manager records to inspect.`);

  const gracePeriodDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  for (const am of existingAMs) {
    console.log(`Processing AM ID: ${am.id} (${am.fullName})...`);

    // Backfill tradingStyles from legacy tradingStyle string if not yet populated
    let updatedStyles = am.tradingStyles;
    if (!updatedStyles || updatedStyles.length === 0) {
      updatedStyles = mapLegacyTradingStyle(am.tradingStyle);
      console.log(`  - Mapped legacy style "${am.tradingStyle}" -> [${updatedStyles.join(', ')}]`);
    }

    // Best-effort countryCode and stateCode
    let countryCode = am.countryCode;
    if (!countryCode && am.country) {
      const c = am.country.trim().toUpperCase();
      if (c === 'INDIA' || c === 'IN') countryCode = 'IN';
      else if (c === 'UNITED STATES' || c === 'USA' || c === 'US') countryCode = 'US';
      else if (c === 'UNITED KINGDOM' || c === 'UK' || c === 'GB') countryCode = 'GB';
      else if (c === 'UNITED ARAB EMIRATES' || c === 'UAE' || c === 'AE') countryCode = 'AE';
      else if (c.length === 2) countryCode = c;
      else {
        console.log(`  - [Notice] Unmatched country string: "${am.country}" for AM ${am.id}`);
      }
    }

    // Keep onboardingStatus as SUBMITTED so live managers aren't kicked back to DRAFT
    const onboardingStatus = AmOnboardingStatus.SUBMITTED;

    // Compute completion percent
    const completion = calculateAMCompletion(
      {
        ...am,
        tradingStyles: updatedStyles,
        countryCode: countryCode || am.countryCode,
      },
      am.documents,
      am.agreementAcceptances
    );

    await prisma.accountManager.update({
      where: { id: am.id },
      data: {
        tradingStyles: updatedStyles,
        countryCode: countryCode || am.countryCode,
        onboardingStatus,
        completionPercent: completion.percent,
        profileUpdateRequiredBy: am.profileUpdateRequiredBy || gracePeriodDate,
      },
    });

    console.log(`  ✅ Updated AM ${am.fullName}: onboardingStatus=${onboardingStatus}, completion=${completion.percent}%, missing=${completion.missingFields.length}`);
  }

  // 4. Update existing document docTypes
  const legacyDocs = await prisma.accountManagerDocument.findMany({
    where: {
      docType: { in: ['PROFESSIONAL_CERTIFICATION', 'CREDENTIAL_DOCUMENT'] },
    },
  });
  if (legacyDocs.length > 0) {
    console.log(`Updating ${legacyDocs.length} legacy document types to CERTIFICATE...`);
    await prisma.accountManagerDocument.updateMany({
      where: {
        docType: { in: ['PROFESSIONAL_CERTIFICATION', 'CREDENTIAL_DOCUMENT'] },
      },
      data: {
        docType: 'CERTIFICATE',
      },
    });
    console.log('✅ Legacy document types converted to CERTIFICATE.');
  }

  console.log('🎉 Seed & Backfill completed successfully!');
}

main()
  .catch((err) => {
    console.error('Fatal error during AM seed & backfill:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
