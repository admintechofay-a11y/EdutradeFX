'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Percent,
  ArrowDownRight,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Radio,
  Star,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { MOCK_SIGNAL_PROVIDERS } from '@/lib/mockData';
import ListingDisclaimer from '@/components/shared/ListingDisclaimer';
import { api } from '@/lib/api';

export default function SignalProvidersPage() {
  const [providers, setProviders] = useState<any[]>(MOCK_SIGNAL_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [maxPrice, setMaxPrice] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getSignalProviders();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProviders(data);
        }
      } catch (err) {
        console.error('Failed to load signal providers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const marketsList = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY', 'NAS100'];

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (provider.name || '').toLowerCase().includes(q);
        const matchesStrategy = (provider.strategy || '').toLowerCase().includes(q);
        if (!matchesName && !matchesStrategy) return false;
      }

      if (selectedMarket !== 'all') {
        const mkts: string[] = Array.isArray(provider.markets) ? provider.markets : [];
        if (!mkts.some((m: string) => m.toLowerCase().includes(selectedMarket.toLowerCase()))) {
          return false;
        }
      }

      if (maxPrice !== 'all') {
        const limit = parseInt(maxPrice, 10);
        if ((provider.subscriptionPrice || 0) > limit) return false;
      }

      return true;
    });
  }, [providers, search, selectedMarket, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / itemsPerPage));
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-brand-card to-cyan-500/10 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5" />
            Audited Live Signal Feeds
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Forex <span className="gold-gradient-text">Signal Providers</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Real-time trade signals with verified win rates, verified entry/exit criteria, and clear risk parameters. Connect directly via Telegram or MT4/MT5 webhook copiers.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by provider name or strategy..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Market Filter */}
          <div>
            <select
              value={selectedMarket}
              onChange={(e) => {
                setSelectedMarket(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Markets & Pairs</option>
              {marketsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription Price */}
          <div>
            <select
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Any Monthly Price</option>
              <option value="50">Under $50 / Month</option>
              <option value="75">Under $75 / Month</option>
              <option value="100">Under $100 / Month</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong className="text-white">{filteredProviders.length}</strong> audited signal providers
          </span>
          {(search || selectedMarket !== 'all' || maxPrice !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedMarket('all');
                setMaxPrice('all');
                setCurrentPage(1);
              }}
              className="text-amber-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Provider Cards */}
      {paginatedProviders.length === 0 ? (
        <div className="rounded-2xl glass-card border border-slate-800 p-12 text-center space-y-3">
          <Radio className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Signal Providers Match Your Criteria</h3>
          <p className="text-xs text-slate-400">
            Try resetting your filters or searching for another currency pair or instrument.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProviders.map((provider) => (
            <div
              key={provider._id}
              className={`rounded-2xl glass-card border p-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-700 ${
                provider.isFeatured ? 'border-amber-500/40 shadow-glow-gold' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2 pb-4">
                  <div className="flex flex-wrap gap-1">
                    {provider.markets.slice(0, 3).map((m) => (
                      <span key={m} className="badge-regulation text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{provider.rating}</span>
                    <span className="text-slate-500 font-normal">({provider.reviewsCount})</span>
                  </div>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/80">
                  <div className="relative">
                    <img
                      src={provider.profileImage}
                      alt={provider.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 bg-amber-500 text-brand-darkest rounded-full p-0.5"
                      title="Audited Provider"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{provider.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{provider.strategy}</p>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-3 gap-2 py-4 text-center">
                  <div className="bg-brand-surface/70 rounded-xl p-2.5 border border-slate-800/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      Win Rate
                    </span>
                    <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                      {provider.historicalPerformance.winRate}%
                    </span>
                  </div>

                  <div className="bg-brand-surface/70 rounded-xl p-2.5 border border-slate-800/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                      <Percent className="w-3 h-3 text-amber-400" />
                      Monthly
                    </span>
                    <span className="text-sm font-black text-amber-400 mt-0.5 block">
                      +{provider.historicalPerformance.monthlyRoi}%
                    </span>
                  </div>

                  <div className="bg-brand-surface/70 rounded-xl p-2.5 border border-slate-800/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-rose-400" />
                      Max DD
                    </span>
                    <span className="text-sm font-black text-slate-200 mt-0.5 block">
                      {provider.historicalPerformance.maxDrawdown}%
                    </span>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pb-4">
                  {provider.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    Subscription
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    ${provider.subscriptionPrice}/month
                  </span>
                </div>

                <Link
                  href={`/signal-providers/${provider._id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1.5"
                >
                  View Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-800 bg-brand-surface text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 px-3">
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-800 bg-brand-surface text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ListingDisclaimer />
    </div>
  );
}
