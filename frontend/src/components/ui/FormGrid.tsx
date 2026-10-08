import React from 'react';
import { cn } from '@/lib/utils';

export interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

const colMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export const FormGrid: React.FC<FormGridProps> = ({
  cols = 2,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('grid gap-4 sm:gap-6', colMap[cols] || colMap[2], className)}
      {...props}
    >
      {children}
    </div>
  );
};
