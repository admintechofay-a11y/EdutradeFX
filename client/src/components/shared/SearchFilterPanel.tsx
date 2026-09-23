'use client';

import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}

interface SearchFilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onFilterChange?: (filterId: string, value: string) => void;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (filterId: string) => void;
  onResetAll?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export default function SearchFilterPanel({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search by name, regulation, strategy...',
  filters = [],
  onFilterChange,
  activeFilters = [],
  onRemoveFilter,
  onResetAll,
  children,
  className,
}: SearchFilterPanelProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm',
        className
      )}
    >
      {/* Search Bar & Filter Toggle Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 pr-9 h-11 bg-primary/80 border-border text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(filters.length > 0 || children) && (
            <Button
              variant="outline"
              size="default"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                'flex-1 sm:flex-initial gap-2 h-11 border-border',
                filtersOpen && 'border-accent-gold/50 text-accent-gold'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="ml-1 rounded-full bg-accent-gold px-1.5 py-0.2 text-[10px] font-bold text-primary">
                  {activeFilters.length}
                </span>
              )}
            </Button>
          )}

          {activeFilters.length > 0 && onResetAll && (
            <Button
              variant="ghost"
              size="default"
              onClick={onResetAll}
              className="gap-1.5 h-11 text-xs text-text-muted hover:text-rose-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Filter Grid */}
      {filtersOpen && (
        <div className="pt-2 border-t border-border/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filters.map((filter) => (
              <div key={filter.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                  className="h-10 rounded-lg border border-border bg-primary/80 px-3 text-xs text-text-primary focus:border-accent-gold focus:outline-none"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {children && <div className="mt-3">{children}</div>}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-text-muted">Active:</span>
          {activeFilters.map((f) => (
            <Badge
              key={f.id}
              variant="secondary"
              className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs bg-secondary border-border text-text-primary"
            >
              <span className="text-text-muted">{f.label}:</span> {f.value}
              <button
                onClick={() => onRemoveFilter?.(f.id)}
                className="hover:text-rose-400 p-0.5 rounded-full focus:outline-none"
                aria-label={`Remove filter ${f.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
