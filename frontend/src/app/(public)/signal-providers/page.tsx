'use client';

import React, { useState, useEffect } from 'react';
import { Search, Radio, TrendingUp, ShieldCheck } from 'lucide-react';
import { api } from '../../../lib/api';
import { SignalProvider } from '../../../types';
import { SPCard } from '../../../components/sp/SPCard';
import { Pagination } from '../../../components/common/Pagination';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function SPDirectoryPage() {
  const [providers, setProviders] = useState<SignalProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    strategy: '',
    sortBy: 'winRate',
  });

  const strategies = [
    'Smart Money Concepts (SMC)',
    'Price Action Breakouts',
    'London / NY Breakout',
    'Gold (XAUUSD) Scalping',
    'Macro Momentum',
    'Crypto / Forex Hybrid',
  ];

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: filters.sortBy,
        sortOrder: 'desc',
        ...(filters.search && { search: filters.search }),
        ...(filters.strategy && { strategy: filters.strategy }),
      });

      const res = await api.get(`/signal-providers?${params.toString()}`);
      setProviders(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [page, filters.strategy, filters.sortBy]);

  return (
    <div className="min-h-screen py-10 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-navy-light border border-slate-700 text-xs font-semibold text-purple-400 mb-4">
            <Radio className="w-3.5 h-3.5" />
            <span>Audited Performance Signals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Forex Signal Providers
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Follow verified trading calls with audited win rates, transparent entry/stop-loss criteria, and instant Telegram execution alerts.
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchProviders()}
                placeholder="Search provider name, pair (e.g. XAUUSD), or strategy..."
                className="w-full pl-10 pr-4 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <select
              value={filters.strategy}
              onChange={(e) => {
                setFilters({ ...filters, strategy: e.target.value });
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Strategies</option>
              {strategies.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort & Stats */}
        <div className="flex items-center justify-between mb-6 text-xs sm:text-sm text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{providers.length}</span> of{' '}
            <span className="font-bold text-white">{total}</span> signal providers
          </div>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="bg-brand-navy-light border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="winRate">Audited Win Rate</option>
              <option value="avgRating">Highest Rated</option>
              <option value="totalSignals">Signal Volume</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : providers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((sp) => (
                <SPCard key={sp.id} sp={sp} />
              ))}
            </div>

            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="No Signal Providers Found"
            description="Try changing your search parameters or check back soon."
            actionLabel="Reset Filters"
            onAction={() => {
              setFilters({ search: '', strategy: '', sortBy: 'winRate' });
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
