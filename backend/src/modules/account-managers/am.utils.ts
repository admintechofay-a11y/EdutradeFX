import { AmEntityType } from '@prisma/client';

export const ALL_AGREEMENT_KEYS = [
  'CLIENT_FUND_PROTECTION',
  'TRADER_PROFIT_PROTECTION',
  'NO_PERSONAL_CONTACT_SHARING',
  'CLIENT_FUND_INSURANCE_PROTECTION',
  'LOSS_RECOVERING',
  'PROFIT_SHARING',
  'NDA',
] as const;

export const MASTER_TERMS_KEY = 'PLATFORM_TERMS';

export interface AMCompletionResult {
  percent: number;
  missingFields: string[];
  missingSections: string[];
  isSubmittable: boolean;
}

export function mapLegacyTradingStyle(oldStyle?: string | null): string[] {
  if (!oldStyle) return [];
  const text = oldStyle.toLowerCase();
  const styles: string[] = [];

  if (text.includes('scalp')) styles.push('SCALPER');
  if (text.includes('swing')) styles.push('SWING_TRADER');
  if (text.includes('day')) styles.push('DAY_TRADER');
  if (text.includes('position')) styles.push('POSITION_TRADER');
  if (text.includes('news')) styles.push('NEWS_TRADER');
  if (
    text.includes('algo') ||
    text.includes('ea') ||
    text.includes('bot') ||
    text.includes('robot') ||
    text.includes('automat')
  ) {
    styles.push('ALGORITHMIC_TRADER');
  }

  return Array.from(new Set(styles));
}

export function calculateAMCompletion(
  am: Record<string, any>,
  docs: Array<{ docType: string }> = [],
  acceptances: Array<{ agreementKey: string }> = []
): AMCompletionResult {
  const missing: string[] = [];
  const missingSectionsSet = new Set<string>();

  // Helper
  const requireField = (section: string, fieldName: string, isValid: boolean) => {
    if (!isValid) {
      missing.push(fieldName);
      missingSectionsSet.add(section);
    }
  };

  // Section 1: Personal / Corporate
  const isCorporate = am.entityType === AmEntityType.CORPORATE;
  if (isCorporate) {
    requireField('personal', 'companyLegalName', Boolean(am.companyLegalName?.trim()));
    requireField('personal', 'companyRegistrationNumber', Boolean(am.companyRegistrationNumber?.trim()));
    requireField('personal', 'incorporationCountry', Boolean(am.incorporationCountry?.trim()));
  }
  requireField('personal', 'photo', Boolean(am.photo?.trim()));
  requireField('personal', 'address', Boolean(am.address && am.address.trim().length >= 5));
  requireField('personal', 'country', Boolean(am.countryCode || am.country));
  requireField('personal', 'stateRegion', Boolean(am.stateRegion || am.stateCode));
  requireField('personal', 'city', Boolean(am.city && am.city.trim().length >= 2));
  requireField('personal', 'zipCode', Boolean(am.zipCode && am.zipCode.trim().length >= 3));
  requireField('personal', 'contactEmail', Boolean(am.contactEmail && am.contactEmail.includes('@')));
  requireField('personal', 'contactPhone', Boolean(am.contactPhone && am.contactPhone.trim().length >= 7));

  // Section 2: Regulatory
  requireField('regulatory', 'isRegulated', am.isRegulated !== undefined && am.isRegulated !== null);
  if (am.isRegulated === true) {
    requireField('regulatory', 'regulatorName', Boolean(am.regulatorName?.trim()));
    requireField('regulatory', 'regulatorRegistrationNumber', Boolean(am.regulatorRegistrationNumber?.trim()));
    requireField('regulatory', 'regulatorCountry', Boolean(am.regulatorCountry?.trim()));
  }

  // Section 3: About Trader
  requireField('about', 'bio', Boolean(am.bio && am.bio.trim().length >= 50));
  requireField('about', 'speciality', Boolean(am.speciality && am.speciality.trim().length >= 20));
  const hasCV = docs.some((d) => d.docType === 'CV_RESUME');
  requireField('about', 'cvResume', hasCV);

  // Section 4: Market Experience
  requireField('experience', 'yearsExperience', am.yearsExperience !== undefined && am.yearsExperience !== null && am.yearsExperience >= 0);

  // Section 5: Trading Style & Information
  const styles = Array.isArray(am.tradingStyles) ? am.tradingStyles : [];
  requireField('style', 'tradingStyles', styles.length > 0);
  const platforms = Array.isArray(am.preferredPlatforms) ? am.preferredPlatforms : [];
  requireField('style', 'preferredPlatforms', platforms.length > 0);
  if (platforms.includes('OTHER')) {
    requireField('style', 'otherPlatformName', Boolean(am.otherPlatformName && am.otherPlatformName.trim().length >= 2));
  }
  const brokerTypes = Array.isArray(am.preferredBrokerTypes) ? am.preferredBrokerTypes : [];
  requireField('style', 'preferredBrokerTypes', brokerTypes.length > 0);

  // Section 6: Trading Strategy
  requireField('strategy', 'indicators', Boolean(am.indicators && am.indicators.trim().length > 0));
  requireField('strategy', 'technical', Boolean(am.technical && am.technical.trim().length > 0));

  // Section 7: Risk Appetite
  requireField('risk', 'riskRewardRatio', Boolean(am.riskRewardRatio && /^\d+(\.\d+)?:(\d+(\.\d+)?)$/.test(am.riskRewardRatio.trim())));
  requireField('risk', 'riskTolerance', Boolean(am.riskTolerance));
  requireField('risk', 'lossPerTradePercent', am.lossPerTradePercent !== undefined && am.lossPerTradePercent !== null && Number(am.lossPerTradePercent) > 0);
  requireField('risk', 'dailyTrades', am.dailyTrades !== undefined && am.dailyTrades !== null && Number(am.dailyTrades) >= 1);
  requireField('risk', 'dailyLots', am.dailyLots !== undefined && am.dailyLots !== null && Number(am.dailyLots) > 0);
  requireField('risk', 'dailyStopLossPoints', am.dailyStopLossPoints !== undefined && am.dailyStopLossPoints !== null && Number(am.dailyStopLossPoints) > 0);
  requireField('risk', 'dailyTakeProfitPoints', am.dailyTakeProfitPoints !== undefined && am.dailyTakeProfitPoints !== null && Number(am.dailyTakeProfitPoints) > 0);
  requireField('risk', 'favouriteTimeframe', Boolean(am.favouriteTimeframe?.trim()));
  requireField(
    'risk',
    'tradingTime',
    Boolean(
      am.tradingTimeFrom &&
      am.tradingTimeTo &&
      /^\d{2}:\d{2}$/.test(am.tradingTimeFrom) &&
      /^\d{2}:\d{2}$/.test(am.tradingTimeTo) &&
      am.tradingTimeFrom !== am.tradingTimeTo
    )
  );
  requireField('risk', 'lossRecoveryStrategy', Boolean(am.lossRecoveryStrategy && am.lossRecoveryStrategy.trim().length >= 20));

  // Section 8: Clients Settlements
  requireField('settlement', 'settlementCycle', Boolean(am.settlementCycle));

  // Section 9: Sharing & Settlements
  requireField('sharing', 'clientFundSecurity', Boolean(am.clientFundSecurity && am.clientFundSecurity.trim().length >= 30));
  requireField('sharing', 'recommendsBroker', am.recommendsBroker !== undefined && am.recommendsBroker !== null);
  if (am.recommendsBroker === true) {
    requireField('sharing', 'recommendedBrokerName', Boolean(am.recommendedBrokerName?.trim()));
    requireField('sharing', 'recommendedBrokerPlatform', Boolean(am.recommendedBrokerPlatform?.trim()));
  }
  requireField('sharing', 'profitSharingPercent', am.profitSharingPercent !== undefined && am.profitSharingPercent !== null && Number(am.profitSharingPercent) >= 0);
  requireField('sharing', 'lossSharingPercent', am.lossSharingPercent !== undefined && am.lossSharingPercent !== null && Number(am.lossSharingPercent) >= 0);

  // Section 10: Agreements
  const acceptedKeySet = new Set(acceptances.map((a) => a.agreementKey));
  for (const key of ALL_AGREEMENT_KEYS) {
    if (!acceptedKeySet.has(key)) {
      missing.push(`agreement_${key}`);
      missingSectionsSet.add('agreements');
    }
  }
  if (!acceptedKeySet.has(MASTER_TERMS_KEY)) {
    missing.push(`agreement_${MASTER_TERMS_KEY}`);
    missingSectionsSet.add('agreements');
  }

  // Calculate percentage: base total checks = 35
  const TOTAL_CHECK_POINTS = 35;
  const passedChecks = Math.max(0, TOTAL_CHECK_POINTS - missing.length);
  const percent = Math.min(100, Math.round((passedChecks / TOTAL_CHECK_POINTS) * 100));

  return {
    percent,
    missingFields: missing,
    missingSections: Array.from(missingSectionsSet),
    isSubmittable: missing.length === 0,
  };
}
