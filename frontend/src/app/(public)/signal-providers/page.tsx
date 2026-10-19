'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Radio,
  TrendingUp,
  ShieldCheck,
  Filter,
  X,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SignalProvider } from '@/types';
import { SPCard } from '@/components/sp/SPCard';
import { Pagination } from '@/components/common/Pagination';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

const INSTRUMENT_OPTIONS = [
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'AUDUSD',
  'USDCAD',
  'XAUUSD',
  'XAGUSD',
  'BTCUSD',
  'ETHUSD',
  'US30',
  'NAS100',
  'SPX500',
];

const STYLE_OPTIONS = [
  { value: 'DAY_TRADER', label: 'Day Trader' },
  { value: 'SWING_TRADER', label: 'Swing Trader' },
  { value: 'SCALPER', label: 'Scalper' },
  { value: 'POSITION_TRADER', label: 'Position Trader' },
  { value: 'NEWS_TRADER', label: 'News Trader' },
  { value: 'ALGORITHMIC_TRADER', label: 'Algorithmic' },
];

const TIMEFRAME_OPTIONS = ['M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

const UPDATE_FREQUENCY_OPTIONS = [
  { value: 'PER_SIGNAL', label: 'Per Signal' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export default function SPDirectoryPage() {
  const [providers, setProviders] = useState<SignalProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    instrument: '',
    style: '',
    timeframe: '',
    verifiedOnly: false,
    noMartingale: false,
    pricing: '' as '' | 'free' | 'paid',
    updateFrequency: '',
    sortBy: 'rating',
  });

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: filters.sortBy,
        sortOrder: 'desc',
        ...(filters.search && { search: filters.search }),
        ...(filters.instrument && { instrument: filters.instrument }),
        ...(filters.style && { style: filters.style }),
        ...(filters.timeframe && { timeframe: filters.timeframe }),
        ...(filters.verifiedOnly && { verified: 'true' }),
        ...(filters.noMartingale && { noMartingale: 'true' }),
        ...(filters.pricing && { pricing: filters.pricing }),
        ...(filters.updateFrequency && { updateFrequency: filters.updateFrequency }),
      });

      const res = await api.get(`/signal-providers?${params.toString()}`);
      setProviders(res.data?.data || []);
      setTotal(res.data?.pagination?.total || res.data?.data?.length || 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [
    page,
    filters.instrument,
    filters.style,
    filters.timeframe,
    filters.verifiedOnly,
    filters.noMartingale,
    filters.pricing,
    filters.updateFrequency,
    filters.sortBy,
  ]);

  const resetFilters = () => {
    setFilters({
      search: '',
      instrument: '',
      style: '',
      timeframe: '',
      verifiedOnly: false,
      noMartingale: false,
      pricing: '',
      updateFrequency: '',
      sortBy: 'rating',
    });
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.instrument ||
      filters.style ||
      filters.timeframe ||
      filters.verifiedOnly ||
      filters.noMartingale ||
      filters.pricing ||
      filters.updateFrequency
  );

  return (
    <div className="min-h-screen py-10 text-text-body bg-white pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue mb-4">
            <Radio className="w-3.5 h-3.5" />
            <span>Verified Forex &amp; Multi-Asset Signals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-heading mb-3">
            Signal Providers Directory
          </h1>
          <p className="text-sm sm:text-base text-text-body">
            Follow transparent trading calls with verified parameters, risk management disclosures, and track records recorded directly on EdutradeFX.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-soft mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchProviders()}
                placeholder="Search provider name, pair (e.g. XAUUSD), or strategy..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue min-h-[42px]"
              />
            </div>

            <button
              onClick={() => fetchProviders()}
              className="px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-xl text-xs font-bold transition shadow-sm w-full md:w-auto min-h-[42px]"
            >
              Search
            </button>

            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-tint border border-border text-text-heading rounded-xl text-xs font-bold w-full min-h-[42px]"
            >
              <SlidersHorizontal className="w-4 h-4 text-text-muted" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>
          </div>

          {/* Desktop Filter Row / Mobile Collapsible */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-border ${mobileFiltersOpen ? 'block' : 'hidden md:grid'}`}>
            {/* Instrument */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Instrument</label>
              <select
                value={filters.instrument}
                onChange={(e) => {
                  setFilters({ ...filters, instrument: e.target.value });
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-border rounded-lg text-xs text-text-heading focus:outline-none focus:border-blue"
              >
                <option value="">All Pairs</option>
                {INSTRUMENT_OPTIONS.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            {/* Trading Style */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Style</label>
              <select
                value={filters.style}
                onChange={(e) => {
                  setFilters({ ...filters, style: e.target.value });
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-border rounded-lg text-xs text-text-heading focus:outline-none focus:border-blue"
              >
                <option value="">All Styles</option>
                {STYLE_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Timeframe</label>
              <select
                value={filters.timeframe}
                onChange={(e) => {
                  setFilters({ ...filters, timeframe: e.target.value });
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-border rounded-lg text-xs text-text-heading focus:outline-none focus:border-blue"
              >
                <option value="">All TFs</option>
                {TIMEFRAME_OPTIONS.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Pricing</label>
              <select
                value={filters.pricing}
                onChange={(e) => {
                  setFilters({ ...filters, pricing: e.target.value as any });
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-border rounded-lg text-xs text-text-heading focus:outline-none focus:border-blue"
              >
                <option value="">Free &amp; Paid</option>
                <option value="free">Free Channels</option>
                <option value="paid">Paid VIP Plans</option>
              </select>
            </div>

            {/* Update Frequency */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Frequency</label>
              <select
                value={filters.updateFrequency}
                onChange={(e) => {
                  setFilters({ ...filters, updateFrequency: e.target.value });
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-border rounded-lg text-xs text-text-heading focus:outline-none focus:border-blue"
              >
                <option value="">Any Frequency</option>
                {UPDATE_FREQUENCY_OPTIONS.map((uf) => (
                  <option key={uf.value} value={uf.value}>
                    {uf.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Toggles */}
            <div className="col-span-2 sm:col-span-1 flex flex-col justify-end gap-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-heading">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => {
                    setFilters({ ...filters, verifiedOnly: e.target.checked });
                    setPage(1);
                  }}
                  className="rounded text-blue focus:ring-blue"
                />
                <span>Verified Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-heading">
                <input
                  type="checkbox"
                  checked={filters.noMartingale}
                  onChange={(e) => {
                    setFilters({ ...filters, noMartingale: e.target.checked });
                    setPage(1);
                  }}
                  className="rounded text-blue focus:ring-blue"
                />
                <span>No Martingale</span>
              </label>
            </div>
          </div>

          {/* Active Filters Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
              <span className="text-text-muted">Filtering active providers</span>
              <button
                onClick={resetFilters}
                className="text-blue font-bold hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Sort & Count Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 text-xs sm:text-sm text-text-muted">
          <div>
            Showing <span className="font-bold text-text-heading">{providers.length}</span> of{' '}
            <span className="font-bold text-text-heading">{total}</span> signal providers
          </div>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => {
                setFilters({ ...filters, sortBy: e.target.value });
                setPage(1);
              }}
              className="bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-heading font-semibold focus:outline-none focus:border-blue"
            >
              <option value="rating">Highest Rated</option>
              <option value="winRate">Platform Win Rate</option>
              <option value="signals">Signal Volume</option>
              <option value="newest">Newest First</option>
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
            description="No signal channels matched your filter criteria. Try resetting filters or search terms."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        )}
      </div>
    </div>
  );
}
