'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

interface TimezoneSelectProps {
  value?: string;
  onChange?: (tz: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'GMT/BST - London (Europe/London)' },
  { value: 'Europe/Berlin', label: 'CET/CEST - Frankfurt/Berlin (Europe/Berlin)' },
  { value: 'Europe/Cyprus', label: 'EET/EEST - Limassol/Nicosia (Europe/Cyprus)' },
  { value: 'America/New_York', label: 'EST/EDT - New York (America/New_York)' },
  { value: 'America/Chicago', label: 'CST/CDT - Chicago (America/Chicago)' },
  { value: 'America/Los_Angeles', label: 'PST/PDT - Los Angeles (America/Los_Angeles)' },
  { value: 'Asia/Dubai', label: 'GST - Dubai (Asia/Dubai)' },
  { value: 'Asia/Singapore', label: 'SGT - Singapore (Asia/Singapore)' },
  { value: 'Asia/Hong_Kong', label: 'HKT - Hong Kong (Asia/Hong_Kong)' },
  { value: 'Asia/Tokyo', label: 'JST - Tokyo (Asia/Tokyo)' },
  { value: 'Asia/Kolkata', label: 'IST - Mumbai/Delhi (Asia/Kolkata)' },
  { value: 'Australia/Sydney', label: 'AEST/AEDT - Sydney (Australia/Sydney)' },
];

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value = 'UTC',
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
      >
        <option value="">Select Timezone</option>
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimezoneSelect;
