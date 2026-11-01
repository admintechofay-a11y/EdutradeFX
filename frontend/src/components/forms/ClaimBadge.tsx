'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ClaimBadgeProps {
  isVerified?: boolean;
  claimType?: 'DECLARED' | 'VERIFIABLE';
  className?: string;
  size?: 'sm' | 'md';
}

export const ClaimBadge: React.FC<ClaimBadgeProps> = ({
  isVerified = false,
  claimType = 'DECLARED',
  className = '',
  size = 'sm',
}) => {
  const isSm = size === 'sm';

  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md ${
          isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        } ${className}`}
        title="Verified by EdutradeFX compliance audit"
      >
        <ShieldCheck className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Verified</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50/80 border border-amber-200/80 rounded-md ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      } ${className}`}
      title="This metric or claim was self-reported by the provider and has not been verified by EdutradeFX."
    >
      <Info className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>Provider-declared. Not verified by EdutradeFX.</span>
    </span>
  );
};

export default ClaimBadge;
