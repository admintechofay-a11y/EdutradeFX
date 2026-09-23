'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  variant?: 'light' | 'hero';
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, variant = 'light', placeholder = 'Search...', ...props }, ref) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className="relative w-full">
        {/* Left: search icon 18px --color-text-secondary */}
        <Search className="w-[18px] h-[18px] text-text-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex h-[48px] w-full rounded-md border-[1.5px] border-[#D1D5DB] pl-[44px] pr-[44px] font-sans text-[15px] text-text-primary placeholder:text-text-secondary transition-all outline-none',
            variant === 'hero' ? 'bg-off-white' : 'bg-white',
            // Focus state: border-color: --color-gold-primary, box-shadow: 0 0 0 3px rgba(201,168,76,0.15)
            'focus:border-gold-primary focus:[box-shadow:0_0_0_3px_rgba(201,168,76,0.15)]',
            className
          )}
          {...props}
        />

        {/* Right: clear (×) button when value present */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-slate-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
