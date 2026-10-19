'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Users, ShieldCheck, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { api } from '../../../lib/api';
import { AccountManager } from '../../../types';
import { AMCard } from '../../../components/am/AMCard';
import { Pagination } from '../../../components/common/Pagination';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

function AMDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [managers, setManagers] = useState<AccountManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters state
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [tradingStyle, setTradingStyle] = useState(searchParams.get('tradingStyle') || '');
  const [riskTolerance, setRiskTolerance] = useState(searchParams.get('riskTolerance') || '');
  const [settlementCycle, setSettlementCycle] = useState(searchParams.get('settlementCycle') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [instrument, setInstrument] = useState(searchParams.get('instrument') || '');
  const [minYears, setMinYears] = useState(searchParams.get('minYears') || '');
  const [regulated, setRegulated] = useState(searchParams.get('regulated') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        ...(q && { q }),
        ...(tradingStyle && { tradingStyle }),
        ...(riskTolerance && { riskTolerance }),
        ...(settlementCycle && { settlementCycle }),
        ...(platform && { platform }),
        ...(instrument && { instrument }),
        ...(minYears && { minYears }),
        ...(regulated && { regulated: 'true' }),
      });

      // Update URL query params without full page reload
      router.replace(`/account-managers?${params.toString()}`, { scroll: false });

      const res = await api.get(`/account-managers?${params.toString()}`);
      setManagers(res.data?.data || []);
      setTotal(res.data?.meta?.total || res.data?.pagination?.total || 0);
      setTotalPages(res.data?.meta?.totalPages || res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch account managers', err);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [page, tradingStyle, riskTolerance, settlementCycle, platform, instrument, minYears, regulated, sortBy]);

  const clearFilters = () => {
    setQ('');
    setTradingStyle('');
    setRiskTolerance('');
    setSettlementCycle('');
    setPlatform('');
    setInstrument('');
    setMinYears('');
    setRegulated(false);
    setSortBy('rating');
    setPage(1);
  };

  const hasActiveFilters =
    !!q || !!tradingStyle || !!riskTolerance || !!settlementCycle || !!platform || !!instrument || !!minYears || regulated;

  return (
    <div className="min-h-screen py-8 sm:py-12 text-text-body bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>Audited Account & PAMM Managers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-heading mb-3">
            Account Managers Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Discover verified portfolio managers with transparent risk caps, verified trading styles, and disciplined
            profit-sharing parameters.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          {/* Search + Mobile Filter Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    fetchManagers();
                  }
                }}
                placeholder="Search by manager name, country, or instrument..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  fetchManagers();
                }}
                className="px-5 py-2.5 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition shadow-soft"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="sm:hidden px-3.5 py-2.5 border border-border rounded-xl text-xs font-bold flex items-center gap-1.5 bg-surface-tint"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>
            </div>
          </div>

          {/* Desktop Filter Row */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${mobileFiltersOpen ? 'block' : 'hidden sm:grid'}`}>
            {/* Trading Style */}
            <select
              value={tradingStyle}
              onChange={(e) => {
                setTradingStyle(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading focus:ring-2 focus:ring-blue focus:outline-none"
            >
              <option value="">All Styles</option>
              <option value="DAY_TRADER">Day Trader</option>
              <option value="SWING_TRADER">Swing Trader</option>
              <option value="SCALPER">Scalper</option>
              <option value="POSITION_TRADER">Position Trader</option>
              <option value="NEWS_TRADER">News-based</option>
              <option value="ALGORITHMIC_TRADER">Algorithmic</option>
            </select>

            {/* Risk Tolerance */}
            <select
              value={riskTolerance}
              onChange={(e) => {
                setRiskTolerance(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading focus:ring-2 focus:ring-blue focus:outline-none"
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="HIGH">High Risk</option>
            </select>

            {/* Settlement Cycle */}
            <select
              value={settlementCycle}
              onChange={(e) => {
                setSettlementCycle(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading focus:ring-2 focus:ring-blue focus:outline-none"
            >
              <option value="">All Settlement Cycles</option>
              <option value="DAILY">Daily Settlement</option>
              <option value="WEEKLY">Weekly Settlement</option>
              <option value="MONTHLY">Monthly Settlement</option>
            </select>

            {/* Platform */}
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading focus:ring-2 focus:ring-blue focus:outline-none"
            >
              <option value="">All Platforms</option>
              <option value="MT4">MetaTrader 4</option>
              <option value="MT5">MetaTrader 5</option>
              <option value="CTRADER">cTrader</option>
            </select>

            {/* Experience */}
            <select
              value={minYears}
              onChange={(e) => {
                setMinYears(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading focus:ring-2 focus:ring-blue focus:outline-none"
            >
              <option value="">Any Experience</option>
              <option value="1">1+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-border rounded-xl text-xs font-semibold text-text-heading focus:ring-2 focus:ring-blue focus:outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="newest">Newest Listed</option>
            </select>
          </div>

          {/* Sub-bar: Regulated toggle & Active filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-text-heading">
              <input
                type="checkbox"
                checked={regulated}
                onChange={(e) => {
                  setRegulated(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-blue focus:ring-blue border-border"
              />
              <span className="flex items-center gap-1 text-green-700">
                <ShieldCheck className="w-4 h-4 text-green-600" /> Regulated Verified Only
              </span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Showing {managers.length} of {total} verified managers</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className="h-72 rounded-3xl" />
            ))}
          </div>
        ) : managers.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-border shadow-soft">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-heading mb-1">No Account Managers Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
              Try adjusting or clearing your search criteria and filters to discover more active managers.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue text-white rounded-xl text-xs font-bold"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managers.map((am) => (
              <AMCard key={am.id} am={am} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AMDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Skeleton className="h-48 rounded-2xl" /></div>}>
      <AMDirectoryContent />
    </Suspense>
  );
}
