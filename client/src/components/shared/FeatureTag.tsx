'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Star, Award, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeatureTagVariant =
  | 'verified'
  | 'regulation'
  | 'scam_alert'
  | 'gold'
  | 'green'
  | 'secondary'
  | 'outline';

interface FeatureTagProps {
  label: string;
  variant?: FeatureTagVariant;
  icon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FeatureTag({
  label,
  variant = 'secondary',
  icon = true,
  size = 'sm',
  className,
}: FeatureTagProps) {
  const variantStyles = {
    verified:
      'bg-accent-green/10 border-accent-green/30 text-accent-green',
    regulation:
      'bg-primary border-border text-slate-300 font-mono tracking-wider uppercase',
    scam_alert:
      'bg-rose-500/10 border-rose-500/30 text-rose-400',
    gold:
      'bg-accent-gold/10 border-accent-gold/30 text-accent-gold',
    green:
      'bg-accent-green/10 border-accent-green/30 text-accent-green',
    secondary:
      'bg-secondary border-border text-text-muted',
    outline:
      'bg-transparent border-border text-text-muted',
  };

  const icons = {
    verified: CheckCircle2,
    regulation: ShieldCheck,
    scam_alert: AlertTriangle,
    gold: Star,
    green: Zap,
    secondary: Award,
    outline: Award,
  };

  const IconComp = icons[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-semibold tracking-tight transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && IconComp && <IconComp className={iconSizes[size]} />}
      <span>{label}</span>
    </span>
  );
}
