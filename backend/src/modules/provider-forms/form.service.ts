import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const categoryCache = new Map<number, CacheEntry<any>>();
let optionListsCache: CacheEntry<any> | null = null;
let allCategoriesSummaryCache: CacheEntry<any> | null = null;

export class FormService {
  /**
   * Invalidate all form memory caches
   */
  public invalidateCache(): void {
    categoryCache.clear();
    optionListsCache = null;
    allCategoriesSummaryCache = null;
  }

  /**
   * Get all active categories with counts of subcategories and sections
   */
  async getCategories() {
    const now = Date.now();
    if (allCategoriesSummaryCache && allCategoriesSummaryCache.expiresAt > now) {
      return allCategoriesSummaryCache.data;
    }

    const categories = await prisma.providerCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            key: true,
            label: true,
            sortOrder: true,
          },
        },
        formSections: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            key: true,
            title: true,
            scope: true,
            sortOrder: true,
            _count: {
              select: { fields: { where: { isActive: true } } },
            },
          },
        },
      },
    });

    const result = categories.map((cat: any) => ({
      id: cat.id,
      number: cat.number,
      name: cat.name,
      slug: cat.slug,
      shortDescription: cat.shortDescription,
      fullDescription: cat.fullDescription,
      mainServices: cat.mainServices,
      icon: cat.icon,
      isPrimaryAllowed: cat.isPrimaryAllowed,
      sortOrder: cat.sortOrder,
      subcategories: cat.subcategories,
      sectionCount: cat.formSections.length,
      fieldCount: cat.formSections.reduce((acc: number, sec: any) => acc + sec._count.fields, 0),
      sections: cat.formSections.map((s: any) => ({
        id: s.id,
        key: s.key,
        title: s.title,
        scope: s.scope,
        sortOrder: s.sortOrder,
        fieldCount: s._count.fields,
      })),
    }));

    allCategoriesSummaryCache = {
      data: result,
      expiresAt: now + CACHE_TTL_MS,
    };

    return result;
  }

  /**
   * Get all option lists as a map of key -> items
   */
  async getOptionLists() {
    const now = Date.now();
    if (optionListsCache && optionListsCache.expiresAt > now) {
      return optionListsCache.data;
    }

    const lists = await prisma.providerOptionList.findMany({
      orderBy: { key: 'asc' },
    });

    const map: Record<string, any> = {};
    for (const list of lists) {
      map[list.key] = {
        id: list.id,
        key: list.key,
        name: list.label,
        description: list.description,
        items: list.items,
        isSystem: list.isSystem,
      };
    }

    optionListsCache = {
      data: map,
      expiresAt: now + CACHE_TTL_MS,
    };

    return map;
  }

  /**
   * Get complete definition for a category by its number (1–10).
   * Resolves options for fields that use optionSource: "LIST:<key>".
   */
  async getCategoryByNumber(categoryNumber: number) {
    const now = Date.now();
    const cached = categoryCache.get(categoryNumber);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const category = await prisma.providerCategory.findFirst({
      where: { number: categoryNumber, isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        formSections: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            fields: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!category) {
      throw new AppError(`Provider category #${categoryNumber} not found or inactive.`, StatusCodes.NOT_FOUND);
    }

    const optionLists = await this.getOptionLists();

    // Resolve options for all fields
    const resolvedSections = category.formSections.map((section: any) => ({
      ...section,
      fields: section.fields.map((field: any) => {
        let resolvedOptions = (field.options as any) || [];

        if (field.optionSource && field.optionSource.startsWith('LIST:')) {
          const listKey = field.optionSource.replace('LIST:', '');
          const optList = optionLists[listKey];
          if (optList && Array.isArray(optList.items)) {
            resolvedOptions = optList.items;
          }
        }

        return {
          ...field,
          resolvedOptions,
        };
      }),
    }));

    const result = {
      ...category,
      sections: resolvedSections,
    };

    categoryCache.set(categoryNumber, {
      data: result,
      expiresAt: now + CACHE_TTL_MS,
    });

    return result;
  }

  /**
   * Returns a flat array of all active CategoryFormField records for a category.
   */
  async getCategoryFields(categoryNumber: number) {
    const fullCat = await this.getCategoryByNumber(categoryNumber);
    return fullCat.sections.flatMap((s: any) => s.fields);
  }
}

export const formService = new FormService();
