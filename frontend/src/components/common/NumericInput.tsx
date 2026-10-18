'use client';

import React from 'react';

export interface NumericInputProps {
  value: number | string | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number | string;
  allowDecimal?: boolean;
  allowDecimals?: boolean;
  maxDecimals?: number;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  id?: string;
  name?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 'any',
  allowDecimal = true,
  allowDecimals,
  maxDecimals = 2,
  placeholder = '0.00',
  prefix,
  suffix,
  disabled = false,
  required = false,
  label,
  id,
  name,
  error,
  helperText,
  className = '',
}) => {
  // Convert current value to display string
  const displayValue = value === null || value === undefined || isNaN(Number(value)) ? '' : String(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    const isDecimalAllowed = allowDecimals !== undefined ? allowDecimals : allowDecimal;

    // Filter out non-numeric and invalid characters (disallow negatives, 'e', '+', etc.)
    if (isDecimalAllowed) {
      // Keep only digits and decimal point
      input = input.replace(/[^0-9.]/g, '');
      // Allow only one decimal point
      const parts = input.split('.');
      if (parts.length > 2) {
        input = `${parts[0]}.${parts.slice(1).join('')}`;
      }
      // Enforce max decimal places if present
      if (parts.length === 2 && maxDecimals !== undefined) {
        input = `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
      }
    } else {
      input = input.replace(/\D/g, '');
    }

    if (input === '' || input === '.') {
      onChange(null);
      return;
    }

    const num = parseFloat(input);
    if (!isNaN(num)) {
      if (max !== undefined && num > max) {
        onChange(max);
        return;
      }
      if (min !== undefined && num < min) {
        onChange(min);
        return;
      }
      onChange(num);
    } else {
      onChange(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent typing exponent 'e', minus '-', plus '+'
    if (['e', 'E', '-', '+'].includes(e.key)) {
      e.preventDefault();
    }
    // Prevent typing multiple dots
    if (e.key === '.' && (!allowDecimal || displayValue.includes('.'))) {
      e.preventDefault();
    }
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id || name} className="block text-xs font-bold text-navy">
          {label} {required && <span className="text-orange">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center w-full rounded-xl border bg-white shadow-sm transition focus-within:border-blue focus-within:ring-1 focus-within:ring-blue ${
          error ? 'border-orange ring-1 ring-orange' : 'border-border'
        }`}
      >
        {prefix && (
          <span className="pl-3.5 pr-1 text-xs font-bold text-text-muted select-none">
            {prefix}
          </span>
        )}

        <input
          type="text"
          inputMode="decimal"
          id={id || name}
          name={name}
          disabled={disabled}
          required={required}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full py-2.5 text-xs sm:text-sm text-text-heading placeholder:text-text-muted bg-transparent focus:outline-none min-h-[42px] ${
            prefix ? 'pl-1.5' : 'pl-3.5'
          } ${suffix ? 'pr-1.5' : 'pr-3.5'}`}
        />

        {suffix && (
          <span className="pr-3.5 pl-1 text-xs font-bold text-text-muted select-none">
            {suffix}
          </span>
        )}
      </div>

      {error && <p className="text-[11px] font-medium text-orange mt-1">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-text-muted mt-1">{helperText}</p>}
    </div>
  );
};
