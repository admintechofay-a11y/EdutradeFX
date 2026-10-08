import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import {
  ApprovalStatus,
  BrokerBusinessType,
  BrokerDocType,
  BrokerOnboardingStatus,
  GtcMode,
  IbSettlement,
  NotificationType,
  OrderExecution,
  Prisma,
  Role,
  SpreadType,
} from '@prisma/client';
import { transporter } from '../../config/email';
import { sectionSchemas, WizardSectionKey } from './broker.schemas';
import { encryptBrokerCredential } from '../../utils/crypto.utils';

// ─── Explicit Public DTO Projection (Zero Leaks) ───────
export const publicBrokerSelect = {
  id: true,
  companyName: true,
  registeredName: true,
  slug: true,
  logo: true,
  website: true,
  description: true,
  platformDescription: true,
  yearFounded: true,
  headquarters: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  phone: true,
  email: true,
  mtRegisteredCountryRegion: true,
  isRegulated: true,
  totalTradableSymbols: true,
  accountCurrencies: true,
  negativeBalanceProtection: true,
  availablePlatforms: true,
  platformLinks: true,
  deviceSupport: true,
  availableTimeframes: true,
  businessType: true,
  officeContactNumber: true,
  officeContactEmail: true,
  countryRestrictions: true,
  supportPhone: true,
  supportWhatsapp: true,
  supportEmail: true,
  supportAvailability: true,
  languagesSupported: true,
  fundsSecurity: true,
  liquidityProvider: true,
  personalBookSize: true,
  prosList: true,
  consList: true,
  promoVideoUrl: true,
  socialLinks: true,
  avgRating: true,
  totalReviews: true,
  totalLeads: true,
  status: true,
  isFeatured: true,
  isPremium: true,
  featuredUntil: true,
  seoTitle: true,
  seoDescription: true,
  // Denormalized caches
  regulation: true,
  tradingPlatforms: true,
  accountTypes: true,
  minDeposit: true,
  maxLeverage: true,
  spreadsFrom: true,
  commissions: true,
  executionType: true,
  depositMethods: true,
  withdrawMethods: true,
  instruments: true,
  countries: true,
  completenessPct: true,
  createdAt: true,
  updatedAt: true,
  // Child tables (Publicly safe projection, ordered by sortOrder)
  licenses: {
    select: {
      id: true,
      regulatoryBody: true,
      regulatorCode: true,
      regulatorOther: true,
      licenseNumber: true,
      licenseStatus: true,
      companyAddress: true,
      proofLink: true,
      verifiedByAdmin: true,
      verifiedAt: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  servers: {
    select: {
      id: true,
      name: true,
      location: true,
      sortOrder: true,
      // ip excluded (Private)
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  boardMembers: {
    select: {
      id: true,
      name: true,
      designation: true,
      experience: true,
      photoUrl: true,
      description: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  accountGroups: {
    select: {
      id: true,
      name: true,
      demoAvailable: true,
      currency: true,
      currencyCode: true,
      currencyOther: true,
      spreadTypesLabel: true,
      spreadFrom: true,
      minDeposit: true,
      depositBonusPctUpTo: true,
      depositBonusCode: true,
      depositBonusNum: true,
      leverageUpTo: true,
      leverageCode: true,
      leverageNum: true,
      minTradeVolume: true,
      hasCommissionPerLot: true,
      feesPerLot: true,
      commissionStructureUrl: true,
      spreadType: true,
      orderTypes: true,
      swapFree: true,
      swapLong: true,
      swapShort: true,
      orderExecution: true,
      gtcMode: true,
      eaAllowed: true,
      hedgingAllowed: true,
      nettingAllowed: true,
      scalpingAllowed: true,
      hasSwapCharges: true,
      swapStructureUrl: true,
      slippage: true,
      slippagePoints: true,
      markups: true,
      forexCommission: true,
      cryptoCommission: true,
      commoditiesCommission: true,
      metalsCommission: true,
      indexCommission: true,
      stocksCommission: true,
      sortOrder: true,
      // testLogin, testPasswordEnc, testServer excluded (Private)
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  ibPlans: {
    select: {
      id: true,
      accountGroupName: true,
      settlement: true,
      rebatePerLot: true,
      levelsUpTo: true,
      customizable: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  depositMethodItems: {
    select: {
      id: true,
      method: true,
      charges: true,
      exchangeRate: true,
      timeTaken: true,
      extraFacilities: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  withdrawalMethodItems: {
    select: {
      id: true,
      method: true,
      charges: true,
      exchangeRate: true,
      timeTaken: true,
      extraFacilities: true,
      delayCompensation: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  symbolSpecs: {
    select: {
      id: true,
      accountGroupId: true,
      symbol: true,
      contractSize: true,
      digits: true,
      stopLevel: true,
      stopOutPct: true,
      commission: true,
      spreadType: true,
      spreadFrom: true,
      minVolume: true,
      maxVolume: true,
      swapLong: true,
      swapShort: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  awards: {
    select: {
      id: true,
      year: true,
      awardFor: true,
      expo: true,
      expoLocation: true,
      expoDate: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  documents: {
    where: { isPrivate: false },
    select: {
      id: true,
      fileUrl: true,
      fileName: true,
      fileType: true,
      docType: true,
      createdAt: true,
    },
  },
};

/**
 * Recomputes denormalized summary fields and profile completeness %
 */
export async function recomputeBrokerSummary(brokerId: string, tx: Prisma.TransactionClient = prisma) {
  const broker = await tx.broker.findUnique({
    where: { id: brokerId },
    include: {
      licenses: true,
      accountGroups: true,
      depositMethodItems: true,
      withdrawalMethodItems: true,
      documents: true,
      servers: true,
      boardMembers: true,
      symbolSpecs: true,
      ibPlans: true,
      fundingYears: true,
      clientActivity: true,
      businessAreas: true,
      awards: true,
    },
  });

  if (!broker) return null;

  // 1. Regulations
  const regulation = Array.from(new Set(broker.licenses.map((l) => l.regulatoryBody).filter(Boolean)));

  // 2. Trading Platforms
  const tradingPlatforms = broker.availablePlatforms.length > 0 ? broker.availablePlatforms : ['MetaTrader 4', 'MetaTrader 5'];

  // 3. Account Types
  const accountTypes = broker.accountGroups.map((g) => g.name).filter(Boolean);

  // 4. Min Deposit
  const deposits = broker.accountGroups.map((g) => Number(g.minDeposit)).filter((d) => !isNaN(d));
  const minDeposit = deposits.length > 0 ? Math.min(...deposits) : broker.minDeposit ?? 0;

  // 5. Max Leverage
  let maxLeverage = broker.maxLeverage || '1:500';
  if (broker.accountGroups.length > 0) {
    const highestGroup = [...broker.accountGroups].sort((a, b) => (b.leverageNum || 0) - (a.leverageNum || 0))[0];
    if (highestGroup && highestGroup.leverageUpTo) {
      maxLeverage = highestGroup.leverageUpTo;
    }
  }

  // 6. Spreads From
  let spreadsFrom = broker.spreadsFrom || 'From 0.0 pips';
  if (broker.accountGroups.length > 0) {
    const validSpreads = broker.accountGroups.map((g) => Number(g.spreadFrom)).filter((s) => !isNaN(s));
    if (validSpreads.length > 0) {
      const minSpread = Math.min(...validSpreads);
      spreadsFrom = `From ${minSpread} pips`;
    }
  }

  // 7. Commissions
  let commissions = broker.commissions || '$0 / Zero Commission';
  if (broker.accountGroups.length > 0) {
    const commissionGroups = broker.accountGroups.filter((g) => g.hasCommissionPerLot && g.feesPerLot);
    if (commissionGroups.length > 0) {
      commissions = `$${commissionGroups[0].feesPerLot} per lot`;
    } else {
      commissions = '$0 / Zero Commission';
    }
  }

  // 8. Execution Type
  let executionType = broker.executionType || 'ECN / STP';
  if (broker.accountGroups.length > 0) {
    const executions = broker.accountGroups.map((g) => g.orderExecution);
    if (executions.includes('INSTANT')) {
      executionType = 'Instant / STP';
    } else {
      executionType = 'Market Execution';
    }
  }

  // 9. Deposit & Withdrawal Methods
  const depositMethods = broker.depositMethodItems.map((d) => d.method).filter(Boolean);
  const withdrawMethods = broker.withdrawalMethodItems.map((w) => w.method).filter(Boolean);

  // 10. Instruments
  let instruments = broker.instruments;
  if (!instruments || instruments.length === 0) {
    instruments = ['Forex (60+ pairs)', 'Indices', 'Commodities', 'Metals', 'Cryptos'];
  }

  // 11. Supported countries
  const countries = broker.country ? [broker.country] : broker.countries;

  // 12. Calculate Completeness % across 18 wizard sections:
  let score = 0;
  const totalSections = 18;

  if (broker.companyName && broker.country && broker.city && broker.email && broker.website) score++;
  if (broker.availablePlatforms.length > 0 || broker.servers.length > 0) score++;
  if (broker.isRegulated === false || (broker.isRegulated && broker.licenses.length > 0)) score++;
  if (broker.boardMembers.length > 0 || broker.headquarters) score++;
  if (broker.supportEmail || broker.supportPhone || broker.supportWhatsapp) score++;
  if (broker.fundsSecurity || broker.clientLossPercentage !== null) score++;
  if (broker.accountGroups.length > 0) score++;
  if (broker.ibPlans.length > 0) score++;
  if (broker.depositMethodItems.length > 0) score++;
  if (broker.withdrawalMethodItems.length > 0) score++;
  if (broker.symbolSpecs.length > 0) score++;
  if (broker.liquidityProvider || broker.personalBookSize) score++;
  if (broker.businessAreas.length > 0) score++;
  if (broker.fundingYears.length > 0) score++;
  if (broker.clientActivity) score++;
  if (broker.prosList.length > 0 || broker.consList.length > 0) score++;
  if (broker.awards.length > 0) score++;
  if (broker.documents.length >= 3) score++;

  const completenessPct = Math.min(100, Math.round((score / totalSections) * 100));

  return await tx.broker.update({
    where: { id: brokerId },
    data: {
      regulation,
      tradingPlatforms,
      accountTypes,
      minDeposit,
      maxLeverage,
      spreadsFrom,
      commissions,
      executionType,
      depositMethods,
      withdrawMethods,
      instruments,
      countries,
      completenessPct,
    },
  });
}

export class BrokerService {
  /**
   * Helper to ensure broker record exists for user
   */
  async getOrCreateBrokerStub(userId: string) {
    let broker = await prisma.broker.findUnique({ where: { userId } });
    if (!broker) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);
      const slug = await generateUniqueSlug(user.name || 'broker', 'broker');
      broker = await prisma.broker.create({
        data: {
          userId,
          companyName: user.name || 'New Broker',
          slug,
          status: ApprovalStatus.PENDING,
          onboardingStatus: BrokerOnboardingStatus.DRAFT,
        },
      });
    }
    return broker;
  }

  /**
   * Retrieve full onboarding draft for authenticated broker
   */
  async getMyOnboarding(userId: string) {
    const broker = await this.getOrCreateBrokerStub(userId);

    const fullDraft = await prisma.broker.findUnique({
      where: { id: broker.id },
      include: {
        licenses: { orderBy: { sortOrder: 'asc' } },
        servers: { orderBy: { sortOrder: 'asc' } },
        boardMembers: { orderBy: { sortOrder: 'asc' } },
        accountGroups: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            demoAvailable: true,
            currency: true,
            currencyCode: true,
            currencyOther: true,
            spreadTypesLabel: true,
            spreadFrom: true,
            minDeposit: true,
            depositBonusPctUpTo: true,
            depositBonusCode: true,
            depositBonusNum: true,
            leverageUpTo: true,
            leverageCode: true,
            leverageNum: true,
            minTradeVolume: true,
            hasCommissionPerLot: true,
            feesPerLot: true,
            commissionStructureUrl: true,
            spreadType: true,
            orderTypes: true,
            swapFree: true,
            swapLong: true,
            swapShort: true,
            orderExecution: true,
            gtcMode: true,
            eaAllowed: true,
            hedgingAllowed: true,
            nettingAllowed: true,
            scalpingAllowed: true,
            hasSwapCharges: true,
            swapStructureUrl: true,
            slippage: true,
            slippagePoints: true,
            markups: true,
            forexCommission: true,
            cryptoCommission: true,
            commoditiesCommission: true,
            metalsCommission: true,
            indexCommission: true,
            stocksCommission: true,
            testLogin: true,
            testServer: true,
            // Do not send encrypted password ciphertext in plain response; indicate presence
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        ibPlans: { orderBy: { sortOrder: 'asc' } },
        depositMethodItems: { orderBy: { sortOrder: 'asc' } },
        withdrawalMethodItems: { orderBy: { sortOrder: 'asc' } },
        symbolSpecs: { orderBy: { sortOrder: 'asc' } },
        fundingYears: { orderBy: { sortOrder: 'asc' } },
        clientActivity: true,
        businessAreas: { orderBy: { sortOrder: 'asc' } },
        awards: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    return fullDraft;
  }

  /**
   * Save a single onboarding section draft
   */
  async updateOnboardingSection(userId: string, section: WizardSectionKey, payload: any) {
    const broker = await this.getOrCreateBrokerStub(userId);

    // Block edits if profile is SUBMITTED and not CHANGES_REQUESTED
    if (
      broker.onboardingStatus === BrokerOnboardingStatus.SUBMITTED &&
      broker.status === ApprovalStatus.PENDING
    ) {
      throw new AppError(
        'Your application has been submitted and is under compliance audit. Edits are disabled until an administrator requests changes.',
        StatusCodes.FORBIDDEN
      );
    }

    const validator = sectionSchemas[section];
    if (!validator) {
      throw new AppError(`Unknown onboarding section: ${section}`, StatusCodes.BAD_REQUEST);
    }

    const validated: any = validator.parse(payload);

    await prisma.$transaction(
      async (tx) => {
        switch (section) {
        case 'general': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              registeredName: validated.registeredName,
              companyName: validated.companyName,
              businessType: validated.businessType,
              address: validated.address,
              city: validated.city,
              state: validated.state,
              postalCode: validated.postalCode,
              country: validated.country,
              website: validated.website,
              phone: validated.phone,
              email: validated.email,
              yearFounded: validated.yearFounded,
              mtRegisteredCountryRegion: validated.mtRegisteredCountryRegion,
              isRegulated: validated.isRegulated,
              totalTradableSymbols: validated.totalTradableSymbols,
              accountCurrencies: validated.accountCurrencies,
              negativeBalanceProtection: validated.negativeBalanceProtection,
            },
          });
          break;
        }

        case 'devices-servers': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              platformDescription: validated.platformDescription,
              availablePlatforms: validated.availablePlatforms,
              platformLinks: validated.platformLinks || Prisma.DbNull,
              deviceSupport: validated.deviceSupport,
            },
          });
          // Replace servers
          await tx.brokerServer.deleteMany({ where: { brokerId: broker.id } });
          if (validated.servers && validated.servers.length > 0) {
            await tx.brokerServer.createMany({
              data: validated.servers.map((s: any, idx: number) => ({
                brokerId: broker.id,
                name: s.name,
                ip: s.ip || null,
                location: s.location || null,
                sortOrder: s.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'regulatory': {
          await tx.broker.update({
            where: { id: broker.id },
            data: { isRegulated: validated.isRegulated },
          });
          // Replace licenses
          await tx.brokerLicense.deleteMany({ where: { brokerId: broker.id } });
          if (validated.licenses && validated.licenses.length > 0) {
            await tx.brokerLicense.createMany({
              data: validated.licenses.map((l: any, idx: number) => ({
                brokerId: broker.id,
                regulatoryBody: l.regulatoryBody,
                regulatorCode: l.regulatorCode || null,
                regulatorOther: l.regulatorOther || null,
                licenseNumber: l.licenseNumber,
                licenseStatus: l.licenseStatus || 'Active',
                companyAddress: l.companyAddress || null,
                licensePdfUrl: l.licensePdfUrl || null,
                proofUrl: l.proofUrl || null,
                proofLink: l.proofLink || null,
                sortOrder: l.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'board': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              headquarters: validated.headquarters,
              officeContactNumber: validated.officeContactNumber,
              officeContactEmail: validated.officeContactEmail,
            },
          });
          await tx.brokerBoardMember.deleteMany({ where: { brokerId: broker.id } });
          if (validated.boardMembers && validated.boardMembers.length > 0) {
            await tx.brokerBoardMember.createMany({
              data: validated.boardMembers.map((m: any, idx: number) => ({
                brokerId: broker.id,
                name: m.name,
                designation: m.designation,
                experience: m.experience || null,
                photoUrl: m.photoUrl || null,
                description: m.description || null,
                sortOrder: m.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'support':
        case 'services': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              countryRestrictions: validated.countryRestrictions,
              supportPhone: validated.supportPhone,
              supportWhatsapp: validated.supportWhatsapp,
              supportEmail: validated.supportEmail,
              supportAvailability: validated.supportAvailability,
              languagesSupported: validated.languagesSupported,
              availableTimeframes: validated.availableTimeframes || [],
            },
          });
          break;
        }

        case 'funds-loss':
        case 'security': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              clientLossPercentage: validated.clientLossPercentage !== null && validated.clientLossPercentage !== undefined
                ? new Prisma.Decimal(validated.clientLossPercentage)
                : null,
              fundsSecurity: validated.fundsSecurity,
            },
          });
          break;
        }

        case 'account-groups': {
          await tx.brokerAccountGroup.deleteMany({ where: { brokerId: broker.id } });
          for (let i = 0; i < validated.accountGroups.length; i++) {
            const g = validated.accountGroups[i];
            const testPasswordEnc = g.testPassword ? encryptBrokerCredential(g.testPassword) : null;
            // Parse leverage numeric if format is "1:500"
            let leverageNum: number | null = g.leverageNum ?? null;
            if (leverageNum === null && g.leverageUpTo && g.leverageUpTo.includes(':')) {
              const numPart = parseInt(g.leverageUpTo.split(':')[1], 10);
              if (!isNaN(numPart)) leverageNum = numPart;
            }

            await tx.brokerAccountGroup.create({
              data: {
                brokerId: broker.id,
                name: g.name,
                demoAvailable: g.demoAvailable,
                currency: g.currency || 'USD',
                currencyCode: g.currencyCode || null,
                currencyOther: g.currencyOther || null,
                spreadTypesLabel: g.spreadTypesLabel,
                spreadFrom: new Prisma.Decimal(g.spreadFrom || 0),
                minDeposit: new Prisma.Decimal(g.minDeposit || 0),
                depositBonusPctUpTo: new Prisma.Decimal(g.depositBonusPctUpTo || 0),
                depositBonusCode: g.depositBonusCode || null,
                depositBonusNum: g.depositBonusNum !== undefined && g.depositBonusNum !== null ? g.depositBonusNum : null,
                leverageUpTo: g.leverageUpTo || '1:500',
                leverageCode: g.leverageCode || null,
                leverageNum,
                minTradeVolume: new Prisma.Decimal(g.minTradeVolume || 0.01),
                hasCommissionPerLot: g.hasCommissionPerLot,
                feesPerLot: g.feesPerLot ? new Prisma.Decimal(g.feesPerLot) : null,
                commissionStructureUrl: g.commissionStructureUrl,
                spreadType: g.spreadType,
                orderTypes: g.orderTypes,
                swapFree: g.swapFree,
                swapLong: g.swapLong,
                swapShort: g.swapShort,
                orderExecution: g.orderExecution,
                gtcMode: g.gtcMode,
                eaAllowed: g.eaAllowed,
                hedgingAllowed: g.hedgingAllowed,
                nettingAllowed: g.nettingAllowed,
                scalpingAllowed: g.scalpingAllowed,
                hasSwapCharges: g.hasSwapCharges,
                swapStructureUrl: g.swapStructureUrl,
                slippage: g.slippage,
                slippagePoints: g.slippagePoints,
                markups: g.markups,
                forexCommission: g.forexCommission ? g.forexCommission : Prisma.DbNull,
                cryptoCommission: g.cryptoCommission,
                commoditiesCommission: g.commoditiesCommission,
                metalsCommission: g.metalsCommission,
                indexCommission: g.indexCommission,
                stocksCommission: g.stocksCommission,
                testLogin: g.testLogin || null,
                testPasswordEnc,
                testServer: g.testServer || null,
                sortOrder: g.sortOrder ?? i,
              },
            });
          }
          break;
        }

        case 'ib-program':
        case 'ib': {
          await tx.brokerIbPlan.deleteMany({ where: { brokerId: broker.id } });
          if (validated.ibPlans && validated.ibPlans.length > 0) {
            await tx.brokerIbPlan.createMany({
              data: validated.ibPlans.map((p: any, idx: number) => ({
                brokerId: broker.id,
                accountGroupName: p.accountGroupName,
                settlement: p.settlement,
                rebatePerLot: new Prisma.Decimal(p.rebatePerLot || 0),
                levelsUpTo: p.levelsUpTo || 1,
                customizable: p.customizable || false,
                sortOrder: p.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'deposit-methods':
        case 'deposits': {
          await tx.brokerDepositMethod.deleteMany({ where: { brokerId: broker.id } });
          if (validated.depositMethods && validated.depositMethods.length > 0) {
            await tx.brokerDepositMethod.createMany({
              data: validated.depositMethods.map((d: any, idx: number) => ({
                brokerId: broker.id,
                method: d.method,
                charges: d.charges,
                exchangeRate: d.exchangeRate,
                timeTaken: d.timeTaken,
                extraFacilities: d.extraFacilities,
                sortOrder: d.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'withdrawal-methods':
        case 'withdrawals': {
          await tx.brokerWithdrawalMethod.deleteMany({ where: { brokerId: broker.id } });
          if (validated.withdrawalMethods && validated.withdrawalMethods.length > 0) {
            await tx.brokerWithdrawalMethod.createMany({
              data: validated.withdrawalMethods.map((w: any, idx: number) => ({
                brokerId: broker.id,
                method: w.method,
                charges: w.charges,
                exchangeRate: w.exchangeRate,
                timeTaken: w.timeTaken,
                extraFacilities: w.extraFacilities,
                delayCompensation: w.delayCompensation,
                sortOrder: w.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'symbol-specs':
        case 'symbols': {
          await tx.brokerSymbolSpec.deleteMany({ where: { brokerId: broker.id } });
          if (validated.symbolSpecs && validated.symbolSpecs.length > 0) {
            await tx.brokerSymbolSpec.createMany({
              data: validated.symbolSpecs.map((s: any, idx: number) => ({
                brokerId: broker.id,
                accountGroupId: s.accountGroupId || null,
                symbol: s.symbol,
                contractSize: s.contractSize,
                digits: s.digits ?? 5,
                stopLevel: s.stopLevel,
                stopOutPct: s.stopOutPct,
                commission: s.commission,
                spreadType: s.spreadType,
                spreadFrom: s.spreadFrom,
                minVolume: new Prisma.Decimal(s.minVolume || 0.01),
                maxVolume: new Prisma.Decimal(s.maxVolume || 100),
                swapLong: s.swapLong,
                swapShort: s.swapShort,
                sortOrder: s.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'dealing': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              liquidityProvider: validated.liquidityProvider,
              personalBookSize: validated.personalBookSize,
            },
          });
          break;
        }

        case 'business-areas': {
          await tx.brokerBusinessArea.deleteMany({ where: { brokerId: broker.id } });
          if (validated.businessAreas && validated.businessAreas.length > 0) {
            await tx.brokerBusinessArea.createMany({
              data: validated.businessAreas.map((b: any, idx: number) => ({
                brokerId: broker.id,
                countryOrRegion: b.countryOrRegion,
                clientsNote: b.clientsNote,
                sortOrder: b.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'funding': {
          await tx.brokerFundingYear.deleteMany({ where: { brokerId: broker.id } });
          if (validated.fundingYears && validated.fundingYears.length > 0) {
            await tx.brokerFundingYear.createMany({
              data: validated.fundingYears.map((f: any, idx: number) => ({
                brokerId: broker.id,
                year: f.year,
                netDepositUsd: new Prisma.Decimal(f.netDepositUsd || 0),
                netWithdrawUsd: new Prisma.Decimal(f.netWithdrawUsd || 0),
                netLots: new Prisma.Decimal(f.netLots || 0),
                sortOrder: f.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'activity': {
          await tx.brokerClientActivity.upsert({
            where: { brokerId: broker.id },
            update: {
              avgNewClientDeposit: new Prisma.Decimal(validated.avgNewClientDeposit || 0),
              avgExistingClientDeposit: new Prisma.Decimal(validated.avgExistingClientDeposit || 0),
              avgNewClientWithdrawal: new Prisma.Decimal(validated.avgNewClientWithdrawal || 0),
              avgExistingClientWithdrawal: new Prisma.Decimal(validated.avgExistingClientWithdrawal || 0),
            },
            create: {
              brokerId: broker.id,
              avgNewClientDeposit: new Prisma.Decimal(validated.avgNewClientDeposit || 0),
              avgExistingClientDeposit: new Prisma.Decimal(validated.avgExistingClientDeposit || 0),
              avgNewClientWithdrawal: new Prisma.Decimal(validated.avgNewClientWithdrawal || 0),
              avgExistingClientWithdrawal: new Prisma.Decimal(validated.avgExistingClientWithdrawal || 0),
            },
          });
          break;
        }

        case 'pros-cons': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              prosList: validated.prosList,
              consList: validated.consList,
            },
          });
          break;
        }

        case 'awards': {
          await tx.brokerAward.deleteMany({ where: { brokerId: broker.id } });
          if (validated.awards && validated.awards.length > 0) {
            await tx.brokerAward.createMany({
              data: validated.awards.map((a: any, idx: number) => ({
                brokerId: broker.id,
                year: a.year,
                awardFor: a.awardFor,
                expo: a.expo,
                expoLocation: a.expoLocation,
                expoDate: a.expoDate ? new Date(a.expoDate) : null,
                sortOrder: a.sortOrder ?? idx,
              })),
            });
          }
          break;
        }

        case 'social': {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              socialLinks: validated.socialLinks || Prisma.DbNull,
              promoVideoUrl: validated.promoVideoUrl,
            },
          });
          break;
        }

        case 'policies': {
          if (validated.policies && validated.policies.length > 0) {
            for (const p of validated.policies) {
              await tx.brokerDocument.upsert({
                where: { id: p.id || 'new-dummy-id' },
                update: {
                  docType: p.docType,
                  fileUrl: p.fileUrl,
                  fileName: p.fileName,
                  fileType: p.fileType,
                  isPrivate: p.isPrivate,
                },
                create: {
                  brokerId: broker.id,
                  docType: p.docType,
                  fileUrl: p.fileUrl,
                  fileName: p.fileName,
                  fileType: p.fileType,
                  isPrivate: p.isPrivate,
                },
              });
            }
          }
          break;
        }
      }

      // Compliance Re-Review: If core compliance fields edited on an APPROVED broker, send back to review
      if (broker.status === ApprovalStatus.APPROVED) {
        if (section === 'regulatory' || section === 'general') {
          await tx.broker.update({
            where: { id: broker.id },
            data: {
              onboardingStatus: BrokerOnboardingStatus.CHANGES_REQUESTED,
              reviewNote: 'Compliance fields modified after approval. Re-review required.',
            },
          });
        }
      }

      // Recompute denormalized summary and completeness inside the same transaction
      await recomputeBrokerSummary(broker.id, tx);
    },
    { maxWait: 15000, timeout: 30000 }
  );

    return await this.getMyOnboarding(userId);
  }

  /**
   * Submit complete onboarding application for administrative compliance audit
   */
  async submitOnboarding(userId: string) {
    const broker = await prisma.broker.findUnique({
      where: { userId },
      include: {
        licenses: true,
        accountGroups: true,
        depositMethodItems: true,
        withdrawalMethodItems: true,
        documents: true,
      },
    });

    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const missingFields: string[] = [];

    // 1. Core Identity
    if (!broker.companyName || broker.companyName.trim().length < 2) missingFields.push('Company Name');
    if (!broker.country) missingFields.push('Operating Country');
    if (!broker.city) missingFields.push('City');
    if (!broker.email) missingFields.push('Contact Email');
    if (!broker.website) missingFields.push('Broker Website URL');

    // 2. Regulatory
    if (broker.isRegulated === null || broker.isRegulated === undefined) {
      missingFields.push('Regulated Status (Yes or No)');
    } else if (broker.isRegulated === true) {
      if (broker.licenses.length === 0) {
        missingFields.push('At least one Regulatory License with PDF proof');
      } else {
        const hasValidLicense = broker.licenses.some((l) => l.regulatoryBody && l.licenseNumber);
        if (!hasValidLicense) {
          missingFields.push('Complete License details (Regulatory Body & License Number)');
        }
      }
    }

    // 3. Trading Conditions
    if (broker.accountGroups.length === 0) {
      missingFields.push('At least one Trading Account Group');
    }

    // 4. Banking
    if (broker.depositMethodItems.length === 0) {
      missingFields.push('At least one Deposit Payment Method');
    }
    if (broker.withdrawalMethodItems.length === 0) {
      missingFields.push('At least one Withdrawal Payment Method');
    }

    // 5. Mandatory Policies
    const docTypes = broker.documents.map((d) => d.docType);
    if (!docTypes.includes(BrokerDocType.POLICY_TERMS)) missingFields.push('Terms & Conditions Policy PDF');
    if (!docTypes.includes(BrokerDocType.POLICY_RISK_DISCLOSURE)) missingFields.push('Risk Disclosure Policy PDF');
    if (!docTypes.includes(BrokerDocType.POLICY_AML)) missingFields.push('Anti-Money Laundering (AML) Policy PDF');

    if (missingFields.length > 0) {
      throw new AppError(
        `Your onboarding application is missing required compliance items: ${missingFields.join(', ')}`,
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    const updated = await prisma.broker.update({
      where: { id: broker.id },
      data: {
        onboardingStatus: BrokerOnboardingStatus.SUBMITTED,
        status: ApprovalStatus.PENDING,
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });

    // Notify all admins with the correct link
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.APPROVAL,
          title: 'Broker Compliance Audit Ready',
          message: `${broker.companyName} has submitted their full broker application for review.`,
          link: `/admin/brokers/${broker.id}`,
        })),
      });
    }

    return updated;
  }

  /**
   * Get approved brokers with filtering, search, and pagination
   */
  async getBrokers(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.BrokerWhereInput = {
      status: ApprovalStatus.APPROVED,
    };

    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search as string, mode: 'insensitive' } },
        { description: { contains: query.search as string, mode: 'insensitive' } },
        { platformDescription: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    if (query.country) {
      where.OR = [
        { country: { equals: query.country as string, mode: 'insensitive' } },
        { countries: { has: query.country as string } },
      ];
    }

    if (query.isRegulated !== undefined) {
      where.isRegulated = query.isRegulated === 'true';
    }

    if (query.businessType) {
      where.businessType = query.businessType as BrokerBusinessType;
    }

    if (query.regulatoryBody) {
      where.licenses = {
        some: {
          regulatoryBody: { contains: query.regulatoryBody as string, mode: 'insensitive' },
        },
      };
    }

    if (query.platform) {
      where.availablePlatforms = { has: query.platform as string };
    }

    if (query.deviceSupport) {
      where.deviceSupport = { has: query.deviceSupport as string };
    }

    if (query.negativeBalanceProtection !== undefined) {
      where.negativeBalanceProtection = query.negativeBalanceProtection === 'true';
    }

    if (query.swapFree === 'true') {
      where.accountGroups = { some: { swapFree: true } };
    }

    if (query.scalping === 'true') {
      where.accountGroups = { some: { scalpingAllowed: true } };
    }

    if (query.ea === 'true') {
      where.accountGroups = { some: { eaAllowed: true } };
    }

    if (query.hedging === 'true') {
      where.accountGroups = { some: { hedgingAllowed: true } };
    }

    if (query.spreadType) {
      where.accountGroups = { some: { spreadType: query.spreadType as SpreadType } };
    }

    if (query.orderExecution) {
      where.accountGroups = { some: { orderExecution: query.orderExecution as OrderExecution } };
    }

    if (query.accountType) {
      where.accountTypes = { has: query.accountType as string };
    }

    if (query.instrument) {
      where.instruments = { has: query.instrument as string };
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }

    if (query.minDeposit) {
      where.minDeposit = { lte: parseFloat(query.minDeposit as string) };
    }

    // Sorting
    let orderBy: Prisma.BrokerOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'avgRating') {
      orderBy = { avgRating: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'totalReviews') {
      orderBy = { totalReviews: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'minDeposit') {
      orderBy = { minDeposit: query.sortOrder === 'desc' ? 'desc' : 'asc' };
    }

    const [brokers, total] = await Promise.all([
      prisma.broker.findMany({
        where,
        skip,
        take,
        orderBy,
        select: publicBrokerSelect,
      }),
      prisma.broker.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { brokers, total, page, limit, totalPages };
  }

  /**
   * Get single broker details by unique slug
   */
  async getBrokerBySlug(slug: string, currentUserId?: string) {
    const broker = await prisma.broker.findUnique({
      where: { slug },
      include: {
        licenses: { orderBy: { sortOrder: 'asc' } },
        servers: { orderBy: { sortOrder: 'asc' } },
        boardMembers: { orderBy: { sortOrder: 'asc' } },
        accountGroups: { orderBy: { sortOrder: 'asc' } },
        ibPlans: { orderBy: { sortOrder: 'asc' } },
        depositMethodItems: { orderBy: { sortOrder: 'asc' } },
        withdrawalMethodItems: { orderBy: { sortOrder: 'asc' } },
        symbolSpecs: { orderBy: { sortOrder: 'asc' } },
        awards: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const isOwner = currentUserId && broker.userId === currentUserId;
    let isAdmin = false;
    if (currentUserId && !isOwner) {
      const viewer = await prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } });
      isAdmin = viewer?.role === Role.ADMIN;
    }

    // Allow owner or admins to view non-approved profile
    if (broker.status !== ApprovalStatus.APPROVED && !isOwner && !isAdmin) {
      throw new AppError('Broker profile is currently under review or unavailable.', StatusCodes.NOT_FOUND);
    }

    // Project safe public DTO for regular visitors
    if (!isOwner && !isAdmin) {
      const safePublic = {
        ...broker,
        servers: broker.servers.map((s) => ({ id: s.id, name: s.name, location: s.location, sortOrder: s.sortOrder })),
        accountGroups: broker.accountGroups.map((g) => {
          const { testLogin: _tl, testPasswordEnc: _tp, testServer: _ts, ...safeGroup } = g;
          return safeGroup;
        }),
        documents: broker.documents.filter((d) => !d.isPrivate),
      };
      return safePublic;
    }

    return broker;
  }

  /**
   * Compare multiple brokers
   */
  async compareBrokers(brokerIds: string[]) {
    return await prisma.broker.findMany({
      where: {
        id: { in: brokerIds },
        status: ApprovalStatus.APPROVED,
      },
      select: publicBrokerSelect,
    });
  }

  /**
   * Submit trader lead / inquiry to broker
   */
  async submitLead(brokerId: string, data: { name: string; email: string; phone?: string; message?: string; source?: string }) {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
      include: { user: true },
    });

    if (!broker || broker.status !== ApprovalStatus.APPROVED) {
      throw new AppError('Broker is not available to receive leads.', StatusCodes.NOT_FOUND);
    }

    const lead = await prisma.brokerLead.create({
      data: {
        brokerId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source || 'BROKER_PROFILE_PAGE',
      },
    });

    await prisma.broker.update({
      where: { id: brokerId },
      data: { totalLeads: { increment: 1 } },
    });

    await prisma.notification.create({
      data: {
        userId: broker.userId,
        type: NotificationType.ENQUIRY,
        title: 'New Trader Lead Received',
        message: `${data.name} is interested in opening an account with ${broker.companyName}.`,
        link: `/dashboard/leads`,
      },
    });

    transporter
      .sendMail({
        to: broker.user.email,
        subject: `New Trader Lead for ${broker.companyName}`,
        text: `You have received a new inquiry from ${data.name} (${data.email}, Phone: ${data.phone || 'N/A'}):\n\n${data.message || 'No additional message.'}`,
      })
      .catch(() => {});

    return lead;
  }

  /**
   * Submit a review for a broker
   */
  async addReview(brokerId: string, userId: string, data: any) {
    const broker = await prisma.broker.findUnique({ where: { id: brokerId } });
    if (!broker) {
      throw new AppError('Broker not found.', StatusCodes.NOT_FOUND);
    }

    const review = await prisma.brokerReview.create({
      data: {
        brokerId,
        userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        pros: data.pros,
        cons: data.cons,
        isApproved: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: broker.userId,
        type: NotificationType.REVIEW,
        title: 'New Review Submitted',
        message: `A client left a ${data.rating}-star review for ${broker.companyName}. Pending approval.`,
        link: `/dashboard/reviews`,
      },
    });

    return review;
  }

  /**
   * Get paginated approved reviews for a broker
   */
  async getReviews(brokerId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const [reviews, total] = await Promise.all([
      prisma.brokerReview.findMany({
        where: { brokerId, isApproved: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.brokerReview.count({ where: { brokerId, isApproved: true } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { reviews, total, page, limit, totalPages };
  }

  /**
   * Broker responds to a user review
   */
  async respondToReview(reviewId: string, userId: string, responseText: string) {
    const broker = await prisma.broker.findUnique({ where: { userId } });
    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const review = await prisma.brokerReview.findUnique({ where: { id: reviewId } });
    if (!review || review.brokerId !== broker.id) {
      throw new AppError('Review not found or unauthorized to respond.', StatusCodes.FORBIDDEN);
    }

    return await prisma.brokerReview.update({
      where: { id: reviewId },
      data: {
        brokerResponse: responseText,
        respondedAt: new Date(),
      },
    });
  }

  /**
   * Save or bookmark broker to user watchlist
   */
  async toggleSaveBroker(userId: string, brokerId: string) {
    const existing = await prisma.savedBroker.findUnique({
      where: { userId_brokerId: { userId, brokerId } },
    });

    if (existing) {
      await prisma.savedBroker.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await prisma.savedBroker.create({
        data: { userId, brokerId },
      });
      return { saved: true };
    }
  }

  /**
   * Get current broker dashboard profile with stats and leads
   */
  async getMyBrokerProfile(userId: string) {
    return await this.getMyOnboarding(userId);
  }

  /**
   * Get broker leads with pagination for dashboard
   */
  async getMyLeads(userId: string, query: any) {
    const broker = await prisma.broker.findUnique({ where: { userId } });
    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const { skip, take, page, limit } = parsePagination(query);
    const [leads, total] = await Promise.all([
      prisma.brokerLead.findMany({
        where: { brokerId: broker.id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.brokerLead.count({ where: { brokerId: broker.id } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { leads, total, page, limit, totalPages };
  }

  /**
   * Legacy registerBroker support: initializes broker and saves initial fields
   */
  async registerBroker(userId: string, data: any, logoFile?: Express.Multer.File, docFiles?: Express.Multer.File[]) {
    const broker = await this.getOrCreateBrokerStub(userId);
    const updated = await prisma.broker.update({
      where: { id: broker.id },
      data: {
        companyName: data.companyName || broker.companyName,
        registeredName: data.registeredName || broker.registeredName,
        country: data.country || broker.country,
        city: data.city || broker.city,
        website: data.website || broker.website,
        email: data.email || broker.email,
        phone: data.phone || broker.phone,
        description: data.description || broker.description,
        ...(logoFile && { logo: logoFile.path }),
      },
    });

    if (docFiles && docFiles.length > 0) {
      await prisma.brokerDocument.createMany({
        data: docFiles.map((doc) => ({
          brokerId: broker.id,
          docType: BrokerDocType.POLICY_TERMS,
          fileName: doc.originalname,
          fileUrl: doc.path,
          fileType: doc.mimetype,
          isPrivate: true,
        })),
      });
    }

    await recomputeBrokerSummary(broker.id);
    return updated;
  }

  /**
   * Legacy updateBroker profile
   */
  async updateBroker(userId: string, data: any, logoFile?: Express.Multer.File) {
    const broker = await this.getOrCreateBrokerStub(userId);
    const updated = await prisma.broker.update({
      where: { id: broker.id },
      data: {
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.registeredName && { registeredName: data.registeredName }),
        ...(data.website && { website: data.website }),
        ...(data.description && { description: data.description }),
        ...(data.country && { country: data.country }),
        ...(data.city && { city: data.city }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
        ...(logoFile && { logo: logoFile.path }),
      },
    });

    await recomputeBrokerSummary(broker.id);
    return updated;
  }

  /**
   * Legacy uploadDocuments
   */
  async uploadDocuments(userId: string, files: Express.Multer.File[]) {
    const broker = await this.getOrCreateBrokerStub(userId);
    if (!files || files.length === 0) return [];

    return await prisma.brokerDocument.createMany({
      data: files.map((file) => ({
        brokerId: broker.id,
        docType: BrokerDocType.POLICY_TERMS,
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        isPrivate: false,
      })),
    });
  }
}

export const brokerService = new BrokerService();
