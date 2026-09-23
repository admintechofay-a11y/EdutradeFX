'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Percent,
  ArrowDownRight,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  DollarSign,
  Briefcase,
  Star,
  Award,
} from 'lucide-react';
import { MOCK_ACCOUNT_MANAGERS } from '@/lib/mockData';
import ListingDisclaimer from '@/components/shared/ListingDisclaimer';
import { api } from '@/lib/api';

export default function AccountManagersPage() {
  const [managers, setManagers] = useState<any[]>(MOCK_ACCOUNT_MANAGERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [maxMinInvestment, setMaxMinInvestment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getAccountManagers();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setManagers(data);
        }
      } catch (err) {
        console.error('Failed to load account managers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const styles = ['Algorithmic/EA', 'Scalping', 'Swing', 'Day Trading'];

  const filteredManagers = useMemo(() => {
    return managers.filter((manager) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (manager.name || '').toLowerCase().includes(q);
        const matchesCompany = (manager.company || '').toLowerCase().includes(q);
        const matchesStrategy = (manager.strategy || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesStrategy) return false;
      }

      if (selectedStyle !== 'all') {
        const styleMatch = (manager.tradingStyle || '').toLowerCase().includes(selectedStyle.toLowerCase()) ||
          selectedStyle.toLowerCase().includes((manager.tradingStyle || '').toLowerCase());
        if (!styleMatch) return false;
      }

      if (maxMinInvestment !== 'all') {
        const limit = parseInt(maxMinInvestment, 10);
        if ((manager.minInvestment || 0) > limit) return false;
      }

      return true;
    });
  }, [managers, search, selectedStyle, maxMinInvestment]);

  const totalPages = Math.max(1, Math.ceil(filteredManagers.length / itemsPerPage));
  const paginatedManagers = filteredManagers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-500/15 via-brand-card to-amber-500/10 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Audited PAMM & MAM Portfolios
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Forex <span className="gold-gradient-text">Account Managers</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Discover and allocate capital to verified institutional PAMM/MAM managers with mathematically audited track records. High-water mark protection, direct broker account custody, and zero hidden markups.
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
              placeholder="Search by manager name, company, or strategy..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Trading Style */}
          <div>
            <select
              value={selectedStyle}
              onChange={(e) => {
                setSelectedStyle(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Trading Styles</option>
              {styles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Min Investment */}
          <div>
            <select
              value={maxMinInvestment}
              onChange={(e) => {
                setMaxMinInvestment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Any Minimum Deposit</option>
              <option value="3000">Under $3,000</option>
              <option value="5000">Under $5,000</option>
              <option value="10000">Under $10,000</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong className="text-white">{filteredManagers.length}</strong> audited account managers
          </span>
          {(search || selectedStyle !== 'all' || maxMinInvestment !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedStyle('all');
                setMaxMinInvestment('all');
                setCurrentPage(1);
              }}
              className="text-amber-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Manager Cards */}
      {paginatedManagers.length === 0 ? (
        <div className="rounded-2xl glass-card border border-slate-800 p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Account Managers Match Your Criteria</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or relaxing the minimum investment filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedManagers.map((manager) => (
            <div
              key={manager._id}
              className={`rounded-2xl glass-card border p-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-700 ${
                manager.isFeatured ? 'border-emerald-500/40 shadow-glow-green' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2 pb-4">
                  <span className="badge-regulation text-[10px]">
                    {manager.tradingStyle}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{manager.rating}</span>
                    <span className="text-slate-500 font-normal">({manager.reviewsCount})</span>
                  </div>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/80">
                  <div className="relative">
                    <img
                      src={manager.profileImage}
                      alt={manager.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 bg-emerald-500 text-brand-darkest rounded-full p-0.5"
                      title="Audited Manager"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{manager.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{manager.company}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 inline-block">
                      {manager.experience} Experience
                    </span>
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
                      {manager.historicalPerformance.winRate}%
                    </span>
                  </div>

                  <div className="bg-brand-surface/70 rounded-xl p-2.5 border border-slate-800/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                      <Percent className="w-3 h-3 text-amber-400" />
                      Monthly
                    </span>
                    <span className="text-sm font-black text-amber-400 mt-0.5 block">
                      +{manager.historicalPerformance.monthlyRoi}%
                    </span>
                  </div>

                  <div className="bg-brand-surface/70 rounded-xl p-2.5 border border-slate-800/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-rose-400" />
                      Max DD
                    </span>
                    <span className="text-sm font-black text-slate-200 mt-0.5 block">
                      {manager.historicalPerformance.maxDrawdown}%
                    </span>
                  </div>
                </div>

                {/* Strategy summary */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pb-4">
                  {manager.strategy}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    Min Investment
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    ${manager.minInvestment.toLocaleString()}
                  </span>
                </div>

                <Link
                  href={`/account-managers/${manager._id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5"
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
