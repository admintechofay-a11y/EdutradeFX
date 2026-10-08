import React from 'react';
import { cn } from '@/lib/utils';

export interface StickyActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Mobile: fixed bottom bar with safe area padding, shadow and backdrop blur
        'fixed bottom-0 left-0 right-0 z-30 p-4 pb-safe bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-border dark:border-slate-800 shadow-lg',
        // Desktop / Tablet: static normal block inside form container
        'sm:static sm:z-auto sm:p-0 sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:border-0 sm:shadow-none',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-end gap-3 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
};
