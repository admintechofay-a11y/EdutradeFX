export const FORBIDDEN_PRIVATE_SP_KEYS = [
  'legalFullName',
  'contactPhone',
  'residenceCountryCode',
  'residenceCountry',
  'userId',
  'email',
  'user',
  'documents',
  'acceptances',
  'agreementAcceptances',
  'rejectionReason',
  'changesRequestedNote',
  'reviewFlags',
  'reviewedById',
  'reviewedAt',
  'profileUpdateRequiredBy',
] as const;

export function serializePublicSP(sp: any) {
  if (!sp) return null;

  // Filter plans to active ones
  const activePlans = Array.isArray(sp.plans)
    ? sp.plans
        .filter((p: any) => p.isActive !== false)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          period: p.period,
          price: typeof p.price === 'object' && p.price !== null ? Number(p.price) : Number(p.price || 0),
          currency: p.currency || 'USD',
          description: p.description || null,
          sortOrder: p.sortOrder || 0,
        }))
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    : [];

  // Filter signals to public fields
  const publicSignals = Array.isArray(sp.signals)
    ? sp.signals.map((s: any) => ({
        id: s.id,
        title: s.title,
        instrument: s.instrument,
        direction: s.direction,
        entryPrice: s.entryPrice,
        takeProfit: s.takeProfit,
        stopLoss: s.stopLoss,
        description: s.description,
        status: s.status,
        closedAt: s.closedAt,
        closedPrice: s.closedPrice,
        pipsGained: s.pipsGained,
        createdAt: s.createdAt,
        disclaimer: 'Educational purposes only. Not financial advice.',
      }))
    : [];

  const publicData: Record<string, any> = {
    id: sp.id,
    displayName: sp.displayName,
    slug: sp.slug,
    photo: sp.photo || null,
    bio: sp.bio || null,

    // Strategy & Approach
    strategy: sp.strategy || null,
    strategyDetail: sp.strategyDetail || null,
    instruments: Array.isArray(sp.instruments) ? sp.instruments : [],
    tradingStyles: Array.isArray(sp.tradingStyles) ? sp.tradingStyles : [],
    tradingStyleDescription: sp.tradingStyleDescription || null,
    yearsTrading: sp.yearsTrading ?? null,
    preferredTimeframes: Array.isArray(sp.preferredTimeframes) ? sp.preferredTimeframes : [],

    // Declared vs Platform Computed Performance
    declaredMetrics: {
      avgMonthlyReturn: sp.declaredAvgMonthlyReturn !== null && sp.declaredAvgMonthlyReturn !== undefined ? Number(sp.declaredAvgMonthlyReturn) : null,
      maxDrawdown: sp.declaredMaxDrawdown !== null && sp.declaredMaxDrawdown !== undefined ? Number(sp.declaredMaxDrawdown) : null,
      winRate: sp.declaredWinRate !== null && sp.declaredWinRate !== undefined ? Number(sp.declaredWinRate) : null,
      maxConsecutiveLosses: sp.maxConsecutiveLosses ?? null,
      periodNote: sp.performancePeriodNote || null,
      declared: true,
      label: 'Self-declared by provider (not platform audited)',
    },

    // Platform Tracked Performance
    computedMetrics: {
      winRate: sp.winRate !== null && sp.winRate !== undefined ? Number(sp.winRate) : null,
      totalSignals: sp.totalSignals ?? 0,
      label: 'Win rate on EdutradeFX signals (provider-reported pips)',
    },

    // Risk Management
    maxLeverageUsed: sp.maxLeverageUsed ?? null,
    riskRewardPreference: sp.riskRewardPreference || null,
    riskRewardValue: sp.riskRewardValue ?? null,
    riskPhilosophy: sp.riskPhilosophy || null,
    riskCategory: sp.riskCategory || null,
    usesHedgingOrMartingale: Boolean(sp.usesHedgingOrMartingale),
    usesHedging: Boolean(sp.usesHedging),
    usesMartingale: Boolean(sp.usesMartingale),
    hedgingMartingaleNotes: sp.hedgingMartingaleNotes || null,

    // Additional Insights
    specializedExpertise: sp.specializedExpertise || null,
    marketAdaptation: sp.marketAdaptation || null,
    uniqueValue: sp.uniqueValue || null,

    // Investor Communication
    updateFrequency: sp.updateFrequency || null,
    inquiryHandlingApproach: sp.inquiryHandlingApproach || null,
    offersLiveQA: Boolean(sp.offersLiveQA),
    liveQAFrequency: sp.liveQAFrequency || null,

    // Pricing & Plans
    subscriptionModel: sp.subscriptionModel || 'FREE',
    plans: activePlans,

    // Public Links
    website: sp.website || null,
    telegramChannelUrl: sp.telegramChannelUrl || null,

    // Verification Badges
    idVerified: Boolean(sp.idVerified),
    statementVerified: Boolean(sp.statementVerified),
    performanceLinkVerified: Boolean(sp.performanceLinkVerified),
    statementAccountType: sp.statementAccountType || null,
    verificationStatus: Boolean(sp.verificationStatus),
    // Performance link is ONLY shown if verified by compliance
    performanceLink: sp.performanceLinkVerified ? sp.performanceLink || null : null,
    performanceLinkPlatform: sp.performanceLinkVerified ? sp.performanceLinkPlatform || null : null,

    // Reviews & Community
    avgRating: Number(sp.avgRating || 0),
    totalReviews: sp.totalReviews ?? 0,
    reviews: Array.isArray(sp.reviews) ? sp.reviews : [],

    // Public Signals
    signals: publicSignals,

    // Compliance Disclaimer
    disclaimer: 'Signals are for educational purposes only. Trading carries a high risk of loss. Past performance does not guarantee future results. EdutradeFX does not verify self-declared figures.',
    isFeatured: Boolean(sp.isFeatured),
    createdAt: sp.createdAt,
    updatedAt: sp.updatedAt,
  };

  // ── STRICT PRIVACY ASSERTION GUARD ─────────────────────────
  for (const forbiddenKey of FORBIDDEN_PRIVATE_SP_KEYS) {
    if (forbiddenKey in publicData) {
      delete publicData[forbiddenKey];
      throw new Error(`CRITICAL SECURITY FAILURE: Private key "${forbiddenKey}" leaked in Signal Provider public serializer!`);
    }
  }

  return publicData;
}
