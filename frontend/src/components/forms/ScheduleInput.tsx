'use client';

import React from 'react';
import TimezoneSelect from './TimezoneSelect';

export interface ScheduleValue {
  days?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  is24x7?: boolean;
}

interface ScheduleInputProps {
  value?: ScheduleValue;
  onChange?: (val: ScheduleValue) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const ScheduleInput: React.FC<ScheduleInputProps> = ({
  value = { days: 'Monday - Friday', startTime: '09:00', endTime: '18:00', timezone: 'UTC' },
  onChange,
  label = 'Operating Hours / Schedule',
  disabled = false,
  className = '',
}) => {
  const toggle24x7 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const is24x7 = e.target.checked;
    onChange?.({
      ...value,
      is24x7,
      days: is24x7 ? '24/7 (Continuous)' : value.days || 'Monday - Friday',
      startTime: is24x7 ? '00:00' : value.startTime || '09:00',
      endTime: is24x7 ? '23:59' : value.endTime || '18:00',
    });
  };

  return (
    <div className={`p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value.is24x7}
            onChange={toggle24x7}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span>24/7 Coverage</span>
        </label>
      </div>

      {!value.is24x7 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Active Days</label>
            <input
              type="text"
              value={value.days || ''}
              onChange={(e) => onChange?.({ ...value, days: e.target.value })}
              disabled={disabled}
              placeholder="e.g. Monday - Friday, 24/5"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              value={value.startTime || '09:00'}
              onChange={(e) => onChange?.({ ...value, startTime: e.target.value })}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
            <input
              type="time"
              value={value.endTime || '18:00'}
              onChange={(e) => onChange?.({ ...value, endTime: e.target.value })}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      )}

      <div>
        <TimezoneSelect
          value={value.timezone || 'UTC'}
          onChange={(tz) => onChange?.({ ...value, timezone: tz })}
          label="Timezone"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ScheduleInput;

