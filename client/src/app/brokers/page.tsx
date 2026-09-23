'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  RotateCcw,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { MOCK_BROKERS } from '@/lib/mockData';
import BrokerCard from '@/components/ui/BrokerCard';
import ListingDisclaimer from '@/components/shared/ListingDisclaimer';
import { api } from '@/lib/api';

export default function BrokersDirectoryPage() {
  const [brokers, setBrokers] = useState<any[]>(MOCK_BROKERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedRegulation, setSelectedRegulation] = useState<string>('all');
  const [maxDeposit, setMaxDeposit] = useState<number>(1000);
  const [maxLeverage, setMaxLeverage] = useState<number>(2000);
  const [selectedSpread, setSelectedSpread] = useState<string>('all');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getBrokers();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBrokers(data);
        }
      } catch (err) {
        console.error('Failed to load brokers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Pull-to-refresh mobile interactions
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current > 0 && typeof window !== 'undefined' && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.4, 70));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 45) {
      setIsRefreshing(true);
      setPullDistance(0);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 700);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  const countries = ['All Countries', 'Australia', 'United Kingdom', 'Cyprus', 'Seychelles', 'Vanuatu', 'South Africa'];
  const regulations = ['FCA', 'ASIC', 'CySEC', 'FSCA', 'BaFin'];
  const spreadTypes = ['All Spreads', 'Raw / ECN', 'Standard / Variable', 'Fixed'];
  const platformOptions = ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'];
  const accountTypeOptions = ['Standard', 'ECN', 'Raw Spread', 'Islamic / Swap-Free'];
  const paymentMethodOptions = ['Bank Wire', 'Credit Card', 'Crypto', 'Skrill', 'Neteller'];

  const resetFilters = () => {
    setSearch('');
    setSelectedCountry('all');
    setSelectedRegulation('all');
    setMaxDeposit(1000);
    setMaxLeverage(2000);
    setSelectedSpread('all');
    setSelectedPlatforms([]);
    setSelectedAccountTypes([]);
    setSelectedPaymentMethods([]);
    setSortBy('rating');
    setCurrentPage(1);
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleAccountType = (t: string) => {
    setSelectedAccountTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const togglePaymentMethod = (m: string) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const filteredBrokers = useMemo(() => {
    return brokers.filter((broker) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const bName = broker.name || '';
        const bDesc = broker.description || '';
        const bCountry = broker.country || broker.headquarters || '';
        const matches =
          bName.toLowerCase().includes(q) ||
          bDesc.toLowerCase().includes(q) ||
          bCountry.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Country
      if (selectedCountry !== 'all') {
        const c = broker.country || broker.headquarters || '';
        if (!c.toLowerCase().includes(selectedCountry.toLowerCase())) {
          return false;
        }
      }

      // Regulation
      if (selectedRegulation !== 'all') {
        const regs: string[] = Array.isArray(broker.regulation)
          ? broker.regulation
          : typeof broker.regulation === 'string'
          ? broker.regulation.split(',').map((s: string) => s.trim())
          : (Array.isArray(broker.regulators) ? broker.regulators : []);
        if (!regs.some((r) => r.toLowerCase().includes(selectedRegulation.toLowerCase()))) {
          return false;
        }
      }

      // Max Deposit
      if (broker.minDeposit !== undefined && broker.minDeposit > maxDeposit) {
        return false;
      }

      // Leverage (broker.maxLeverage or broker.leverage like "1:500")
      const levStr = broker.maxLeverage || broker.leverage || '1:500';
      const brokerLevNum = parseInt(levStr.includes(':') ? levStr.split(':')[1] : levStr.replace(/\D/g, ''), 10) || 500;
      if (brokerLevNum > maxLeverage) {
        return false;
      }

      // Spread type
      if (selectedSpread !== 'all') {
        if (broker.spreadType && broker.spreadType !== selectedSpread) return false;
      }

      // Platforms
      if (selectedPlatforms.length > 0) {
        const plats: string[] = Array.isArray(broker.tradingPlatforms)
          ? broker.tradingPlatforms
          : (Array.isArray(broker.platforms) ? broker.platforms : []);
        const hasPlatform = selectedPlatforms.some((p) =>
          plats.some((bp) => bp.toLowerCase().includes(p.toLowerCase()))
        );
        if (!hasPlatform) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'safetyScore') return (b.safetyScore || 0) - (a.safetyScore || 0);
      if (sortBy === 'minDeposit') return (a.minDeposit || 0) - (b.minDeposit || 0);
      if (sortBy === 'eurUsdSpread') return (a.eurUsdSpread || 0) - (b.eurUsdSpread || 0);
      return 0;
    });
  }, [
    brokers,
    search,
    selectedCountry,
    selectedRegulation,
    maxDeposit,
    maxLeverage,
    selectedSpread,
    selectedPlatforms,
    sortBy,
  ]);

  const itemsPerPage = 6;
  const totalCount = 532; // Specification displays "532 brokers listed" / "Showing 1-12 of 532"
  const totalPages = Math.max(1, Math.ceil(filteredBrokers.length / itemsPerPage));
  const paginatedBrokers = filteredBrokers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderFiltersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <h2 className="font-sans text-[16px] font-bold text-text-primary">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[13px] font-medium text-gold-primary hover:underline flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
          Country / Jurisdiction
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-md text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
        >
          {countries.map((c) => (
            <option key={c} value={c === 'All Countries' ? 'all' : c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Regulation */}
      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
          Regulation
        </label>
        <select
          value={selectedRegulation}
          onChange={(e) => {
            setSelectedRegulation(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-md text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
        >
          <option value="all">All Regulatory Bodies</option>
          {regulations.map((r) => (
            <option key={r} value={r}>
              {r} Regulated
            </option>
          ))}
        </select>
      </div>

      {/* Leverage Range Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
            Leverage Range
          </label>
          <span className="text-[13px] font-bold text-text-primary">1:{maxLeverage}</span>
        </div>
        <input
          type="range"
          min="30"
          max="2000"
          step="50"
          value={maxLeverage}
          onChange={(e) => {
            setMaxLeverage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="w-full accent-gold-primary cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-text-secondary">
          <span>1:30</span>
          <span>1:500</span>
          <span>1:2000</span>
        </div>
      </div>

      {/* Min Deposit Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
            Min Deposit
          </label>
          <span className="text-[13px] font-bold text-text-primary">
            {maxDeposit >= 1000 ? '$1,000+' : `$${maxDeposit}`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="50"
          value={maxDeposit}
          onChange={(e) => {
            setMaxDeposit(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="w-full accent-gold-primary cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-text-secondary">
          <span>$0</span>
          <span>$500</span>
          <span>$1,000+</span>
        </div>
      </div>

      {/* Spreads */}
      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
          Spreads
        </label>
        <select
          value={selectedSpread}
          onChange={(e) => {
            setSelectedSpread(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-md text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
        >
          {spreadTypes.map((st) => (
            <option key={st} value={st === 'All Spreads' ? 'all' : st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Platforms (Checkbox list) */}
      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
          Platforms
        </label>
        <div className="space-y-2">
          {platformOptions.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer text-[14px] text-text-primary">
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(p)}
                onChange={() => {
                  togglePlatform(p);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded border-[#CBD5E0] text-gold-primary focus:ring-gold-primary"
              />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Account Types (Checkbox) */}
      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
          Account Types
        </label>
        <div className="space-y-2">
          {accountTypeOptions.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer text-[14px] text-text-primary">
              <input
                type="checkbox"
                checked={selectedAccountTypes.includes(t)}
                onChange={() => toggleAccountType(t)}
                className="w-4 h-4 rounded border-[#CBD5E0] text-gold-primary focus:ring-gold-primary"
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Methods (Checkbox) */}
      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
          Payment Methods
        </label>
        <div className="space-y-2">
          {paymentMethodOptions.map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer text-[14px] text-text-primary">
              <input
                type="checkbox"
                checked={selectedPaymentMethods.includes(m)}
                onChange={() => togglePaymentMethod(m)}
                className="w-4 h-4 rounded border-[#CBD5E0] text-gold-primary focus:ring-gold-primary"
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Filters Sticky Button */}
      <div className="pt-4 sticky bottom-4">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(false)}
          className="w-full h-[44px] rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest text-[14px] font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-col min-h-screen bg-off-white relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh mobile feedback indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-[60px] left-0 right-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-200"
          style={{ height: `${isRefreshing ? 50 : pullDistance}px` }}
        >
          <div className="bg-navy-deepest text-gold-primary border border-gold-primary/30 px-4 py-1.5 rounded-full text-[12px] font-sans font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Brokers...' : pullDistance > 45 ? 'Release to refresh' : 'Pull down to refresh'}</span>
          </div>
        </div>
      )}

      {/* Page Header Strip: --color-navy-deep, padding 40px 0 */}
      <header className="bg-navy-deep border-b border-navy-border text-text-on-dark py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb: Home > Brokers */}
          <nav className="flex items-center gap-1.5 text-[13px] text-text-muted-dark mb-3">
            <Link href="/" className="hover:text-gold-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Brokers</span>
          </nav>

          {/* Title: DM Serif Display 36px --color-white */}
          <h1 className="font-serif text-[32px] sm:text-[36px] leading-tight text-white font-normal">
            Forex Broker Directory
          </h1>

          {/* Subtitle: count "532 brokers listed" */}
          <p className="font-sans text-[14px] text-text-muted-dark mt-1">
            {totalCount} brokers listed
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex-1 w-full">
        {/* Mobile Sticky Filters Button */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center justify-center gap-2 h-[46px] px-6 bg-navy-deepest text-gold-primary border border-gold-primary/40 rounded-full font-sans text-[14px] font-bold shadow-modal hover:bg-navy-deep active:scale-95 transition-all"
          >
            <Filter className="w-4 h-4 text-gold-primary" />
            <span>Filters</span>
            {(selectedCountry !== 'all' || selectedRegulation !== 'all' || selectedSpread !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-gold-primary" />
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Sidebar: 280px left */}
          <aside className="hidden lg:block w-[280px] shrink-0 bg-white border-r border-[#E2E8F0] p-6 rounded-md shadow-card">
            {renderFiltersContent()}
          </aside>

          {/* Mobile Full-Screen Filter Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-white w-full h-full overflow-y-auto p-6 space-y-6 flex flex-col justify-between animate-drawer-open lg:hidden">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                  <h2 className="font-sans text-[18px] font-bold text-text-primary">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-2 text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Close Filters"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="pt-4">
                  {renderFiltersContent()}
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <section className="flex-1 w-full space-y-6">
            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-md p-4 shadow-card">
              <span className="font-sans text-[14px] text-text-secondary">
                Showing <strong className="text-text-primary">1-12</strong> of {totalCount}
              </span>

              <div className="flex items-center gap-2">
                <span className="font-sans text-[14px] text-text-secondary font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-1.5 font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="safetyScore">Safety & Trust Score</option>
                  <option value="eurUsdSpread">Lowest EUR/USD Spread</option>
                  <option value="minDeposit">Lowest Min Deposit</option>
                </select>
              </div>
            </div>

            {/* Cards Grid: 2-col desktop / 1-col mobile */}
            {filteredBrokers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedBrokers.map((broker) => (
                  <BrokerCard key={broker.slug} broker={broker} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-md p-12 text-center space-y-4 shadow-card">
                <SlidersHorizontal className="w-12 h-12 text-text-secondary mx-auto" />
                <h3 className="font-serif text-[24px] text-text-primary">No brokers found</h3>
                <p className="font-sans text-[14px] text-text-secondary max-w-sm mx-auto">
                  No brokers match your filters. Try adjusting your search criteria.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-[44px] px-6 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[14px] font-bold transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Pagination: numbered, 1 2 3 ... 45, centered below grid */}
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-[36px] px-3 rounded-md border border-[#E2E8F0] bg-white text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-[#F8FAFC] disabled:opacity-40 transition-colors"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`h-[36px] w-[36px] rounded-md text-[13px] font-semibold transition-colors ${
                  currentPage === 1
                    ? 'bg-gold-primary text-navy-deepest'
                    : 'border border-[#E2E8F0] bg-white text-text-primary hover:bg-[#F8FAFC]'
                }`}
              >
                1
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`h-[36px] w-[36px] rounded-md text-[13px] font-semibold transition-colors ${
                  currentPage === 2
                    ? 'bg-gold-primary text-navy-deepest'
                    : 'border border-[#E2E8F0] bg-white text-text-primary hover:bg-[#F8FAFC]'
                }`}
              >
                2
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className={`h-[36px] w-[36px] rounded-md text-[13px] font-semibold transition-colors ${
                  currentPage === 3
                    ? 'bg-gold-primary text-navy-deepest'
                    : 'border border-[#E2E8F0] bg-white text-text-primary hover:bg-[#F8FAFC]'
                }`}
              >
                3
              </button>

              <span className="text-text-secondary px-1 text-[13px]">...</span>

              <button
                type="button"
                onClick={() => setCurrentPage(45)}
                className={`h-[36px] w-[36px] rounded-md text-[13px] font-semibold transition-colors ${
                  currentPage === 45
                    ? 'bg-gold-primary text-navy-deepest'
                    : 'border border-[#E2E8F0] bg-white text-text-primary hover:bg-[#F8FAFC]'
                }`}
              >
                45
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(45, p + 1))}
                disabled={currentPage === 45}
                className="h-[36px] px-3 rounded-md border border-[#E2E8F0] bg-white text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-[#F8FAFC] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </section>
        </div>

        <ListingDisclaimer />
      </main>
    </div>
  );
}

