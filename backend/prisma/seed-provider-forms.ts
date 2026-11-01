import {
  PrismaClient,
  AgreementAudience,
  AgreementKind,
  ProviderStatus,
  ProviderVerificationStatus,
  ProviderAccountType,
  ProviderCategoryStatus,
  ProductStatus,
  ProductAvailability,
  PricingVisibility,
  ModerationStatus,
  Role,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ALL_CATEGORY_DEFINITIONS, COMMON_OPTION_LISTS } from './data/provider-forms';

export async function seedProviderForms(prisma: PrismaClient) {
  console.log('--- Seeding Provider Option Lists ---');
  for (const list of Object.values(COMMON_OPTION_LISTS)) {
    await prisma.providerOptionList.upsert({
      where: { key: list.key },
      update: {
        label: list.label,
        items: list.items as any,
      },
      create: {
        key: list.key,
        label: list.label,
        items: list.items as any,
      },
    });
  }
  console.log(`Seeded ${Object.keys(COMMON_OPTION_LISTS).length} option lists`);

  console.log('--- Seeding 10 Categories and 79 Sections ---');
  for (const cat of ALL_CATEGORY_DEFINITIONS) {
    const categoryRecord = await prisma.providerCategory.upsert({
      where: { number: cat.number },
      update: {
        slug: cat.slug,
        name: cat.name,
        shortDescription: cat.shortDescription,
        mainServices: cat.mainServices,
        sortOrder: cat.sortOrder,
        hasProductForm: cat.hasProductForm,
        isActive: true,
      },
      create: {
        number: cat.number,
        slug: cat.slug,
        name: cat.name,
        shortDescription: cat.shortDescription,
        mainServices: cat.mainServices,
        sortOrder: cat.sortOrder,
        hasProductForm: cat.hasProductForm,
        isActive: true,
      },
    });

    // Seed subcategories
    for (const sub of cat.subcategories) {
      await prisma.providerSubcategory.upsert({
        where: {
          categoryId_key: {
            categoryId: categoryRecord.id,
            key: sub.key,
          },
        },
        update: {
          label: sub.label,
          sortOrder: sub.sortOrder,
          isActive: true,
        },
        create: {
          categoryId: categoryRecord.id,
          key: sub.key,
          label: sub.label,
          sortOrder: sub.sortOrder,
          isActive: true,
        },
      });
    }

    // Seed sections and fields
    for (const sec of cat.sections) {
      const sectionRecord = await prisma.categoryFormSection.upsert({
        where: {
          categoryId_key_scope: {
            categoryId: categoryRecord.id,
            key: sec.key,
            scope: (sec.scope as any) || 'PROVIDER',
          },
        },
        update: {
          title: sec.title,
          description: sec.description || null,
          sortOrder: sec.sortOrder,
          isActive: true,
        },
        create: {
          categoryId: categoryRecord.id,
          key: sec.key,
          title: sec.title,
          description: sec.description || null,
          scope: (sec.scope as any) || 'PROVIDER',
          sortOrder: sec.sortOrder,
          isActive: true,
        },
      });

      // Seed fields in section
      for (const field of sec.fields) {
        await prisma.categoryFormField.upsert({
          where: {
            sectionId_key: {
              sectionId: sectionRecord.id,
              key: field.key,
            },
          },
          update: {
            label: field.label,
            helpText: field.helpText || null,
            type: field.type as any,
            required: field.required || false,
            scope: (sec.scope as any) || 'PROVIDER',
            options: (field.options as any) || undefined,
            optionSource: field.optionSource || null,
            allowOther: field.allowOther || false,
            unitOptions: field.unitOptions || [],
            statuses: field.statuses || [],
            validation: (field.validation as any) || undefined,
            visibleWhen: (field.visibleWhen as any) || undefined,
            disjointWith: field.disjointWith || null,
            visibility: (field.visibility as any) || 'PUBLIC',
            claim: (field.claim as any) || 'DECLARED',
            sortOrder: field.sortOrder,
            isActive: true,
          },
          create: {
            sectionId: sectionRecord.id,
            key: field.key,
            label: field.label,
            helpText: field.helpText || null,
            type: field.type as any,
            required: field.required || false,
            scope: (sec.scope as any) || 'PROVIDER',
            options: (field.options as any) || undefined,
            optionSource: field.optionSource || null,
            allowOther: field.allowOther || false,
            unitOptions: field.unitOptions || [],
            statuses: field.statuses || [],
            validation: (field.validation as any) || undefined,
            visibleWhen: (field.visibleWhen as any) || undefined,
            disjointWith: field.disjointWith || null,
            visibility: (field.visibility as any) || 'PUBLIC',
            claim: (field.claim as any) || 'DECLARED',
            sortOrder: field.sortOrder,
            isActive: true,
            schemaVersion: 1,
          },
        });
      }
    }
  }
  console.log('Seeded all 10 categories, subcategories, sections, and fields.');

  // Seed Partner Agreements for SERVICE_PROVIDER
  console.log('--- Seeding Service Provider Agreements & Declarations ---');
  const spAgreements = [
    {
      key: 'PROVIDER_LISTING_TERMS',
      kind: AgreementKind.AGREEMENT,
      title: 'EduTradeFX Solutions Provider Listing Terms',
      body: '[DRAFT — replace with legal-approved text before launch] Standard terms and conditions governing solutions provider listings, profile publication, service representations, and provider commitments on EduTradeFX.',
    },
    {
      key: 'DECL_INFORMATION_ACCURATE',
      kind: AgreementKind.DECLARATION,
      title: 'Declaration of Information Accuracy',
      body: 'I confirm that the information submitted is accurate.',
    },
    {
      key: 'DECL_AUTHORISED_TO_SUBMIT',
      kind: AgreementKind.DECLARATION,
      title: 'Declaration of Authorization',
      body: 'I am authorised to submit information for this company.',
    },
    {
      key: 'DECL_PUBLISHING_RIGHTS',
      kind: AgreementKind.DECLARATION,
      title: 'Declaration of Publishing Rights',
      body: 'I have permission to publish uploaded logos, images and documents.',
    },
    {
      key: 'DECL_NO_GUARANTEE_OF_APPROVAL',
      kind: AgreementKind.DECLARATION,
      title: 'Declaration of Review Understanding',
      body: 'I understand that submission does not guarantee approval or verification.',
    },
    {
      key: 'VERIFICATION_CONSENT',
      kind: AgreementKind.COMMITMENT,
      title: 'Verification Consent and Compliance',
      body: 'The company consents to administrative verification of submitted regulatory, corporate, and performance claims.',
    },
  ];

  for (const ag of spAgreements) {
    await prisma.partnerAgreement.upsert({
      where: {
        audience_key: {
          audience: AgreementAudience.SERVICE_PROVIDER,
          key: ag.key,
        },
      },
      update: { title: ag.title, body: ag.body, kind: ag.kind },
      create: {
        audience: AgreementAudience.SERVICE_PROVIDER,
        kind: ag.kind,
        key: ag.key,
        title: ag.title,
        body: ag.body,
        version: 1,
        isActive: true,
      },
    });
  }
  console.log('Seeded Service Provider agreements and declarations');

  // Seed Dev-only demo provider "Demo Solutions Ltd" (guarded against production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('--- Seeding Dev-only Demo Solutions Provider ---');
    const demoEmail = 'provider@solutionsdemo.com';
    let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash('DemoPass123!@#', 10);
      demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          password: hashedPassword,
          name: 'Demo Solutions Admin',
          role: Role.SERVICE_PROVIDER,
          isEmailVerified: true,
          isActive: true,
        },
      });
    }

    const demoProvider = await prisma.serviceProvider.upsert({
      where: { userId: demoUser.id },
      update: {
        legalName: 'Demo Solutions Ltd',
        brandName: 'Demo Solutions',
        status: ProviderStatus.APPROVED,
        verificationStatus: ProviderVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        tagline: 'Leading multi-asset trading technology and connectivity',
        overview: '<p>Demo Solutions Ltd provides cutting-edge liquidity aggregation, CRM systems, and hosting solutions for retail and institutional brokers.</p>',
        website: 'https://demo-solutions.example.com',
        companyEmail: 'contact@solutionsdemo.com',
        headquartersCountryCode: 'GB',
        operatingRegions: ['UK_EUROPE_EEA', 'MIDDLE_EAST', 'SOUTH_ASIA'],
        companySize: '51_200',
        customerTypes: ['RETAIL_FOREX_BROKERS', 'INSTITUTIONAL_BROKERS', 'PROP_TRADING_FIRMS'],
        languages: ['en', 'fr', 'ar'],
        supportAvailability: '24_7',
        supportChannels: ['BUSINESS_EMAIL', 'LIVE_CHAT', 'SUPPORT_TICKET', 'TELEPHONE'],
        publicContactPreference: 'MULTIPLE_METHODS',
        supportDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        timezone: 'Europe/London',
        completionPercent: 100,
        providerCode: 'ETP-000101',
        applicationRef: 'APP-2026-000101',
      },
      create: {
        userId: demoUser.id,
        slug: 'demo-solutions-ltd',
        legalName: 'Demo Solutions Ltd',
        brandName: 'Demo Solutions',
        accountType: ProviderAccountType.REGISTERED_COMPANY,
        status: ProviderStatus.APPROVED,
        verificationStatus: ProviderVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        providerCode: 'ETP-000101',
        applicationRef: 'APP-2026-000101',
        tagline: 'Leading multi-asset trading technology and connectivity',
        overview: '<p>Demo Solutions Ltd provides cutting-edge liquidity aggregation, CRM systems, and hosting solutions for retail and institutional brokers.</p>',
        website: 'https://demo-solutions.example.com',
        companyEmail: 'contact@solutionsdemo.com',
        headquartersCountryCode: 'GB',
        operatingRegions: ['UK_EUROPE_EEA', 'MIDDLE_EAST', 'SOUTH_ASIA'],
        companySize: '51_200',
        customerTypes: ['RETAIL_FOREX_BROKERS', 'INSTITUTIONAL_BROKERS', 'PROP_TRADING_FIRMS'],
        languages: ['en', 'fr', 'ar'],
        supportAvailability: '24_7',
        supportChannels: ['BUSINESS_EMAIL', 'LIVE_CHAT', 'SUPPORT_TICKET', 'TELEPHONE'],
        publicContactPreference: 'MULTIPLE_METHODS',
        supportDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        timezone: 'Europe/London',
        completionPercent: 100,
      },
    });

    // Primary Contact
    await prisma.providerContact.upsert({
      where: { id: `contact-${demoProvider.id}` },
      update: {},
      create: {
        id: `contact-${demoProvider.id}`,
        providerId: demoProvider.id,
        fullName: 'Alexander Wright',
        jobTitle: 'Chief Technology Officer',
        email: 'alex.wright@solutionsdemo.com',
        phone: '+442079460912',
        isPrimary: true,
        isPublic: true,
      },
    });

    // Select Categories 01, 03, 06
    const selectedCats = [1, 3, 6];
    for (const cnum of selectedCats) {
      const catRec = await prisma.providerCategory.findUnique({ where: { number: cnum } });
      if (catRec) {
        await prisma.providerCategorySelection.upsert({
          where: {
            providerId_categoryId: {
              providerId: demoProvider.id,
              categoryId: catRec.id,
            },
          },
          update: {
            status: ProviderCategoryStatus.APPROVED,
            isSelected: true,
            completionPercent: 100,
          },
          create: {
            providerId: demoProvider.id,
            categoryId: catRec.id,
            status: ProviderCategoryStatus.APPROVED,
            isSelected: true,
            completionPercent: 100,
            answers: {
              serviceTypes: ['LIQUIDITY_BRIDGE', 'LIQUIDITY_AGGREGATOR', 'RISK_MANAGEMENT_SOFTWARE'],
            },
          },
        });
      }
    }

    // Seed 2 Demo Products
    const cat1 = await prisma.providerCategory.findUnique({ where: { number: 1 } });
    const cat3 = await prisma.providerCategory.findUnique({ where: { number: 3 } });

    const prod1 = await prisma.serviceProviderProduct.upsert({
      where: {
        providerId_slug: {
          providerId: demoProvider.id,
          slug: 'demo-bridge-engine-x1',
        },
      },
      update: {
        status: ProductStatus.APPROVED,
      },
      create: {
        providerId: demoProvider.id,
        slug: 'demo-bridge-engine-x1',
        name: 'Demo Bridge Engine X1',
        shortDescription: 'Ultra-low latency liquidity bridge & order routing engine',
        fullDescription: '<p>High-performance bridge connecting MT4, MT5, and cTrader to over 30 tier-1 liquidity venues.</p>',
        productType: 'BRIDGE_GATEWAY',
        availability: ProductAvailability.AVAILABLE,
        status: ProductStatus.APPROVED,
        officialUrl: 'https://demo-solutions.example.com/bridge-x1',
      },
    });

    if (cat1) {
      await prisma.productCategoryLink.upsert({
        where: {
          productId_categoryId_subcategoryKey: {
            productId: prod1.id,
            categoryId: cat1.id,
            subcategoryKey: 'BRIDGE_ENGINE',
          },
        },
        update: {},
        create: {
          productId: prod1.id,
          categoryId: cat1.id,
          subcategoryKey: 'BRIDGE_ENGINE',
          isPrimary: true,
        },
      });
    }

    // Seed Pricing for prod1
    await prisma.productPricing.upsert({
      where: { productId: prod1.id },
      update: {},
      create: {
        productId: prod1.id,
        visibility: PricingVisibility.STARTING_PRICE,
        currency: 'USD',
        price: 1500,
        monthlyFee: { mode: 'AMOUNT', amount: 1500 },
        setupFee: { mode: 'AMOUNT', amount: 1000 },
      },
    });

    const prod2 = await prisma.serviceProviderProduct.upsert({
      where: {
        providerId_slug: {
          providerId: demoProvider.id,
          slug: 'demo-forex-crm-cloud',
        },
      },
      update: {
        status: ProductStatus.APPROVED,
      },
      create: {
        providerId: demoProvider.id,
        slug: 'demo-forex-crm-cloud',
        name: 'Demo Forex CRM Cloud',
        shortDescription: 'Comprehensive CRM and IB management portal for FX brokers',
        fullDescription: '<p>Complete multi-tiered IB portal, automated onboarding, KYC workflow, and trader room.</p>',
        productType: 'SOFTWARE',
        availability: ProductAvailability.AVAILABLE,
        status: ProductStatus.APPROVED,
        officialUrl: 'https://demo-solutions.example.com/crm',
      },
    });

    if (cat3) {
      await prisma.productCategoryLink.upsert({
        where: {
          productId_categoryId_subcategoryKey: {
            productId: prod2.id,
            categoryId: cat3.id,
            subcategoryKey: 'FOREX_CRM',
          },
        },
        update: {},
        create: {
          productId: prod2.id,
          categoryId: cat3.id,
          subcategoryKey: 'FOREX_CRM',
          isPrimary: true,
        },
      });
    }

    // Seed Pricing for prod2
    await prisma.productPricing.upsert({
      where: { productId: prod2.id },
      update: {},
      create: {
        productId: prod2.id,
        visibility: PricingVisibility.CUSTOM_QUOTE,
        currency: 'USD',
      },
    });

    // Seed Published Snapshot for demo provider
    await prisma.publishedProvider.upsert({
      where: { providerId: demoProvider.id },
      update: {
        name: 'Demo Solutions Ltd',
        slug: 'demo-solutions-ltd',
        headquartersCountryCode: 'GB',
        operatingRegions: ['UK_EUROPE_EEA', 'MIDDLE_EAST', 'SOUTH_ASIA'],
        categoryNumbers: [1, 3, 6],
        languages: ['en', 'fr', 'ar'],
        customerTypes: ['RETAIL_FOREX_BROKERS', 'INSTITUTIONAL_BROKERS', 'PROP_TRADING_FIRMS'],
        companySize: '51_200',
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
        verified: true,
        ratingAvg: 4.8,
        ratingCount: 12,
        snapshot: {
          id: demoProvider.id,
          slug: 'demo-solutions-ltd',
          legalName: 'Demo Solutions Ltd',
          brandName: 'Demo Solutions',
          tagline: 'Leading multi-asset trading technology and connectivity',
          overview: '<p>Demo Solutions Ltd provides cutting-edge liquidity aggregation, CRM systems, and hosting solutions for retail and institutional brokers.</p>',
          website: 'https://demo-solutions.example.com',
          companyEmail: 'contact@solutionsdemo.com',
          headquartersCountryCode: 'GB',
          operatingRegions: ['UK_EUROPE_EEA', 'MIDDLE_EAST', 'SOUTH_ASIA'],
          categories: [
            { number: 1, name: 'Trading Technology, Liquidity Bridges & Risk Management' },
            { number: 3, name: 'CRM, Back Office & Client Management' },
            { number: 6, name: 'Hosting, VPS & Trading Infrastructure' },
          ],
          productsCount: 2,
          verified: true,
        },
      },
      create: {
        providerId: demoProvider.id,
        name: 'Demo Solutions Ltd',
        slug: 'demo-solutions-ltd',
        headquartersCountryCode: 'GB',
        operatingRegions: ['UK_EUROPE_EEA', 'MIDDLE_EAST', 'SOUTH_ASIA'],
        categoryNumbers: [1, 3, 6],
        languages: ['en', 'fr', 'ar'],
        customerTypes: ['RETAIL_FOREX_BROKERS', 'INSTITUTIONAL_BROKERS', 'PROP_TRADING_FIRMS'],
        companySize: '51_200',
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
        verified: true,
        ratingAvg: 4.8,
        ratingCount: 12,
        snapshot: {
          id: demoProvider.id,
          slug: 'demo-solutions-ltd',
          legalName: 'Demo Solutions Ltd',
          brandName: 'Demo Solutions',
          tagline: 'Leading multi-asset trading technology and connectivity',
          overview: '<p>Demo Solutions Ltd provides cutting-edge liquidity aggregation, CRM systems, and hosting solutions for retail and institutional brokers.</p>',
          website: 'https://demo-solutions.example.com',
          companyEmail: 'contact@solutionsdemo.com',
          headquartersCountryCode: 'GB',
          operatingRegions: ['UK_EUROPE_EEA', 'MIDDLE_EAST', 'SOUTH_ASIA'],
          categories: [
            { number: 1, name: 'Trading Technology, Liquidity Bridges & Risk Management' },
            { number: 3, name: 'CRM, Back Office & Client Management' },
            { number: 6, name: 'Hosting, VPS & Trading Infrastructure' },
          ],
          productsCount: 2,
          verified: true,
        },
      },
    });

    console.log('Seeded demo provider with 3 categories and 2 products.');
  }
}
