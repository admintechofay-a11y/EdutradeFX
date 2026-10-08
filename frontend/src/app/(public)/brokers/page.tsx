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
import { AdBanner } from '../../../components/common/AdBanner';
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
      {/* Directory Hero Header */}
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue px-3 py-1 rounded-full bg-surface-tint border border-blue/20">
          Global Verified Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-heading tracking-tight mt-3">
          Regulated Forex Brokers Directory
        </h1>
        <p className="text-sm text-text-body mt-2 max-w-2xl leading-relaxed">
          Compare global Forex & CFD brokers by tier-1 regulation, spread conditions, leverage limits, and real trader reviews.
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search broker name or features..."
            className="w-full bg-white border border-border rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-text-muted font-medium">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-border rounded-full px-4 py-2 text-xs text-text-heading focus:outline-none focus:border-blue shadow-sm font-semibold"
          >
            <option value="avgRating">Highest Rated</option>
            <option value="totalReviews">Most Reviews</option>
            <option value="createdAt">Recently Added</option>
            <option value="minDeposit">Lowest Min Deposit</option>
          </select>
        </div>
      </div>

      {/* Sponsored Ad Banner with Telemetry Tracking */}
      <AdBanner placement="BROKER_LISTING" className="mb-8" />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : brokers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              onAction={handleReset}
            />
          )}
        </div>
      </div>

      {/* Floating Sticky Comparison Bar */}
      {selectedBrokerIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl p-4 rounded-full bg-white/95 backdrop-blur-md border border-border shadow-lift flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5 text-sm font-bold text-text-heading pl-2">
            <Scale className="text-blue" size={20} />
            <span>{selectedBrokerIds.length} Brokers Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearBrokers}
              className="text-xs text-text-muted hover:text-red-600 px-3 py-1.5 transition-colors font-semibold"
            >
              Clear
            </button>
            <Link
              href="/brokers/compare"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-orange hover:bg-orange-hover text-white shadow-soft transition-all"
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
