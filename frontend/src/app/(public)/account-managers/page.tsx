'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, ShieldCheck } from 'lucide-react';
import { api } from '../../../lib/api';
import { AccountManager } from '../../../types';
import { AMCard } from '../../../components/am/AMCard';
import { Pagination } from '../../../components/common/Pagination';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function AMDirectoryPage() {
  const [managers, setManagers] = useState<AccountManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    expertise: '',
    sortBy: 'avgRating',
  });

  const expertiseOptions = [
    'PAMM Portfolio',
    'MAM Accounts',
    'Swing Trading',
    'Scalping & High Frequency',
    'Hedging & Arbitrage',
    'Algorithmic Risk Control',
  ];

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: filters.sortBy,
        sortOrder: 'desc',
        ...(filters.search && { search: filters.search }),
        ...(filters.expertise && { expertise: filters.expertise }),
      });

      const res = await api.get(`/account-managers?${params.toString()}`);
      setManagers(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [page, filters.expertise, filters.sortBy]);

  return (
    <div className="min-h-screen py-10 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-navy-light border border-slate-700 text-xs font-semibold text-emerald-400 mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>Audited Forex Portfolio Specialists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Account Managers Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Discover verified PAMM & MAM portfolio managers with transparent performance metrics, drawdown caps, and investor protections.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchManagers()}
                placeholder="Search by manager name, country, or strategy..."
                className="w-full pl-10 pr-4 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <select
              value={filters.expertise}
              onChange={(e) => {
                setFilters({ ...filters, expertise: e.target.value });
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Strategies</option>
              {expertiseOptions.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 text-xs sm:text-sm text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{managers.length}</span> of{' '}
            <span className="font-bold text-white">{total}</span> managers
          </div>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="bg-brand-navy-light border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="avgRating">Highest Rated</option>
              <option value="yearsExperience">Experience</option>
              <option value="totalReviews">Reviews Count</option>
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
        ) : managers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managers.map((am) => (
                <AMCard key={am.id} am={am} />
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
            title="No Account Managers Found"
            description="Try changing your search terms or strategy filter."
            actionLabel="Reset Search"
            onAction={() => {
              setFilters({ search: '', expertise: '', sortBy: 'avgRating' });
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
