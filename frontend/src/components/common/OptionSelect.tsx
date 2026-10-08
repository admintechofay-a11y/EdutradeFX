'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { BrokerOptionGroup } from '@/types';
import { useBrokerOptions, OptionItem } from '@/lib/useBrokerOptions';
import { Check, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface OptionSelectProps {
  id?: string;
  name?: string;
  group: BrokerOptionGroup;
  mode?: 'single' | 'multiple';
  value?: string | string[];
  onChange?: (val: any) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  allowOther?: boolean;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  otherPlaceholder?: string;
  className?: string;
}

export const OptionSelect: React.FC<OptionSelectProps> = ({
  id,
  name,
  group,
  mode = 'single',
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  helperText,
  errorText,
  disabled = false,
  required = false,
  allowOther = true,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Please specify custom details...',
  className,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listboxId = `${inputId}-listbox`;

  const { data: options = [], isLoading, isError } = useBrokerOptions(group);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Normalize selected values as an array
  const selectedCodes = React.useMemo(() => {
    if (mode === 'multiple') {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return typeof value === 'string' && value ? [value] : [];
  }, [value, mode]);

  // Filtered options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.code.toLowerCase().includes(q)
    );
  }, [options, search]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectOption = (opt: OptionItem) => {
    if (mode === 'multiple') {
      const exists = selectedCodes.includes(opt.code);
      const next = exists
        ? selectedCodes.filter((c) => c !== opt.code)
        : [...selectedCodes, opt.code];
      onChange?.(next);
    } else {
      onChange?.(opt.code);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemoveChip = (codeToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const next = selectedCodes.filter((c) => c !== codeToRemove);
    onChange?.(next);
  };

  const hasOtherSelected = selectedCodes.includes('OTHER');

  // Find labels for selected codes
  const selectedOptionLabels = selectedCodes.map((code) => {
    const found = options.find((o) => o.code === code);
    return { code, label: found ? found.label : code };
  });

  return (
    <div className={cn('w-full flex flex-col space-y-1.5', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {mode === 'multiple' && selectedCodes.length > 0 && (
            <span className="text-xs text-slate-500 font-normal">
              {selectedCodes.length} selected
            </span>
          )}
        </label>
      )}

      {/* Main trigger container */}
      <div className="relative">
        <button
          type="button"
          id={inputId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full min-h-[42px] px-3 py-2 text-left text-sm rounded-lg border transition-all duration-150',
            'bg-white dark:bg-slate-900 flex items-center justify-between gap-2 shadow-sm',
            disabled && 'bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed opacity-60',
            errorText
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : isOpen
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          )}
        >
          {/* Selected chips or placeholder */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 overflow-hidden">
            {isLoading ? (
              <span className="text-slate-400 flex items-center gap-1.5 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading options...
              </span>
            ) : selectedCodes.length === 0 ? (
              <span className="text-slate-400 select-none">{placeholder}</span>
            ) : mode === 'multiple' ? (
              selectedOptionLabels.map((item) => (
                <span
                  key={item.code}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 max-w-[200px] truncate"
                >
                  <span className="truncate">{item.label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveChip(item.code, e)}
                      className="hover:text-amber-700 dark:hover:text-amber-100 p-0.5 rounded"
                      aria-label={`Remove ${item.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-slate-900 dark:text-slate-100 font-medium truncate">
                {selectedOptionLabels[0]?.label || selectedCodes[0]}
              </span>
            )}
          </div>

          {/* Right indicator icons */}
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            {mode === 'single' && selectedCodes.length > 0 && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.('');
                }}
                className="hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800',
              'bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100'
            )}
          >
            {/* Search filter input */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Search ${options.length} ${group.toLowerCase().replace('_', ' ')}s...`}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Options list */}
            <ul
              id={listboxId}
              role="listbox"
              ref={listboxRef}
              className="max-h-60 overflow-y-auto p-1 text-sm focus:outline-none divide-y divide-slate-50 dark:divide-slate-800/40"
            >
              {filteredOptions.length === 0 ? (
                <li className="p-4 text-center text-xs text-slate-400">
                  No matching options found.
                </li>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = selectedCodes.includes(opt.code);
                  const isHighlighted = highlightedIndex === index;

                  return (
                    <li
                      key={opt.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectOption(opt)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'px-3 py-2 rounded-md cursor-pointer flex items-center justify-between text-xs transition-colors',
                        isSelected
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-medium'
                          : 'text-slate-700 dark:text-slate-300',
                        isHighlighted && !isSelected && 'bg-slate-100 dark:bg-slate-800/60'
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="truncate">{opt.label}</span>
                        {opt.code !== opt.label && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {opt.code}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Free-text input when "OTHER" is selected */}
      {allowOther && hasOtherSelected && (
        <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange?.(e.target.value)}
            disabled={disabled}
            placeholder={otherPlaceholder}
            className={cn(
              'w-full px-3 py-1.5 text-xs rounded-md border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
              'border-amber-300 dark:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-500',
              disabled && 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-60'
            )}
          />
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
            Please provide specific details for &ldquo;Other&rdquo;.
          </p>
        </div>
      )}

      {/* Helper text or Error text */}
      {errorText ? (
        <p className="text-xs text-red-500 font-medium">{errorText}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
