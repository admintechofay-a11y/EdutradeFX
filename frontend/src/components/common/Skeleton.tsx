import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-800/70 border border-slate-700/30',
        className
      )}
    />
  );
};
