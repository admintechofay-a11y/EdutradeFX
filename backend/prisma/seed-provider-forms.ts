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
  console.log('Provider forms, option lists, and agreements seeded successfully. Run "npm run seed:demo" for demo accounts.');
}
