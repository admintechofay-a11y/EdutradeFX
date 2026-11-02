export const FORBIDDEN_PRIVATE_PROVIDER_KEYS = [
  'ownershipPercentage',
  'evidenceDocId',
  'reviewFlags',
  'rejectionReason',
  'changesRequestedNote',
  'reviewNote',
  'moderatedById',
  'reviewedById',
  'deselectedAt',
  'actorId',
  'passwordHash',
  'twoFactorSecret',
];

export interface SerializerOptions {
  preview?: boolean;
}

/**
 * Filters dynamic category/product answers based on claims rules.
 * Claim VERIFIABLE is omitted unless present in verifiedClaims.
 */
export function filterAnswersForPublication(
  answers: Record<string, any> = {},
  verifiedClaims: string[] = [],
  options: SerializerOptions = {}
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(answers)) {
    if (val === null || val === undefined) continue;

    // Check if key is a verifiable claim
    const isVerifiable = isFieldVerifiable(key);
    const isVerified = verifiedClaims.includes(key);

    if (isVerifiable) {
      if (isVerified) {
        result[key] = {
          value: val,
          isVerifiedClaim: true,
          claimLevel: 'VERIFIABLE',
        };
      } else if (options.preview) {
        result[key] = {
          value: val,
          isVerifiedClaim: false,
          claimLevel: 'VERIFIABLE',
          previewOnly: true,
          unverifiedNotice: 'Unverified claim — hidden in public directory until verified by admin',
        };
      }
      // If not verified and not in preview mode: OMIT entirely from public snapshot
    } else {
      result[key] = {
        value: val,
        claimLevel: 'DECLARED',
        notice: 'Provider-declared. Not verified by EdutradeFX.',
      };
    }
  }

  return result;
}

/**
 * Checks if a field key is tagged as verifiable by convention or seed.
 */
function isFieldVerifiable(key: string): boolean {
  const verifiableKeywords = [
    'sla',
    'uptime',
    'latency',
    'throughput',
    'execution_speed',
    'backtest',
    'license',
    'registration',
    'regulation',
    'iso_',
    'soc_',
    'audit',
    'certification',
    'client_reference',
    'no_repaint_disclosed',
  ];
  const lower = key.toLowerCase();
  return verifiableKeywords.some((kw) => lower.includes(kw));
}

/**
 * Serializes provider master profile for public consumption.
 */
export function serializeProviderPublic(provider: any, options: SerializerOptions = {}) {
  const verifiedClaims = provider.verifiedClaims || [];

  // 1. Sanitize contacts (only public contacts shown publicly)
  const publicContacts = (provider.contacts || [])
    .filter((c: any) => options.preview || c.isPublic)
    .map((c: any) => ({
      id: c.id,
      fullName: c.fullName,
      jobTitle: c.jobTitle,
      email: c.email,
      phone: c.phone,
      isPrimary: c.isPrimary,
    }));

  // 2. Sanitize addresses (never expose private or registered addresses)
  const publicAddresses = (provider.addresses || [])
    .filter((a: any) => options.preview || (!a.isPrivate && a.type !== 'REGISTERED'))
    .map((a: any) => ({
      id: a.id,
      type: a.type,
      label: a.label,
      city: a.city,
      stateName: a.stateName,
      countryCode: a.countryCode,
    }));

  // 3. Sanitize social links
  const publicSocials = (provider.socialLinks || []).map((s: any) => ({
    id: s.id,
    platform: s.platform,
    url: s.url,
  }));

  // 4. Sanitize categories (only APPROVED categories in public)
  const categories = (provider.categorySelections || [])
    .filter((cs: any) => options.preview || cs.status === 'APPROVED')
    .map((cs: any) => ({
      id: cs.id,
      categoryNumber: cs.category?.number,
      categoryName: cs.category?.name,
      categorySlug: cs.category?.slug,
      isPrimary: cs.isPrimary,
      subcategory: cs.subcategory
        ? { id: cs.subcategory.id, key: cs.subcategory.key, label: cs.subcategory.label }
        : null,
      answers: filterAnswersForPublication(cs.answers || {}, cs.verifiedClaims || [], options),
      approvedAt: cs.reviewedAt,
    }));

  // 5. Sanitize team members (ownership % and private docs stripped)
  const teamMembers = (provider.teamMembers || [])
    .filter((tm: any) => options.preview || tm.reviewStatus === 'APPROVED')
    .map((tm: any) => {
      const isPublicOwnership = !!tm.ownershipPublicConsentAt;
      return {
        id: tm.id,
        fullName: tm.fullName,
        jobTitle: tm.jobTitle,
        department: tm.department,
        bio: tm.bio,
        photoUrl: tm.photoUrl,
        linkedinUrl: tm.linkedinUrl,
        founderRole: tm.founderRole,
        currentDesignation: tm.currentDesignation,
        ownershipDisclosure: tm.ownershipDisclosure,
        ...(isPublicOwnership && { ownershipPercentage: tm.ownershipPercentage }),
        associatedProducts: (tm.associatedProducts || []).map((ap: any) => ({
          productId: ap.productId,
          productName: ap.product?.name,
        })),
      };
    });

  // 6. Assemble public snapshot
  return {
    providerId: provider.id,
    providerCode: provider.providerCode,
    slug: provider.slug,
    name: provider.brandName || provider.legalName,
    legalName: provider.legalName,
    accountType: provider.accountType,
    website: provider.website,
    companyEmail: provider.companyEmail,
    logo: provider.logo,
    coverImage: provider.coverImage,
    tagline: provider.tagline,
    overview: provider.overview,
    headquartersCountryCode: provider.headquartersCountryCode,
    operatingRegions: provider.operatingRegions || [],
    languages: provider.languages || [],
    customerTypes: provider.customerTypes || [],
    companySize: provider.companySize,
    yearEstablished: provider.yearEstablished,
    supportAvailability: provider.supportAvailability,
    supportChannels: provider.supportChannels || [],
    timezone: provider.timezone,
    // Commercial (Form 6)
    pricingApproach: provider.pricingApproach,
    preferredContractType: provider.preferredContractType,
    acceptedCurrencies: provider.acceptedCurrencies || [],
    minimumEngagement: provider.minimumEngagement,
    presentationUrl: provider.presentationUrl,
    // Badge & Rating
    verifiedBadge: !!provider.verifiedAt,
    verifiedAt: provider.verifiedAt,
    avgRating: Number(provider.avgRating) || 0,
    totalReviews: provider.totalReviews || 0,
    // Sub-entities
    contacts: publicContacts,
    addresses: publicAddresses,
    socialLinks: publicSocials,
    categories,
    teamMembers,
    ...(options.preview && {
      previewMode: true,
      previewNotice: 'PREVIEW MODE — Contains unpublished or under-review changes',
    }),
  };
}

/**
 * Serializes product profile for public consumption.
 */
export function serializeProductPublic(product: any, options: SerializerOptions = {}) {
  const verifiedClaims = product.verifiedClaims || [];

  const media = (product.media || [])
    .filter((m: any) => options.preview || m.reviewStatus === 'APPROVED')
    .map((m: any) => ({
      id: m.id,
      kind: m.kind,
      mediaType: m.mediaType,
      url: m.url,
      videoUrl: m.videoUrl,
      title: m.title,
      description: m.description,
      isCover: m.isCover,
      displayOrder: m.displayOrder,
    }));

  const documents = (product.documents || [])
    .filter((d: any) => (options.preview || d.reviewStatus === 'APPROVED') && d.visibility === 'PUBLIC')
    .map((d: any) => ({
      id: d.id,
      name: d.name,
      docType: d.docType,
      fileUrl: d.fileUrl,
    }));

  const categoryDetails = (product.categoryDetails || []).map((cd: any) => ({
    categoryId: cd.categoryId,
    categoryNumber: cd.category?.number,
    answers: filterAnswersForPublication(cd.answers || {}, verifiedClaims, options),
  }));

  return {
    productId: product.id,
    providerId: product.providerId,
    providerName: product.provider?.brandName || product.provider?.legalName,
    providerSlug: product.provider?.slug,
    name: product.name,
    slug: product.slug,
    logo: product.logo,
    thumbnail: product.thumbnail,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    productType: product.productType,
    version: product.version,
    availability: product.availability,
    officialUrl: product.officialUrl,
    demoUrl: product.demoUrl,
    userGuideUrl: product.userGuideUrl,
    brochureUrl: product.brochureUrl,
    mainPurposes: product.mainPurposes || [],
    keyFeatures: product.keyFeatures || [],
    additionalFeatures: product.additionalFeatures || [],
    benefits: product.benefits,
    targetCustomers: product.targetCustomers || [],
    limitations: product.limitations,
    useCases: product.useCases,
    supportHours: product.supportHours,
    supportChannels: product.supportChannels || [],
    technicalSpec: product.technicalSpec
      ? {
          architecture: product.technicalSpec.architecture,
          deploymentModel: product.technicalSpec.deploymentModel,
          hostingRequirement: product.technicalSpec.hostingRequirement,
          operatingSystems: product.technicalSpec.operatingSystems || [],
          hardwareRequirements: product.technicalSpec.hardwareRequirements,
          supportedVersions: product.technicalSpec.supportedVersions,
          technicalDocUrl: product.technicalSpec.technicalDocUrl,
          securityFeatures: product.technicalSpec.securityFeatures || [],
          dataRetention: product.technicalSpec.dataRetention,
          implementationTime: product.technicalSpec.implementationTime,
          prerequisites: product.technicalSpec.prerequisites,
        }
      : null,
    integration: product.integration
      ? {
          supportedPlatforms: product.integration.supportedPlatforms || [],
          methods: product.integration.methods || [],
          capabilities: product.integration.capabilities || [],
          availability: product.integration.availability,
          partnerName: verifiedClaims.includes('integration_partner') ? product.integration.partnerName : undefined,
          documentationUrl: verifiedClaims.includes('integration_docs') ? product.integration.documentationUrl : undefined,
          integrationFee: product.integration.integrationFee,
        }
      : null,
    pricing: product.pricing
      ? {
          visibility: product.pricing.visibility,
          models: product.pricing.models || [],
          currency: product.pricing.currency,
          price: product.pricing.price ? Number(product.pricing.price) : null,
          contractDuration: product.pricing.contractDuration,
          freeTrial: product.pricing.freeTrial,
          trialDays: product.pricing.trialDays,
          pricingUrl: product.pricing.pricingUrl,
        }
      : null,
    media,
    documents,
    categoryDetails,
    ...(options.preview && {
      previewMode: true,
      previewNotice: 'PREVIEW MODE — Product draft preview',
    }),
  };
}

