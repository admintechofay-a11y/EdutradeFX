import { scanSuspiciousPhrases } from './sp.schemas';

export const ALL_SP_AGREEMENT_KEYS = [
  'CLIENT_FUND_PROTECTION',
  'SUBSCRIPTION_FEE_STRUCTURE',
  'LOSS_RECOVERING',
  'NO_PROFIT_SHARING',
  'DISPUTE_RESOLUTION',
  'EDUCATIONAL_NON_LIABILITY',
  'COMMIT_TRANSPARENCY',
  'COMMIT_CLIENT_EDUCATION',
  'COMMIT_ETHICAL_PRACTICES',
  'DECLARATION',
] as const;

export interface MissingSPField {
  step: number;
  section: string;
  field: string;
  label: string;
}

export interface SPCompletionResult {
  percent: number;
  missingFields: MissingSPField[];
  isSubmittable: boolean;
  totalRequirements: number;
  completedRequirements: number;
}

export function calculateSPCompletion(
  sp: any,
  docs: any[] = [],
  acceptances: any[] = []
): SPCompletionResult {
  const missing: MissingSPField[] = [];

  // Step 1: Personal
  if (!sp.legalFullName) missing.push({ step: 1, section: 'personal', field: 'legalFullName', label: 'Legal Full Name' });
  if (!sp.displayName) missing.push({ step: 1, section: 'personal', field: 'displayName', label: 'Public Display Name' });
  if (!sp.contactPhone) missing.push({ step: 1, section: 'personal', field: 'contactPhone', label: 'Phone Number' });
  if (!sp.residenceCountry) missing.push({ step: 1, section: 'personal', field: 'residenceCountry', label: 'Country of Residence' });
  if (!sp.photo) missing.push({ step: 1, section: 'personal', field: 'photo', label: 'Profile Photo' });

  // Step 2: Experience
  if (sp.yearsTrading === null || sp.yearsTrading === undefined) {
    missing.push({ step: 2, section: 'experience', field: 'yearsTrading', label: 'Years Trading' });
  }
  if (!sp.instruments || sp.instruments.length === 0) {
    missing.push({ step: 2, section: 'experience', field: 'instruments', label: 'Preferred Instruments' });
  }
  if (!sp.tradingStyles || sp.tradingStyles.length === 0) {
    missing.push({ step: 2, section: 'experience', field: 'tradingStyles', label: 'Trading Styles' });
  }
  if (!sp.tradingStyleDescription || sp.tradingStyleDescription.length < 50) {
    missing.push({ step: 2, section: 'experience', field: 'tradingStyleDescription', label: 'Trading Style Description (min 50 chars)' });
  }
  if (sp.previouslySignalProvider === null || sp.previouslySignalProvider === undefined) {
    missing.push({ step: 2, section: 'experience', field: 'previouslySignalProvider', label: 'Prior Signal Provider History' });
  } else if (sp.previouslySignalProvider && (!sp.previousProviderDetails || sp.previousProviderDetails.length < 10)) {
    missing.push({ step: 2, section: 'experience', field: 'previousProviderDetails', label: 'Prior Signal Provider Details' });
  }

  // Step 3: Performance Metrics
  if (sp.declaredAvgMonthlyReturn === null || sp.declaredAvgMonthlyReturn === undefined) {
    missing.push({ step: 3, section: 'performance', field: 'declaredAvgMonthlyReturn', label: 'Declared Avg Monthly Return' });
  }
  if (sp.declaredMaxDrawdown === null || sp.declaredMaxDrawdown === undefined) {
    missing.push({ step: 3, section: 'performance', field: 'declaredMaxDrawdown', label: 'Declared Max Drawdown' });
  }
  if (sp.declaredWinRate === null || sp.declaredWinRate === undefined) {
    missing.push({ step: 3, section: 'performance', field: 'declaredWinRate', label: 'Declared Win Rate' });
  }
  if (!sp.preferredTimeframes || sp.preferredTimeframes.length === 0) {
    missing.push({ step: 3, section: 'performance', field: 'preferredTimeframes', label: 'Preferred Timeframe(s)' });
  }
  if (sp.maxConsecutiveLosses === null || sp.maxConsecutiveLosses === undefined) {
    missing.push({ step: 3, section: 'performance', field: 'maxConsecutiveLosses', label: 'Max Consecutive Losses' });
  }

  // Step 4: Risk Management
  if (!sp.maxLeverageUsed) missing.push({ step: 4, section: 'risk', field: 'maxLeverageUsed', label: 'Maximum Leverage Used' });
  if (!sp.riskRewardPreference) missing.push({ step: 4, section: 'risk', field: 'riskRewardPreference', label: 'Risk-Reward Ratio' });
  if (!sp.riskPhilosophy || sp.riskPhilosophy.length < 50) {
    missing.push({ step: 4, section: 'risk', field: 'riskPhilosophy', label: 'Risk Philosophy (min 50 chars)' });
  }
  if (sp.usesHedgingOrMartingale === null || sp.usesHedgingOrMartingale === undefined) {
    missing.push({ step: 4, section: 'risk', field: 'usesHedgingOrMartingale', label: 'Hedging or Martingale Disclosure' });
  } else if (sp.usesHedgingOrMartingale && (!sp.hedgingMartingaleNotes || sp.hedgingMartingaleNotes.length < 30)) {
    missing.push({ step: 4, section: 'risk', field: 'hedgingMartingaleNotes', label: 'Hedging/Martingale Explanation (min 30 chars)' });
  }
  if (!sp.riskCategory) missing.push({ step: 4, section: 'risk', field: 'riskCategory', label: 'Risk Category' });

  // Step 5: Verification Documents
  const hasIdDoc = docs.some((d) => d.docType === 'IDENTITY_DOCUMENT');
  if (!hasIdDoc) {
    missing.push({ step: 5, section: 'verification', field: 'IDENTITY_DOCUMENT', label: 'Identification Document (Passport / National ID)' });
  }
  const hasStatement = docs.some((d) => d.docType === 'ACCOUNT_STATEMENT');
  if (!hasStatement) {
    missing.push({ step: 5, section: 'verification', field: 'ACCOUNT_STATEMENT', label: 'Trading Account Statement (Last 3 Months)' });
  }
  if (!sp.statementAccountType) {
    missing.push({ step: 5, section: 'verification', field: 'statementAccountType', label: 'Account Type (Live / Demo)' });
  }

  // Step 7: Additional Info & Communication & Pricing
  if (!sp.strategy) missing.push({ step: 7, section: 'additional', field: 'strategy', label: 'Strategy Headline' });
  if (!sp.strategyDetail || sp.strategyDetail.length < 100) {
    missing.push({ step: 7, section: 'additional', field: 'strategyDetail', label: 'Detailed Strategy (min 100 chars)' });
  }
  if (!sp.marketAdaptation || sp.marketAdaptation.length < 50) {
    missing.push({ step: 7, section: 'additional', field: 'marketAdaptation', label: 'Market Adaptation Strategy' });
  }
  if (!sp.uniqueValue || sp.uniqueValue.length < 50) {
    missing.push({ step: 7, section: 'additional', field: 'uniqueValue', label: 'What Sets Your Service Apart' });
  }
  if (!sp.updateFrequency) missing.push({ step: 7, section: 'communication', field: 'updateFrequency', label: 'Follower Update Frequency' });
  if (!sp.inquiryHandlingApproach || sp.inquiryHandlingApproach.length < 30) {
    missing.push({ step: 7, section: 'communication', field: 'inquiryHandlingApproach', label: 'Inquiry Handling Approach' });
  }
  if (sp.offersLiveQA === null || sp.offersLiveQA === undefined) {
    missing.push({ step: 7, section: 'communication', field: 'offersLiveQA', label: 'Live Q&A / Webinars Availability' });
  }
  if (!sp.subscriptionModel) missing.push({ step: 7, section: 'pricing', field: 'subscriptionModel', label: 'Pricing Model (Free / Paid)' });

  // Step 8: Agreements & Commitments (9 agreements/commitments)
  const requiredAgreements = ALL_SP_AGREEMENT_KEYS.filter((k) => k !== 'DECLARATION');
  for (const key of requiredAgreements) {
    const hasAccepted = acceptances.some((a) => a.agreementKey === key);
    if (!hasAccepted) {
      missing.push({ step: 8, section: 'agreements', field: key, label: `Agreement: ${key.replace(/_/g, ' ')}` });
    }
  }

  // Step 9: Declaration
  if (!sp.declarationAcceptedAt) {
    missing.push({ step: 9, section: 'declaration', field: 'declarationAcceptedAt', label: 'Formal Accuracy Declaration' });
  }

  const totalRequirements = 32;
  const completedRequirements = Math.max(0, totalRequirements - missing.length);
  const percent = Math.min(100, Math.round((completedRequirements / totalRequirements) * 100));

  return {
    percent,
    missingFields: missing,
    isSubmittable: missing.length === 0,
    totalRequirements,
    completedRequirements,
  };
}

export function computeSPReviewFlags(sp: any, docs: any[] = []): string[] {
  const flags: string[] = [];

  // Declared metrics checks
  const winRate = Number(sp.declaredWinRate || 0);
  if (winRate >= 90) {
    flags.push(`Suspiciously High Win Rate: Declared ${winRate}% (>= 90%)`);
  }

  const monthlyReturn = Number(sp.declaredAvgMonthlyReturn || 0);
  if (monthlyReturn >= 30) {
    flags.push(`High Return Claim: Declared ${monthlyReturn}% monthly return (>= 30%)`);
  }

  const maxDrawdown = Number(sp.declaredMaxDrawdown || 0);
  if (maxDrawdown <= 2 && monthlyReturn >= 10) {
    flags.push(`Unrealistic Risk-to-Reward: Claimed <= 2% max drawdown with >= 10% monthly return`);
  }

  // Martingale check
  if (sp.usesMartingale) {
    flags.push(`High Blow-up Risk: Provider uses Martingale position scaling`);
  }

  // Leverage check
  if (sp.maxLeverageUsed && sp.maxLeverageUsed > 1000) {
    flags.push(`Extreme Leverage: Provider uses leverage > 1:1000 (${sp.maxLeverageUsed}:1)`);
  }

  // Performance link check
  if (!sp.performanceLink) {
    flags.push(`No External Track Record: Provider did not provide an MQL5/Myfxbook performance link`);
  }

  // Demo statement check
  if (sp.statementAccountType === 'DEMO') {
    flags.push(`Demo Statement: Provider submitted a Demo account statement instead of a Live account`);
  }

  // Statement period check
  if (sp.statementPeriodFrom && sp.statementPeriodTo) {
    const from = new Date(sp.statementPeriodFrom).getTime();
    const to = new Date(sp.statementPeriodTo).getTime();
    const spanDays = Math.round((to - from) / (1000 * 60 * 60 * 24));
    if (spanDays < 85) {
      flags.push(`Short Statement Period: Submitted statement spans only ${spanDays} days (< 85 days / 3 months)`);
    }
  }

  // Name mismatch check
  if (sp.legalFullName && sp.displayName && sp.legalFullName.toLowerCase() !== sp.displayName.toLowerCase()) {
    flags.push(`Display Name / Legal Name Mismatch: Legal="${sp.legalFullName}" vs Display="${sp.displayName}" (Informational)`);
  }

  // Scan free-text for prohibited phrases
  const textFields = {
    bio: sp.bio,
    strategy: sp.strategy,
    strategyDetail: sp.strategyDetail,
    tradingStyleDescription: sp.tradingStyleDescription,
    riskPhilosophy: sp.riskPhilosophy,
    hedgingMartingaleNotes: sp.hedgingMartingaleNotes,
    specializedExpertise: sp.specializedExpertise,
    marketAdaptation: sp.marketAdaptation,
    uniqueValue: sp.uniqueValue,
    inquiryHandlingApproach: sp.inquiryHandlingApproach,
  };
  const phraseFlags = scanSuspiciousPhrases(textFields);
  flags.push(...phraseFlags);

  return flags;
}
