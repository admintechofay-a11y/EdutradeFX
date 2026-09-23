'use client';

import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string; // Label: Inter 14px --color-text-secondary
  value: string | number; // Number: DM Serif Display 36px --color-text-primary
  subtitle?: string; // e.g. "↑ 8 added this week"
  icon?: LucideIcon;
  accentColor?: string; // e.g. '#C9A84C', '#0D9488', '#2563EB', '#DC2626'
  trend?: {
    value: string | number; // e.g. '+12%'
    isPositive?: boolean; // green #0D9488 for positive, red for negative
  };
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#C9A84C',
  trend,
  change,
  className,
}: StatCardProps) {
  // Normalize trend
  const isPositive = trend
    ? trend.isPositive ?? String(trend.value).startsWith('+')
    : change
    ? change.trend === 'up'
    : true;

  const trendValue = trend?.value ?? change?.value;
  const detailText = subtitle || change?.label;

  return (
    <div
      className={cn(
        'w-full bg-white rounded-md shadow-card p-[24px] flex flex-col justify-between text-left transition-all border border-[#E2E8F0]',
        className
      )}
      style={{
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      {/* Top row: [Icon 40×40]    [Trend +12%] */}
      <div className="flex items-center justify-between">
        {Icon ? (
          <div
            className="w-[40px] h-[40px] rounded-md flex items-center justify-center shrink-0 [&_svg]:w-[20px] [&_svg]:h-[20px]"
            style={{
              backgroundColor: `${accentColor}18`, // tinted version of accent
              color: accentColor,
            }}
          >
            <Icon className="w-[20px] h-[20px]" />
          </div>
        ) : (
          <div className="w-[40px] h-[40px]" />
        )}

        {trendValue !== undefined && (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-sans text-[12px] font-semibold px-2 py-0.5 rounded-full',
              isPositive
                ? 'text-[#0D9488] bg-[#0D9488]/10'
                : 'text-danger bg-danger/10'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      {/* Middle & Bottom: Number, Label, Detail */}
      <div className="mt-4">
        {/* Number: DM Serif Display 36px --color-text-primary */}
        <div className="font-serif text-[36px] font-normal leading-none text-text-primary">
          {value}
        </div>

        {/* Label: Inter 14px --color-text-secondary */}
        <div className="font-sans text-[14px] text-text-secondary mt-1.5 font-medium">
          {title}
        </div>

        {/* Detail text: e.g. "↑ 8 added this week" */}
        {detailText && (
          <div className="font-sans text-[12px] text-text-secondary mt-1">
            {detailText}
          </div>
        )}
      </div>
    </div>
  );
}
