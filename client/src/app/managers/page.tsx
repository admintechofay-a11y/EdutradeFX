'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  SlidersHorizontal,
  Search,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { MOCK_MANAGERS } from '@/lib/mockData';
import ManagerCard from '@/components/ui/ManagerCard';
import ListingDisclaimer from '@/components/shared/ListingDisclaimer';

export default function ManagersPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [minWinRate, setMinWinRate] = useState<number>(60);
  const [maxDrawdown, setMaxDrawdown] = useState<number>(30);
  const [sortBy, setSortBy] = useState<string>('winRate');

  const styles = ['Scalping', 'Day Trading', 'Swing', 'Algorithmic/EA'];

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedStyle('all');
    setSelectedPricing('all');
    setMinWinRate(60);
    setMaxDrawdown(30);
    setSortBy('winRate');
  };

  const filteredManagers = useMemo(() => {
    return MOCK_MANAGERS.filter((manager) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = manager.name.toLowerCase().includes(query);
        const matchesTitle = manager.title.toLowerCase().includes(query);
        const matchesBio = manager.bio.toLowerCase().includes(query);
        if (!matchesName && !matchesTitle && !matchesBio) return false;
      }

      if (selectedCategory !== 'all') {
        if (manager.category !== selectedCategory && manager.category !== 'both') return false;
      }

      if (selectedStyle !== 'all') {
        if (manager.tradingStyle !== selectedStyle) return false;
      }

      if (selectedPricing !== 'all') {
        if (manager.pricingModel !== selectedPricing) return false;
      }

      if (manager.winRate < minWinRate) return false;
      if (manager.maxDrawdown > maxDrawdown) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      if (sortBy === 'monthlyRoi') return b.monthlyRoi - a.monthlyRoi;
      if (sortBy === 'maxDrawdown') return a.maxDrawdown - b.maxDrawdown;
      if (sortBy === 'totalPips') return b.totalPips - a.totalPips;
      return 0;
    });
  }, [search, selectedCategory, selectedStyle, selectedPricing, minWinRate, maxDrawdown, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          Verified Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
          Account Managers & Signal Providers
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Discover vetted institutional traders, quantitative algorithmic signals, and PAMM managers with verified track records, win rates, and controlled drawdown.
        </p>
      </div>

      {/* Grid Layout: Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6 bg-brand-card/90 border border-slate-800 rounded-2xl p-6 h-fit backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Search Provider
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Provider name, strategy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-brand-surface border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Service Type
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-brand-surface border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Service Types</option>
              <option value="account_manager">PAMM / Account Manager</option>
              <option value="signal_provider">Signal Provider</option>
              <option value="both">Manager & Signals</option>
            </select>
          </div>

          {/* Trading Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trading Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full px-3 py-2 bg-brand-surface border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Styles</option>
              {styles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Model */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Fee Model
            </label>
            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              className="w-full px-3 py-2 bg-brand-surface border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Fee Models</option>
              <option value="profit_share">Profit Share Only</option>
              <option value="monthly_subscription">Monthly Subscription</option>
              <option value="free">Free Community Tier</option>
            </select>
          </div>

          {/* Min Win Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Min Win Rate:
              </span>
              <span className="font-extrabold text-emerald-400">{minWinRate}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={minWinRate}
              onChange={(e) => setMinWinRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Max Drawdown Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Max Drawdown:
              </span>
              <span className="font-extrabold text-rose-400">{maxDrawdown}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={maxDrawdown}
              onChange={(e) => setMaxDrawdown(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-card/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-400">
              Showing <strong className="text-white">{filteredManagers.length}</strong> verified providers
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-brand-surface border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="winRate">Highest Win Rate</option>
                <option value="monthlyRoi">Highest Monthly Return</option>
                <option value="maxDrawdown">Lowest Drawdown</option>
                <option value="totalPips">Total Pips Generated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredManagers.map((manager) => (
              <ManagerCard key={manager._id} manager={manager} />
            ))}
          </div>
        </div>
      </div>

      <ListingDisclaimer />
    </div>
  );
}
