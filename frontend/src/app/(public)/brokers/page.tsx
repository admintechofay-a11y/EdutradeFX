'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Scale, ArrowRight } from 'lucide-react';
import { api } from '../../../lib/api';
import { Broker } from '../../../types';
import { BrokerCard } from '../../../components/broker/BrokerCard';
import { BrokerFilters } from '../../../components/broker/BrokerFilters';
import { Pagination } from '../../../components/common/Pagination';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { useCompareStore } from '../../../store/compareStore';

export default function BrokersDirectoryPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('avgRating');

  const { selectedBrokerIds, clearBrokers } = useCompareStore();

  const [filters, setFilters] = useState({
    search: '',
    regulation: '',
    platform: '',
    accountType: '',
    minDeposit: '',
  });

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder: 'desc',
        ...(filters.search && { search: filters.search }),
        ...(filters.regulation && { regulation: filters.regulation }),
        ...(filters.platform && { platform: filters.platform }),
        ...(filters.accountType && { accountType: filters.accountType }),
        ...(filters.minDeposit && { minDeposit: filters.minDeposit }),
      });

      const res = await api.get(`/brokers?${params.toString()}`);
      setBrokers(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, [page, sortBy, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      regulation: '',
      platform: '',
      accountType: '',
      minDeposit: '',
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Directory Hero Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Regulated Forex Brokers Directory
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-2xl">
          Compare global Forex & CFD brokers by tier-1 regulation, spread conditions, leverage limits, and real trader reviews.
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search broker name or features..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-gray-400">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="avgRating">Highest Rated</option>
            <option value="totalReviews">Most Reviews</option>
            <option value="createdAt">Recently Added</option>
            <option value="minDeposit">Lowest Min Deposit</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <BrokerFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : brokers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {brokers.map((broker) => (
                  <BrokerCard key={broker.id} broker={broker} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <EmptyState
              title="No brokers match your filter criteria"
              description="Try adjusting your regulation filters or search keyword to discover more licensed providers."
              actionText="Reset All Filters"
              actionHref="#reset"
            />
          )}
        </div>
      </div>

      {/* Floating Sticky Comparison Bar */}
      {selectedBrokerIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl p-4 rounded-2xl glass-modal border border-blue-500/50 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-100">
            <Scale className="text-amber-400" size={20} />
            <span>{selectedBrokerIds.length} Brokers Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearBrokers}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors"
            >
              Clear
            </button>
            <Link
              href="/brokers/compare"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-glow transition-all"
            >
              <span>Compare Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
