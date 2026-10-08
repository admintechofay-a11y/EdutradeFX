import React from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'navy' | 'ghost' | 'outline-white';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  withArrow?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      href,
      withArrow = false,
      isLoading = false,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const sizeStyles = {
      sm: 'px-4 py-2 text-xs gap-1.5 min-h-[36px]',
      md: 'px-6 py-3 text-sm gap-2 min-h-[46px]',
      lg: 'px-8 py-4 text-base gap-2.5 min-h-[54px]',
    };

    const variantStyles = {
      // Primary: Orange pill with vibrant hover and soft shadow
      primary:
        'bg-orange text-white hover:bg-orange-hover shadow-soft hover:shadow-lift border border-transparent',
      // Secondary: White pill with blue outline
      secondary:
        'bg-white text-blue border-2 border-blue hover:bg-blue-50 shadow-sm',
      // Navy: Institutional deep navy for contrast
      navy:
        'bg-navy text-white hover:bg-navy-deep shadow-soft border border-transparent',
      // Ghost: Subtly tinted hover
      ghost:
        'bg-transparent text-text-body hover:text-text-heading hover:bg-surface-tint',
      // Outline white (for dark sections like Hero / CTA banner)
      'outline-white':
        'bg-white/10 text-white border-2 border-white hover:bg-white hover:text-navy backdrop-blur-sm',
    };

    const content = (
      <>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && icon && <span>{icon}</span>}
        <span>{children}</span>
        {withArrow && !isLoading && (
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          className={cn(
            baseStyles,
            sizeStyles[size],
            variantStyles[variant],
            'group',
            className
          )}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          'group',
          className
        )}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
