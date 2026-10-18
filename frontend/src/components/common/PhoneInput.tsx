'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  parsePhoneNumber,
  isValidPhoneNumber,
  CountryCode,
  AsYouType,
} from 'libphonenumber-js';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import {
  ALL_COUNTRIES,
  POPULAR_COUNTRIES,
  CountryInfo,
  findCountryByCallingCode,
  findCountryByCode,
} from '@/lib/countries';

export interface PhoneInputProps {
  value?: string; // E.164 formatted string (+919876543210)
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  label?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  defaultCountry?: CountryCode;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  error,
  required = false,
  label,
  name,
  id,
  placeholder = 'Enter phone number',
  disabled = false,
  className = '',
  helperText,
  defaultCountry = 'IN',
}) => {
  const initialCountry = useMemo(() => {
    if (value && value.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed?.country) {
          const found = findCountryByCode(parsed.country);
          if (found) return found;
        }
      } catch {
        // Fall through to prefix matching
        for (let len = 4; len >= 1; len--) {
          const prefix = value.slice(0, len + 1);
          const found = findCountryByCallingCode(prefix);
          if (found) return found;
        }
      }
    }
    return findCountryByCode(defaultCountry) || ALL_COUNTRIES[0];
  }, [defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(initialCountry);
  const [nationalNumber, setNationalNumber] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external E.164 `value` prop changes
  useEffect(() => {
    if (!value) {
      setNationalNumber('');
      return;
    }

    if (value.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          if (parsed.country) {
            const found = findCountryByCode(parsed.country);
            if (found && found.code !== selectedCountry.code) {
              setSelectedCountry(found);
            }
          }
          setNationalNumber(parsed.nationalNumber || '');
          return;
        }
      } catch {
        // Fallback: strip dial code if prefix matches
        if (value.startsWith(selectedCountry.dialCode)) {
          setNationalNumber(value.slice(selectedCountry.dialCode.length));
          return;
        }
      }
    }

    // Clean plain numbers without leading +
    const cleanDigits = value.replace(/\D/g, '');
    setNationalNumber(cleanDigits);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Filter countries for dropdown
  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery('');

    // Recompute E.164 with the new country code and current national digits
    const digitsOnly = nationalNumber.replace(/\D/g, '');
    if (!digitsOnly) {
      onChange('');
      return;
    }

    try {
      const parsed = parsePhoneNumber(digitsOnly, country.code);
      if (parsed) {
        onChange(parsed.number);
        return;
      }
    } catch {
      // Incomplete
    }
    onChange(`${country.dialCode}${digitsOnly}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const digitsOnly = rawInput.replace(/\D/g, '');
    setNationalNumber(digitsOnly);

    if (!digitsOnly) {
      onChange('');
      return;
    }

    // Format and emit E.164
    try {
      const parsed = parsePhoneNumber(digitsOnly, selectedCountry.code);
      if (parsed) {
        onChange(parsed.number);
        return;
      }
    } catch {
      // Incomplete or in-progress typing
    }

    onChange(`${selectedCountry.dialCode}${digitsOnly}`);
  };

  // Determine validation status
  const isComplete = nationalNumber.length > 4;
  const isValid = useMemo(() => {
    if (!value) return true;
    try {
      return isValidPhoneNumber(value, selectedCountry.code);
    } catch {
      return false;
    }
  }, [value, selectedCountry.code]);

  const showInlineError = Boolean(error || (isComplete && !isValid));
  const errorMessage = error || (isComplete && !isValid ? 'Please enter a valid phone number for this country.' : '');

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-bold text-navy"
        >
          {label} {required && <span className="text-orange">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full rounded-xl border border-border bg-white shadow-sm transition focus-within:border-blue focus-within:ring-1 focus-within:ring-blue">
        {/* Country Code Trigger */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-text-heading hover:bg-surface-tint rounded-l-xl border-r border-border focus:outline-none transition min-h-[42px]"
          >
            <span className="text-base leading-none select-none" aria-hidden="true">
              {selectedCountry.flag}
            </span>
            <span className="font-mono text-xs text-navy font-bold">{selectedCountry.dialCode}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-blue' : ''
              }`}
            />
          </button>

          {/* Country Selection Dropdown */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 max-h-80 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              {/* Search Bar */}
              <div className="p-2 border-b border-border bg-surface-tint/50">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-border rounded-lg text-text-heading placeholder:text-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List */}
              <div className="overflow-y-auto divide-y divide-border/40 max-h-64 text-xs">
                {!searchQuery && (
                  <div className="p-1 bg-surface-tint/30">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase text-text-muted tracking-wider">
                      Popular Jurisdictions
                    </div>
                    {POPULAR_COUNTRIES.map((country) => (
                      <button
                        key={`pop-${country.code}`}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                          selectedCountry.code === country.code
                            ? 'bg-blue/10 text-blue font-bold'
                            : 'hover:bg-surface-tint text-text-heading'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm select-none">{country.flag}</span>
                          <span className="truncate">{country.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-text-muted ml-2 shrink-0">
                          {country.dialCode}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-1">
                  {!searchQuery && (
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase text-text-muted tracking-wider">
                      All Countries
                    </div>
                  )}
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                          selectedCountry.code === country.code
                            ? 'bg-blue/10 text-blue font-bold'
                            : 'hover:bg-surface-tint text-text-heading'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm select-none">{country.flag}</span>
                          <span className="truncate">{country.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          <span className="font-mono text-[11px] text-text-muted">
                            {country.dialCode}
                          </span>
                          {selectedCountry.code === country.code && (
                            <Check className="w-3.5 h-3.5 text-blue" />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-text-muted text-xs">
                      No matching countries found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* National Number Input */}
        <input
          type="tel"
          id={id || name}
          name={name}
          disabled={disabled}
          required={required}
          value={nationalNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          autoComplete="tel-national"
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-text-heading placeholder:text-text-muted bg-transparent rounded-r-xl focus:outline-none min-h-[42px]"
        />

        {/* Valid Indicator */}
        {value && isValid && isComplete && (
          <div className="pr-3 text-green shrink-0 select-none">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {showInlineError && (
        <p className="text-[11px] font-medium text-orange mt-1">{errorMessage}</p>
      )}
      {!showInlineError && helperText && (
        <p className="text-[11px] text-text-muted mt-1">{helperText}</p>
      )}
    </div>
  );
};
