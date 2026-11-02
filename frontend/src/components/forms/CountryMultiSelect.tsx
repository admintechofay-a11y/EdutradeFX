'use client';

import React, { useMemo, useState } from 'react';
import { Country } from 'country-state-city';
import { Search, X, Check } from 'lucide-react';

interface CountryMultiSelectProps {
  value?: string[];
  onChange?: (selected: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const REGION_MAP: Record<string, string[]> = {
  'North America': ['US', 'CA', 'MX'],
  Europe: ['GB', 'DE', 'FR', 'CH', 'CY', 'ES', 'IT', 'NL', 'SE', 'PL', 'IE', 'PT', 'AT', 'BE'],
  APAC: ['SG', 'AU', 'JP', 'HK', 'NZ', 'MY', 'KR', 'IN', 'ID', 'TH', 'VN', 'PH'],
  MENA: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO'],
  LATAM: ['BR', 'AR', 'CL', 'CO', 'PE', 'UY'],
};

export const CountryMultiSelect: React.FC<CountryMultiSelectProps> = ({
  value = [],
  onChange,
  label,
  placeholder = 'Search countries...',
  disabled = false,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return allCountries;
    const q = search.toLowerCase();
    return allCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q)
    );
  }, [allCountries, search]);

  const toggleCountry = (code: string) => {
    if (disabled) return;
    if (value.includes(code)) {
      onChange?.(value.filter((c) => c !== code));
    } else {
      onChange?.([...value, code]);
    }
  };

  const selectRegion = (regionName: string) => {
    if (disabled) return;
    const codes = REGION_MAP[regionName] || [];
    const merged = Array.from(new Set([...value, ...codes]));
    onChange?.(merged);
  };

  const selectAll = () => {
    if (disabled) return;
    onChange?.(allCountries.map((c) => c.isoCode));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange?.([]);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-semibold text-slate-800">{label}</label>}

      {/* Region quick-select pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <span className="text-xs font-semibold text-slate-500 mr-1">Quick Select:</span>
        <button
          type="button"
          onClick={selectAll}
          disabled={disabled}
          className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
        >
          Global (All)
        </button>
        {Object.keys(REGION_MAP).map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => selectRegion(region)}
            disabled={disabled}
            className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
          >
            {region}
          </button>
        ))}
        {value.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled}
            className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-medium ml-auto transition-colors"
          >
            Clear ({value.length})
          </button>
        )}
      </div>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
          {value.map((code) => {
            const country = allCountries.find((c) => c.isoCode === code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-xs text-slate-800"
              >
                <span>{country ? country.name : code}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => toggleCountry(code)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
        />
      </div>

      {/* Country list dropdown view */}
      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
        {filteredCountries.map((c) => {
          const isSelected = value.includes(c.isoCode);
          return (
            <button
              key={c.isoCode}
              type="button"
              onClick={() => toggleCountry(c.isoCode)}
              disabled={disabled}
              className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                isSelected ? 'bg-blue-50/60 text-blue-900 font-medium' : 'text-slate-700'
              }`}
            >
              <span>{c.name}</span>
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <span>{c.isoCode}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CountryMultiSelect;

