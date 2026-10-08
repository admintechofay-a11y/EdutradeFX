import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { BrokerOption, BrokerOptionGroup } from '@/types';

export interface OptionItem {
  code: string;
  label: string;
  meta?: any;
}

/**
 * Hook to fetch broker options by group with 1-hour staleTime.
 */
export function useBrokerOptions(group?: BrokerOptionGroup) {
  return useQuery<OptionItem[]>({
    queryKey: ['broker-options', group || 'ALL'],
    queryFn: async () => {
      const params = group ? { group } : {};
      const res = await api.get('/options', { params });
      const data = res.data?.data;
      if (!data) return [];
      if (Array.isArray(data)) {
        return data;
      }
      if (group && data[group]) {
        return data[group];
      }
      return [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to fetch all option groups in a single batch dictionary.
 */
export function useAllBrokerOptions() {
  return useQuery<Record<BrokerOptionGroup, OptionItem[]>>({
    queryKey: ['broker-options', 'ALL_DICT'],
    queryFn: async () => {
      const res = await api.get('/options');
      return res.data?.data || {};
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
