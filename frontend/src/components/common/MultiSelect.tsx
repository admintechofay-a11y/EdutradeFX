'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search, X, CheckSquare, Square } from 'lucide-react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[] | string[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  searchable?: boolean;
  maxSelected?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options: rawOptions,
  value = [],
  onChange,
  label,
  placeholder = 'Select options...',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  searchable = true,
  maxSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMediaQuery('(max-width: 639px)');
  useBodyScrollLock(isOpen && isMobile);

  // Normalize options to object format
  const normalizedOptions: MultiSelectOption[] = useMemo(() => {
    return rawOptions.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [rawOptions]);

  // Click outside to close (desktop)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isMobile && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [normalizedOptions, search]);

  const toggleOption = (optVal: string) => {
    if (value.includes(optVal)) {
      onChange(value.filter((v) => v !== optVal));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, optVal]);
    }
  };

  const removeChip = (optVal: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optVal));
  };

  const selectAll = () => {
    const allFilteredVals = filteredOptions.map((o) => o.value);
    const combined = Array.from(new Set([...value, ...allFilteredVals]));
    onChange(maxSelected ? combined.slice(0, maxSelected) : combined);
  };

  const clearAll = () => {
    if (search) {
      const filteredSet = new Set(filteredOptions.map((o) => o.value));
      onChange(value.filter((v) => !filteredSet.has(v)));
    } else {
      onChange([]);
    }
  };

  const selectedOptions = useMemo(() => {
    return value.map((val) => {
      const found = normalizedOptions.find((o) => o.value === val);
      return found || { value: val, label: val };
    });
  }, [value, normalizedOptions]);

  const renderDropdownContent = () => (
    <div className="flex flex-col h-full max-h-80 sm:max-h-96">
      {/* Search Header */}
      {searchable && (
        <div className="p-2.5 border-b border-border bg-surface-tint/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search options..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-border rounded-lg text-text-heading placeholder:text-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[11px]">
            <button
              type="button"
              onClick={selectAll}
              className="text-blue hover:text-blue/80 font-semibold inline-flex items-center gap-1"
            >
              <CheckSquare className="w-3 h-3" />
              <span>Select all ({filteredOptions.length})</span>
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-text-muted hover:text-orange font-semibold inline-flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              <span>Clear selection</span>
            </button>
          </div>
        </div>
      )}

      {/* Options List */}
      <div className="overflow-y-auto divide-y divide-border/40 flex-1 p-1">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt) => {
            const isSelected = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleOption(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition ${
                  isSelected
                    ? 'bg-blue/10 text-blue font-bold'
                    : 'hover:bg-surface-tint text-text-heading'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? 'bg-blue border-blue text-white'
                        : 'border-border bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="truncate">
                    <div className="truncate text-xs">{opt.label}</div>
                    {opt.description && (
                      <div className="text-[10px] text-text-muted truncate font-normal">
                        {opt.description}
                      </div>
                    )}
                  </div>
                </div>

                {opt.group && (
                  <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-surface-tint shrink-0">
                    {opt.group}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="py-8 text-center text-text-muted text-xs">
            No matching options found
          </div>
        )}
      </div>

      {/* Mobile Done footer button */}
      {isMobile && (
        <div className="p-3 border-t border-border bg-surface-tint/60 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 bg-navy text-white text-xs font-bold rounded-xl shadow-soft"
          >
            Done ({value.length} selected)
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-1.5 w-full ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-navy">
            {label} {required && <span className="text-orange">*</span>}
          </label>
          {maxSelected && (
            <span className="text-[10px] text-text-muted">
              Max {maxSelected}
            </span>
          )}
        </div>
      )}

      {/* Main Trigger */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border bg-white shadow-sm cursor-pointer transition flex items-center justify-between gap-2 ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-surface-tint'
            : 'hover:border-blue'
        } ${
          error
            ? 'border-orange ring-1 ring-orange'
            : isOpen
            ? 'border-blue ring-1 ring-blue'
            : 'border-border'
        }`}
      >
        {/* Selected Chips */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue/10 text-blue border border-blue/20"
              >
                <span className="truncate max-w-[150px]">{opt.label}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeChip(opt.value, e)}
                  className="hover:text-navy cursor-pointer ml-0.5 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))
          ) : (
            <span className="text-xs text-text-muted select-none">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-text-muted">
          {value.length > 0 && (
            <span className="text-[11px] font-bold text-navy px-1.5 py-0.5 rounded-full bg-surface-tint border border-border">
              {value.length}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue' : ''
            }`}
          />
        </div>
      </div>

      {/* Desktop Popover */}
      {isOpen && !isMobile && (
        <div className="relative">
          <div className="absolute left-0 top-1 w-full bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {renderDropdownContent()}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Modal */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 bg-border rounded-full" />
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-navy">{label || 'Select Options'}</h3>
                <p className="text-[10px] text-text-muted">{value.length} selected</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-text-muted hover:text-text-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderDropdownContent()}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-orange mt-1">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-text-muted mt-1">{helperText}</p>}
    </div>
  );
};
