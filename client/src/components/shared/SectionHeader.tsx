'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: 'gold' | 'verified' | 'warning' | 'danger';
  title: string | React.ReactNode;
  highlightText?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  zone?: 'light' | 'dark';
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeVariant = 'gold',
  title,
  highlightText,
  subtitle,
  align = 'left',
  zone = 'light',
  action,
  className,
}: SectionHeaderProps) {
  const badgeClasses = {
    gold: 'bg-gold-primary/10 border-gold-primary/30 text-gold-primary',
    verified: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    danger: 'bg-danger/10 border-danger/30 text-danger',
  };

  const isDark = zone === 'dark';

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        action && 'md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className={cn('flex flex-col gap-2', align === 'center' && 'items-center')}>
        {badge && (
          <span
            className={cn(
              'inline-flex items-center rounded-sm border px-2.5 py-0.5 text-micro uppercase tracking-wider font-semibold',
              badgeClasses[badgeVariant]
            )}
          >
            {badge}
          </span>
        )}

        <h2
          className={cn(
            'text-h2 font-serif font-normal tracking-tight',
            isDark ? 'text-text-on-dark' : 'text-text-primary'
          )}
        >
          {title}{' '}
          {highlightText && (
            <span className="text-gold-primary">{highlightText}</span>
          )}
        </h2>

        {subtitle && (
          <p
            className={cn(
              'text-body leading-relaxed max-w-[68ch]',
              isDark ? 'text-text-muted-dark' : 'text-text-secondary'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="mt-2 md:mt-0 flex-shrink-0">{action}</div>}
    </div>
  );
}

