import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'gold' | 'success' | 'danger' | 'warning' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variantStyles = {
    primary: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
    gold: 'bg-amber-900/40 text-amber-400 border-amber-600/50',
    success: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
    danger: 'bg-rose-900/40 text-rose-400 border-rose-700/50',
    warning: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
    neutral: 'bg-gray-800/80 text-gray-300 border-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
