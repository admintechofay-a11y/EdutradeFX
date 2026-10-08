import { prisma } from '../../config/database';
import { BrokerOptionGroup, Prisma } from '@prisma/client';
import { cache } from '../../utils/cache.utils';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';

export class OptionsService {
  /**
   * Fetch active options by group(s) with caching (10 min)
   */
  async getOptions(groups?: BrokerOptionGroup[]) {
    const targetGroups = groups && groups.length > 0 ? groups : (Object.values(BrokerOptionGroup) as BrokerOptionGroup[]);
    const cacheKey = `options:${targetGroups.sort().join(',')}`;

    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const options = await prisma.brokerOption.findMany({
      where: {
        group: { in: targetGroups },
        isActive: true,
      },
      select: {
        group: true,
        code: true,
        label: true,
        meta: true,
        sortOrder: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { label: 'asc' },
      ],
    });

    let result: any;
    if (groups && groups.length === 1) {
      // Single group returns flat array: [{ code, label, meta }]
      result = options.map((o) => ({
        code: o.code,
        label: o.label,
        meta: o.meta,
      }));
    } else {
      // Multiple groups returns dictionary: { [group]: [{ code, label, meta }] }
      const grouped: Record<string, Array<{ code: string; label: string; meta: any }>> = {};
      for (const g of targetGroups) {
        grouped[g] = [];
      }
      for (const o of options) {
        if (!grouped[o.group]) grouped[o.group] = [];
        grouped[o.group].push({
          code: o.code,
          label: o.label,
          meta: o.meta,
        });
      }
      result = grouped;
    }

    // Cache in Redis / memory for 10 minutes (600s)
    await cache.set(cacheKey, result, 600);
    return result;
  }

  /**
   * Generates ETag for options response
   */
  generateETag(data: any): string {
    const str = JSON.stringify(data);
    return `"${crypto.createHash('md5').update(str).digest('hex')}"`;
  }

  /**
   * Admin list options with filtering and search
   */
  async getAdminOptions(filter: { group?: BrokerOptionGroup; search?: string; isActive?: boolean }) {
    const where: Prisma.BrokerOptionWhereInput = {};
    if (filter.group) where.group = filter.group;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.search) {
      where.OR = [
        { code: { contains: filter.search, mode: 'insensitive' } },
        { label: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.brokerOption.findMany({
      where,
      orderBy: [
        { group: 'asc' },
        { sortOrder: 'asc' },
        { label: 'asc' },
      ],
    });
  }

  /**
   * Admin create new option
   */
  async createOption(adminUserId: string, data: { group: BrokerOptionGroup; code: string; label: string; sortOrder?: number; meta?: any }) {
    const existing = await prisma.brokerOption.findUnique({
      where: { group_code: { group: data.group, code: data.code } },
    });

    if (existing) {
      throw new AppError(`Option with code '${data.code}' already exists in group '${data.group}'`, StatusCodes.BAD_REQUEST);
    }

    const created = await prisma.brokerOption.create({
      data: {
        group: data.group,
        code: data.code,
        label: data.label,
        sortOrder: data.sortOrder ?? 0,
        meta: data.meta ?? {},
        isActive: true,
      },
    });

    // Invalidate caches
    await cache.del('options:*');

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminUserId,
        action: 'CREATE_BROKER_OPTION',
        targetType: 'BROKER_OPTION',
        targetId: created.id,
        metadata: { group: created.group, code: created.code, label: created.label },
      },
    });

    return created;
  }

  /**
   * Admin update option (label, sortOrder, isActive, meta - code cannot be changed once referenced)
   */
  async updateOption(adminUserId: string, id: string, data: { label?: string; sortOrder?: number; isActive?: boolean; meta?: any }) {
    const option = await prisma.brokerOption.findUnique({
      where: { id },
    });

    if (!option) {
      throw new AppError('Broker option not found', StatusCodes.NOT_FOUND);
    }

    const updated = await prisma.brokerOption.update({
      where: { id },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.meta !== undefined && { meta: data.meta }),
      },
    });

    // Invalidate caches
    await cache.del('options:*');

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminUserId,
        action: 'UPDATE_BROKER_OPTION',
        targetType: 'BROKER_OPTION',
        targetId: updated.id,
        metadata: {
          oldData: { label: option.label, sortOrder: option.sortOrder, isActive: option.isActive },
          newData: { label: updated.label, sortOrder: updated.sortOrder, isActive: updated.isActive },
        },
      },
    });

    return updated;
  }

  /**
   * Fast verification if code exists and is active
   */
  async isValidCode(group: BrokerOptionGroup, code: string): Promise<boolean> {
    if (!code) return false;
    const cacheKey = `opt_val:${group}:${code}`;
    const cached = await cache.get<boolean>(cacheKey);
    if (cached !== null) return cached;

    const opt = await prisma.brokerOption.findUnique({
      where: { group_code: { group, code } },
      select: { isActive: true },
    });

    const isValid = opt ? opt.isActive : false;
    await cache.set(cacheKey, isValid, 300); // 5 min
    return isValid;
  }
}

export const optionsService = new OptionsService();
