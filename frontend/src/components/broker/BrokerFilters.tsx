'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface BrokerFiltersProps {
  filters: {
    search: string;
    regulation: string;
    platform: string;
    accountType: string;
    minDeposit: string;
  };
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export const BrokerFilters: React.FC<BrokerFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-100">
          <Filter size={16} className="text-blue-400" />
          <span>Filter Brokers</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Regulation Filter */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">Regulation Authority</label>
        <select
          value={filters.regulation}
          onChange={(e) => onChange('regulation', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Regulations</option>
          <option value="FCA">FCA (United Kingdom)</option>
          <option value="ASIC">ASIC (Australia)</option>
          <option value="CySEC">CySEC (Cyprus/EU)</option>
          <option value="BaFin">BaFin (Germany)</option>
          <option value="DFSA">DFSA (Dubai/UAE)</option>
        </select>
      </div>

      {/* Platform Filter */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">Trading Platform</label>
        <select
          value={filters.platform}
          onChange={(e) => onChange('platform', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Platforms</option>
          <option value="MetaTrader 4">MetaTrader 4 (MT4)</option>
          <option value="MetaTrader 5">MetaTrader 5 (MT5)</option>
          <option value="cTrader">cTrader</option>
          <option value="TradingView">TradingView</option>
        </select>
      </div>

      {/* Account Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">Account Execution</label>
        <select
          value={filters.accountType}
          onChange={(e) => onChange('accountType', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Account Types</option>
          <option value="ECN">Raw ECN / Zero Spread</option>
          <option value="Standard">Standard Account</option>
          <option value="Islamic">Islamic Swap-Free</option>
        </select>
      </div>

      {/* Min Deposit */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">Max Minimum Deposit</label>
        <select
          value={filters.minDeposit}
          onChange={(e) => onChange('minDeposit', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">Any Deposit</option>
          <option value="0">$0 (No Minimum)</option>
          <option value="50">Up to $50</option>
          <option value="100">Up to $100</option>
          <option value="500">Up to $500</option>
        </select>
      </div>
    </div>
  );
};
