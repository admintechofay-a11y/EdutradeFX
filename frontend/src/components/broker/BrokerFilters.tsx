'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { OptionSelect } from '../common/OptionSelect';

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
    <div className="p-6 rounded-2xl bg-white border border-border shadow-soft space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <div className="flex items-center gap-2 text-sm font-bold text-text-heading">
          <Filter size={16} className="text-blue" />
          <span>Filter Brokers</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-blue transition-colors"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Regulation Filter */}
      <div>
        <OptionSelect
          group="REGULATOR"
          label="Regulation Authority"
          value={filters.regulation}
          onChange={(val) => onChange('regulation', val || '')}
          placeholder="All Regulations (59 authorities)..."
          allowOther={false}
        />
      </div>

      {/* Platform Filter */}
      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">Trading Platform</label>
        <select
          value={filters.platform}
          onChange={(e) => onChange('platform', e.target.value)}
          className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading focus:outline-none focus:border-blue shadow-sm"
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
        <label className="block text-xs font-bold text-text-heading mb-1.5">Account Execution</label>
        <select
          value={filters.accountType}
          onChange={(e) => onChange('accountType', e.target.value)}
          className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading focus:outline-none focus:border-blue shadow-sm"
        >
          <option value="">All Account Types</option>
          <option value="ECN">Raw ECN / Zero Spread</option>
          <option value="Standard">Standard Account</option>
          <option value="Islamic">Islamic Swap-Free</option>
        </select>
      </div>

      {/* Min Deposit */}
      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">Max Minimum Deposit</label>
        <select
          value={filters.minDeposit}
          onChange={(e) => onChange('minDeposit', e.target.value)}
          className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading focus:outline-none focus:border-blue shadow-sm"
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
