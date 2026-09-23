import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center border font-sans text-[11px] font-semibold px-[10px] py-[3px] rounded-full transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        // Verified / Active: bg #ECFDF5, text #065F46, border #6EE7B7
        verified: 'bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]',
        active: 'bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]',
        green: 'bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]',
        default: 'bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]',

        // Unverified / Warning: bg #FFFBEB, text #92400E, border #FCD34D
        warning: 'bg-[#FFFBEB] text-[#92400E] border-[#FCD34D]',
        unverified: 'bg-[#FFFBEB] text-[#92400E] border-[#FCD34D]',

        // Pending: bg #EFF6FF, text #1E40AF, border #93C5FD
        pending: 'bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]',

        // Resolved: bg #F0FDF4, text #166534, border #86EFAC
        resolved: 'bg-[#F0FDF4] text-[#166534] border-[#86EFAC]',

        // Closed: bg #F3F4F6, text #6B7280, border #D1D5DB
        closed: 'bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]',

        // Rejected / Danger: bg #FEF2F2, text #991B1B, border #FCA5A5
        danger: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]',
        rejected: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]',
        destructive: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]',

        // Gold & Utility Badges
        gold: 'bg-gold-primary/10 text-gold-muted border-gold-primary/30',
        secondary: 'bg-slate-100 text-text-secondary border-slate-200',
        outline: 'border-slate-200 text-text-secondary bg-transparent',
        regulation: 'bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7] uppercase tracking-wider text-[11px] font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
