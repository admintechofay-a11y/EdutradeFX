import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-[transform,background-color,border-color,box-shadow,color] duration-150 ease-out hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
  {
    variants: {
      variant: {
        // Primary Button: bg gold-primary, text navy-deepest, Inter 14px 700, 44px, 28px pad, radius-md, no shadow, no gradient
        primary:
          'bg-gold-primary text-navy-deepest font-sans text-[14px] font-bold rounded-md hover:bg-gold-light',
        default:
          'bg-gold-primary text-navy-deepest font-sans text-[14px] font-bold rounded-md hover:bg-gold-light',
        gold:
          'bg-gold-primary text-navy-deepest font-sans text-[14px] font-bold rounded-md hover:bg-gold-light',

        // Secondary Button: bg transparent, border 1.5px solid gold-primary, text gold-primary, Inter 14px 600, 44px, 28px pad
        secondary:
          'bg-transparent border-[1.5px] border-gold-primary text-gold-primary font-sans text-[14px] font-semibold rounded-md hover:bg-gold-primary/[0.08]',

        // Ghost Button (on dark): bg rgba(255,255,255,0.06), border 1px solid rgba(255,255,255,0.12), text text-on-dark, hover rgba(255,255,255,0.10)
        ghost:
          'bg-white/[0.06] border border-white/[0.12] text-text-on-dark font-sans text-[14px] font-medium rounded-md hover:bg-white/[0.10]',

        // Danger Button: bg danger, text white, same sizing as primary
        danger:
          'bg-danger text-white font-sans text-[14px] font-bold rounded-md hover:bg-red-700',
        destructive:
          'bg-danger text-white font-sans text-[14px] font-bold rounded-md hover:bg-red-700',

        // Outline
        outline:
          'border border-slate-200 bg-white hover:bg-slate-50 text-text-primary rounded-md',

        // Icon button variants
        iconDark:
          'w-[40px] h-[40px] p-0 rounded-md bg-navy-surface hover:bg-navy-mid text-text-on-dark [&_svg]:w-[20px] [&_svg]:h-[20px]',
        iconLight:
          'w-[40px] h-[40px] p-0 rounded-md bg-off-white hover:bg-slate-200 border border-slate-200 text-text-primary [&_svg]:w-[20px] [&_svg]:h-[20px]',

        link:
          'text-gold-primary underline-offset-4 hover:underline p-0 h-auto hover:translate-y-0 active:translate-y-0',
      },
      size: {
        default: 'h-[44px] px-[28px]',
        primary: 'h-[44px] px-[28px]',
        sm: 'h-[36px] px-[20px] text-[13px]',
        lg: 'h-[48px] px-[32px] text-[15px]',
        icon: 'w-[40px] h-[40px] p-0 [&_svg]:w-[20px] [&_svg]:h-[20px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
