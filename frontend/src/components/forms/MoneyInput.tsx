'use client';

import React from 'react';

export interface MoneyValue {
  amount?: number | string;
  currency?: string;
  period?: string;
}

interface MoneyInputProps {
  value?: MoneyValue;
  onChange?: (val: MoneyValue) => void;
  label?: string;
  disabled?: boolean;
  currencies?: string[];
  periods?: string[];
  className?: string;
}

const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'INR', 'AUD', 'CHF'];
const DEFAULT_PERIODS = ['One-time', 'Per Month', 'Per Year', 'Per User / Month', 'Custom'];

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value = { amount: '', currency: 'USD', period: 'Per Month' },
  onChange,
  label,
  disabled = false,
  currencies = DEFAULT_CURRENCIES,
  periods = DEFAULT_PERIODS,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:border-blue-500 bg-white">
        {/* Currency selector */}
        <select
          value={value.currency || 'USD'}
          onChange={(e) => onChange?.({ ...value, currency: e.target.value })}
          disabled={disabled}
          className="px-3 py-2 text-sm bg-slate-50 border-r border-slate-200 text-slate-700 font-semibold focus:outline-none disabled:bg-slate-100"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Amount input */}
        <input
          type="number"
          min="0"
          step="any"
          value={value.amount ?? ''}
          onChange={(e) => onChange?.({ ...value, amount: e.target.value })}
          placeholder="0.00"
          disabled={disabled}
          className="flex-1 px-3.5 py-2 text-sm text-slate-900 focus:outline-none disabled:bg-slate-50"
        />

        {/* Period selector */}
        <select
          value={value.period || 'Per Month'}
          onChange={(e) => onChange?.({ ...value, period: e.target.value })}
          disabled={disabled}
          className="px-3 py-2 text-sm bg-slate-50 border-l border-slate-200 text-slate-600 focus:outline-none disabled:bg-slate-100"
        >
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MoneyInput;
