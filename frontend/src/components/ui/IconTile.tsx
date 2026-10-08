import React from 'react';
import { cn } from '../../lib/utils';

export interface IconTileProps {
  icon: React.ReactNode;
  color?: 'blue' | 'orange' | 'green' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IconTile: React.FC<IconTileProps> = ({
  icon,
  color = 'blue',
  size = 'md',
  className,
}) => {
  const colorStyles = {
    blue: 'bg-blue text-white shadow-sm',
    orange: 'bg-orange text-white shadow-sm',
    green: 'bg-green text-white shadow-sm',
    navy: 'bg-navy text-white shadow-sm',
  }[color];

  const sizeStyles = {
    sm: 'w-8 h-8 rounded-lg [&>svg]:w-4 [&>svg]:h-4',
    md: 'w-10 h-10 rounded-xl [&>svg]:w-5 [&>svg]:h-5', // 40px rounded square
    lg: 'w-12 h-12 rounded-2xl [&>svg]:w-6 [&>svg]:h-6',
  }[size];

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
        colorStyles,
        sizeStyles,
        className
      )}
    >
      {icon}
    </div>
  );
};
