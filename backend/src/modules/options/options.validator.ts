import { z } from 'zod';
import { BrokerOptionGroup } from '@prisma/client';
import { optionsService } from './options.service';
import { BROKER_OPTIONS } from '../../config/broker-options';

// Prepopulate initial known active codes from seed data for 0ms validation speed
const preloadedCodes = new Map<BrokerOptionGroup, Set<string>>();
for (const opt of BROKER_OPTIONS) {
  const g = opt.group as BrokerOptionGroup;
  if (!preloadedCodes.has(g)) {
    preloadedCodes.set(g, new Set());
  }
  preloadedCodes.get(g)!.add(opt.code);
}

/**
 * Zod helper: ensures submitted code exists and is active for the given BrokerOptionGroup.
 */
export function optionCode(group: BrokerOptionGroup) {
  return z.string().min(1, `${group} code is required`).refine(
    async (code) => {
      // 1. Fast check in preloaded set
      const groupCodes = preloadedCodes.get(group);
      if (groupCodes && groupCodes.has(code)) {
        return true;
      }
      // 2. Check dynamic database cache
      return await optionsService.isValidCode(group, code);
    },
    {
      message: `Invalid or inactive ${group} code`,
    }
  );
}

/**
 * Helper for optional optionCode (nullable or optional)
 */
export function optionalOptionCode(group: BrokerOptionGroup) {
  return z.string().optional().nullable().refine(
    async (code) => {
      if (!code) return true;
      const groupCodes = preloadedCodes.get(group);
      if (groupCodes && groupCodes.has(code)) {
        return true;
      }
      return await optionsService.isValidCode(group, code);
    },
    {
      message: `Invalid or inactive ${group} code`,
    }
  );
}
