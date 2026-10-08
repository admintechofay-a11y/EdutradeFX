import React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'main' | 'section';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const maxWidthMap = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  as: Component = 'div',
  maxWidth = '7xl',
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
        maxWidthMap[maxWidth] || 'max-w-7xl',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
