import React from 'react';
import { cn } from '../../lib/utils';

export interface StatItem {
  value: string;
  label: string;
  color?: 'blue' | 'orange' | 'green';
  suffix?: string;
  prefix?: string;
}

export interface StatBarProps {
  stats?: StatItem[];
  className?: string;
  isDark?: boolean;
}

export const StatBar: React.FC<StatBarProps> = ({
  stats = [
    { value: '120k+', label: 'Active Global Traders', color: 'blue' },
    { value: '98.4%', label: 'Verified Execution Rate', color: 'green' },
    { value: '250+', label: 'Audited Forex Brokers', color: 'orange' },
  ],
  className,
  isDark = true,
}) => {
  const colorMap = {
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    green: 'text-emerald-400',
  };

  const lightColorMap = {
    blue: 'text-blue',
    orange: 'text-orange',
    green: 'text-green',
  };

  return (
    <div
      className={cn(
        'w-full rounded-2xl p-4 sm:p-6 transition-all duration-300',
        isDark
          ? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lift text-white'
          : 'bg-white border border-border shadow-soft text-text-heading',
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={cn(
              'flex flex-col items-center sm:items-start text-center sm:text-left',
              idx > 0 && 'pt-4 sm:pt-0 sm:pl-6'
            )}
          >
            <div
              className={cn(
                'text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight',
                isDark ? colorMap[stat.color || 'blue'] : lightColorMap[stat.color || 'blue']
              )}
            >
              {stat.prefix}
              {stat.value}
              {stat.suffix}
            </div>
            <div
              className={cn(
                'mt-1 text-xs sm:text-sm font-medium',
                isDark ? 'text-slate-200' : 'text-text-muted'
              )}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
