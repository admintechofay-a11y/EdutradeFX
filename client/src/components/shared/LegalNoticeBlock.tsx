import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LegalNoticeBlockProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function LegalNoticeBlock({
  title,
  children,
  className,
}: LegalNoticeBlockProps) {
  return (
    <div
      className={cn(
        'bg-[#FFFBEB] border-l-4 border-warning rounded-md p-4 flex items-start gap-3 text-left',
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && (
          <strong className="block font-sans text-[13px] font-bold text-text-primary">
            {title}
          </strong>
        )}
        <div className="font-sans text-[13px] text-text-primary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
