export const FORBIDDEN_PRIVATE_KEYS = [
  'contactEmail',
  'contactPhone',
  'address',
  'zipCode',
  'lossRecoveryStrategy',
  'rejectionReason',
  'changesRequestedNote',
  'reviewedById',
  'reviewedAt',
  'userId',
  'user',
] as const;

export function serializePublicAM(am: any): Record<string, any> | null {
  if (!am) return null;

  // Use public snapshot if approved profile is temporarily pending re-review
  const source = am;

  // Filter public documents: only isPublic === true AND reviewStatus === 'APPROVED'
  const publicDocs = Array.isArray(source.documents)
    ? source.documents
        .filter((d: any) => d.isPublic === true && d.reviewStatus === 'APPROVED')
        .map((d: any) => ({
          id: d.id,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          docType: d.docType,
          caption: d.caption,
          periodNote: d.periodNote,
        }))
    : [];

  // Filter reviews: only approved reviews
  const publicReviews = Array.isArray(source.reviews)
    ? source.reviews
        .filter((r: any) => r.isApproved)
        .map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: r.user
            ? {
                id: r.user.id,
                name: r.user.name,
                avatar: r.user.avatar,
              }
            : null,
        }))
    : [];

  // Public social links only if manager opted in
  const socialLinks = source.socialLinksPublic ? source.socialLinks || {} : {};

  const publicData: Record<string, any> = {
    id: source.id,
    fullName: source.fullName,
    slug: source.slug,
    photo: source.photo,
    tagline: source.tagline,
    bio: source.bio,
    speciality: source.speciality,
    country: source.country,
    countryCode: source.countryCode,
    stateRegion: source.stateRegion,
    city: source.city,
    yearsExperience: source.yearsExperience,
    expertise: source.expertise || [],
    languages: source.languages || [],
    services: source.services || [],
    availability: source.availability,
    tradingStyles: source.tradingStyles || [],
    preferredInstruments: source.preferredInstruments || [],
    preferredPlatforms: source.preferredPlatforms || [],
    otherPlatformName: source.otherPlatformName,
    preferredBrokerTypes: source.preferredBrokerTypes || [],
    accuracyLevel: source.accuracyLevel,
    accuracyPeriodNote: source.accuracyPeriodNote,
    indicators: source.indicators,
    signals: source.signals,
    fundamentals: source.fundamentals,
    technical: source.technical,
    newsTrade: source.newsTrade,
    riskRewardRatio: source.riskRewardRatio,
    riskRewardValue: source.riskRewardValue,
    riskTolerance: source.riskTolerance,
    lossPerTradePercent: source.lossPerTradePercent,
    dailyTrades: source.dailyTrades,
    dailyLots: source.dailyLots,
    dailyStopLossPoints: source.dailyStopLossPoints,
    dailyTakeProfitPoints: source.dailyTakeProfitPoints,
    favouriteTimeframe: source.favouriteTimeframe,
    tradingTimeFrom: source.tradingTimeFrom,
    tradingTimeTo: source.tradingTimeTo,
    settlementCycle: source.settlementCycle,
    clientFundSecurity: source.clientFundSecurity,
    recommendsBroker: source.recommendsBroker,
    recommendedBrokerName: source.recommendedBrokerName,
    recommendedBrokerPlatform: source.recommendedBrokerPlatform,
    recommendedBrokerId: source.recommendedBrokerId,
    profitSharingPercent: source.profitSharingPercent,
    lossSharingPercent: source.lossSharingPercent,
    isRegulated: source.isRegulated,
    regulatoryVerified: Boolean(source.regulatoryVerified),
    // Regulator details shown publicly only when verified by admin
    regulatorName: source.regulatoryVerified ? source.regulatorName : undefined,
    regulatorRegistrationNumber: source.regulatoryVerified ? source.regulatorRegistrationNumber : undefined,
    regulatorCountry: source.regulatoryVerified ? source.regulatorCountry : undefined,
    socialLinks,
    socialLinksPublic: Boolean(source.socialLinksPublic),
    documents: publicDocs,
    reviews: publicReviews,
    avgRating: source.avgRating,
    totalReviews: source.totalReviews,
    isFeatured: source.isFeatured,
    status: source.status,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };

  // Hard assertion guard: verify no forbidden private keys exist
  for (const key of FORBIDDEN_PRIVATE_KEYS) {
    if (key in publicData) {
      delete publicData[key];
    }
  }

  return publicData;
}
