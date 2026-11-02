import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import { ProviderCategoryStatus, ProviderStatus, Prisma } from '@prisma/client';
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
      // Find categories not in selected list to deactivate
      const toDeselect = await tx.providerCategorySelection.findMany({
        where: {
          providerId: provider.id,
          category: { number: { notIn: data.categoryNumbers } },
          isSelected: true,
        },
        select: { id: true },
      });

      if (toDeselect.length > 0) {
        await tx.providerCategorySelection.updateMany({
          where: {
            id: { in: toDeselect.map((s) => s.id) },
          },
          data: {
            isSelected: false,
            isPrimary: false,
            deselectedAt: new Date(),
          },
        });
      }

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
              subcategoryId: subId || null,
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
              answers: {} as Prisma.InputJsonObject,
            },
          });
        }
      }
    });

    await calculateOverallCompletion(provider.id);
    return this.getMyCategories(userId);
  }

  /**
   * Helper to resolve Category definition whether given a number or selection/category ID.
   */
  async resolveCategoryDef(categoryIdentifier: number | string) {
    if (typeof categoryIdentifier === 'number' || /^\d+$/.test(String(categoryIdentifier))) {
      return formService.getCategoryByNumber(parseInt(String(categoryIdentifier), 10));
    }
    const selection = await prisma.providerCategorySelection.findUnique({
      where: { id: String(categoryIdentifier) },
      include: { category: true },
    });
    if (selection) {
      return formService.getCategoryByNumber(selection.category.number);
    }
    const directCat = await prisma.providerCategory.findUnique({
      where: { id: String(categoryIdentifier) },
    });
    if (directCat) {
      return formService.getCategoryByNumber(directCat.number);
    }
    throw new AppError('Category definition not found.', StatusCodes.NOT_FOUND);
  }

  /**
   * Retrieves category definition and current provider answers.
   */
  async getCategoryForm(userId: string, categoryNumber: number | string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const categoryDef = await this.resolveCategoryDef(categoryNumber);

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
    categoryNumber: number | string,
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

    const categoryDef = await this.resolveCategoryDef(categoryNumber);
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
        answers: parsedAnswers as Prisma.InputJsonObject,
        completionPercent: completion.percentage,
        isSelected: true,
        subcategoryId: subcategoryId !== undefined ? (subcategoryId || null) : undefined,
        updatedAt: new Date(),
      },
      create: {
        providerId: provider.id,
        categoryId: categoryDef.id,
        answers: parsedAnswers as Prisma.InputJsonObject,
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
    categoryNumber: number | string,
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

    const categoryDef = await this.resolveCategoryDef(categoryNumber);
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
        answers: parsedAnswers as Prisma.InputJsonObject,
        completionPercent: 100,
        status: ProviderCategoryStatus.SUBMITTED,
        submittedAt: new Date(),
        isSelected: true,
        subcategoryId: subcategoryId !== undefined ? (subcategoryId || null) : undefined,
      },
      create: {
        providerId: provider.id,
        categoryId: categoryDef.id,
        answers: parsedAnswers as Prisma.InputJsonObject,
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
