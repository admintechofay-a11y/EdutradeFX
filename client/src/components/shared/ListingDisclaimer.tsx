import React from 'react';
import { cn } from '@/lib/utils';

export default function ListingDisclaimer({ className }: { className?: string }) {
  return (
    <footer className={cn('py-6 text-center w-full', className)}>
      <p className="font-sans text-[11px] text-text-secondary max-w-[800px] mx-auto px-4 leading-relaxed">
        EduTradeFX does not provide financial advice. Information displayed is for research purposes only. Trading Forex involves significant risk of loss.
      </p>
    </footer>
  );
}
