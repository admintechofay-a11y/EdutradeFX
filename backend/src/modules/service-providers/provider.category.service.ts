import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import { ProviderCategoryStatus, ProviderStatus } from '@prisma/client';
import { formService } from '../provider-forms/form.service';
import {
  buildAnswerSchema,
  calculateCategoryCompletion,
} from '../provider-forms/form.engine';
import {
  generateProviderCode,
  generateApplicationRef,
  calculateOverallCompletion,
} from './provider.utils';

export class ProviderCategoryService {
  /**
   * Retrieves provider's selected categories
   */
  async getMyCategories(userId: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const selections = await prisma.providerCategorySelection.findMany({
      where: { providerId: provider.id, isSelected: true },
      include: {
        category: {
          select: {
            id: true,
            number: true,
            name: true,
            slug: true,
            icon: true,
            shortDescription: true,
            isPrimaryAllowed: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            key: true,
            label: true,
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    return selections;
  }

  /**
   * Selects / updates provider category selections.
   */
  async selectCategories(
    userId: string,
    data: {
      categoryNumbers: number[];
      primaryCategoryNumber: number;
      subcategories?: Record<string, string[]>;
    }
  ) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const allCategories = await prisma.providerCategory.findMany({
      where: { number: { in: data.categoryNumbers }, isActive: true },
    });

    if (allCategories.length !== data.categoryNumbers.length) {
      throw new AppError('One or more selected categories are invalid or inactive.', StatusCodes.BAD_REQUEST);
    }

    const primaryCat = allCategories.find((c) => c.number === data.primaryCategoryNumber);
    if (!primaryCat) {
      throw new AppError('Primary category must be among selected categories.', StatusCodes.BAD_REQUEST);
    }
    if (!primaryCat.isPrimaryAllowed) {
      throw new AppError(`Category '${primaryCat.name}' cannot be set as primary category.`, StatusCodes.BAD_REQUEST);
    }

    await prisma.$transaction(async (tx) => {
      // Deactivate categories not in selected list
      await tx.providerCategorySelection.updateMany({
        where: {
          providerId: provider.id,
          category: { number: { notIn: data.categoryNumbers } },
        },
        data: {
          isSelected: false,
          isPrimary: false,
          deselectedAt: new Date(),
        },
      });

      // Upsert selected categories
      for (const cat of allCategories) {
        const isPrimary = cat.number === data.primaryCategoryNumber;
        const subId = data.subcategories?.[String(cat.number)]?.[0] || null;

        const existing = await tx.providerCategorySelection.findUnique({
          where: {
            providerId_categoryId: {
              providerId: provider.id,
              categoryId: cat.id,
            },
          },
        });

        if (existing) {
          await tx.providerCategorySelection.update({
            where: { id: existing.id },
            data: {
              isSelected: true,
              isPrimary,
              deselectedAt: null,
              ...(subId && { subcategoryId: subId }),
            },
          });
        } else {
          await tx.providerCategorySelection.create({
            data: {
              providerId: provider.id,
              categoryId: cat.id,
              isPrimary,
              isSelected: true,
              subcategoryId: subId,
              status: ProviderCategoryStatus.DRAFT,
              completionPercent: 0,
              answers: {},
            },
          });
        }
      }
    });

    await calculateOverallCompletion(provider.id);
    return this.getMyCategories(userId);
  }

  /**
   * Retrieves category definition and current provider answers.
   */
  async getCategoryForm(userId: string, categoryNumber: number) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const categoryDef = await formService.getCategoryByNumber(categoryNumber);

    const selection = await prisma.providerCategorySelection.findUnique({
      where: {
        providerId_categoryId: {
          providerId: provider.id,
          categoryId: categoryDef.id,
        },
      },
      include: {
        subcategory: true,
      },
    });

    const activeFields = categoryDef.sections.flatMap((s: any) => s.fields);
    const answers = (selection?.answers as Record<string, any>) || {};
    const completion = calculateCategoryCompletion(answers, activeFields);

    return {
      category: categoryDef,
      selection,
      answers,
      completion,
    };
  }

  /**
   * Saves partial draft answers for a category.
   */
  async saveCategoryDraft(
    userId: string,
    categoryNumber: number,
    answers: Record<string, any>,
    subcategoryId?: string | null
  ) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const categoryDef = await formService.getCategoryByNumber(categoryNumber);
    const activeFields = categoryDef.sections.flatMap((s: any) => s.fields);

    // Validate partial draft
    const draftSchema = buildAnswerSchema(activeFields, { mode: 'draft' });
    const parsedAnswers = draftSchema.parse(answers);

    // Calculate completion
    const completion = calculateCategoryCompletion(parsedAnswers, activeFields);

    const selection = await prisma.providerCategorySelection.upsert({
      where: {
        providerId_categoryId: {
          providerId: provider.id,
          categoryId: categoryDef.id,
        },
      },
      update: {
        answers: parsedAnswers,
        completionPercent: completion.percentage,
        isSelected: true,
        ...(subcategoryId && { subcategoryId }),
        updatedAt: new Date(),
      },
      create: {
        providerId: provider.id,
        categoryId: categoryDef.id,
        answers: parsedAnswers,
        completionPercent: completion.percentage,
        subcategoryId: subcategoryId || null,
        isSelected: true,
        status: ProviderCategoryStatus.DRAFT,
      },
    });

    await calculateOverallCompletion(provider.id);

    return {
      selection,
      completion,
    };
  }

  /**
   * Submits a category for review with full validation.
   */
  async submitCategory(
    userId: string,
    categoryNumber: number,
    answers: Record<string, any>,
    subcategoryId?: string | null
  ) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true, providerCode: true, applicationRef: true, status: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const categoryDef = await formService.getCategoryByNumber(categoryNumber);
    const activeFields = categoryDef.sections.flatMap((s: any) => s.fields);

    // Full submit validation
    const submitSchema = buildAnswerSchema(activeFields, { mode: 'submit' });
    const parsedAnswers = submitSchema.parse(answers);

    const completion = calculateCategoryCompletion(parsedAnswers, activeFields);
    if (completion.missingFields.length > 0) {
      throw new AppError(
        `Cannot submit category. Missing required fields: ${completion.missingFields.join(', ')}`,
        StatusCodes.BAD_REQUEST
      );
    }

    // Ensure provider code and application reference
    let providerCode = provider.providerCode;
    if (!providerCode) {
      providerCode = await generateProviderCode();
    }

    let applicationRef = provider.applicationRef;
    if (!applicationRef) {
      applicationRef = await generateApplicationRef();
    }

    const updatedProvider = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: {
        providerCode,
        applicationRef,
        ...(provider.status === ProviderStatus.DRAFT && {
          status: ProviderStatus.SUBMITTED,
          submittedAt: new Date(),
        }),
      },
    });

    // Update selection to SUBMITTED
    const selection = await prisma.providerCategorySelection.upsert({
      where: {
        providerId_categoryId: {
          providerId: provider.id,
          categoryId: categoryDef.id,
        },
      },
      update: {
        answers: parsedAnswers,
        completionPercent: 100,
        status: ProviderCategoryStatus.SUBMITTED,
        submittedAt: new Date(),
        isSelected: true,
        ...(subcategoryId && { subcategoryId }),
      },
      create: {
        providerId: provider.id,
        categoryId: categoryDef.id,
        answers: parsedAnswers,
        completionPercent: 100,
        status: ProviderCategoryStatus.SUBMITTED,
        submittedAt: new Date(),
        isSelected: true,
        subcategoryId: subcategoryId || null,
      },
    });

    await calculateOverallCompletion(provider.id);

    return {
      selection,
      providerCode: updatedProvider.providerCode,
      applicationRef: updatedProvider.applicationRef,
      providerStatus: updatedProvider.status,
    };
  }
}

export const providerCategoryService = new ProviderCategoryService();
