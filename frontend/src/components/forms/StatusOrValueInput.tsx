'use client';

import React from 'react';

export interface StatusOrValueData {
  mode: 'VALUE' | 'STATUS';
  value?: string | number;
  status?: string;
}

interface StatusOrValueInputProps {
  value?: StatusOrValueData;
  onChange?: (val: StatusOrValueData) => void;
  label?: string;
  unit?: string;
  statuses?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_STATUSES = ['Not disclosed', 'Custom Quote', 'Upon Request', 'Included in Base Plan'];

export const StatusOrValueInput: React.FC<StatusOrValueInputProps> = ({
  value = { mode: 'VALUE', value: '' },
  onChange,
  label,
  unit,
  statuses = DEFAULT_STATUSES,
  disabled = false,
  className = '',
}) => {
  const isStatus = value.mode === 'STATUS';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Toggle Mode */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-100 p-0.5 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => onChange?.({ mode: 'VALUE', value: value.value || '' })}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              !isStatus ? 'bg-white shadow-sm text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disclose Value
          </button>
          <button
            type="button"
            onClick={() => onChange?.({ mode: 'STATUS', status: statuses[0] })}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isStatus ? 'bg-white shadow-sm text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Select Status
          </button>
        </div>

        {/* Input */}
        <div className="flex-1">
          {isStatus ? (
            <select
              value={value.status || statuses[0]}
              onChange={(e) => onChange?.({ mode: 'STATUS', status: e.target.value })}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white focus-within:border-blue-500">
              <input
                type="text"
                value={value.value ?? ''}
                onChange={(e) => onChange?.({ mode: 'VALUE', value: e.target.value })}
                disabled={disabled}
                placeholder="Enter value..."
                className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none disabled:bg-slate-50"
              />
              {unit && (
                <span className="px-3 py-2 bg-slate-50 text-slate-500 text-xs font-semibold flex items-center border-l border-slate-200">
                  {unit}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusOrValueInput;
