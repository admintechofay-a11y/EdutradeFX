'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BrokerOption, BrokerOptionGroup } from '@/types';
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Tag,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OPTION_GROUPS: { group: BrokerOptionGroup; label: string; countApprox: number }[] = [
  { group: 'REGULATOR', label: 'Regulators', countApprox: 59 },
  { group: 'LANGUAGE', label: 'Languages', countApprox: 133 },
  { group: 'CURRENCY', label: 'Currencies', countApprox: 10 },
  { group: 'LICENSE_STATUS', label: 'License Statuses', countApprox: 8 },
  { group: 'DEPOSIT_BONUS', label: 'Deposit Bonuses', countApprox: 21 },
  { group: 'LEVERAGE', label: 'Leverage Ratios', countApprox: 23 },
  { group: 'TIMEFRAME', label: 'Timeframes', countApprox: 9 },
];

export const BrokerOptionsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<BrokerOptionGroup>('REGULATOR');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New option form state
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newSortOrder, setNewSortOrder] = useState(0);

  // Fetch admin options
  const { data: options = [], isLoading, error } = useQuery<BrokerOption[]>({
    queryKey: ['admin-broker-options', selectedGroup, search],
    queryFn: async () => {
      const res = await api.get('/admin/broker-options', {
        params: {
          group: selectedGroup,
          search: search.trim() || undefined,
        },
      });
      return res.data?.data || [];
    },
  });

  // Toggle option active status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/broker-options/${id}`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-broker-options'] });
      queryClient.invalidateQueries({ queryKey: ['broker-options'] });
      toast.success('Option status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update option');
    },
  });

  // Create option mutation
  const createMutation = useMutation({
    mutationFn: async (payload: { group: BrokerOptionGroup; code: string; label: string; sortOrder: number }) => {
      const res = await api.post('/admin/broker-options', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-broker-options'] });
      queryClient.invalidateQueries({ queryKey: ['broker-options'] });
      toast.success('Option added successfully');
      setIsAdding(false);
      setNewCode('');
      setNewLabel('');
      setNewSortOrder(0);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create option');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newLabel.trim()) {
      toast.error('Code and label are required');
      return;
    }
    createMutation.mutate({
      group: selectedGroup,
      code: newCode.trim().toUpperCase(),
      label: newLabel.trim(),
      sortOrder: Number(newSortOrder) || 0,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-border shadow-soft p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue" />
            <h3 className="text-lg font-bold text-navy">Master Broker Dropdown Options</h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage standardized system dropdown dictionaries for onboarding, comparison, and filters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue hover:bg-blue-hover text-white text-xs font-semibold rounded-full transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add New Option'}</span>
        </button>
      </div>

      {/* Group selector tabs */}
      <div className="flex flex-wrap gap-2">
        {OPTION_GROUPS.map((g) => {
          const isActive = selectedGroup === g.group;
          return (
            <button
              key={g.group}
              type="button"
              onClick={() => {
                setSelectedGroup(g.group);
                setIsAdding(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-slate-100 text-text-muted hover:bg-slate-200 hover:text-navy'
              }`}
            >
              <span>{g.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {g.countApprox}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add new option inline form */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-4 rounded-2xl bg-slate-50 border border-border/80 space-y-3 animate-in fade-in-0 duration-150"
        >
          <div className="text-xs font-bold text-navy flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue" />
            <span>Add New {selectedGroup} Option</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-heading mb-1">
                Unique Code (e.g. FCA, EN, USD)
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="UNIQUE_CODE"
                className="w-full px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-blue uppercase font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-heading mb-1">
                Display Label
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Full display name"
                className="w-full px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-blue"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-heading mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-blue"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-navy"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Option</span>
            </button>
          </div>
        </form>
      )}

      {/* Search filter bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${selectedGroup} options by code or label...`}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-blue"
        />
      </div>

      {/* Table of options */}
      <div className="border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue" />
            <span>Loading {selectedGroup} options...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-500 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to load options.</span>
          </div>
        ) : options.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No options found matching &quot;{search}&quot;.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto overflow-x-auto divide-y divide-border/60">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-12 bg-slate-50 px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-border">
                <div className="col-span-3">Code</div>
                <div className="col-span-5">Label</div>
                <div className="col-span-2 text-center">Sort Order</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

            {options.map((opt) => (
              <div
                key={opt.code}
                className="grid grid-cols-12 px-4 py-2 text-xs items-center hover:bg-slate-50/60 transition"
              >
                <div className="col-span-3 font-mono font-bold text-navy truncate">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700">
                    {opt.code}
                  </span>
                </div>
                <div className="col-span-5 text-slate-800 font-medium truncate pr-2">
                  {opt.label}
                </div>
                <div className="col-span-2 text-center text-slate-500 font-mono text-[11px]">
                  {opt.sortOrder ?? 0}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      opt.id &&
                      toggleMutation.mutate({
                        id: opt.id,
                        isActive: !opt.isActive,
                      })
                    }
                    disabled={toggleMutation.isPending}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                      opt.isActive
                        ? 'bg-green/10 text-green hover:bg-green/20'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {opt.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
      <div className="text-[11px] text-text-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span>Showing {options.length} options in {selectedGroup}</span>
        <span>Standardized from Appendix A (263 options total)</span>
      </div>
    </div>
  );
};
