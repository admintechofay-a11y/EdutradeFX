import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import { formService } from './form.service';

export class FormAdminService {
  // ── CATEGORIES ──────────────────────────────────────────────────────────
  async createCategory(data: any) {
    const existing = await prisma.providerCategory.findFirst({
      where: { OR: [{ number: data.number }, { slug: data.slug }] },
    });
    if (existing) {
      throw new AppError('Category with this number or slug already exists', StatusCodes.CONFLICT);
    }

    const cat = await prisma.providerCategory.create({ data });
    formService.invalidateCache();
    return cat;
  }

  async updateCategory(id: string, data: any) {
    const cat = await prisma.providerCategory.update({
      where: { id },
      data,
    });
    formService.invalidateCache();
    return cat;
  }

  async deleteCategory(id: string) {
    // Soft delete to protect existing category submissions
    const cat = await prisma.providerCategory.update({
      where: { id },
      data: { isActive: false },
    });
    formService.invalidateCache();
    return cat;
  }

  // ── SUBCATEGORIES ───────────────────────────────────────────────────────
  async createSubcategory(data: any) {
    const sub = await prisma.providerSubcategory.create({ data });
    formService.invalidateCache();
    return sub;
  }

  async updateSubcategory(id: string, data: any) {
    const sub = await prisma.providerSubcategory.update({
      where: { id },
      data,
    });
    formService.invalidateCache();
    return sub;
  }

  async deleteSubcategory(id: string) {
    const sub = await prisma.providerSubcategory.update({
      where: { id },
      data: { isActive: false },
    });
    formService.invalidateCache();
    return sub;
  }

  // ── SECTIONS ────────────────────────────────────────────────────────────
  async createSection(data: any) {
    const existing = await prisma.categoryFormSection.findUnique({
      where: {
        categoryId_key_scope: {
          categoryId: data.categoryId,
          key: data.key,
          scope: data.scope || 'PROVIDER',
        },
      },
    });
    if (existing) {
      throw new AppError(`Section '${data.key}' with scope '${data.scope || 'PROVIDER'}' already exists in this category`, StatusCodes.CONFLICT);
    }

    const section = await prisma.categoryFormSection.create({ data });
    formService.invalidateCache();
    return section;
  }

  async updateSection(id: string, data: any) {
    const section = await prisma.categoryFormSection.update({
      where: { id },
      data,
    });
    formService.invalidateCache();
    return section;
  }

  async deleteSection(id: string) {
    const section = await prisma.categoryFormSection.update({
      where: { id },
      data: { isActive: false },
    });
    formService.invalidateCache();
    return section;
  }

  // ── FIELDS ──────────────────────────────────────────────────────────────
  async createField(data: any) {
    const existing = await prisma.categoryFormField.findUnique({
      where: {
        sectionId_key: {
          sectionId: data.sectionId,
          key: data.key,
        },
      },
    });
    if (existing) {
      throw new AppError(`Field '${data.key}' already exists in this section`, StatusCodes.CONFLICT);
    }

    const field = await prisma.categoryFormField.create({ data });
    formService.invalidateCache();
    return field;
  }

  async updateField(id: string, data: any) {
    const field = await prisma.categoryFormField.update({
      where: { id },
      data,
    });
    formService.invalidateCache();
    return field;
  }

  async deleteField(id: string) {
    const field = await prisma.categoryFormField.update({
      where: { id },
      data: { isActive: false },
    });
    formService.invalidateCache();
    return field;
  }

  // ── OPTION LISTS ────────────────────────────────────────────────────────
  async createOptionList(data: any) {
    const existing = await prisma.providerOptionList.findUnique({
      where: { key: data.key },
    });
    if (existing) {
      throw new AppError(`Option list with key '${data.key}' already exists`, StatusCodes.CONFLICT);
    }

    const list = await prisma.providerOptionList.create({ data });
    formService.invalidateCache();
    return list;
  }

  async updateOptionList(id: string, data: any) {
    const list = await prisma.providerOptionList.update({
      where: { id },
      data,
    });
    formService.invalidateCache();
    return list;
  }

  async deleteOptionList(id: string) {
    const existing = await prisma.providerOptionList.findUnique({ where: { id } });
    if (existing?.isSystem) {
      throw new AppError('Cannot delete system option list', StatusCodes.FORBIDDEN);
    }

    const list = await prisma.providerOptionList.delete({ where: { id } });
    formService.invalidateCache();
    return list;
  }

  // ── REORDERING ──────────────────────────────────────────────────────────
  async reorderSections(items: { id: string; sortOrder: number }[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.categoryFormSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
    formService.invalidateCache();
    return { success: true };
  }

  async reorderFields(items: { id: string; sortOrder: number }[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.categoryFormField.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
    formService.invalidateCache();
    return { success: true };
  }
}

export const formAdminService = new FormAdminService();

