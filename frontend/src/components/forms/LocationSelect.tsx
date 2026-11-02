'use client';

import React, { useMemo } from 'react';
import { Country, State, City } from 'country-state-city';

export interface LocationValue {
  countryCode?: string;
  countryName?: string;
  stateCode?: string;
  stateName?: string;
  cityName?: string;
  postalCode?: string;
  line1?: string;
  line2?: string;
}

interface LocationSelectProps {
  value?: LocationValue;
  onChange?: (val: LocationValue) => void;
  required?: boolean;
  disabled?: boolean;
  showStreetAddress?: boolean;
  className?: string;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  value = {},
  onChange,
  required = false,
  disabled = false,
  showStreetAddress = true,
  className = '',
}) => {
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const availableStates = useMemo(() => {
    if (!value.countryCode) return [];
    return State.getStatesOfCountry(value.countryCode);
  }, [value.countryCode]);

  const availableCities = useMemo(() => {
    if (!value.countryCode) return [];
    if (value.stateCode) {
      return City.getCitiesOfState(value.countryCode, value.stateCode);
    }
    return City.getCitiesOfCountry(value.countryCode) || [];
  }, [value.countryCode, value.stateCode]);

  const handleCountryChange = (code: string) => {
    const selected = allCountries.find((c) => c.isoCode === code);
    onChange?.({
      ...value,
      countryCode: code,
      countryName: selected ? selected.name : '',
      stateCode: '',
      stateName: '',
      cityName: '',
    });
  };

  const handleStateChange = (code: string) => {
    const selected = availableStates.find((s) => s.isoCode === code);
    onChange?.({
      ...value,
      stateCode: code,
      stateName: selected ? selected.name : '',
      cityName: '',
    });
  };

  const handleCityChange = (cityName: string) => {
    onChange?.({
      ...value,
      cityName,
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showStreetAddress && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Street Address {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={value.line1 || ''}
              onChange={(e) => onChange?.({ ...value, line1: e.target.value })}
              disabled={disabled}
              placeholder="e.g. 123 Financial Way, Suite 400"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>
          <div>
            <input
              type="text"
              value={value.line2 || ''}
              onChange={(e) => onChange?.({ ...value, line2: e.target.value })}
              disabled={disabled}
              placeholder="Address Line 2 (Optional)"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Country */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Country {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value.countryCode || ''}
            onChange={(e) => handleCountryChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          >
            <option value="">Select Country</option>
            {allCountries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* State/Region */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
          {availableStates.length > 0 ? (
            <select
              value={value.stateCode || ''}
              onChange={(e) => handleStateChange(e.target.value)}
              disabled={disabled || !value.countryCode}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="">Select State / Province</option>
              {availableStates.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value.stateName || ''}
              onChange={(e) => onChange?.({ ...value, stateName: e.target.value })}
              disabled={disabled || !value.countryCode}
              placeholder="State / Region"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
          {availableCities.length > 0 ? (
            <select
              value={value.cityName || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={disabled || !value.countryCode}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="">Select City</option>
              {availableCities.map((ct) => (
                <option key={ct.name} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value.cityName || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={disabled || !value.countryCode}
              placeholder="City Name"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          )}
        </div>
      </div>

      {showStreetAddress && (
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Postal / ZIP Code</label>
          <input
            type="text"
            value={value.postalCode || ''}
            onChange={(e) => onChange?.({ ...value, postalCode: e.target.value })}
            disabled={disabled}
            placeholder="e.g. 10001"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          />
        </div>
      )}
    </div>
  );
};

export default LocationSelect;

